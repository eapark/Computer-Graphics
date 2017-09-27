"use strict";

var canvas;
var gl;

var vertices;
var radius_outer = 1.0;
var radius_inner = 0.9;
var radius_center = 0.05;
var theta = 5;

var hourMarkersMats = [];
var minutesMarkersMats = [];
var outerMat, innerMat, centerMat;

var u_baseColorLoc;
var u_ctMatrixLoc;
var u_projMatrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Circle vertices
    vertices = [
                vec2( radius_outer, 0.0 ),
                vec2( radius_outer * Math.cos(theta * Math.PI / 180 ), radius_outer * Math.sin(theta * Math.PI / 180) )
                ];

    for(var i=0; i<=(360/theta); i++) {
        var thetaRad = theta * i * (Math.PI/180);
        vertices.push( vec2(radius_outer * Math.cos(thetaRad), radius_outer * Math.sin(thetaRad) ) );
    }

    // Tick vertices (Just a square, will be scaled later)
    var tickSize = 0.05;
    vertices.push( vec2(tickSize * -1.0, tickSize * -1.0) );
    vertices.push( vec2(tickSize * -1.0, tickSize) );
    vertices.push( vec2(tickSize, tickSize) );
    vertices.push( vec2(tickSize, tickSize * -1.0) );

    var ctm, sm, rm, tm;
    // Define hourMarkersMats
    var scale_hourX = 0.5;
    var scale_hourY = 0.2;
    for(var h=0; h<12; h++) {
        ctm = mat4();
        sm = scalem( scale_hourX, scale_hourY, 1.0 );
        tm = translate( radius_inner - (tickSize * scale_hourX), 0.0, 0.0 );
        rm = rotateZ( h * (360/12) );
        ctm = mult(sm, ctm);
        ctm = mult(tm, ctm);
        ctm = mult(rm, ctm);
        hourMarkersMats.push(ctm);
    }

    // Define minutesMarkersMats
    var scale_minX = 0.2;
    var scale_minY = 0.1;
    for(var m=0; m<60; m++) {
        ctm = mat4();
        sm = scalem( scale_minX, scale_minY, 1.0 );
        tm = translate( radius_inner - (tickSize * scale_minX), 0.0, 0.0 );
        rm = rotateZ( m * (360/60) );
        ctm = mult(sm, ctm);
        ctm = mult(tm, ctm);
        ctm = mult(rm, ctm);
        hourMarkersMats.push(ctm);
        minutesMarkersMats.push(ctm);
    }

    // Define outerMat
    ctm = mat4();
    sm = scalem( radius_outer, radius_outer, radius_outer ); // no scaling done, since radius_outer=1.0, but in case we change radius_outer in the future
    ctm = mult(sm, ctm);
    outerMat = ctm;

    // Define innerMat
    ctm = mat4();
    sm = scalem( radius_inner, radius_inner, radius_inner );
    ctm = mult(sm, ctm);
    innerMat = ctm;

    // Define centerMat
    ctm = mat4();
    sm = scalem( radius_center, radius_center, radius_center );
    ctm = mult(sm, ctm);
    centerMat = ctm;
    
    // Load the data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );
    
    u_baseColorLoc = gl.getUniformLocation( program, "u_baseColor" );
    
    u_ctMatrixLoc = gl.getUniformLocation( program, "u_ctMatix" );

    u_projMatrixLoc = gl.getUniformLocation( program, "u_projMatix" );

    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    gl.uniformMatrix4fv(u_projMatrixLoc, false, flatten(pm));

    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Red plate
    gl.uniform3fv( u_baseColorLoc, vec3( 1.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(outerMat));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length-4 );

    // White plate
    gl.uniform3fv( u_baseColorLoc, vec3( 1.0, 1.0, 1.0 ) );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(innerMat));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length-4 );

    // Black dot
    gl.uniform3fv( u_baseColorLoc, vec3( 0.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(centerMat));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length-4 );

    // Blue hour ticks
    for(var h=0; h<12; h++) {
        var ctm = mat4();
        gl.uniform3fv( u_baseColorLoc, vec3( 0.0, 0.0, 1.0 ) );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten( hourMarkersMats[h] ));
        gl.drawArrays( gl.TRIANGLE_FAN, vertices.length-4, 4 );
    }

    // Blue minute ticks
    for(var m=0; m<60; m++) {
        gl.uniform3fv( u_baseColorLoc, vec3( 0.0, 0.0, 1.0 ) );
        gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten( minutesMarkersMats[m] ));
        gl.drawArrays( gl.TRIANGLE_FAN, vertices.length-4, 4 );
    }


    window.requestAnimFrame(render);
}
