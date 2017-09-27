"use strict";

var gl;
var vertices;
var colors;
var u_ColorLoc;

// The onload event occurs when all the script files are read;
// it causes init() function to be executed
window.onload = function init()
{
    // create WebGL context which is a JavaScript object that contains all the WebGL
    // functions and parameters
    // "gl-canvas" is the id of the canvas specified in the HTML file
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    vertices = [
        vec3( -0.75, 0.15, 1.0 ),
        vec3( -0.25, 0.65, 1.0 ),
        vec3( 0.25, 0.15, 1.0 ),

        vec3( 0.0, 0.4, 1.0 ),
        vec3(  0.25,  0.65, 1.0 ),
        vec3(  0.5, 0.4, 1.0 ),

        vec3( 0.0, 0.4, 1.0 ),
        vec3( 0.5, 0.4, 1.0 ),
        vec3( 0.25, 0.15, 1.0 ),

        vec3( 0.25, 0.15, 1.0 ),
        vec3( 0.5, 0.4, 1.0 ),
        vec3( 0.75, 0.15, 1.0 ),

        vec3( -0.25, 0.15, 1.0 ),
        vec3( 0.75, 0.15, 1.0 ),
        vec3( 0.25, -0.4, 1.0 ),

        vec3( -0.25, -0.4, 1.0 ),
        vec3( 0.25, -0.4, 1.0 ),
        vec3( 0.0, -0.65, 1.0 ),

        vec3( -0.25, -0.4, 1.0 ),
        vec3( 0.0, -0.125, 1.0 ),
        vec3( 0.25, -0.4, 1.0 ),

        vec3( -0.25, 0.15, 1.0 ),
        vec3( 0.0, -0.125, 1.0 ),
        vec3( -0.25, -0.4, 1.0 ),

        vec3( -0.75, 0.15, 1.0 ),
        vec3( -0.25, 0.15, 1.0 ),
        vec3( -0.25, -0.4, 1.0 )
    ];

    colors = [
        vec3( 0.26, 0.61, 0.96 ),
        vec3( 0.54, 0.32, 0.95 ),
        vec3( 0.95, 0.94, 0.32 ),
        vec3( 0.32, 0.95, 0.91 ),
        vec3( 0.95, 0.67, 0.26 ),
        vec3( 0.43, 0.21, 0.14 ),
        vec3( 0.37, 0.95, 0.40 ),
        vec3( 1.0, 0.11, 0.05 ),
        vec3( 0.99, 0.66, 0.64 )
    ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    // create a vertex buffer object (VBO) in the GPU and later place our data in that object
    var vBuffer = gl.createBuffer();
    // gl.ARRAY_BUFFER: vertex attribute data rather than indices to data
    // the binding operation makes this buffer the current buffer until a differ buffer is binded
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    
    // gl.bufferData accepts only arrays of native data type values and not JavaScript objects;
    // function flatten (defined in MV.js) converts JavaScript objects into the data format
    // accepted by gl.bufferData
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    // gl.getAttribLocation returns the index of an attribute variable in the vertex shader
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    // describe the form of the data in the vertex array
    // 4th parameter false: no data normalization;
    // 5th parameter 0: values are contiguous;
    // 6th parameter 0: address in the buffer where the data begin
    gl.vertexAttribPointer( a_vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
    // enable the vertex attributes that are in the shader
    gl.enableVertexAttribArray( a_vPositionLoc );

    u_ColorLoc = gl.getUniformLocation( program, "u_Color" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var t = 0; t < vertices.length/3; t++) {
        // triangle
        gl.uniform4fv( u_ColorLoc, vec4( colors[t], 1.0) );
        gl.drawArrays( gl.TRIANGLES, 3 * t, 3 );

        // black outline
        gl.uniform4fv( u_ColorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
        gl.drawArrays( gl.LINE_LOOP, 3 * t, 3 );
    }
}
