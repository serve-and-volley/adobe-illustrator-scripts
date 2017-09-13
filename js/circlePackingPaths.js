// This is script 1 of 2 for drawing circles
// This script draws the "path", or the line segments that the circles will be positioned on
// In addition, the user will input circle data, and this script will automatically embed this data accordingly
// Further documentation on how to use the script is forthcoming

/* Example user input for comma separated values inside a text object in the "CIRCLE DATA" layer:

poly-a 4 left 7-12 all,poly-a 5 left 7-12 all,poly-a 6 left 1-15 all,poly-a 7 left 1-16 all,poly-a 8 left 1-16 all,poly-a 9 left 1-17 all,poly-a 10 left 1-18 all,poly-a 11 left 1-19 all,poly-a 12 left 1-20 all,poly-a 13 left 1-20 all,poly-a 14 left 1-21 all,poly-a 15 left 1-22 all,poly-a 16 left 1-23 all,poly-a 17 left 1-19 all,poly-a 18 left 1-20 all,poly-a 19 left 1-21 all,poly-a 20 left 1-22 all,poly-a 21 left 1-22 all,poly-a 22 left 1-26 all

*/

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                    * 
*   LOCAL FUNCTIONS                                  *
*                                                    *
*   A. hexToRGB(hex)                                 *
*   B. boundingBoxCenter(polygon)                    *
*   C. showArray(output)                             *
*   D. distance(P1, P2)                              *
*   E. midpoint(P1, P2)                              *
*   F. vector(P1, P2)                                *
*   G. norm(v)                                       *
*   H. unitVector(P1, P2)                            *
*   I. dotProduct(u, v)                              *
*   J. vectorAngle(u, v)                             *
*   K. appendSegmentsArray(array, P0, P1, P2, P3)    *
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

// B. Find the center coordinates of the polygon "bounding box" (Adobe Illustrator term)
function boundingBoxCenter(polygon) {
    var x = polygon.left + 0.5*polygon.width;
    var y = polygon.top - 0.5*polygon.height;
    var result = [x, y];
    return result;  
}

