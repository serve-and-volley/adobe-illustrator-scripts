// This script drawns subPolygon polygons where the "front" and "back" segments 
// of the polygon polygon are determined "automatically",
// i.e algorithmically as opposed to "manually" by a human

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                    *
*   LOCAL FUNCTIONS                                  *
*                                                    *
*   A. hexToRGB(hex)                                 *
*   B. boundingBoxCenter(polygon)                    *
*   C. showArray(output)                             *
*   D. drawLine(P1, P2)                              *
*   E. distance(P1, P2)                              *
*   F. midpoint(P1, P2)                              *
*   G. vector(P1, P2)                                *
*   H. norm(v)                                       *
*   I. unitVector(P1, P2)                            *
*   J. dotProduct(u, v)                              *
*   K. vectorAngle(u, v)                             *
*   L. appendSegmentsArray(array, P0, P1, P2, P3)    *
*                                                    *
* * * * * * * * * * * * * * * * * * * * * * * * * * */ 

// LOCAL FUNCTIONS
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

// B. Find the center coordinates of the polygon bounding box
function boundingBoxCenter(polygon) {
    result = [];
    var x = polygon.left + 0.5*polygon.width;
    var y = polygon.top - 0.5*polygon.height;
    var result = [x, y];
    return result;  
}

// C. For debuggin: Output array contents to alert box
function showArray(output) {
    var text = "";
    for (j = 0; j < output.length; j++) {
        text += "\n" + output[j];
    }
    return alert(text);
}

// D. Draw a line segment between two points
function drawLine(P1, P2) {
    var line = doc.pathItems.add()
    line.stroked = true;
    line.strokeColor = hexToRGB("#000000");
    line.strokeWidth = 0.5;
    line.setEntirePath([P1, P2]);
}

// E. Find the distance between two points
function distance(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return d;
}

// F. Find the midpoint between two points
function midpoint(P1, P2) {
    var x1 = P1[0];
    var y1 = P1[1];
    var x2 = P2[0];
    var y2 = P2[1];
    var result = [(x1 + x2)*0.5, (y1 + y2)*0.5];
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

// J. Find the dot product between two vectors
function dotProduct(u, v) {
    var u1 = u[0];
    var u2 = u[1];
    var v1 = v[0];
    var v2 = v[1];
    var result = u1*v1 + u2*v2;
    return result;
}

// K. Find the angle between two vectors in degrees
function vectorAngle(u, v) {
    var cosTheta = dotProduct(u, v) / (norm(u)*norm(v));
    var theta = Math.acos(cosTheta);
    pi = Math.PI;
    var degree = theta * (180/pi);
    return degree;
}

// L. Helper function
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
    if (Math.abs(180 - angleSum) < 15) {
        sideSegment = 1;
    }
    array.push([P1, P2, length, mid, d, U1, V1, angle1, U2, V2, angle2, angleSum, sideSegment]);      
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                                  *
*   MAIN ROUTINE                                                                                   *
*                                                                                                  *
*   1. Initial set up                                                                              *
*   2. Create arrays for alphabtical subPolygon name ranges                                               *
*   3. Collect polygon polygon coordinates                                                         *
*   4. Collect polygon polygon line segment data, and determine "front" and "back" segments        *
*   5. Remove extra points                                                                         *
*   6. Set up for subPolygon drawing                                                                      *
*   7. Define the "segments" multidimensional array consisting of the subPolygon polygon line segments    *
*   8. Define the "points" array consisting of anchor points of the subPolygon polygon                    *
*   9. Create the first subPolygon polygon side                                                           *
*   10. Create the "middle" subPolygon polygon sides                                                      *
*   11. Create the last subPolygon polygon side                                                           *
*   12. Draw the subPolygon polygon                                                                       *
*                                                                                                  *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// 1. Initial set up
//var startTime = Math.floor(Date.now() / 1000);
var startTime = Date.now() / 1000;
var doc = app.activeDocument;
var polygonsLayer = doc.layers['polygons'];
var subPolygonsLayer = doc.layers['sub-polygons'];
var debug = 0; // Set debug mode
focusPolygon = doc.pathItems.getByName('focus polygon');
focalPoint = boundingBoxCenter(focusPolygon);

// 2. Create arrays for alphabtical subPolygon name ranges
alphabetMap = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26}
alphabetLettersSingle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
alphabetLettersDouble = ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'II', 'JJ', 'KK', 'LL', 'MM', 'NN', 'OO', 'PP', 'QQ', 'RR', 'SS', 'TT', 'UU', 'VV', 'WW', 'XX', 'YY', 'ZZ'];
alphabetLettersTriple = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH', 'III', 'JJJ', 'KKK', 'LLL', 'MMM', 'NNN', 'OOO', 'PPP', 'QQQ', 'RRR', 'SSS', 'TTT', 'UUU', 'VVV', 'WWW', 'XXX', 'YYY', 'ZZZ'];

