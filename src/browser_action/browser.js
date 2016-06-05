// Variables
var MessageTypes = {
	Start: 0,
	Stop: 1
};

var States = {
	Started: 0,
	Stopped: 1
};

var _onExportClicked = function() {
	// Get background parameters
    chrome.runtime.getBackgroundPage(function (bg) {
    	var csvContent = bg.getCsv();

		// Download the content
		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", new Date().getTime() + '_data.csv');
		link.click();
    });

};

var _setupForm = function() {
	// Get background parameters
    chrome.runtime.getBackgroundPage(function (bg) {
    	var currentState = bg._currentState;
    	var dataItems = bg._dataItems;

	    // Default all controls
		$('#btnStop').hide();
		$('#btnExport').hide();
		$('#btnStart').hide();
		$('#status').text('');

	    // Setup form based on state
	    if(currentState == States.Started) {
			$('#btnStop').show();
			$('#status').text('Capturing Data. Press "Stop" to end.');
	    } else if(currentState == States.Stopped) {
			$('#btnStart').show();

			// Only show export when there is data
			if(dataItems.length > 0) {
				$('#btnExport').show();
				$('#status').text(dataItems.length + ' items captured! Press "Start" to begin a new capture.');
			} else {
				$('#status').text('Press "Start" to begin a new capture.');
			}
	    };
    });
};

var _sendMessage = function(type, content) {
	chrome.runtime.sendMessage({ "type": type, "content": content});
};

var _onStartClicked = function() {
	// Alert the background processor
	_sendMessage(MessageTypes.Start, {});
	_setupForm();
};

var _onStopClicked = function() {
	// Alert the background processor
	_sendMessage(MessageTypes.Stop, {});
	_setupForm();
};

// Handle document ready event
$(document).ready(function() {
	_setupForm();

	// Event Handlers
	$('#btnStart').click(_onStartClicked);
	$('#btnStop').click(_onStopClicked);
	$('#btnExport').click(_onExportClicked);
	


});
