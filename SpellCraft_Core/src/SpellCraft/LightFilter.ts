// <reference path="../declarations/declarations.d.ts" />

const VERTEX_GENERAL = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n  \n  varying vec2 vTextureCoord;\n  \n  uniform mat3 projectionMatrix;\n  \n  void main(void) {\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
const VERTEX_FLIP_Y = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n\n  varying vec2 vTextureCoord;\n  varying float flipY;\n\n  uniform mat3 projectionMatrix;\n\n  void main(void) {\n    flipY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
const FRAGMENT_LIGHTING = "\n  varying vec2 vTextureCoord;\n\n  uniform vec2 screenResolution;\n  uniform sampler2D uSampler;\n  uniform vec4 ambientLight;\n\n  void main(void) {\n    vec4 light = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = light + ambientLight;\n  }\n";

namespace SpellCraft
{
	export class LightingFilter extends PIXI.Filter
	{

		copyUniforms(filter:PIXI.Filter):void
		{
			for (var uniform in filter.uniforms)
			{
				if (filter.uniforms.hasOwnProperty(uniform) && this.uniforms.hasOwnProperty(uniform))
					this.uniforms[uniform] = filter.uniforms[uniform];
			}
		}

		setResolution(width:number, height:number):void
		{
			this.uniforms.screenResolution.x = width;
			this.uniforms.screenResolution.y = height;
		}

		setLightMap(lightMap:any):void
		{
			this.uniforms.lightMap = lightMap;
		}

		setAmbientLight(ambientLight:any):void
		{
			this.uniforms.ambientLight[0] = ambientLight.red * ambientLight.intensity;
			this.uniforms.ambientLight[1] = ambientLight.green * ambientLight.intensity;
			this.uniforms.ambientLight[2] = ambientLight.blue * ambientLight.intensity;
			this.uniforms.ambientLight[3] = ambientLight.intensity;
		}

	}
}
