var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Normal;' +
    'uniform mat4 u_MvpMatrix;' +
    'uniform mat4 u_NormalMatrix;' +
    'varying vec4 v_Color;' +
    'void main(){' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    '   vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));' +
    '   vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);' +
    '   float nDotL = max(dot(normal, lightDirection), 0.0);' +
    '   vec4 color = vec4(1.0, 0.4, 0.0, 1.0);' +
    '   v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);' +
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // 获取 uniform 变量地址
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_MvpMatrix || !u_NormalMatrix) {
        console.log('获取 uniform 变量地址失败!');
        return;
    }
    // 计算视图投影矩阵
    var viewProjMatrix = new Matrix4()
        .setPerspective(50, 1, 1, 100)
        .lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    document.onkeydown = function (ev) {
        keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    }

    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Angle = 0.0;
var g_joint1Angle = 45.0;
var g_joint2Angle = 0.0;
var g_joint3Angle = 0.0;
function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {

    switch (ev.keyCode) {
        case 40: // 上方向键
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 38: // 下方向键
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 39: // 右方向键
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37: // 左方向键
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        case 90: // Z 键
            g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
            break;
        case 88: // X 键
            g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
            break;
        case 86: // V 键 
            if (g_joint3Angle < 60.0) g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
            break;
        case 67: // C 键 
            if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
            break;
        default:
            return;
    }

    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // v0-v1-v2-v3 front
        0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, -0.5, // v0-v3-v4-v5 right
        0.5, 1.0, 0.5, 0.5, 1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
        -0.5, 1.0, 0.5, -0.5, 1.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
        -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 1.0, -0.5, 0.5, 1.0, -0.5  // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
    ]);
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3))
        return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3))
        return -1;

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('创建缓冲区对象失败！');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, size) {

    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('获取 attribute 变量失败！');
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


var g_modelMatrix = new Matrix4();
var g_MvpMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 绘制基座
    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    // 绘制手臂1
    var arm1Length = 10.0;
    g_modelMatrix.translate(0.0, baseHeight, 0.0).rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    // 绘制手臂2
    var arm2Length = 10.0;
    g_modelMatrix.translate(0.0, arm1Length, 0.0).rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    // 绘制手掌
    var palmLength = 2.0;
    g_modelMatrix.translate(0.0, arm2Length, 0.0).rotate(g_joint2Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, 2.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    // 绘制两个手指
    g_modelMatrix.translate(0.0, palmLength, 0.0);

    pushMatrix(g_modelMatrix);

    g_modelMatrix.translate(0.0, 0.0, 2.0).rotate(g_joint3Angle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    g_modelMatrix = popMatrix();

    g_modelMatrix.translate(0.0, 0.0, -2.0).rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var g_normalMatrix = new Matrix4();
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {

    // 模型矩阵入栈
    pushMatrix(g_modelMatrix);
    // 对模型矩阵进行缩放 并用来计算模型视图投影矩阵和模型矩阵的逆转置矩阵
    g_modelMatrix.scale(width, height, depth);
    g_MvpMatrix.set(viewProjMatrix).concat(g_modelMatrix);
    g_normalMatrix.setInverseOf(g_modelMatrix).transpose();
    // 传值
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // 绘制
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    // 模型矩阵出栈
    g_modelMatrix = popMatrix();
}

// 存储矩阵的栈
var g_matrixStack = [];
// 入栈
function pushMatrix(m) {
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}
// 出栈
function popMatrix() {
    return g_matrixStack.pop();
}