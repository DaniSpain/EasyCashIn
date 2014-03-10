function retrieveImageList(table) {
    var imageList = new Array();
    var db = Ti.Database.open(Alloy.Globals.dbName);
    Ti.API.info("[dynaforce] SELECT * FROM " + table + ";");
    var rowset;
    try {
        rowset = db.execute("SELECT * FROM " + table + ";");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception retrieving " + table + " rows: " + e);
    }
    while (rowset.isValidRow()) {
        var rendering = rowset.fieldByName("rendering");
        if ("image" == rendering) {
            var field = rowset.fieldByName("field");
            var sobject = rowset.fieldByName("sobject");
            Ti.API.info("[dynaforce]  SELECT Id," + field + " FROM " + sobject + ";");
            var fieldset;
            try {
                fieldset = db.execute("SELECT Id," + field + " FROM " + sobject + ";");
            } catch (e) {
                Ti.API.error("[dynaforce]  Exception retrieving " + sobject + " rows: " + e);
            }
            while (fieldset.isValidRow()) {
                var imgUrl = fieldset.fieldByName(field);
                imageList.push({
                    id: fieldset.fieldByName("Id"),
                    url: imgUrl,
                    downloaded: false
                });
                fieldset.next();
            }
            fieldset.close();
        }
        rowset.next();
    }
    rowset.close();
    for (var i = 0; imageList.length > i; i++) {
        Ti.API.info("[dynaforce] imageList id: " + imageList[i].id);
        Ti.API.info("[dynaforce] imageList url: " + imageList[i].url);
    }
    JSONImages = imageList;
}

var LAST_SYNC = Ti.App.Properties.getString("dynaforce.lastSync");

var LOCAL_CHANGES = false;

exports.LIST_LAYOUT_TABLE = "ListLayout";

exports.DETAIL_LAYOUT_TABLE = "DetailLayout";

exports.SYNC_TABLE = "Sync";

exports.SYNCFIELD_TABLE = "SyncField";

exports.RELATIONSHIP_TABLE = "Relationship";

var JSONImages = new Array();

var SFDCSQLiteFieldMap = {
    string: "TEXT",
    "boolean": "BOOLEAN",
    textarea: "TEXT",
    "double": "DOUBLE",
    phone: "TEXT",
    url: "TEXT",
    currency: "DOUBLE",
    "int": "INTEGER",
    datetime: "DATETIME",
    date: "DATE",
    picklist: "TEXT",
    email: "TEXT",
    reference: "TEXT"
};

var operation = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2
};

var sobjectSync = [ {
    sobject: "Account",
    synched: false
}, {
    sobject: "Partita_Aperta__c",
    synched: false
}, {
    sobject: "History__c",
    synched: false
} ];

