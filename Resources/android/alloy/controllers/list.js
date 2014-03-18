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
                height: rowHeight,
                backgroundColor: "#ffffff"
            });
            var view = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: Ti.UI.FILL,
                layout: "horizontal"
            });
            var leftview;
            var rightview;
            if (IS_TABLET) {
                leftview = Titanium.UI.createView({
                    left: 0,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
                    layout: "horizontal",
                    top: "10dp",
                    bottom: 10
                });
                rightview = Titanium.UI.createView({
                    left: 10,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
                    top: "10dp",
                    bottom: 10,
                    layout: "horizontal",
                    horizontalWrap: true
                });
            } else {
                leftview = Titanium.UI.createView({
                    left: 0,
                    height: Ti.UI.SIZE,
                    width: "45%",
                    layout: "vertical",
                    top: "10dp",
                    bottom: 10
                });
                rightview = Titanium.UI.createView({
                    left: 10,
                    height: Ti.UI.SIZE,
                    width: "45%",
                    top: "10dp",
                    bottom: 10,
                    layout: "horizontal",
                    horizontalWrap: true
                });
            }
            var lblName = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: LBL_NAME_SIZE
                },
                color: "#000000",
                horizontalWrap: true,
                text: rowset.fieldByName("Name")
            });
            var lblTotal = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: "16sp",
                    fontWeight: "bold"
                },
                color: "#669900",
                text: rowset.fieldByName("Totale_Partite_Aperte__c") + " EUR"
            });
            var lblFirstDate = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: "14sp"
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
                $.activityIndicator.setMessage("Loading Data");
                $.activityIndicator.show();
                var tableView = Alloy.createController("table", {
                    accountId: e.source.rowId
                }).getView();
                tableView.open();
                $.activityIndicator.hide();
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
                rowId: rowset.fieldByName("Id"),
                touchEnabled: true
            });
            btnActivity.addEventListener("click", function(e) {
                $.activityIndicator.setMessage("Loading History");
                $.activityIndicator.show();
                var historyView = Alloy.createController("history", {
                    accountId: e.source.rowId
                }).getView();
                historyView.open();
                $.activityIndicator.hide();
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
    function addLoaderRow() {
        if (!loaderShown) {
            var row = Ti.UI.createTableViewRow({
                height: 100,
                width: Ti.UI.FILL
            });
            var lblLoading = Ti.UI.createLabel({
                width: Ti.UI.SIZE,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 14
                },
                color: "#0099CC",
                text: "Loading"
            });
            row.add(lblLoading);
            $.tblView.appendRow(row);
            loaderShown = true;
        }
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
    function refreshData() {
        if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
            Alloy.Globals.dynaforce.resetSync();
            $.activityIndicator.setMessage("Pushing Data");
            $.activityIndicator.show();
            Alloy.Globals.dynaforce.pushDataToServer({
                success: function() {
                    Ti.API.info("[dynaforce] pushDataToServer SUCCESS");
                    $.activityIndicator.setMessage("Sync Data Models");
                    Alloy.Globals.dynaforce.startSync({
                        indicator: $.activityIndicator,
                        success: function() {
                            $.activityIndicator.setMessage("Downloading Images");
                            Alloy.Globals.dynaforce.downloadImages({
                                success: function() {
                                    $.activityIndicator.hide();
                                    loadTableData();
                                }
                            });
                        }
                    });
                }
            });
        } else alert("Cannot perform this operation without connectivity");
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
    $.__views.__alloyId5 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId5"
    });
    $.__views.list.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId6"
    });
    $.__views.__alloyId5.add($.__views.__alloyId6);
    $.__views.__alloyId7 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/icon.png",
        touchEnabled: false,
        id: "__alloyId7"
    });
    $.__views.__alloyId6.add($.__views.__alloyId7);
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
    $.__views.__alloyId5.add($.__views.headerTitle);
    $.__views.__alloyId8 = Ti.UI.createView({
        right: 60,
        width: 40,
        height: 40,
        id: "__alloyId8"
    });
    $.__views.__alloyId5.add($.__views.__alloyId8);
    refreshData ? $.__views.__alloyId8.addEventListener("click", refreshData) : __defers["$.__views.__alloyId8!click!refreshData"] = true;
    $.__views.refreshImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        image: "/images/ic_action_refresh.png",
        id: "refreshImage"
    });
    $.__views.__alloyId8.add($.__views.refreshImage);
    $.__views.__alloyId9 = Ti.UI.createView({
        right: 10,
        width: 40,
        height: 40,
        id: "__alloyId9"
    });
    $.__views.__alloyId5.add($.__views.__alloyId9);
    showHideSearchBar ? $.__views.__alloyId9.addEventListener("click", showHideSearchBar) : __defers["$.__views.__alloyId9!click!showHideSearchBar"] = true;
    $.__views.searchImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        image: "/images/ic_action_search.png",
        id: "searchImage"
    });
    $.__views.__alloyId9.add($.__views.searchImage);
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
    $.__views.activityIndicator = Ti.UI.createActivityIndicator({
        color: "#ffffff",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 16,
            fontWeight: "bold"
        },
        style: Alloy.Globals.style,
        top: "Alloy.Globals.top",
        horizontalWrap: true,
        backgroundColor: "#0099CC",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        id: "activityIndicator"
    });
    $.__views.list.add($.__views.activityIndicator);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var sobject = args["sobject"];
    Ti.API.info("[dynaforce] PASSED SOBJECT: " + sobject);
    var osname = "android", width = (Ti.Platform.version, Ti.Platform.displayCaps.platformHeight, 
    Ti.Platform.displayCaps.platformWidth);
    var IS_IOS;
    var IS_ANDROID;
    if ("android" == osname) {
        IS_ANDROID = true;
        IS_IOS = false;
    } else {
        IS_ANDROID = false;
        IS_IOS = true;
    }
    var IS_TABLET = "ipad" === osname || "android" === osname && width > 900;
    var rowHeight;
    var LBL_NAME_SIZE;
    var CTRL_WIDTH;
    if (IS_TABLET) {
        LBL_NAME_SIZE = "20sp";
        CTRL_WIDTH = 150;
        rowHeight = 120;
    } else {
        LBL_NAME_SIZE = "16sp";
        CTRL_WIDTH = 150;
        rowHeight = 200;
    }
    var selectList = "Id, Name, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c";
    loadTableData();
    $.list.open();
    $.list.addEventListener("close", function() {
        $.destroy();
    });
    $.tblView.addEventListener("scrollend", function() {
        addLoaderRow();
    });
    var loaderShown = false;
    var visible = false;
    $.list.addEventListener("focus", function() {
        if (Alloy.Globals.dynaforce.getChanges()) {
            refreshData();
            Alloy.Globals.dynaforce.resetChanges();
        }
    });
    __defers["$.__views.__alloyId8!click!refreshData"] && $.__views.__alloyId8.addEventListener("click", refreshData);
    __defers["$.__views.__alloyId9!click!showHideSearchBar"] && $.__views.__alloyId9.addEventListener("click", showHideSearchBar);
    __defers["$.__views.search!return!searchData"] && $.__views.search.addEventListener("return", searchData);
    __defers["$.__views.search!change!searchDataNoHide"] && $.__views.search.addEventListener("change", searchDataNoHide);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;