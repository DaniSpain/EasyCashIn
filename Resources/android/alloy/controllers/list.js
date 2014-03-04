function Controller() {
    function loadTableData(whereCondition) {
        var queryString = "SELECT " + selectList + " FROM " + sobject;
        whereCondition && (queryString += " WHERE " + whereCondition);
        queryString += " ORDER BY Name ASC";
        db = Ti.Database.open(Alloy.Globals.dbName);
        Ti.API.info("[dynaforce] Query: " + queryString);
        try {
            var rowset = db.execute(queryString);
        } catch (e) {
            Ti.API.error("[dynaforce] Error queryng " + sobject + " data: " + e);
        }
        var tableData = [];
        while (rowset.isValidRow()) {
            var row = Ti.UI.createTableViewRow({
                className: "listRow",
                selectedBackgroundColor: "#ffffff",
                rowId: rowset.fieldByName("Id"),
                height: 200,
                backgroundColor: "#ffffff"
            });
            var view = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: Ti.UI.FILL,
                layout: "horizontal"
            });
            var leftview = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: "45%",
                layout: "vertical",
                top: "10dp",
                bottom: 10
            });
            var rightview = Titanium.UI.createView({
                left: 10,
                height: Ti.UI.SIZE,
                width: "45%",
                top: "10dp",
                bottom: 10,
                layout: "horizontal",
                horizontalWrap: true
            });
            var lblName = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: 150,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 16
                },
                color: "#000000",
                horizontalWrap: true,
                text: rowset.fieldByName("Name")
            });
            var lblTotal = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: 200,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 14
                },
                color: "#669900",
                text: rowset.fieldByName("Totale_Partite_Aperte__c") + " EUR"
            });
            var lblFirstDate = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: 200,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 12
                },
                color: "#0099CC",
                text: rowset.fieldByName("Data_Prima_Scadenza__c")
            });
            leftview.add(lblName);
            leftview.add(lblTotal);
            leftview.add(lblFirstDate);
            var btnPartiteAperte;
            var btnMail;
            var btnMaps;
            var btnActivity;
            btnPartiteAperte = Titanium.UI.createView({
                top: 10,
                left: 5,
                width: 64,
                height: 64,
                backgroundImage: getPartiteIcon(rowset.fieldByName("Totale_Partite_Aperte__c")),
                color: "#ffffff",
                touchEnabled: true,
                rowId: rowset.fieldByName("Id")
            });
            btnPartiteAperte.addEventListener("click", function(e) {
                var tableView = Alloy.createController("table", {
                    accountId: e.source.rowId
                }).getView();
                tableView.open();
            });
            btnMail = Titanium.UI.createView({
                top: 10,
                left: 5,
                width: 64,
                height: 64,
                backgroundImage: "/images/mail.png",
                color: "#ffffff",
                touchEnabled: true
            });
            btnMaps = Titanium.UI.createView({
                top: 10,
                left: 5,
                width: 64,
                height: 64,
                backgroundImage: "/images/maps.png",
                color: "#ffffff",
                touchEnabled: true
            });
            btnActivity = Titanium.UI.createView({
                top: 10,
                left: 5,
                width: 64,
                height: 64,
                backgroundImage: "/images/activity.png",
                color: "#ffffff",
                touchEnabled: true
            });
            rightview.add(btnPartiteAperte);
            rightview.add(btnMail);
            rightview.add(btnMaps);
            rightview.add(btnActivity);
            view.add(leftview);
            view.add(rightview);
            row.add(view);
            tableData.push(row);
            rowset.next();
        }
        $.tblView.setData(tableData);
        rowset.close(tableData);
        db.close();
    }
    function showHideSearchBar() {
        if (visible) {
            $.searchWrap.setVisible(false);
            $.search.blur();
            visible = false;
            $.searchImage.setImage("/images/ic_action_search.png");
        } else {
            $.searchWrap.setVisible(true);
            visible = true;
            $.searchImage.setImage("/images/ic_action_cancel.png");
            $.search.focus();
        }
    }
    function getPartiteIcon(amountToPay) {
        return amountToPay ? amountToPay > 0 ? "/images/partite_ko.png" : "/images/partite_ok.png" : "/images/partite_ok.png";
    }
    function searchData() {
        var value = $.search.getValue();
        showHideSearchBar();
        loadTableData('LOWER(Name) LIKE "%' + value.toLowerCase() + '%"');
    }
    function searchDataNoHide() {
        var value = $.search.getValue();
        loadTableData('LOWER(Name) LIKE "%' + value.toLowerCase() + '%"');
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "list";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.list = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        navBarHidden: "true",
        id: "list"
    });
    $.__views.list && $.addTopLevelView($.__views.list);
    $.__views.__alloyId3 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId3"
    });
    $.__views.list.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId4"
    });
    $.__views.__alloyId3.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/icon.png",
        touchEnabled: false,
        id: "__alloyId5"
    });
    $.__views.__alloyId4.add($.__views.__alloyId5);
    $.__views.headerTitle = Ti.UI.createLabel({
        left: "60dp",
        color: "#fff",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "Clienti",
        id: "headerTitle"
    });
    $.__views.__alloyId3.add($.__views.headerTitle);
    $.__views.__alloyId6 = Ti.UI.createView({
        right: 10,
        width: 40,
        height: 40,
        id: "__alloyId6"
    });
    $.__views.__alloyId3.add($.__views.__alloyId6);
    showHideSearchBar ? $.__views.__alloyId6.addEventListener("click", showHideSearchBar) : __defers["$.__views.__alloyId6!click!showHideSearchBar"] = true;
    $.__views.searchImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/ic_action_search.png",
        id: "searchImage"
    });
    $.__views.__alloyId6.add($.__views.searchImage);
    $.__views.tblView = Ti.UI.createTableView({
        top: Alloy.Globals.tableTop,
        separatorColor: "#0099CC",
        id: "tblView"
    });
    $.__views.list.add($.__views.tblView);
    $.__views.searchWrap = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        top: Alloy.Globals.tableTop,
        id: "searchWrap",
        visible: "false",
        layout: "vertical"
    });
    $.__views.list.add($.__views.searchWrap);
    $.__views.search = Ti.UI.createSearchBar({
        id: "search",
        barColor: "#0099CC",
        showCancel: "false",
        height: "43"
    });
    $.__views.searchWrap.add($.__views.search);
    searchData ? $.__views.search.addEventListener("return", searchData) : __defers["$.__views.search!return!searchData"] = true;
    searchDataNoHide ? $.__views.search.addEventListener("change", searchDataNoHide) : __defers["$.__views.search!change!searchDataNoHide"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var sobject = args["sobject"];
    Ti.API.info("[dynaforce] PASSED SOBJECT: " + sobject);
    var selectList = "Id, Name, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c";
    loadTableData();
    $.list.open();
    $.list.addEventListener("close", function() {
        $.destroy();
    });
    var visible = false;
    __defers["$.__views.__alloyId6!click!showHideSearchBar"] && $.__views.__alloyId6.addEventListener("click", showHideSearchBar);
    __defers["$.__views.search!return!searchData"] && $.__views.search.addEventListener("return", searchData);
    __defers["$.__views.search!change!searchDataNoHide"] && $.__views.search.addEventListener("change", searchDataNoHide);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;