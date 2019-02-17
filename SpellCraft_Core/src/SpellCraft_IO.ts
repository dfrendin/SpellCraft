/*=============================================================================
* SpellCraft - Core: IO
* By David Frendin <david.frendin@gmail.com>
* SpellCraft_IO.ts
* Version: 1.0
* Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
* - https://creativecommons.org/licenses/by-nc-nd/4.0/
*=============================================================================*/

// <reference path="declarations/declarations.d.ts" />
namespace SpellCraft
{
	export interface ExternalFile
	{
		fileName:string;
		contents:string;
		mimeType:string;
	}

	export abstract class IO
	{
		public static execScript(src:string):Promise<{}>
		{
			return new Promise(function(resolve, reject)
			{
				let url:string = "js/" + src;
				let dom_script:any = document.createElement("script");
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
		}

		public static _fetchFileContents_cache:{ [index: string]: ExternalFile } = { };
		public static fetchFileContents(url:string, mimeType:string):Promise<ExternalFile>
		{
			return new Promise(function(resolve, reject)
			{
				if (SpellCraft.IO._fetchFileContents_cache == undefined)
					SpellCraft.IO._fetchFileContents_cache = {};

				if (SpellCraft.IO._fetchFileContents_cache[url])
				{
					resolve(SpellCraft.IO._fetchFileContents_cache[url]);
				}

		    let xhr = new XMLHttpRequest();
		    xhr.open('GET', url);
		    xhr.overrideMimeType(mimeType);
		    xhr.onload = function() {
		        if (xhr.status < 400) {
							let newFile:ExternalFile = {fileName: url, contents: xhr.responseText, mimeType:mimeType};
							SpellCraft.IO._fetchFileContents_cache[url] = newFile;
							resolve(newFile);
		        }
		    };
		    xhr.onerror = function() {
					reject(xhr);
		    };
		    xhr.send();
			});
		}

		static cachedFile(key:string): ExternalFile {
			return this._fetchFileContents_cache[key];
		}

		public static precacheFile(key:string, url:string):Promise<ExternalFile>
		{
			return new Promise(function(resolve, reject)
			{
				if (SpellCraft.IO._fetchFileContents_cache == undefined)
					SpellCraft.IO._fetchFileContents_cache = {};

				if (SpellCraft.IO._fetchFileContents_cache[key])
				{
					resolve(SpellCraft.IO._fetchFileContents_cache[key]);
				}

		    let xhr = new XMLHttpRequest();
		    xhr.open('GET', url);
		    xhr.overrideMimeType("text/plain");
		    xhr.onload = function()
				{
		        if (xhr.status < 400)
						{
							let newFile:ExternalFile = {fileName: url, contents: xhr.responseText, mimeType:"text/plain"};
							SpellCraft.IO._fetchFileContents_cache[key] = newFile;
							resolve(newFile);
		        }
		    };
		    xhr.onerror = function() {
					reject(xhr);
		    };
		    xhr.send();
			});
		}

		public static resolvePath(relativePath:string):string
		{
			//Checks if MV is in dev mode, or production, then decides the appropriate path
			relativePath = (Utils.isNwjs() && Utils.isOptionValid('test')) ? relativePath : '/www/' + relativePath;

			//Creates the path using the location pathname of the window and replacing certain characters
			var path:string = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, relativePath);
			if(path.match(/^\/([A-Z]\:)/))
				path = path.slice(1);

			//Decode URI component and finally return the path
			return decodeURIComponent(path);
		}

	}
}
