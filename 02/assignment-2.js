"use strict";

var gl;
var vertices;
var xVelocity, yVelocity;
var xCenter, yCenter;
var radius = 0.05;

var xCenter_paddle, yCenter_paddle;
var wPaddle = 0.5/2;
var hPaddle = 0.05/2;

var paddleMove = true;

var u_vCenterLoc;
var u_ColorLoc;
var numBounce = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    var Btn_speedup = document.getElementById( "speedUp" );
    var Btn_speeddown = document.getElementById( "speedDown" );
    var Btn_paddleleft = document.getElementById( "paddleLeft" );
    var Btn_paddleright = document.getElementById( "paddleRight" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    Btn_speedup.onclick = function() {
        xVelocity *= 1.5;
        yVelocity *= 1.5;
    }
    Btn_speeddown.onclick = function() {
        xVelocity /= 1.5;
        yVelocity /= 1.5;
    }

    var paddleShift = 0.1;
    Btn_paddleleft.onclick = function() {
        if( xCenter_paddle - paddleShift > -1.0 && paddleMove ) {
            xCenter_paddle -= paddleShift;
        }
    }
    Btn_paddleright.onclick = function() {
        if( xCenter_paddle + paddleShift < 1.0 && paddleMove ) {
            xCenter_paddle += paddleShift;
        }
    }

    setup();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );
    
    // associate the center and color with uniform shader variable
    u_vCenterLoc = gl.getUniformLocation( program, "u_vCenter" );
    u_ColorLoc = gl.getUniformLocation( program, "u_Color" );

    render();
    
};

function updateBounceLabel() {
    var bounceLabel= document.getElementById("numBounceLabel");
    bounceLabel.innerHTML = "number of bounces: " + numBounce;
}

function setup() {

    // Push vertices for drawing the circle
    var theta = 20;
    vertices = [
                vec2( radius, 0.0 ),
                vec2( radius * Math.cos(theta * Math.PI / 180 ), radius * Math.sin(theta * Math.PI / 180) )
                ];

    for(var i=0; i<=(360/theta); i++) {
        var thetaRad = theta * i * (Math.PI/180);
        vertices.push( vec2(radius * Math.cos(thetaRad), radius * Math.sin(thetaRad) ) );
    }

    // Push vertices for drawing the paddle
    vertices.push( vec2(wPaddle * -1.0, hPaddle * -1.0) );
    vertices.push( vec2(wPaddle * -1.0, hPaddle) );
    vertices.push( vec2(wPaddle, hPaddle) );
    vertices.push( vec2(wPaddle, hPaddle * -1.0) );

    // Start circle at center of the top wall
    xCenter = 0.0;
    yCenter = 1.0 - radius;

    // Start paddle at the center of the bottom wall
    xCenter_paddle = 0.0;
    yCenter_paddle = -1.0 + hPaddle;

    xVelocity = 0.005;
    yVelocity = -0.005;
}

function randomPosNegOne()
{
    return Math.random() > 0.5 ? Math.random() : -Math.random();
}

function animate () {
    
    // increment xCenter and yCenter
    xCenter += xVelocity;
    yCenter += yVelocity;

    // check if xCenter/yCenter hit the paddle
    if ( yCenter - radius <= yCenter_paddle + hPaddle ) { // if ball is at top of the paddle
        if ( xCenter >= xCenter_paddle - wPaddle && xCenter <= xCenter_paddle + wPaddle ) { // if ball's x position is on paddle
            yVelocity *= -1;
            numBounce++;
            updateBounceLabel();
        }
    }

    // check if xCenter/yCenter hit the wall
    if ( xCenter+radius > 1.0 || xCenter-radius < -1.0 ) {
        xVelocity *= -1;
        numBounce++;
        updateBounceLabel();
    }
    if ( yCenter+radius > 1.0) {
        yVelocity *= -1;
        numBounce++;
        updateBounceLabel();
    }
    if ( yCenter+radius < -1.0) {
        if( paddleMove ) {
            xVelocity = 0;
            yVelocity = 0;
            paddleMove = false;
            alert("Game Over!");
        }
    }
    
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    animate();
    
    // Draw red paddle
    gl.uniform4fv( u_ColorLoc, vec4(1.0, 0.4, 0.4, 1.0) );
    gl.uniform2fv( u_vCenterLoc, vec2(xCenter_paddle, yCenter_paddle) );
    gl.drawArrays( gl.TRIANGLE_FAN, vertices.length - 4 , 4 );

    // Draw blue circle
    gl.uniform4fv( u_ColorLoc, vec4(0.4, 0.4, 1.0, 1.0) );
    gl.uniform2fv( u_vCenterLoc, vec2(xCenter, yCenter) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length - 4 );

    requestAnimFrame(render);
}
