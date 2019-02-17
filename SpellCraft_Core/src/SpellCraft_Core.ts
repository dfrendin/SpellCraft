/*=============================================================================
* SpellCraft - Core
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_Core.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/

// <reference path="declarations/declarations.d.ts" />
namespace SpellCraft
{
	export abstract class Core
	{
		public static kickstart()
		{
			TimeManager.initialize();

			//Precache files
			IO.precacheFile("vertex_general", "data/shaders/vertex_general.vert");
			IO.precacheFile("fragment_lighting", "data/shaders/fragment_lighting.frag");
		}
	}
}

window.setTimeout(function()
{
	//initialize SpellCraft
	SpellCraft.Core.kickstart();
});

//declare SpellCraft present
var Imported:any = Imported || {};
Imported.SpellCraft = 1.0;
