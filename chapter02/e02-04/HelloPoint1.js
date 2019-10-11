var VSHADER_SOURCE =
    'void main() {' +
    '   gl_Position = vec4(0.0, 0.0, 0.0, 1.0);' +
    '   gl_PointSize = 10.0;' +
    '}';
var FSHADER_SOURCE =
    'void main() {' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
    '}';

function main() {
    // 获取 canvas 元素
    var canvas = document.getElementById("webgl");

    // 获取 webgl 绘图上下文
    var gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("获取WebGL上下文失败！");
        return;
    }

    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败！");
        return;
    }

    // 设置 canvas 颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空 canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1);
}