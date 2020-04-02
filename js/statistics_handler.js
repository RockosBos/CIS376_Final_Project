/* 

statistics handler for CCASPC
defines functionality for statistical calculations

author: Christopher Ciolek

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

*/

// Each funtion uses three points of decimal accuracy except for the median function
var data = [{x:45,y:32},{x:1,y:3},{x:12,y:43},{x:4,y:23},{x:21,y:23},{x:12,y:5}]

function calcTimeMean(data) {

  var i, mean, length = data.length; sum = 0;
  for (i = 0; i < data.length; i++) {
    sum += data[i].x;
  }
  mean = sum / length;
  return mean;

}

function calcMetricMean(data) {

  var i, mean, length = data.length; sum = 0;
  for (i = 0; i < data.length; i++) {
    sum += data[i].y;
  }
  mean = sum / length;
  return mean;

}

function calcTimeVar(data) {
  var stdData = new Array;
  var i, sum = 0;

  for (i = 0; i < data.length; i++) {
    
    stdData.push(Math.pow((data[i].x - calcTimeMean(data)), 2));

    sum += stdData[i];
  }
  sum /= stdData.length;
  return sum;
}

function calcMetricVar(data) {
  var stdData = new Array;
  var i, sum = 0;

  for (i = 0; i < data.length; i++) {
    
    stdData.push(Math.pow((data[i].y - calcMetricMean(data)), 2));

    sum += stdData[i];
  }
  sum /= stdData.length;
  return sum;
}
function calcTimeMin(data){
  var m = data[0].x;
  var i;
  for ( i = 0; i < data.length; i++ ){
    if (data[i].x < m){
      m = data[i].x;
    }
  }
  return m;
}

function calcTimeMax(data){
   var m = data[0].x;
  var i;
  for ( i = 0; i < data.length; i++ ){
    if (data[i].x > m){
      m = data[i].x;
    }
  }
  return m;
}

function calcMetricMin(data){
  var m = data[0].y;
  var i;
  for ( i = 0; i < data.length; i++ ){
    if (data[i].y < m){
      m = data[i].y;
    }
  }
  return m;
}

function calcMetricMax(data){
   var m = data[0].y;
  var i;
  for ( i = 0; i < data.length; i++ ){
    if (data[i].y > m){
      m = data[i].y;
    }
  }
  return m;
}

function calcTimeStdDev(data) {
  var stdData = new Array;
  var i, sum = 0;

  for (i = 0; i < data.length; i++) {
    
    stdData.push(Math.pow((data[i].x - calcTimeMean(data)), 2));

    sum += stdData[i];
  }
  sum /= stdData.length;
  
  return (Math.sqrt(sum));
}

function calcMetricStdDev2(data) {
  var stdData = new Array;
  var i, sum = 0;

  for (i = 0; i < data.length; i++) {
    
    stdData.push(Math.pow((data[i].y - calcMetricMean(data)), 2));

    sum += stdData[i];
  }
  sum /= stdData.length;
  
  return (Math.sqrt(sum));
}

function calcMetricStdDev(data) {
  return Math.sqrt(calcMetricVar(data));
}

function calcTimeMed(data){
    data.sort( function(a,b) {return a - b;} );

    var half = data.length/2;

    if(data.length % 2)
        return data[half].x;
    else
        
    return ((data[half-1].x + data[half].x) / 2.0);
}
function calcMetricMed(data){
    data.sort( function(a,b) {return a - b;} );

    var half = data.length/2;

    if(data.length % 2)
        return data[half];
    else

    return ((data[half-1].y + data[half].y) / 2.0);
}