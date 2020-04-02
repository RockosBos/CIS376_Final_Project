/* 

main handler for CCASPC
stores global variables and links up UI to functionality

co-authors: Selawai Mona
			Nicholas Spencer

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

*/

// globals

// global variables for defining how the graph looks
var borderWidth = 3; //px
var tickWidth = 2; // px
var tickLength = 15; // px
var strokeColor = '#000000'
var canvas = null;
var innerGraphBuffer = 75;
var dotSize = 4;

// chart object
var chart = new Chart();
var needsToUpdate = false;

// references to HTML elements
var addButton = document.getElementById("submit-add");
var fileInput = document.getElementById('file-input');
var saveButton = document.getElementById("save-button0");
var loadButton = document.getElementById("load-button0");
var addInitialButton = document.getElementById("submit-initial");
var addPointTextBox = document.getElementById("add-point-text");
var firstPointTextbox = document.getElementById("first-point-text");
var secondPointTextbox = document.getElementById("second-point-text");
var thirdPointTextbox = document.getElementById("third-point-text");
var timeIntervalDropdown = document.getElementById("time-interval-drop");
var metricDropdown = document.getElementById("work-metric-drop");
var maxLabel = document.getElementById("graph-max");
var minLabel = document.getElementById("graph-min");
var mean = document.getElementById("graph-mean");
var deviation = document.getElementById("graph-deviation");
var variance = document.getElementById("graph-variance");

// test functions
function addRandom() {
	var index = chart.numberOfPoints + 1;
	var val = Math.random() * 20 + 100;
	console.log([index, val]);
	chart.addPoint(new Point(index, val));
}

var delay = 250;
var interval = null;
function start() {
	if(interval !== null)
		stop();
	interval = window.setInterval(function() {addRandom();}, delay);
}

function stop() {
	clearInterval(interval);
}

// file IO functions

// function to download text data to a file
// this WILL NOT work on older versions of browsers.
// this is only designed to work on modern versions of:
// Edge, Firefox, Chrome

// sample call: download('string data', 'filename.txt', 'text/plain')
function download(stringData, fileName, fileType) {
	var downloadObject = document.createElement('a');
	downloadObject.href = "data:" + fileType + "charset=utf-8," + encodeURIComponent(stringData);
	downloadObject.setAttribute('download', fileName);
	document.body.appendChild(downloadObject);
	// try downloading by forcing a mouse click event
	downloadObject.click();
	document.body.removeChild(downloadObject);
}

// when we load a file, we need to be able to tell when that happens then actually load the data
fileInput.onchange = function() {
	var reader = new FileReader();
	reader.readAsText(fileInput.files[0]);
	reader.onload = function() {
		var stringData = reader.result;
		if(stringData !== null) {
			var obj = JSON.parse(stringData);
			chart = Object.assign(new Chart, obj);
			update();
		}
	}
}

// |----------------------------------- HTML Element Event Linking -----------------------------------|

// Save Button event listener
saveButton.addEventListener("click", function() {
	if(!(chart !== null && chart instanceof Chart))
		return;
	var stringData = JSON.stringify(chart);
	download(stringData, "ccaspc_data.chart", 'text/plain');
});

// Load Button event listener
loadButton.addEventListener("click", function() {
	fileInput.click();
});

// Add initial 3 points
addInitialButton.addEventListener("click", function() {
	var x = firstPointTextbox.value,
		y = secondPointTextbox.value,
		z = thirdPointTextbox.value;

	if(x.length === 0 || y.length === 0 || z.length === 0)
		return;

	if(x === null || y === null || z === null || isNaN(x) || isNaN(y) || isNaN(z) || chart === null)
		return;

	chart.addPoint(new Point(1, parseFloat(x)));
	chart.addPoint(new Point(2, parseFloat(y)));
	chart.addPoint(new Point(3, parseFloat(z)));
	update();
});

// Add additional points
addButton.addEventListener("click", function() {
	var x = addPointTextBox.value;

	if(x.length === 0)
		return;

	if(x === null || isNaN(x) || chart === null)
		return;

	chart.addPoint(new Point(chart.numberOfPoints + 1, parseFloat(x)));
	update();
});

// Handle Time Interval dropdown
timeIntervalDropdown.onchange = function() {
	var val = timeIntervalDropdown.value;
	if(val === "days")
		chart.timeType = 0;
	if(val === "weeks")
		chart.timeType = 1;
	if(val === "months")
		chart.timeType = 2;
	update();
};

// Handle Metric Type dropdown
metricDropdown.onchange = function() {
	var val = metricDropdown.value;
	if(val === "kloc")
		chart.metricType = 0;
	if(val === "fp")
		chart.metricType = 1;
	update();
};

// |----------------------------------- HTML Element Label Updating -----------------------------------|

function updateDropdowns() {
	if(chart.timeType === 0) {
		timeIntervalDropdown.value = "days";
	}
	else if(chart.timeType === 1) {
		timeIntervalDropdown.value = "weeks";
	}
	else {
		timeIntervalDropdown.value = "months";
	}

	if(chart.metricType === 0) {
		metricDropdown.value = "kloc";
	}
	else {
		metricDropdown.value = "fp";
	}
}

function updateLabels() {
	maxLabel.value = chart.max.toFixed(3);
	minLabel.value = chart.min.toFixed(3);
	mean.value = chart.mean.toFixed(3);
	deviation.value = chart.stdDeviation.toFixed(3);
	variance.value = chart.variance.toFixed(3);
}

// bring all these update functions into one for easier editing later on
function update() {
	updateDropdowns();
	updateLabels();
	needsToUpdate =  true;
}