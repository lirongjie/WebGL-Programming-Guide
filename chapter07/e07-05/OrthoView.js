var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'uniform mat4 u_ProjMatrix;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_ProjMatrix * a_Position;' +
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
    var nf = document.getElementById('nearFar');

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

    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
        console.log('获取 uniform 变量失败！');
        return;
    }

    var projMatrix = new Matrix4();

    document.onkeydown = function (ev) {
        keydown(ev, gl, nf, n, u_ProjMatrix, projMatrix);
    };

    draw(gl, nf, n, u_ProjMatrix, projMatrix);

}

var g_near = 0.0;
var g_far = 0.5;
function keydown(ev, gl, nf,  n, u_ProjMatrix, projMatrix) {
    switch(ev.keyCode){
        case 37: 
            g_near -= 0.01;
            break;
        case 38:
            g_far += 0.01;
            break;
        case 39:
            g_near += 0.01;
            break;
        case 40:
            g_far -= 0.01;
            break;
        default:
            return;
    }
    draw(gl, nf, n, u_ProjMatrix, projMatrix);
}

function draw(gl, nf, n, u_ProjMatrix, projMatrix) {

    projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);

    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    nf.innerHTML = 'near : ' + Math.round(g_near * 100) / 100 + ',far : ' + Math.round(g_far * 100) / 100;

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // 顶点坐标和颜色
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,  // 绿色三角形在最后面
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,  // 黄色三角形在中间
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,  // 蓝色三角形在最前面
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4
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
