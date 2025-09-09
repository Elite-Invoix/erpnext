# Copyright (c) 2025, Resilient Tech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import getdate, add_days
from frappe.query_builder.functions import Sum
from frappe.defaults import get_defaults


def execute(filters=None):
    columns, data = [], []
    data = get_data()
    columns = get_columns()
    return columns, data, [], get_chart_data(data)


def get_columns():
    return [
        {
            "label": "Customer",
            "fieldname": "customer",
            "fieldtype": "Link",
            "options": "Customer",
            "width": 150,
        },
        {
            "label": "Customer Name",
            "fieldname": "customer_name",
            "fieldtype": "Data",
            "width": 150,
        },
        {
            "label": "Sales Amount",
            "fieldname": "sales_amount",
            "fieldtype": "Currency",
            "options": "currency",
            "width": 150,
        },
    ]


def get_data():
    defaults = get_defaults()
    SALES_INVOICE = frappe.qb.DocType("Sales Invoice")
    # get top 20 customers by sales amount for last 12 months
    customers = frappe.get_list("Customer",pluck="name")
    if not customers:
        return []

    query = (
        frappe.qb.from_(SALES_INVOICE)
        .select(
            SALES_INVOICE.customer,
            SALES_INVOICE.customer_name,
            Sum(SALES_INVOICE.grand_total).as_("sales_amount"),
        )
        .where(
            (SALES_INVOICE.docstatus == 1)
            & (SALES_INVOICE.posting_date >= add_days(getdate(), -365))
            & (SALES_INVOICE.posting_date <= getdate())
        )
        .where(SALES_INVOICE.customer.isin(customers))
        .groupby(SALES_INVOICE.customer)
        .orderby(Sum(SALES_INVOICE.grand_total), order=frappe.qb.desc)
        .limit(10)
    )
    if defaults.company:
        query = query.where(SALES_INVOICE.company == defaults.company)

    return query.run(as_dict=True)


def get_chart_data(data):
    if not data:
        return []

    labels, datapoints = [], []

    for row in data:
        # labels.append(f"{row.customer} - {row.customer_name}")
        labels.append(row.customer_name)
        datapoints.append(row.sales_amount)

    return {
        "data": {
            "labels": labels,
            "datasets": [{"name": _("Total Sale Amount"), "values": datapoints}],
        },
        "type": "bar",
        "fieldtype": "Currency",
    }
