var args = arguments[0] || {};


$.list.orientationModes = Alloy.Globals.orientations;

var ACCOUNT = require("datamodel/account");
var PARTITE = require("datamodel/partite");
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

var IS_TABLET = Alloy.Globals.isTablet;

var rowHeight;

//sizes, dependent from the device
var LBL_NAME_SIZE;
var CTRL_WIDTH;
var SHORT_CTRL_WIDTH;
var TOP_POS;

if (IS_TABLET) {
	LBL_NAME_SIZE = "20sp";
	CTRL_WIDTH = 200;
	SHORT_CTRL_WIDTH = 150;
	rowHeight = 110;
	TOP_POS = null;
} else {
	LBL_NAME_SIZE = "16sp";
	CTRL_WIDTH = 150;
	SHORT_CTRL_WIDTH = 100;
	rowHeight = 180;
	TOP_POS = 10;
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
//var selectList = 'Id, Name, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c, Email__c';
/* in the managed package we have the prefix ATLECI__ */
var selectList = ACCOUNT.data.Id + ', ' + ACCOUNT.data.Name + ', ' + ACCOUNT.data.Billing_Street + ', ' + ACCOUNT.data.Data_Prima_Scadenza + 
	', ' + ACCOUNT.data.Totale_Partite_Aperte + ', ' + ACCOUNT.data.Email;

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
	queryString += ' ORDER BY ' + ACCOUNT.data.Name + ' ASC';
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
		    selectedBackgroundColor:'#0099cc',
		    backgroundFocusedColor:'#0099cc',
		    backgroundSelectedColor:'#0099cc',
		    rowId:rowset.fieldByName(ACCOUNT.data.Id), // custom property, useful for determining the row during events
		    //rowId:'Pippo', 
		    height: rowHeight,
			backgroundColor: '#ffffff',
		});
		
		row.addEventListener('click', function(e) {
			$.activityIndicator.setMessage('Loading Data');
			$.activityIndicator.show();
		   	var detailView = Alloy.createController('detail', {accountId: e.rowData.rowId}).getView();
			detailView.open();
			$.activityIndicator.hide();
		});
		
		var view = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			//layout: 'horizontal',
		});
	        
		var leftview;
		var rightview;
		
		if (IS_TABLET) {
			leftview = Titanium.UI.createView({
			  	left: 0,
				height: Ti.UI.SIZE,
				width: Ti.UI.SIZE,
				layout: 'horizontal',
				bottom: 10,
			});
			
			rightview = Titanium.UI.createView({
			  	right: 10,
				height: Ti.UI.SIZE,
				width: Ti.UI.SIZE,
				bottom: 10,
				layout: 'horizontal',
				horizontalWrap: true,
			});
		} else {
			leftview = Titanium.UI.createView({
			  	left: 0,
				height: Ti.UI.SIZE,
				width: "45%",
				layout: 'vertical',
				bottom: 10,
			});
			
			rightview = Titanium.UI.createView({
			  	right: 10,
				height: Ti.UI.SIZE,
				width: "45%",
				bottom: 10,
				layout: 'horizontal',
				horizontalWrap: true,
			});
		}
	
		
		/*
		for (var i=0; i<fieldList.length; i++) {
			var fieldControl = controlmanager.readableField(fieldList[i], sobject, rowset, false, Alloy.Globals.dynaforce.LIST_LAYOUT_TABLE);
			if (fieldControl!=null)
				leftview.add(fieldControl);
		}
		*/
		
		var lblName = Ti.UI.createLabel({
			left: 10,
			width: CTRL_WIDTH,
			height: Ti.UI.SIZE,
			font: { fontSize: LBL_NAME_SIZE },
			color: '#000000',
			horizontalWrap: true,
			text: rowset.fieldByName('Name')
		});
		
		var lblTotal = Ti.UI.createLabel({
			left: 20,
			top: TOP_POS,
			width: SHORT_CTRL_WIDTH,
			height: Ti.UI.SIZE,
			font: { fontSize:"18sp", fontWeight: "bold" },
			color: '#669900',
			text: rowset.fieldByName(ACCOUNT.data.Totale_Partite_Aperte) + ' EUR'
		});
		
		var lblFirstDate = Ti.UI.createLabel({
			top: TOP_POS,
			left: 20,
			width: SHORT_CTRL_WIDTH,
			height: Ti.UI.SIZE,
			font: { fontSize:"14sp" },
			color: '#0099CC',
			text: rowset.fieldByName(ACCOUNT.data.Data_Prima_Scadenza)
		});
		
		var lblExpired = Ti.UI.createLabel({
			top: TOP_POS,
			left: 10,
			width: CTRL_WIDTH,
			height: Ti.UI.SIZE,
			font: { fontSize:"18sp", fontWeight: 'bold' },
			color: '#ffb61c',
			text: "SCADUTE"
		});
		
		leftview.add(lblName);
		leftview.add(lblTotal);
		leftview.add(lblFirstDate);
		
		//check if the account has 
		if (hasExpiredInvoices(rowset.fieldByName(ACCOUNT.data.Id))) leftview.add(lblExpired);
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
			   	right: 5,
			   	width: 64,
			   	height: 64,
			   	backgroundImage: getPartiteIcon(rowset.fieldByName(ACCOUNT.data.Totale_Partite_Aperte)),
			   	color: '#ffffff',
			   	bubbleParent: false,
			   	touchEnabled: true,
			   	rowId: rowset.fieldByName(ACCOUNT.data.Id)
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
			   right: 5,
			   width: 64,
			   height: 64,
			   bubbleParent: false,
			   backgroundImage: getMailIcon(rowset.fieldByName(ACCOUNT.data.Email)),
			   color: '#ffffff',
			   email: rowset.fieldByName(ACCOUNT.data.Email),
			   accName: rowset.fieldByName(ACCOUNT.data.Name),
			   touchEnabled: true
			});
			
			btnMail.addEventListener('click',function(e)
			{
			   	//alert(e.rowData.rowId);
			   	var email = e.source.email;
			   	if (email) {
			   		$.activityIndicator.setMessage('Opening Email');
			   		$.activityIndicator.show();
			   		Ti.API.info(email);
			   		var emailDialog = Ti.UI.createEmailDialog();
					emailDialog.subject = "REMINDER: fattura";
					emailDialog.toRecipients = [email];
					emailDialog.messageBody = 'Risp.le ' + e.source.accName;
					emailDialog.open();
					$.activityIndicator.hide();
			   	} else {
			   		alert("Non è definita nessuna e-mail per questo cliente");
			   	}
			});
			
			btnMaps = Titanium.UI.createView({
				top: 10,
			   right: 5,
			   width: 64,
			   height: 64,
			   backgroundImage: '/images/maps.png',
			   color: '#ffffff',
			   touchEnabled: true
			});
			
			btnActivity = Titanium.UI.createView({
				top: 10,
			   	right: 5,
			   	width: 64,
			   	height: 64,
			   	bubbleParent: false,
			   	backgroundImage: '/images/activity.png',
			   	color: '#ffffff',
			   	rowId: rowset.fieldByName(ACCOUNT.data.Id),
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

/*TODO: pagination capabilities
$.tblView.addEventListener('scrollend', function() {
	addLoaderRow();
});
*/

/*
 * adds the loading row to perform progressiv data loading
 */
var loaderShown = false;
function addLoaderRow() {
	if (!loaderShown) {
		var row = Ti.UI.createTableViewRow({
			height: 100,
			width: Ti.UI.FILL
		});
		
		var lblLoading = Ti.UI.createLabel({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
			font: { fontSize:14 },
			color: '#0099CC',
			text: 'Loading'
		});
		
		row.add(lblLoading);
		$.tblView.appendRow(row);
		loaderShown = true;
	}
}

var visible = false;
function showHideSearchBar() {
	//alert('ciao');
	//var visible = $.searchWrap.getVisible();
	if (visible) {
		$.searchWrap.setVisible(false);
		$.search.blur();
		visible = false;
		$.searchImage.setBackgroundImage('/images/ic_action_search.png');
		$.searchImage.setBackgroundFocusedImage('/images/ic_action_search_on.png');
		$.searchImage.setBackgroundSelectedImage('/images/ic_action_search_on.png');
		check = true;
		//if ($.search.value == '') loadTableData();
	}
	else {
		$.searchWrap.setVisible(true);
		visible = true;
		$.searchImage.setBackgroundImage('/images/ic_action_cancel.png');
		$.searchImage.setBackgroundFocusedImage('/images/ic_action_cancel_on.png');
		$.searchImage.setBackgroundSelectedImage('/images/ic_action_cancel_on.png');
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

function getMailIcon(mail) {
	if (mail) return "/images/mail.png";
	else return "/images/mail_dis.png";
}

function searchData() {
	var value = $.search.getValue();
	var onlyDebitors = $.onlyDebitors.value;
	var expired = $.expired.value;
	var whereConditions = 'LOWER(' + ACCOUNT.data.Name + ') LIKE "%' + value.toLowerCase() + '%"';
	showHideSearchBar();
	if (onlyDebitors) whereConditions += ' AND ' + ACCOUNT.data.Totale_Partite_Aperte + ' > 0';
	if (expired) whereConditions += ' AND ' + ACCOUNT.data.Id + ' IN (SELECT ' + PARTITE.data.Account + ' FROM ' + PARTITE.sobject + ' WHERE ' + 
		PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true")';
	loadTableData(whereConditions);
	loaderShown = false;
}

function searchDataNoHide() {
	var value = $.search.getValue();
	var onlyDebitors = $.onlyDebitors.value;
	var expired = $.expired.value;
	var whereConditions = 'LOWER(' + ACCOUNT.data.Name + ') LIKE "%' + value.toLowerCase() + '%"';
	//showHideSearchBar();
	if (onlyDebitors) whereConditions += ' AND ' + ACCOUNT.data.Totale_Partite_Aperte + ' > 0';
	if (expired) whereConditions += ' AND ' + ACCOUNT.data.Id + ' IN (SELECT ' + PARTITE.data.Account + ' FROM ' + PARTITE.sobject + ' WHERE ' + 
		PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true")';
	loadTableData(whereConditions);
	loaderShown = false;
}


function refreshData() {
	if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
		$.activityIndicator.setMessage('Validate User Credentials');
    	$.activityIndicator.show();
		Alloy.Globals.force.authorize({
			success: function() {
				
				Titanium.API.info("Authenticated to salesforce");
				Alloy.Globals.dynaforce.resetSync();
	
				$.activityIndicator.setMessage('Pushing Data');
				Alloy.Globals.dynaforce.pushDataToServer({
					success: function() {
						Ti.API.info('[dynaforce] pushDataToServer SUCCESS');
						$.activityIndicator.setMessage('Sync Data Models');
						Alloy.Globals.dynaforce.startSync({
							indicator: $.activityIndicator,
							success: function() {
								$.activityIndicator.setMessage('Downloading Attachments');
								var docDl = require("doc");
								docDl.downloadFiles({
									success: function() {
										$.activityIndicator.hide();
									}
								});
							}
						});
					}
				});
				
			},
			expired: function() {
				Ti.API.info('[dynaforce] Session Expired');
				$.index.close();
			},
			error: function() {
				Ti.API.error('error');
				alert('Connection Error');
				$.activityIndicator.hide();
			},
			cancel: function() {
				Ti.API.info('cancel');
				$.activityIndicator.hide();
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

function viewInfo() {
	alert("ATLaaS Easy Cash In \n" +
		"v" + Ti.App.version + "\n" +
		"Atlantic Technologies S.p.A \n" + 
		"www.atlantic-technologies.com"
	);
}

/*
 * Checks if the account with id accountId has expired invoices 
 */
function hasExpiredInvoices(accountId) {
	var check = false;
	var db = Ti.Database.open(Alloy.Globals.dbName);
	try {
		var rowset = db.execute('SELECT ' + PARTITE.data.Id + ' FROM ' + PARTITE.sobject + 
			' WHERE ' + PARTITE.data.Account + ' == "' + accountId + '"' +
			' AND ' + PARTITE.data.Pagato + ' == "false" AND ' + PARTITE.data.Scaduta + ' == "true"');
	} catch(e) {
		Ti.API.error('[easycashin] Exception controlling expired invoices for account ' + accountId + ': ' +e);
	}
	if (rowset) {
		if (rowset.rowCount>0) check = true;
	 	rowset.close();
	}
	db.close();
	return check;
}

function clearSearchFilters() {
	$.search.setValue('');
	$.onlyDebitors.setValue(false);
	$.expired.setValue(false);
}

$.list.addEventListener('android:back',function(){
	Ti.API.info("[Easy Cash In] android back pressed");
	if (visible) showHideSearchBar();
	else $.list.close();
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
