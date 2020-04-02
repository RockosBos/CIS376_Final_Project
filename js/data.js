/* 

data structures for CCASPC
defines the necessary data structures and their behaviors

co-authors: Christopher Ciolek
			Nicholas Spencer

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

*/

// chart class definition
function Chart(metric=0, time=0) {
	this.numberOfPoints = 0;
	this.points = [];
	this.metricType = metric;
	this.timeType = time;
	this.mean = 0;
	this.median = 0;
	this.max = 0;
	this.min = 0;
	this.minTime = 0;
	this.maxTime = 0;
	this.variance = 0;
	this.stdDeviation = 0;
}

Chart.prototype.update = function () {
	this.numberOfPoints = this.points.length;
	this.mean = calcMetricMean(this.points);
	this.median = calcMetricMed(this.points);
	this.max = calcMetricMax(this.points);
	this.min = calcMetricMin(this.points);
	this.maxTime = calcTimeMax(this.points);
	this.minTime = calcTimeMin(this.points);
	this.variance = calcMetricVar(this.points);
	this.stdDeviation = calcMetricStdDev(this.points);
	needsToUpdate = true;
}

Chart.prototype.addPoint = function(point) {
	if(!(point instanceof Point))
		return;
	this.points.push(point);
	// for some reason at this point it seems like the points get put into random positions in the array??
	// so we have to sort it using a helper function
	this.points.sort(function(a,b) {
		if(a.x > b.x)
			return 1;
		if(a.x < b.x)
			return -1;
		return 0;
	});
	this.update();
}

Chart.prototype.getMetric = function() {
	if(this.metricType === 0) {
		return "KLOC";
	}
	else if(this.metricType === 1) {
		return "Function Points";
	}
}

Chart.prototype.getTime = function() {
	if(this.timeType === 0) {
		return "Days";
	}
	else if(this.timeType === 1) {
		return "Weeks";
	}
	else if(this.timeType === 2) {
		return "Months";
	}
}

// point class definition
function Point(time=0,val=0) {
	this.x = time;
	this.y = val;
}

Point.prototype.setValue = function (val) {
	this.y = val;
}

Point.prototype.setTime = function(time) {
	this.x = time;
}