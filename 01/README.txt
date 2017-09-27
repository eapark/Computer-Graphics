net ID: epark3

This script draws a heart that comprises of multiple triangles.
I made two arrays, vertices and colors, to save different data.
Then once I send the vertices data into the vBuffer, I call the render() function.
Inside render(), I use a for loop to easily draw the triangles. In the for loop, gl.uniform4fv() is used to choose a color from the colors array.