var NAMESPACE = "ATLECI__";

exports.sobject = "Account";

//BillingStreet, ATLECI__Data_Prima_Scadenza__c, ATLECI__Totale_Partite_Aperte__c, ATLECI__Email__c';
exports.data = {
	Id: "Id",
	Name: "Name",
	Billing_Street: "BillingStreet",
	Data_Prima_Scadenza: NAMESPACE + "Data_Prima_Scadenza__c",
	Totale_Partite_Aperte: NAMESPACE + "Totale_Partite_Aperte__c",
	Email: NAMESPACE + "Email__c",
	Billing_Street: "BillingStreet",
	Billing_City: "BillingCity",
	Billing_State: "BillingState",
	Billing_CAP: "BillingPostalCode",
	Billing_Country: "BillingCountry"
};
