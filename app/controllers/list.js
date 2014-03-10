var args = arguments[0] || {};



//this value will be passed from the parent screen
var sobject = args['sobject'];
Ti.API.info('[dynaforce] PASSED SOBJECT: ' + sobject);


var osname = Ti.Platform.osname,
        version = Ti.Platform.version,
        height = Ti.Platform.displayCaps.platformHeight,
        width = Ti.Platform.displayCaps.platformWidth;
        
var IS_IOS;
var IS_ANDROID;
if (osname=='android') {
	IS_ANDROID = true;
	IS_IOS = false;
} else {
	IS_ANDROID = false;
	IS_IOS = true;
}

var IS_TABLET = osname === 'ipad' || (osname === 'android' && (width > 900));

var rowHeight;
if (IS_TABLET) {
	rowHeight = 120;
} else {
	rowHeight = 200;
}

//var db = Ti.Database.open(Alloy.Globals.dbName);

/*
Ti.API.info('[dynaforce] Fetching list fields');
try {
	var fieldset = db.execute('SELECT * FROM ListLayout WHERE sobject = "' + sobject + '" ORDER BY position ASC; ');
} catch(e) {
	Ti.API.error('[dynaforce] Exception fetching list field for ' + sobject + ': ' + e);
}

var row=0;
var fieldList = [];

controlmanager = require('controlManager');

while (fieldset.isValidRow()) {
	Ti.API.info('[dynaforce] LIST LAYOUT ROW[' + row + '] POSITION: ' + fieldset.fieldByName('position'));
	Ti.API.info('[dynaforce] LIST LAYOUT ROW[' + row + '] FIELD: ' + fieldset.fieldByName('field'));
	Ti.API.info('[dynaforce] LIST LAYOUT ROW[' + row + '] SOBJECT: ' + fieldset.fieldByName('sobject'));
	Ti.API.info('[dynaforce] LIST LAYOUT ROW[' + row + '] RENDERING: ' + fieldset.fieldByName('rendering'));
	row++;
	var fieldName = fieldset.fieldByName('field');
	fieldList.push(fieldName);
	fieldset.next();
}
fieldset.close();

var selectList = 'Id,';
for (var i=0; i<fieldList.length; i++) {
	selectList += fieldList[i];
	if (i!=fieldList.length-1) selectList += ',';
}
*/
var selectList = 'Id, Name, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c';


/*
if (Titanium.Platform.name != 'android') alert('You are not android');
else alert('you are ANDROID!');
*/
//db.close();

// TODO: retrieve labels



function loadTableData(whereCondition) {
	
	var queryString = 'SELECT ' + selectList + ' FROM ' + sobject;
	if (whereCondition) {
		queryString += ' WHERE ' + whereCondition;
	}
	queryString += ' ORDER BY Name ASC';
	db = Ti.Database.open(Alloy.Globals.dbName);
	
	Ti.API.info('[dynaforce] Query: ' + queryString);
	try {
		var rowset = db.execute(queryString);
	} catch(e) {
		Ti.API.error('[dynaforce] Error queryng ' + sobject + ' data: ' + e);
	}
	
	var tableData = [];
	
	while (rowset.isValidRow()) {
		//Ti.API.info('[dynaforce] LAST MODIFIED DATE: ' + rowset.getFieldByName('LastModifiedDate'));
		var row = Ti.UI.createTableViewRow({
		    className:'listRow', // used to improve table performance on Android
		    selectedBackgroundColor:'#ffffff',
		    rowId:rowset.fieldByName('Id'), // custom property, useful for determining the row during events
		    //rowId:'Pippo', 
		    height: rowHeight,
			backgroundColor: '#ffffff',
		});
		
		var view = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			layout: 'horizontal',
		});
	        
		var leftview = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: '45%',
			layout: 'vertical',
			top: "10dp",
			bottom: 10,
		});
		
		var rightview = Titanium.UI.createView({
		  	left: 10,
			height: Ti.UI.SIZE,
			width: '45%',
			top: "10dp",
			bottom: 10,
			layout: 'horizontal',
			horizontalWrap: true,
		});
		
		/*
		for (var i=0; i<fieldList.length; i++) {
			var fieldControl = controlmanager.readableField(fieldList[i], sobject, rowset, false, Alloy.Globals.dynaforce.LIST_LAYOUT_TABLE);
			if (fieldControl!=null)
				leftview.add(fieldControl);
		}
		*/
		
		var lblName = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 150,
			height: Ti.UI.SIZE,
			font: { fontSize:16 },
			color: '#000000',
			horizontalWrap: true,
			text: rowset.fieldByName('Name')
		});
		
		var lblTotal = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 200,
			height: Ti.UI.SIZE,
			font: { fontSize:14 },
			color: '#669900',
			text: rowset.fieldByName('Totale_Partite_Aperte__c') + ' EUR'
		});
		
		var lblFirstDate = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 200,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#0099CC',
			text: rowset.fieldByName('Data_Prima_Scadenza__c')
		});
		
		leftview.add(lblName);
		leftview.add(lblTotal);
		leftview.add(lblFirstDate);
		
		/*
		 * creating the right part of the row, with the buttons
		 * We have to differentiate from iOS and Android because the click
		 * listener works differently, so we adds View in iOS and Buttons in Android
		 */
		var btnPartiteAperte;
		var btnMail;
		var btnMaps;
		var btnActivity;

			btnPartiteAperte = Titanium.UI.createView({
			   top: 10,
			   left: 5,
			   width: 64,
			   height: 64,
			   backgroundImage: getPartiteIcon(rowset.fieldByName('Totale_Partite_Aperte__c')),
			   color: '#ffffff',
			   touchEnabled: true,
			   rowId: rowset.fieldByName('Id')
			});
			
			btnPartiteAperte.addEventListener('click',function(e)
			{
			   	//alert(e.rowData.rowId);
			   	$.activityIndicator.setMessage('Loading Data');
			   	$.activityIndicator.show();
			   	var tableView = Alloy.createController('table', {accountId: e.source.rowId}).getView();
				tableView.open();
				$.activityIndicator.hide();
			});
			
			btnMail = Titanium.UI.createView({
			   top: 10,
			   left: 5,
			   width: 64,
			   height: 64,
			   backgroundImage: '/images/mail.png',
			   color: '#ffffff',
			   touchEnabled: true
			});
			
			btnMaps = Titanium.UI.createView({
			   top: 10,
			   left: 5,
			   width: 64,
			   height: 64,
			   backgroundImage: '/images/maps.png',
			   color: '#ffffff',
			   touchEnabled: true
			});
			
			btnActivity = Titanium.UI.createView({
			   	top: 10,
			   	left: 5,
			   	width: 64,
			   	height: 64,
			   	backgroundImage: '/images/activity.png',
			   	color: '#ffffff',
			   	rowId: rowset.fieldByName('Id'),
			  	touchEnabled: true
			});
		
			btnActivity.addEventListener('click',function(e)
			{
			   	//alert(e.rowData.rowId);
			   	$.activityIndicator.setMessage('Loading History');
			   	$.activityIndicator.show();
			   	var historyView = Alloy.createController('history', {accountId: e.source.rowId}).getView();
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
		//$.tblView.appendRow(row);
		rowset.next();
	}
	
	$.tblView.setData(tableData);
	
	rowset.close(tableData);
	
						
	
	db.close();
}

