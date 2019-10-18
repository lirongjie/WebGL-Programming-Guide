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

    var mvpMartix = new Matrix4();
    var modelMartix = new Matrix4();
    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();

    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);
    // 清空颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    // 绘制左侧一组三角形
    modelMartix.setTranslate(-0.75, 0, 0);
    mvpMartix.set(projMatrix).concat(viewMatrix).concat(modelMartix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMartix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    // 绘制右侧一组三角形
    modelMartix.setTranslate(0.75, 0, 0);
    mvpMartix.set(projMatrix).concat(viewMatrix).concat(modelMartix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMartix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 1.0, 0.0, 0.4, 0.4, 1.0,
        -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
        0.5, -1.0, 0.0, 1.0, 0.4, 0.4,

        0.0, 1.0, -2.0, 1.0, 1.0, 0.4,
        -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
        0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

        0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
        -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
        0.5, -1.0, -4.0, 1.0, 0.4, 0.4
    ]);
    var n = 9;
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0 || a_Color < 0) {
        console.log('获取 attribute 变量失败！');
        return -1;
    }

    // 创建缓冲区对象
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('创建缓冲区对象失败!');
        return -2;
    }

    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    // 允许 attribute 变量访问缓冲区对象中的数据
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);

    return n;
}
