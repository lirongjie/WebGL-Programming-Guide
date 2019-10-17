function loadShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {

            if (shader == gl.VERTEX_SHADER) {
                VSHADER_SOURCE = request.responseText;
            }
            else if (shader == gl.FRAGMENT_SHADER) {
                FSHADER_SOURCE = request.responseText;
            }
            if(VSHADER_SOURCE && FSHADER_SOURCE){
                start(gl);
            }
        }
    }

    request.open('GET', fileName, true);
    request.send();
}