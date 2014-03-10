var args = arguments[0] || {};


var amount = args['amount'];

$.amount.setText(amount);
$.mpos.open();

//TODO: check if the ingenico app exists
	//boolean bool = this.checkApp();//Do something...
	//Log.i(this.TAG, "IngenicoMobile POS Installed: " + bool);
	
	

function callPos() {
	
	$.activityIndicator.setMessage('Connecting with mPOS'); 
	$.activityIndicator.show();
	
	var INGENICO_PACKAGE = "com.ingenico.ingenico";
	var INGENICO_CLASS = "com.ingenico.pos";
	var INGENICO_EXTRAS = INGENICO_CLASS + ".external.pay";
	var INGENICO_PAYMENT = 500;
	
	//action: INGENICO_CLASS + ".external.pay",
	var intent = Ti.Android.createIntent({
		packageName: INGENICO_PACKAGE,
		className: INGENICO_CLASS + ".PayActivity",
	    flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP
	});
	//intent.addFlags(Ti.Android.FLAG_ACTIVITY_FORWARD_RESULT);
	intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
	//var amount = "11.50";
	intent.putExtra(INGENICO_EXTRAS + ".amount", "" + amount);
	intent.putExtra(INGENICO_EXTRAS + ".function", INGENICO_PAYMENT);
	//Ti.Android.currentActivity.startActivity(intent);
	
	
	Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
		Ti.API.info('[PosPay] Result Intent');
		// The request code used to start this Activity
	    var requestCode = e.requestCode;
	    Ti.API.info('[PosPay] Request Code: ' + e.requestCode);
	    // The result code returned from the activity 
	    // (http://developer.android.com/reference/android/app/Activity.html#StartingActivities)
	    var resultCode = e.resultCode;
	    Ti.API.info('[PosPay] Result Code: ' + e.resultCode);
	    // A Titanium.Android.Intent filled with data returned from the Activity
	    var intent = e.intent;
	    // The Activity the received the result
	    var source = e.source;
	    Ti.API.info('[PosPay] Result Data: ' + e.source);
	    $.activityIndicator.hide();
	});
}

$.mpos.addEventListener('focus', function() {
    $.activityIndicator.hide();
});

