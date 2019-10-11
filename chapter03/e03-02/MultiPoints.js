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

    var n = initVertexBuffers(gl);
    if(n < 0){
        console.log("设置顶点位置失败！");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    // 顶点数组
    var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

    var n = 3;

    // 创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("创建缓冲区对象失败！")
        return -1;
    }

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 获取 a_Position 的地址
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");

    // 将缓冲区对象分配给 a_Position 变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 连接 a_Position 变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}