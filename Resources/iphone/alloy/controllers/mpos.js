function Controller() {
    function callPos() {
        $.activityIndicator.setMessage("Connecting with mPOS");
        $.activityIndicator.show();
        var INGENICO_CLASS = "com.ingenico.pos";
        var ACTION_PAYMENT = INGENICO_CLASS + ".external.pay";
        var INGENICO_PAYMENT = 500;
        var intent = Ti.Android.createIntent({
            flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP,
            action: ACTION_PAYMENT
        });
        intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
        intent.putExtra(ACTION_PAYMENT + ".amount", "" + normalizeAmount(amount));
        intent.putExtra(ACTION_PAYMENT + ".function", INGENICO_PAYMENT);
        var curActivity = $.mpos.getActivity();
        curActivity.startActivityForResult(intent, function(e) {
            Ti.API.info("[PosPay] Result Intent");
            e.requestCode;
            Ti.API.info("[PosPay] Request Code: " + e.requestCode);
            e.resultCode;
            Ti.API.info("[PosPay] Result Code: " + e.resultCode);
            var data = e.intent;
            e.source;
            Ti.API.info("[PosPay] Result Data: " + e.source);
            if (data) {
                var timestamp = data.getStringExtra(ACTION_PAYMENT + ".timestamp");
                if (timestamp) {
                    alert("Transazione eseguita correttamente");
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
                    $.activityIndicator.setMessage("Saving data");
                    $.activityIndicator.show();
                    Ti.API.info("[table] selected rows: " + rowids);
                    for (var i = 0; rowids.length > i; i++) {
                        var sfdcDate = require("sfdcDate");
                        var sfdcNow = sfdcDate.createTodaySfdcDate();
                        Alloy.Globals.dynaforce.upsertObject({
                            sobject: sobject,
                            rowId: rowids[i],
                            data: {
                                ATLECI__Pagato__c: true,
                                ATLECI__Data_Pagamento__c: sfdcNow,
                                ATLECI__MPOS_Acquirer_ID__c: acquirer_id,
                                ATLECI__MPOS_Authorization_Number__c: authorization_number,
                                ATLECI__MPOS_CVM__c: cvm,
                                ATLECI__MPOS_Terminal_ID__c: termid,
                                ATLECI__MPOS_Operation_Number__c: opration_number,
                                ATLECI__MPOS_PAN__c: pan,
                                ATLECI__MPOS_STAN__c: stan,
                                ATLECI__MPOS_Transaction_Type__c: trans_type
                            },
                            error: function() {
                                alert("save data Error");
                            }
                        });
                    }
                    Ti.App.Properties.setString("mpos.payok", "true");
                    $.mpos.close();
                } else alert("Transazione Annullata");
            }
        });
    }
    function normalizeAmount(amount) {
        amount = "" + amount;
        amount.indexOf(",") >= 0 ? amount.replace(",", ".") : 0 > amount.indexOf(".") && (amount += ".00");
        Ti.API.info("[mpos] Normalized amount: " + amount);
        return amount;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "mpos";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.mpos = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        orientationModes: Alloy.Globals.orientations,
        id: "mpos"
    });
    $.__views.mpos && $.addTopLevelView($.__views.mpos);
    $.__views.__alloyId18 = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        layout: "vertical",
        id: "__alloyId18"
    });
    $.__views.mpos.add($.__views.__alloyId18);
    $.__views.amount = Ti.UI.createLabel({
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        color: "#0099CC",
        font: {
            fontSize: "25sp",
            fontWeight: "normal"
        },
        id: "amount"
    });
    $.__views.__alloyId18.add($.__views.amount);
    $.__views.__alloyId19 = Ti.UI.createButton({
        title: "Conferma",
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        top: "10",
        id: "__alloyId19"
    });
    $.__views.__alloyId18.add($.__views.__alloyId19);
    callPos ? $.__views.__alloyId19.addEventListener("click", callPos) : __defers["$.__views.__alloyId19!click!callPos"] = true;
    $.__views.activityIndicator = Ti.UI.createActivityIndicator({
        color: "#ffffff",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 16,
            fontWeight: "bold"
        },
        style: Alloy.Globals.style,
        top: 0,
        horizontalWrap: true,
        backgroundColor: "#0099CC",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        id: "activityIndicator"
    });
    $.__views.mpos.add($.__views.activityIndicator);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var amount = args["amount"];
    var rowids = args["rowids"];
    var sobject = "ATLECI__Partita_Aperta__c";
    $.amount.setText(amount + " EUR");
    $.mpos.open();
    $.mpos.addEventListener("focus", function() {
        $.activityIndicator.hide();
    });
    __defers["$.__views.__alloyId19!click!callPos"] && $.__views.__alloyId19.addEventListener("click", callPos);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;