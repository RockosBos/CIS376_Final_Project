/* 

drawing handler for CCASPC
defines how the chart is drawn on the webpage

author: Nicholas Spencer

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
//Added new section of graphic, with scaling x and y-axes.  Also drew new lines and new points and improved upon old code with global variables for the graph (useful for initial boundary and inner graph design)
function drawGraph() {
	// border for entire graph
	stroke(0);
	strokeWeight(borderWidth);
	borderAdjustment = borderWidth / 2;
	estimateGraphOrigin = width - 600;

	line(borderAdjustment, borderAdjustment, (estimateGraphOrigin - borderAdjustment), borderAdjustment); //left top buffer line
	line(borderAdjustment, borderAdjustment, borderAdjustment, height - borderAdjustment);		       //left
	line(borderAdjustment, height - borderAdjustment, estimateGraphOrigin, height - borderAdjustment);    //bottom

	line(estimateGraphOrigin, borderAdjustment, width, borderAdjustment);                   //right top buffer line
	line(estimateGraphOrigin, borderAdjustment, estimateGraphOrigin, height);               //left
	line(estimateGraphOrigin, height - borderAdjustment, width, height - borderAdjustment); //bottom
	line(width - borderAdjustment, borderAdjustment, width - borderAdjustment, height);     //right

	// check if we have valid data, if we don't the program will hang
	if(chart.numberOfPoints < 3) {
		stroke(0);
		strokeWeight(0);
		textAlign(CENTER, CENTER);
		text('Please enter at least 3 points of data.', estimateGraphOrigin / 2, height / 2);
		document.getElementById("initial-div").className = "relative-shown";
		document.getElementById("running-div").className = "relative-hidden";
		return;
	}

	//change from hidden to shown element
	document.getElementById("initial-div").className = "relative-hidden";
	document.getElementById("running-div").className = "relative-shown";

	// variance inner graph border
	line(innerGraphBuffer, innerGraphBuffer, estimateGraphOrigin - innerGraphBuffer / 2, innerGraphBuffer);
	line(innerGraphBuffer, height - innerGraphBuffer, estimateGraphOrigin - innerGraphBuffer / 2, height - innerGraphBuffer);
	line(innerGraphBuffer - 1, innerGraphBuffer, innerGraphBuffer - 1, height - innerGraphBuffer);
	line(estimateGraphOrigin - innerGraphBuffer / 2, innerGraphBuffer, estimateGraphOrigin - innerGraphBuffer / 2, height - innerGraphBuffer);

	estimateBuffer = innerGraphBuffer / 2;

	// estimate inner graph border
	line(estimateGraphOrigin + estimateBuffer, estimateBuffer, width - estimateBuffer, estimateBuffer);
	line(estimateGraphOrigin + estimateBuffer, estimateBuffer, estimateGraphOrigin + estimateBuffer, height - estimateBuffer);
	line(estimateGraphOrigin + estimateBuffer, height - estimateBuffer, width - estimateBuffer, height - estimateBuffer);
	line(width - estimateBuffer, estimateBuffer, width - estimateBuffer, height - estimateBuffer);

	// set up some chart data
	var avg = chart.mean;
	var s = chart.stdDeviation;
	var min = chart.min;
	var max = chart.max;
	var estMax = chart.estMax; //used for ultimate max of estimate vs actual graph, winner of either type of point wins
	var estYMax = 0;
	var minTime = chart.minTime;
	var maxTime = chart.maxTime;

	// come up with optimal bounds for y-axis
	var yMin = 0;
	var yMax = 0;
	var estYMin = 0; //never going below 0

	//Left graph std deviations as limits
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

	//Right graph determination of max, keeps in mind FP aspect.
	if (estMax <= 10){
		estYMax = 10;
	}
	else if (estMax > 10 && estMax <= 50){
		estYMax = 50;
	}
	else if (estMax > 50 && estMax <= 100){
		estYMax = 100;
	}
	else if (estMax > 100 && estMax <= 250){
		estYMax = 250;
	}
	else if (estMax > 250 && estMax <= 500){
		estYMax = 500;
	}
	else if (estMax > 500 && estMax <= 1000){
		estYMax = 1000;
	}
	else{
		estYMax = 10000;
	}

	textAlign(RIGHT,CENTER);

	// y axis ticks with labels (label mean, UCL, LCL)
	// mean tick
	var yPos = map(avg, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
	strokeWeight(tickWidth);
	line(innerGraphBuffer - tickLength / 2, yPos, estimateGraphOrigin - innerGraphBuffer / 2, yPos);
	strokeWeight(0);
	text(avg.toFixed(1), innerGraphBuffer - tickLength, yPos);

	// if sigma is 0, we don't need upper/lower control lines
	if(s !== 0) {
		// UCL tick
		yPos = map(avg + 3*s, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
		strokeWeight(tickWidth);
		line(innerGraphBuffer - tickLength / 2, yPos, innerGraphBuffer + tickLength / 2, yPos);
		strokeWeight(tickWidth / 2);
		dashedLine(innerGraphBuffer + tickLength / 2 + 5, yPos, estimateGraphOrigin - innerGraphBuffer / 2, yPos, 5, 5);
		strokeWeight(0);
		text((avg + 3*s).toFixed(1), innerGraphBuffer - tickLength, yPos);

		// LCL tick
		yPos = map(avg - 3*s, yMin, yMax, height - innerGraphBuffer, innerGraphBuffer);
		strokeWeight(tickWidth);
		line(innerGraphBuffer - tickLength / 2, yPos, innerGraphBuffer + tickLength / 2, yPos);
		strokeWeight(tickWidth / 2);
		dashedLine(innerGraphBuffer + tickLength / 2 + 5, yPos, estimateGraphOrigin - innerGraphBuffer / 2, yPos, 5, 5);
		strokeWeight(0);
		text((avg - 3*s).toFixed(1), innerGraphBuffer - tickLength, yPos);
	}

	//scaling for y axis on estimate vs actual graph, soft limit of 10,000 in FPs or LOC
	textSize(12);
	for (var i = 1; i < estYMax; i++){
		strokeWeight(tickWidth);
		if (estYMax == 10 && i % 1 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 10 && estYMax == 50 && i % 5 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 50 && estYMax == 100 && i % 10 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 100 && estYMax == 250 && i % 25 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 250 && estYMax == 500 && i % 50 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 500 && estYMax == 1000 && i % 100 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text(i, estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 1000 && estYMax == 10000 && i % 1000 == 0){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text((i / 1000) + 'K', estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
		else if (estYMax > 10000){
			var estYPos = map(i, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
			line(estimateGraphOrigin + estimateBuffer + tickLength / 5, estYPos, estimateGraphOrigin + estimateBuffer - tickLength / 5, estYPos);
			strokeWeight(0);
			text((i / 1000) + 'K', estimateGraphOrigin + estimateBuffer - tickLength, estYPos);
		}
	}
	strokeWeight(tickWidth);

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
		var x = map(chart.points[i].x, xMin, xMax, innerGraphBuffer, estimateGraphOrigin - innerGraphBuffer / 2);
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

	//draw lines between estimate points
	
	lastPoint = null;
	for(var i = 0; i < chart.numberOfEstPoints; i++) {
		var x = map(chart.estPoints[i].x, xMin, xMax, estimateGraphOrigin + estimateBuffer, width - estimateBuffer);
		var y = map(chart.estPoints[i].y, estYMin, estYMax, height - estimateBuffer, estimateBuffer);

		// draw line between estimate points
		if(lastPoint == null) {
			lastPoint = [x,y];
		}
		else {
			strokeWeight(tickWidth);
			stroke('#B19CD9');
			line(lastPoint[0], lastPoint[1], x, y);
			stroke(0);
			lastPoint = [x,y];
			stroke(0);
		}
	}

	//draw lines between actual points
	//Same sequence adapted for actual points
	lastPoint = null;
	for(var i = 0, total = 0; i < chart.numberOfPoints; i++){
		total += chart.points[i].y;
		var x = map(chart.points[i].x, xMin, xMax, estimateGraphOrigin + estimateBuffer, width - estimateBuffer);
		var y = map(total, estYMin, estYMax, height - estimateBuffer, estimateBuffer);


		// draw line between actual
		if(lastPoint == null) {
			lastPoint = [x,y];
		}
		else {
			strokeWeight(tickWidth);
			stroke('#ADD8E6');
			line(lastPoint[0], lastPoint[1], x, y);
			stroke(0);
			lastPoint = [x,y];
			stroke(0);
		}
	}

	textAlign(CENTER, CENTER);

	// plot actual points
	for(var i = 0, total = 0; i < chart.numberOfPoints; i++) {
		// tick mark and label on x axis
		var xPos = map(chart.points[i].x, xMin, xMax, innerGraphBuffer, estimateGraphOrigin - innerGraphBuffer / 2);
		var estXPos = map(chart.estPoints[i].x, xMin, xMax, estimateGraphOrigin + estimateBuffer, width - estimateBuffer);
		var textSizeTemp;

		total += chart.points[i].y;
		if(chart.numberOfPoints > 200) {
			strokeWeight(tickWidth / 2);
		}
		else {
			strokeWeight(tickWidth);
		}
		line(xPos, height - innerGraphBuffer + tickLength / 2, xPos, height - innerGraphBuffer - tickLength / 2);
		line(estXPos, height - estimateBuffer + tickLength / 5, estXPos, height - estimateBuffer - tickLength / 5);
		strokeWeight(0);
		if(chart.numberOfPoints > 30){
			textSizeTemp = 9;
		}
		else {
			textSizeTemp = 12;
		}

		// scale the label text so that we avoid overlapping text
		// highest level of scaling works well with data sets less than 500 points
		if(chart.numberOfPoints <= 40) {
			textSize(textSizeTemp);
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2);
			text(chart.points[i].x, estXPos, height - estimateBuffer + tickLength + 2);
			
		}
		else if(chart.numberOfPoints > 40 && chart.numberOfPoints <= 75 && chart.points[i].x%2==1) {
			textSize(textSizeTemp);
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2);
			text(chart.points[i].x, estXPos, height - estimateBuffer + tickLength + 2);
		}
		else if(chart.numberOfPoints > 75 && chart.numberOfPoints <= 100 && chart.points[i].x%3==0) {
			textSize(textSizeTemp);
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2);
			text(chart.points[i].x, estXPos, height - estimateBuffer + tickLength + 2);
		}
		else if(chart.numberOfPoints > 100 && chart.numberOfPoints <= 150 && chart.points[i].x%5==0) {
			textSize(textSizeTemp);
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2);
			text(chart.points[i].x, estXPos, height - estimateBuffer + tickLength + 2);
		}
		else if(chart.numberOfPoints > 150 && chart.points[i].x%10==0) {
			textSize(textSizeTemp);
			text(chart.points[i].x, xPos, height - innerGraphBuffer + tickLength + 2);
			text(chart.points[i].x, estXPos, height - estimateBuffer + tickLength + 2);
		}

		// plot point itself
		//adapted for all point types
		var x = xPos;
		var y = map(chart.points[i].y, yMax, yMin, innerGraphBuffer, height - innerGraphBuffer);
		var x1 = estXPos;
		var y1 = map(chart.estPoints[i].y, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
		var y2 = map(total, estYMin, estYMax, height - estimateBuffer, estimateBuffer);
		
		stroke(0);
		if((chart.points[i].y >= avg + 3 * s || chart.points[i].y <= avg - 3 * s) && s !== 0) { 
			stroke(255, 0, 0);
		}
		else {
			stroke(0);
		}
		strokeWeight(dotSize);
		ellipse(x, y, dotSize, dotSize);
		stroke('#B19CD9');
		ellipse(x1, y1, dotSize, dotSize);
		stroke('#ADD8E6');
		ellipse(x1, y2, dotSize, dotSize);
		stroke(0);
	}

	// other labels, misc formatting for graphs
	textSize(12);
	textAlign(CENTER, CENTER);
	strokeWeight(0);
	text('Project Tracker Variance', estimateGraphOrigin / 2, 25);
	text('Project Tracker Estimate vs Actual', estimateGraphOrigin + ((width - estimateGraphOrigin) / 2), 25);
	text('Time Value for Both Graphs: (' + chart.getTime() + ')', estimateGraphOrigin / 2, height - 25);
	translate(width / 2, height / 2);
	rotate(-PI/2);
	text('Metric Value: (' + chart.getMetric() + ')', 0, -(width / 2) + 15);
	rotate(PI/2);
	translate(0, 0);
}