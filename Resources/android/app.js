var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Alloy.Globals.force = require("force");

Alloy.Globals.dynaforce = require("dynaforce");

Alloy.Globals.dbName = "appDb";

Alloy.Globals.buttonSize = 140;

Alloy.Globals.buttonRadius = Alloy.Globals.buttonSize / 2;

Alloy.Globals.buttonRadius = Alloy.Globals.buttonSize;

Alloy.Globals.style;

Alloy.Globals.style = Ti.UI.ActivityIndicatorStyle.PLAIN;

Alloy.Globals.top = 0;

Alloy.Globals.tableTop = "50dp";

Alloy.Globals.tableTopWithTableHeader = "90dp";

try {} catch (e) {}

var osname = "android", version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;

var IS_TABLET = "ipad" === osname || "android" === osname && width > 900;

Alloy.Globals.popupWidth = "90%";

Alloy.Globals.orientations = [ Ti.UI.PORTRAIT ];

Alloy.Globals.detailBlockWidth = "95%";

Alloy.Globals.detailWrapperOrientation = "vertical";

if (IS_TABLET) {
    Alloy.Globals.popupWidth = "50%";
    Alloy.Globals.orientations = [ Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT ];
    Alloy.Globals.detailBlockWidth = "33%";
    Alloy.Globals.detailWrapperOrientation = "horizontal";
}

Alloy.createController("index");