exports.init = function() {
    var db = Ti.Database.open(Alloy.Globals.dbName);
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS ObjectFieldMap (field TEXT, sfdctype TEXT, sobject TEXT, label TEXT, isUsed BOOLEAN,  PRIMARY KEY(field, sobject));");
    try {
        db.execute("CREATE TABLE IF NOT EXISTS ObjectFieldMap (field TEXT, sfdctype TEXT, sobject TEXT, label TEXT, isUsed BOOLEAN,  PRIMARY KEY(field, sobject));");
        Ti.API.info("[dynaforce] Table ObjectFieldMap SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating ObjectFieldMap table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS Picklist(value TEXT, field TEXT, sobject TEXT, label TEXT,  PRIMARY KEY(field, sobject));");
    try {
        db.execute("CREATE TABLE IF NOT EXISTS Picklist(value TEXT, field TEXT, sobject TEXT, label TEXT,  PRIMARY KEY(field, sobject));");
        Ti.API.info("[dynaforce] Table Picklist SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating Picklist table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS DetailLayout(position TINYINT, field TEXT, sobject TEXT, rendering TEXT,  PRIMARY KEY(position, sobject) ON CONFLICT REPLACE);");
    try {
        db.execute("DROP TABLE IF EXISTS DetailLayout");
        db.execute("CREATE TABLE IF NOT EXISTS DetailLayout(position TINYINT, field TEXT, sobject TEXT, rendering TEXT,  PRIMARY KEY(position, sobject));");
        Ti.API.info("[dynaforce] Table DetailLayout SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating DetailLayout table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS ListLayout(position TINYINT, field TEXT, sobject TEXT,  PRIMARY KEY(position, sobject));");
    try {
        db.execute("DROP TABLE IF EXISTS ListLayout");
        db.execute("CREATE TABLE IF NOT EXISTS ListLayout(position TINYINT, field TEXT, sobject TEXT, rendering TEXT,  PRIMARY KEY(position, sobject));");
        Ti.API.info("[dynaforce] Table ListLayout SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating ListLayout table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS " + exports.RELATIONSHIP_TABLE + "(field TEXT, sobject TEXT, relatedObject TEXT, " + " PRIMARY KEY(field, sobject));");
    try {
        db.execute("CREATE TABLE IF NOT EXISTS " + exports.RELATIONSHIP_TABLE + "(field TEXT, sobject TEXT, relatedObject TEXT, " + " PRIMARY KEY(field, sobject));");
        Ti.API.info("[dynaforce] Table " + exports.RELATIONSHIP_TABLE + " SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating " + exports.RELATIONSHIP_TABLE + " table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS " + exports.SYNC_TABLE + " (rowId TEXT, sobject TEXT, timestamp DATETIME, " + " PRIMARY KEY(rowId, sobject));");
    try {
        db.execute("CREATE TABLE IF NOT EXISTS " + exports.SYNC_TABLE + " (rowId TEXT, sobject TEXT, timestamp DATETIME, operation INTEGER, " + " PRIMARY KEY(rowId, sobject));");
        Ti.API.info("[dynaforce] Table Sync SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating Sync table: " + e);
    }
    Ti.API.info("[dynaforce] CREATE TABLE IF NOT EXISTS " + exports.SYNCFIELD_TABLE + " (field TEXT, value TEXT, sobject TEXT, rowId TEXT, " + " PRIMARY KEY(field, rowId));");
    try {
        db.execute("CREATE TABLE IF NOT EXISTS " + exports.SYNCFIELD_TABLE + " (field TEXT, value TEXT, sobject TEXT, rowId TEXT, " + " PRIMARY KEY(field, rowId));");
        Ti.API.info("[dynaforce] Table " + exports.SYNCFIELD_TABLE + " SUCCESSFULLY CREATED");
    } catch (e) {
        Ti.API.error("[dynaforce] Exception creating " + exports.SYNCFIELD_TABLE + " table: " + e);
    }
    db.close();
};

exports.resetSync = function() {
    Ti.API.info("[dynaforce] Resetting Sync JSON");
    for (var i = 0; sobjectSync.length > i; i++) {
        var row = sobjectSync[i];
        Ti.API.info("[dynaforce] " + JSON.stringify(sobjectSync[i]));
        row.synched = false;
    }
    Ti.API.info("[dynaforce] " + JSON.stringify(sobjectSync));
};

exports.syncLayoutConf = function(callbacks) {
    callbacks.indicator.setMessage("Sync List Layout Configuration");
    syncListLayoutConf({
        success: function() {
            callbacks.indicator.setMessage("Sync Detail Layout Configuration");
            syncDetailLayoutConf({
                success: callbacks.success()
            });
        }
    });
};

syncListLayoutConf = function(callbacks) {
    var layoutObject = "Layout_Configurator__c";
    var localObject = "ListLayout";
    var queryString = "SELECT Field_Name__c, Object__c, Order__c, Rendering__c, IsDeleted FROM " + layoutObject;
    Alloy.Globals.force.request({
        type: "GET",
        url: "/query/?q=" + Ti.Network.encodeURIComponent(queryString),
        callback: function(data) {
            var db = Ti.Database.open(Alloy.Globals.dbName);
            Ti.API.info("[dynaforce] DATA: " + JSON.stringify(data));
            var records = data.records;
            for (var i = 0; records.length > i; i++) {
                Ti.API.info("[dynaforce] RECORD: " + JSON.stringify(records[i]));
                var record = records[i];
                if (true != record.IsDeleted) {
                    Ti.API.info("[dynaforce] INSERT OR REPLACE INTO " + localObject + ' VALUES ("' + record.Order__c + '", "' + record.Field_Name__c + '", "' + record.Object__c + '", "' + record.Rendering__c + '");');
                    try {
                        db.execute("INSERT OR REPLACE INTO " + localObject + ' VALUES ("' + record.Order__c + '", "' + record.Field_Name__c + '", "' + record.Object__c + '", "' + record.Rendering__c + '");');
                    } catch (e) {
                        Ti.API.error("[dynaforce] exception inserting data in " + localObject + " table: " + e);
                    }
                } else {
                    Ti.API.info("[dynaforce] RECORD is DELETED: removing from local DB");
                    Ti.API.info("[dynaforce] DELETE FROM " + localObject + ' WHERE (position = "' + record.Order__c + '" AND sobject = "' + record.Object__c + '");');
                    try {
                        db.execute("DELETE FROM " + localObject + ' WHERE (position = "' + record.Order__c + '" AND sobject = "' + record.Object__c + '");');
                    } catch (e) {
                        Ti.API.info("[dynaforce] Exception deleting row: " + e);
                    }
                }
            }
            db.close;
            Ti.API.info("[dynaforce] ListLayout UPDATED");
            callbacks.success();
        }
    });
};

syncDetailLayoutConf = function(callbacks) {
    var layoutObject = "Detail_Layout__c";
    var localObject = "DetailLayout";
    var queryString = "SELECT Field_Name__c, Object__c, Order__c, Rendering__c, IsDeleted FROM " + layoutObject;
    Alloy.Globals.force.request({
        type: "GET",
        url: "/query/?q=" + Ti.Network.encodeURIComponent(queryString),
        callback: function(data) {
            var db = Ti.Database.open(Alloy.Globals.dbName);
            Ti.API.info("[dynaforce] DATA: " + JSON.stringify(data));
            var records = data.records;
            for (var i = 0; records.length > i; i++) {
                Ti.API.info("[dynaforce] RECORD: " + JSON.stringify(records[i]));
                var record = records[i];
                if (true != record.IsDeleted) {
                    Ti.API.info("[dynaforce] INSERT OR REPLACE INTO " + localObject + ' VALUES ("' + record.Order__c + '", "' + record.Field_Name__c + '", "' + record.Object__c + '", "' + record.Rendering__c + '");');
                    try {
                        db.execute("INSERT OR REPLACE INTO " + localObject + ' VALUES ("' + record.Order__c + '", "' + record.Field_Name__c + '", "' + record.Object__c + '", "' + record.Rendering__c + '");');
                    } catch (e) {
                        Ti.API.error("[dynaforce] exception inserting data in " + localObject + " table: " + e);
                    }
                } else {
                    Ti.API.info("[dynaforce] RECORD is DELETED: removing from local DB");
                    Ti.API.info("[dynaforce] DELETE FROM " + localObject + ' WHERE (position = "' + record.Order__c + '" AND sobject = "' + record.Object__c + '");');
                    try {
                        db.execute("DELETE FROM " + localObject + ' WHERE (position = "' + record.Order__c + '" AND sobject = "' + record.Object__c + '");');
                    } catch (e) {
                        Ti.API.info("[dynaforce] Exception deleting row: " + e);
                    }
                }
            }
            db.close;
            Ti.API.info("[dynaforce] DetailLayout UPDATED");
            callbacks.success();
        }
    });
};

exports.startSync = function(callbacks) {
    var notSyncFound = false;
    var k = 0;
    while (!notSyncFound) {
        Ti.API.info("[dynaforce] index: " + k);
        var row = sobjectSync[k];
        Ti.API.info("[dynaforce] " + JSON.stringify(sobjectSync[k]));
        false == row.synched && (notSyncFound = true);
        k++;
    }
    if (notSyncFound) {
        var row = sobjectSync[k - 1];
        row.synched = true;
        var sobject = row.sobject;
        Ti.API.info("[dynaforce] SYNCHRONIZING SOBJECT: " + sobject);
        callbacks.indicator.setMessage("Sync " + sobject + " Data and Structure");
        Alloy.Globals.force.request({
            type: "GET",
            url: "/sobjects/" + sobject + "/describe",
            callback: function(data) {
                try {
                    var db = Ti.Database.open(Alloy.Globals.dbName);
                    var fieldList = new Array();
                    var typeList = new Array();
                    var usedFields = new Array();
                    var fields = data.fields;
                    Ti.API.info("[dynaforce] RESULT: " + JSON.stringify(data));
                    Ti.API.info("[dynaforce] OBJECT NAME: " + data.name);
                    try {
                        db.execute("CREATE TABLE IF NOT EXISTS " + sobject + "(Id CHARACTER(20) PRIMARY KEY);");
                        Ti.API.info("[dynaforce] TABLE " + sobject + " SUCCESSFULLY CREATED (with no columns) OR ALREADY EXISTS");
                    } catch (e) {
                        Ti.API.error("[dynaforce] Error creating empty table: " + sobject);
                        Ti.API.error("[dinaforce] Exception: " + e);
                    }
                    for (var i = 0; fields.length > i; i++) {
                        var f = fields[i];
                        fieldList[i] = f.name;
                        typeList[i] = f.type;
                        Ti.API.info('[dynaforce] SELECT * FROM ObjectFieldMap WHERE field="' + f.name + '" AND sobject = "' + sobject + '" LIMIT 1;');
                        var check = db.execute('SELECT * FROM ObjectFieldMap WHERE field="' + f.name + '" AND sobject = "' + sobject + '" LIMIT 1;');
                        Ti.API.info("[dynaforce] CHECK VALUE = " + check.rowCount);
                        if (1 != check.rowCount) {
                            Ti.API.info("[dynaforce] CHANGES FOUNDED IN DATA STRUCTURE for field: " + f.name);
                            Ti.API.info('[dynaforce] INSERT OR REPLACE INTO ObjectFieldMap VALUES("' + f.name + '", "' + f.type + '", "' + sobject + '", "' + f.label + '",0) ');
                            try {
                                db.execute('INSERT OR REPLACE INTO ObjectFieldMap VALUES("' + f.name + '", "' + f.type + '", "' + sobject + '", "' + f.label + '",0); ');
                            } catch (e) {
                                Ti.API.error("[dynaforce] Exception upserting in ObjectFieldMap field: " + f.name + " type: " + f.type + " label: " + f.label);
                                Ti.API.error("[dinaforce] Exception: " + e);
                            }
                            if ("id" != f.type) {
                                if (SFDCSQLiteFieldMap.hasOwnProperty(f.type)) {
                                    var sqliteType = SFDCSQLiteFieldMap[f.type];
                                    try {
                                        Ti.API.info("[dynaforce] ALTER TABLE " + sobject + " ADD COLUMN " + f.name + " " + sqliteType);
                                        db.execute("ALTER TABLE " + sobject + " ADD COLUMN " + f.name + " " + sqliteType + ";");
                                        Ti.API.info("[dynaforce] ALTERING SUCCESSFUL");
                                        db.execute('INSERT OR REPLACE INTO ObjectFieldMap VALUES("' + f.name + '", "' + f.type + '", "' + sobject + '", "' + f.label + '",1) ');
                                    } catch (e) {
                                        Ti.API.error("[dynaforce] Error altering table with field: " + f.name + " of type: " + f.type + " label: " + f.label + ":  " + e);
                                    }
                                }
                                if ("picklist" == f.type) {
                                    Ti.API.info("[dynaforce] Field " + f.name + " is a picklist");
                                    var values = f.picklistValues;
                                    Ti.API.info("[dynaforce] it has " + values.length + " values");
                                    for (var i = 0; values.length > i; i++) {
                                        var elem = values[i];
                                        if (true == elem.active) {
                                            Ti.API.info('[dynaforce] INSERT OR REPLACE INTO Picklist VALUES("' + elem.value + '", "' + f.name + '", "' + sobject + '", "' + elem.label + '");');
                                            try {
                                                db.execute('INSERT OR REPLACE INTO Picklist VALUES("' + elem.value + '", "' + f.name + '", "' + sobject + '", "' + elem.label + '");');
                                            } catch (e) {
                                                Ti.API.error("[dynaforce] Exception adding row t Picklist - field: " + f.name + " value: " + elem.value + " label: " + elem.label + ": " + e);
                                            }
                                        } else Ti.API.info("[dynaforce] Value " + elem.value + " is inactive for field " + f.name);
                                    }
                                }
                                if ("reference" == f.type) {
                                    Ti.API.info("[dynaforce] Field " + f.name + " is a reference");
                                    var relation = f.referenceTo;
                                    if (1 == relation.length) {
                                        var isIn = false;
                                        for (var i = 0; sobjectSync.length > i; i++) relation[0] == sobjectSync[i].sobject && (isIn = true);
                                        if (isIn) {
                                            Ti.API.info("[dynaforce] INSERT OR REPLACE INTO " + exports.RELATIONSHIP_TABLE + ' VALUES("' + f.name + '", "' + sobject + '", "' + relation[0] + '");');
                                            try {
                                                db.execute("INSERT OR REPLACE INTO " + exports.RELATIONSHIP_TABLE + ' VALUES("' + f.name + '", "' + sobject + '", "' + relation[0] + '");');
                                            } catch (e) {
                                                Ti.API.error("[dynaforce] Exception adding row to " + exports.RELATIONSHIP_TABLE + " - field: " + f.name + " sobject: " + sobject + " relatedObject: " + relation[0] + ": " + e);
                                            }
                                        } else Ti.API.info("[dynaforce] The relationship is not related to a synched object");
                                    } else Ti.API.info("[dynaforce] Multiple relationships are not supported");
                                }
                            }
                        } else Ti.API.info("[dynaforce] NO STRUCTURE CHANGES FROM LAST SYNC");
                        check.close();
                    }
                    var used = db.execute('SELECT field, sfdctype FROM ObjectFieldMap WHERE sobject = "' + sobject + '" AND isUsed = 1;');
                    var usedFieldTypes = [];
                    while (used.isValidRow()) {
                        usedFields.push(used.fieldByName("field"));
                        usedFieldTypes.push(used.fieldByName("sfdctype"));
                        used.next();
                    }
                    used.close();
                    usedFields.push("Id");
                    usedFieldTypes.push("id");
                    var queryString = "SELECT ";
                    for (var i = 0; usedFields.length > i; i++) queryString += i != usedFields.length - 1 ? usedFields[i] + "," : usedFields[i];
                    queryString += " FROM " + sobject + " ";
                    Ti.API.info("[dynaforce] Last SYNC: " + LAST_SYNC);
                    if (LAST_SYNC) {
                        var deltaCond = "WHERE LastModifiedDate > " + LAST_SYNC;
                        queryString += deltaCond;
                    }
                    Ti.API.info("[dynaforce] QUERY STRING: " + queryString);
                    db.close();
                    Alloy.Globals.force.request({
                        type: "GET",
                        url: "/query/?q=" + Ti.Network.encodeURIComponent(queryString),
                        callback: function(data) {
                            var idList = [];
                            var db = Ti.Database.open(Alloy.Globals.dbName);
                            Ti.API.info("[dynaforce] DATA: " + JSON.stringify(data));
                            var records = data.records;
                            for (var i = 0; records.length > i; i++) {
                                Ti.API.info("[dynaforce] RECORD: " + JSON.stringify(records[i]));
                                var record = records[i];
                                var statement = "INSERT OR REPLACE INTO " + sobject + "(";
                                var values = "VALUES (";
                                idList.push(record.Id);
                                for (var j = 0; usedFields.length > j; j++) {
                                    var field = usedFields[j];
                                    usedFieldTypes[j];
                                    var value = record[usedFields[j]];
                                    null != value;
                                    statement += field;
                                    values += null != value ? '"' + value + '"' : null;
                                    if (j != usedFields.length - 1) {
                                        statement += ",";
                                        values += ",";
                                    }
                                }
                                var insertQuery = statement + ") " + values + ");";
                                try {
                                    db.execute(insertQuery);
                                    Ti.API.info("[dynaforce] INSERT SUCCESS");
                                } catch (e) {
                                    Ti.API.error("[dynaforce] " + sobject + " Data inserting error : " + e);
                                }
                            }
                            db.close();
                            Ti.API.info("[dynaforce] RESTARTING SYNC");
                            try {
                                if (k != sobjectSync.length) exports.startSync({
                                    indicator: callbacks.indicator,
                                    success: function() {
                                        callbacks.success();
                                    }
                                }); else {
                                    Ti.API.info("[dynaforce] SYNC COMPLETE");
                                    var sfdcDate = require("sfdcDate");
                                    LAST_SYNC = sfdcDate.createTodaySfdcDate();
                                    Ti.App.Properties.setString("dynaforce.lastSync", LAST_SYNC);
                                    Ti.API.info("[dynaforce] last sync updated to: " + LAST_SYNC);
                                    callbacks.success();
                                }
                            } catch (e) {
                                Ti.API.error("[dynaforce] RESTART SYNC Exception: " + e);
                            }
                        }
                    });
                } catch (e) {
                    Ti.API.info("[dynaforce] Exception: " + e);
                }
            }
        });
    } else {
        Ti.API.info("[dynaforce] ALL OBJECTS HAVE BEEN SYNCHRONIZED");
        callbacks.success();
    }
};

exports.downloadImages = function(callbacks) {
    retrieveImageList(exports.LIST_LAYOUT_TABLE);
    JSONImages.length > 0 ? exports.startDownloadRoutine({
        success: function() {
            callbacks.success();
        }
    }) : callbacks.success();
};

exports.startDownloadRoutine = function(callbacks) {
    var notSyncFound = false;
    var k = 0;
    var image;
    while (!notSyncFound) {
        image = JSONImages[k];
        Ti.API.info("[dynaforce] " + JSON.stringify(JSONImages[k]));
        false == image.downloaded && (notSyncFound = true);
        k++;
    }
    if (notSyncFound) {
        var url = image.url;
        if (url) {
            var id = image.id;
            var xhr = Titanium.Network.createHTTPClient({
                onload: function() {
                    Ti.API.info("[dynaforce] Image Response Data: " + this.responseData);
                    Ti.API.info("[dynaforce] Image name: " + id + ".png");
                    var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, id + ".png");
                    f.write(this.responseData);
                    Ti.API.info("[dynaforce] file downloaded");
                    image.downloaded = true;
                    if (k != JSONImages.length) exports.startDownloadRoutine({
                        success: function() {
                            callbacks.success();
                        }
                    }); else {
                        Ti.API.info("[dynaforce] Image Downloading Complete");
                        callbacks.success();
                    }
                },
                timeout: 1e4
            });
            xhr.open("GET", url);
            xhr.send();
        } else {
            image.downloaded = true;
            if (k != JSONImages.length) exports.startDownloadRoutine({
                success: function() {
                    callbacks.success();
                }
            }); else {
                Ti.API.info("[dynaforce] Image Downloading Complete");
                callbacks.success();
            }
        }
    } else {
        Ti.API.info("[dynaforce] Image Downloading Complete");
        callbacks.success();
    }
};

exports.upsertObject = function(opts) {
    var now = new Date();
    var id = opts.rowId ? opts.rowId : now.getTime();
    var fieldList = [];
    var valueList = [];
    var updateSet = "";
    for (var key in opts.data) {
        fieldList.push(key);
        valueList.push(opts.data[key]);
        updateSet += "" == updateSet ? key + '="' + opts.data[key] + '"' : ", " + key + '="' + opts.data[key] + '"';
        Ti.API.info("[dynaforce] upserting key: " + key + " value: " + opts.data[key]);
    }
    var db = Ti.Database.open(Alloy.Globals.dbName);
    if (opts.rowId) {
        Ti.API.info("[dynaforce] UPDATE " + opts.sobject + " SET " + updateSet + " " + 'WHERE Id = "' + id + '";');
        try {
            db.execute("UPDATE " + opts.sobject + " SET " + updateSet + " " + 'WHERE Id = "' + id + '";');
            Ti.API.info("[dynaforce] UPDATE SUCCESS");
        } catch (e) {
            Ti.API.error("[dynaforce] Exception updating object: " + e);
            opts.error && opts.error();
            return;
        }
        var now = new Date();
        Ti.API.info("[dynaforce] INSERT OR REPLACE INTO " + exports.SYNC_TABLE + ' VALUES ("' + id + '","' + opts.sobject + '", ' + '"' + now.getTime() + '","' + operation.UPDATE + '");');
        try {
            db.execute("INSERT OR REPLACE INTO " + exports.SYNC_TABLE + ' VALUES ("' + id + '","' + opts.sobject + '", ' + '"' + now.getTime() + '","' + operation.UPDATE + '");');
            Ti.API.info("[dynaforce] UPDATE SYNC TABLE SUCCESS");
        } catch (e) {
            Ti.API.error("[dynaforce] Exception updating object: " + e);
            opts.error && opts.error();
            return;
        }
        for (var i = 0; fieldList.length > i; i++) {
            var field = fieldList[i];
            var value = valueList[i];
            Ti.API.info("[dynaforce] INSERT OR REPLACE INTO " + exports.SYNCFIELD_TABLE + ' VALUES ("' + field + '","' + value + '", ' + '"' + opts.sobject + '","' + id + '");');
            try {
                db.execute("INSERT OR REPLACE INTO " + exports.SYNCFIELD_TABLE + ' VALUES ("' + field + '","' + value + '", ' + '"' + opts.sobject + '","' + id + '");');
                Ti.API.info("[dynaforce] UPDATE SYNCFIELD TABLE SUCCESS");
            } catch (e) {
                Ti.API.error("[dynaforce] Exception updating " + exports.SYNCFIELD_TABLE + ": " + e);
                opts.error && opts.error();
                return;
            }
        }
    }
    db.close();
};

var syncQueue = [];

exports.pushDataToServer = function(callbacks) {
    var db = Ti.Database.open(Alloy.Globals.dbName);
    syncQueue = [];
    var rowset = db.execute("SELECT * FROM " + exports.SYNC_TABLE);
    while (rowset.isValidRow()) {
        syncQueue.push({
            rowId: rowset.fieldByName("rowId"),
            sobject: rowset.fieldByName("sobject"),
            timestamp: rowset.fieldByName("timestamp"),
            operation: rowset.fieldByName("operation")
        });
        rowset.next();
    }
    rowset.close();
    db.close();
    if (0 == syncQueue.length) {
        Ti.API.info("[dynaforce] Sync Queue is EMPTY");
        callbacks.success();
    } else {
        Ti.API.info("[dynaforce] Sync Queue has " + syncQueue.length + " rows");
        exports.executeQueue({
            success: function() {
                callbacks.success();
            }
        });
    }
};

exports.executeQueue = function(callbacks) {
    if (syncQueue.length > 0) {
        var db = Ti.Database.open(Alloy.Globals.dbName);
        var syncRow = syncQueue[0];
        var rowId = syncRow.rowId;
        var sobject = syncRow.sobject;
        syncRow.timestamp;
        var op = syncRow.operation;
        Ti.API.info("[dynaforce] SELECT * FROM " + exports.SYNCFIELD_TABLE + ' WHERE rowId="' + rowId + '" AND sobject="' + sobject + '"');
        var rowset = db.execute("SELECT * FROM " + exports.SYNCFIELD_TABLE + ' WHERE rowId="' + rowId + '" AND sobject="' + sobject + '"');
        var JSONData = {};
        while (rowset.isValidRow()) {
            Ti.API.info("[dynaforce] Field Name: " + rowset.fieldByName("field"));
            Ti.API.info("[dynaforce] Value: " + rowset.fieldByName("value"));
            JSONData[rowset.fieldByName("field")] = rowset.fieldByName("value");
            rowset.next();
        }
        rowset.close();
        Ti.API.info("[dynaforce] Pushing JSON Data: " + JSON.stringify(JSONData));
        var suffix;
        op == operation.UPDATE ? suffix = "/" + rowId + "/?_HttpMethod=PATCH" : op == operation.CREATE && (suffix = "/");
        Alloy.Globals.force.request({
            type: "POST",
            url: "/sobjects/" + sobject + suffix,
            data: JSONData,
            callback: function(data) {
                Ti.API.info("[dynaforce] REMOTE UPSERT SUCCESS");
                Ti.API.info("[dynaforce] Returned JSON Data: " + JSON.stringify(data));
                syncQueue.splice(0, 1);
                db.execute("DELETE FROM " + exports.SYNC_TABLE + ' WHERE rowId="' + rowId + '" AND sobject="' + sobject + '"');
                db.execute("DELETE FROM " + exports.SYNCFIELD_TABLE + ' WHERE rowId="' + rowId + '" AND sobject="' + sobject + '"');
                db.close();
                exports.executeQueue({
                    success: function() {
                        callbacks.success();
                    }
                });
            },
            onerror: function(error) {
                Ti.API.error("[dynaforce] Error syncing object: " + error);
                alert("Error syncing object " + rowId);
                syncQueue.splice(0, 1);
                exports.executeQueue({
                    success: function() {
                        callbacks.success();
                    }
                });
            }
        });
    } else {
        Ti.API.info("[dynaforce] QUEUE EXECUTION COMPLETE");
        callbacks.success();
    }
};

exports.needSync = function(opts) {
    if (opts.Id) {
        var db = Ti.Database.open(Alloy.Globals.dbName);
        Ti.API.info("[dynaforce] SELECT rowId FROM " + exports.SYNCFIELD_TABLE + ' WHERE rowId="' + opts.Id + '" LIMIT 1');
        var rowset = db.execute("SELECT rowId FROM " + exports.SYNCFIELD_TABLE + ' WHERE rowId="' + opts.Id + '" LIMIT 1');
        return rowset.rowCount > 0 ? true : false;
    }
    return false;
};

exports.setChanges = function() {
    LOCAL_CHANGES = true;
};

exports.getChanges = function() {
    return LOCAL_CHANGES;
};

exports.resetChanges = function() {
    LOCAL_CHANGES = false;
};

exports.cleanData = function() {
    var db = Ti.Database.open(Alloy.Globals.dbName);
    Ti.API.info("[dynaforce] SELECT Id FROM " + sobject);
    try {
        var idSet = db.execute("SELECT Id FROM " + sobject);
    } catch (e) {
        Ti.API.error("[dynaforce] Exception retriving records: " + e);
    }
    if (idSet) {
        while (idSet.isValidRow()) {
            var locId = idSet.fieldByName("Id");
            if (idList.indexOf(locId) >= 0) ; else {
                Ti.API.info("[dynaforce] SELECT rowId FROM " + exports.SYNC_TABLE + ' WHERE rowId = "' + locId + '" LIMIT 1');
                try {
                    var syncSet = db.execute("SELECT rowId FROM " + exports.SYNC_TABLE + ' WHERE rowId = "' + locId + '" LIMIT 1');
                } catch (e) {
                    Ti.API.error("[dynaforce] Exception retriving records from sync table: " + e);
                }
                if (syncSet) {
                    if (0 == syncSet.rowCount) {
                        Ti.API.info("[dynaforce] DELETE FROM " + sobject + " WHERE Id = " + locId);
                        try {
                            db.execute("DELETE FROM " + sobject + ' WHERE Id = "' + locId + '"');
                        } catch (e) {
                            Ti.API.error("[dynaforce] Exception deleting record: " + e);
                        }
                    }
                    syncSet.close();
                }
            }
            idSet.next();
        }
        idSet.close();
    }
    db.close();
};