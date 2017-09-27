The code draws three circles, each of which has radius 1.0, 0.9, and 0.05 (ie. scaled by 1.0, 0.9, 0.05). These represent the circular surfaces of the clock.
Then we have just a square of length 0.1. But the square is scaled, translated, then rotated to draw the ticks of the clock.
The square for the ticks are all of size 0.1, but they are scaled by different values to make them skinnier and shorter for the minute ticks.
When translating the ticks, I did radius_inner - (length of square * scale of square) so that the ticks would line up with the circumference of the inner white circle.