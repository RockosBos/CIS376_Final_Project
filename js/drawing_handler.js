/* 

drawing handler for CCASPC
defines how the chart is drawn on the webpage

author: Nicholas Spencer

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

*/

// p5 function: gets called on script startup
function setup() {
	// set up a canvas to use
	var holder = document.getElementById('canvas-holder');
	var info = holder.getBoundingClientRect();
	canvas = createCanvas(info.width, info.height);
	canvas.parent('canvas-holder');

	// start drawing
	background(240);
	drawGraph();
}

// p5 function: gets called every frame
function draw() {
	// optimization to not go through all of these calculations if we do not need to
	if(needsToUpdate === null || needsToUpdate === false)
		return;
	needsToUpdate = false;
	// this will clear out the previously drawn image so that we dont
	// keep drawing over the same image (looks funky)
	background(240);
	drawGraph();
}

// function that will draw a dashed line from point (x1,y1) to (x2,y2)
function dashedLine(x1, y1, x2, y2, l, g) {
    var pc = dist(x1, y1, x2, y2) / 100;
    var pcCount = 1;
    var lPercent = gPercent = 0;
    var currentPos = 0;
    var xx1 = yy1 = xx2 = yy2 = 0;
 
    while (int(pcCount * pc) < l) {
        pcCount++
    }
    lPercent = pcCount;
    pcCount = 1;
    while (int(pcCount * pc) < g) {
        pcCount++
    }
    gPercent = pcCount;
 
    lPercent = lPercent / 100;
    gPercent = gPercent / 100;
    while (currentPos < 1) {
        xx1 = lerp(x1, x2, currentPos);
        yy1 = lerp(y1, y2, currentPos);
        xx2 = lerp(x1, x2, currentPos + lPercent);
        yy2 = lerp(y1, y2, currentPos + lPercent);
        if (x1 > x2) {
            if (xx2 < x2) {
                xx2 = x2;
            }
        }
        if (x1 < x2) {
            if (xx2 > x2) {
                xx2 = x2;
            }
        }
        if (y1 > y2) {
            if (yy2 < y2) {
                yy2 = y2;
            }
        }
        if (y1 < y2) {
            if (yy2 > y2) {
                yy2 = y2;
            }
        }
 
        line(xx1, yy1, xx2, yy2);
        currentPos = currentPos + lPercent + gPercent;
    }
}
var counter = 0;
// main function to draw the actual graph
function drawGraph() {
	// border
	stroke(0);
	strokeWeight(borderWidth);
	borderAdjustment = borderWidth / 2;

	line(0, borderAdjustment - 1, width, borderAdjustment - 1);
	line(0, height - borderAdjustment, width, height - borderAdjustment);
	line(borderAdjustment - 1, 0, borderAdjustment - 1, height);
	line(width - borderAdjustment, 0, width - borderAdjustment, height);

	// check if we have valid data, if we don't the program will hang
	if(chart.numberOfPoints < 3) {
		stroke(0);
		strokeWeight(0);
		textAlign(CENTER, CENTER);
		text('Please enter at least 3 points of data.', width / 2, height / 2);
		document.getElementById("initial-div").className = "relative-shown";
		document.getElementById("running-div").className = "relative-hidden";
		return;
	}

	document.getElementById("initial-div").className = "relative-hidden";
	document.getElementById("running-div").className = "relative-shown";

	// inner graph border
	line(innerGraphBuffer, innerGraphBuffer, width - innerGraphBuffer / 2, innerGraphBuffer);
	line(innerGraphBuffer, height - innerGraphBuffer, width - innerGraphBuffer / 2, height - innerGraphBuffer);
	line(innerGraphBuffer - 1, innerGraphBuffer, innerGraphBuffer - 1, height - innerGraphBuffer);
	line(width - innerGraphBuffer / 2, innerGraphBuffer, width - innerGraphBuffer / 2, height - innerGraphBuffer);

	// set up some chart data
	var avg = chart.mean;
	var s = chart.stdDeviation;
	var min = chart.min;
	var max = chart.max;
	var minTime = chart.minTime;
	var maxTime = chart.maxTime;

	// come up with optimal bounds for y-axis
	var yMin = 0;
	var yMax = 0;

	if(s !== 0) {
		// upper bound
		if(max > avg + 3*s) {
			yMax = max + s;
		}
		else {
			yMax = avg + 4*s;
		}

		// lower bound
		if(min < avg - 3*s) {
			yMin = min - s;
		}
		else {
			yMin = avg - 4*s;
		}
	}
	else {
		// sigma is 0, so we can't use it in calculations
		yMin = avg - avg / 10;
		yMax = avg + avg / 10;
	}


	textAlign(RIGHT,CENTER);
	// y axis ticks with labels (label mean, UCL, LCL)
	// mean tick
	var yPos = map(avg, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
	strokeWeight(tickWidth);
	line(innerGraphBuffer - tickLength / 2, yPos, width - innerGraphBuffer / 2, yPos);
	strokeWeight(0);
	text(avg.toFixed(1), innerGraphBuffer - tickLength, yPos);

	// if sigma is 0, we don't need upper/lower control lines
	if(s !== 0) {
		// UCL tick
		yPos = map(avg + 3*s, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
		strokeWeight(tickWidth);
		line(innerGraphBuffer - tickLength / 2, yPos, innerGraphBuffer + tickLength / 2, yPos);
		strokeWeight(tickWidth / 2);
		dashedLine(innerGraphBuffer + tickLength / 2 + 5, yPos, width - innerGraphBuffer / 2, yPos, 5, 5);
		strokeWeight(0);
		text((avg + 3*s).toFixed(1), innerGraphBuffer - tickLength, yPos);

		// LCL tick
		yPos = map(avg - 3*s, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
		strokeWeight(tickWidth);
		line(innerGraphBuffer - tickLength / 2, yPos, innerGraphBuffer + tickLength / 2, yPos);
		strokeWeight(tickWidth / 2);
		dashedLine(innerGraphBuffer + tickLength / 2 + 5, yPos, width - innerGraphBuffer / 2, yPos, 5, 5);
		strokeWeight(0);
		text((avg - 3*s).toFixed(1), innerGraphBuffer - tickLength, yPos);
	}

	// get bounds for x axis
	var xMin = 0;
	var xMax = 0;

	if(chart.numberOfPoints > 10) {
		xMin = minTime - 1;
		xMax = maxTime + 1;
	}
	else {
		xMin = 0;
		xMax = 11;
	}

	// draw lines between points
	// we have to do this before drawing the points otherwise the lines will get drawn on top of the points
	// which will not look correct
	lastPoint = null;
	for(var i = 0; i < chart.numberOfPoints; i++) {
		var x = map(chart.points[i].x, xMin, xMax, innerGraphBuffer, width - innerGraphBuffer / 2);
		var y = map(chart.points[i].y, yMax, yMin, innerGraphBuffer, height - innerGraphBuffer);

		// draw line between points
		if(lastPoint == null) {
			lastPoint = [x,y];
		}
		else {
			strokeWeight(tickWidth);
			line(lastPoint[0], lastPoint[1], x, y);
			lastPoint = [x,y];
		}
	}

	textAlign(CENTER, CENTER);
	// plot points
	for(var i = 0; i < chart.numberOfPoints; i++) {
		// tick mark and label on x axis
		var xPos = map(chart.points[i].x, xMin, xMax, innerGraphBuffer, width - innerGraphBuffer / 2);
		if(chart.numberOfPoints > 200) {
			strokeWeight(tickWidth / 2);
		}
		else {
			strokeWeight(tickWidth);
		}
		line(xPos, height - innerGraphBuffer + tickLength / 2, xPos, height - innerGraphBuffer - tickLength / 2);
		strokeWeight(0);
		if(chart.numberOfPoints > 40){
			textSize(8);
		}
		else {
			textSize(12);
		}

		// scale the label text so that we avoid overlapping text
		// highest level of scaling works well with data sets less than 500 points
		if(chart.numberOfPoints < 75) {
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2)
		}
		else if(chart.numberOfPoints > 75 && chart.numberOfPoints <= 105 && chart.points[i].x%2==1) {
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2)
		}
		else if(chart.numberOfPoints > 105 && chart.numberOfPoints <= 145 && chart.points[i].x%3==0) {
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2)
		}
		else if(chart.numberOfPoints > 145 && chart.numberOfPoints <= 200 && chart.points[i].x%5==0) {
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2)
		}
		else if(chart.numberOfPoints > 200 && chart.points[i].x%10==0) {
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2)
		}

		// plot point
		var x = xPos;
		var y = map(chart.points[i].y, yMax, yMin, innerGraphBuffer, height - innerGraphBuffer);
		
		stroke(0);

		if((chart.points[i].y >= avg + 3 * s || chart.points[i].y <= avg - 3 * s) && s !== 0) { 
			stroke(255, 0, 0);
		}
		else {
			stroke(0);
		}
		strokeWeight(dotSize);
		ellipse(x, y, dotSize, dotSize);
		stroke(0);
	}

	// other labels
	textSize(12);
	textAlign(CENTER, CENTER);
	strokeWeight(0);
	text('Control Chart for Statistical Process Control', width / 2, 25);
	text('Time Value: (' + chart.getTime() + ')', width / 2, height - 25);
	translate(width / 2, height / 2);
	rotate(-PI/2);
	text('Metric Value: (' + chart.getMetric() + ')', 0, -(width / 2) + 15);
	rotate(PI/2);
	translate(0, 0);
}