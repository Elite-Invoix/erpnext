// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// render
frappe.listview_settings["Sales Invoice"] = {
	add_fields: [
		"customer",
		"customer_name",
		"base_grand_total",
		"outstanding_amount",
		"due_date",
		"company",
		"currency",
		"is_return",
		"custom_email",
		"custom_plan",
		"custom_end_date",
		"status",
		"custom_api_status",
		"custom_einvoice_status"
	],
	get_indicator: function (doc) {
		console.log(doc);
		const status_colors = {
			Draft: "grey",
			Unpaid: "orange",
			Paid: "green",
			Return: "gray",
			"Credit Note Issued": "gray",
			"Unpaid and Discounted": "orange",
			"Partly Paid and Discounted": "yellow",
			"Overdue and Discounted": "red",
			Overdue: "red",
			"Partly Paid": "yellow",
			"Internal Transfer": "darkgrey",
		};
		return [__(doc.status), status_colors[doc.status], "status,=," + doc.status];
	},
	right_column: "grand_total",

	onload: function (listview) {
		

		listview.page.add_action_item(__("Delivery Note"), () => {
			erpnext.bulk_transaction_processing.create(listview, "Sales Invoice", "Delivery Note");
		});

		listview.page.add_action_item(__("Payment"), () => {
			erpnext.bulk_transaction_processing.create(listview, "Sales Invoice", "Payment Entry");
		});

		if(listview.view==="Report"){
			$('[data-label="Add Sales Invoice"]').hide()
		}
		else{
			$('[data-label="Add Sales Invoice"]').show()
		}

		listview.filter_area.standard_filters_wrapper.find('[data-fieldname="title"]').remove();


		listview.page.add_actions_menu_item(__("LHDN Validation"), () => {
			const sales_invoices = listview.get_checked_items();
			if (sales_invoices.length === 0) {
				frappe.msgprint(__("Please select at least one Sales Invoice"));
				return;
			}
			
			const eligible_sales_invoices = [];
			sales_invoices.forEach(sales_invoice => {
				if (sales_invoice.status === "Paid" || sales_invoice.status === "Partly Paid" || sales_invoice.status === "Return" || sales_invoice.status === "Unpaid" || sales_invoice.status === "Draft") {
					eligible_sales_invoices.push(sales_invoice);
				}
			});
			if (eligible_sales_invoices.length === 0) {
				frappe.msgprint(__("Please select at least one Paid or Partly Paid Sales Invoice"));
				return;
			}

			const sales_invoice_names = eligible_sales_invoices.map(sales_invoice => sales_invoice.name);
			frappe.call({
				method: "frappe.data_api.data.bulk_send_invoice",
				args: { invoice_names:sales_invoice_names },
				freeze: true,
				freeze_message: __('<i class="fa fa-spinner fa-spin fa-4x"></i>'),
				callback: function (response) {
					frappe.msgprint("Invoice Sent for Validation. Please check after some time. Refresh the page to see the updated status.");
					listview.clear_checked_items();
				},
			});

		});
	},
};
