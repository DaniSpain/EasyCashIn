//Global Configuration
var API_VERSION = 'v29.0'; //Currently hard-coded to Summer 2012 release
var CONSUMER_KEY = Ti.App.Properties.getString('force.consumer.key');
var CONSUMER_SECRET = Ti.App.Properties.getString('force.consumer.secret');
var MOD_URL = 'https://login.salesforce.com/';
//var MOD_URL = 'https://easycashin-dev-ed.my.salesforce.com/';
var REDIRECT_URI = MOD_URL + 'services/oauth2/success';
var MOD = [
	'Production/Developer',
	'Sandbox'
];
var CUR_MOD = 0;
var LOGIN_URL = MOD_URL + 'services/oauth2/authorize?display=touch&response_type=token'
	+ '&client_id=' + Ti.Network.encodeURIComponent(CONSUMER_KEY)
	+ '&redirect_uri=' + REDIRECT_URI;

//Login Session State
var INSTANCE_URL = Ti.App.Properties.getString('force.instanceURL');
var ACCESS_TOKEN = Ti.App.Properties.getString('force.accessToken');
var REFRESH_TOKEN = Ti.App.Properties.getString('force.refreshToken');

//saves the last time we gat a valid token in millis
var LAST_REFRESH = Ti.App.Properties.getString('force.lastTokenTime');
//10 minutes in milliseconds
var FIVE_MINS = 5*60*1000;

var USERNAME = "dspagnuolo@mobilesdk.com";
var PASSWORD = "atlantic2gfY20sb1aGFzrswPOMUG42Z8";

//internal helpers
function info(str) {
	Ti.API.info('[Force.com] '+str);
}

function error(str) {
	Ti.API.error('[Force.com] '+str);
}

/**
 * checks if the token has expired
 * now for conventions we have setted a static time of ten minutes of validity
 * 
 * TODO: use the real expires_in field of the token instead  
 */
function tokenExpired() {
	var expired = false;
	if (LAST_REFRESH) {
		var now = new Date().getTime();
		var tokenAge = now-LAST_REFRESH;
		Ti.API.info("[force] token age = " + tokenAge);
		if (tokenAge>FIVE_MINS) expired = true;
	}
	return expired;
}

