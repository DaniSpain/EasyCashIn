function Controller() {
    function loadTableData(whereCondition) {
        var queryString = "SELECT " + selectList + " FROM " + sobject;
        whereCondition && (queryString += " WHERE " + whereCondition);
        queryString += " ORDER BY " + ACCOUNT.data.Name + " ASC";
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
                selectedBackgroundColor: "#0099cc",
                backgroundFocusedColor: "#0099cc",
                backgroundSelectedColor: "#0099cc",
                rowId: rowset.fieldByName(ACCOUNT.data.Id),
                height: rowHeight,
                backgroundColor: "#ffffff"
            });
            row.addEventListener("click", function(e) {
                $.activityIndicator.setMessage("Loading Data");
                $.activityIndicator.show();
                var detailView = Alloy.createController("detail", {
                    accountId: e.rowData.rowId
                }).getView();
                detailView.open();
                $.activityIndicator.hide();
            });
            var view = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: Ti.UI.FILL
            });
            var leftview;
            var rightview;
            if (IS_TABLET) {
                leftview = Titanium.UI.createView({
                    left: 0,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
                    layout: "horizontal",
                    bottom: 10
                });
                rightview = Titanium.UI.createView({
                    right: 10,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
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
                    bottom: 10
                });
                rightview = Titanium.UI.createView({
                    right: 10,
                    height: Ti.UI.SIZE,
                    width: "45%",
                    bottom: 10,
                    layout: "horizontal",
                    horizontalWrap: true
                });
            }
            var lblName = Ti.UI.createLabel({
                left: 10,
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
                left: 20,
                top: TOP_POS,
                width: SHORT_CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: "18sp",
                    fontWeight: "bold"
                },
                color: "#669900",
                text: rowset.fieldByName(ACCOUNT.data.Totale_Partite_Aperte) + " EUR"
            });
            var lblFirstDate = Ti.UI.createLabel({
                top: TOP_POS,
                left: 20,
                width: SHORT_CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: "14sp"
                },
                color: "#0099CC",
                text: rowset.fieldByName(ACCOUNT.data.Data_Prima_Scadenza)
            });
            var lblExpired = Ti.UI.createLabel({
                top: TOP_POS,
                left: 10,
                width: CTRL_WIDTH,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: "18sp",
                    fontWeight: "bold"
                },
                color: "#ffb61c",
                text: "SCADUTE"
            });
            leftview.add(lblName);
            leftview.add(lblTotal);
            leftview.add(lblFirstDate);
            hasExpiredInvoices(rowset.fieldByName(ACCOUNT.data.Id)) && leftview.add(lblExpired);
            var btnPartiteAperte;
            var btnMail;
            var btnMaps;
            var btnActivity;
            btnPartiteAperte = Titanium.UI.createView({
                top: 10,
                right: 5,
                width: 64,
                height: 64,
                backgroundImage: getPartiteIcon(rowset.fieldByName(ACCOUNT.data.Totale_Partite_Aperte)),
                color: "#ffffff",
                bubbleParent: false,
                touchEnabled: true,
                rowId: rowset.fieldByName(ACCOUNT.data.Id)
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
                right: 5,
                width: 64,
                height: 64,
                bubbleParent: false,
                backgroundImage: getMailIcon(rowset.fieldByName(ACCOUNT.data.Email)),
                color: "#ffffff",
                email: rowset.fieldByName(ACCOUNT.data.Email),
                accName: rowset.fieldByName(ACCOUNT.data.Name),
                touchEnabled: true
            });
            btnMail.addEventListener("click", function(e) {
                var email = e.source.email;
                if (email) {
                    $.activityIndicator.setMessage("Opening Email");
                    $.activityIndicator.show();
                    Ti.API.info(email);
                    var emailDialog = Ti.UI.createEmailDialog();
                    emailDialog.subject = "REMINDER: fattura";
                    emailDialog.toRecipients = [ email ];
                    emailDialog.messageBody = "Risp.le " + e.source.accName;
                    emailDialog.open();
                    $.activityIndicator.hide();
                } else alert("Non è definita nessuna e-mail per questo cliente");
            });
            btnMaps = Titanium.UI.createView({
                top: 10,
                right: 5,
                width: 64,
                height: 64,
                backgroundImage: "/images/maps.png",
                color: "#ffffff",
                touchEnabled: true
            });
            btnActivity = Titanium.UI.createView({
                top: 10,
                right: 5,
                width: 64,
                height: 64,
                bubbleParent: false,
                backgroundImage: "/images/activity.png",
                color: "#ffffff",
                rowId: rowset.fieldByName(ACCOUNT.data.Id),
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
    function showHideSearchBar() {
        if (visible) {
            $.searchWrap.setVisible(false);
            $.search.blur();
            visible = false;
            $.searchImage.setBackgroundImage("/images/ic_action_search.png");
            $.searchImage.setBackgroundFocusedImage("/images/ic_action_search_on.png");
            $.searchImage.setBackgroundSelectedImage("/images/ic_action_search_on.png");
            check = true;
        } else {
            $.searchWrap.setVisible(true);
            visible = true;
            $.searchImage.setBackgroundImage("/images/ic_action_cancel.png");
            $.searchImage.setBackgroundFocusedImage("/images/ic_action_cancel_on.png");
            $.searchImage.setBackgroundSelectedImage("/images/ic_action_cancel_on.png");
            $.search.focus();
        }
    }
    function getPartiteIcon(amountToPay) {
        return amountToPay ? amountToPay > 0 ? "/images/partite_ko.png" : "/images/partite_ok.png" : "/images/partite_ok.png";
    }
    function getMailIcon(mail) {
        return mail ? "/images/mail.png" : "/images/mail_dis.png";
    }
    function searchData() {
        var value = $.search.getValue();
        var onlyDebitors = $.onlyDebitors.value;
        var expired = $.expired.value;
        var whereConditions = "LOWER(" + ACCOUNT.data.Name + ') LIKE "%' + value.toLowerCase() + '%"';
        showHideSearchBar();
        onlyDebitors && (whereConditions += " AND " + ACCOUNT.data.Totale_Partite_Aperte + " > 0");
        expired && (whereConditions += " AND " + ACCOUNT.data.Id + " IN (SELECT " + PARTITE.data.Account + " FROM " + PARTITE.sobject + " WHERE " + PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true")');
        loadTableData(whereConditions);
        loaderShown = false;
    }
    function searchDataNoHide() {
        var value = $.search.getValue();
        var onlyDebitors = $.onlyDebitors.value;
        var expired = $.expired.value;
        var whereConditions = "LOWER(" + ACCOUNT.data.Name + ') LIKE "%' + value.toLowerCase() + '%"';
        onlyDebitors && (whereConditions += " AND " + ACCOUNT.data.Totale_Partite_Aperte + " > 0");
        expired && (whereConditions += " AND " + ACCOUNT.data.Id + " IN (SELECT " + PARTITE.data.Account + " FROM " + PARTITE.sobject + " WHERE " + PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true")');
        loadTableData(whereConditions);
        loaderShown = false;
    }
    function refreshData() {
        if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
            $.activityIndicator.setMessage("Validate User Credentials");
            $.activityIndicator.show();
            Alloy.Globals.force.authorize({
                success: function() {
                    Titanium.API.info("Authenticated to salesforce");
                    Alloy.Globals.dynaforce.resetSync();
                    $.activityIndicator.setMessage("Pushing Data");
                    Alloy.Globals.dynaforce.pushDataToServer({
                        success: function() {
                            Ti.API.info("[dynaforce] pushDataToServer SUCCESS");
                            $.activityIndicator.setMessage("Sync Data Models");
                            Alloy.Globals.dynaforce.startSync({
                                indicator: $.activityIndicator,
                                success: function() {
                                    $.activityIndicator.setMessage("Downloading Attachments");
                                    var docDl = require("doc");
                                    docDl.downloadFiles({
                                        success: function() {
                                            $.activityIndicator.hide();
                                        }
                                    });
                                }
                            });
                        }
                    });
                },
                expired: function() {
                    Ti.API.info("[dynaforce] Session Expired");
                    $.index.close();
                },
                error: function() {
                    Ti.API.error("error");
                    alert("Connection Error");
                    $.activityIndicator.hide();
                },
                cancel: function() {
                    Ti.API.info("cancel");
                    $.activityIndicator.hide();
                }
            });
        } else alert("Cannot perform this operation without connectivity");
    }
    function viewInfo() {
        alert("ATLaaS Easy Cash In \nv" + Ti.App.version + "\n" + "Atlantic Technologies S.p.A \n" + "www.atlantic-technologies.com");
    }
    function hasExpiredInvoices(accountId) {
        var check = false;
        var db = Ti.Database.open(Alloy.Globals.dbName);
        try {
            var rowset = db.execute("SELECT " + PARTITE.data.Id + " FROM " + PARTITE.sobject + " WHERE " + PARTITE.data.Account + ' == "' + accountId + '"' + " AND " + PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true"');
        } catch (e) {
            Ti.API.error("[easycashin] Exception controlling expired invoices for account " + accountId + ": " + e);
        }
        if (rowset) {
            rowset.rowCount > 0 && (check = true);
            rowset.close();
        }
        db.close();
        return check;
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
        orientationModes: Alloy.Globals.orientations,
        navBarHidden: "true",
        exitOnClose: "true",
        id: "list"
    });
    $.__views.list && $.addTopLevelView($.__views.list);
    $.__views.__alloyId11 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId11"
    });
    $.__views.list.add($.__views.__alloyId11);
    $.__views.__alloyId12 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId12"
    });
    $.__views.__alloyId11.add($.__views.__alloyId12);
    $.__views.__alloyId13 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/icon.png",
        touchEnabled: false,
        id: "__alloyId13"
    });
    $.__views.__alloyId12.add($.__views.__alloyId13);
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
    $.__views.__alloyId11.add($.__views.headerTitle);
    $.__views.infoImage = Ti.UI.createButton({
        right: 110,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/ic_action_about.png",
        backgroundFocusedImage: "/images/ic_action_about_on.png",
        backgroundSelectedImage: "/images/ic_action_about_on.png",
        id: "infoImage"
    });
    $.__views.__alloyId11.add($.__views.infoImage);
    viewInfo ? $.__views.infoImage.addEventListener("click", viewInfo) : __defers["$.__views.infoImage!click!viewInfo"] = true;
    $.__views.refreshImage = Ti.UI.createButton({
        right: 60,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/ic_action_refresh.png",
        backgroundFocusedImage: "/images/ic_action_refresh_on.png",
        backgroundSelectedImage: "/images/ic_action_refresh_on.png",
        id: "refreshImage"
    });
    $.__views.__alloyId11.add($.__views.refreshImage);
    refreshData ? $.__views.refreshImage.addEventListener("click", refreshData) : __defers["$.__views.refreshImage!click!refreshData"] = true;
    $.__views.searchImage = Ti.UI.createButton({
        right: 10,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/ic_action_search.png",
        backgroundFocusedImage: "/images/ic_action_search_on.png",
        backgroundSelectedImage: "/images/ic_action_search_on.png",
        id: "searchImage"
    });
    $.__views.__alloyId11.add($.__views.searchImage);
    showHideSearchBar ? $.__views.searchImage.addEventListener("click", showHideSearchBar) : __defers["$.__views.searchImage!click!showHideSearchBar"] = true;
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
        layout: "vertical",
        backgroundColor: "#0099CC"
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
    $.__views.__alloyId14 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "40",
        top: "10",
        id: "__alloyId14"
    });
    $.__views.searchWrap.add($.__views.__alloyId14);
    $.__views.__alloyId15 = Ti.UI.createLabel({
        left: 10,
        color: "#ffffff",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: 15
        },
        text: "Ha pagamenti aperti",
        id: "__alloyId15"
    });
    $.__views.__alloyId14.add($.__views.__alloyId15);
    $.__views.onlyDebitors = Ti.UI.createSwitch({
        value: false,
        id: "onlyDebitors"
    });
    $.__views.__alloyId14.add($.__views.onlyDebitors);
    searchDataNoHide ? $.__views.onlyDebitors.addEventListener("change", searchDataNoHide) : __defers["$.__views.onlyDebitors!change!searchDataNoHide"] = true;
    $.__views.__alloyId16 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "40",
        top: "10",
        id: "__alloyId16"
    });
    $.__views.searchWrap.add($.__views.__alloyId16);
    $.__views.__alloyId17 = Ti.UI.createLabel({
        left: 10,
        color: "#ffffff",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: 15
        },
        text: "Ha partite scadute da pagare",
        id: "__alloyId17"
    });
    $.__views.__alloyId16.add($.__views.__alloyId17);
    $.__views.expired = Ti.UI.createSwitch({
        value: false,
        id: "expired"
    });
    $.__views.__alloyId16.add($.__views.expired);
    searchDataNoHide ? $.__views.expired.addEventListener("change", searchDataNoHide) : __defers["$.__views.expired!change!searchDataNoHide"] = true;
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
    $.list.orientationModes = Alloy.Globals.orientations;
    var ACCOUNT = require("datamodel/account");
    var PARTITE = require("datamodel/partite");
    var sobject = args["sobject"];
    Ti.API.info("[dynaforce] PASSED SOBJECT: " + sobject);
    var osname = Ti.Platform.osname;
    Ti.Platform.version, Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth;
    var IS_IOS;
    var IS_ANDROID;
    if ("android" == osname) {
        IS_ANDROID = true;
        IS_IOS = false;
    } else {
        IS_ANDROID = false;
        IS_IOS = true;
    }
    var IS_TABLET = Alloy.Globals.isTablet;
    var rowHeight;
    var LBL_NAME_SIZE;
    var CTRL_WIDTH;
    var SHORT_CTRL_WIDTH;
    var TOP_POS;
    if (IS_TABLET) {
        LBL_NAME_SIZE = "20sp";
        CTRL_WIDTH = 200;
        SHORT_CTRL_WIDTH = 150;
        rowHeight = 110;
        TOP_POS = null;
    } else {
        LBL_NAME_SIZE = "16sp";
        CTRL_WIDTH = 150;
        SHORT_CTRL_WIDTH = 100;
        rowHeight = 180;
        TOP_POS = 10;
    }
    var selectList = ACCOUNT.data.Id + ", " + ACCOUNT.data.Name + ", " + ACCOUNT.data.Billing_Street + ", " + ACCOUNT.data.Data_Prima_Scadenza + ", " + ACCOUNT.data.Totale_Partite_Aperte + ", " + ACCOUNT.data.Email;
    loadTableData();
    $.list.open();
    $.list.addEventListener("close", function() {
        $.destroy();
    });
    var loaderShown = false;
    var visible = false;
    $.list.addEventListener("focus", function() {
        if (Alloy.Globals.dynaforce.getChanges()) {
            refreshData();
            Alloy.Globals.dynaforce.resetChanges();
        }
    });
    $.list.addEventListener("android:back", function() {
        Ti.API.info("[Easy Cash In] android back pressed");
        visible ? showHideSearchBar() : $.list.close();
    });
    __defers["$.__views.infoImage!click!viewInfo"] && $.__views.infoImage.addEventListener("click", viewInfo);
    __defers["$.__views.refreshImage!click!refreshData"] && $.__views.refreshImage.addEventListener("click", refreshData);
    __defers["$.__views.searchImage!click!showHideSearchBar"] && $.__views.searchImage.addEventListener("click", showHideSearchBar);
    __defers["$.__views.search!return!searchData"] && $.__views.search.addEventListener("return", searchData);
    __defers["$.__views.search!change!searchDataNoHide"] && $.__views.search.addEventListener("change", searchDataNoHide);
    __defers["$.__views.onlyDebitors!change!searchDataNoHide"] && $.__views.onlyDebitors.addEventListener("change", searchDataNoHide);
    __defers["$.__views.expired!change!searchDataNoHide"] && $.__views.expired.addEventListener("change", searchDataNoHide);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;