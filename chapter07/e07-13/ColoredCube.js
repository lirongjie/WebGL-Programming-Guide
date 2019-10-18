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
    
    var vertices = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);
    var colors = new Float32Array([
        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
        0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
        1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
        1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
        0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    ]);
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);
    
    // 将顶点坐标和颜色写入缓冲区对象
    if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;
    if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
        return -1;

    // 创建缓冲区对象
    var indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log('创建缓冲区对象失败！');
        return -2;
    }
    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute){
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if(a_attribute < 0){
        console.log('获取 attribute 变量失败！');
        return false;
    }

    // 创建缓冲区对象
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log('创建缓冲区对象失败！');
        return false;
    }
    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // 允许 attribute 变量访问缓冲区对象
    gl.enableVertexAttribArray(a_attribute);

    return true;
}