//Authorize a Salesforce.com User Account
exports.authorize = function(callbacks) {
	
	//Authorization Window UI Constructor
	function AuthorizationWindow() {
		var self = Ti.UI.createWindow({
			modal:true,
			backgroundColor: "#ffffff",
			title:'Login'
		});
		
		var view = Ti.UI.createView({
			height:Ti.UI.FILL,
			widht:Ti.UI.FILL,
			top: Alloy.Globals.top,
			layout: 'vertical'
		});
		
		var webView = Ti.UI.createWebView({
			//height:"85%",
			height: Ti.UI.FILL,
			widht:Ti.UI.FILL,
			url:LOGIN_URL
		});
		
		/*
		if (Ti.Platform.name == "android") {
    		webView.ignoreSslError = true;
    	}
		*/
		
		var btnTitle = "Change to ";
		if (CUR_MOD==0) btnTitle += MOD[1];
		else btnTitle += MOD[0];
		
		var modButton = Ti.UI.createButton({
			width: Ti.UI.FILL,
			bottom: 0,
			height: '80dp',
			title: btnTitle
		}); 
		
				
				
		modButton.addEventListener('click',function(e)
		{
		   if (CUR_MOD==0) {
		   	//change to sandbox
		   		CUR_MOD = 1;
		   		MOD_URL = 'https://test.salesforce.com/';
		   }
		   else {
		   	//change to prod/developer
		   		CUR_MOD = 0;
		   		MOD_URL = 'https://login.salesforce.com/';
		   }
		   REDIRECT_URI = MOD_URL + 'services/oauth2/success';
		   LOGIN_URL = LOGIN_URL = MOD_URL + 'services/oauth2/authorize?display=touch&response_type=token'
			+ '&client_id=' + Ti.Network.encodeURIComponent(CONSUMER_KEY)
			+ '&redirect_uri=' + REDIRECT_URI;
		   
		   var btnTitle = "Change to ";
			if (CUR_MOD==0) btnTitle += MOD[1];
			else btnTitle += MOD[0];
			
			modButton.setTitle(btnTitle);
			
		   
		   webView.setUrl(LOGIN_URL);
		   alert('Switched to ' + MOD_URL);
		   
		});
		
		view.add(webView);
		//view.add(modButton);
		self.add(view);
		
		//cancel login action
		function cancel() {
			self.close();
			callbacks.cancel && callbacks.cancel();
		}
		
		//instument cancel behavior
		var ind;
		if (Ti.Platform.osname !== 'android') {
			var b = Ti.UI.createButton({
				title:'Cancel',
				style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
			});
			self.setRightNavButton(b);
			b.addEventListener('click', cancel);
		}
		else {
			self.addEventListener('android:back',cancel);
			self.addEventListener('open', function() {
				//Also, do a special activity indicator for android
				ind = Ti.UI.createActivityIndicator({
					location: Ti.UI.ActivityIndicator.STATUS_BAR,
					type: Ti.UI.ActivityIndicator.DETERMINANT,
			    		message:'Loading...',
				});
				ind.show();
			});
		}
		
		//consumer of this window will want to take action based on URL
		webView.addEventListener('load', function(e) {
			ind && ind.hide();
			self.fireEvent('urlChanged', e);
		});
		
		return self;
	}
	
	//if (ACCESS_TOKEN) {
	
	if (REFRESH_TOKEN) {
		//TODO: Check if token is still valid - if not, use refresh token if valid.  If not, reauthorize.
		info('[Force] REFRESH_TOKEN != null');
		
		if (!tokenExpired()) {
			Ti.API.info("[force] Token is still valid, go on");
			callbacks.success();
		} else { 
			//gettong the new token
			Ti.API.info("[force] Token no more valid, refresh it");
			var xhr=Titanium.Network.createHTTPClient();     
			
			xhr.onerror = function(e){ 
				Ti.API.error(JSON.stringify(e));
				Ti.API.error(JSON.stringify(this));
				 Ti.API.error('[Force] Bad Sever => ' + e.error);
				 Ti.API.error('[Force] Status => ' + this.status);
				 Ti.API.error('[Force] Response => ' + this.responseText);
				 var authWindow = new AuthorizationWindow();
				
				authWindow.addEventListener('urlChanged', function(e) {
					
					if (e.url.indexOf('/oauth2/success') !== -1) {
						
						var hash = e.url.split('#')[1];
						var elements = hash.split('&');
						for (var i = 0, l = elements.length; i<l; i++) {
							var element = elements[i].split('=');
							switch (element[0]) {
								case 'access_token':
									ACCESS_TOKEN = Ti.Network.decodeURIComponent(element[1]);
									Ti.App.Properties.setString('force.accessToken', ACCESS_TOKEN);
									Ti.API.info('[force] Access Token: ' + ACCESS_TOKEN);
									break;
								case 'refresh_token':
									REFRESH_TOKEN = Ti.Network.decodeURIComponent(element[1]);
									Ti.App.Properties.setString('force.refreshToken', REFRESH_TOKEN);
									break;
								case 'instance_url':
									INSTANCE_URL = Ti.Network.decodeURIComponent(element[1]);
									Ti.App.Properties.setString('force.instanceURL', INSTANCE_URL);
									break;
								default: break;
							}
						}
						//update the last refresh token property
						var now = new Date().getTime();
						Ti.API.info('[force] token getted ' + now);
						LAST_REFRESH = now;
						Ti.App.Properties.setString('force.lastTokenTime', LAST_REFRESH);
						
						if(callbacks) {
							callbacks.success();
						}
						authWindow.close();
					}
				});
				
				authWindow.open();
			};
			
			//var fullUrl =   INSTANCE_URL + "/services/oauth2/token/";
			var fullUrl = "https://login.salesforce.com/services/oauth2/token";
			Ti.API.info('[force] Refresh Token Url: ' + fullUrl);
			xhr.open("POST",fullUrl);//ADD your  URL
	
			/*
			var param = 'grant_type=refresh_token&client_id=' + escape(CONSUMER_KEY) + 
				'&client_secret='+ escape(CONSUMER_SECRET) + '&refresh_token=' + escape(REFRESH_TOKEN);
			*/
			var param = "grant_type=refresh_token&client_id=" + CONSUMER_KEY + "&refresh_token=" + REFRESH_TOKEN;
				//"&client_secret=" + CONSUMER_SECRET;
			//var param = 'grant_type=password&client_id=' + escape(CONSUMER_KEY);
				//"&username=" + USERNAME + "&passsword=" + PASSWORD; 
			
			xhr.validatesSecureCertificate = true;
			xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
			//xhr.setRequestHeader('Authorization', 'Bearer  ' + ACCESS_TOKEN );
			//xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + API_VERSION);
			
			Ti.API.info('[Force] Params: '+ param);
			xhr.send(param);
			Ti.API.info('[Force] Request Sent');
			
			xhr.onload = function(){
				Ti.API.info("Received text: " + this.responseText);
				if (this.responseText) {
					var resp = JSON.parse(this.responseText);
					Ti.API.info('[force] access token: ' + resp.access_token);
					ACCESS_TOKEN = resp.access_token;
					var now = new Date().getTime();
					Ti.API.info('[force] token getted ' + now);
					LAST_REFRESH = now;
					Ti.App.Properties.setString('force.lastTokenTime', LAST_REFRESH);
					Ti.App.Properties.setString('force.', ACCESS_TOKEN);
					callbacks.success();
				}
			};
		} // /else
	} 
	
	/*
	if (ACCESS_TOKEN) {
		//doing a dummy request to see if we are authenticated 
		Ti.API.info('[force] Access Token: ' + Ti.Network.encodeURIComponent(ACCESS_TOKEN));
		exports.request({
		type:'GET',
		url:'/query/?q='+Ti.Network.encodeURIComponent('SELECT Id FROM Account LIMIT 1'), 
		extcallbacks: callbacks,
		callback: function(data) {
			Ti.API.info('[Force] Access Token is still valid');
			callbacks.success();
		}
		});
	}
	*/
	
	else {
		
		var authWindow = new AuthorizationWindow();
		
		authWindow.addEventListener('urlChanged', function(e) {
			
			if (e.url.indexOf('/oauth2/success') !== -1) {
				
				var hash = e.url.split('#')[1];
				var elements = hash.split('&');
				for (var i = 0, l = elements.length; i<l; i++) {
					var element = elements[i].split('=');
					switch (element[0]) {
						case 'access_token':
							ACCESS_TOKEN = Ti.Network.decodeURIComponent(element[1]);
							Ti.App.Properties.setString('force.accessToken', ACCESS_TOKEN);
							Ti.API.info('[force] Access Token: ' + ACCESS_TOKEN);
							break;
						case 'refresh_token':
							REFRESH_TOKEN = Ti.Network.decodeURIComponent(element[1]);
							Ti.App.Properties.setString('force.refreshToken', REFRESH_TOKEN);
							break;
						case 'instance_url':
							INSTANCE_URL = Ti.Network.decodeURIComponent(element[1]);
							Ti.App.Properties.setString('force.instanceURL', INSTANCE_URL);
							break;
						default: break;
					}
				}
				//update the last refresh token property
				var now = new Date().getTime();
				Ti.API.info('[force] token getted ' + now);
				LAST_REFRESH = now;
				Ti.App.Properties.setString('force.lastTokenTime', LAST_REFRESH);
				
				if(callbacks) {
					callbacks.success();
				}
				authWindow.close();
			}
		});
		
		authWindow.open();
	}
};


