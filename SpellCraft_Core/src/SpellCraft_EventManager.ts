/*=============================================================================
* SpellCraft - Core: EventManager
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_EventManager.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/

// <reference path="declarations/declarations.d.ts" />
namespace SpellCraft
{
export abstract class EventManager {

	private static _events:{ [index:string] : void[] } = {};


	/**
	 * Registers a callback to be executed when a specified event is emitted.
	 *
	 * @param {string} eventName - An event to subscribe to.
	 * @param {void} callback - A callback to be executed when the specified event has been triggered.
	 */
	public static on(eventName: string, callback: any):void
	{
		if (!this._events[eventName])
			this._events[eventName] = [];
		this._events[eventName].push(callback);
	}

	/**
	 * Emits an event, prompting execution of any callbacks subscribing to the event.
	 *
	 * @param {string} eventName - An event to emit.
	 * @param {any?} params - An array of parameters to relay to subscribing callbacks.
	 * @param {any?} scope - The context in which callback should be executed (defined what "this" should be).
	 */
	public static emit(eventName: string, params?:any, scope?:any):void
	{
		if (!this._events[eventName])
			return;

		if (!scope)
			scope = this;

		for (let i:number = 0; i < this._events[eventName].length; i++)
		{
			let callback:void = this._events[eventName][i];
			(callback as any).call(scope, params);
		}
	};

	/**
	 * Unsubscribe a callback from an event.
	 *
	 * @param {string} eventName - An event which the callback is subscribing to.
	 * @param {void} callback - The callback which we wish to remove.
	 */
	public static un(eventName: string, callback:void):void
	{
		if (!this._events[eventName])
			return;

		for (let i = 0; i < this._events[eventName].length; i++)
		{
			if (this._events[eventName][i] == callback)
			{
				this._events[eventName][i] = undefined;
				return;
			}
		}
		};

	}
}

/*=============================================================================
* The following section injects various overrides into existing RPGMV/Pixijs
* objects, extending them with new functionality and provides various points
* that emits events for other plugins to subscribe to.
*=============================================================================*/
var _Game_Map_prototype_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId:number)
{

	SpellCraft.EventManager.emit('preGameMapSetup', {'mapId': mapId});
	_Game_Map_prototype_setup.call(this);

	try
	{
		$dataMap.noteJson = JSON.parse($dataMap.note);
	} catch (e)
	{
		$dataMap.noteJson = false;
	}

	try
	{
		this.noteJson = JSON.parse(this.tileset().note);
	} catch (e)
	{
		this.noteJson = false;
	}

	if ($gameMap._lighting.autoAmbientLight) $gameMap._lighting.setAmbientLight("ffffffff");


	SpellCraft.EventManager.emit('gameMapSetup', {'mapId': mapId});
}

var _Game_Map_prototype_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function()
{
	SpellCraft.EventManager.emit('preGameMapInitialize');
	_Game_Map_prototype_initialize.call(this);
	SpellCraft.EventManager.emit('gameMapInitialize');
}

var _Game_Map_prototype_setupEvents = Game_Map.prototype.setupEvents;
Game_Map.prototype.setupEvents = function()
{
	SpellCraft.EventManager.emit('preGameMapSetupEvents');
	_Game_Map_prototype_setupEvents.call(this);
	SpellCraft.EventManager.emit('gameMapSetupEvents');
}

var _Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function()
{
	SpellCraft.EventManager.emit('preGameEventSetupPage', undefined, this);
	_Game_Event_setupPage.call(this);
	let list = this.list();
	let comment = '';
	if (list && list.length > 1)
	{
		for (let i = 0; i < list.length; i++)
		{
			if (list[i])
			{
				if ((list[i].code == 108 || list[i].code == 408))
				{
					comment += list[i].parameters.join('\n') + '\n';
				}
			}
		}
	}

	if (comment != '')
	{
		try
		{
			this.noteJson = JSON.parse(comment);
		} catch (e)
		{
			this.noteJson = false;
		}

	}

	SpellCraft.EventManager.emit('gameEventSetupPage', undefined, this);

}

var _DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function()
{
	SpellCraft.EventManager.emit('preSetupNewGame', undefined);
	_DataManager_setupNewGame.call(this);
	SpellCraft.EventManager.emit('setupNewGame', undefined);
}

var _Spriteset_Map_createWeather = Spriteset_Map.prototype.createWeather;
Spriteset_Map.prototype.createWeather = function()
{
	SpellCraft.EventManager.emit('preCreateWeather', undefined, this);
	_Spriteset_Map_createWeather.call(this);
	SpellCraft.EventManager.emit('createWeather', undefined, this);
}

var _Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function()
{
	SpellCraft.EventManager.emit('preSpritesetMapUpdate', undefined, this);
	_Spriteset_Map_update.call(this);
	SpellCraft.EventManager.emit('spritesetMapUpdate', undefined, this);
}
