function DataItem(id, url, method, type, startTime, endTime, status) {
	this.id = id;
	this.url = url;
	this.method = method;
	this.type = type;
	this.startTime = startTime;
	this.endTime = endTime;
	this.status = status;

};

// Variables
var MessageTypes = {
	Start: 0,
	Stop: 1
};

var States = {
	Started: 0,
	Stopped: 1
};
var filters = {urls: ["<all_urls>"]};
var _currentState = States.Stopped;
var _dataItems = [];

// Public methods
var getCsv = function() {
	// Setup the content type and initial headers
	var csvContent = "data:text/csv;charset=utf-8,";
	csvContent += Object.keys(new DataItem()).join(',') + "\n";

	// Get all of the data
	_dataItems.forEach(function(curDataItem, index){
		// Go through each of the properties and build up the current row
		var allValues = _.values(curDataItem);
		var curDataItemRow = _.map(allValues, function(curValue) {
			var cleanedValue = !_.isNull(curValue) && !_.isUndefined(curValue) && _.isString(curValue)
				? curValue.replace('"', '""')
				: curValue;

			return '"' + cleanedValue + '"'
		}).join(',');

		// Add to the total content
	   	csvContent += curDataItemRow + "\n";
	}); 

	return csvContent;
};

// Private methods
var _findDataItem = function(id) {
	// Find by the id
	for(var i = 0; i < _dataItems.length; i++) {
		if(_dataItems[i].id === id) {
			return _dataItems[i];
		};
	};

	// Wasn't found
	return null;
};

var _onBeforeRequest = function(details) {
	// Make sure the item doesn't already exist
	var existingItem = _findDataItem(details.requestId);
	if(existingItem != null || existingItem != undefined) {
		return;
	};

	// Add the new entry
	var newItem = new DataItem(details.requestId, details.url, details.method, details.type, details.timeStamp, null, null);
	_dataItems.push(newItem);

	_setupUi();
}

var _onRequestCompleted = function(details) {
	// Make sure the item exists
	var existingItem = _findDataItem(details.requestId);
	if(existingItem == null || existingItem == undefined) {
		return;
	};

	// Update the end time and status
	existingItem.endTime = details.timeStamp;
	existingItem.status = details.statusCode;

	_setupUi();
};

var _setupUi = function() {
	chrome.browserAction.setBadgeText({text: "" + _dataItems.length});
};

// Setup a message listeners
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	// Handle the message types
	if(request.type == MessageTypes.Start) {
		// Setup state
		_dataItems.length = 0;
		_currentState = States.Started;

		// Bind to the chrome events
		chrome.webRequest.onBeforeRequest.addListener(_onBeforeRequest, filters, []);
		chrome.webRequest.onCompleted.addListener(_onRequestCompleted, filters, []);
	} else if(request.type == MessageTypes.Stop) {
		// Setup state
		_currentState = States.Stopped;

		// Remove listeners
		chrome.webRequest.onBeforeRequest.removeListener(_onBeforeRequest);
		chrome.webRequest.onCompleted.removeListener(_onRequestCompleted);
	} else {
		console.error('Invalid message type!');
	};

	// Setup the ui
	_setupUi();
});

