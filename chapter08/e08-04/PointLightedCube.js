var VSHADER_XOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'attribute vec4 a_Normal;' +
    'uniform mat4 u_MvpMatrix;' +
    'uniform mat4 u_ModelMatrix;' +
    'uniform mat4 u_NormalMatrix;' +
    'uniform vec3 u_LightColor;' +
    'uniform vec3 u_LightPosition;' +
    'uniform vec3 u_AmbientLight;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));' + //?
    // 计算顶点的世界坐标
    '   vec4 vertexPosition = u_ModelMatrix * a_Position;' +
    // 计算光线方向并归一化
    '   vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));' +
    // 计算漫反射光的颜色
    '   vec3 diffuse = u_LightColor * a_Color.rgb * max(dot(lightDirection, normal), 0.0);' +
    // 计算环境光的颜色
    '   vec3 ambient = u_AmbientLight * a_Color.rgb;' +
    '   v_Color = vec4(diffuse + ambient, a_Color.a);' +
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

    if (!initShaders(gl, VSHADER_XOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    var n = initVertexBuffer(gl);
    if(n < 0){
        console.log('初始化缓冲区对象失败！');
        return;
    }

    // 获取 uniform 变量的地址
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    
    if (!u_AmbientLight || !u_LightColor || !u_MvpMatrix || !u_NormalMatrix || !u_LightPosition || !u_ModelMatrix) {
        console.log('获取 uniform 变量失败！');
        return;
    }

    // 计算待传入 uniform 变量的值
    var modelMatrix = new Matrix4().setRotate(90, 0, 0, 1);
    var mvpMatrix = new Matrix4()
        .setPerspective(30, 1, 1, 100)
        .lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
        .concat(modelMatrix);
    var normalMatrix = new Matrix4().setInverseOf(modelMatrix).transpose(); 
    var lightColor = new Vector3([1.0, 1.0, 1.0]);
    var lightPosition = new Vector3([0.0, 3.0, 4.0]);
    var ambientLight = new Vector3([0.2, 0.2, 0.2]);

    // 向 uniform 变量传值
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniform3fv(u_LightColor, lightColor.elements);
    gl.uniform3fv(u_LightPosition, lightPosition.elements);
    gl.uniform3fv(u_AmbientLight, ambientLight.elements);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffer(gl) {
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,  // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0   // v4-v7-v6-v5 back
    ]);
    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) {
        return -1;
    }
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) {
        return -1;
    }
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) {
        return -1;
    }

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -2;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, size, type) {
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('获取 attribute 变量失败！')
        return false;
    }

    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('创建缓冲区对象失败！');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}