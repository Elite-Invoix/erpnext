frappe.listview_settings["Payment Entry"] = {
	onload: function (listview) {
		if (listview.page.fields_dict.party_type) {
			listview.page.fields_dict.party_type.get_query = function () {
				return {
					filters: {
						name: ["in", Object.keys(frappe.boot.party_account_types)],
					},
				};
			};
		}

		if(listview.view==="Report"){
			listview.page.set_title("Report: Receipt")
			$('[data-label="Add Receive Payment"]').hide()
		}
		else{
			$('[data-label="Add Receive Payment"]').show()
		}

	},
};
