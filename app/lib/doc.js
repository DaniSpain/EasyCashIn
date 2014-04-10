/**
 * This class is used to download the attachment files on Salesforce
 * It looks at the Attachment table (downloaded during the sync) and retrieve the related files in url specified in the 
 * Body field.
 * It saves the file in the App local storage and names it as the same of salesforce (the name is stored in the Attachment's Name field)
 */

var JSONDocs = new Array();
var TABLE = "Attachment";

/* 
 * as the LAST_SYNC in dynaforce, we trace the last time we have done the download
 * so we can download only the new or edited documents
 */
var LAST_DOC_DOWNLOAD = Ti.App.Properties.getString('doc.lastDownload');

function retrieveFileList() {
	var docList = new Array();
	var db = Ti.Database.open(Alloy.Globals.dbName);
	var rowset;
	if (LAST_DOC_DOWNLOAD) {
		Ti.API.info('[doc] SELECT * FROM ' + TABLE + ' WHERE LastModifiedDate >= "' + LAST_DOC_DOWNLOAD + '" ORDER BY LastModifiedDate ASC;');
		//retireve all the rows from the ListLayout
		try {
			rowset = db.execute('SELECT * FROM ' + TABLE + ' WHERE LastModifiedDate >= "' + LAST_DOC_DOWNLOAD + '" ORDER BY LastModifiedDate ASC;');
		} catch (e) {
			Ti.API.error('[doc] Exception retrieving ' + table + ' rows UPDATED: ' + e);
		}
	} else {
		Ti.API.info('[doc] SELECT * FROM ' + TABLE + ';');
		//retireve all the rows from the ListLayout
		try {
			rowset = db.execute('SELECT * FROM ' + TABLE + ';');
		} catch (e) {
			Ti.API.error('[doc] Exception retrieving ' + table + ' rows FIRST SYNC: ' + e);
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
	
	for (var i=0; i<docList.length; i++) {
		Ti.API.info('[doc] docList id: ' + docList[i].id);
		Ti.API.info('[doc] docList url: ' + docList[i].url);
		Ti.API.info('[doc] docList filename: ' + docList[i].filename);
	}
	
	
	JSONDocs = docList;
}


exports.downloadFiles = function(callbacks) {
	retrieveFileList();
	if (JSONDocs.length>0) {
		exports.startDownloadRoutine({
			success: function(){
				callbacks.success();
			}
		});
	} else {
		callbacks.success();
	}
};

exports.startDownloadRoutine = function(callbacks) {
	var notSyncFound = false;
	var k = 0;
	var file;
	while(!notSyncFound) {
		file = JSONDocs[k];
		Ti.API.info('[doc] ' + JSON.stringify(JSONDocs[k]));
		if (file.downloaded == false) notSyncFound = true;
		k++;
	}
	if (notSyncFound) {
		var furl = file.url;
		if (furl) {
			var id = file.id;
			var name = file.filename;
			Alloy.Globals.force.request({
				type:'GET',
				url: furl, 
				removeUrlPart: true,
				blobRequest: true,
				callback: function(data) {
					//Ti.API.info('[doc] RESULT: ' + data);
					file.downloaded = true;
					Ti.API.info("[doc] Doc Getted");
					
					try {
						//Ti.API.info(data);
						//var blob = Ti.Utils.base64decode(data);
						//Ti.API.info(blob);
						/*
						var blobStream = Ti.Stream.createStream({ source: data, mode: Ti.Stream.MODE_READ });
						var newBuffer = Ti.createBuffer({ length: data.length });
						var blob = newBuffer.toBlob();
						*/
						
						var f;
						if (OS_IOS) f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name);
						else f = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory,name);
						f.write(data); // write to the file
					} catch(e) {
						Ti.API.error("Error writing file " + name+": " + e);
					}
					
					if (k!=JSONDocs.length) {
						exports.startDownloadRoutine({
							success: function () {
								callbacks.success();
							}
						});
					} else {
						//we have finish the download
						Ti.API.info("[docs] Docs Downloading Complete");
						var sfdcDate = require('sfdcDate');
						LAST_DOC_DOWNLOAD = sfdcDate.createTodaySfdcDate();
						Ti.App.Properties.setString('doc.lastDownload', LAST_DOC_DOWNLOAD);
						Ti.API.info('[doc] last doc sync updated to: ' + LAST_DOC_DOWNLOAD);
						callbacks.success();
					}
				}
			});
			
			/*
			var xhr = Titanium.Network.createHTTPClient({
				onload: function() {
			        // first, grab a "handle" to the file where you'll store the downloaded data
					Ti.API.info("[dynaforce] Image Response Data: " + this.responseData);
					Ti.API.info("[dynaforce] Image name: " + id + '.png');
					var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, id + '.png');
					f.write(this.responseData); // write to the file
					Ti.API.info("[dynaforce] file downloaded");
					image.downloaded = true;
					if (k!=JSONImages.length) {
						exports.startDownloadRoutine({
							success: function () {
								callbacks.success();
							}
						});
					} else {
						//we have finish the download
						Ti.API.info("[dynaforce] Image Downloading Complete");
						callbacks.success();
					}
				},
				timeout: 10000
			});
			xhr.open('GET',url);
			xhr.send();
			*/
		} else { //if (url)
			file.downloaded = true;
			if (k!=JSONDocs.length) {
				exports.startDownloadRoutine({ 
					success: function () {
						callbacks.success();
					}
				});
			} else {
				//we have finish the download
				Ti.API.info("[dynaforce] Docs Downloading Complete");
				var sfdcDate = require('sfdcDate');
				LAST_DOC_DOWNLOAD = sfdcDate.createTodaySfdcDate();
				Ti.App.Properties.setString('doc.lastDownload', LAST_DOC_DOWNLOAD);
				Ti.API.info('[doc] last doc sync updated to: ' + LAST_DOC_DOWNLOAD);
				callbacks.success();
			}
		}
	} else {
		Ti.API.info("[dynaforce] Docs Downloading Complete");
		callbacks.success();
	}
};