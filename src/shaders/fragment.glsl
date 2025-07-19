#version 300 es

precision highp float;

out vec4 outColor;
in vec4 vColor;

void main() {
  outColor = vColor;
}