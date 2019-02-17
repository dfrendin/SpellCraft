// <reference path="../declarations/declarations.d.ts" />
namespace SpellCraft
{

  export class Game_Lighting
  {
    _enabled:boolean;
    _ambientLight:AmbientLight;
    _autoAmbientLight:boolean;
    _savedStates:any;

    public get enabled():boolean
    {
      return this._enabled;
    }

    public get ambientLight():AmbientLight
    {
      return this._ambientLight;
    }

    public get autoAmbientLight():boolean
    {
      return this._autoAmbientLight;
    }

    constructor()
    {
      this._enabled = true;
    	this._ambientLight = new AmbientLight();
    	this._autoAmbientLight = true;
    	this._savedStates = {};
    	this.resetLighting();
    }

    resetLighting = function()
    {
    	this._ambientLight.reset();
    };

    update = function()
    {
    	if (!(this._enabled)) return;
    	this._ambientLight.update();
    };

    enable = function()
    {
    	this.setState(true);
    };

    disable = function()
    {
    	this.setState(false);
    };

    setState = function(enabled:boolean)
    {
    	this._enabled = enabled;
    };

    setAmbientLight = function(target:any, time:any=null)
    {
    	if (typeof target == "string")
    	{
    		var color = /^#?([a-f\d]{2})?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(target);
    		if (color) {
    			var i = color[1] ? (parseInt(color[1], 16)) / 255 : null;
    			var r = (parseInt(color[2], 16)) / 255;
    			var g = (parseInt(color[3], 16)) / 255;
    			var b = (parseInt(color[4], 16)) / 255;
    			this._ambientLight.set(i, time, r, g, b);
    		}
    	}
    	else
    	{
    		var i = target.clamp(0, 100) / 100;
    		this._ambientLight.set(i, time);
    	}
    };



    saveState = function(stateName:string)
    {
    	this._savedStates[stateName] =
    	{
    		"enabled": this._enabled,
    		"ambientLight":
    		{
    			"intensity": this._ambientLight.intensity,
    			"red": this._ambientLight.red,
    			"green": this._ambientLight.green,
    			"blue": this._ambientLight.blue
    		},
    		"autoAmbientLight": this._autoAmbientLight
    	};
    };

    loadState = function(stateName:string, time:any)
    {
    	if (stateName in this._savedStates)
    	{
    		this._enabled = this._savedStates[stateName]["enabled"];
    		let i = this._savedStates[stateName]["ambientLight"]["intensity"];
    		let r = this._savedStates[stateName]["ambientLight"]["red"];
    		let g = this._savedStates[stateName]["ambientLight"]["green"];
    		let b = this._savedStates[stateName]["ambientLight"]["blue"];
    		this._ambientLight.set(i, time, r, g, b);
    		this._autoAmbientLight = this._savedStates[stateName]["autoAmbientLight"];
    	}
    };

    copyAmbientLight = function(gameLighting:any)
    {
    	let i = gameLighting.ambientLight.intensity;
    	let r = gameLighting.ambientLight.red;
    	let g = gameLighting.ambientLight.green;
    	let b = gameLighting.ambientLight.blue;
    	this._ambientLight.set(i, 0, r, g, b);
    };
  }
}

class AmbientLight
{

  _intensity:number;
  _red:number;
  _green:number;
  _blue:number;

  _ti:number;
  _tr:number;
  _tg:number;
  _tb:number;
  _di:number = 0.0;
  _dr:number = 0.0;
  _dg:number = 0.0;
  _db:number = 0.0;
  _timer:number = 0;

  public get intensity():number
  {
    return this._intensity;
  }

  public get red():number
  {
    return this._red;
  }

  public get green():number
  {
    return this._green;
  }

  public get blue():number
  {
    return this._blue;
  }

  constructor()
  {
    this.reset();
  }

  reset()
  {
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
  }

  update()
  {
  	if (this._timer > 0)
  	{
  		this.processChanges();
  		this._timer -= 1;
  		if (!(this._timer > 0)) this.processTarget();
  	};
  };

  set(i:any, time:any, r:any, g:any, b:any)
  {
  	this._timer = (typeof time == "number" ? time : 0);
  	this._ti = (typeof i == "number" ? i : this._intensity);
  	this._tr = (typeof r == "number" ? r : this._red);
  	this._tg = (typeof g == "number" ? g : this._green);
  	this._tb = (typeof b == "number" ? b : this._blue);
  	if (this._timer > 0)
  	{
  		this._di = (this._ti - this._intensity) / this._timer;
  		this._dr = (this._tr - this._red) / this._timer;
  		this._dg = (this._tg - this._green) / this._timer;
  		this._db = (this._tb - this._blue) / this._timer;
  	}
  	else
  	{
  		this.processTarget();
  	}
  }

  processChanges()
  {
  	this._intensity += this._di;
  	this._red += this._dr;
  	this._green += this._dg;
  	this._blue += this._db;
  }

  processTarget()
  {
  	this._intensity = this._ti;
  	this._red = this._tr;
  	this._green = this._tg;
  	this._blue = this._tb;
  }

}
