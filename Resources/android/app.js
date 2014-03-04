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

try {} catch (e) {}

Alloy.createController("index");