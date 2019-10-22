var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    'attribute vec4 a_Normal;' +
    'uniform mat4 u_MvpMatrix;' +
    'uniform mat4 u_NormalMatrix;' +
    'uniform vec3 u_LightColor;' +
    'uniform vec3 u_LightDirection;' +
    'uniform vec3 u_AmbientLight;' +
    'uniform vec4 u_ModelMatrix;' +
    'uniform vec4 u_Eye;' +
    'varying float v_Dist;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));' +
    '   vec3 diffuse = u_LightColor * a_Color.rgb * max(dot(u_LightDirection, normal), 0.0);' +
    '   vec3 ambient = u_AmbientLight * a_Color.rgb;' +
    '   v_Color = vec4(diffuse + ambient, a_Color.a);' +
    '   v_Dist = distance(u_ModelMatrix * a_Position, u_Eye);' +
    '}';
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform vec3 u_FogColor;' + // 雾的颜色
    'uniform vec2 u_FogDist;' + // 雾化的起点和终点
    'varying vec4 v_Color;' +
    'varying float v_Dist;' +
    'void main(){' +
    '   float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);' +
    '   vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);' +
    '   gl_FragColor = vec4(color, v_Color.a);' +
    '}';

function main() {
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl');

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    var n = initVertexBuffer(gl);
    if (n < 0) {
        console.log('初始化缓冲区对象失败！');
        return;
    }

    // 获取 uniform 变量的地址
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    var u_Eye = gl.getUniformLocation(gl.program, 'u_Eye');
    var u_FogColor = gl.getUniformLocation(gl.program, 'u_FogColor');
    var u_FogDist = gl.getUniformLocation(gl.program, 'u_FogDist');
    if (!u_AmbientLight || !u_LightColor || !u_LightDirection || !u_MvpMatrix || !u_NormalMatrix || !u_ModelMatrix || !u_Eye || !u_FogColor || !u_FogDist) {
        console.log('获取 uniform 变量失败！');
        return;
    }
    // 计算待传入 uniform 变量的值
    var lightColor = new Vector3([1.0, 1.0, 1.0]);
    var lightDirection = new Vector3([0.5, 3.0, 4.0]).normalize();
    var ambientLight = new Vector3([0.1, 0.1, 0.1]);
    var fogColor = new Float32Array([0.137, 0.231, 0.423]);
    var fogDist = new Float32Array([55, 80]);
    var eye = new Float32Array([25, 65, 35]);
    // 向 uniform 变量传值
    gl.uniform3fv(u_LightColor, lightColor.elements);
    gl.uniform3fv(u_LightDirection, lightDirection.elements);
    gl.uniform3fv(u_AmbientLight, ambientLight.elements);
    gl.uniform3fv(u_FogColor, fogColor);
    gl.uniform2fv(u_FogDist, fogDist);
    gl.uniform4fv(u_Eye, eye);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0);

    // 当前旋转角度
    var currentAngle = 0.0;
    var viewProjMatrix = new Matrix4().setPerspective(30, 1, 1, 100).lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
    var tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_ModelMatrix, currentAngle);
        requestAnimationFrame(tick, canvas);
    };
    tick();
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

var g_MvpMatrix = new Matrix4();
var g_ModelMatrix = new Matrix4();
var g_NormalMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_ModelMatrix, currentAngle) {

    g_ModelMatrix.setRotate(currentAngle, 0, 1, 0);
    g_NormalMatrix.setInverseOf(g_ModelMatrix).transpose();
    g_MvpMatrix.set(viewProjMatrix).concat(g_ModelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_NormalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_ModelMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

var ANGLE_STEP = 10.0;
var g_last = Date.now();
function animate(angle) {

    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}
