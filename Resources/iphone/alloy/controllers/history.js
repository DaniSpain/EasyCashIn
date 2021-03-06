function Controller() {
    function loadTableData() {
        var queryString = "SELECT " + selectList + " FROM " + sobject + ' WHERE ATLECI__Account__c = "' + accountId + '" ORDER BY LastModifiedDate DESC';
        db = Ti.Database.open(Alloy.Globals.dbName);
        Ti.API.info("[dynaforce] Query: " + queryString);
        try {
            var rowset = db.execute(queryString);
        } catch (e) {
            Ti.API.error("[dynaforce] Error queryng " + sobject + " data: " + e);
        }
        var tableData = [];
        Ti.API.info("[EasyCashIn] Rows = " + rowset.rowCount);
        while (rowset.isValidRow()) {
            var row = Ti.UI.createTableViewRow({
                className: "listRow",
                selectedBackgroundColor: "#ffffff",
                rowId: rowset.fieldByName("Id"),
                height: 100,
                backgroundColor: "#ffffff"
            });
            var view = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: Ti.UI.FILL,
                layout: "vertical",
                horizontalWrap: true
            });
            var datetime = sfdcDate.getDateTimeObject(rowset.fieldByName("LastModifiedDate"));
            var lblDate = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: Ti.UI.FILL,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 12
                },
                color: "#000000",
                text: datetime
            });
            var lblTitle = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: Ti.UI.FILL,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 14
                },
                horizontalWrap: true,
                text: rowset.fieldByName("ATLECI__Title__c"),
                color: "#0099CC"
            });
            view.add(lblDate);
            view.add(lblTitle);
            row.add(view);
            tableData.push(row);
            rowset.next();
        }
        $.tblView.setData(tableData);
        rowset.close(tableData);
        db.close();
    }
    function closeWindow() {
        $.history.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "history";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.history = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        orientationModes: Alloy.Globals.orientations,
        navBarHidden: "true",
        id: "history"
    });
    $.__views.history && $.addTopLevelView($.__views.history);
    $.__views.__alloyId7 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId7"
    });
    $.__views.history.add($.__views.__alloyId7);
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
    $.__views.__alloyId7.add($.__views.backImage);
    closeWindow ? $.__views.backImage.addEventListener("click", closeWindow) : __defers["$.__views.backImage!click!closeWindow"] = true;
    $.__views.headerTitle = Ti.UI.createLabel({
        left: "60dp",
        color: "#fff",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "Activity History",
        id: "headerTitle"
    });
    $.__views.__alloyId7.add($.__views.headerTitle);
    $.__views.tblView = Ti.UI.createTableView({
        top: Alloy.Globals.tableTop,
        separatorColor: "#0099CC",
        id: "tblView"
    });
    $.__views.history.add($.__views.tblView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var sobject = "ATLECI__History__c";
    var accountId = args["accountId"];
    var IS_IOS;
    var IS_ANDROID;
    IS_ANDROID = false;
    IS_IOS = true;
    var sfdcDate = require("sfdcDate");
    var selectList = "Id, ATLECI__Title__c, LastModifiedDate";
    loadTableData();
    $.history.open();
    $.history.addEventListener("close", function() {
        $.destroy();
    });
    __defers["$.__views.backImage!click!closeWindow"] && $.__views.backImage.addEventListener("click", closeWindow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;