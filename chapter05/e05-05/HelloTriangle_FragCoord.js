var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'void main(){' +
    '   gl_Position = a_Position;' +
    '}';

var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform float u_Width;' +
    'uniform float u_Height;' +
    'void main(){' +
    '   gl_FragColor = vec4(gl_FragCoord.x / u_Width, 0.0, gl_FragCoord.y / u_Height, 1.0);' +
    '}';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl');

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        return;
    }

    var u_Width = gl.getUniformLocation(gl.program, 'u_Width');
    var u_Height = gl.getUniformLocation(gl.program, 'u_Height');
    if (!u_Width || !u_Height) {
        console.log('获取 uniform 变量地址失败！');
        return;
    }

    gl.uniform1f(u_Width, canvas.width);
    gl.uniform1f(u_Height, canvas.height);

    var n = initVertexBuffers(gl);
    if (n < 0) {
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var n = 3;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('获取 attribute 变量失败！');
        return -1;
    }

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('创建缓冲区对象失败!');
        return -2;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 2, 0);

    gl.enableVertexAttribArray(a_Position);

    return n;
}