for (var i = 0; i < polygonsLayer.pathItems.length; i++) {

    // 2a. Parse the syntax for the polygon name and subPolygon names
    subPolygonSyntax = polygonsLayer.pathItems[i].name;
    syntaxPairs = subPolygonSyntax.split(" ");
    if (syntaxPairs.length == 2) {
        polygonName = syntaxPairs[0].split("::")[1];
        subPolygonKey = syntaxPairs[1].split("::")[0];
        subPolygonValue = syntaxPairs[1].split("::")[1];
        // 2b. Create the array of subPolygon names
        subPolygons = [];
        subPolygonValueSplit = subPolygonValue.split(",");
        for (j = 0; j < subPolygonValueSplit.length; j++) {
            // 2c. If subPolygon value is a single character
            if (subPolygonValueSplit[j].indexOf('-') === -1) {
                subPolygons.push(subPolygonValueSplit[j]);
            }
            // 2d. If subPolygon value is a subPolygon range
            else {
                subPolygonRange = subPolygonValueSplit[j].split("-");
                // 2e. If subPolygon range is numerical
                if (isNaN(subPolygonRange[0]) === false) {
                    start = parseInt(subPolygonRange[0]);
                    end = parseInt(subPolygonRange[1]);
                    for (k = start; k <= end; k++) {subPolygons.push(k);}
                }
                // 2f. If subPolygon range is alphabetical
                else {
                    subPolygonRange = subPolygonValueSplit[j].split("-");
                    if (subPolygonRange[0].length === 1) {alphabetLetters = alphabetLettersSingle;}
                    else if (subPolygonRange[0].length === 2) {alphabetLetters = alphabetLettersDouble;}
                    else if (subPolygonRange[0].length === 3) {alphabetLetters = alphabetLettersTriple;}
                    start = alphabetMap[subPolygonRange[0][0]];
                    end = alphabetMap[subPolygonRange[1][0]];
                    showArray[start, end];
                    for (k = start; k <= end; k++) {subPolygons.push(alphabetLetters[k-1]);}                
                }
            }
        }

        // 3. Collect polygon polygon coordinates
        subPolygonQuantity = subPolygons.length;
        polygonsLayer.pathItems[i].name = syntaxPairs[0];

        var polygon = polygonsLayer.pathItems[i];
        var polygonPoints = [];
        for (var j = 0; j < polygon.pathPoints.length; j++) {
            polygonPoints.push(polygon.pathPoints[j].anchor);
        }

        var n = polygonPoints.length;
        var polygonSegments = [];
        // 3a. Append first segment
        P0 = polygonPoints[n-1];
        P1 = polygonPoints[0]; // First point of line segment
        P2 = polygonPoints[1]; // Second point of line segment
        P3 = polygonPoints[2];
        appendSegmentsArray(polygonSegments, P0, P1, P2, P3);
        // 3b. Append middle segments
        for (var j = 1; j < n-2; j++) {
            P0 = polygonPoints[j-1];
            P1 = polygonPoints[j]; // First point of line segment
            P2 = polygonPoints[j+1]; // Second point of line segment
            P3 = polygonPoints[j+2];
            appendSegmentsArray(polygonSegments, P0, P1, P2, P3);
        }
        // 3c. Append second to last segment
        P0 = polygonPoints[n-3];
        P1 = polygonPoints[n-2]; // First point of line segment
        P2 = polygonPoints[n-1]; // Second point of line segment
        P3 = polygonPoints[0];
        appendSegmentsArray(polygonSegments, P0, P1, P2, P3);
        // 3d. Append last segment    
        P0 = polygonPoints[n-2];
        P1 = polygonPoints[n-1]; // First point of line segment
        P2 = polygonPoints[0]; // Second point of line segment
        P3 = polygonPoints[1];
        appendSegmentsArray(polygonSegments, P0, P1, P2, P3);
        
        // For debugging
        if (debug == 1) {
            showArray(polygonSegments);
        }

        // 4. Collect polygon polygon line segment data, and determine "front" and "back" segments
        var segment1 = [];
        var segment2 = [];
        var counter = 0;
        for (var j = 0; j < polygonSegments.length; j++) {
            if (polygonSegments[j][12] == 1) {
                counter += 1;
            }
        }
        basic = [];
        for (var j = 0; j < polygonSegments.length; j++) {
            basic.push(polygonSegments[j]);
        }    

        // 4a. Case 1: All the corners of the polygon polygon are 90 degrees
        if (counter == polygonSegments.length) {
            basic = basic.sort(function (a,b) {
                if (a[4] > b[4]) return  1;
                if (a[4] < b[4]) return -1;
                return 0;
            });        
            front = [basic[0][0], basic[0][1]];
            shortestDistance = basic[0][4];
            if (polygonSegments[0][4] == shortestDistance) {
                back = [polygonSegments[2][1], polygonSegments[2][0]];
            }
            else if (polygonSegments[1][4] == shortestDistance) {
                back = [polygonSegments[3][1], polygonSegments[3][0]];
            }
            else if (polygonSegments[2][4] == shortestDistance) {
                back = [polygonSegments[0][1], polygonSegments[0][0]];                
            }
            else if (polygonSegments[3][4] == shortestDistance) {
                back = [polygonSegments[1][1], polygonSegments[1][0]];                
            }                                                
        }

        // 4b. Case 2: Section polygon has no parallel lines

        //else if (sideSegmentCounter == 0 && polygonSegments.length = 4) {
        else if (counter == 0) {            
            midpointDistance = [];
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
        // 4c. Case 3: Section polygon has at least 2 parallel lines
        else if (counter > 0 && counter < polygonSegments.length) {
            // Determine "front" and "back" segments for complex polygons
            sides = 0;
            segment1a = [];
            segment1b = [];
            for (var j = 0; j < polygonSegments.length; j++) {
                if (polygonSegments[j][12] == 1) {
                    sides += 1;
                }
                else if (polygonSegments[j][12] == 0) {
                    if (sides == 0) {
                        segment1a.push(polygonSegments[j][0]);
                        segment1a.push(polygonSegments[j][1]);
                    }
                    else if (sides == 1) {
                        segment2.push(polygonSegments[j][0]);
                        segment2.push(polygonSegments[j][1]);                             
                    }
                    else if (sides == 2) {
                        segment1b.push(polygonSegments[j][0]);
                        segment1b.push(polygonSegments[j][1]);
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

            segment1endpoints = [segment1[0], segment1[segment1.length-1]];
            segment2endpoints = [segment2[0], segment2[segment1.length-1]];
            
            midpoint1 = midpoint(segment1endpoints[0], segment1endpoints[1]);
            midpoint2 = midpoint(segment2endpoints[0], segment2endpoints[1]);
            
            distance1 = distance(focalPoint, midpoint1);
            distance2 = distance(focalPoint, midpoint2);

            if (distance1 < distance2) {
                front = segment1;
                back = segment2.reverse();
            }
            else {
                front = segment2;
                back = segment1.reverse();          
            }           
        }

        // 5. Remove extra points
        for (j = 0; j < front.length-1; j++) {
            if (front[j] == front[j+1]) {
                front.splice(j, 1);
            }
        }
        for (j = 0; j < back.length-1; j++) {
            if (back[j] == back[j+1]) {
                back.splice(j, 1);
            }
        }        

        // 6. Set up for subPolygon drawing
        matrix = [];
        for (j = 0; j < front.length; j++) {
            xIncrement = (back[j][0] - front[j][0]) / subPolygonQuantity;
            yIncrement = (back[j][1] - front[j][1]) / subPolygonQuantity;
            increment = [xIncrement, yIncrement];
            matrix.push([increment, front[j], back[j]]);
        }  
        for (j = 0; j < matrix.length; j++) {
            P1 = matrix[j][1];
            xIncrement = matrix[j][0][0];
            yIncrement = matrix[j][0][1];
            for (k = 0; k < subPolygonQuantity-1; k++) {
                p2x = P1[0] + xIncrement;
                p2y = P1[1] + yIncrement;
                P2 = [p2x, p2y];
                matrix[j].push(P2);
                P1 = P2;
            }
        }

        // 7. Define the "segments" multidimensional array consisting of the subPolygon polygon line segments
        segments = [];
        // 8. Define the "points" array consisting of anchor points of the subPolygon polygon
        points = [];
        // 9. Create the first subPolygon polygon side
        for (var j = 0; j < matrix.length; j++) {
            point = matrix[j][1];
            points.push(point);
        }
        segments.push(points);

        // 10. Create the "middle" subPolygon polygon sides
        for (var j = 3; j <= subPolygonQuantity+1; j++) {
            points = [];
            for (var k = 0; k < matrix.length; k++) {
                points.push(matrix[k][j]);
            }
            segments.push(points);
        }

        // 11. Create the last subPolygon polygon side
        points = [];
        for (var j = 0; j < matrix.length; j++) {
            points.push(matrix[j][2]);
        }
        segments.push(points);

        // 12. Draw the subPolygon polygon
        for (var j = 0; j < subPolygonQuantity; j++) {
            front = segments[j];
            back = segments[j+1];
            points = [];
            for (var k = 0; k < front.length; k++) {
                points.push(front[k]);
            }
            for (var k = back.length-1; k >= 0; k--) {
                points.push(back[k]);
            }
            newRow = subPolygonsLayer.pathItems.add()
            newRow.filled = false;
            //newRow.fillColor = hexToRGB("#dfdfdf");
            newRow.stroked = true;
            newRow.strokeColor = hexToRGB("#4d4d4d");
            newRow.strokeWidth = 0.25;
            newRow.name = "polygon::" + polygonName + " sub-polygon::" + subPolygons[j];
            for (k = 0; k < points.length; k++) {
                newPoint = newRow.pathPoints.add();
                newPoint.anchor = points[k];
                newPoint.leftDirection = newPoint.anchor;
                newPoint.rightDirection = newPoint.anchor;
                newPoint.pointType = PointType.CORNER;
            }
            newRow.closed = true;
        }
    }

    /* 
    // This is DEPRECATED because polygon outlines are drawn after polygons are manually merged
    // 14. Create polygon outlines
    outlinePoints = []
    for (var j = 0; j < polygonsLayer.pathItems[i].pathPoints.length; j++) {
      outlinePoints.push(polygonsLayer.pathItems[i].pathPoints[j].anchor);
    }
    outlinePoints.push(polygonsLayer.pathItems[i].pathPoints[0].anchor);
    newOutline = doc.layers['polygon outlines'].pathItems.add();
    newOutline.name = "<Path>";
    newOutline.filled = false;
    newOutline.stroked = true;
    newOutline.strokeColor = hexToRGB("#676767");
    newOutline.strokeWidth = 1.0;
    newOutline.closed = true;
    for (var j = 0; j < outlinePoints.length; j++) {
        newPoint = newOutline.pathPoints.add();
        newPoint.anchor = outlinePoints[j];
        newPoint.leftDirection = newPoint.anchor;
        newPoint.rightDirection = newPoint.anchor;
        newPoint.pointType = PointType.CORNER;
    }
    */   
}

//var endTime = Math.floor(Date.now() / 1000);
var endTime = Date.now() / 1000;
var duration = Math.round((endTime - startTime)*100) / 100;
alert(subPolygonsLayer.pathItems.length + " sub-polygons for " + polygonsLayer.pathItems.length + " polygons drawn in " + duration + " seconds." );
