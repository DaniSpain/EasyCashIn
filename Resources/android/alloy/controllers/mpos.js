function Controller() {
    function callPos() {
        $.activityIndicator.setMessage("Connecting with mPOS");
        $.activityIndicator.show();
        var INGENICO_PACKAGE = "com.ingenico.ingenico";
        var INGENICO_CLASS = "com.ingenico.pos";
        var INGENICO_EXTRAS = INGENICO_CLASS + ".external.pay";
        var INGENICO_PAYMENT = 500;
        var intent = Ti.Android.createIntent({
            packageName: INGENICO_PACKAGE,
            className: INGENICO_CLASS + ".PayActivity",
            flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP
        });
        intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
        intent.putExtra(INGENICO_EXTRAS + ".amount", "" + amount);
        intent.putExtra(INGENICO_EXTRAS + ".function", INGENICO_PAYMENT);
        Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
            Ti.API.info("[PosPay] Result Intent");
            e.requestCode;
            Ti.API.info("[PosPay] Request Code: " + e.requestCode);
            e.resultCode;
            Ti.API.info("[PosPay] Result Code: " + e.resultCode);
            e.intent;
            e.source;
            Ti.API.info("[PosPay] Result Data: " + e.source);
            $.activityIndicator.hide();
        });
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
        id: "mpos"
    });
    $.__views.mpos && $.addTopLevelView($.__views.mpos);
    $.__views.__alloyId10 = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        layout: "vertical",
        id: "__alloyId10"
    });
    $.__views.mpos.add($.__views.__alloyId10);
    $.__views.amount = Ti.UI.createLabel({
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        color: "#0099CC",
        font: {
            fontSize: "23sp",
            fontWeight: "normal"
        },
        id: "amount"
    });
    $.__views.__alloyId10.add($.__views.amount);
    $.__views.__alloyId11 = Ti.UI.createButton({
        title: "Conferma",
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        id: "__alloyId11"
    });
    $.__views.__alloyId10.add($.__views.__alloyId11);
    callPos ? $.__views.__alloyId11.addEventListener("click", callPos) : __defers["$.__views.__alloyId11!click!callPos"] = true;
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
    $.amount.setText(amount);
    $.mpos.open();
    $.mpos.addEventListener("focus", function() {
        $.activityIndicator.hide();
    });
    __defers["$.__views.__alloyId11!click!callPos"] && $.__views.__alloyId11.addEventListener("click", callPos);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;