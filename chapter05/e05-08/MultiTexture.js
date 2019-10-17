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
    'uniform sampler2D u_Sampler0;' +
    'uniform sampler2D u_Sampler1;' +
    'varying vec2 v_TexCoord;' +
    'void main(){' +
    '   gl_FragColor = texture2D(u_Sampler0, v_TexCoord) * texture2D(u_Sampler1, v_TexCoord);' +
    '}';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl');

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    var n = initVertexBuffer(gl);
    if(n < 0){
        console.log('初始化缓冲区对象失败！');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if(!initTextures(gl, n)){
        console.log('初始化纹理对象失败！');
        return;
    }
}

function initVertexBuffer(gl) {
    var verticesTexCoords = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    var n = 4;

    // 获取 attribute 变量地址
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_Position < 0 || a_TexCoord < 0) {
        console.log('获取 attribute 变量失败！');
        return -1;
    }

    // 创建缓冲区对象
    var verticesBuffer = gl.createBuffer();
    if (!verticesBuffer) {
        console.log('创建缓冲区对象失败！');
    }
    // 将缓冲区对象绑定到指定类型
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // 允许 attribute 变量访问缓冲区对象中的数据
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    // 获取 uniform 变量存储位置
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler0 || !u_Sampler1) {
        console.log('获取 uniform 变量失败！');
        return false;
    }

    // 创建纹理对象
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    if (!texture0 || !texture1) {
        console.log('创建纹理对象失败！');
        return false;
    }

    // 创建 Image 对象
    var image0 = new Image();
    var image1 = new Image();

    // 注册事件响应函数
    image0.onload = function () {
        loadTexture(gl, n, texture0, u_Sampler0, image0, 0);
    }
    image1.onload = function () {
        loadTexture(gl, n, texture1, u_Sampler1, image1, 1);
    }

    // 加载图像
    image0.src = '../../img/redflower.jpg';
    image1.src = '../../img/circle.gif';

    return true;
}

var g_texUnit0 = false;
var g_texUnit1 = false;
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    // 将纹理对象进行 Y 轴翻转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // 激活纹理
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    } else {
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }

    // 将纹理对象绑定到指定类型
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // 设置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // 将纹理单元编号传递给取样器
    gl.uniform1i(u_Sampler, texUnit);

    gl.clear(gl.COLOR_BUFFER_BIT);

    if(g_texUnit0 && g_texUnit1){
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}