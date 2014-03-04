var args = arguments[0] || {};

$.activityIndicator.hide();

var sobject = 'Partita_Aperta__c';
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

var selected_row_ids = [];
	
var data = {};



//var selectList = 'Id, Name, Email, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c';

var selectList = 'Id, Data_Documento__c, Data_Scadenza__c, Importo__c, Pagato__c, Scadenza__c, Scaduta__c'; 



function loadTableData() {
	
	//stores the total amount to pay
	amount_to_pay = 0;
	
	//stores the IDs of the rows selected to pay
	selected_row_ids = [];
	
	var data = {};
	
	var queryString = 'SELECT ' + selectList + ' FROM ' + sobject + ' WHERE Account__c = "' + accountId + '" ORDER BY Data_Scadenza__c ASC';
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
		    payed: rowset.fieldByName('Pagato__c'),
		    //rowId:'Pippo', 
		    height:100,
			backgroundColor: '#ffffff',
		});
		
		var view = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			layout: 'horizontal',
			horizontalWrap: true
		});
	        
		var lblImporto = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 150,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			color: '#000000',
			text: rowset.fieldByName('Importo__c') + ' EUR'
		});

		Ti.API.info('[EasyCashIn] Importo: ' + rowset.fieldByName('Importo__c'));
		Ti.API.info('[EasyCashIn] Pagato: ' + rowset.fieldByName('Pagato__c'));
		
		
		var lblPayed = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 150,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			text: getLabelText(rowset.fieldByName('Pagato__c')),
			color: getLabelColor(rowset.fieldByName('Pagato__c'))
		});
		
		var lblScadenza = Ti.UI.createLabel({
			left: 10,
			top:10,
			width: 150,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			color: '#000000',
			text: rowset.fieldByName('Data_Scadenza__c')
		});
		
		var payView = Ti.UI.createView({
			height: Ti.UI.SIZE,
			width: 150,
			left: 10,
			top:10,
			layout: 'horizontal',
			horizontalWrap: true
		});
		
		var lblPay = Ti.UI.createLabel({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#000000',
			text: 'Paga'
		});
		var paySwitch = Ti.UI.createSwitch({
		  value: false, // mandatory property for iOS 
		  rowId: rowset.fieldByName('Id'),
		  amount: rowset.fieldByName('Importo__c')
		});
		if (IS_ANDROID) paySwitch.setStyle(Ti.UI.Android.SWITCH_STYLE_CHECKBOX);
		
		paySwitch.addEventListener('change',function(e){
		  Ti.API.info('Switch value: ' + e.value);
		  if (e.value) {
		  	Ti.API.info('Switch amount: ' + e.source.amount);
		  	amount_to_pay += e.source.amount;
		  	selected_row_ids.push(e.source.rowId);
		  	Ti.API.info('Selected rows: ' + selected_row_ids.length);
		  } else {
		  	amount_to_pay -= e.source.amount;
		  	var idx = selected_row_ids.indexOf(e.source.rowId);
		  	selected_row_ids.splice(idx,1);
		  	Ti.API.info('Selected rows: ' + selected_row_ids.length);
		  }
		  $.footerTitle.setText('Totale selezionato: ' + amount_to_pay + ' EUR');
		});

		payView.add(lblPay);
		payView.add(paySwitch);
		
		view.add(lblImporto);
		view.add(lblPayed);
		view.add(lblScadenza);
		if (rowset.fieldByName('Pagato__c')=='false')
			view.add(payView);
		
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
$.table.open();

var popup_visible = false;
function showHidePopup() {
	//alert('ciao');
	//var visible = $.searchWrap.getVisible();
	if (popup_visible) {
		$.popup.hide();
		$.overlay.hide();
		popup_visible = false;
		
		//if ($.search.value == '') loadTableData();
	}
	else {
		$.popup.show();
		$.overlay.show();
		popup_visible = true;
	}
}

function pay() {
	$.activityIndicator.setMessage('Perform payment');
	$.activityIndicator.show();
	Ti.API.info('[table] selected rows: ' + selected_row_ids);
	for (var i=0; i<selected_row_ids.length; i++) {
		Alloy.Globals.dynaforce.upsertObject({
			sobject: sobject,
			rowId: selected_row_ids[i],
			data: {
				'Pagato__c': true,
			},
			error: function() {
				alert('Payment Error');
			}
		});
	}
	
	$.activityIndicator.setMessage('Sync Data to server');
	Alloy.Globals.dynaforce.pushDataToServer({
		success: function() {
			Ti.API.info('[table] push data SUCCESS');
			showHidePopup();
			loadTableData();
			$.activityIndicator.hide();
		}
	});
	
}

function getLabelColor(payed) {
	var payedColor;
	if (payed=='true') {
		payedColor = '#669900';
	} else {
		payedColor = '#CC0000';
	}
	return payedColor;
}

function getLabelText(payed) {
	var payedText;
	if (payed=='true') {
		payedText = 'PAGATO';
	} else {
		payedText = 'NON PAGATO';
	}
	return payedText;
}

$.table.addEventListener('close', function() {
    $.destroy();
});

function closeWindow() {
	$.table.close();
}
