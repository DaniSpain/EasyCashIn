var args = arguments[0] || {};

var ACCOUNT = require("datamodel/account");
var accountId = args['accountId'];

var selectList = ACCOUNT.data.Id + ', ' + ACCOUNT.data.Name + ', ' + ACCOUNT.data.Billing_Street  + ', ' + ACCOUNT.data.Billing_City + 
	 ', ' + ACCOUNT.data.Billing_CAP + ', ' + ACCOUNT.data.Billing_Country + ', ' + ACCOUNT.data.Billing_State;

var queryString = "SELECT " + selectList +
	" FROM " + ACCOUNT.sobject + 
	" WHERE " + ACCOUNT.data.Id + " = '" + accountId + "' LIMIT 1";

Ti.API.info("[Easy Cash In] Query: " + queryString);

var db = Ti.Database.open(Alloy.Globals.dbName);
try {
	var rowset = db.execute(queryString);
} catch(e) {
	Ti.API.info("[Easy Cash In] Exception retrieving account: " + accountId + " - " + e);
}

var accName = "";
var billingAddress = "";

if (rowset) {
	while (rowset.isValidRow()) {
		accName = rowset.fieldByName(ACCOUNT.data.Name);
		billingAddress = rowset.fieldByName(ACCOUNT.data.Billing_Street) + ' ' + rowset.fieldByName(ACCOUNT.data.Billing_CAP) + ' ' + 
			rowset.fieldByName(ACCOUNT.data.Billing_City) + ' (' + rowset.fieldByName(ACCOUNT.data.Billing_State) + ') - ' +
			rowset.fieldByName(ACCOUNT.data.Billing_Country);
		var str = billingAddress.replace("null"," ");
		billingAddress = str;
		Ti.API.info(accName);
		Ti.API.info(billingAddress);
		rowset.next();
	}
	rowset.close();
}
db.close();

//$.headerTitle.setText(accName);

$.lblName.setText(accName);
$.lblBillingAddress.setText(billingAddress);

$.detail.open();

function closeWindow() {
	$.detail.close();
}

$.detail.addEventListener('close', function() {
    $.destroy();
});
