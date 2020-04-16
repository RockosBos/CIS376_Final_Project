/* 

main handler for CCASPC
stores global variables and links up UI to functionality

co-authors: Selawai Mona
		  Nicholas Spencer

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

*/

/*
Refactoring and ehancements.  Use of old project approved upon old team members' testimonies (old teammate being Jacob Wisniewski)

Course: CIS 376, Software Engineering II
Project Tracker, PEBCAK Inc.

Jacob Wisniewski
Nicholas Kessey
Aouni Halaweh
Ethan Hoshowski

Professor: Marouane Kessentini
*/

// global variables for defining how the graph looks
var borderWidth = 3; //px
var tickWidth = 2; // px
var tickLength = 15; // px
var strokeColor = '#000000'
var canvas = null;
var innerGraphBuffer = 75;
var dotSize = 4;

//global variables for cost calculation
var organicA = 2.4, organicB = 1.05
var semiDetachedA = 3, semiDetachedB = 1.12;
var embeddedA = 3.6, embeddedB = 1.2;

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
var progLangDropdown = document.getElementById("language-metric-drop");
var COCOMODropdown = document.getElementById("COCOMO-model")
var maxLabel = document.getElementById("graph-max");
var minLabel = document.getElementById("graph-min");
var mean = document.getElementById("graph-mean");
var deviation = document.getElementById("graph-deviation");
var variance = document.getElementById("graph-variance");
var estimateCost = document.getElementById("graph-estimate-cost");
var actualCost = document.getElementById("graph-actual-cost");
var estimateText = document.getElementById("estimate-progress-text");

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
	download(stringData, "ProjectTracker.chart", 'text/plain');
});

// Load Button event listener
loadButton.addEventListener("click", function() {
	fileInput.click();
});

// Add initial 3 points, added code for new estimate points
addInitialButton.addEventListener("click", function() {
	 var x = firstPointTextbox.value,
		y = secondPointTextbox.value,
		z = thirdPointTextbox.value,
		a = estimateText.value;

	if(x.length === 0 || y.length === 0 || z.length === 0 || a.length === 0)
		return;
	if(x === null || y === null || z === null || a === null || isNaN(x) || isNaN(y) || isNaN(z) || isNaN(a) || chart === null)
		return;
	chart.addPoint(new Point(1, parseFloat(x)));
	chart.addEstPoint(new EstPoint(1, parseFloat(a)));
	chart.addPoint(new Point(2, parseFloat(y)));
	chart.addEstPoint(new EstPoint(2, parseFloat(2 * a)));
	chart.addPoint(new Point(3, parseFloat(z)));
	chart.addEstPoint(new EstPoint(3, parseFloat(3 * a)));
	document.getElementById("estimate-progress-text").readOnly = 'readOnly';
	document.getElementById("estimate-progress-text").style = 'background-color: #DCDCDC';
	update();
});

// Add additional points, added changes to make estimate points in parallel
addButton.addEventListener("click", function() {
	var x = addPointTextBox.value;
	var y = estimateText.value;

	if(x.length == 0)
		return;
	if(x == null || isNaN(x) || chart === null)
		return;
	chart.addPoint(new Point(chart.numberOfPoints + 1, parseFloat(x)));
	chart.addEstPoint(new EstPoint(chart.numberOfEstPoints + 1, parseFloat(y * (chart.numberOfEstPoints + 1))));
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

	if(val === "loc")
		chart.metricType = 0;
	if(val === "fp")
		chart.metricType = 1;
	update();
};

//Handle Programming Language dropdown
progLangDropdown.onchange = function() {
	var val = progLangDropdown.value;

	if(val === "cSharp")
		chart.langType = 0;
	if(val === "cPlusPlus")
		chart.langType = 1;
	if(val === "javaLanguage")
		chart.langType = 2;
	if(val === "javascriptLanguage")
		chart.langType = 3;
	if(val === "HTML")
		chart.langType = 4;
	if(val === "visualBasic")
		chart.langType = 5;
	update();
};

// Handle COCOMO Model dropdown
COCOMODropdown.onchange = function() {
	var val = COCOMODropdown.value;

	if(val == "organic")
		chart.COCOMOType = 0;
	if(val == "semi-detached")
		chart.COCOMOType = 1;
	if(val == "embedded")
		chart.COCOMOType = 2;
	update();
};

// |----------------------------------- HTML Element Label Updating -----------------------------------|
//updated for programming language and type of COCOMO selections
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
		metricDropdown.value = "loc";
	}
	else {
		metricDropdown.value = "fp";
	}

	if (chart.langType == 0){
		progLangDropdown.value = "cSharp"
	}
	else if (chart.langType == 1){
		progLangDropdown.value = "cPlusPlus"
	}
	else if (chart.langType == 2){
		progLangDropdown.value = "javaLanguage"
	}
	else if (chart.langType == 3){
		progLangDropdown.value = "javascriptLanguage"
	}
	else if (chart.langType == 4){
		progLangDropdown.value = "HTML"
	}
	else{
		progLangDropdown.value = "visualBasic"
	}

	if (chart.COCOMOType == 0){
		COCOMODropdown.value = "organic"
	}
	else if (chart.COCOMOType == 1){
		COCOMODropdown.value = "semi-detached"
	}
	else{
		COCOMODropdown.value = "embedded"
	}
}

function updateLabels() {
	maxLabel.value = chart.max.toFixed(3);
	minLabel.value = chart.min.toFixed(3);
	mean.value = chart.mean.toFixed(3);
	deviation.value = chart.stdDeviation.toFixed(3);
	variance.value = chart.variance.toFixed(3);
	//new values need to be updated on webpage
	estimateCost.value = chart.estimateCost.toFixed(3);
	actualCost.value = chart.actualCost.toFixed(3);
}

// bring all these update functions into one for easier editing later on
function update() {
	updateDropdowns();
	updateLabels();
	needsToUpdate = true;
}