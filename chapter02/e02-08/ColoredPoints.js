var VSHADER_SOURCE =
    'attribute vec4 a_Positon;' +
    'void main(){' +
    '   gl_Position = a_Positon;' +
    '   gl_PointSize = 10.0;' +
    '}';
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform vec4 u_FragColor;' +
    'void main(){' +
    '   gl_FragColor = u_FragColor;' +
    '}';

function main() {
    var canvas = document.getElementById("webgl");

    var gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("获取 WebGL 上下文失败！");
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败！");
        return;
    }

    var a_Positon = gl.getAttribLocation(gl.program, "a_Positon");
    if (a_Positon < 0) {
        console.log("获取 a_Position 存储位置失败！");
        return;
    }

    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("获取 u_FragColor 存储位置失败！");
        return;
    }

    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Positon, u_FragColor);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, a_Positon, u_FragColor) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = -(y - rect.top - canvas.height / 2) / (canvas.height / 2);

    g_points.push([x, y]);

    if (x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0]);
    } else if (x < 0 && y < 0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0]);
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0]);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < g_points.length; ++i) {
        gl.vertexAttrib2f(a_Positon, g_points[i][0], g_points[i][1]);
        gl.uniform4f(u_FragColor, g_colors[i][0], g_colors[i][1], g_colors[i][2], g_colors[i][3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}