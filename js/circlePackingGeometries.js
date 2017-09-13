// This is script 2 of 2 for drawing circles

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                    * 
*   LOCAL FUNCTIONS                                  *
*                                                    *
*   A. hexToRGB(hex)                                 *
*   B. showArray(output)                             *
*   C. boundingBoxCenter(polygon)                    *
*   D. vector(P1, P2)                                *
*   E. determinant(u, v)                             *
*   F. distance(P1, P2)                              *
*   G. dotProduct(u, v)                              *
*   H. norm(v)                                       *
*   I. unitVector(P1, P2)                            *
*   J. vectorSum(u, v)                               *
*                                                    *
* * * * * * * * * * * * * * * * * * * * * * * * * * */

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
function showArray(output) {
    var text = "";
    for (j = 0; j < output.length; j++) {
        text += "\n" + output[j];
    }
    return alert(text);
}

// C. Find the center coordinates of the polygon "bounding box" (Adobe Illustrator term)
function boundingBoxCenter(polygon) {
    var x = polygon.left + 0.5*polygon.width;
    var y = polygon.top - 0.5*polygon.height;
    var result = [x, y];
    return result;  
}

// D. Create 2-dimensional vector from two points
function vector(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var v = [x2-x1, y2-y1];
    return v;
}

// E. The determinant of two vectors in R^2
//    Note: This is equivalent to the cross product of two vectors in R^2
function determinant(u, v) {
    var ux = u[0];
    var uy = u[1];
    var vx = v[0];
    var vy = v[1];
    var result = ux*vy - uy*vx;
    return result;
}

// F. Find the distance between two points
function distance(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return d;
}

// G. Find the dot product between two vectors
function dotProduct(u, v) {
    var u1 = u[0];
    var u2 = u[1];
    var v1 = v[0];
    var v2 = v[1];
    var result = u1*v1 + u2*v2;
    return result;
}

// H. Find the Euclidean norm of a vector;
function norm(v) {
    var v1 = v[0];
    var v2 = v[1];
    var result = Math.sqrt(v1*v1 + v2*v2);
    return result;
}

// I. Create 2-dimensional unit vector from two points
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

