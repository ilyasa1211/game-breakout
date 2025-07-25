#version 300 es

in vec2 aPos;
in vec4 aColor;
in vec2 aTranslation;
in mat2 aRotation;

out vec4 vColor;

void main() {
  gl_Position = vec4(aPos * aRotation + aTranslation, 0.0, 1.0);  
  vColor = aColor;
}