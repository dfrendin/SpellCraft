attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;
varying float flipY;

uniform mat3 projectionMatrix;

void main(void)
{
	flipY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;
	vTextureCoord = aTextureCoord;
	gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}
