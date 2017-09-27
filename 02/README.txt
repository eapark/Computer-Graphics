The four HTML buttons change the ball's speed or the paddle's position. In the JS script, we find the buttons by ID and give it callback functions for onclick event.

There are two uniform shader variables, one for center and one for color. In render(), we send the data twice (once for ball, once for paddle).

In setup(), the vertices array is filled with points for the ball and the paddle, which will be drawn out with triangle fans. The ball's initial position and velocity and the paddle's initial position are also defined here.

In animate(), we increment xCenter and yCenter. Then we check whether the ball hit a wall, the paddle, or if it's falling through. Once the ball falls through, the ball stops moving, the paddle can't be controlled anymore, and there's an alert saying "Game Over".