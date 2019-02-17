/*=============================================================================
* SpellCraft - Core: Time
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_Time.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/

/// <reference path="../declarations/declarations.d.ts" />
namespace SpellCraft
{

	interface iSpellCraft_Time
	{
		seconds: number;
		minutes: number;
		hours: number;
		days: number;
	}

	export class SCTime implements iSpellCraft_Time
	{
		_seconds: number = 0;
		_minutes: number = 0;
		_hours: number = 0;
		_days: number = 0;

		reset()
		{
			this._seconds = 0;
			this._minutes = 0;
			this._hours = 0;
			this._days = 0;
		}

		sync()
		{
			while (this._seconds >= 60)
			{
				this._minutes++;
				this._seconds -= 60;
			}
			while (this._minutes >= 60)
			{
				this._hours++;
				this._minutes -= 60;
			}
			while (this._hours >= 24)
			{
				this._days++;
				this._hours -= 24;
			}
		}

		add(seconds:number = 0, minutes:number = 0, hours:number = 0, days:number = 0)
		{
			if (SceneManager._scene instanceof Scene_Map)
			{
				this._seconds += seconds;
				this._minutes += minutes;
				this._hours += hours;
				this._days += days;
				this.sync();
			}
		}

		get seconds(): number {
			return this._seconds;
		}

		set seconds(newSeconds: number) {
			this._seconds = newSeconds;
			this.sync();
		}

		get minutes(): number {
			return this._minutes;
		}

		set minutes(newMinutes: number) {
			this._minutes = newMinutes;
			this.sync();
		}

		get hours(): number {
			return this._hours;
		}

		set hours(newHours: number) {
			this._hours = newHours;
			this.sync();
		}

		get days(): number {
			return this._days;
		}

		set days(newDays: number) {
			this._days = newDays;
			this.sync();
		}

		get timestamp(): number {
			return this.minutes + (this.hours * 60) + (this.days * 60 * 60);
		}

		set timestamp(newTimestamp: number) {
			this.reset();
			this.minutes = newTimestamp;
		}

	}

	/*=============================================================================
	* Time management <SpellCraft.Time>
	* Manages the inner workings of the progress of in-game time.
	*=============================================================================*/
	export abstract class TimeManager
	{

		private static _interval:number;
		private static _time:SCTime = new SCTime();

		public static initialize():void
		{
			this.start();

			SpellCraft.EventManager.on('setupNewGame', function()
			{
				SpellCraft.TimeManager._time.reset();
				SpellCraft.TimeManager._time._minutes = parseInt(PluginParams.initialTime.split(':')[1]);
				SpellCraft.TimeManager._time._hours = parseInt(PluginParams.initialTime.split(':')[0]);
				SpellCraft.TimeManager.reset();
			});

		}

		public static start()
		{
			if (SpellCraft.TimeManager._interval !== undefined)
				return;

			SpellCraft.TimeManager._interval = window.setInterval(function()
			{
				if (SpellCraft.TimeManager.timeProgressionAllowed())
				{
					SpellCraft.TimeManager._time.seconds += PluginParams.gameSecondsPerSecond;
					SpellCraft.EventManager.emit('changeTime', SpellCraft.TimeManager._time);
				}
			}, 1000);
		}

		public static reset()
		{
			this.disable();
			this.start();
		}

		public static disable()
		{
			if (SpellCraft.TimeManager._interval === undefined) return;

			window.clearInterval(SpellCraft.TimeManager._interval);
			SpellCraft.TimeManager._interval = undefined;
		}


		public static timeProgressionAllowed():boolean
		{
			if (!PluginParams.disableTimeOnDialogue)
			{
				return (SceneManager._scene instanceof Scene_Map && $gameMessage.isBusy());
			}
			else
			{
				return (SceneManager._scene instanceof Scene_Map);
			}
		}


	}
}
