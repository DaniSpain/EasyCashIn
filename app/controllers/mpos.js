/**
 * @author Daniele Spagnuolo
 * @version
 */
var args = arguments[0] || {};


var amount = args['amount'];
var rowids = args['rowids'];

var sobject = "Partita_Aperta__c";

$.amount.setText(amount + ' EUR');
$.mpos.open();

//TODO: check if the ingenico app exists
	//boolean bool = this.checkApp();//Do something...
	//Log.i(this.TAG, "IngenicoMobile POS Installed: " + bool);
	
	

function callPos() {
	
	$.activityIndicator.setMessage('Connecting with mPOS'); 
	$.activityIndicator.show();
	
	var INGENICO_PACKAGE = "com.ingenico.ingenico";
	var INGENICO_CLASS = "com.ingenico.pos";
	var ACTION_PAYMENT = INGENICO_CLASS + ".external.pay";
	var ACTION_REVERSAL = INGENICO_CLASS + ".external.reversal";
	
	var INGENICO_PAYMENT = 500;
	var INGENICO_REVERSAL = 550;
	
	//action: INGENICO_CLASS + ".external.pay",
	var intent = Ti.Android.createIntent({
		//packageName: INGENICO_PACKAGE,
		//className: INGENICO_CLASS + ".PayActivity",
	    flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP,
	    action: ACTION_PAYMENT
	});
	//intent.addFlags(Ti.Android.FLAG_ACTIVITY_FORWARD_RESULT);
	//intent.addFlags(Ti.Android.FLAG_ACTIVITY_NEW_TASK);
	intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
	//var amount = "11.50";
	intent.putExtra(ACTION_PAYMENT + ".amount", "" + normalizeAmount(amount));
	intent.putExtra(ACTION_PAYMENT + ".function", INGENICO_PAYMENT);
	//Ti.Android.currentActivity.startActivity(intent);
	
	var curActivity = $.mpos.getActivity();
	curActivity.startActivityForResult(intent, function(e) {
		
		Ti.API.info('[PosPay] Result Intent');
		// The request code used to start this Activity
	    var requestCode = e.requestCode;
	    Ti.API.info('[PosPay] Request Code: ' + e.requestCode);
	    // The result code returned from the activity 
	    // (http://developer.android.com/reference/android/app/Activity.html#StartingActivities)
	    var resultCode = e.resultCode;
	    Ti.API.info('[PosPay] Result Code: ' + e.resultCode);
	    // A Titanium.Android.Intent filled with data returned from the Activity
	    var data = e.intent;
	    // The Activity the received the result
	    var source = e.source;
	    Ti.API.info('[PosPay] Result Data: ' + e.source);
	    
	    if (data) {	
		    var timestamp = data.getStringExtra(ACTION_PAYMENT + ".timestamp");
		    
		    if (timestamp) {
		    
			    alert('Transazione eseguita correttamente');
				var merchant_id = data.getStringExtra(ACTION_PAYMENT + ".merchant_id");
				var acquirer_id = data.getStringExtra(ACTION_PAYMENT + ".acquirer_id");
				var opration_number = data.getStringExtra(ACTION_PAYMENT + ".opration_number");
				var termid = data.getStringExtra(ACTION_PAYMENT + ".termid"); 
				var pan = data.getStringExtra(ACTION_PAYMENT + ".pan");
				var exp = data.getStringExtra(ACTION_PAYMENT + ".exp");
				var stan = data.getStringExtra(ACTION_PAYMENT + ".stan"); 
				var authorization_number = data.getStringExtra(ACTION_PAYMENT + ".authoritation_number");
				var trans_type = data.getStringExtra(ACTION_PAYMENT + ".trans_type");
				var amount = data.getStringExtra(ACTION_PAYMENT + ".amount"); 
				var cvm = data.getStringExtra(ACTION_PAYMENT + ".cvm"); 
				
				Ti.API.info("[mpos] timestamp: " + timestamp);
				Ti.API.info("[mpos] merchant_id: " + merchant_id);
				Ti.API.info("[mpos] acquirer_id: " + acquirer_id);
				Ti.API.info("[mpos] opration_number: " + opration_number); 
				Ti.API.info("[mpos] termid: " + termid);
				Ti.API.info("[mpos] pan: " + pan);
				Ti.API.info("[mpos] exp: " + exp);
				Ti.API.info("[mpos] stan: " + stan);
				Ti.API.info("[mpos] authoritation_number: " + authorization_number); 
				Ti.API.info("[mpos] trans_type: " + trans_type);
				Ti.API.info("[mpos] amount: " + amount);
				Ti.API.info("[mpos] cvm: " + cvm);
				
				$.activityIndicator.setMessage('Saving data');
				$.activityIndicator.show();
				Ti.API.info('[table] selected rows: ' + rowids);
				for (var i=0; i<rowids.length; i++) {
					Alloy.Globals.dynaforce.upsertObject({
						sobject: sobject,
						rowId: rowids[i],
						data: {
							'Pagato__c': true,
							'MPOS_Acquirer_ID__c': acquirer_id,
							'MPOS_Authorization_Number__c': authorization_number,
							'MPOS_CVM__c': cvm,
							'MPOS_Terminal_ID__c': termid,
							'MPOS_Operation_Number__c': opration_number,
							'MPOS_PAN__c': pan,
							'MPOS_STAN__c': stan,
							'MPOS_Transaction_Type__c': trans_type
						},
						error: function() {
							alert('save data Error');
						}
					});
				}
				
				/*
				 * we set the app property to true in order to say to the previous screen that a payment has been performed
				 * In the onFocus of the previous screen we will check this property and, if true, it will refresh the list and sync
				 */
				Ti.App.Properties.setString("mpos.payok","true");
				$.mpos.close();
			} else alert('Transazione Annullata');
		}
	    //$.activityIndicator.hide();
	});
}

function normalizeAmount(amount) {
	amount = '' + amount;
	if (amount.indexOf(',')>=0) {
		amount.replace(',','.');
	} else {
		if (amount.indexOf('.')<0) {
			//this menas that the amount is a integer
			amount += '.00';
		}
	}
	Ti.API.info('[mpos] Normalized amount: ' + amount);
	return amount;
}

$.mpos.addEventListener('focus', function() {
    $.activityIndicator.hide();
});

