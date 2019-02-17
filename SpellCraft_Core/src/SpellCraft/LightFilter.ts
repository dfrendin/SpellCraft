// <reference path="../declarations/declarations.d.ts" />

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
