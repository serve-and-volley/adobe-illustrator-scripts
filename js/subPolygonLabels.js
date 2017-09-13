// This script draws subPolygon labels for subPolygon polygons
// User inputs "0" to draw labels inside the subPolygon polygon (for maps without seats)
// User inputs "1" to draw labels outside the subPolygon polygon (for maps with seats)

/* * * * * * * * * * * * * * * * * * * * * * * * *
*                                                *
*   LOCAL FUNCTIONS                              *
*                                                *
*   A. hexToRgb(hex)                             *
*   B. showArray(array)                          *
*   C. boundingBoxCenter(polygon)                *
*   D. distance(P1, P2)                          *
*   E. midpoint(P1, P2)                          *
*   F. norm(v)                                   *
*   G. vector(P1, P2)                            *
*   H. unitVector(P1, P2)                        *
*   I. dotProduct(u, v)                          *
*   J. vectorAngle(u, v)                         *
*   K. drawLine(P1, P2)                          *
*   L. angleBisectorVector(u, v)                 *
*   M. vectorReverse(u)                          *
*   N. interpolygonTwoLines(P1, m1, P2, m2)      *
*   O. drawLabel(x, y)                           *
*   P. appendSegmentsArray(P0, P1, P2, P3)       *
*   Q. createSegmentsArray(subPolygon)           *
*   R. labelPosition(subPolygon)                 *
*                                                *
* * * * * * * * * * * * * * * * * * * * * * * * */ 

// A. Convert hexadecimal color code to RGB color code
String.prototype.trim = function(){
  return String(this).replace(/^\s+|\s+$/g, '');
};

