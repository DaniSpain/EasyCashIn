var args = arguments[0] || {};

$.activityIndicator.hide();

var PARTITE = require("datamodel/partite");

var sobject = PARTITE.sobject;
var accountId = args['accountId'];
var accountName = "";

//getting the account name
var db = Ti.Database.open(Alloy.Globals.dbName);
try {
	var rowset = db.execute('SELECT Name FROM Account WHERE Id="' + accountId + '" LIMIT 1');
} catch (e) {
	Ti.API.error("[Easy Cash In] Exception getting account name with ID " + accountId + ": " + e);
}
if (rowset) {
	while (rowset.isValidRow()) {
		accountName = rowset.fieldByName('Name');
		rowset.next();
	}
	rowset.close();
}
db.close();
$.accountName.setText(accountName);

/*
 * On android we have the problem on the switch
 * The problem is that when you scroll if a selecdet element disappear and
 * then reappear it pass 2 times from the event "change" of the switch
 * For that reason we need to track the values of the switch and change it only if 
 * it actually changes its value
 * The Object is switchStatus[rowId] = true/false
 */
var switchStatus = {};



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

var ctrlWidth = 140;

var rowHeight;
if (IS_TABLET) {
	rowHeight = 90;
	ctrlWidth = 180;
} else {
	rowHeight = 200;
}



var amount_to_pay = 0;
var selected_row_ids = [];
	
var data = {};

//var selectList = 'Id, Name, Email, BillingStreet, Data_Prima_Scadenza__c, Totale_Partite_Aperte__c';

var selectList = PARTITE.data.Id + ', ' + PARTITE.data.Name + ', ' + PARTITE.data.Data_Documento + ', ' + PARTITE.data.Data_Scadenza + ', ' + 
	PARTITE.data.Importo + ', ' + PARTITE.data.Pagato + ', ' + PARTITE.data.Scadenza + ', ' + 
	PARTITE.data.Scaduta + ', ' + PARTITE.data.Data_Pagamento;
	


/**
 * Loads the table data
 * @param String sortFilter the sorting criteria (eg. "ORDER BY Name ASC")
 * @param String visibilityFilter WHERE condition to add to the standard query string (eg. 'AND Scaduta__c="true"')
 */
function loadTableData(sortFilter, visibilityFilter) {
	
	//stores the total amount to pay
	amount_to_pay = 0;
	
	//clean the switch status
	switchStatus = {};
	
	//stores the IDs of the rows selected to pay
	selected_row_ids = [];
	
	var data = {};
	
	var queryString = 'SELECT ' + selectList + ' FROM ' + sobject + ' WHERE ' + PARTITE.data.Account + ' = "' + accountId + '"';
	//var queryString = 'SELECT ' + selectList + ' FROM ' + sobject;
	if (visibilityFilter) {
		queryString += visibilityFilter;
	}
	if (sortFilter) {
		queryString += ' ' + sortFilter;
	} else {
		queryString += ' ORDER BY ' + PARTITE.data.Data_Documento + ' DESC';
	}
	
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
		    rowId:rowset.fieldByName(PARTITE.data.Id), // custom property, useful for determining the row during events
		    payed: rowset.fieldByName(PARTITE.data.Pagato),
		    //rowId:'Pippo', 
		    height: rowHeight,
			backgroundColor: '#ffffff',
		});
		
		var view = Titanium.UI.createView({
		  	left: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			layout: 'horizontal',
			horizontalWrap: true
		});
		

// IMPORTO    
	    var vImporto = Ti.UI.createView({
	    	left: 10,
	    	top: 10,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE,
			layout: 'vertical',
	    });
	    
	    var lblLblImporto = Ti.UI.createLabel({
	    	left: 0,
			top: 0,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#000000',
			text: 'Importo'
	    });
	    
		var lblImporto = Ti.UI.createLabel({
			left: 0,
			top:5,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			color: '#000000',
			text: rowset.fieldByName(PARTITE.data.Importo) + ' EUR'
		});
		
		vImporto.add(lblLblImporto);
		vImporto.add(lblImporto);
