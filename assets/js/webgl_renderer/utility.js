const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const radians = (degrees) => degrees * Math.PI / 360.0;

function uniform1i(ctx, loc, x) {
    ctx.gl.uniform1i(loc, x);
}

function uniform1f(ctx, loc, x) {
    ctx.gl.uniform1f(loc, x);
}

function uniform2f(ctx, loc, arr) {
    ctx.gl.uniform2f(loc, arr[0], arr[1]);
}

function uniform3f(ctx, loc, arr) {
    ctx.gl.uniform3f(loc, arr[0], arr[1], arr[2]);
}

function uniform4f(ctx, loc, arr) {
    ctx.gl.uniform4f(loc, arr[0], arr[1], arr[2], arr[3]);
}

function uniform3fv(ctx, loc, v) {
    ctx.gl.uniform3fv(loc, v);
}

function uniform3f(ctx, loc, arr) {
    ctx.gl.uniform3f(loc, arr[0], arr[1], arr[2]);
}

function uniformMat2fv(ctx, loc, mat, bTranspose = false) {
    ctx.gl.uniformMatrix2fv(loc, bTranspose, mat);
}

function uniformMat3fv(ctx, loc, mat, bTranspose = false) {
    ctx.gl.uniformMatrix3fv(loc, bTranspose, mat);
}

function uniformMat4fv(ctx, loc, mat, bTranspose = false) {
    ctx.gl.uniformMatrix4fv(loc, bTranspose, mat);
}


(function () {
    'use strict';

    window.getShaderSource = function(id) {
        return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
    };

    function createShader(gl, source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {
        var program = gl.createProgram();
        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vshader);
        gl.deleteShader(vshader);
        gl.attachShader(program, fshader);
        gl.deleteShader(fshader);
        gl.linkProgram(program);

        var log = gl.getProgramInfoLog(program);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshader);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(fshader);
        if (log) {
            console.log(log);
        }

        return program;
    };

    window.loadImage = function(url, onload) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
            onload(img);
        };
        return img;
    };

    window.loadImages = function(urls, onload) {
        var imgs = [];
        var imgsToLoad = urls.length;

        function onImgLoad() {
            if (--imgsToLoad <= 0) {
                onload(imgs);
            }
        }

        for (var i = 0; i < imgsToLoad; ++i) {
            imgs.push(loadImage(urls[i], onImgLoad));
        }
    };

    window.loadObj = function(url, onload) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function(e) {
            var mesh = new OBJ.Mesh(this.response);
            onload(mesh);
        };
        xhr.send();
    };
})();