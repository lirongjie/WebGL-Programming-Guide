var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'uniform mat4 u_MvpMatrix;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    '   v_Color = a_Color;' +
    '}';
var FSHADER_SOURCE =
    'precision mediump float;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_FragColor = v_Color;' +
    '}';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl');

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('初始化缓冲区对象失败！');
        return;
    }

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('获取 uniform 变量失败！');
        return;
    }

    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    // 顶点坐标和颜色
    var verticesColors = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0,   // V0
        -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  // V1
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // V2
        1.0, -1.0, 1.0, 1.0, 1.0, 0.0,  // V3
        1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // V4
        1.0, 1.0, -1.0, 0.0, 1.0, 1.0,  // V5
        -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, // V6
        -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 // V7
    ]);
    // 顶点索引（每个面由两个三角形组成，6 个顶点）
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3, // 前
        0, 3, 4, 0, 4, 5, // 右
        0, 5, 6, 0, 6, 1, // 上
        1, 6, 7, 1, 7, 2, // 左
        7, 4, 3, 7, 3, 2, // 下
        4, 7, 6, 4, 6, 5  // 后
    ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0 || a_Color < 0) {
        console.log('获取 attribute 变量失败！');
        return -1;
    }

    // 创建缓冲区对象
    var vertexColorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexColorBuffer || !indexBuffer) {
        console.log('创建缓冲区失败!');
        return -2; 
    }

    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    // 允许 attribute 变量访问缓冲区对象
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);

    return indices.length;
}