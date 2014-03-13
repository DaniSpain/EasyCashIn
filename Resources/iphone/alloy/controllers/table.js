function Controller() {
    function loadTableData() {
        amount_to_pay = 0;
        selected_row_ids = [];
        var queryString = "SELECT " + selectList + " FROM " + sobject + ' WHERE Account__c = "' + accountId + '" ORDER BY Data_Scadenza__c ASC';
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
                payed: rowset.fieldByName("Pagato__c"),
                height: rowHeight,
                backgroundColor: "#ffffff"
            });
            var view = Titanium.UI.createView({
                left: 0,
                height: Ti.UI.SIZE,
                width: Ti.UI.FILL,
                layout: "horizontal",
                horizontalWrap: true
            });
            var vImporto = Ti.UI.createView({
                left: 10,
                top: 10,
                height: Ti.UI.SIZE,
                width: Ti.UI.SIZE,
                layout: "vertical"
            });
            var lblLblImporto = Ti.UI.createLabel({
                left: 0,
                top: 0,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 12
                },
                color: "#000000",
                text: "Importo"
            });
            var lblImporto = Ti.UI.createLabel({
                left: 0,
                top: 5,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 20
                },
                color: "#000000",
                text: rowset.fieldByName("Importo__c") + " EUR"
            });
            vImporto.add(lblLblImporto);
            vImporto.add(lblImporto);
            Ti.API.info("[EasyCashIn] Importo: " + rowset.fieldByName("Importo__c"));
            Ti.API.info("[EasyCashIn] Pagato: " + rowset.fieldByName("Pagato__c"));
            var lblPayed = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 20
                },
                text: getLabelText(rowset.fieldByName("Pagato__c")),
                color: getLabelColor(rowset.fieldByName("Pagato__c"))
            });
            var vScadenza = Ti.UI.createView({
                left: 10,
                top: 10,
                height: Ti.UI.SIZE,
                width: Ti.UI.SIZE,
                layout: "vertical"
            });
            var lblLblScadenza = Ti.UI.createLabel({
                left: 0,
                top: 0,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 12
                },
                color: "#000000",
                text: "Data Scadenza"
            });
            var lblScadenza = Ti.UI.createLabel({
                left: 0,
                top: 5,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 20
                },
                color: "#000000",
                text: rowset.fieldByName("Data_Scadenza__c")
            });
            vScadenza.add(lblLblScadenza);
            vScadenza.add(lblScadenza);
            var payView = Ti.UI.createView({
                height: Ti.UI.SIZE,
                width: ctrlWidth,
                left: 10,
                top: 10,
                layout: "horizontal",
                horizontalWrap: true
            });
            var lblPay = Ti.UI.createLabel({
                width: Ti.UI.SIZE,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 12
                },
                color: "#000000",
                text: "Paga"
            });
            var paySwitch = Ti.UI.createSwitch({
                value: false,
                rowId: rowset.fieldByName("Id"),
                amount: rowset.fieldByName("Importo__c")
            });
            IS_ANDROID && paySwitch.setStyle(Ti.UI.Android.SWITCH_STYLE_CHECKBOX);
            paySwitch.addEventListener("change", function(e) {
                Ti.API.info("Switch value: " + e.value);
                if (e.value) {
                    Ti.API.info("Switch amount: " + e.source.amount);
                    amount_to_pay += e.source.amount;
                    selected_row_ids.push(e.source.rowId);
                    Ti.API.info("Selected rows: " + selected_row_ids.length);
                } else {
                    amount_to_pay -= e.source.amount;
                    var idx = selected_row_ids.indexOf(e.source.rowId);
                    selected_row_ids.splice(idx, 1);
                    Ti.API.info("Selected rows: " + selected_row_ids.length);
                }
                $.footerTitle.setText("Totale selezionato: " + amount_to_pay + " EUR");
            });
            if (IS_TABLET) {
                var vDoc = Ti.UI.createView({
                    left: 10,
                    top: 10,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
                    layout: "vertical"
                });
                var lblLblDoc = Ti.UI.createLabel({
                    left: 0,
                    top: 0,
                    width: ctrlWidth,
                    height: Ti.UI.SIZE,
                    font: {
                        fontSize: 12
                    },
                    color: "#000000",
                    text: "# Documento"
                });
                var lblDoc = Ti.UI.createLabel({
                    left: 0,
                    top: 5,
                    width: ctrlWidth,
                    height: Ti.UI.SIZE,
                    font: {
                        fontSize: 20
                    },
                    color: "#000000",
                    text: rowset.fieldByName("Name")
                });
                vDoc.add(lblLblDoc);
                vDoc.add(lblDoc);
                view.add(vDoc);
            }
            payView.add(lblPay);
            payView.add(paySwitch);
            view.add(vImporto);
            view.add(lblPayed);
            view.add(vScadenza);
            "false" == rowset.fieldByName("Pagato__c") && view.add(payView);
            var needSync = Alloy.Globals.dynaforce.needSync({
                Id: rowset.fieldByName("Id")
            });
            if (needSync) {
                var btnSync = Titanium.UI.createView({
                    top: 10,
                    left: 10,
                    width: 40,
                    height: 40,
                    backgroundImage: "/images/not_sync.png",
                    touchEnabled: true,
                    rowId: rowset.fieldByName("Id")
                });
                view.add(btnSync);
            }
            row.add(view);
            tableData.push(row);
            rowset.next();
        }
        $.tblView.setData(tableData);
        rowset.close(tableData);
        db.close();
    }
    function showHidePopup() {
        if (0 != amount_to_pay) if (popup_visible) {
            $.popup.hide();
            $.overlay.hide();
            popup_visible = false;
        } else {
            $.popup.show();
            $.overlay.show();
            popup_visible = true;
        } else alert("Non hai selezionato nessuna fattura per eseguire il pagamento");
    }
    function pay() {
        $.activityIndicator.setMessage("Perform payment");
        $.activityIndicator.show();
        Ti.API.info("[table] selected rows: " + selected_row_ids);
        for (var i = 0; selected_row_ids.length > i; i++) Alloy.Globals.dynaforce.upsertObject({
            sobject: sobject,
            rowId: selected_row_ids[i],
            data: {
                Pagato__c: true
            },
            error: function() {
                alert("Payment Error");
            }
        });
        if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
            $.activityIndicator.setMessage("Sync Data to server");
            Alloy.Globals.dynaforce.pushDataToServer({
                success: function() {
                    Ti.API.info("[table] push data SUCCESS");
                    showHidePopup();
                    loadTableData();
                    Alloy.Globals.dynaforce.setChanges();
                    $.activityIndicator.hide();
                }
            });
        } else {
            showHidePopup();
            loadTableData();
            $.activityIndicator.hide();
        }
    }
    function posPay() {
        var mposView = Alloy.createController("mpos", {
            amount: amount_to_pay
        }).getView();
        mposView.open();
    }
    function getLabelColor(payed) {
        var payedColor;
        payedColor = "true" == payed ? "#669900" : "#CC0000";
        return payedColor;
    }
    function getLabelText(payed) {
        var payedText;
        payedText = "true" == payed ? "PAGATO" : "NON PAGATO";
        return payedText;
    }
    function closeWindow() {
        $.table.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "table";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.table = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        navBarHidden: "true",
        id: "table"
    });
    $.__views.table && $.addTopLevelView($.__views.table);
    $.__views.__alloyId12 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId12"
    });
    $.__views.table.add($.__views.__alloyId12);
    $.__views.__alloyId13 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId13"
    });
    $.__views.__alloyId12.add($.__views.__alloyId13);
    $.__views.backImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/ic_action_back.png",
        id: "backImage"
    });
    $.__views.__alloyId13.add($.__views.backImage);
    closeWindow ? $.__views.backImage.addEventListener("click", closeWindow) : __defers["$.__views.backImage!click!closeWindow"] = true;
    $.__views.headerTitle = Ti.UI.createLabel({
        left: "60dp",
        color: "#fff",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "Partite Aperte",
        id: "headerTitle"
    });
    $.__views.__alloyId12.add($.__views.headerTitle);
    $.__views.__alloyId14 = Ti.UI.createView({
        right: 10,
        width: 40,
        height: 40,
        id: "__alloyId14"
    });
    $.__views.__alloyId12.add($.__views.__alloyId14);
    showHidePopup ? $.__views.__alloyId14.addEventListener("click", showHidePopup) : __defers["$.__views.__alloyId14!click!showHidePopup"] = true;
    $.__views.payImage = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/incassa.png",
        id: "payImage"
    });
    $.__views.__alloyId14.add($.__views.payImage);
    $.__views.tblView = Ti.UI.createTableView({
        top: Alloy.Globals.tableTop,
        separatorColor: "#0099CC",
        bottom: 48,
        id: "tblView"
    });
    $.__views.table.add($.__views.tblView);
    $.__views.footer = Ti.UI.createView({
        bottom: 0,
        height: 48,
        width: Ti.UI.FILL,
        backgroundColor: "#0099cc",
        id: "footer"
    });
    $.__views.table.add($.__views.footer);
    $.__views.footerTitle = Ti.UI.createLabel({
        right: "60dp",
        color: "#fff",
        font: {
            fontSize: "15sp",
            fontWeight: "bold"
        },
        text: "Totale selezionato: 0 EUR",
        id: "footerTitle"
    });
    $.__views.footer.add($.__views.footerTitle);
    $.__views.overlay = Ti.UI.createView({
        top: Alloy.Globals.top,
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        opacity: .6,
        backgroundColor: "#000000",
        id: "overlay",
        visible: "false"
    });
    $.__views.table.add($.__views.overlay);
    $.__views.popup = Ti.UI.createView({
        width: 300,
        height: Ti.UI.SIZE,
        backgroundColor: "#ffffff",
        opacity: 1,
        id: "popup",
        visible: "false"
    });
    $.__views.table.add($.__views.popup);
    $.__views.__alloyId15 = Ti.UI.createView({
        width: Ti.UI.FILL,
        top: 0,
        height: 55,
        layout: "vertical",
        id: "__alloyId15"
    });
    $.__views.popup.add($.__views.__alloyId15);
    $.__views.__alloyId16 = Ti.UI.createView({
        height: "52dp",
        width: Ti.UI.FILL,
        id: "__alloyId16"
    });
    $.__views.__alloyId15.add($.__views.__alloyId16);
    $.__views.popupTitle = Ti.UI.createLabel({
        left: 10,
        color: "#0099CC",
        font: {
            fontSize: "15sp",
            fontWeight: "bold"
        },
        id: "popupTitle"
    });
    $.__views.__alloyId16.add($.__views.popupTitle);
    $.__views.__alloyId17 = Ti.UI.createLabel({
        id: "__alloyId17"
    });
    $.__views.__alloyId16.add($.__views.__alloyId17);
    $.__views.__alloyId18 = Ti.UI.createView({
        right: 10,
        width: 40,
        height: 40,
        id: "__alloyId18"
    });
    $.__views.__alloyId16.add($.__views.__alloyId18);
    showHidePopup ? $.__views.__alloyId18.addEventListener("click", showHidePopup) : __defers["$.__views.__alloyId18!click!showHidePopup"] = true;
    $.__views.__alloyId19 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        image: "/images/close_blue.png",
        id: "__alloyId19"
    });
    $.__views.__alloyId18.add($.__views.__alloyId19);
    $.__views.__alloyId20 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 2,
        backgroundColor: "#0099CC",
        id: "__alloyId20"
    });
    $.__views.__alloyId15.add($.__views.__alloyId20);
    $.__views.__alloyId21 = Ti.UI.createView({
        top: 55,
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        layout: "vertical",
        id: "__alloyId21"
    });
    $.__views.popup.add($.__views.__alloyId21);
    $.__views.__alloyId22 = Ti.UI.createButton({
        height: 48,
        width: Ti.UI.FILL,
        top: 5,
        left: 5,
        right: 5,
        color: "#0099CC",
        backgroundColor: "#ffffff",
        title: "Contanti",
        id: "__alloyId22"
    });
    $.__views.__alloyId21.add($.__views.__alloyId22);
    pay ? $.__views.__alloyId22.addEventListener("click", pay) : __defers["$.__views.__alloyId22!click!pay"] = true;
    $.__views.__alloyId23 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#0099CC",
        id: "__alloyId23"
    });
    $.__views.__alloyId21.add($.__views.__alloyId23);
    $.__views.__alloyId24 = Ti.UI.createButton({
        height: 48,
        width: Ti.UI.FILL,
        top: 5,
        left: 5,
        right: 5,
        color: "#0099CC",
        backgroundColor: "#ffffff",
        title: "Assegno",
        id: "__alloyId24"
    });
    $.__views.__alloyId21.add($.__views.__alloyId24);
    pay ? $.__views.__alloyId24.addEventListener("click", pay) : __defers["$.__views.__alloyId24!click!pay"] = true;
    $.__views.__alloyId25 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#0099CC",
        id: "__alloyId25"
    });
    $.__views.__alloyId21.add($.__views.__alloyId25);
    $.__views.__alloyId26 = Ti.UI.createButton({
        height: 48,
        width: Ti.UI.FILL,
        top: 5,
        left: 5,
        right: 5,
        color: "#0099CC",
        backgroundColor: "#ffffff",
        title: "Bonifico",
        id: "__alloyId26"
    });
    $.__views.__alloyId21.add($.__views.__alloyId26);
    pay ? $.__views.__alloyId26.addEventListener("click", pay) : __defers["$.__views.__alloyId26!click!pay"] = true;
    $.__views.__alloyId27 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#0099CC",
        id: "__alloyId27"
    });
    $.__views.__alloyId21.add($.__views.__alloyId27);
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
    $.__views.table.add($.__views.activityIndicator);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    $.activityIndicator.hide();
    var sobject = "Partita_Aperta__c";
    var accountId = args["accountId"];
    var osname = Ti.Platform.osname, width = (Ti.Platform.version, Ti.Platform.displayCaps.platformHeight, 
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
    rowHeight = IS_TABLET ? 90 : 150;
    var ctrlWidth = 140;
    var amount_to_pay = 0;
    var selected_row_ids = [];
    var selectList = "Id, Name, Data_Documento__c, Data_Scadenza__c, Importo__c, Pagato__c, Scadenza__c, Scaduta__c";
    loadTableData();
    $.table.open();
    var popup_visible = false;
    $.table.addEventListener("close", function() {
        $.destroy();
    });
    __defers["$.__views.backImage!click!closeWindow"] && $.__views.backImage.addEventListener("click", closeWindow);
    __defers["$.__views.__alloyId14!click!showHidePopup"] && $.__views.__alloyId14.addEventListener("click", showHidePopup);
    __defers["$.__views.__alloyId18!click!showHidePopup"] && $.__views.__alloyId18.addEventListener("click", showHidePopup);
    __defers["$.__views.__alloyId22!click!pay"] && $.__views.__alloyId22.addEventListener("click", pay);
    __defers["$.__views.__alloyId24!click!pay"] && $.__views.__alloyId24.addEventListener("click", pay);
    __defers["$.__views.__alloyId26!click!pay"] && $.__views.__alloyId26.addEventListener("click", pay);
    __defers["$.__views.__alloyId28!click!posPay"] && $.__views.__alloyId28.addEventListener("click", posPay);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;