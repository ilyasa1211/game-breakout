#version 300 es

in vec2 aPos;
in vec4 aColor;

out vec4 vColor;

uniform vec2 aTranslation;

void main() {
  gl_Position = vec4(aPos + aTranslation, 0.0, 1.0);  
  vColor = aColor;
}