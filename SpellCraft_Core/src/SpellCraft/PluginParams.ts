/*=============================================================================
* SpellCraft - Core
* By David Frendin <david.frendin@gmail.com>
* MV/Params.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/

// <reference path="../declarations/declarations.d.ts" />
namespace SpellCraft
{

	export abstract class PluginParams
	{
		private static _plugin:MV.Plugin;

		public static get plugin():MV.Plugin {
		    if (this._plugin)
					return this._plugin;

				let l:MV.Plugin[] = $plugins.filter(function(plugin:MV.Plugin) { return plugin.description.indexOf('<SpellCraft::Core>') >= 0; });
				if (l.length === 0)
					throw new Error("Couldn't find SpellCraft::Core parameters.");
				this._plugin = l[0];
				return l[0];
		}

		public static get gameSecondsPerSecond():number
		{
			if (!this.plugin.parameters['gameSecondsPerSecond'])
				return 10;
			if (isNaN(Number(this.plugin.parameters['gameSecondsPerSecond'])))
				return 10;
      return Number(this.plugin.parameters['gameSecondsPerSecond']);
		}

		public static get disableTimeOnDialogue():boolean
		{
			if (!this.plugin.parameters['disableTimeOnDialogue'])
				return true;
    	return this.plugin.parameters['disableTimeOnDialogue'] === 'true';
    }

    public static get initialTime():string
		{
			if (!this.plugin.parameters['initialTime'])
				return '08:00';
			return this.plugin.parameters['initialTime'] || '08:00';
    }

	}
}