// /IMPORTO


		Ti.API.info('[EasyCashIn] Importo: ' + rowset.fieldByName(PARTITE.data.Importo));
		Ti.API.info('[EasyCashIn] Pagato: ' + rowset.fieldByName(PARTITE.data.Pagato));
		
		
		var lblPayed = Ti.UI.createLabel({
			left: 10,
			top: 10,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			text: getLabelText(rowset.fieldByName(PARTITE.data.Pagato)),
			color: getLabelColor(rowset.fieldByName(PARTITE.data.Pagato))
		});

// SCADENZA	
		var vScadenza = Ti.UI.createView({
	    	left: 10,
	    	top:10,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE,
			layout: 'vertical',
	    });
	    
	    var lblLblScadenza = Ti.UI.createLabel({
	    	left: 0,
			top:0,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#000000',
			text: 'Data Scadenza'
	    });
	    
		var lblScadenza = Ti.UI.createLabel({
			left: 0,
			top:5,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			color: getExpiredLabelColor(rowset.fieldByName(PARTITE.data.Scaduta),rowset.fieldByName(PARTITE.data.Pagato)),
			text: rowset.fieldByName(PARTITE.data.Data_Scadenza)
		});
		
		vScadenza.add(lblLblScadenza);
		vScadenza.add(lblScadenza);
// /SCADENZA

// PAY SWITCH
		var payView = Ti.UI.createView({
			height: Ti.UI.SIZE,
			width: ctrlWidth,
			left: 10,
			top:10,
			layout: 'horizontal',
			horizontalWrap: true
		});
		
		var lblPay = Ti.UI.createLabel({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
			font: { fontSize:14 },
			color: '#000000',
			text: 'Incassa'
		});
		var paySwitch = Ti.UI.createSwitch({
			left: 10,
		  value: false, // mandatory property for iOS 
		  rowId: rowset.fieldByName(PARTITE.data.Id),
		  amount: rowset.fieldByName(PARTITE.data.Importo)
		});
		if (IS_ANDROID) paySwitch.setStyle(Ti.UI.Android.SWITCH_STYLE_CHECKBOX);
		
		paySwitch.addEventListener('change',function(e){
			
	 		  Ti.API.info('Switch value: ' + e.value);
	 		  var preVal = false;
	 		  if (switchStatus[e.source.rowId]) preVal = switchStatus[e.source.rowId];
	 		  Ti.API.info('Previous value: ' + preVal);
	 		  if (preVal!=e.value) {
				  if (e.value==true) {
				  	Ti.API.info('Switch amount: ' + e.source.amount);
				  	amount_to_pay += e.source.amount;
				  	selected_row_ids.push(e.source.rowId);
				  	Ti.API.info('Selected rows: ' + selected_row_ids.length);
				  } else {
				  	if (e.value==false) {
					  	amount_to_pay -= e.source.amount;
					  	var idx = selected_row_ids.indexOf(e.source.rowId);
					  	selected_row_ids.splice(idx,1);
					  	Ti.API.info('Selected rows: ' + selected_row_ids.length);
					 }
				  }
				  switchStatus[e.source.rowId] = e.value;
			
				  $.footerTitle.setText('Totale selezionato: ' + amount_to_pay + ' EUR');
			}
		});
// /PAY SWITCH

