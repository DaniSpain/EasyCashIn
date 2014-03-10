
$.index.open();

function showIndicator(e){
	$.activityIndicator.setMessage('Validate User Credentials');
    $.activityIndicator.show();
    // do some work that takes 6 seconds
    // ie. replace the following setTimeout block with your code
}

Alloy.Globals.dynaforce.init();

if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE) {

	Alloy.Globals.force.authorize({
		success: function() {
			
			Titanium.API.info("Authenticated to salesforce");
			Alloy.Globals.dynaforce.resetSync();
			/*
			$.activityIndicator.setMessage('Sync Layout Configurations');
			Alloy.Globals.dynaforce.syncLayoutConf({
				indicator: $.activityIndicator,
				success: function() {
					$.activityIndicator.setMessage('Sync Data Models');
					Alloy.Globals.dynaforce.startSync({
						indicator: $.activityIndicator,
						success: function() {
							$.activityIndicator.setMessage('Downloading Images');
							Alloy.Globals.dynaforce.downloadImages({
								success: function() {
									$.activityIndicator.hide();
									openAccountList();
									$.index.close();
								}
							});
	
						}
					});
				}
			});
			*/
			$.activityIndicator.setMessage('Pushing Data');
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
									openAccountList();
									$.index.close();
								}
							});
						}
					});
				}
			});
			//var homeView = Alloy.createController('home').getView();
			//homeView.open();
			
		},
		expired: function() {
			Ti.API.info('[dynaforce] Session Expired');
			$.index.close();
		},
		error: function() {
			Ti.API.error('error');
			alert('Connection Error');
			$.activityIndicator.hide();
			openAccountList();
			$.index.close();
		},
		cancel: function() {
			Ti.API.info('cancel');
		}
	});	
} else {
	alert('No nework connection, working offline');
	$.activityIndicator.hide();
	openAccountList();
	$.index.close();
}


function openAccountList() {
	$.activityIndicator.setMessage('Reading Account Data');
	$.activityIndicator.show();
	var listView = Alloy.createController('list', {sobject: 'Account'}).getView();
	listView.open();
	$.activityIndicator.hide();
}

function openContactList() {
	$.activityIndicator.setMessage('Reading Contact Data');
	$.activityIndicator.show();
	//alert('not yet implemented -.-');
	var listView = Alloy.createController('list', {sobject: 'Contact'}).getView();
	listView.open();
	$.activityIndicator.hide();
}

function openProducts() {
	$.activityIndicator.setMessage('Reading Products Data');
	$.activityIndicator.show();
	//alert('not yet implemented -.-');
	var listView = Alloy.createController('list', {sobject: 'Product__c'}).getView();
	listView.open();
	$.activityIndicator.hide();
}

function openCatalog() {
	$.activityIndicator.setMessage('Reading Products Data');
	$.activityIndicator.show();
	//alert('not yet implemented -.-');
	var catalog = Alloy.createController('catalog', {sobject: 'Product__c'}).getView();
	catalog.open();
	$.activityIndicator.hide();
}






