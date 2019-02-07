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
*
* The goal of this plugin is not really to do anything special by its own, but
* provide a platform and reusable environment which upon other functionality
* may be built.
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
	
	
	/**
	 * Force WebGL
	 */
	SceneManager.preferableRendererType = function() {
		return 'webgl';
	};
            

	
	
	

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
		
		$scope.execScript = function(src)
		{
			return new Promise(function(resolve, reject)
			{
				let url = "js/" + src;
				let dom_script = document.createElement("script");
				dom_script.type = "text/javascript";
				dom_script.src = url;
				dom_script.async = false;
				dom_script._url = url;
				
				dom_script.onload = function()
				{
					resolve();
				};

				dom_script.onerror = function()
				{
					reject(this);
				};
				
				document.body.appendChild(dom_script);
			});
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
		
	}( $rootScope.EventManager = $rootScope.EventManager || {} ));

	/*=============================================================================
	* Graphics <SpellCraft.GFX>
	* Graphics related stuff
	*=============================================================================*/
	(function($scope)
	{
		
		$scope.initialize = function (spriteset)
		{
			$scope._spriteset = spriteset;
			$rootScope.EventManager.emit("gfxInitialized", undefined, this);
			//$scope._layer = new PIXI.Container();
			
			//$scope._lightMap = new PIXI.RenderTexture.create(Graphics.width, Graphics.height);
			//$scope._lightMapSprite = new PIXI.Sprite($scope._lightMap);
			
			
			//$scope.sprite = PIXI.Sprite.fromImage('img/system/loading.png');
			
			//$scope._blurFilter1 = new PIXI.filters.BlurFilter();
			//$scope._blurFilter1.blur = 5;
			//$scope._lightMapSprite.filters = [$scope._blurFilter1];
			
			//$scope._layer.addChild($scope._lightMapSprite);
			//$scope._layer.addChild($scope.sprite);
			//spriteset.addChild($scope._layer);
			

			
		};

		$scope.update = function ()
		{
			$rootScope.EventManager.emit("gfxUpdate", undefined, this);
			
			
		};

		$scope.dispose = function ()
		{
			$scope._spriteset = null;
			$rootScope.EventManager.emit("gfxDisposed", undefined, this);

			console.log('GFX disposed');
		};
		
		$rootScope.EventManager.on('createWeather', function ()
		{
			$scope.initialize(this);
		});
		
		$rootScope.EventManager.on('spritesetMapUpdate', function ()
		{
			$scope.update();
		});

		$rootScope.EventManager.on('preSpritesetMapTerminate', function ()
		{
			$scope.dispose();
		});
		


		/*function PIXIContainerObject()
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

		// Stop application wait for load to finish
		//app.stop();
		PIXI.loader.add('shader', 'data/shaders/test.frag').load(onLoaded);
		
		// Handle the load completed
		function onLoaded (loader,res) {

			// Create the new filter, arguments: (vertexShader, framentSource)
			var filter = new PIXI.Filter(null, res.shader.data);

			// Add the filter
			//background.filters = [filter];

			// Resume application update
			//app.start();
		}*/

		
	}( $rootScope.GFX = $rootScope.GFX || {} ));



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
					if (!$rootScope.RPGMV.dialogueActive() || !$rootScope.Param.disableTimeOnDialogue)
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
				$rootScope.EventManager.emit('changeTime', {'timestamp': $scope._timestamp, 'hour': $scope._hours, 'minute': $scope._minutes, 'second': $scope._seconds});
			
		};

		$scope.set = function(t)
		{
			$scope._seconds = t.seconds;
			$scope._minutes = t.minutes;
			$scope._hours = t.hours;
			$scope._days = t.days;
			$scope.sync();
		};
		
		$rootScope.EventManager.on('setupNewGame', function()
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

	

	


/*=============================================================================
* The following section injects various overrides into existing RPGMV/Pixijs
* objects, extending them with new functionality and provides various points
* that emits events for other plugins to subscribe to.
*=============================================================================*/

	/**
	 * Game_Map
	 * Emit "gameMapSetup" event
	 * Determine if current dataMap or tileset contains json formated comment and parse it as .noteJson
	 */
	(function($scope)
	{
		var _Game_Map_setup = $scope.setup;
		$scope.setup = function(mapId)
		{
			$rootScope.EventManager.emit('preGameMapSetup', {'mapId': mapId});
			let result = _Game_Map_setup.call(this);
			$rootScope.EventManager.emit('gameMapSetup', {'mapId': mapId});
			
			try
			{
				$dataMap.noteJson = JSON.parse($dataMap.note);
			} catch (e)
			{
				$dataMap.noteJson = false;
			}

			try
			{
				this.tileset().noteJson = JSON.parse(this.tileset().note);
			} catch (e)
			{
				this.tileset().noteJson = false;
			}
			
			return result;
		};
	})(Game_Map.prototype);
	
	
	/**
	 * Game_Event
	 * Determine if an event contains json formated comment and parse it as .noteJson
	 */
	(function($scope)
	{
		var _Game_Event_setupPage = $scope.setupPage;
		$scope.setupPage = function ()
		{
			let result = _Game_Event_setupPage.call(this);
			
			let page = this.page();
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
			
			return result;
		};
	})(Game_Event.prototype);



	/**
	 * DataManager
	 * Emit "setupNewGame" event
	 */
	(function($scope)
	{
		var _DataManager_setupNewGame = $scope.setupNewGame;
		$scope.setupNewGame = function()
		{
			$rootScope.EventManager.emit('preSetupNewGame', undefined);
			let result = _DataManager_setupNewGame.call(this);
			$rootScope.EventManager.emit('setupNewGame', undefined);
			return result;
		};
	})(DataManager.prototype);


	/**
	 * Spriteset_Map
	 * Emit "createWeather", "spritesetMapUpdate", "spritesetMapTerminate" events
	 */
	(function($scope)
	{
		var _Spriteset_Map_createWeather = $scope.createWeather;
		$scope.createWeather = function()
		{
			$rootScope.EventManager.emit('preCreateWeather', undefined, this);
			let result = _Spriteset_Map_createWeather.call(this);
			$rootScope.EventManager.emit('createWeather', undefined, this);
			return result;
		};
		
		var _Spriteset_Map_update = $scope.update;
		$scope.update = function()
		{
			$rootScope.EventManager.emit('preSpritesetMapUpdate', undefined, this);
			let result = _Spriteset_Map_update.call(this);
			$rootScope.EventManager.emit('spritesetMapUpdate', undefined, this);
			return result;
		};

		var _Spriteset_Map_terminate = $scope.terminate;
		$scope.terminate = function()
		{
			$rootScope.EventManager.emit('preSpritesetMapTerminate', undefined, this);
			let result = _Spriteset_Map_terminate.call(this);
			$rootScope.EventManager.emit('spritesetMapTerminate', undefined, this);
			return result;
		};
		

	})(Spriteset_Map.prototype);
	
	

}( SpellCraft = SpellCraft || {} ));
  
$sc = SpellCraft;

Imported.SpellCraft = 1.0;
