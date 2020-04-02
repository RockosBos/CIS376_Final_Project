// The purpose of this script is to individually test each component using Whitebox Testing Methodology
// In order to begin the tests, run the function "startTests()" from the web console with index.html open

// p5.js is provided by a third-party and all of its components are assumed to be in working condition

var testReport = "BEGIN TEST REPORT:\n";
function append(str) {
	testReport = testReport + str + "\n";
}

// |----------------------- data.js components -----------------------|

// Point object (no dependency)
function pointTests() {
	// create new point
	var point = new Point();
	var errors = 0;

	// check point default values to assure constructor worked properly
	append("Testing Point constructor for default values")
	if(!(point.x === 0 && point.y === 0)) {
		append('Test for Point constructor failed!');
		errors++;
	}

	// set metric value and verify it was set correctly
	append("Testing Point setValue for value 100")
	point.setValue(100);
	if(!point.y === 100) {
		append('Test for Point setValue failed!');
		errors++;
	}

	// set time value and verify it was set correctly
	append("Testing Point setTime for value 100")
	point.setTime(100);
	if(!point.x === 100) {
		append('Test for Point setTime failed!');
		errors++;
	}

	append('Point object tested resulting in ' + errors + ' errors.');
}

// Chart object (depends on Point object) and statistics_handler
function chartTests() {
	var chart = new Chart();
	var errors = 0;

	append("Testing Chart addPoint and update AND Statistics Handler");
	var point1 = new Point(1, 15),
		point2 = new Point(2, 20),
		point3 = new Point(3, 10),
		point4 = new Point(4, 16),
		point5 = new Point(5, 22);

	chart.addPoint(point1);
	chart.addPoint(point2);
	chart.addPoint(point3);
	chart.addPoint(point4);
	chart.addPoint(point5);
	// numberOfPoints = 5
	// variance ~= 21.8
	// stdDev ~= 4.67
	// mean ~= 16.6
	// maxVal = 22
	// minVal = 10
	// maxTime = 5
	// minTime = 1
	// median = 16
	if(chart.numberOfPoints !== 5) {
		append("Test for Chart addPoint failed; number of points wrong! (" + chart.numberOfPoints + "/5)")
		errors++;
	}
	if(chart.mean.toFixed(1) !== "16.6") {
		append("Test for Chart addPoint failed; mean wrong! (" + chart.mean.toFixed(1) + "/16.6)");
		errors++;
	}
	if(chart.max !== 22) {
		append("Test for Chart addPoint failed; maxValue wrong! (" + chart.max + "/22)");
		errors++;
	}
	if(chart.min !== 10) {
		append("Test for Chart addPoint failed; minValue wrong! (" + chart.min + "/10)");
		errors++;
	}
	if(chart.minTime !== 1) {
		append("Test for Chart addPoint failed; minTime wrong! (" + chart.minTime + "/1)");
		errors++;
	}
	if(chart.maxTime !== 5) {
		append("Test for Chart addPoint failed; maxTime wrong! (" + chart.maxTime + "/5)");
		errors++;
	}
	if(chart.variance.toFixed(1) !== "17.4") {
		append("Test for Chart addPoint failed; variance wrong! (" + chart.variance.toFixed(1) + "/17.4)");
		errors++;
	}
	if(chart.stdDeviation.toFixed(1) !== "4.2") {
		append("Test for Chart addPoint failed; stdDeviation wrong! (" + chart.stdDeviation.toFixed(1) + "/4.2)");
		errors++;
	}
	append('Chart object AND Statistics Handler tested resulting in ' + errors + ' errors.');
}

// Conduct tests and generate report
pointTests();
chartTests();

append("END TEST REPORT");
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

download(testReport, "testresults.txt", "text/plain");