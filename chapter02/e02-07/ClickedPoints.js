var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'void main(){' +
    '   gl_Position = a_Position;' +
    '   gl_PointSize = 10.0;' +
    '}';
var FSHADER_SOURCE =
    'void main(){' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
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

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("获取 attribute 变量的存储位置失败！");
        return;
    }

    // 注册鼠标点击事件响应函数
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];
function click(ev, gl, canvas, a_Position) {
    var x = ev.clientX; // 鼠标点击处的 x 坐标
    var y = ev.clientY; // 鼠标点击处的 y 坐标
    var rect = ev.target.getBoundingClientRect(); // 获取 canvas 元素在浏览器中的位置

    // 由浏览器客户区坐标系转换成 WebGL 坐标系
    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = - (y - rect.top - canvas.height / 2) / (canvas.height / 2);

    // 将坐标存储到数组中
    g_points.push([x, y]);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < g_points.length; ++i) {
        gl.vertexAttrib2f(a_Position, g_points[i][0], g_points[i][1]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}