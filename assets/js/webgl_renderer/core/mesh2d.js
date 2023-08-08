class Mesh2D {
    constructor(gl) {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        var attribPosLoc = 0;

        this.vertices = new Float32Array([
            10, 20,
            180, 20,
            10, 30,
            10, 30,
            180, 20,
            180, 30
        ]);

        this.vertCount = this.vertices.length / 2;

        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attribPosLoc);
        gl.vertexAttribPointer(attribPosLoc, 2, gl.FLOAT, false, 0, 0);
    
        gl.bindVertexArray(null);
    }

    release(gl) {
        gl.deleteBuffer(this.posBuffer);
        gl.deleteVertexArray(this.vao);
    }
};

class Rect2D {
    constructor(gl, x, y, width, height) {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        
        var attribPosLoc = 0;

        this.vertices = new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]);

        this.vertCount = this.vertices.length / 2;

        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attribPosLoc);
        gl.vertexAttribPointer(attribPosLoc, 2, gl.FLOAT, false, 0, 0);
    
        gl.bindVertexArray(null);
    }

    release(gl) {
        gl.deleteBuffer(this.posBuffer);
        gl.deleteVertexArray(this.vao);
    }
};