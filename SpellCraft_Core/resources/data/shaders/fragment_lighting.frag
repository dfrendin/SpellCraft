varying vec2 vTextureCoord;

uniform vec2 screenResolution;
uniform sampler2D uSampler;
uniform vec4 ambientLight;

void main(void)
{
	vec4 light = texture2D(uSampler, vTextureCoord);
	gl_FragColor = light + ambientLight;
}