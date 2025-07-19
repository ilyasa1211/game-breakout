export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const ok: boolean = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!ok) {
    const err = new Error(gl.getProgramInfoLog(program) as string);

    gl.deleteProgram(program);
    throw err;
  }

  return program;
}

export function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new Error("create shader returns null");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!ok) {
    const err = new Error(gl.getShaderInfoLog(shader) as string);
    gl.deleteShader(shader);
    throw err;
  }

  return shader;
}