//DATA PAGAMENTO
if (rowset.fieldByName(PARTITE.data.Data_Pagamento)) {
		var payDateView = Ti.UI.createView({
	    	left: 10,
	    	top:10,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE,
			layout: 'vertical',
	    });
	    
	    var lblLblPayDate = Ti.UI.createLabel({
	    	left: 0,
			top:0,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:12 },
			color: '#000000',
			text: 'Data Pagamento'
	    });
	    
	    var sfdcDate = require('sfdcDate');
	    var payDate = sfdcDate.getDateStringFromSFDCDate({
	    	sfdcDate: rowset.fieldByName(PARTITE.data.Data_Pagamento)
	    });
		var lblPayDate = Ti.UI.createLabel({
			left: 0,
			top:5,
			width: ctrlWidth,
			height: Ti.UI.SIZE,
			font: { fontSize:20 },
			color: '#000000',
			text: payDate
		});
		
		payDateView.add(lblLblPayDate);
		payDateView.add(lblPayDate);
}
// /DATA PAGAMENTO		

		/*
		 * we add the Document Number 
		 */
		//if (IS_TABLET) {
			var vDoc = Ti.UI.createView({
		    	left: 10,
		    	top: 10,
				height: Ti.UI.SIZE,
				width: Ti.UI.SIZE,
				layout: 'vertical',
		    });
		    
		    var lblLblDoc = Ti.UI.createLabel({
		    	left: 0,
				top: 0,
				width: ctrlWidth,
				height: Ti.UI.SIZE,
				font: { fontSize:12 },
				color: '#000000',
				text: '# Documento'
		    });
		    
			var lblDoc = Ti.UI.createLabel({
				left: 0,
				top:5,
				width: ctrlWidth,
				height: Ti.UI.SIZE,
				font: { fontSize:20 },
				color: '#000000',
				text: rowset.fieldByName(PARTITE.data.Name)
			});
			
			vDoc.add(lblLblDoc);
			vDoc.add(lblDoc);	
			view.add(vDoc);
		//}
		
		payView.add(lblPay);
		payView.add(paySwitch);
		
		var pdfEnabled = hasPdf(rowset.fieldByName(PARTITE.data.Id));
		
		var btnPdf = Ti.UI.createButton({
			width: 60,
			height: 60,
			left: 10,
			rowId: rowset.fieldByName(PARTITE.data.Id),
			pdf: pdfEnabled,
			backgroundImage: getPdfImage(pdfEnabled),
		});
		
		btnPdf.addEventListener('click', function(e) {
			//alert("Coming Soon...");	
			
			if (e.source.pdf) {
				//retrieving the pdf
				$.activityIndicator.setMessage('Loading document');
				$.activityIndicator.show();
				var db = Ti.Database.open(Alloy.Globals.dbName);
				Ti.API.info('[Easy Cash In] QUERY: SELECT Name FROM Attachment WHERE ParentId = "' + e.source.rowId + '" LIMIT 1');
				var queryString = 'SELECT Name FROM Attachment WHERE ParentId = "' + e.source.rowId + '" LIMIT 1'; 
				try {
					var rowset = db.execute(queryString);
				} catch(e) {
					Ti.API.error("[Easy Cash In] Error querying attachment: " + e);
				}
				
				var fileName;
				if (rowset) {
					fileName = rowset.fieldByName("Name");
					rowset.close();
				}
				db.close();
				
				Ti.API.info("[Easy Cash In] File Name: " + fileName);
				var f;
				if (OS_IOS) f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);
				else f = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory,fileName);
				var fPath = f.getNativePath();
				Ti.API.info(fPath);
				
				if (IS_IOS) {
					// Create a document viewer to preview a PDF file
					if (fileName) {
						var docViewer = Ti.UI.iOS.createDocumentViewer({url:fPath});
						docViewer.show({animated: true});
					}
				} else {
					Ti.Android.currentActivity.startActivity(Ti.Android.createIntent({
		                action: Ti.Android.ACTION_VIEW,
		                type: 'application/pdf',
		                data: fPath
	            	}));
				}
				$.activityIndicator.hide();
			} else alert("Documento non disponibile");
		});
		
		view.add(vImporto);
		view.add(vScadenza);
		view.add(lblPayed);
		
		if (rowset.fieldByName(PARTITE.data.Pagato)=='false')
			view.add(payView);
		else view.add(payDateView);
		
		var needSync = Alloy.Globals.dynaforce.needSync({
			Id: rowset.fieldByName(PARTITE.data.Id)
		});
		
		view.add(btnPdf);
		
		if (needSync) {
			var btnSync = Titanium.UI.createView({
			   top: 10,
			   left: 10,
			   width: 40,
			   height: 40,
			   backgroundImage: "/images/not_sync.png",
			   touchEnabled: true,
			   rowId: rowset.fieldByName(PARTITE.data.Id)
			});
			view.add(btnSync);
		}
		
		row.add(view);
		tableData.push(row);
		//$.tblView.appendRow(row);
		rowset.next();
	}
	
	$.tblView.setData(tableData);
	
	rowset.close(tableData);
	
						
	
	db.close();
}



