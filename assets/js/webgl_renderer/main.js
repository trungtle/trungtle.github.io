// import sdf_vs from './shaders/sdf/sdf_vs.js';
// import sdf_ps from './shaders/sdf/sdf_ps.js';

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

// Visualization mode
const eVismodes = Object.freeze({
    vmDefault:      0,
    vmNormal:       1,
    vmScreenUV:     2,
    MAX:            3
});

class Camera {
    constructor() {
        this.origin = vec3.fromValues(0.0,1.0,4.0);
        this.front = vec3.fromValues(0.0,0.0,-1.0);
        this.up = vec3.fromValues(0.0,1.0,0.0);
        this.matrix = mat4.create();
    }
}


class Globals {
    constructor() {
        this.vismode = 0;
        this.now = 0;
        this.lastFrame = 0;
        this.deltaFrame = 0;
        this.translate = vec3.create();

        this.camera = new Camera();
        this.currentCamAngles = vec3.create();
        this.mouse = {
            X: 0,
            Y: 0,
            prevX: 0,
            prevY: 0,
            sensitivity: 0.1,
            firstMouse: true,
            isMouseInsideCanvas: false
        }
        this.uniformLocations = {}
    }
}

var g_globals = new Globals();

function unifLoc(ctx, name) {
    if (!(name in g_globals.uniformLocations)) {
        g_globals.uniformLocations[name] = ctx.gl.getUniformLocation(ctx.program, name);
    }

    return g_globals.uniformLocations[name];
}

function onVisMode() {
    g_globals.vismode = (g_globals.vismode + 1) % eVismodes.MAX;
}

function update() {
    // TODO: Use the correct time difference to update
    g_globals.lastFrame = g_globals.now;
    g_globals.now = Date.now();
    g_globals.deltaFrame = g_globals.now - g_globals.lastFrame;

    if (g_globals.mouse.isMouseInsideCanvas) {
        var mouseOffsetX = g_globals.mouse.X - g_globals.mouse.prevX;
        var mouseOffsetY = g_globals.mouse.prevY - g_globals.mouse.Y;
        g_globals.currentCamAngles[0] += radians(mouseOffsetX * g_globals.mouse.sensitivity);
        g_globals.currentCamAngles[1] += radians(clamp(mouseOffsetY  * g_globals.mouse.sensitivity, -89.0, 89.0));

        g_globals.mouse.prevX = g_globals.mouse.X;
        g_globals.mouse.prevY = g_globals.mouse.Y;

    }

    // Update camera
    mat4.lookAt(g_globals.camera.matrix, g_globals.camera.origin, vec3.fromValues(0,0,0), g_globals.camera.up);
}

function render(ctx, shape) {

    ctx.gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.gl.clearColor(0.5, 0.5, 0.8, 1.0);
    ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT | ctx.gl.DEPTH_BUFFER_BIT);
    uniform1f(ctx, unifLoc(ctx, "u_time"), g_globals.now);
    uniform2f(ctx, unifLoc(ctx, "u_mouse"), [g_globals.mouse.X, g_globals.mouse.Y]);
    uniform2f(ctx, unifLoc(ctx, "u_prevMouse"), [g_globals.mouse.prevX, g_globals.mouse.prevY]);
    uniform3f(ctx, unifLoc(ctx, "u_currentCamAngles"), g_globals.currentCamAngles);
    uniform4f(ctx, unifLoc(ctx, "u_color"), Math.random(), Math.random(), Math.random(), 1);
    uniform2f(ctx, unifLoc(ctx, "u_resolution"), [ctx.canvas.width, ctx.canvas.height]);
    uniformMat4fv(ctx, unifLoc(ctx, "u_camera"), g_globals.camera.matrix);
    uniform3f(ctx, unifLoc(ctx, "u_cameraOrigin"), g_globals.camera.origin);
    uniform3f(ctx, unifLoc(ctx, "u_cameraFront"), g_globals.camera.front);
    uniform3f(ctx, unifLoc(ctx, "u_translate"), g_globals.translate);
    uniform3fv(ctx, unifLoc(ctx, "u_lights"), [2.0,Math.sin(g_globals.now * 1e-10) + 2.0,2.0]);
    uniform1i(ctx, unifLoc(ctx, "u_visMode"), g_globals.vismode);

    ctx.gl.bindVertexArray(shape.vao);
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, shape.vertCount);

}