// J. The sum of two vectors in R^2
function vectorSum(u, v) {
    var u1 = u[0];
    var u2 = u[1];
    var v1 = v[0];
    var v2 = v[1];
    var sum = [u1 + v1, u2 + v2];
    return sum;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                              *
*   MAIN ROUTINE                                                               *
*                                                                              *
*   1. Input circle data from user                                               *
*   3. Collect segment points                                                  *
*   3. Collect row points                                                      *
*   4. Set the orientation of the segment points relative to the focus point   *
*   5. Find the total length of the segments                                   *
*   6. Extract circle syntax                                                     *
*   7. Calculate circle positions                                                *
*   8. Draw circles based on the calculated circle positions                       *
*                                                                              *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// 1. Input circle diameter size from user
var diameter = prompt("Enter circle diameter:", "");
var startTime = Date.now() / 1000;

// 2. Initial setup
var doc = app.activeDocument;
var segmentsLayer = doc.layers['CIRCLE PATHS'];
var focusPolygon = doc.pathItems.getByName('focus polygon');
var focalPoint = boundingBoxCenter(focusPolygon);

// Iterate through all the objects in the "circle SEGMENTS" layer
for (var i = 0; i < segmentsLayer.pathItems.length; i++) {

    // 3. Collect segment points
    var segment = segmentsLayer.pathItems[i];
    var segmentPoints = [];
    for (var j = 0; j < segment.pathPoints.length; j++) {
        segmentPoints.push(segment.pathPoints[j].anchor);
    }

    // 4. Set the orientation of the segment points relative to the focus point
    var n = segmentPoints.length;
    var u1 = vector(segmentPoints[0], segmentPoints[n-1]);
    var v1 = vector(segmentPoints[0], focalPoint);
    var u2 = vector(segmentPoints[n-1], segmentPoints[0]);
    var v2 = vector(segmentPoints[n-1], focalPoint);
    var cross1 = determinant(u1, v1);
    var cross2 = determinant(u2, v2);
    var ordered;
    if (cross1 > 0) {
        var leftPoint = segmentPoints[0];
        var rightPoint = segmentPoints[n-1];
        ordered = segmentPoints;
    }
    else if (cross2 > 0) {
        var leftPoint = segmentPoints[n-1];
        var rightPoint = segmentPoints[0];
        ordered = segmentPoints.reverse();
    }

    // 5. Find the total length of the segments
    var segmentLengths = [];
    var segmentLength;
    var totalLength = 0;
    for (var j = 0; j < n-1; j++) {
        segmentLength = distance(ordered[j], ordered[j+1]);
        segmentLengths.push(segmentLength);
        totalLength += segmentLength;
    }

    // 6. Extract circle syntax
    var segmentSyntax = segmentsLayer.pathItems[i].name;
    var syntaxPairs = segmentSyntax.split(" ");
    var polygonsyntax = syntaxPairs[0];
    var rowSyntax = syntaxPairs[1];
    var alignment = syntaxPairs[2].split("::")[1];
    var circleValue = syntaxPairs[3].split("::")[1];
    var circleRange = circleValue.split("-");
    var circleOrder = syntaxPairs[4].split("::")[1];
    var start = parseInt(circleRange[0]);
    var end = parseInt(circleRange[1]);
    var circleValues = [];
    if (circleOrder == "odd" || circleOrder == "even") {
        var firstcircle = start;
        circleValues.push(start);
        var circleCount = (end - start) / 2;
        for (var j = 1; j <= circleCount; j++) {
            circleValues.push(start + 2*j);
        }
    }
    else if (circleOrder == "all") {
        for (var j = start; j <= end; j++) {circleValues.push(j);}        
    }
    if (alignment == "right") {circleValues = circleValues.reverse();}
    
    // 7. Calculate circle positions
    var circleQuantity = circleValues.length;
    var circlespacing = totalLength/circleQuantity;
    var circlePoints = [];
    var remainder = 0;
    var unitVectors = [];
    for (var j = 0; j < ordered.length - 1; j++) {
        unitVectors.push(unitVector(ordered[j], ordered[j+1]));
    }

    var circleCounter = 0;
    // This for-loop is the key algorithm to the whole thing
    for (var j = 0; j < ordered.length - 1; j++) {
        var initialVector = vector([0, 0], ordered[j]);
        var initialIncrementVector = [];
        if (j == 0) {
            initialIncrementVector = [(circlespacing/2)*unitVectors[j][0], (circlespacing/2)*unitVectors[j][1]];
        }
        else {
            initialIncrementVector = [(circlespacing - remainder)*unitVectors[j][0], (circlespacing - remainder)*unitVectors[j][1]];
        }
        
        var vectorPoint = vectorSum(initialVector, initialIncrementVector);
        circlePoints.push(vectorPoint);
        circleCounter += 1;
        remainder = segmentLengths[j] - distance(initialVector, vectorPoint);

        for (var k = 0; k < circleQuantity; k++) {
            if (remainder >= circlespacing) {
                incrementVector = [circlespacing*unitVectors[j][0], circlespacing*unitVectors[j][1]];
                vectorPoint = vectorSum(vectorPoint, incrementVector);
                circlePoints.push(vectorPoint);
                circleCounter += 1;
                remainder = segmentLengths[j] - distance(initialVector, vectorPoint);
            }
        }
    }

    // 8. Draw circles based on the calculated circle positions
    for (var j = 0; j < circlePoints.length; j++) {
        var circlesyntax = polygonsyntax + " " + rowSyntax + " " + "circle::" + circleValues[j];
        var circlePoint = circlePoints[j];
        var circlesLayer = doc.layers['circles'];
        var height = diameter;
        var width = diameter;
        var top = circlePoint[1] + diameter/2;
        var left = circlePoint[0] - diameter/2;
        var newcircle = circlesLayer.pathItems.ellipse(top, left, width, height);
        newcircle.name = circlesyntax;
        newcircle.stroked = true;
        newcircle.strokeWidth = 0.25;
        newcircle.strokeColor = hexToRGB("#676767");
        newcircle.fillColor = hexToRGB("#fafafa")   
        var ratio = 0.5;
        var textSize = ratio*diameter;
        var circleLabel = doc.layers['circle labels'].textFrames.add(); 
        circleLabel.contents = circleValues[j];
        circleLabel.textRange.characterAttributes.fillColor = hexToRGB("#4d4d4d");
        circleLabel.textRange.characterAttributes.size = textSize;
        var expanded = circleLabel.createOutline();       
        expanded.top = circlePoint[1] + 0.5*expanded.height;
        expanded.left = circlePoint[0] - 0.5*expanded.width;
    }
}

var endTime = Date.now() / 1000;
var duration = Math.round((endTime - startTime)*100) / 100;
alert(circlesLayer.pathItems.length + " circle polygons and circle labels drawn in " + duration + " seconds." );
