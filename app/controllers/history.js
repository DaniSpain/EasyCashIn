var args = arguments[0] || {};


var sobject = 'ATLECI__History__c';
var accountId = args['accountId'];

var IS_IOS;
var IS_ANDROID;
if (Ti.Platform.name=='android') {
	IS_ANDROID = true;
	IS_IOS = false;
} else {
	IS_ANDROID = false;
	IS_IOS = true;
}


	
var sfdcDate = require('sfdcDate');


//var selectList = 'Id, Name, Email, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c';

var selectList = 'Id, ATLECI__Title__c, LastModifiedDate'; 



function loadTableData() {
	
	
	var queryString = 'SELECT ' + selectList + ' FROM ' + sobject + ' WHERE ATLECI__Account__c = "' + accountId + '" ORDER BY LastModifiedDate DESC';
	//var queryString = 'SELECT ' + selectList + ' FROM ' + sobject;
	
	db = Ti.Database.open(Alloy.Globals.dbName);
	
	Ti.API.info('[dynaforce] Query: ' + queryString);
	try {
		var rowset = db.execute(queryString);
	} catch(e) {
		Ti.API.error('[dynaforce] Error queryng ' + sobject + ' data: ' + e);
	}
	
	var tableData = [];
	
	
	
	Ti.API.info('[EasyCashIn] Rows = ' + rowset.rowCount);
	while (rowset.isValidRow()) {
		
		//Ti.API.info('[dynaforce] LAST MODIFIED DATE: ' + rowset.getFieldByName('LastModifiedDate'));
		var row = Ti.UI.createTableViewRow({
		    className:'listRow', // used to improve table performance on Android
		    selectedBackgroundColor:'#ffffff',
		    rowId:rowset.fieldByName('Id'), // custom property, useful for determining the row during events
		    //rowId:'Pippo', 
		    height:100,
			backgroundColor: '#ffffff',
		});
		
		var view = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			layout: 'vertical',
			horizontalWrap: true
		});
	    
	   	var datetime = sfdcDate.getDateTimeObject(rowset.fieldByName('LastModifiedDate'));
	   	
		var lblDate = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#000000',
			text: datetime
		});
		
		
		var lblTitle = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			font: { fontSize:14 },
			horizontalWrap: true,
			text: rowset.fieldByName('ATLECI__Title__c'),
			color: '#0099CC'
		});
		
		view.add(lblDate);
		view.add(lblTitle);
		
		row.add(view);
		tableData.push(row);
		//$.tblView.appendRow(row);
		rowset.next();
	}
	
	$.tblView.setData(tableData);
	
	rowset.close(tableData);
	
						
	
	db.close();
}



loadTableData();
$.history.open();



$.history.addEventListener('close', function() {
    $.destroy();
});

function closeWindow() {
	$.history.close();
}
