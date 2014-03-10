function Controller() {
    function loadTableData() {
        var queryString = "SELECT " + selectList + " FROM " + sobject + ' WHERE Account__c = "' + accountId + '" ORDER BY LastModifiedDate DESC';
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
                text: rowset.fieldByName("Title__c"),
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
        navBarHidden: "true",
        id: "history"
    });
    $.__views.history && $.addTopLevelView($.__views.history);
    $.__views.__alloyId0 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId0"
    });
    $.__views.history.add($.__views.__alloyId0);
    $.__views.__alloyId1 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId1"
    });
    $.__views.__alloyId0.add($.__views.__alloyId1);
    $.__views.backImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/ic_action_back.png",
        id: "backImage"
    });
    $.__views.__alloyId1.add($.__views.backImage);
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
    $.__views.__alloyId0.add($.__views.headerTitle);
    $.__views.tblView = Ti.UI.createTableView({
        top: Alloy.Globals.tableTop,
        separatorColor: "#0099CC",
        id: "tblView"
    });
    $.__views.history.add($.__views.tblView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var sobject = "History__c";
    var accountId = args["accountId"];
    var IS_IOS;
    var IS_ANDROID;
    IS_ANDROID = true;
    IS_IOS = false;
    var sfdcDate = require("sfdcDate");
    var selectList = "Id, Title__c, LastModifiedDate";
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