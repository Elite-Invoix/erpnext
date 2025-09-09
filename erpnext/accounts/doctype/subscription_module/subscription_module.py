# Copyright (c) 2025, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SubscriptionModule(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		active: DF.Check
		max_invoices: DF.Int
		max_products: DF.Int
		max_quotations: DF.Int
		max_users: DF.Int
		plan_name: DF.Data
		plan_type: DF.Literal["Basic", "Standard"]
	# end: auto-generated types
	pass
