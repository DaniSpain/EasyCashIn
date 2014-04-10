function Controller() {
    function closeWindow() {
        $.detail.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "detail";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.detail = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        orientationModes: Alloy.Globals.orientations,
        navBarHidden: "true",
        id: "detail"
    });
    $.__views.detail && $.addTopLevelView($.__views.detail);
    $.__views.__alloyId0 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId0"
    });
    $.__views.detail.add($.__views.__alloyId0);
    $.__views.backImage = Ti.UI.createButton({
        left: 10,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/ic_action_back.png",
        backgroundFocusedImage: "/images/ic_action_back_on.png",
        backgroundSelectedImage: "/images/ic_action_back_on.png",
        id: "backImage"
    });
    $.__views.__alloyId0.add($.__views.backImage);
    closeWindow ? $.__views.backImage.addEventListener("click", closeWindow) : __defers["$.__views.backImage!click!closeWindow"] = true;
    $.__views.headerTitle = Ti.UI.createLabel({
        left: "60dp",
        color: "#fff",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "Scheda Cliente",
        id: "headerTitle"
    });
    $.__views.__alloyId0.add($.__views.headerTitle);
    $.__views.__alloyId1 = Ti.UI.createScrollView({
        top: Alloy.Globals.tableTop,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        layout: "vertical",
        id: "__alloyId1"
    });
    $.__views.detail.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createView({
        layout: Alloy.Globals.detailWrapperOrientation,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        id: "__alloyId2"
    });
    $.__views.__alloyId1.add($.__views.__alloyId2);
    $.__views.__alloyId3 = Ti.UI.createView({
        layout: "vertical",
        width: Alloy.Globals.detailBlockWidth,
        height: 150,
        id: "__alloyId3"
    });
    $.__views.__alloyId2.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createLabel({
        top: 10,
        left: 10,
        color: "#000000",
        font: {
            fontSize: "14sp"
        },
        text: "Ragione Sociale",
        id: "__alloyId4"
    });
    $.__views.__alloyId3.add($.__views.__alloyId4);
    $.__views.lblName = Ti.UI.createLabel({
        top: 10,
        left: 10,
        color: "#0099cc",
        font: {
            fontSize: "16sp",
            fontWeight: "bold"
        },
        id: "lblName"
    });
    $.__views.__alloyId3.add($.__views.lblName);
    $.__views.__alloyId5 = Ti.UI.createView({
        layout: "vertical",
        width: Alloy.Globals.detailBlockWidth,
        height: 150,
        id: "__alloyId5"
    });
    $.__views.__alloyId2.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createLabel({
        top: 10,
        left: 10,
        color: "#000000",
        font: {
            fontSize: "14sp"
        },
        text: "Indirizzo di fatturazione",
        id: "__alloyId6"
    });
    $.__views.__alloyId5.add($.__views.__alloyId6);
    $.__views.lblBillingAddress = Ti.UI.createLabel({
        top: 10,
        left: 10,
        color: "#0099cc",
        font: {
            fontSize: "16sp",
            fontWeight: "bold"
        },
        id: "lblBillingAddress"
    });
    $.__views.__alloyId5.add($.__views.lblBillingAddress);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var ACCOUNT = require("datamodel/account");
    var accountId = args["accountId"];
    var selectList = ACCOUNT.data.Id + ", " + ACCOUNT.data.Name + ", " + ACCOUNT.data.Billing_Street + ", " + ACCOUNT.data.Billing_City + ", " + ACCOUNT.data.Billing_CAP + ", " + ACCOUNT.data.Billing_Country + ", " + ACCOUNT.data.Billing_State;
    var queryString = "SELECT " + selectList + " FROM " + ACCOUNT.sobject + " WHERE " + ACCOUNT.data.Id + " = '" + accountId + "' LIMIT 1";
    Ti.API.info("[Easy Cash In] Query: " + queryString);
    var db = Ti.Database.open(Alloy.Globals.dbName);
    try {
        var rowset = db.execute(queryString);
    } catch (e) {
        Ti.API.info("[Easy Cash In] Exception retrieving account: " + accountId + " - " + e);
    }
    var accName = "";
    var billingAddress = "";
    if (rowset) {
        while (rowset.isValidRow()) {
            accName = rowset.fieldByName(ACCOUNT.data.Name);
            billingAddress = rowset.fieldByName(ACCOUNT.data.Billing_Street) + " " + rowset.fieldByName(ACCOUNT.data.Billing_CAP) + " " + rowset.fieldByName(ACCOUNT.data.Billing_City) + " (" + rowset.fieldByName(ACCOUNT.data.Billing_State) + ") - " + rowset.fieldByName(ACCOUNT.data.Billing_Country);
            var str = billingAddress.replace("null", " ");
            billingAddress = str;
            Ti.API.info(accName);
            Ti.API.info(billingAddress);
            rowset.next();
        }
        rowset.close();
    }
    db.close();
    $.lblName.setText(accName);
    $.lblBillingAddress.setText(billingAddress);
    $.detail.open();
    $.detail.addEventListener("close", function() {
        $.destroy();
    });
    __defers["$.__views.backImage!click!closeWindow"] && $.__views.backImage.addEventListener("click", closeWindow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;