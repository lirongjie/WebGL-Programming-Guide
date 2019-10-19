var VSHADER_SOURCE = 
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'attribute vec4 a_Normal;' + // 法向量
    'uniform mat4 u_MvpMatrix;' +
    'uniform vec3 u_LightColor;' +
    'uniform vec3 u_LightDirection;' + 
    'uniform vec3 u_AmbientLight;' + // 环境光颜色
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    '   vec3 normal = normalize(vec3(a_Normal));' +
    // 计算光线方向和法向量的点积cosθ，当 cosθ < 0 时，光照到物体背面
    '   float nDotL = max(dot(u_LightDirection, normal), 0.0);' +
    // 计算漫反射光的颜色
    '   vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;' +
    // 计算环境反射光颜色
    '   vec3 ambient = u_AmbientLight * a_Color.rgb;' +
    // 漫反射光的颜色 + 环境反射光颜色
    '   v_Color = vec4(diffuse + ambient, a_Color.a);' +
    '}';
var FSHADER_SOURCE = 
    'precision mediump float;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_FragColor = v_Color;' +
    '}';

function main(){
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl');

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        return;
    }

    var n = initVertexBuffers(gl);
    if(n < 0){
        console.log('初始化缓冲区对象失败！');
        return;
    }

    // 获取 uniform 变量地址
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if(!u_MvpMatrix || !u_LightColor || !u_LightDirection || !u_AmbientLight){
        console.log('获取 uniform 变量失败！');
        return;
    }
    // 设置模型视图投影矩阵、入射光颜色向量、光线方向
    var mvpMatrix = new Matrix4().setPerspective(30, 1, 1, 100).lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    var lightColor = new Vector3([1.0, 1.0, 1.0]);
    var lightDirection = new Vector3([0.5, 3.0, 4.0]).normalize();
    var ambientLight = new Vector3([0.1, 0.1, 0.1]);
    // 向 uniform 变量传入数据
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniform3fv(u_LightColor, lightColor.elements);
    gl.uniform3fv(u_LightDirection, lightDirection.elements);
    gl.uniform3fv(u_AmbientLight, ambientLight.elements);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);
    var colors = new Float32Array([
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    if(!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)){
        return -1;
    }
    if(!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)){
        return -1;
    }
    if(!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)){
        return -1;
    }

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

function initArrayBuffer(gl, attribute_name, data, num, type){
    // 获取 attribute 变量的存储位置
    var a_attribute = gl.getAttribLocation(gl.program, attribute_name);
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
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // 连接 attribute 变量与缓冲区对象
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // 允许 attribute 变量访问缓冲区对象中的数据
    gl.enableVertexAttribArray(a_attribute);

    return true;
}