// C. For debugging: Output array contents to alert box
function showArray(output) {
    var text = "";
    for (j = 0; j < output.length; j++) {
        text += "\n" + output[j];
    }
    return alert(text);
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

// F. Create 2-dimensional vector from two points
function vector(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var v = [x2-x1, y2-y1];
    return v;
}

// G. Find the Euclidean norm of a vector;
function norm(v) {
    var v1 = v[0];
    var v2 = v[1];
    var result = Math.sqrt(v1*v1 + v2*v2);
    return result;
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
    var degree = theta * (180/Math.PI);
    return degree;
}

// K. Helper function
function appendSegmentsArray(array, P0, P1, P2, P3) {
    var length = distance(P1, P2);
    var mid = midpoint(P1, P2);
    var d = distance(mid, focalPoint);
    var U1 = unitVector(P1, P0);
    var V1 = unitVector(P1, P2);
    var angle1 = vectorAngle(U1, V1);
    var U2 = unitVector(P2, P1);
    var V2 = unitVector(P2, P3);
    var angle2 = vectorAngle(U2, V2);
    var angleSum = angle1 + angle2;
    var sideSegment = 0;
    // Condition for a side segment: If the corners are 90 degrees +/- tolerance
    var tolerance = 15;
    if (Math.abs(180 - angleSum) < tolerance) {
        sideSegment = 1;
    }
    array.push([P1, P2, length, mid, d, U1, V1, angle1, U2, V2, angle2, angleSum, sideSegment]);      
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                        *
*   MAIN ROUTINE                                                         *
*                                                                        *
*   1. Input circle data from user                                       *
*   2. Initial setup                                                     *
*   3. Collect sub-polygon points                                        *
*   4. Collect sub-polygon segments                                      *
*   5. Determine the "front" and "back" segments for each sub-polygon    *
*   6. Remove any extra points                                           *
*   7. Draw the segments and embed the circle data                       *
*                                                                        *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// This is DEPRECATED
// 1. Input circle data from user
// var input = prompt("Enter circle manifest data:", "");
// newline = input.split("\n"); // For inputs with newline separated values

// 1. Initial setup
var startTime = Date.now() / 1000;
var doc = app.activeDocument;
var subPolygonsLayer = doc.layers['sub-polygons'];
var focusPolygon = doc.pathItems.getByName('focus polygon');
var focalPoint = boundingBoxCenter(focusPolygon);

// 2. User input
var circleDataLayer = doc.layers['CIRCLE DATA'];
var input = circleDataLayer.textFrames[0].contents;
var matrix = []; // 2d array for circle data input
comma = input.split(","); // For inputs with comma separated values
if (comma.length > 1) {matrix = comma};
//else if (newline.length > 1) {matrix = newline};

var circleData = {}; // Dictionary for circle data
for (var i = 0; i < matrix.length; i++) {
    matrix[i] = matrix[i].split(" ");
    var polygonRowSyntax = "polygon::" + matrix[i][0] + " sub-polygon::" + matrix[i][1];
    var circleSyntax = "align::" + matrix[i][2] + " circles::" + matrix[i][3] + " order::" + matrix[i][4];
    circleData[polygonRowSyntax] = circleSyntax;
}

// Iterate through all the subPolygons in the "subPolygons (SEGMENTS)" layer
for (var i = 0; i < subPolygonsLayer.pathItems.length; i++) {
    
    // 3. Collect subPolygon points
    var subPolygon = subPolygonsLayer.pathItems[i];
    var subPolygonPoints = [];
    for (var j = 0; j < subPolygon.pathPoints.length; j++) {
        subPolygonPoints.push(subPolygon.pathPoints[j].anchor);
    }
    var n = subPolygonPoints.length;

    // 4. Collect subPolygon segments
    var subPolygonSegments = [];

    // 4a. Append first segment
    var firstSegP0 = subPolygonPoints[n-1];
    var firstSegP1 = subPolygonPoints[0]; // First point of line segment
    var firstSegP2 = subPolygonPoints[1]; // Second point of line segment
    var firstSegP3 = subPolygonPoints[2];
    appendSegmentsArray(subPolygonSegments, firstSegP0, firstSegP1, firstSegP2, firstSegP3);

    // 4b. Append middle segments
    for (var j = 1; j < n-2; j++) {
        var midSegP0 = subPolygonPoints[j-1];
        var midSegP1 = subPolygonPoints[j]; // First point of line segment
        var midSegP2 = subPolygonPoints[j+1]; // Second point of line segment
        var midSegP3 = subPolygonPoints[j+2];
        appendSegmentsArray(subPolygonSegments, midSegP0, midSegP1, midSegP2, midSegP3);
    }     

    // 4c. Append second to last segment
    var secondLastSegP0 = subPolygonPoints[n-3];
    var secondLastSegP1 = subPolygonPoints[n-2]; // First point of line segment
    var secondLastSegP2 = subPolygonPoints[n-1]; // Second point of line segment
    var secondLastSegP3 = subPolygonPoints[0];
    appendSegmentsArray(subPolygonSegments, secondLastSegP0, secondLastSegP1, secondLastSegP2, secondLastSegP3);

    // 4d. Append last segment    
    var lastSegP0 = subPolygonPoints[n-2];
    var lastSegP1 = subPolygonPoints[n-1]; // First point of line segment
    var lastSegP2 = subPolygonPoints[0]; // Second point of line segment
    var lastSegP3 = subPolygonPoints[1];
    appendSegmentsArray(subPolygonSegments, lastSegP0, lastSegP1, lastSegP2, lastSegP3);    


    // 5. Determinethe "front" and "back" segments for each subPolygon polygon
    // Setup
    var segment1 = [];
    var segment2 = [];
    var counter = 0;
    for (var j = 0; j < subPolygonSegments.length; j++) {
        if (subPolygonSegments[j][12] == 1) {
            counter += 1;
        }
    }
    var basic = [];
    for (var j = 0; j < subPolygonSegments.length; j++) {
        basic.push(subPolygonSegments[j]);
    }
    var front = [];
    var back = [];
    var shortestDistance;
    var rectangle = 0;

    // 5a. Case 1: Rectangle - where all 4 corners of the polygon are 90 degrees (+/- tolerance)
    if (counter == subPolygonSegments.length) {
        rectangle = 1;
        basic = basic.sort(function (a,b) {
            if (a[2] > b[2]) return  1;
            if (a[2] < b[2]) return -1;
            return 0;
        });
        if (basic[0][4] < basic[1][4]) {
            front = [basic[0][0], basic[0][1]];
            back = [basic[1][1], basic[1][0]];
        }
        else {
            back = [basic[0][0], basic[0][1]];
            front = [basic[1][1], basic[1][0]];            
        }

        /* NOTE: This is the WRONG logic
        basic = basic.sort(function (a,b) {
            if (a[4] > b[4]) return  1;
            if (a[4] < b[4]) return -1;
            return 0;
        });
        front = [basic[0][0], basic[0][1]];
        shortestDistance = basic[0][4];
        
        if (subPolygonSegments[0][4] == shortestDistance) {
            back = [subPolygonSegments[2][1], subPolygonSegments[2][0]];
        }
        else if (subPolygonSegments[1][4] == shortestDistance) {
            back = [subPolygonSegments[3][1], subPolygonSegments[3][0]];
        }
        else if (subPolygonSegments[2][4] == shortestDistance) {
            back = [subPolygonSegments[0][1], subPolygonSegments[0][0]];                
        }
        else if (subPolygonSegments[3][4] == shortestDistance) {
            back = [subPolygonSegments[1][1], subPolygonSegments[1][0]];                
        }
        */                                
    }

    // 5b. Case 2: Where all corners are not 90 degrees (+/- tolerance)
    else if (counter == 0) {            
        var midpointDistance = [];
        for (var k = 0; k < polygonSegments.length; k++) {
            midpointDistance.push(polygonSegments[k]);
        }
        midpointDistance = midpointDistance.sort(function (a,b) {
            if (a[4] > b[4]) return 1;
            if (a[4] < b[4]) return -1;
            return 0;
        });
        front = [midpointDistance[0][0], midpointDistance[0][1]];
        back = [midpointDistance[3][1], midpointDistance[3][0]];
    }    

    // 5c. Case 3: Where there are at least 2 corners are 90 degrees (+/- tolerance)
    else if (counter > 0 && counter < subPolygonSegments.length) {
        // Determine "front" and "back" segments for complex polygons
        var sides = 0;
        var segment1a = [];
        var segment1b = [];
        for (var j = 0; j < subPolygonSegments.length; j++) {
            if (subPolygonSegments[j][12] == 1) {
                sides += 1;
            }
            else if (subPolygonSegments[j][12] == 0) {
                if (sides == 0) {
                    segment1a.push(subPolygonSegments[j][0]);
                    segment1a.push(subPolygonSegments[j][1]);
                }
                else if (sides == 1) {
                    segment2.push(subPolygonSegments[j][0]);
                    segment2.push(subPolygonSegments[j][1]);                             
                }
                else if (sides == 2) {
                    segment1b.push(subPolygonSegments[j][0]);
                    segment1b.push(subPolygonSegments[j][1]);
                }
            }
        }
        if (segment1b.length > 0) {
            for (var j = 0; j < segment1b.length; j++) {
                segment1.push(segment1b[j]);
            }
            for (var j = 0; j < segment1a.length; j++) {
                segment1.push(segment1a[j]);
            }
        }
        else {
            for (var j = 0; j < segment1a.length; j++) {
                segment1.push(segment1a[j]);
            }                
        }

        // Finalizing "front" and "back" segments for Case 3
        var segment1endpoints = [segment1[0], segment1[segment1.length-1]];
        var segment2endpoints = [segment2[0], segment2[segment1.length-1]];
        
        var midpoint1 = midpoint(segment1endpoints[0], segment1endpoints[1]);
        var midpoint2 = midpoint(segment2endpoints[0], segment2endpoints[1]);
        
        var distance1 = distance(focalPoint, midpoint1);
        var distance2 = distance(focalPoint, midpoint2);

        if (distance1 < distance2) {
            front = segment1;
            back = segment2.reverse();
        }
        else {
            front = segment2;
            back = segment1.reverse();          
        }           
    }

    // 6. Remove any extra points
    for (var j = 0; j < front.length-1; j++) {
        if (front[j] == front[j+1]) {
            front.splice(j, 1);
        }
    }
    for (var j = 0; j < back.length-1; j++) {
        if (back[j] == back[j+1]) {
            back.splice(j, 1);
        }
    }   

    // 7. Draw the segments and embed the circle data
    var circleSegmentsLayer = doc.layers['CIRCLE PATHS'];
    var segmentQuantity = front.length;
    var points = [];
    // The segment points that "bisect" each subPolygon polygon
    // Case for rectangles
    if (rectangle == 1) {
        points = [midpoint(front[0], front[1]), midpoint(back[0], back[1])];
    }
    // Case for non-rectangles
    else {
        for (var k = 0; k < front.length; k++) {
            var midSegmentPoints = midpoint(front[k], back[k]);
            points.push(midSegmentPoints);
        }        
    }

    // Seat segment geometries and syntax
    if (circleData[subPolygon.name] != undefined) {
        newSegment = circleSegmentsLayer.pathItems.add()
        newSegment.filled = false;
        newSegment.stroked = true;
        newSegment.strokeColor = hexToRGB("#8080ee");
        newSegment.strokeWidth = 0.25;
        newSegment.name = subPolygon.name + " " + circleData[subPolygon.name];
        for (k = 0; k < points.length; k++) {
            newPoint = newSegment.pathPoints.add();
            newPoint.anchor = points[k];
            newPoint.leftDirection = newPoint.anchor;
            newPoint.rightDirection = newPoint.anchor;
            newPoint.pointType = PointType.CORNER;
        }
        newSegment.closed = false;
    }

    /* FOR DEBUGGING
    else {
        newSegment = circleSegmentsLayer.pathItems.add()
        newSegment.filled = false;
        newSegment.stroked = true;
        newSegment.strokeColor = hexToRGB("#8080ee");
        newSegment.strokeWidth = 0.25;
        newSegment.name = subPolygon.name + " " + circleData[subPolygon.name];
        for (k = 0; k < points.length; k++) {
            newPoint = newSegment.pathPoints.add();
            newPoint.anchor = points[k];
            newPoint.leftDirection = newPoint.anchor;
            newPoint.rightDirection = newPoint.anchor;
            newPoint.pointType = PointType.CORNER;
        }
        newSegment.closed = false;
    }
    */ 
}
var endTime = Date.now() / 1000;
var duration = Math.round((endTime - startTime)*100) / 100;
alert(circleSegmentsLayer.pathItems.length + " circle segments drawn in " + duration + " seconds." );
