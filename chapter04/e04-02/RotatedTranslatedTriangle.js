var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'uniform mat4 u_ModelMatrix;' +
    'void main(){' +
    '   gl_Position = u_ModelMatrix * a_Position;' +
    '}';
var FSHADER_SOURCE =
    'void main(){' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
    '}';

var ANGLE = 60;
var Tx = 0.5;

function main() {
    var canvas = document.getElementById("webgl");

    var gl = canvas.getContext("webgl");
    if (!gl) {
        console.log('获取 WebGL 上下文失败！');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！')
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('初始化缓冲区对象失败！');
        return;
    }

    // 创建 Matrix4 对象，并进行模型转换
    var modelMatrix = new Matrix4();
    modelMatrix.setRotate(ANGLE, 0, 0, 1).translate(Tx, 0, 0);

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        return;
    }

    // 将旋转矩阵传给顶点着色器
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([0.0, 0.3, -0.3, -0.3, 0.3, -0.3]);

    var n = 3;

    // 创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('创建缓冲区对象失败！');
        return -1;
    }

    // 将缓冲区对象绑定到指定目标上
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 将数据写入缓冲区对象
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log('获取 attribute 变量地址失败！');
        return -2;
    }

    // 将缓冲区对象分配给 a_Position 变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 连接 a_Position 变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}