function hexToRGB(hex) {
  var hex = hex.trim().replace(/^#/, ''), color = new RGBColor();
  color.red   = parseInt(hex.slice(0,2), 16);
  color.green = parseInt(hex.slice(2,4), 16);
  color.blue  = parseInt(hex.slice(4,6), 16);
  return color;
}

// B. For debugging: Output array contents to alert box
function showArray(array) {
    var text = "";
    for (j = 0; j < array.length; j++) {
        text += "\n" + array[j];
    }
    return alert(text);
}

// C. Find the center coordinates of the polygon "bounding box" (Adobe Illustrator term)
function boundingBoxCenter(polygon) {
    var result = [];
    var x = polygon.left + 0.5*polygon.width;
    var y = polygon.top - 0.5*polygon.height;
    result = [x, y];
    return result;  
}

// D. Find the distance between two points
function distance(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return d;
}

// E. Find the midpoint between two points
function midpoint(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var result = [(x1 + x2)*0.5, (y1 + y2)*0.5];
    return result;
}

// F. Find the Euclidean norm of a vector;
function norm(v) {
    var v1 = v[0];
    var v2 = v[1];
    var result = Math.sqrt(v1*v1 + v2*v2);
    return result;
}

// G. Create 2-dimensional vector from two points
function vector(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var v = [x2-x1, y2-y1];
    return v;
}

// H. Create 2-dimensional unit vector from two points
function unitVector(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var v = [x2-x1, y2-y1];
    var v1 = v[0];
    var v2 = v[1];
    var u1 = v1 / norm(v);
    var u2 = v2 / norm(v);
    var u = [u1, u2];
    return u;
}

// I. Find the dot product between two vectors
function dotProduct(u, v) {
    var u1 = u[0];
    var u2 = u[1];
    var v1 = v[0];
    var v2 = v[1];
    var result = u1*v1 + u2*v2;
    return result;
}

// J. Find the angle between two vectors in degrees
function vectorAngle(u, v) {
    var cosTheta = dotProduct(u, v) / (norm(u)*norm(v));
    var theta = Math.acos(cosTheta);
    var pi = Math.PI;
    var degree = theta * (180/pi);
    return degree;
}

// K. Draw a line segment between two points
function drawLine(P1, P2) {
    var line = doc.pathItems.add()
    line.stroked = true;
    line.strokeColor = hexToRGB("#00FFFF");
    line.strokeWidth = 0.5;
    line.setEntirePath([P1, P2]);
}

// L. Find the angle bisector vector between two vectors
//    This uses the following theorem:
//       Let u and v be vectors where ||u|| > 0 and ||v|| > 0.
//       Then ||u||v + ||v||u is the angle bisctor vector of u and v.
//    Proof: https://proofwiki.org/wiki/Angle_Bisector_Vector
function angleBisectorVector(u, v) {
    var u1 = u[0];
    var u2 = u[1];
    var v1 = v[0];
    var v2 = v[1];
    var normU = norm(u);
    var normV = norm(v);
    var w1 = normU*v1 + normV*u1;
    var w2 = normU*v2 + normV*u2;
    var w = [w1, w2];
    return w;
}

// M. Reverses the direction of a vector
function vectorReverse(u) {
    var u1 = u[0];
    var u2 = u[1];
    var v = [-1*u1, -1*u2];
    return v;    
}

// N. Find the interpolygon point of two lines in point-slope form
function interpolygonTwoLines(P1, m1, P2, m2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var x3, y3;
    if (Math.abs(m2) == "Infinity") {
        x3 = x2;
        y3 = m1*(x3 - x1) + y1;
    }
    else if (Math.abs(m1) == "Infinity") {
        x3 = x1;
        y3 = m2*(x3 - x2) + y2;
    }
    else {
        x3 = (m1*x1 - m2*x2 + y2 -y1) / (m1 - m2);
        y3 = m1*(x3 - x1) + y1;     
    }
    interpolygonPoint = [x3, y3];
    return interpolygonPoint;
}

// O. Draw subPolygon label given x-y coordinates
function drawLabel(x, y) {
    var subPolygonLabel = doc.layers['sub-polygon labels'].textFrames.add(); 
    subPolygonLabel.contents = subPolygonNumber; 
    subPolygonLabel.textRange.characterAttributes.fillColor = hexToRGB(textColor);
    subPolygonLabel.textRange.characterAttributes.size = textSize;
    var expanded = subPolygonLabel.createOutline();
    expanded.top = y + expanded.height/2;
    expanded.left = x - expanded.width/2;
    subPolygonLabelCounter += 1; 
}

// P. Helper function for createSegmentsArray()
function appendSegmentsArray(P0, P1, P2, P3) {
    var length = distance(P1, P2);
    var mid = midpoint(P1, P2);
    var d = distance(mid, focalPoint);
    var U1 = unitVector(P1, P0);
    var V1 = unitVector(P1, P2);
    var angle1 = vectorAngle(U1, V1);
    var U2 = unitVector(P2, P1);
    var V2 = unitVector(P2, P3);
    var angle2 = vectorAngle(U2, V2);
    segments.push([P1, P2, length, mid, d, U1, V1, angle1, U2, V2, angle2]);
}

// Q. Creates an array for each subPolygon polygon
//    where each "subPolygon" of the array consists of the following "columns":
//    [0]: 1st point of the line segment
//    [1]: 2nd point of the line segment
//    [2]: Length of line segment
//    [3]: Midpoint of the line segment    
//    [4]: Distance of line segment midpoint to focal point
//    [5]: U1 unit vector from P1 to P0
//    [6]: V1 unit vector from P1 to P2
//    [7]: Vertex angle of 1st point
//    [8]: U2 unit vector from P2 to P1
//    [9]: V2 unit vector from P2 to P3
//    [10]: Vertex angle of 2nd point
function createSegmentsArray(subPolygon) {
    // Q1. Declare the "segments" multidimensional array
    segments = [];
    // Q2. Create "points" array consisting of anchor points comprising the subPolygon polygon
    points = [];
    for (var j = 0; j < subPolygon.pathPoints.length; j++) {
      points.push(subPolygon.pathPoints[j].anchor);
    }
    var n = points.length;
    // Q3. Append first segment
    P0 = points[n-1];
    P1 = points[0]; // First point of line segment
    P2 = points[1]; // Second point of line segment
    P3 = points[2];
    appendSegmentsArray(P0, P1, P2, P3);
    // Q4. Append middle segments
    for (var j = 1; j < n-2; j++) {
        P0 = points[j-1];
        P1 = points[j]; // First point of line segment
        P2 = points[j+1]; // Second point of line segment
        P3 = points[j+2];
        appendSegmentsArray(P0, P1, P2, P3);
    }
    // Q5. Append second to last segment
    P0 = points[n-3];
    P1 = points[n-2]; // First point of line segment
    P2 = points[n-1]; // Second point of line segment
    P3 = points[0];
    appendSegmentsArray(P0, P1, P2, P3);
    // Q6. Append last segment    
    P0 = points[n-2];
    P1 = points[n-1]; // First point of line segment
    P2 = points[0]; // Second point of line segment
    P3 = points[1];
    appendSegmentsArray(P0, P1, P2, P3);      
}

// R. Main local function to find subPolygon label coordinates
function labelPosition(subPolygon) {
    // R1. Create "segments" array
    createSegmentsArray(subPolygon);

    // R2. Create "filtered" array as a subset of the "segments" array
    var filtered = [];
    for (var k = 0; k < segments.length; k++) {
        var diff1 = Math.abs(90 - Math.abs(segments[k][7]));
        var diff2 = Math.abs(90 - Math.abs(segments[k][10]));
        if (
            segments[k][2] <= smallRowDistance &&
            segments[k][2] > textSize &&
            diff1 + diff2 < 30
            ) {
            filtered.push(segments[k]);          
        };        
    }

    // R3. Order "filtered" array by distance of line segment midpoint to focal point
    var a, b;
    filtered.sort(function (a,b) {
        if (a[4] > b[4]) return  1;
        if (a[4] < b[4]) return -1;
        return 0;
    });
    
    // R4. Case 1: If subPolygon is a BIG subPolygon (instead of a "small" subPolygon)
    // i.e. the smallest line segment is > smallRowDistance

    // R4a. Set maximum difference in the vertex angle from 90 degrees
    var maxAngleDiff = 30;
    if (filtered.length == 0) {
        for (var k = 0; k < segments.length; k++) {
            var diff1 = Math.abs(90 - Math.abs(segments[k][7]));
            var diff2 = Math.abs(90 - Math.abs(segments[k][10]));
            if (diff1 < maxAngleDiff && 
                diff2 < maxAngleDiff &&
                segments[k][2] <= bigRowDistance) {
                filtered.push(segments[k]);          
            };
        }
        var a, b;
        filtered.sort(function (a,b) {
            if (a[4] > b[4]) return  1;
            if (a[4] < b[4]) return -1;
            return 0;
        });

        // R4b. Target line segment
        var target = filtered[0];
        var targetMidpoint = target[3];
        var targetP1 = target[0];
        var targetP2 = target[1];
        var targetVector = vector(targetP1, targetP2);
        var d = 1.2*textSize;

        if (targetVector[1] == 0) {
            var pPlus = [targetMidpoint[0], targetMidpoint[1]+d];
            var pMinus = [targetMidpoint[0], targetMidpoint[1]-d];
        }
        else {
            var targetVectorSlope = targetVector[1] / targetVector[0];
            var perpendicularSlope = -1 / targetVectorSlope;

            // R4c. Calculate candidate points perpendicular from target line segment midpoint
            var x1 = targetMidpoint[0];
            var y1 = targetMidpoint[1];
            var m = perpendicularSlope;

            // R4d. Solution to 2x2 linear system
            var K = Math.sqrt(d*d / (1 + m*m));
            // Positive solution
            var x2Plus = x1 + K;
            var y2Plus = y1 + m*K;
            // Negative solution
            var x2Minus = x1 - K;
            var y2Minus = y1 - m*K;
            var pPlus = [x2Plus, y2Plus];
            var pMinus = [x2Minus, y2Minus];          
        }

        // R4e. Set up distances
        var mid1 = midpoint(targetMidpoint, pPlus)
        var mid2 = midpoint(targetMidpoint, pMinus)
        var center = boundingBoxCenter(subPolygon);
        var d1 = distance(center, mid1);
        var d2 = distance(center, mid2);

        // R4f. Find solution point closest to subPolygon bounding box center
        if (d1 < d2) {targetPoint = pPlus;};
        else {targetPoint = pMinus;};

        // R4g. Finalize subPolygon label coordinates and draw label
        if (outside == 0) {
            var targetX = targetPoint[0];
            var targetY = targetPoint[1];
            drawLabel(targetX, targetY);
            // For debugging 
            if (debug == 1) {
                drawLine(targetMidpoint, targetPoint);    
            }         
        }
        else if (outside == 1) {
            var midVector = vector(targetMidpoint, targetPoint);
            var reverseMidVector = vectorReverse(midVector);
            var labelPositionX = reverseMidVector[0] + targetMidpoint[0];
            var labelPositionY = reverseMidVector[1] + targetMidpoint[1];
            drawLabel(labelPositionX, labelPositionY);    
            if (debug == 1) {
                drawLine(targetMidpoint, [labelPositionX, labelPositionY]);
            }   
        }    
    }
    // R5. Case 2: If subPolygon is a SMALL subPolygon (as opposed to a "big" subPolygon)
    else {
        // R5a. Define target line segment
        var target = filtered[0];
        var targetP1 = target[0];
        var targetP2 = target[1];
        var u = target[5];
        var v = target[6];
        var s = target[8];
        var t = target[9];

        // R5b. Find angle bisector vectors
        var a = angleBisectorVector(u, v);
        var b = angleBisectorVector(s, t);

        // R5c. Find slopes of the angle bisector vectors
        var a1 = a[0]; a2 = a[1];
        var m1 = a2/a1;
        var b1 = b[0]; b2 = b[1];
        var m2 = b2/b1;

        // R5d. If the slopes are equal, i.e. parallel lines
        if (m1 == m2) {
            var targetMidpoint = target[3];
            var targetVector = vector(targetP1, targetP2);
            var targetVectorSlope = targetVector[1] / targetVector[0];
            var perpendicularSlope = -1 / targetVectorSlope;
            
            // Calculate candidate points perpendicular from target line segment midpoint
            var d = textSize;
            var x1 = targetMidpoint[0];
            var y1 = targetMidpoint[1];
            var m = perpendicularSlope;

            // Solution to 2x2 linear system
            var K = Math.sqrt(d*d / (1 + m*m));
            // Positive solution
            var x2Plus = x1 + K;
            var y2Plus = y1 + m*K;
            // Negative solution
            var x2Minus = x1 - K;
            var y2Minus = y1 - m*K;

            var pPlus = [x2Plus, y2Plus];
            var pMinus = [x2Minus, y2Minus];

            // Set up distances
            var mid1 = midpoint(targetMidpoint, pPlus)
            var mid2 = midpoint(targetMidpoint, pMinus)
            var center = boundingBoxCenter(subPolygon);
            var d1 = distance(center, mid1);
            var d2 = distance(center, mid2);

            // Find solution point closest to subPolygon bounding box center
            if (d1 < d2) {targetPoint = pPlus;};
            else {targetPoint = pMinus;};

            // For debugging
            if (debug == 1) {
                drawLine(targetMidpoint, targetPoint);    
            }
            
            // Finalize subPolygon label coordinates and draw label
            var targetX = targetPoint[0];
            var targetY = targetPoint[1];
            drawLabel(targetX, targetY);
        }
        // R5e. If the slopes are not equal
        else {
            // Find the subPolygon label point as the interpolygon of the angle bisecting vectors of P1 and P2
            var subPolygonLabelPoint = interpolygonTwoLines(targetP1, m1, targetP2, m2);
            var x = subPolygonLabelPoint[0];
            var y = subPolygonLabelPoint[1];
            
            if (outside == 0) {
                targetPoint = [x, y];
                if (debug == 1) {
                    drawLine(targetP1, targetPoint);
                    drawLine(targetP2, targetPoint);
                }
                drawLabel(x, y);       
            }        
            else if (outside == 1) {
                var targetMidpoint = target[3];
                var targetPoint = [x, y];
                var midVector = vector(targetMidpoint, targetPoint);
                var reverseMidVector = vectorReverse(midVector);
                var labelPositionX = reverseMidVector[0] + targetMidpoint[0];
                var labelPositionY = reverseMidVector[1] + targetMidpoint[1];
                drawLabel(labelPositionX, labelPositionY);
                if (debug == 1) {
                    //drawLine(targetMidpoint, [labelPositionX, labelPositionY]);
                    drawLine(targetP1, [labelPositionX, labelPositionY]);
                    drawLine(targetP2, [labelPositionX, labelPositionY]);                    
                }               
            }            
        }
    }     
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                                                      *
*   MAIN ROUTINE                                                                                                       *
*                                                                                                                      *
*   1. Initial set up                                                                                                  *
*   2. Define "subPolygons" layer as an array of sub-polygon path objects                                              *
*   3. Aggregate the sub-polygon distances to calculate the sub-polygon size constants to determine text size          *
*   4. Using the sub-polygon size constants, find the sub-polygon label coordinates and draw the sub-polygon label:    *
*      R. labelPosition() is the main local function:                                                                  *
*          R1. Create "segments" array                                                                                 *
*          R2. Create "filtered" array as a subset of the "segments" array                                             *
*          R3. Order "filtered" array by distance of line segment midpoint to focal point                              *
*          R4. Case 1: If sub-polygon is a "big" sub-polygon instead of a "small" sub-polygon                          *
*          R5. Case 2: If sub-polygon is not a "big" sub-polygon, but instead a "small" sub-polygon                    *
*                                                                                                                      *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// 1. Initial set up
var doc = app.activeDocument;
var textColor = "#4d4d4d";
var outside = prompt('Please specify the subPolygon label positions \n Enter "0": For labels INSIDE the subPolygons \n Enter "1": For labels OUTSIDE the subPolygons', "");
var debug = 1; // Set debug mode
var startTime = Date.now() / 1000;

// 2. Define "subPolygons" layer as an array of subPolygon path objects
var subPolygonLayer = doc.layers['sub-polygons'].pageItems;

// 3. Aggregate the subPolygon distances to calculate the subPolygon size constants to determine text size
// 3a. Array of shortest subPolygon segment lengths per subPolygon
//     Row segment lengths are rounded up to the nearest integer
var shortestRowLengths = []
for (var i = 0; i < subPolygonLayer.length; i++) {
    if (subPolygonLayer[i].typename == 'CompoundPathItem') {
        for (var h = 0; h < subPolygonLayer[i].pathItems.length; h++) {
            var subPolygon = subPolygonLayer[i].pathItems[h];
        }
    }
    else {
        var subPolygon = subPolygonLayer[i];    
    }
    // 3a1. Array of all the points of the subPolygon polygon
    var subPolygonPoints = [];
    for (var j = 0; j < subPolygon.pathPoints.length; j++) {
      subPolygonPoints.push(subPolygon.pathPoints[j].anchor);
    }
    // 3a2. Array of subPolygon polygon segment lengths rounded down to nearest integer
    var subPolygonSegmentLengths = [];
    // 3a3. First segment length to 2nd to last segment length
    for (var j = 0; j < subPolygonPoints.length-1; j++) {
        var segmentLength = distance(subPolygonPoints[j], subPolygonPoints[j+1]);
        var roundedSegmentLength = Math.ceil(segmentLength);
        subPolygonSegmentLengths.push(roundedSegmentLength);
    }
    // 3a4. Last segment length
    var segmentLength = distance(subPolygonPoints[subPolygonPoints.length-1], subPolygonPoints[0]);
    var roundedSegmentLength = Math.ceil(segmentLength);
    subPolygonSegmentLengths.push(roundedSegmentLength);
    
    // 3a5. Sort the segment lengths from shortest to longest
    sortedRowSegmentLengths = subPolygonSegmentLengths.sort(function(a, b){return a-b});

    // 3a6. Case if a line segment length is zero, i.e. a drawing error where two points are on top of each other
    if (sortedRowSegmentLengths[0] == 0) {
        shortestRowLengths.push(sortedRowSegmentLengths[1]);    
    }
    else {
        shortestRowLengths.push(sortedRowSegmentLengths[0]);    
    }
}

// 3b. Associative array of the quantity of shortest subPolygon segment lengths by length
var subPolygonCount = 0;
var frequenciesAssoc = {};
for (var i = 0; i < shortestRowLengths.length; i++) {
    var subPolygonLength = shortestRowLengths[i];
    frequenciesAssoc[subPolygonLength] = frequenciesAssoc[subPolygonLength] || 0;
    frequenciesAssoc[subPolygonLength] += 1;
    subPolygonCount += 1;
}

// 3c. Convert associative array to regular array
var frequencies = [];
for (var key in frequenciesAssoc) {
    frequencies.push([parseInt(key), parseInt(frequenciesAssoc[key])]);
}

// 3d. Sort the array by shortest subPolygon segment length ascending
var frequenciesSortedLength = frequencies;
var a, b;
frequenciesSortedLength.sort(function (a,b) {
    if (a[0] > b[0]) return  1;
    if (a[0] < b[0]) return -1;
    return 0;
});
var bigRowDistance = frequenciesSortedLength[frequenciesSortedLength.length - 1][0];

// 3e. Display frequencies by shortest subPolygon segment length
arraySorted = frequenciesSortedLength;
var text = subPolygonCount + " sub-polygons" + "\n" + "Length" + "   " + "Quantity";
for (var i = 0; i < arraySorted.length; i++) {
    text += "\n" + arraySorted[i][0] + "\t\t" + arraySorted[i][1];
}
alert(text);

// 3f. Sort the array by quantity descending
var frequenciesSortedQuantity = frequencies;
var a, b;
frequenciesSortedQuantity.sort(function (a,b) {
    if (a[1] < b[1]) return  1;
    if (a[1] > b[1]) return -1;
    return 0;
});
var modeRowDistance = frequenciesSortedQuantity[0][0];
var smallRowDistance = modeRowDistance + 0.5*modeRowDistance;

var fibonacci = 0.6180339887;
var textSize = fibonacci*smallRowDistance/2;

// 3g. Display the subPolygon size constants
var constants = "Row size constants" + "\n" +
    "bigRowDistance: " + bigRowDistance + "\n" +
    "modeRowDistance: " + modeRowDistance + "\n" +
    "smallRowDistance: " + smallRowDistance + "\n\n" +
    "textSize: " + textSize + "\n";
alert(constants);

// 4. Using the subPolygon size constants, find the subPolygon label coordinates and draw the subPolygon label.
//    labelPosition() is the core local function that does all the work.
for (var i = 0; i < subPolygonLayer.length; i++) {
    // 4a. Extract the subPolygon number
    var subPolygonSyntax = subPolygonLayer[i].name.split(" ");
    var subPolygonNumber = subPolygonSyntax[1].split("::")[1];

    // 4b. Extract polygon name
    var polygonName = subPolygonSyntax[0];
    
    // 4c. Set focal point to the top-left corner point of the polygon polygon bounding box
    var polygon = doc.layers['polygons'].pageItems.getByName(polygonName);
    var focalPoint = [polygon.left, polygon.top];

    // 4d. Calculate the label position for each subPolygon
    var subPolygon;
    // 4e. Check if subPolygon is a compound path
    if (subPolygonLayer[i].typename == 'CompoundPathItem') {
        for (h = 0; h < subPolygonLayer[i].pathItems.length; h++) {
            subPolygon = subPolygonLayer[i].pathItems[h];
            labelPosition(subPolygon);
        }
    }
    else {
        subPolygon = subPolygonLayer[i];
        labelPosition(subPolygon);
    }
}

var endTime = Date.now() / 1000;
var duration = Math.round((endTime - startTime)*100) / 100;
alert("Labels for " + subPolygonCount + " sub-polygons drawn in " + duration + " seconds." );
