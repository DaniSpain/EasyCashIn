function Controller() {
    function showIndicator() {
        $.activityIndicator.setMessage("Validate User Credentials");
        $.activityIndicator.show();
    }
    function openAccountList() {
        $.activityIndicator.setMessage("Reading Account Data");
        $.activityIndicator.show();
        var listView = Alloy.createController("list", {
            sobject: "Account"
        }).getView();
        listView.open();
        $.activityIndicator.hide();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "#ffffff",
        navBarHidden: "true",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    showIndicator ? $.__views.index.addEventListener("open", showIndicator) : __defers["$.__views.index!open!showIndicator"] = true;
    $.__views.__alloyId0 = Ti.UI.createView({
        top: Alloy.Globals.top,
        height: "50dp",
        width: Ti.UI.FILL,
        backgroundColor: "#669900",
        id: "__alloyId0"
    });
    $.__views.index.add($.__views.__alloyId0);
    $.__views.__alloyId1 = Ti.UI.createView({
        left: 10,
        width: 40,
        height: 40,
        id: "__alloyId1"
    });
    $.__views.__alloyId0.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createImageView({
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        color: "#fff",
        backgroundColor: "transparent",
        image: "/images/icon.png",
        touchEnabled: false,
        id: "__alloyId2"
    });
    $.__views.__alloyId1.add($.__views.__alloyId2);
    $.__views.headerTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#fff",
        left: "60dp",
        font: {
            fontSize: "20sp",
            fontWeight: "bold"
        },
        text: "EasyCashIn",
        id: "headerTitle"
    });
    $.__views.__alloyId0.add($.__views.headerTitle);
    $.__views.content = Ti.UI.createView({
        top: Alloy.Globals.tableTop,
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "#33B5E5",
        id: "content"
    });
    $.__views.index.add($.__views.content);
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
    $.__views.content.add($.__views.activityIndicator);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    Alloy.Globals.dynaforce.init();
    if (Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) Alloy.Globals.force.authorize({
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
                            $.activityIndicator.setMessage("Downloading Images");
                            Alloy.Globals.dynaforce.downloadImages({
                                success: function() {
                                    $.activityIndicator.hide();
                                    openAccountList();
                                    $.index.close();
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
            openAccountList();
            $.index.close();
        },
        cancel: function() {
            Ti.API.info("cancel");
        }
    }); else {
        alert("No nework connection, working offline");
        $.activityIndicator.hide();
        openAccountList();
        $.index.close();
    }
    __defers["$.__views.index!open!showIndicator"] && $.__views.index.addEventListener("open", showIndicator);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;