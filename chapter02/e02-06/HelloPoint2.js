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

function main(){
    // 获取 canvas 元素
    var canvas = document.getElementById("webgl");

    // 获取 WebGL 上下文
    var gl = canvas.getContext("webgl");
    if(!gl){
        console.log("获取 Webgl上下文失败！");
        return;
    }

    // 初始化着色器
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("初始化着色器失败！");
        return;
    }

    // 获取 attribute 变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log("获取 attribute 变量的存储位置失败！")
        return;
    }

    // 将顶点位置传给 attribute 变量
    gl.vertexAttrib4f(a_Position, 0.0, 0.0, 0.0, 1.0);

    // 设置 canvas 的背景颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 使用背景颜色清空 canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制一个点
    gl.drawArrays(gl.POINT, 0, 1);
}