//blank out session info
exports.logout = function() {
	ACCESS_TOKEN = null;
	Ti.App.Properties.setString('force.accessToken', ACCESS_TOKEN);
	REFRESH_TOKEN = null;
	Ti.App.Properties.setString('force.refreshToken', REFRESH_TOKEN);
	INSTANCE_URL = null;
	Ti.App.Properties.setString('force.instanceURL', INSTANCE_URL);
};

/**
 * Standard HTTP Request
 * @param {Object} opts
 * @description The following are valid options to pass through:
 * 	opts.timeout 	: int Timeout request
 * 	opts.type		: string GET/POST
 * 	opts.format     : json, etc.
 * 	opts.data		: mixed The data to pass
 * 	opts.url		: string The url source to call
 * 	opts.onerror	: funtion A function to execute when there is an XHR error
 * 	opts.callback   : function when successful
 *  opts.removeUrlPart: used if is passed also the /service/data/v...
 *  opts:blobRequest: if true it means that the response will be a BLOB
 */
 exports.request = function(opts) {
 	
 	//before each request we get the new access token
 	//TODO: manage the expiration time of the ACCESS_TOKEN
 	exports.authorize({
		success: function() {
 		
 		Ti.API.info("[force] Auth Credentials OK");
		// Setup the xhr object
		var xhr = Ti.Network.createHTTPClient();
	
		// Set the timeout or a default if one is not provided
		xhr.timeout = (opts.timeout) ? opts.timeout : 25000;
	
		/**
		 * When XHR request is loaded
		 */
		xhr.onload = function() {
			// If successful
			try {
				//info(JSON.stringify(xhr));
				info("[Force.com] Response Status: " + xhr.status);
				if (Number(xhr.status) >= 200 && Number(xhr.status) < 300) {
					if (opts.blobRequest) opts.callback && opts.callback(this.responseData);
					else opts.callback && opts.callback(JSON.parse(this.responseText));
				}
				else {
					if (opts.onerror) {
						opts.onerror();
					}
					else {
						error('Error during Force.com request');
						//TODO: srsly.  Need moar error handling.
					}
				}
			}
			// If not successful
			catch(e) {
	        	xhr.onerror(e);
			};
		};
	
		if (opts.ondatastream) {
			xhr.ondatastream = function(e){
				opts.ondatastream && opts.ondatastream();
			};
	    }
	
	    /**
		 * Error handling
		 * @param {Object} e The callback object
		 */
		xhr.onerror = function(e) {
			if (xhr.status === 401) {
				alert('Session expired - please log in.');
				exports.logout();
				//opts.extcallbacks.expired();
				exports.authorize({
					/*
					success: function() {
						var indexView = Alloy.createController('index').getView();
						indexView.open();
					}
					*/
				});
			}
			else {
				opts.onerror && opts.onerror();
				Ti.API.info(xhr.responseText);
			}
		};
	
		// Open the remote connection
		var fullUrl;
		if (opts.removeUrlPart) fullURL = INSTANCE_URL+opts.url;
		else fullURL = INSTANCE_URL+'/services/data/'+API_VERSION+opts.url;
		info(fullURL);
		if(opts.type) {
			xhr.open(opts.type, fullURL);	
		} 
		else {
			xhr.open('GET', fullURL);
		}
	
		xhr.validatesSecureCertificate = true;
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Authorization', 'OAuth ' + ACCESS_TOKEN );
		xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + API_VERSION);
	
	    if(opts.headers) {
	        for(var i = 0, j = opts.headers.length; i < j; i++) {
	            xhr.setRequestHeader( opts.headers[i].name, opts.headers[i].value );
	        }
	    }
	
	    if(opts.data) {
			// send the data
	        xhr.send(JSON.stringify(opts.data));
		} 
		else {
			xhr.send(null);
		}
	},
	error: function() {
			Ti.API.error('error');
			alert('Connection Error');
		},
		cancel: function() {
			Ti.API.info('cancel');
		}
	});
};