loadTableData();
$.list.open();


$.list.addEventListener('close', function() {
    $.destroy();
});

var visible = false;
function showHideSearchBar() {
	//alert('ciao');
	//var visible = $.searchWrap.getVisible();
	if (visible) {
		$.searchWrap.setVisible(false);
		$.search.blur();
		visible = false;
		$.searchImage.setImage('/images/ic_action_search.png');
		//if ($.search.value == '') loadTableData();
	}
	else {
		$.searchWrap.setVisible(true);
		visible = true;
		$.searchImage.setImage('/images/ic_action_cancel.png');
		$.search.focus();
	}
}

function getPartiteIcon(amountToPay) {
	if (amountToPay) {
		if (amountToPay>0) {
			return '/images/partite_ko.png';
		} else return '/images/partite_ok.png';
	} else return '/images/partite_ok.png';
}

function searchData() {
	var value = $.search.getValue();
	showHideSearchBar();
	loadTableData('LOWER(Name) LIKE "%' + value.toLowerCase() + '%"');
}

function searchDataNoHide() {
	var value = $.search.getValue();
	//showHideSearchBar();
	loadTableData('LOWER(Name) LIKE "%' + value.toLowerCase() + '%"');
}

function refreshData() {
	if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
		Alloy.Globals.dynaforce.resetSync();
				
		$.activityIndicator.setMessage('Pushing Data');
		$.activityIndicator.show();
		Alloy.Globals.dynaforce.pushDataToServer({
			success: function() {
				Ti.API.info('[dynaforce] pushDataToServer SUCCESS');
				$.activityIndicator.setMessage('Sync Data Models');
				Alloy.Globals.dynaforce.startSync({
					indicator: $.activityIndicator,
					success: function() {
						$.activityIndicator.setMessage('Downloading Images');
						Alloy.Globals.dynaforce.downloadImages({
							success: function() {
								$.activityIndicator.hide();
								loadTableData();
							}
						});
					}
				});
			}
		});
	} else {
		alert('Cannot perform this operation without connectivity');
	}
}

$.list.addEventListener('focus', function() {
    if (Alloy.Globals.dynaforce.getChanges()) {
    	refreshData();
    	Alloy.Globals.dynaforce.resetChanges();
    }
});
/*
$.tblView.addEventListener('longpress', function(e){
  alert('Long pressed ' + e.rowData.rowId);
});

$.tblView.addEventListener('click', function(e){
  	//alert('Clicked ' + e.rowData.rowId);
  	var detailView = Alloy.createController('detail', {sobject: sobject, id: e.rowData.rowId}).getView();
	detailView.open();
});
*/
