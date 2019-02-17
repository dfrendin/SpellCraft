// <reference path="../declarations/declarations.d.ts" />

namespace SpellCraft
{
	export abstract class GFX
	{
    public static _spriteset:Spriteset_Map;
    public static _scene:boolean = false;
    public static _lightingFilter:LightingFilter;
    public static _lightingLayer:PIXI.Container;
    public static _lightingMap:PIXI.RenderTexture;
    public static _lightingSprite:PIXI.Sprite;

    public static initializeGraphics(spriteset:Spriteset_Map)
  	{
  		this._spriteset = spriteset;
      let vertexShaderGeneral = IO.cachedFile('vertex_general').contents;
      let fragmentShaderLighting = IO.cachedFile('fragment_lighting').contents;

      this._lightingFilter = new LightingFilter(vertexShaderGeneral, fragmentShaderLighting, "");

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
  	}

    public static update()
		{
      //$gameMap.lighting.update();
    	this._lightingFilter.setAmbientLight($gameMap._lighting.ambientLight);
    	Graphics._renderer.render(this._lightingLayer, this._lightingMap);
		}


  }

  //Spriteset_Map.createWeather
  EventManager.on('createWeather', function ()
	{
    GFX.initializeGraphics(this);
  });

  EventManager.on('spritesetMapUpdate', function ()
  {
    GFX.update();
  });


  (function($)
  {
    Object.defineProperty($, 'lighting', { get: function() { return this._lighting; }, });

    var _Game_Map_initialize = $.initialize;


    $.initialize = function()
    {
      this._lighting = new Game_Lighting();
      let result = _Game_Map_initialize.call(this);
      return result;
    };

  }( Game_Map.prototype ));

  (function($)
  {
    var _Graphics_createRenderer = $._createRenderer;

    $._createRenderer = function()
    {
      let result = _Graphics_createRenderer.call(this);

      let gl = this._renderer.gl;
      PIXI.BLEND_MODES.LIGHT = 31;
      PIXI.BLEND_MODES.LIGHTING = 32;
      this._renderer.state.blendModes[PIXI.BLEND_MODES.LIGHT] = [gl.SRC_ALPHA, gl.ONE];
      this._renderer.state.blendModes[PIXI.BLEND_MODES.LIGHTING] = [gl.ZERO, gl.SRC_COLOR];
      return result;
    };

  }( Graphics ));

}