loadTableData(null, null);
$.table.open();

//Pay popup
var pay_popup_visible = false;
function showHidePayPopup() {
	//alert('ciao');
	//var visible = $.searchWrap.getVisible();
	if (amount_to_pay!=0) {
		if (pay_popup_visible) {
			$.pay_popup.hide();
			$.overlay.hide();
			pay_popup_visible = false;
			
			//if ($.search.value == '') loadTableData();
		}
		else {
			$.pay_popup.show();
			$.overlay.show();
			pay_popup_visible = true;
		}
	} else {
		alert('Non hai selezionato nessuna fattura per eseguire il pagamento');
	}
}

//Sort popup
var sort_popup_visible = false;
function showHideSortPopup() {
	if (sort_popup_visible) {
		$.sort_popup.hide();
		$.overlay.hide();
		sort_popup_visible = false;				
	}
	else {
		$.sort_popup.show();
		$.overlay.show();
		sort_popup_visible = true;
	}
}

//visibility popup
var visibility_popup_visible = false;
function showHideVisibilityPopup() {
	if (visibility_popup_visible) {
		$.visibility_popup.hide();
		$.overlay.hide();
		visibility_popup_visible = false;				
	}
	else {
		$.visibility_popup.show();
		$.overlay.show();
		visibility_popup_visible = true;
	}
}

function closePopups() {
	var check = false;
	$.overlay.hide();
	if (sort_popup_visible) {
		$.sort_popup.hide();
		sort_popup_visible = false;
		check=true;
	}
	if (pay_popup_visible) {
		$.pay_popup.hide();
		pay_popup_visible = false;
		check=true;
	}
	if (visibility_popup_visible) {
		$.visibility_popup.hide();
		visibility_popup_visible = false;
		check=true;
	}
	return check;
}

function pay() {
	$.activityIndicator.setMessage('Perform payment');
	$.activityIndicator.show();
	Ti.API.info('[table] selected rows: ' + selected_row_ids);
	for (var i=0; i<selected_row_ids.length; i++) {
		var sfdcDate = require('sfdcDate');
		var sfdcNow = sfdcDate.createTodaySfdcDate();
		Alloy.Globals.dynaforce.upsertObject({
			sobject: sobject,
			rowId: selected_row_ids[i],
			data: {
				'ATLECI__Pagato__c': true,
				'ATLECI__Data_Pagamento__c': sfdcNow,
			},
			error: function() {
				alert('Payment Error');
			}
		});
	}
	
	
	if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
		$.activityIndicator.setMessage('Sync Data to server');
		Alloy.Globals.dynaforce.pushDataToServer({
			success: function() {
				Ti.API.info('[table] push data SUCCESS');
				showHidePayPopup();
				loadTableData();
				Alloy.Globals.dynaforce.setChanges();
				$.activityIndicator.hide();
			}
		});
	} else {
		showHidePayPopup();
		loadTableData();
		$.activityIndicator.hide();
	}
}

function posPay() {
	var mposView = Alloy.createController('mpos', {amount: amount_to_pay, rowids: selected_row_ids}).getView();
	mposView.open();
}