(function () {
    'use strict';

    var renderer = document.getElementsByClassName("renderer")[0];

    // -- Init Stats
    var script = document.createElement('script');

    script.onload = function() {
        var stats = new Stats();
        stats.showPanel(1);
        stats.domElement.style.cssText = 'position:relative;top:0px;left:0px;';
        renderer.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop)});
        };
    script.src='//mrdoob.github.io/stats.js/build/stats.min.js';

    document.head.appendChild(script);

    // -- Init Canvas
    var canvas = document.createElement('canvas');
    var aspectRatio = 1.77;
    canvas.width = renderer.offsetWidth * aspectRatio;
    canvas.height = renderer.offsetWidth;
    renderer.appendChild(canvas);

    // -- User inputs
    document.querySelector("#vismode").addEventListener('click', onVisMode);

    // Slider
    var sliderContainer = document.createElement("div");
    renderer.appendChild(sliderContainer);

    var slider = document.createElement("input");
    sliderContainer.appendChild(slider);
    slider.setAttribute("type", "range");
    slider.setAttribute("min", "1");
    slider.setAttribute("max", "100");
    slider.setAttribute("value", "50");
    slider.setAttribute("class", "slider");
    slider.setAttribute("id", "translateRange");
    slider.oninput = function() {
        g_globals.translate[0] = this.value * 1e-1 - 5.0;
    }

    canvas.addEventListener("mouseenter", function(  ) { g_globals.mouse.isMouseInsideCanvas=true;});
    canvas.addEventListener("mouseout", function(  ) { g_globals.mouse.isMouseInsideCanvas=false;});

    onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect(); // abs. size of element
        var scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
        var scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
        var mouseX = (e.clientX - rect.left) * scaleX;
        var mouseY = (e.clientY - rect.top) * scaleY;

        if (g_globals.mouse.firstMouse) {
            g_globals.mouse.prevX = mouseX;
            g_globals.mouse.prevY = mouseY;
            g_globals.mouse.firstMouse = false;
        } else {
            g_globals.mouse.prevX = g_globals.mouse.X;
            g_globals.mouse.prevY = g_globals.mouse.Y;
        }
        g_globals.mouse.X = mouseX;
        g_globals.mouse.Y = mouseY;
    }

    onkeydown = function(e) {
        let cameraSpeed = 5.5 * g_globals.deltaFrame * 1e-3;
        var scaledCameraFront = vec3.create();
        vec3.scale(scaledCameraFront, g_globals.camera.front, cameraSpeed);
        var negScaledCameraFront = vec3.create();
        vec3.negate(negScaledCameraFront, scaledCameraFront);
        var scaledCameraUp = vec3.create();
        vec3.scale(scaledCameraUp, g_globals.camera.up, cameraSpeed);
        var scaledCameraDown = vec3.create();
        vec3.negate(scaledCameraDown, scaledCameraUp);

        switch (e.code) {
            case "ArrowRight":
                vec3.add(g_globals.camera.origin, g_globals.camera.origin, scaledCameraFront);
                break;
            case "ArrowLeft":
                vec3.add(g_globals.camera.origin, g_globals.camera.origin, negScaledCameraFront);
                break;
            case "ArrowUp":
                vec3.add(g_globals.camera.origin, g_globals.camera.origin, scaledCameraUp);
                break;
            case "ArrowDown":
                vec3.add(g_globals.camera.origin, g_globals.camera.origin, scaledCameraDown);
                break;
        }
    }

    // -- Init WebGL Context

    var gl = canvas.getContext('webgl2', { antialias: false });
    var isWebGL2 = !!gl;
    if(!isWebGL2) {
        document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
        return;
    }

    // -- Init Program
    // var program = createProgram(gl, sdf_vs, sdf_ps);
    var program = createProgram(gl, getShaderSource("vs-sdf"), getShaderSource("ps-sdf"));

    // var texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);

    // // fill texture with 3x2 pixels
    // const level = 0;
    // const internalFormat = gl.LUMINANCE;
    // const width = 3;
    // const height = 2;
    // const border = 0;
    // const format = gl.LUMINANCE;
    // const type = gl.UNSIGNED_BYTE;
    // const data = new Uint8Array([
    //     128,  64, 128,
    //     0, 192,   0,
    // ]);
    // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);
    // // set the filtering so we don't need mips and it's not filtered
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // const alignment = 1;
    // gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);

    var ctx = {
        gl: gl,
        program: program,
        canvas: canvas
    };

    drawScene();

    function drawScene() {
        gl.useProgram(program);
        var screen = new Rect2D(gl, 0, 0, canvas.width, canvas.height);
        update();
        render(ctx, screen);
        requestAnimationFrame(drawScene);
    }

    // -- Delete WebGL resources
    // gl.deleteProgram(program);

})();