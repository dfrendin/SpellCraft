/*!=============================================================================
* SpellCraft - Core
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_Core.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/
/*!:
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
* SpellCraft - Core/Time
* ============================================================================
*=============================================================================*/
var SpellCraft;
(function (SpellCraft) {
    var PluginParams = (function () {
        function PluginParams() {
        }
        Object.defineProperty(PluginParams, "plugin", {
            get: function () {
                if (this._plugin)
                    return this._plugin;
                var l = $plugins.filter(function (plugin) { return plugin.description.indexOf('<SpellCraft::Core>') >= 0; });
                if (l.length === 0)
                    throw new Error("Couldn't find SpellCraft::Core parameters.");
                this._plugin = l[0];
                return l[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginParams, "gameSecondsPerSecond", {
            get: function () {
                if (!this.plugin.parameters['gameSecondsPerSecond'])
                    return 10;
                if (isNaN(Number(this.plugin.parameters['gameSecondsPerSecond'])))
                    return 10;
                return Number(this.plugin.parameters['gameSecondsPerSecond']);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginParams, "disableTimeOnDialogue", {
            get: function () {
                if (!this.plugin.parameters['disableTimeOnDialogue'])
                    return true;
                return this.plugin.parameters['disableTimeOnDialogue'] === 'true';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginParams, "initialTime", {
            get: function () {
                if (!this.plugin.parameters['initialTime'])
                    return '08:00';
                return this.plugin.parameters['initialTime'] || '08:00';
            },
            enumerable: true,
            configurable: true
        });
        return PluginParams;
    }());
    SpellCraft.PluginParams = PluginParams;
})(SpellCraft || (SpellCraft = {}));
var SpellCraft;
(function (SpellCraft) {
    var IO = (function () {
        function IO() {
        }
        IO.execScript = function (src) {
            return new Promise(function (resolve, reject) {
                var url = "js/" + src;
                var dom_script = document.createElement("script");
                dom_script.type = "text/javascript";
                dom_script.src = url;
                dom_script.async = false;
                dom_script._url = url;
                dom_script.onload = function () {
                    resolve();
                };
                dom_script.onerror = function () {
                    reject(this);
                };
                document.body.appendChild(dom_script);
            });
        };
        IO.fetchFileContents = function (url, mimeType) {
            return new Promise(function (resolve, reject) {
                if (SpellCraft.IO._fetchFileContents_cache == undefined)
                    SpellCraft.IO._fetchFileContents_cache = {};
                if (SpellCraft.IO._fetchFileContents_cache[url]) {
                    resolve(SpellCraft.IO._fetchFileContents_cache[url]);
                }
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.overrideMimeType(mimeType);
                xhr.onload = function () {
                    if (xhr.status < 400) {
                        var newFile = { fileName: url, contents: xhr.responseText, mimeType: mimeType };
                        SpellCraft.IO._fetchFileContents_cache[url] = newFile;
                        resolve(newFile);
                    }
                };
                xhr.onerror = function () {
                    reject(xhr);
                };
                xhr.send();
            });
        };
        IO.cachedFile = function (key) {
            return this._fetchFileContents_cache[key];
        };
        IO.precacheFile = function (key, url) {
            return new Promise(function (resolve, reject) {
                if (SpellCraft.IO._fetchFileContents_cache == undefined)
                    SpellCraft.IO._fetchFileContents_cache = {};
                if (SpellCraft.IO._fetchFileContents_cache[key]) {
                    resolve(SpellCraft.IO._fetchFileContents_cache[key]);
                }
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.overrideMimeType("text/plain");
                xhr.onload = function () {
                    if (xhr.status < 400) {
                        var newFile = { fileName: url, contents: xhr.responseText, mimeType: "text/plain" };
                        SpellCraft.IO._fetchFileContents_cache[key] = newFile;
                        resolve(newFile);
                    }
                };
                xhr.onerror = function () {
                    reject(xhr);
                };
                xhr.send();
            });
        };
        IO.resolvePath = function (relativePath) {
            relativePath = (Utils.isNwjs() && Utils.isOptionValid('test')) ? relativePath : '/www/' + relativePath;
            var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, relativePath);
            if (path.match(/^\/([A-Z]\:)/))
                path = path.slice(1);
            return decodeURIComponent(path);
        };
        IO._fetchFileContents_cache = {};
        return IO;
    }());
    SpellCraft.IO = IO;
})(SpellCraft || (SpellCraft = {}));
var SpellCraft;
(function (SpellCraft) {
    var EventManager = (function () {
        function EventManager() {
        }
        EventManager.on = function (eventName, callback) {
            if (!this._events[eventName])
                this._events[eventName] = [];
            this._events[eventName].push(callback);
        };
        EventManager.emit = function (eventName, params, scope) {
            if (!this._events[eventName])
                return;
            if (!scope)
                scope = this;
            for (var i = 0; i < this._events[eventName].length; i++) {
                var callback = this._events[eventName][i];
                callback.call(scope, params);
            }
        };
        ;
        EventManager.un = function (eventName, callback) {
            if (!this._events[eventName])
                return;
            for (var i = 0; i < this._events[eventName].length; i++) {
                if (this._events[eventName][i] == callback) {
                    this._events[eventName][i] = undefined;
                    return;
                }
            }
        };
        ;
        EventManager._events = {};
        return EventManager;
    }());
    SpellCraft.EventManager = EventManager;
})(SpellCraft || (SpellCraft = {}));
var _Game_Map_prototype_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId) {
    SpellCraft.EventManager.emit('preGameMapSetup', { 'mapId': mapId });
    _Game_Map_prototype_setup.call(this);
    try {
        $dataMap.noteJson = JSON.parse($dataMap.note);
    }
    catch (e) {
        $dataMap.noteJson = false;
    }
    try {
        this.noteJson = JSON.parse(this.tileset().note);
    }
    catch (e) {
        this.noteJson = false;
    }
    if ($gameMap._lighting.autoAmbientLight)
        $gameMap._lighting.setAmbientLight("ffffffff");
    SpellCraft.EventManager.emit('gameMapSetup', { 'mapId': mapId });
};
var _Game_Map_prototype_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function () {
    SpellCraft.EventManager.emit('preGameMapInitialize');
    _Game_Map_prototype_initialize.call(this);
    SpellCraft.EventManager.emit('gameMapInitialize');
};
var _Game_Map_prototype_setupEvents = Game_Map.prototype.setupEvents;
Game_Map.prototype.setupEvents = function () {
    SpellCraft.EventManager.emit('preGameMapSetupEvents');
    _Game_Map_prototype_setupEvents.call(this);
    SpellCraft.EventManager.emit('gameMapSetupEvents');
};
var _Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function () {
    SpellCraft.EventManager.emit('preGameEventSetupPage', undefined, this);
    _Game_Event_setupPage.call(this);
    var list = this.list();
    var comment = '';
    if (list && list.length > 1) {
        for (var i = 0; i < list.length; i++) {
            if (list[i]) {
                if ((list[i].code == 108 || list[i].code == 408)) {
                    comment += list[i].parameters.join('\n') + '\n';
                }
            }
        }
    }
    if (comment != '') {
        try {
            this.noteJson = JSON.parse(comment);
        }
        catch (e) {
            this.noteJson = false;
        }
    }
    SpellCraft.EventManager.emit('gameEventSetupPage', undefined, this);
};
var _DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function () {
    SpellCraft.EventManager.emit('preSetupNewGame', undefined);
    _DataManager_setupNewGame.call(this);
    SpellCraft.EventManager.emit('setupNewGame', undefined);
};
var _Spriteset_Map_createWeather = Spriteset_Map.prototype.createWeather;
Spriteset_Map.prototype.createWeather = function () {
    SpellCraft.EventManager.emit('preCreateWeather', undefined, this);
    _Spriteset_Map_createWeather.call(this);
    SpellCraft.EventManager.emit('createWeather', undefined, this);
};
var _Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function () {
    SpellCraft.EventManager.emit('preSpritesetMapUpdate', undefined, this);
    _Spriteset_Map_update.call(this);
    SpellCraft.EventManager.emit('spritesetMapUpdate', undefined, this);
};
var SpellCraft;
(function (SpellCraft) {
    var Game_Lighting = (function () {
        function Game_Lighting() {
            this.resetLighting = function () {
                this._ambientLight.reset();
            };
            this.update = function () {
                if (!(this._enabled))
                    return;
                this._ambientLight.update();
            };
            this.enable = function () {
                this.setState(true);
            };
            this.disable = function () {
                this.setState(false);
            };
            this.setState = function (enabled) {
                this._enabled = enabled;
            };
            this.setAmbientLight = function (target, time) {
                if (time === void 0) { time = null; }
                if (typeof target == "string") {
                    var color = /^#?([a-f\d]{2})?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(target);
                    if (color) {
                        var i = color[1] ? (parseInt(color[1], 16)) / 255 : null;
                        var r = (parseInt(color[2], 16)) / 255;
                        var g = (parseInt(color[3], 16)) / 255;
                        var b = (parseInt(color[4], 16)) / 255;
                        this._ambientLight.set(i, time, r, g, b);
                    }
                }
                else {
                    var i = target.clamp(0, 100) / 100;
                    this._ambientLight.set(i, time);
                }
            };
            this.saveState = function (stateName) {
                this._savedStates[stateName] =
                    {
                        "enabled": this._enabled,
                        "ambientLight": {
                            "intensity": this._ambientLight.intensity,
                            "red": this._ambientLight.red,
                            "green": this._ambientLight.green,
                            "blue": this._ambientLight.blue
                        },
                        "autoAmbientLight": this._autoAmbientLight
                    };
            };
            this.loadState = function (stateName, time) {
                if (stateName in this._savedStates) {
                    this._enabled = this._savedStates[stateName]["enabled"];
                    var i = this._savedStates[stateName]["ambientLight"]["intensity"];
                    var r = this._savedStates[stateName]["ambientLight"]["red"];
                    var g = this._savedStates[stateName]["ambientLight"]["green"];
                    var b = this._savedStates[stateName]["ambientLight"]["blue"];
                    this._ambientLight.set(i, time, r, g, b);
                    this._autoAmbientLight = this._savedStates[stateName]["autoAmbientLight"];
                }
            };
            this.copyAmbientLight = function (gameLighting) {
                var i = gameLighting.ambientLight.intensity;
                var r = gameLighting.ambientLight.red;
                var g = gameLighting.ambientLight.green;
                var b = gameLighting.ambientLight.blue;
                this._ambientLight.set(i, 0, r, g, b);
            };
            this._enabled = true;
            this._ambientLight = new AmbientLight();
            this._autoAmbientLight = true;
            this._savedStates = {};
            this.resetLighting();
        }
        Object.defineProperty(Game_Lighting.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game_Lighting.prototype, "ambientLight", {
            get: function () {
                return this._ambientLight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game_Lighting.prototype, "autoAmbientLight", {
            get: function () {
                return this._autoAmbientLight;
            },
            enumerable: true,
            configurable: true
        });
        return Game_Lighting;
    }());
    SpellCraft.Game_Lighting = Game_Lighting;
})(SpellCraft || (SpellCraft = {}));
var AmbientLight = (function () {
    function AmbientLight() {
        this._di = 0.0;
        this._dr = 0.0;
        this._dg = 0.0;
        this._db = 0.0;
        this._timer = 0;
        this.reset();
    }
    Object.defineProperty(AmbientLight.prototype, "intensity", {
        get: function () {
            return this._intensity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmbientLight.prototype, "red", {
        get: function () {
            return this._red;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmbientLight.prototype, "green", {
        get: function () {
            return this._green;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmbientLight.prototype, "blue", {
        get: function () {
            return this._blue;
        },
        enumerable: true,
        configurable: true
    });
    AmbientLight.prototype.reset = function () {
        this._intensity = 1.0;
        this._red = 1.0;
        this._green = 1.0;
        this._blue = 1.0;
        this._ti = this._intensity;
        this._tr = this._red;
        this._tg = this._green;
        this._tb = this._blue;
        this._di = 0.0;
        this._dr = 0.0;
        this._dg = 0.0;
        this._db = 0.0;
        this._timer = 0;
    };
    AmbientLight.prototype.update = function () {
        if (this._timer > 0) {
            this.processChanges();
            this._timer -= 1;
            if (!(this._timer > 0))
                this.processTarget();
        }
        ;
    };
    ;
    AmbientLight.prototype.set = function (i, time, r, g, b) {
        this._timer = (typeof time == "number" ? time : 0);
        this._ti = (typeof i == "number" ? i : this._intensity);
        this._tr = (typeof r == "number" ? r : this._red);
        this._tg = (typeof g == "number" ? g : this._green);
        this._tb = (typeof b == "number" ? b : this._blue);
        if (this._timer > 0) {
            this._di = (this._ti - this._intensity) / this._timer;
            this._dr = (this._tr - this._red) / this._timer;
            this._dg = (this._tg - this._green) / this._timer;
            this._db = (this._tb - this._blue) / this._timer;
        }
        else {
            this.processTarget();
        }
    };
    AmbientLight.prototype.processChanges = function () {
        this._intensity += this._di;
        this._red += this._dr;
        this._green += this._dg;
        this._blue += this._db;
    };
    AmbientLight.prototype.processTarget = function () {
        this._intensity = this._ti;
        this._red = this._tr;
        this._green = this._tg;
        this._blue = this._tb;
    };
    return AmbientLight;
}());
var SpellCraft;
(function (SpellCraft) {
    var GFX = (function () {
        function GFX() {
        }
        GFX.initializeGraphics = function (spriteset) {
            this._spriteset = spriteset;
            var vertexShaderGeneral = SpellCraft.IO.cachedFile('vertex_general').contents;
            var fragmentShaderLighting = SpellCraft.IO.cachedFile('fragment_lighting').contents;
            this._lightingFilter = new SpellCraft.LightingFilter(vertexShaderGeneral, fragmentShaderLighting, "");
            this._scene = true;
            this._lightingLayer = new PIXI.Container();
            this._lightingMap = PIXI.RenderTexture.create(Graphics.width, Graphics.height);
            this._lightingFilter.setResolution(Graphics.width, Graphics.height);
            this._lightingFilter.blendMode = PIXI.BLEND_MODES.LIGHTING;
            this._lightingSprite = new PIXI.Sprite(this._lightingMap);
            if (this._lightingSprite.filters)
                this._lightingSprite.filters.push(this._lightingFilter);
            else
                this._lightingSprite.filters = [this._lightingFilter];
            this._spriteset.addChild(this._lightingSprite);
        };
        GFX.update = function () {
            this._lightingFilter.setAmbientLight($gameMap._lighting.ambientLight);
            Graphics._renderer.render(this._lightingLayer, this._lightingMap);
        };
        GFX._scene = false;
        return GFX;
    }());
    SpellCraft.GFX = GFX;
    SpellCraft.EventManager.on('createWeather', function () {
        GFX.initializeGraphics(this);
    });
    SpellCraft.EventManager.on('spritesetMapUpdate', function () {
        GFX.update();
    });
    (function ($) {
        Object.defineProperty($, 'lighting', { get: function () { return this._lighting; }, });
        var _Game_Map_initialize = $.initialize;
        $.initialize = function () {
            this._lighting = new SpellCraft.Game_Lighting();
            var result = _Game_Map_initialize.call(this);
            return result;
        };
    }(Game_Map.prototype));
    (function ($) {
        var _Graphics_createRenderer = $._createRenderer;
        $._createRenderer = function () {
            var result = _Graphics_createRenderer.call(this);
            var gl = this._renderer.gl;
            PIXI.BLEND_MODES.LIGHT = 31;
            PIXI.BLEND_MODES.LIGHTING = 32;
            this._renderer.state.blendModes[PIXI.BLEND_MODES.LIGHT] = [gl.SRC_ALPHA, gl.ONE];
            this._renderer.state.blendModes[PIXI.BLEND_MODES.LIGHTING] = [gl.ZERO, gl.SRC_COLOR];
            return result;
        };
    }(Graphics));
})(SpellCraft || (SpellCraft = {}));
var SpellCraft;
(function (SpellCraft) {
    var SCTime = (function () {
        function SCTime() {
            this._seconds = 0;
            this._minutes = 0;
            this._hours = 0;
            this._days = 0;
        }
        SCTime.prototype.reset = function () {
            this._seconds = 0;
            this._minutes = 0;
            this._hours = 0;
            this._days = 0;
        };
        SCTime.prototype.sync = function () {
            while (this._seconds >= 60) {
                this._minutes++;
                this._seconds -= 60;
            }
            while (this._minutes >= 60) {
                this._hours++;
                this._minutes -= 60;
            }
            while (this._hours >= 24) {
                this._days++;
                this._hours -= 24;
            }
        };
        SCTime.prototype.add = function (seconds, minutes, hours, days) {
            if (seconds === void 0) { seconds = 0; }
            if (minutes === void 0) { minutes = 0; }
            if (hours === void 0) { hours = 0; }
            if (days === void 0) { days = 0; }
            if (SceneManager._scene instanceof Scene_Map) {
                this._seconds += seconds;
                this._minutes += minutes;
                this._hours += hours;
                this._days += days;
                this.sync();
            }
        };
        Object.defineProperty(SCTime.prototype, "seconds", {
            get: function () {
                return this._seconds;
            },
            set: function (newSeconds) {
                this._seconds = newSeconds;
                this.sync();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCTime.prototype, "minutes", {
            get: function () {
                return this._minutes;
            },
            set: function (newMinutes) {
                this._minutes = newMinutes;
                this.sync();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCTime.prototype, "hours", {
            get: function () {
                return this._hours;
            },
            set: function (newHours) {
                this._hours = newHours;
                this.sync();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCTime.prototype, "days", {
            get: function () {
                return this._days;
            },
            set: function (newDays) {
                this._days = newDays;
                this.sync();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCTime.prototype, "timestamp", {
            get: function () {
                return this.minutes + (this.hours * 60) + (this.days * 60 * 60);
            },
            set: function (newTimestamp) {
                this.reset();
                this.minutes = newTimestamp;
            },
            enumerable: true,
            configurable: true
        });
        return SCTime;
    }());
    SpellCraft.SCTime = SCTime;
    var TimeManager = (function () {
        function TimeManager() {
        }
        TimeManager.initialize = function () {
            this.start();
            SpellCraft.EventManager.on('setupNewGame', function () {
                SpellCraft.TimeManager._time.reset();
                SpellCraft.TimeManager._time._minutes = parseInt(SpellCraft.PluginParams.initialTime.split(':')[1]);
                SpellCraft.TimeManager._time._hours = parseInt(SpellCraft.PluginParams.initialTime.split(':')[0]);
                SpellCraft.TimeManager.reset();
            });
        };
        TimeManager.start = function () {
            if (SpellCraft.TimeManager._interval !== undefined)
                return;
            SpellCraft.TimeManager._interval = window.setInterval(function () {
                if (SpellCraft.TimeManager.timeProgressionAllowed()) {
                    SpellCraft.TimeManager._time.seconds += SpellCraft.PluginParams.gameSecondsPerSecond;
                    SpellCraft.EventManager.emit('changeTime', SpellCraft.TimeManager._time);
                }
            }, 1000);
        };
        TimeManager.reset = function () {
            this.disable();
            this.start();
        };
        TimeManager.disable = function () {
            if (SpellCraft.TimeManager._interval === undefined)
                return;
            window.clearInterval(SpellCraft.TimeManager._interval);
            SpellCraft.TimeManager._interval = undefined;
        };
        TimeManager.timeProgressionAllowed = function () {
            if (!SpellCraft.PluginParams.disableTimeOnDialogue) {
                return (SceneManager._scene instanceof Scene_Map && $gameMessage.isBusy());
            }
            else {
                return (SceneManager._scene instanceof Scene_Map);
            }
        };
        TimeManager._time = new SCTime();
        return TimeManager;
    }());
    SpellCraft.TimeManager = TimeManager;
})(SpellCraft || (SpellCraft = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var VERTEX_GENERAL = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n  \n  varying vec2 vTextureCoord;\n  \n  uniform mat3 projectionMatrix;\n  \n  void main(void) {\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
var VERTEX_FLIP_Y = "\n\n  attribute vec2 aVertexPosition;\n  attribute vec2 aTextureCoord;\n\n  varying vec2 vTextureCoord;\n  varying float flipY;\n\n  uniform mat3 projectionMatrix;\n\n  void main(void) {\n    flipY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n  }\n";
var FRAGMENT_LIGHTING = "\n  varying vec2 vTextureCoord;\n\n  uniform vec2 screenResolution;\n  uniform sampler2D uSampler;\n  uniform vec4 ambientLight;\n\n  void main(void) {\n    vec4 light = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = light + ambientLight;\n  }\n";
var SpellCraft;
(function (SpellCraft) {
    var LightingFilter = (function (_super) {
        __extends(LightingFilter, _super);
        function LightingFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LightingFilter.prototype.copyUniforms = function (filter) {
            for (var uniform in filter.uniforms) {
                if (filter.uniforms.hasOwnProperty(uniform) && this.uniforms.hasOwnProperty(uniform))
                    this.uniforms[uniform] = filter.uniforms[uniform];
            }
        };
        LightingFilter.prototype.setResolution = function (width, height) {
            this.uniforms.screenResolution.x = width;
            this.uniforms.screenResolution.y = height;
        };
        LightingFilter.prototype.setLightMap = function (lightMap) {
            this.uniforms.lightMap = lightMap;
        };
        LightingFilter.prototype.setAmbientLight = function (ambientLight) {
            this.uniforms.ambientLight[0] = ambientLight.red * ambientLight.intensity;
            this.uniforms.ambientLight[1] = ambientLight.green * ambientLight.intensity;
            this.uniforms.ambientLight[2] = ambientLight.blue * ambientLight.intensity;
            this.uniforms.ambientLight[3] = ambientLight.intensity;
        };
        return LightingFilter;
    }(PIXI.Filter));
    SpellCraft.LightingFilter = LightingFilter;
})(SpellCraft || (SpellCraft = {}));
var SpellCraft;
(function (SpellCraft) {
    var Core = (function () {
        function Core() {
        }
        Core.kickstart = function () {
            SpellCraft.TimeManager.initialize();
            SpellCraft.IO.precacheFile("vertex_general", "data/shaders/vertex_general.vert");
            SpellCraft.IO.precacheFile("fragment_lighting", "data/shaders/fragment_lighting.frag");
        };
        return Core;
    }());
    SpellCraft.Core = Core;
})(SpellCraft || (SpellCraft = {}));
window.setTimeout(function () {
    SpellCraft.Core.kickstart();
});
var Imported = Imported || {};
Imported.SpellCraft = 1.0;
