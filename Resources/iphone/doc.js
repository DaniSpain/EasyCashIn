function retrieveFileList() {
    var docList = new Array();
    var db = Ti.Database.open(Alloy.Globals.dbName);
    var rowset;
    if (LAST_DOC_DOWNLOAD) {
        Ti.API.info("[doc] SELECT * FROM " + TABLE + ' WHERE LastModifiedDate >= "' + LAST_DOC_DOWNLOAD + '" ORDER BY LastModifiedDate ASC;');
        try {
            rowset = db.execute("SELECT * FROM " + TABLE + ' WHERE LastModifiedDate >= "' + LAST_DOC_DOWNLOAD + '" ORDER BY LastModifiedDate ASC;');
        } catch (e) {
            Ti.API.error("[doc] Exception retrieving " + table + " rows UPDATED: " + e);
        }
    } else {
        Ti.API.info("[doc] SELECT * FROM " + TABLE + ";");
        try {
            rowset = db.execute("SELECT * FROM " + TABLE + ";");
        } catch (e) {
            Ti.API.error("[doc] Exception retrieving " + table + " rows FIRST SYNC: " + e);
        }
    }
    if (rowset) {
        while (rowset.isValidRow()) {
            var bodyUrl = rowset.fieldByName("Body");
            var elemId = rowset.fieldByName("Id");
            var fileName = rowset.fieldByName("Name");
            docList.push({
                id: elemId,
                url: bodyUrl,
                filename: fileName,
                downloaded: false
            });
            rowset.next();
        }
        rowset.close();
    }
    db.close();
    for (var i = 0; docList.length > i; i++) {
        Ti.API.info("[doc] docList id: " + docList[i].id);
        Ti.API.info("[doc] docList url: " + docList[i].url);
        Ti.API.info("[doc] docList filename: " + docList[i].filename);
    }
    JSONDocs = docList;
}

var JSONDocs = new Array();

var TABLE = "Attachment";

var LAST_DOC_DOWNLOAD = Ti.App.Properties.getString("doc.lastDownload");

exports.downloadFiles = function(callbacks) {
    retrieveFileList();
    JSONDocs.length > 0 ? exports.startDownloadRoutine({
        success: function() {
            callbacks.success();
        }
    }) : callbacks.success();
};

exports.startDownloadRoutine = function(callbacks) {
    var notSyncFound = false;
    var k = 0;
    var file;
    while (!notSyncFound) {
        file = JSONDocs[k];
        Ti.API.info("[doc] " + JSON.stringify(JSONDocs[k]));
        false == file.downloaded && (notSyncFound = true);
        k++;
    }
    if (notSyncFound) {
        var furl = file.url;
        if (furl) {
            file.id;
            var name = file.filename;
            Alloy.Globals.force.request({
                type: "GET",
                url: furl,
                removeUrlPart: true,
                blobRequest: true,
                callback: function(data) {
                    file.downloaded = true;
                    Ti.API.info("[doc] Doc Getted");
                    try {
                        var f;
                        f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name);
                        f.write(data);
                    } catch (e) {
                        Ti.API.error("Error writing file " + name + ": " + e);
                    }
                    if (k != JSONDocs.length) exports.startDownloadRoutine({
                        success: function() {
                            callbacks.success();
                        }
                    }); else {
                        Ti.API.info("[docs] Docs Downloading Complete");
                        var sfdcDate = require("sfdcDate");
                        LAST_DOC_DOWNLOAD = sfdcDate.createTodaySfdcDate();
                        Ti.App.Properties.setString("doc.lastDownload", LAST_DOC_DOWNLOAD);
                        Ti.API.info("[doc] last doc sync updated to: " + LAST_DOC_DOWNLOAD);
                        callbacks.success();
                    }
                }
            });
        } else {
            file.downloaded = true;
            if (k != JSONDocs.length) exports.startDownloadRoutine({
                success: function() {
                    callbacks.success();
                }
            }); else {
                Ti.API.info("[dynaforce] Docs Downloading Complete");
                var sfdcDate = require("sfdcDate");
                LAST_DOC_DOWNLOAD = sfdcDate.createTodaySfdcDate();
                Ti.App.Properties.setString("doc.lastDownload", LAST_DOC_DOWNLOAD);
                Ti.API.info("[doc] last doc sync updated to: " + LAST_DOC_DOWNLOAD);
                callbacks.success();
            }
        }
    } else {
        Ti.API.info("[dynaforce] Docs Downloading Complete");
        callbacks.success();
    }
};