function getExpiredLabelColor(expired, payed) {
	if (payed=="false") {
		if (expired=="true") return '#CC0000';
		else return '#000000';
	} else return '#000000';
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


//we check if a payment has been performed before focusing this screen
$.table.addEventListener('focus', function() {
	var pay_status = Ti.App.Properties.getString("mpos.payok");
	if (pay_status) {
		if (pay_status=='true') {
			if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {
					$.activityIndicator.setMessage('Sync Data to server');
					Alloy.Globals.dynaforce.pushDataToServer({
						success: function() {
							Ti.API.info('[table] push data SUCCESS');
							showHidePayPopup();
							loadTableData();
							Alloy.Globals.dynaforce.setChanges();
							$.activityIndicator.hide();
						}
					});
				} else {
					showHidePayPopup();
					loadTableData();
					$.activityIndicator.hide();
				}
			Ti.App.Properties.setString("mpos.payok","false");
		}
	}
});


var sortOpts = [
	{
		label: "Data Documento",
		field: PARTITE.data.Data_Documento
	},
	{
		label: "Data Scadenza",
		field: PARTITE.data.Data_Scadenza
	},
	{
		label: "Importo",
		field: PARTITE.data.Importo
	},
	{
		label: "Data Pagamento",
		field: PARTITE.data.Data_Pagamento
	}
];

var curOpt = null;
var sortMode = "ASC";
 
$.sortOptions.addEventListener("click", function(e) {
	var idx = e.index;
	var obj = sortOpts[idx];
	if (obj) {
		$.sortFieldButton.setTitle(obj.label);
		curOpt = obj.field;
	}
}); 

function showSortOptions() {
	$.sortOptions.show();
}

function changeSortMode() {
	if (sortMode=="ASC") {
		$.sortModeButton.setBackgroundImage("/images/descending.png");
		sortMode = "DESC";
	} else {
		$.sortModeButton.setBackgroundImage("/images/ascending.png");
		sortMode = "ASC";
	}
}

//visibility switches handling
//Id, Name, Data_Documento__c, Data_Scadenza__c, Importo__c, Pagato__c, Scadenza__c, Scaduta__c, Data_Pagamento__c
var f_payed = true;
var f_notPayed = true;
var f_expired = true;
var f_notExpired = true;

function setHidePayed(e) {
	f_payed = e.value;
} 
function setNotHidePayed(e) {
	f_notPayed = e.value;
} 
function setExpired(e) {
	f_expired = e.value;
} 
function setNotExpired(e) {
	f_notExpired = e.value;
} 

function applyFilters() {
	//apply sorting criteria
	var sorting = null;
	if (curOpt) {
		sorting = "ORDER BY " + curOpt + " " + sortMode; 
	}	
	
	//apply visibility mask
	var visibility = "";
	if (!f_payed) visibility += ' AND ' + PARTITE.data.Pagato + ' = "false"';
	if (!f_notPayed) visibility += ' AND ' + PARTITE.data.Pagato + ' = "true"';
	if (!f_expired) visibility += ' AND ' + PARTITE.data.Scaduta + ' = "false"';
	if (!f_notExpired) visibility += ' AND ' + PARTITE.data.Scaduta + ' = "true"';
	loadTableData(sorting, visibility);
	closePopups();
}

function getPdfImage(enabled) {
	if (enabled) return "/images/pdf.png";
	else return "/images/pdf_dis.png";
}

function hasPdf(id) {
	var check = false;
	if (id) {
		var db = Ti.Database.open(Alloy.Globals.dbName);
		var queryString = 'SELECT Id FROM Attachment WHERE ParentId = "' + id + '"';
		try {
			var rowset = db.execute(queryString);
		} catch(e) {
			Ti.API.error("Exception controlling attachments: " + e);
		}
		if (rowset) {
			if (rowset.rowCount>0) check = true;
			rowset.close();
		}
		db.close();
	}
	return check;	
}

$.table.addEventListener('android:back',function(){
	Ti.API.info("[Easy Cash In] android back pressed");
	if (!closePopups()) $.table.close();
});

function closeWindow() {
	$.table.close();
}

$.table.addEventListener('close', function() {
    $.destroy();
});
