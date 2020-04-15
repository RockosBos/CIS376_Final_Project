/* 

statistics handler for CCASPC
defines functionality for statistical calculations

author: Christopher Ciolek

Professor: Bruce Maxim
Course: CIS 375.001, Software Engineering

COCOMO FP to LOC calue determined via https://www.qsm.com/resources/function-point-languages-table using averages for languages
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

function calcEstimateMetricMax(data1, data2){
     m = 0;
     n = 0;
     for (var i = 0; i < data1.length; i++){
          m += data1[i].y;
	}
     for (var i = 0; i < data2.length; i++){
          n = data2[i].y;
	}
     if (m >= n){
          return m;
     }
     else if (n > m){
          return n;
     }
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

function calcEstimateCOCOMO(data){
     var fpToKloc = 0, kloc = 0, temp = 0;

     if (chart.metricType == 1){
          for (var i = 0; i < data.length; i++){
               if (i == data.length - 1){
                   temp = data[i].y;
                   fpToKloc = convertFPtoKLOC(temp);
                   kloc = fpToKloc;
               }
          }
	}
     else{
          for (var i = 0; i < data.length; i++){
               if (i == data.length - 1)
                   kloc = data[i].y;
          }
          kloc /= 1000; 
	}
     if (chart.COCOMOType == 0){
          temp = Math.pow(kloc, organicB);
          return organicA * temp;
     }
     else if (chart.COCOMOType == 1){
          temp = Math.pow(kloc, semiDetachedB);
          return semiDetachedA * temp;
	}
     else{
          temp = Math.pow(kloc, embeddedB);
          return embeddedA * temp;
	}
     
}

function calcActualCOCOMO(data){
     var fpToKloc = 0, kloc = 0, temp = 0;

     if(chart.metricType == 1){
          temp = sumPoints(data);
          fpToKloc = convertFPtoKLOC(temp);
          kloc = fpToKloc;
	}
     else{
          kloc = sumPoints(data);
          kloc /= 1000;
	}
     if (chart.COCOMOType == 0){
          temp = Math.pow(kloc, organicB);
          return organicA * temp;
     }
     else if (chart.COCOMOType == 1){
          temp = Math.pow(kloc, semiDetachedB);
          return semiDetachedA * temp;
	}
     else{
          temp = Math.pow(kloc, embeddedB);
          return embeddedA * temp;
	}
}

function convertFPtoKLOC(data){
     if (chart.langType == 0){
          return (data * 54) / 1000;
     }
     else if (chart.langType == 1){
          return (data * 50) / 1000;
     }
     else if (chart.langType == 2){
          return (data * 53) / 1000;
     }
     else if (chart.langType == 3){
          return (data * 47) / 1000;
     }
     else if (chart.langType == 4){
          return (data * 34) / 1000;
     }
     else{
          return (data * 42) / 1000;
	}
}

function sumPoints(data){
     var total = 0;

     for(var i = 0; i < data.length; i++)
     total += data[i].y;
     return total;
}