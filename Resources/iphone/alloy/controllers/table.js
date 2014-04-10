function Controller() {
    function loadTableData(sortFilter, visibilityFilter) {
        amount_to_pay = 0;
        switchStatus = {};
        selected_row_ids = [];
        var queryString = "SELECT " + selectList + " FROM " + sobject + " WHERE " + PARTITE.data.Account + ' = "' + accountId + '"';
        visibilityFilter && (queryString += visibilityFilter);
        queryString += sortFilter ? " " + sortFilter : " ORDER BY " + PARTITE.data.Data_Documento + " DESC";
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
                rowId: rowset.fieldByName(PARTITE.data.Id),
                payed: rowset.fieldByName(PARTITE.data.Pagato),
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
                text: rowset.fieldByName(PARTITE.data.Importo) + " EUR"
            });
            vImporto.add(lblLblImporto);
            vImporto.add(lblImporto);
            Ti.API.info("[EasyCashIn] Importo: " + rowset.fieldByName(PARTITE.data.Importo));
            Ti.API.info("[EasyCashIn] Pagato: " + rowset.fieldByName(PARTITE.data.Pagato));
            var lblPayed = Ti.UI.createLabel({
                left: 10,
                top: 10,
                width: ctrlWidth,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 20
                },
                text: getLabelText(rowset.fieldByName(PARTITE.data.Pagato)),
                color: getLabelColor(rowset.fieldByName(PARTITE.data.Pagato))
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
                color: getExpiredLabelColor(rowset.fieldByName(PARTITE.data.Scaduta), rowset.fieldByName(PARTITE.data.Pagato)),
                text: rowset.fieldByName(PARTITE.data.Data_Scadenza)
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
                    fontSize: 14
                },
                color: "#000000",
                text: "Incassa"
            });
            var paySwitch = Ti.UI.createSwitch({
                left: 10,
                value: false,
                rowId: rowset.fieldByName(PARTITE.data.Id),
                amount: rowset.fieldByName(PARTITE.data.Importo)
            });
            IS_ANDROID && paySwitch.setStyle(Ti.UI.Android.SWITCH_STYLE_CHECKBOX);
            paySwitch.addEventListener("change", function(e) {
                Ti.API.info("Switch value: " + e.value);
                var preVal = false;
                switchStatus[e.source.rowId] && (preVal = switchStatus[e.source.rowId]);
                Ti.API.info("Previous value: " + preVal);
                if (preVal != e.value) {
                    if (true == e.value) {
                        Ti.API.info("Switch amount: " + e.source.amount);
                        amount_to_pay += e.source.amount;
                        selected_row_ids.push(e.source.rowId);
                        Ti.API.info("Selected rows: " + selected_row_ids.length);
                    } else if (false == e.value) {
                        amount_to_pay -= e.source.amount;
                        var idx = selected_row_ids.indexOf(e.source.rowId);
                        selected_row_ids.splice(idx, 1);
                        Ti.API.info("Selected rows: " + selected_row_ids.length);
                    }
                    switchStatus[e.source.rowId] = e.value;
                    $.footerTitle.setText("Totale selezionato: " + amount_to_pay + " EUR");
                }
            });
            if (rowset.fieldByName(PARTITE.data.Data_Pagamento)) {
                var payDateView = Ti.UI.createView({
                    left: 10,
                    top: 10,
                    height: Ti.UI.SIZE,
                    width: Ti.UI.SIZE,
                    layout: "vertical"
                });
                var lblLblPayDate = Ti.UI.createLabel({
                    left: 0,
                    top: 0,
                    width: ctrlWidth,
                    height: Ti.UI.SIZE,
                    font: {
                        fontSize: 12
                    },
                    color: "#000000",
                    text: "Data Pagamento"
                });
                var sfdcDate = require("sfdcDate");
                var payDate = sfdcDate.getDateStringFromSFDCDate({
                    sfdcDate: rowset.fieldByName(PARTITE.data.Data_Pagamento)
                });
                var lblPayDate = Ti.UI.createLabel({
                    left: 0,
                    top: 5,
                    width: ctrlWidth,
                    height: Ti.UI.SIZE,
                    font: {
                        fontSize: 20
                    },
                    color: "#000000",
                    text: payDate
                });
                payDateView.add(lblLblPayDate);
                payDateView.add(lblPayDate);
            }
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
                text: rowset.fieldByName(PARTITE.data.Name)
            });
            vDoc.add(lblLblDoc);
            vDoc.add(lblDoc);
            view.add(vDoc);
            payView.add(lblPay);
            payView.add(paySwitch);
            var pdfEnabled = hasPdf(rowset.fieldByName(PARTITE.data.Id));
            var btnPdf = Ti.UI.createButton({
                width: 60,
                height: 60,
                left: 10,
                rowId: rowset.fieldByName(PARTITE.data.Id),
                pdf: pdfEnabled,
                backgroundImage: getPdfImage(pdfEnabled)
            });
            btnPdf.addEventListener("click", function(e) {
                if (e.source.pdf) {
                    $.activityIndicator.setMessage("Loading document");
                    $.activityIndicator.show();
                    var db = Ti.Database.open(Alloy.Globals.dbName);
                    Ti.API.info('[Easy Cash In] QUERY: SELECT Name FROM Attachment WHERE ParentId = "' + e.source.rowId + '" LIMIT 1');
                    var queryString = 'SELECT Name FROM Attachment WHERE ParentId = "' + e.source.rowId + '" LIMIT 1';
                    try {
                        var rowset = db.execute(queryString);
                    } catch (e) {
                        Ti.API.error("[Easy Cash In] Error querying attachment: " + e);
                    }
                    var fileName;
                    if (rowset) {
                        fileName = rowset.fieldByName("Name");
                        rowset.close();
                    }
                    db.close();
                    Ti.API.info("[Easy Cash In] File Name: " + fileName);
                    var f;
                    f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);
                    var fPath = f.getNativePath();
                    Ti.API.info(fPath);
                    if (IS_IOS) {
                        if (fileName) {
                            var docViewer = Ti.UI.iOS.createDocumentViewer({
                                url: fPath
                            });
                            docViewer.show({
                                animated: true
                            });
                        }
                    } else Ti.Android.currentActivity.startActivity(Ti.Android.createIntent({
                        action: Ti.Android.ACTION_VIEW,
                        type: "application/pdf",
                        data: fPath
                    }));
                    $.activityIndicator.hide();
                } else alert("Documento non disponibile");
            });
            view.add(vImporto);
            view.add(vScadenza);
            view.add(lblPayed);
            "false" == rowset.fieldByName(PARTITE.data.Pagato) ? view.add(payView) : view.add(payDateView);
            var needSync = Alloy.Globals.dynaforce.needSync({
                Id: rowset.fieldByName(PARTITE.data.Id)
            });
            view.add(btnPdf);
            if (needSync) {
                var btnSync = Titanium.UI.createView({
                    top: 10,
                    left: 10,
                    width: 40,
                    height: 40,
                    backgroundImage: "/images/not_sync.png",
                    touchEnabled: true,
                    rowId: rowset.fieldByName(PARTITE.data.Id)
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
    function showHidePayPopup() {
        if (0 != amount_to_pay) if (pay_popup_visible) {
            $.pay_popup.hide();
            $.overlay.hide();
            pay_popup_visible = false;
        } else {
            $.pay_popup.show();
            $.overlay.show();
            pay_popup_visible = true;
        } else alert("Non hai selezionato nessuna fattura per eseguire il pagamento");
    }
    function showHideSortPopup() {
        if (sort_popup_visible) {
            $.sort_popup.hide();
            $.overlay.hide();
            sort_popup_visible = false;
        } else {
            $.sort_popup.show();
            $.overlay.show();
            sort_popup_visible = true;
        }
    }
    function showHideVisibilityPopup() {
        if (visibility_popup_visible) {
            $.visibility_popup.hide();
            $.overlay.hide();
            visibility_popup_visible = false;
        } else {
            $.visibility_popup.show();
            $.overlay.show();
            visibility_popup_visible = true;
        }
    }
    function closePopups() {
        var check = false;
        $.overlay.hide();
        if (sort_popup_visible) {
            $.sort_popup.hide();
            sort_popup_visible = false;
            check = true;
        }
        if (pay_popup_visible) {
            $.pay_popup.hide();
            pay_popup_visible = false;
            check = true;
        }
        if (visibility_popup_visible) {
            $.visibility_popup.hide();
            visibility_popup_visible = false;
            check = true;
        }
        return check;
    }
    function pay() {
        $.activityIndicator.setMessage("Perform payment");
        $.activityIndicator.show();
        Ti.API.info("[table] selected rows: " + selected_row_ids);
        for (var i = 0; selected_row_ids.length > i; i++) {
            var sfdcDate = require("sfdcDate");
            var sfdcNow = sfdcDate.createTodaySfdcDate();
            Alloy.Globals.dynaforce.upsertObject({
                sobject: sobject,
                rowId: selected_row_ids[i],
                data: {
                    ATLECI__Pagato__c: true,
                    ATLECI__Data_Pagamento__c: sfdcNow
                },
                error: function() {
                    alert("Payment Error");
                }
            });
        }
        if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
            $.activityIndicator.setMessage("Sync Data to server");
            Alloy.Globals.dynaforce.pushDataToServer({
                success: function() {
                    Ti.API.info("[table] push data SUCCESS");
                    showHidePayPopup();
                    loadTableData();
                    Alloy.Globals.dynaforce.setChanges();
                    $.activityIndicator.hide();
                }
            });
        } else {
            showHidePayPopup();
            loadTableData();
            $.activityIndicator.hide();
        }
    }
    function posPay() {
        var mposView = Alloy.createController("mpos", {
            amount: amount_to_pay,
            rowids: selected_row_ids
        }).getView();
        mposView.open();
    }
    function getExpiredLabelColor(expired, payed) {
        return "false" == payed ? "true" == expired ? "#CC0000" : "#000000" : "#000000";
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
    function showSortOptions() {
        $.sortOptions.show();
    }
    function changeSortMode() {
        if ("ASC" == sortMode) {
            $.sortModeButton.setBackgroundImage("/images/descending.png");
            sortMode = "DESC";
        } else {
            $.sortModeButton.setBackgroundImage("/images/ascending.png");
            sortMode = "ASC";
        }
    }
    function setHidePayed(e) {
        f_payed = e.value;
    }
    function setNotHidePayed(e) {
        f_notPayed = e.value;
    }
    function setExpired(e) {
        f_expired = e.value;
    }
    function setNotExpired(e) {
        f_notExpired = e.value;
    }
    function applyFilters() {
        var sorting = null;
        curOpt && (sorting = "ORDER BY " + curOpt + " " + sortMode);
        var visibility = "";
        f_payed || (visibility += " AND " + PARTITE.data.Pagato + ' = "false"');
        f_notPayed || (visibility += " AND " + PARTITE.data.Pagato + ' = "true"');
        f_expired || (visibility += " AND " + PARTITE.data.Scaduta + ' = "false"');
        f_notExpired || (visibility += " AND " + PARTITE.data.Scaduta + ' = "true"');
        loadTableData(sorting, visibility);
        closePopups();
    }
    function getPdfImage(enabled) {
        return enabled ? "/images/pdf.png" : "/images/pdf_dis.png";
    }
    function hasPdf(id) {
        var check = false;
        if (id) {
            var db = Ti.Database.open(Alloy.Globals.dbName);
            var queryString = 'SELECT Id FROM Attachment WHERE ParentId = "' + id + '"';
            try {
                var rowset = db.execute(queryString);
            } catch (e) {
                Ti.API.error("Exception controlling attachments: " + e);
            }
            if (rowset) {
                rowset.rowCount > 0 && (check = true);
                rowset.close();
            }
            db.close();
        }
        return check;
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
        orientationModes: Alloy.Globals.orientations,
        navBarHidden: "true",
        id: "table"
    });
    $.__views.table && $.addTopLevelView($.__views.table);
    $.__views.__alloyId20 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId20"
    });
    $.__views.table.add($.__views.__alloyId20);
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
    $.__views.__alloyId20.add($.__views.backImage);
    closeWindow ? $.__views.backImage.addEventListener("click", closeWindow) : __defers["$.__views.backImage!click!closeWindow"] = true;
    $.__views.headerTitle = Ti.UI.createLabel({
        left: "60dp",
        color: "#fff",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "Partite",
        id: "headerTitle"
    });
    $.__views.__alloyId20.add($.__views.headerTitle);
    $.__views.seeImage = Ti.UI.createButton({
        right: 110,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/eye.png",
        backgroundFocusedImage: "/images/eye_on.png",
        backgroundSelectedImage: "/images/eye_on.png",
        id: "seeImage"
    });
    $.__views.__alloyId20.add($.__views.seeImage);
    showHideVisibilityPopup ? $.__views.seeImage.addEventListener("click", showHideVisibilityPopup) : __defers["$.__views.seeImage!click!showHideVisibilityPopup"] = true;
    $.__views.sortImage = Ti.UI.createButton({
        right: 60,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/sort.png",
        backgroundFocusedImage: "/images/sort_on.png",
        backgroundSelectedImage: "/images/sort_on.png",
        id: "sortImage"
    });
    $.__views.__alloyId20.add($.__views.sortImage);
    showHideSortPopup ? $.__views.sortImage.addEventListener("click", showHideSortPopup) : __defers["$.__views.sortImage!click!showHideSortPopup"] = true;
    $.__views.payImage = Ti.UI.createButton({
        right: 10,
        width: 40,
        height: 40,
        backgroundColor: "transparent",
        backgroundImage: "/images/incassa.png",
        backgroundFocusedImage: "/images/incassa_on.png",
        backgroundSelectedImage: "/images/incassa_on.png",
        id: "payImage"
    });
    $.__views.__alloyId20.add($.__views.payImage);
    showHidePayPopup ? $.__views.payImage.addEventListener("click", showHidePayPopup) : __defers["$.__views.payImage!click!showHidePayPopup"] = true;
    $.__views.__alloyId21 = Ti.UI.createView({
        backgroundColor: "#e2f0b6",
        height: 40,
        width: Ti.UI.FILL,
        top: Alloy.Globals.tableTop,
        id: "__alloyId21"
    });
    $.__views.table.add($.__views.__alloyId21);
    $.__views.accountName = Ti.UI.createLabel({
        color: "#000000",
        top: 10,
        left: 10,
        font: {
            fontSize: "15sp",
            fontWeight: "bold"
        },
        id: "accountName"
    });
    $.__views.__alloyId21.add($.__views.accountName);
    $.__views.tblView = Ti.UI.createTableView({
        top: Alloy.Globals.tableTopWithTableHeader,
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
    closePopups ? $.__views.overlay.addEventListener("click", closePopups) : __defers["$.__views.overlay!click!closePopups"] = true;
    $.__views.pay_popup = Ti.UI.createView({
        width: 300,
        height: Ti.UI.SIZE,
        backgroundColor: "#ffffff",
        opacity: 1,
        id: "pay_popup",
        visible: "false"
    });
    $.__views.table.add($.__views.pay_popup);
    $.__views.__alloyId22 = Ti.UI.createView({
        width: Ti.UI.FILL,
        top: 0,
        height: 55,
        layout: "vertical",
        id: "__alloyId22"
    });
    $.__views.pay_popup.add($.__views.__alloyId22);
    $.__views.__alloyId23 = Ti.UI.createView({
        height: "52dp",
        width: Ti.UI.FILL,
        id: "__alloyId23"
    });
    $.__views.__alloyId22.add($.__views.__alloyId23);
    $.__views.popupTitle = Ti.UI.createLabel({
        left: 10,
        color: "#0099CC",
        font: {
            fontSize: "15sp",
            fontWeight: "bold"
        },
        text: "Metodo di pagamento",
        id: "popupTitle"
    });
    $.__views.__alloyId23.add($.__views.popupTitle);
    $.__views.__alloyId24 = Ti.UI.createView({
        right: 10,
        width: 40,
        height: 40,
        id: "__alloyId24"
    });
    $.__views.__alloyId23.add($.__views.__alloyId24);
    showHidePayPopup ? $.__views.__alloyId24.addEventListener("click", showHidePayPopup) : __defers["$.__views.__alloyId24!click!showHidePayPopup"] = true;
    $.__views.__alloyId25 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        image: "/images/close_blue.png",
        id: "__alloyId25"
    });
    $.__views.__alloyId24.add($.__views.__alloyId25);
    $.__views.__alloyId26 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 2,
        backgroundColor: "#0099CC",
        id: "__alloyId26"
    });
    $.__views.__alloyId22.add($.__views.__alloyId26);
    $.__views.__alloyId27 = Ti.UI.createView({
        top: 55,
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        layout: "vertical",
        id: "__alloyId27"
    });
    $.__views.pay_popup.add($.__views.__alloyId27);
    $.__views.__alloyId28 = Ti.UI.createButton({
        height: 48,
        width: Ti.UI.FILL,
        top: 5,
        left: 5,
        right: 5,
        color: "#0099CC",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#d6d6d6",
        backgroundFocusedColor: "#d6d6d6",
        title: "Contanti",
        id: "__alloyId28"
    });
    $.__views.__alloyId27.add($.__views.__alloyId28);
    pay ? $.__views.__alloyId28.addEventListener("click", pay) : __defers["$.__views.__alloyId28!click!pay"] = true;
    $.__views.__alloyId29 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#0099CC",
        id: "__alloyId29"
    });
    $.__views.__alloyId27.add($.__views.__alloyId29);
    $.__views.__alloyId30 = Ti.UI.createButton({
        height: 48,
        width: Ti.UI.FILL,
        top: 5,
        left: 5,
        right: 5,
        color: "#0099CC",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#d6d6d6",
        backgroundFocusedColor: "#d6d6d6",
        title: "Assegno",
        id: "__alloyId30"
    });
    $.__views.__alloyId27.add($.__views.__alloyId30);
    pay ? $.__views.__alloyId30.addEventListener("click", pay) : __defers["$.__views.__alloyId30!click!pay"] = true;
    $.__views.__alloyId31 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#0099CC",
        id: "__alloyId31"
    });
    $.__views.__alloyId27.add($.__views.__alloyId31);
    $.__views.sort_popup = Ti.UI.createView({
        width: Alloy.Globals.popupWidth,
        height: Ti.UI.SIZE,
        backgroundColor: "#6dcaec",
        layout: "vertical",
        id: "sort_popup",
        visible: "false"
    });
    $.__views.table.add($.__views.sort_popup);
    $.__views.__alloyId33 = Ti.UI.createLabel({
        left: "10dp",
        color: "#ffffff",
        height: "40dp",
        font: {
            fontSize: "16sp",
            fontWeight: "bold"
        },
        text: "Ordinamento",
        id: "__alloyId33"
    });
    $.__views.sort_popup.add($.__views.__alloyId33);
    $.__views.__alloyId34 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#ffffff",
        id: "__alloyId34"
    });
    $.__views.sort_popup.add($.__views.__alloyId34);
    $.__views.__alloyId35 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId35"
    });
    $.__views.sort_popup.add($.__views.__alloyId35);
    $.__views.__alloyId36 = Ti.UI.createLabel({
        color: "#000000",
        left: "10",
        width: "50%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Ordina per",
        id: "__alloyId36"
    });
    $.__views.__alloyId35.add($.__views.__alloyId36);
    $.__views.sortFieldButton = Ti.UI.createButton({
        color: "#ffffff",
        backgroundColor: "#0099cc",
        backgroundSelectedColor: "#ffffff",
        backgroundFocusedColor: "#ffffff",
        height: Ti.UI.FILL,
        width: "45%",
        borderWidth: 5,
        borderColor: "#6dcaec",
        font: {
            fontSize: "15sp"
        },
        title: "Scegli",
        id: "sortFieldButton"
    });
    $.__views.__alloyId35.add($.__views.sortFieldButton);
    showSortOptions ? $.__views.sortFieldButton.addEventListener("click", showSortOptions) : __defers["$.__views.sortFieldButton!click!showSortOptions"] = true;
    $.__views.__alloyId37 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId37"
    });
    $.__views.sort_popup.add($.__views.__alloyId37);
    $.__views.__alloyId38 = Ti.UI.createLabel({
        color: "#000000",
        left: "10",
        width: "50%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Modalità",
        id: "__alloyId38"
    });
    $.__views.__alloyId37.add($.__views.__alloyId38);
    $.__views.sortModeButton = Ti.UI.createButton({
        width: 45,
        height: 45,
        backgroundImage: "/images/ascending.png",
        borderWidth: 5,
        borderColor: "#6dcaec",
        id: "sortModeButton"
    });
    $.__views.__alloyId37.add($.__views.sortModeButton);
    changeSortMode ? $.__views.sortModeButton.addEventListener("click", changeSortMode) : __defers["$.__views.sortModeButton!click!changeSortMode"] = true;
    $.__views.__alloyId39 = Ti.UI.createView({
        layout: "horizontal",
        height: 40,
        width: Ti.UI.FILL,
        id: "__alloyId39"
    });
    $.__views.sort_popup.add($.__views.__alloyId39);
    $.__views.__alloyId40 = Ti.UI.createButton({
        color: "#000000",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#6dcaec",
        backgroundFocusedColor: "#6dcaec",
        height: Ti.UI.FILL,
        width: "50%",
        borderWidth: 5,
        borderColor: "#6dcaec",
        title: "Annulla",
        id: "__alloyId40"
    });
    $.__views.__alloyId39.add($.__views.__alloyId40);
    closePopups ? $.__views.__alloyId40.addEventListener("click", closePopups) : __defers["$.__views.__alloyId40!click!closePopups"] = true;
    $.__views.__alloyId41 = Ti.UI.createButton({
        color: "#000000",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#6dcaec",
        backgroundFocusedColor: "#6dcaec",
        height: Ti.UI.FILL,
        width: "50%",
        borderWidth: 5,
        borderColor: "#6dcaec",
        title: "Ok",
        id: "__alloyId41"
    });
    $.__views.__alloyId39.add($.__views.__alloyId41);
    applyFilters ? $.__views.__alloyId41.addEventListener("click", applyFilters) : __defers["$.__views.__alloyId41!click!applyFilters"] = true;
    var __alloyId43 = [];
    __alloyId43.push("Data Documento");
    __alloyId43.push("Data Scadenza");
    __alloyId43.push("Importo");
    __alloyId43.push("Data Pagamento");
    $.__views.sortOptions = Ti.UI.createOptionDialog({
        options: __alloyId43,
        id: "sortOptions",
        title: "Ordina Per"
    });
    $.__views.visibility_popup = Ti.UI.createView({
        width: Alloy.Globals.popupWidth,
        height: Ti.UI.SIZE,
        backgroundColor: "#6dcaec",
        layout: "vertical",
        id: "visibility_popup",
        visible: "false"
    });
    $.__views.table.add($.__views.visibility_popup);
    $.__views.__alloyId48 = Ti.UI.createLabel({
        left: "10dp",
        color: "#ffffff",
        height: "40dp",
        font: {
            fontSize: "16sp",
            fontWeight: "bold"
        },
        text: "Visualizza",
        id: "__alloyId48"
    });
    $.__views.visibility_popup.add($.__views.__alloyId48);
    $.__views.__alloyId49 = Ti.UI.createView({
        height: 1,
        width: Ti.UI.FILL,
        left: 10,
        right: 10,
        backgroundColor: "#ffffff",
        id: "__alloyId49"
    });
    $.__views.visibility_popup.add($.__views.__alloyId49);
    $.__views.__alloyId50 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId50"
    });
    $.__views.visibility_popup.add($.__views.__alloyId50);
    $.__views.__alloyId51 = Ti.UI.createLabel({
        top: 5,
        color: "#000000",
        left: "10",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Pagate",
        id: "__alloyId51"
    });
    $.__views.__alloyId50.add($.__views.__alloyId51);
    $.__views.hidePayed = Ti.UI.createSwitch({
        top: 5,
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        value: true,
        id: "hidePayed"
    });
    $.__views.__alloyId50.add($.__views.hidePayed);
    setHidePayed ? $.__views.hidePayed.addEventListener("change", setHidePayed) : __defers["$.__views.hidePayed!change!setHidePayed"] = true;
    $.__views.__alloyId52 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId52"
    });
    $.__views.visibility_popup.add($.__views.__alloyId52);
    $.__views.__alloyId53 = Ti.UI.createLabel({
        top: 5,
        color: "#000000",
        left: "10",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Non pagate",
        id: "__alloyId53"
    });
    $.__views.__alloyId52.add($.__views.__alloyId53);
    $.__views.hideNotPayed = Ti.UI.createSwitch({
        top: 5,
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        value: true,
        id: "hideNotPayed"
    });
    $.__views.__alloyId52.add($.__views.hideNotPayed);
    setNotHidePayed ? $.__views.hideNotPayed.addEventListener("change", setNotHidePayed) : __defers["$.__views.hideNotPayed!change!setNotHidePayed"] = true;
    $.__views.__alloyId54 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId54"
    });
    $.__views.visibility_popup.add($.__views.__alloyId54);
    $.__views.__alloyId55 = Ti.UI.createLabel({
        top: 5,
        color: "#000000",
        left: "10",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Scadute",
        id: "__alloyId55"
    });
    $.__views.__alloyId54.add($.__views.__alloyId55);
    $.__views.hideExpired = Ti.UI.createSwitch({
        top: 5,
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        value: true,
        id: "hideExpired"
    });
    $.__views.__alloyId54.add($.__views.hideExpired);
    setExpired ? $.__views.hideExpired.addEventListener("change", setExpired) : __defers["$.__views.hideExpired!change!setExpired"] = true;
    $.__views.__alloyId56 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        layout: "horizontal",
        id: "__alloyId56"
    });
    $.__views.visibility_popup.add($.__views.__alloyId56);
    $.__views.__alloyId57 = Ti.UI.createLabel({
        top: 5,
        color: "#000000",
        left: "10",
        width: "70%",
        height: Ti.UI.SIZE,
        font: {
            fontSize: "15sp"
        },
        text: "Non scadute",
        id: "__alloyId57"
    });
    $.__views.__alloyId56.add($.__views.__alloyId57);
    $.__views.hideNotExpired = Ti.UI.createSwitch({
        top: 5,
        height: Ti.UI.SIZE,
        width: Ti.UI.SIZE,
        value: true,
        id: "hideNotExpired"
    });
    $.__views.__alloyId56.add($.__views.hideNotExpired);
    setNotExpired ? $.__views.hideNotExpired.addEventListener("change", setNotExpired) : __defers["$.__views.hideNotExpired!change!setNotExpired"] = true;
    $.__views.__alloyId58 = Ti.UI.createView({
        layout: "horizontal",
        height: 40,
        width: Ti.UI.FILL,
        id: "__alloyId58"
    });
    $.__views.visibility_popup.add($.__views.__alloyId58);
    $.__views.__alloyId59 = Ti.UI.createButton({
        color: "#000000",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#6dcaec",
        backgroundFocusedColor: "#6dcaec",
        height: Ti.UI.FILL,
        width: "50%",
        borderWidth: 5,
        borderColor: "#6dcaec",
        title: "Annulla",
        id: "__alloyId59"
    });
    $.__views.__alloyId58.add($.__views.__alloyId59);
    closePopups ? $.__views.__alloyId59.addEventListener("click", closePopups) : __defers["$.__views.__alloyId59!click!closePopups"] = true;
    $.__views.__alloyId60 = Ti.UI.createButton({
        color: "#000000",
        backgroundColor: "#ffffff",
        backgroundSelectedColor: "#6dcaec",
        backgroundFocusedColor: "#6dcaec",
        height: Ti.UI.FILL,
        width: "50%",
        borderWidth: 5,
        borderColor: "#6dcaec",
        title: "Ok",
        id: "__alloyId60"
    });
    $.__views.__alloyId58.add($.__views.__alloyId60);
    applyFilters ? $.__views.__alloyId60.addEventListener("click", applyFilters) : __defers["$.__views.__alloyId60!click!applyFilters"] = true;
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
    var PARTITE = require("datamodel/partite");
    var sobject = PARTITE.sobject;
    var accountId = args["accountId"];
    var accountName = "";
    var db = Ti.Database.open(Alloy.Globals.dbName);
    try {
        var rowset = db.execute('SELECT Name FROM Account WHERE Id="' + accountId + '" LIMIT 1');
    } catch (e) {
        Ti.API.error("[Easy Cash In] Exception getting account name with ID " + accountId + ": " + e);
    }
    if (rowset) {
        while (rowset.isValidRow()) {
            accountName = rowset.fieldByName("Name");
            rowset.next();
        }
        rowset.close();
    }
    db.close();
    $.accountName.setText(accountName);
    var switchStatus = {};
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
    var ctrlWidth = 140;
    var rowHeight;
    if (IS_TABLET) {
        rowHeight = 90;
        ctrlWidth = 180;
    } else rowHeight = 200;
    var amount_to_pay = 0;
    var selected_row_ids = [];
    var selectList = PARTITE.data.Id + ", " + PARTITE.data.Name + ", " + PARTITE.data.Data_Documento + ", " + PARTITE.data.Data_Scadenza + ", " + PARTITE.data.Importo + ", " + PARTITE.data.Pagato + ", " + PARTITE.data.Scadenza + ", " + PARTITE.data.Scaduta + ", " + PARTITE.data.Data_Pagamento;
    loadTableData(null, null);
    $.table.open();
    var pay_popup_visible = false;
    var sort_popup_visible = false;
    var visibility_popup_visible = false;
    $.table.addEventListener("focus", function() {
        var pay_status = Ti.App.Properties.getString("mpos.payok");
        if (pay_status && "true" == pay_status) {
            if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
                $.activityIndicator.setMessage("Sync Data to server");
                Alloy.Globals.dynaforce.pushDataToServer({
                    success: function() {
                        Ti.API.info("[table] push data SUCCESS");
                        showHidePayPopup();
                        loadTableData();
                        Alloy.Globals.dynaforce.setChanges();
                        $.activityIndicator.hide();
                    }
                });
            } else {
                showHidePayPopup();
                loadTableData();
                $.activityIndicator.hide();
            }
            Ti.App.Properties.setString("mpos.payok", "false");
        }
    });
    var sortOpts = [ {
        label: "Data Documento",
        field: PARTITE.data.Data_Documento
    }, {
        label: "Data Scadenza",
        field: PARTITE.data.Data_Scadenza
    }, {
        label: "Importo",
        field: PARTITE.data.Importo
    }, {
        label: "Data Pagamento",
        field: PARTITE.data.Data_Pagamento
    } ];
    var curOpt = null;
    var sortMode = "ASC";
    $.sortOptions.addEventListener("click", function(e) {
        var idx = e.index;
        var obj = sortOpts[idx];
        if (obj) {
            $.sortFieldButton.setTitle(obj.label);
            curOpt = obj.field;
        }
    });
    var f_payed = true;
    var f_notPayed = true;
    var f_expired = true;
    var f_notExpired = true;
    $.table.addEventListener("android:back", function() {
        Ti.API.info("[Easy Cash In] android back pressed");
        closePopups() || $.table.close();
    });
    $.table.addEventListener("close", function() {
        $.destroy();
    });
    __defers["$.__views.backImage!click!closeWindow"] && $.__views.backImage.addEventListener("click", closeWindow);
    __defers["$.__views.seeImage!click!showHideVisibilityPopup"] && $.__views.seeImage.addEventListener("click", showHideVisibilityPopup);
    __defers["$.__views.sortImage!click!showHideSortPopup"] && $.__views.sortImage.addEventListener("click", showHideSortPopup);
    __defers["$.__views.payImage!click!showHidePayPopup"] && $.__views.payImage.addEventListener("click", showHidePayPopup);
    __defers["$.__views.overlay!click!closePopups"] && $.__views.overlay.addEventListener("click", closePopups);
    __defers["$.__views.__alloyId24!click!showHidePayPopup"] && $.__views.__alloyId24.addEventListener("click", showHidePayPopup);
    __defers["$.__views.__alloyId28!click!pay"] && $.__views.__alloyId28.addEventListener("click", pay);
    __defers["$.__views.__alloyId30!click!pay"] && $.__views.__alloyId30.addEventListener("click", pay);
    __defers["$.__views.__alloyId32!click!posPay"] && $.__views.__alloyId32.addEventListener("click", posPay);
    __defers["$.__views.sortFieldButton!click!showSortOptions"] && $.__views.sortFieldButton.addEventListener("click", showSortOptions);
    __defers["$.__views.sortModeButton!click!changeSortMode"] && $.__views.sortModeButton.addEventListener("click", changeSortMode);
    __defers["$.__views.__alloyId40!click!closePopups"] && $.__views.__alloyId40.addEventListener("click", closePopups);
    __defers["$.__views.__alloyId41!click!applyFilters"] && $.__views.__alloyId41.addEventListener("click", applyFilters);
    __defers["$.__views.hidePayed!change!setHidePayed"] && $.__views.hidePayed.addEventListener("change", setHidePayed);
    __defers["$.__views.hideNotPayed!change!setNotHidePayed"] && $.__views.hideNotPayed.addEventListener("change", setNotHidePayed);
    __defers["$.__views.hideExpired!change!setExpired"] && $.__views.hideExpired.addEventListener("change", setExpired);
    __defers["$.__views.hideNotExpired!change!setNotExpired"] && $.__views.hideNotExpired.addEventListener("change", setNotExpired);
    __defers["$.__views.__alloyId59!click!closePopups"] && $.__views.__alloyId59.addEventListener("click", closePopups);
    __defers["$.__views.__alloyId60!click!applyFilters"] && $.__views.__alloyId60.addEventListener("click", applyFilters);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;