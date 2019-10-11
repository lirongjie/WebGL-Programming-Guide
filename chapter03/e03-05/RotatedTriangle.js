var VSHADER_SOURCE = 
    'attribute vec4 a_Position;' +
    'uniform float u_CosB, u_SinB;' +
    'void main(){' +
    '   gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;' +
    '   gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;' +
    '   gl_Position.z = a_Position.z;' +
    '   gl_Position.w = a_Position.w;' +
    '}';

var FSHADER_SOURCE = 
    'void main(){' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
    '}';

var ANGLE = 90.0;

function main(){
    var canvas = document.getElementById("webgl");

    var gl = canvas.getContext("webgl");
    if(!gl){
        console.log('获取 WebGL 上下文失败！');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('初始化着色器失败！')
        return;
    }

    var n = initVertexBuffers(gl);
    if(n < 0){
        console.log('初始化缓冲区对象失败！');
        return;
    }

    var radian = Math.PI * ANGLE / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    var u_CosB = gl.getUniformLocation(gl.program, "u_CosB");
    var u_SinB = gl.getUniformLocation(gl.program, "u_SinB");
    if(!u_CosB || !u_SinB){
        console.log('获取 uniform 变量地址失败！');
        return;
    }

    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);


}

function initVertexBuffers(gl){
    var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

    var n = 3;

    // 创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('创建缓冲区对象失败！');
        return -1;
    }

    // 将缓冲区对象绑定到指定目标上
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 将数据写入缓冲区对象
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if(a_Position < 0){
        console.log('获取 attribute 变量地址失败！');
        return -2;
    }

    // 将缓冲区对象分配给 a_Position 变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 连接 a_Position 变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}