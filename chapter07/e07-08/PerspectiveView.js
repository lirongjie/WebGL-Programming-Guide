var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'uniform mat4 u_ViewMatrix;' +
    'uniform mat4 u_ProjMatrix;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;' +
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

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ViewMatrix || !u_ProjMatrix) {
        console.log('获取 uniform 变量失败！');
        return;
    }

    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();

    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
       
        0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, 
        0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
        1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,

        0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, 
        0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
        1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,

        0.75,  1.0,   0.0,  0.4,  0.4,  1.0, 
        0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
        1.25, -1.0,   0.0,  0.4,  0.4,  1.0,

        
        -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4,
        -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
        -0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,

        -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, 
        -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
        -0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,

        -0.75,  1.0,   0.0,  0.4,  0.4,  1.0, 
        -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
        -0.25, -1.0,   0.0,  0.4,  0.4,  1.0
    ]);
    var n = 18;
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
