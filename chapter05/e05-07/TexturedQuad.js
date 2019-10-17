var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec2 a_TexCoord;' +
    'varying vec2 v_TexCoord;' +
    'void main(){' +
    '   gl_Position = a_Position;' +
    '   v_TexCoord = a_TexCoord;' +
    '}';
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform sampler2D u_Sampler;' +
    'varying vec2 v_TexCoord;' +
    'void main(){' +
    '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);' +
    '}';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('获取绘图上下文失败！')
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if(!initTextures(gl, n)){
        console.log('初始化纹理失败！');
        return;
    }

}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // 顶点坐标，纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);

    var n = 4;
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_Position < 0 || a_TexCoord < 0) {
        console.log('获取 attribute 变量地址失败！');
        return -1;
    }


    // 创建缓冲区对象
    var vertexCoordBuffer = gl.createBuffer();
    if (!vertexCoordBuffer) {
        console.log('创建缓冲区对象失败！');
        return -2;
    }
    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordBuffer);
    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // 开启 attribute 变量对缓冲区对象中数据的访问
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {

    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('获取 uniform 变量失败！');
        return false;
    }

    // 创建纹理对象
    var texture = gl.createTexture();
    if (!texture) {
        console.log('创建纹理对象失败！');
        return false;
    }

    var image = new Image();

    image.onload = function () {
        // 对纹理对象进行 Y 轴翻转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        // 开启 0 号纹理单元
        gl.activeTexture(gl.TEXTURE0);

        // 向 target 绑定纹理对象
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // 配置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // 配置纹理图像
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        // 将 0 号纹理传递给着色器
        gl.uniform1i(u_Sampler, 0);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }

    image.src = '../../img/sky.jpg';

    return true;
}
