/*=============================================================================
* SpellCraft - Core
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_Core.js
* Version: 1.0
 * Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
 * - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/
/*:
* @plugindesc SpellCraft - Core <SpellCraft::Core>
* @author David Frendin
*
* @param ---Time---
* @default
*
* @param gameSecondsPerSecond
* @parent ---Time---
* @desc How many in-game seconds each real-world seconds is. If for example the value is 10, then every second the game time will advance 10 seconds.
* @default 10
*
* @param disableTimeOnDialogue
* @parent ---Time---
* @type boolean
* @on true
* @off false
* @desc Pause automatic progression of time when character dialogue is active.
* @default true
*
* @param initialTime
* @parent ---Time---
* @desc What time the in-game clock should be when starting.
* @default 08:00
*
* @help
* ============================================================================
* SpellCraft - Core
* ============================================================================
* Provides core functionality for SpellCraft.
*=============================================================================*/
var Imported = Imported || {};
var SpellCraft = SpellCraft || {};


(function ($rootScope)
{
	"use strict";
	
	// Params
	var parameters = $plugins.filter(function(plugin) { return plugin.description.contains('<SpellCraft::Core>'); });
	if (parameters.length === 0)
		throw new Error("Couldn't find SpellCraft::Core parameters.");

	// Params
	$rootScope.Parameters = parameters[0].parameters;
	$rootScope.Param = {};

	$rootScope.Param.gameSecondsPerSecond = Number($rootScope.Parameters.gameSecondsPerSecond || 10);
	$rootScope.Param.disableTimeOnDialogue = $rootScope.Parameters.disableTimeOnDialogue !== false;
	$rootScope.Param.initialTime = $rootScope.Parameters.initialTime || '08:00';

	/*=============================================================================
	* NodeJS IO <SpellCraft.IO>
	* Provides an interface for NodeJS I/O (file reading/writing)
	*=============================================================================*/
	(function($scope)
	{
		"use strict";

		var fs = require('fs');

		$scope.writeFile = function (filePath, filename, data)
		{
			filePath = resolvePath('/' + filePath + '/');
			this.fs.writeFileSync(filePath + filename, data);
		};
		
		$scope.readFile = function (filePath, filename)
		{
			filePath = resolvePath('/' + filePath + '/');
			return this.fs.readFileSync(filePath + filename, 'utf8');
		};
		
		function resolvePath(relativePath)
		{
			//Checks if MV is in dev mode, or production, then decides the appropriate path
			relativePath = (Utils.isNwjs() && Utils.isOptionValid('test')) ? relativePath : '/www/' + relativePath;
			
			//Creates the path using the location pathname of the window and replacing certain characters
			var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, relativePath);
			if(path.match(/^\/([A-Z]\:)/))
				path = path.slice(1);
			
			//Decode URI component and finally return the path
			return decodeURIComponent(path);
		}
	}( $rootScope.IO = $rootScope.IO || {} ));

	/*=============================================================================
	* RPGMV helper functions <SpellCraft.RPGMV>
	* Various functions for abstracting RPGMV specific features
	*=============================================================================*/
	(function($scope)
	{
		$scope.dialogueActive = function()
		{
			return (SceneManager._scene instanceof Scene_Map && $gameMessage.isBusy());
		};
		
		$scope.getEventPosition = function(e)
		{
			var pw = $gameMap.tileWidth();
			var ph = $gameMap.tileHeight();
			var dx = $gameMap.displayX();
			var dy = $gameMap.displayY();
			var px = e._realX;
			var py = e._realY;
			var pd = e._direction;

			var x1 = (pw / 2) + ((px - dx) * pw);
			var y1 = (ph / 2) + ((py - dy) * ph);

			return [x1, y1, pd];
		};  

	}( $rootScope.RPGMV = $rootScope.RPGMV || {} ));

	/*=============================================================================
	* Graphics <SpellCraft.GFX>
	* Graphics related stuff
	*=============================================================================*/
	(function($scope)
	{
		function PIXIContainerObject()
		{
			this.initialize.apply(this, arguments);
		}

		$scope.PIXIContainer = PIXIContainerObject;
		$scope.PIXIContainer.prototype = Object.create(PIXI.Container.prototype);
		$scope.PIXIContainer.prototype.constructor = $scope.PIXIContainer;

		$scope.hexToRgb = function(hex)
		{
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ?
			{
				red : parseInt(result[1], 16),
				green : parseInt(result[2], 16),
				blue : parseInt(result[3], 16)
			} : null;
		};
		
		$scope.walkColor = function(newRGB, currentRGB, colorName, tintSpeed)
		{
			if (newRGB[colorName] < currentRGB[colorName])
			{
				currentRGB[colorName] = currentRGB[colorName] - tintSpeed;
				if (newRGB[colorName] > currentRGB[colorName])
				{
					currentRGB[colorName] = newRGB[colorName];
				}
			}
			else if(newRGB[colorName] > currentRGB[colorName])
			{
				currentRGB[colorName] = currentRGB[colorName] + tintSpeed;
				if (newRGB[colorName] < currentRGB[colorName])
				{
					currentRGB[colorName] = newRGB[colorName];
				}
			}

			newRGB[colorName] = newRGB[colorName].clamp(0, 255);
		};

		
	}( $rootScope.GFX = $rootScope.GFX || {} ));

	/*=============================================================================
	* Event management <SpellCraft.EventManager>
	* Provides an observer/emitter type event pattern framework
	*=============================================================================*/
	(function($scope)
	{
		var _events = [];

		/**
		 * Registers a new callback for an event.
		 */
		$scope.on = function(eventName, callback)
		{
			if (_events[eventName] === undefined)
				_events[eventName] = [];
			_events[eventName].push(callback);
		};

		/**
		 * Executes callbacks subscribing to the event.
		 */
		$scope.emit = function(eventName, params, scope)
		{
			if (_events[eventName] === undefined) return;
			if (!scope)
				scope = this;

			for (let i = 0; i < _events[eventName].length; i++)
			{
				let callback = _events[eventName][i];
				callback.call(scope, params);
			}
		};
		
		/**
		 * Unsubscribe and remove callback from the event.
		 */
		$scope.un = function(eventName, callback)
		{
			if (this._events[eventName] === undefined)
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
		
		/**
		 * Setup event "preSetupNewGame", "setupNewGame" once DataManager.setupNewGame is run
		 */
		var _DataManager_setupNewGame = DataManager.setupNewGame;
		DataManager.setupNewGame = function()
		{
			$scope.emit('preSetupNewGame', undefined);
			let result = _DataManager_setupNewGame.call(this);
			$scope.emit('setupNewGame', undefined);
			return result;
		};
		
		/**
		 * Setup event "preGameMapSetup", "gameMapSetup" once Game_Map.setup is run
		 */
		var _Game_Map_setup = Game_Map.setup;
		Game_Map.setup = function(mapId)
		{
			$scope.emit('preGameMapSetup', {'mapId': mapId});
			let result = _Game_Map_setup.call(this);
			$scope.emit('gameMapSetup', {'mapId': mapId});
			return result;
		};


		/**
		 * Setup event "preCreateWeather", "createWeather" once a Spriteset_Map.createWeather being executed
		 */
		(function($)
		{
			var Spriteset_Map_prototype_createWeather = $.createWeather;
			$.createWeather = function()
			{
				SpellCraft.EventManager.emit('preCreateWeather', undefined, this);
				let result = Spriteset_Map_prototype_createWeather.call(this);
				SpellCraft.EventManager.emit('createWeather', undefined, this);
				return result;
			};
		})(Spriteset_Map.prototype);


	}( $rootScope.EventManager = $rootScope.EventManager || {} ));




	/*=============================================================================
	* Time management <SpellCraft.Time>
	* Manages the inner workings of the progress of in-game time.
	*=============================================================================*/
	(function($scope)
	{
		"use strict";
		
		var _interval = undefined;

		// Initialize'
		$scope.initialize = function()
		{
			//Interval for managing game time
			if (_interval === undefined)
			{
				_interval = setInterval(function()
				{
					if (!SpellCraft.RPGMV.dialogueActive() || !$rootScope.Param.disableTimeOnDialogue)
						$scope.add($rootScope.Param.gameSecondsPerSecond, 0, 0, 0);
				}, 1000);
			}
		};
		
		$scope.reset = function()
		{
			$scope.disable();
			$scope.initialize();
		};

		$scope.disable = function()
		{
			if ($scope._interval === undefined) return;

			clearInterval(_interval);
			_interval = undefined;
		};
		
		$scope.add = function (s, m, h, d)
		{
			if (SceneManager._scene instanceof Scene_Map)
			{
				$scope._seconds += s;
				$scope._minutes += m;
				$scope._hours += h;
				$scope._days += d;
				$scope.sync();
			}

		};
		
		$scope.sync = function()
		{
			let ts = $scope._timestamp;
			
			while ($scope._seconds >= 60)
			{
				$scope._minutes++;
				$scope._seconds -= 60;
			}

			while ($scope._minutes >= 60)
			{
				$scope._hours++;
				$scope._minutes -= 60;
			}

			while ($scope._hours >= 24)
			{
				$scope._days++;
				$scope._hours -= 24;
			}

			//if ($scope.time._days >= 7)
				//$scope.time._days = 0;
			//fixme - create "weekday" property
			
			$scope._timestamp = ($scope._days * 24 * 60) + ($scope._hours * 60) + $scope._minutes;
			
			if (ts != $scope._timestamp)
				SpellCraft.EventManager.emit('changeTime', {'timestamp': $scope._timestamp, 'hour': $scope._hours, 'minute': $scope._minutes, 'second': $scope._seconds});
			
		};

		$scope.set = function(t)
		{
			$scope._seconds = t.seconds;
			$scope._minutes = t.minutes;
			$scope._hours = t.hours;
			$scope._days = t.days;
			$scope.sync();
		};
		
		SpellCraft.EventManager.on('setupNewGame', function()
		{
			$scope.set(
			{
				seconds : 0,
				minutes : parseInt($rootScope.Param.initialTime.split(':')[1]),
				hours : parseInt($rootScope.Param.initialTime.split(':')[0]),
				days : 0
			});
			$scope.reset();
		});
		
		$scope.initialize();
		
		

	}( $rootScope.Time = $rootScope.Time || {} ));

	

	


	
	

}( SpellCraft = SpellCraft || {} ));


Imported.SpellCraft = 1.0;
