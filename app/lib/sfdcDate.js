
/**
 * Converts a SFDC date to a SQLite readable date
 * @param String sfdcDate the date in Salesforce format
 * @return the converted Date object
 */
exports.convertDateTime = function(sfdcDate) {
	var date = sfdcDate.substring(0,10);
	var time = sfdcDate.substring(11,19);
	var datetime = new Date(date + ' ' + time);
	//Ti.API.log('[sfdcDate] Converted Date: ' + datetime);
	return date + ' ' + time;
	//return datetime;
};

/**
 * Creates a Datetime javascript object given a SFDC formatted datetime string
 * @param sfdcDate the datetime SFDC formatted
 */
exports.getDateTimeObject = function(sfdcDate) {
	var year = sfdcDate.substring(0,4);
	var month = sfdcDate.substring(5,7);
	var day = sfdcDate.substring(8,10);
	var hour = sfdcDate.substring(11,13);
	var min = sfdcDate.substring(14,16);
	var sec = sfdcDate.substring(17,19);
	var datetime = new Date();
	datetime.setFullYear(year);
	datetime.setMonth(month);
	datetime.setDate(day);
	datetime.setHours(hour);
	datetime.setMinutes(min);
	datetime.setSeconds(sec);
	datetime.getTimezoneOffset();
	console.log('[dynaforce][sfdcdate] Timezone Offset: ' + datetime.getTimezoneOffset());
	return datetime;
};

/**
 * Creates a date in Salesforce String format (yyyy-mm-ddThh:mm:ssZ)
 * @returns String SFDC dformatted date string
 */
exports.createTodaySfdcDate = function() {
	var curdate = new Date();
	
	/*
	var utcdate = new Date(Date.UTC(year,month,day));
	Ti.API.info('[dynaforce] [sfdcDate] Local Hour: ' + curdate.getHours());
	Ti.API.info('[dynaforce] [sfdcDate] UTC hour: ' + utcdate.getHours());
	Ti.API.info('[dynaforce] [sfdcDate] UTC: ' + utcdate);
	*/
	Ti.API.info('[dynaforce] [sfdcDate] UTC String: ' + curdate.toUTCString());
	var UTCHours = curdate.toUTCString().substring(17,19);
	Ti.API.info('[dynaforce] [sfdcDate] UTC hours: ' + UTCHours);
	curdate.setHours(UTCHours);
	//var datestring = getDateString(curdate);
	var datestring = getUTCSFDCNow();
	Ti.API.info('[dynaforce] [sfdcDate] Current datetime SFDC format: ' + datestring);
	return datestring; 
};

/**
 * returns a SFDC formatted date
 */
function getDateString(curdate) {
	var year = curdate.getFullYear();
	var month = normalizeDateString(curdate.getMonth() + 1);
	var day = normalizeDateString(curdate.getDate());
	var hours = normalizeDateString(curdate.getHours());
	var minutes = normalizeDateString(curdate.getMinutes());
	var seconds = normalizeDateString(curdate.getSeconds());
	
	return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.000+0000';
}

function getUTCSFDCNow() {
	var now = new Date();
	var year = now.getUTCFullYear();
	var month = normalizeDateString(now.getUTCMonth() + 1);
	var day = normalizeDateString(now.getUTCDate());
	var hours = normalizeDateString(now.getUTCHours());
	var minutes = normalizeDateString(now.getUTCMinutes());
	var seconds = normalizeDateString(now.getUTCSeconds());
	
	return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.000+0000';
}

exports.getDateStringFromSFDCDate = function(opts) {
	Ti.API.info('[sfdcDate] SFDC Date: ' + opts.sfdcDate);
	return opts.sfdcDate.substring(0,10);
};
/**
 * Takes the datePart (hour, minutes, secondes, days or months) returns the currect format to 
 * create the salesforce format, with 2 charachters
 * This is to avoid the values < 10 (they would be of 1 charachter)
 * @param int datePart
 */
function normalizeDateString(datePart) {
	return (datePart > 9) ? datePart : '0' + datePart;
}

