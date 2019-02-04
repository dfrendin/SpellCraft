/*=============================================================================
 * SpellCraft - NPC
 * By David Frendin <david.frendin@gmail.com>
 * SpellCraft_NPC.js
 * Version: 1.0
 * Creative Commons Attribution NonCommercial NoDerivs (CC-NC-ND).
 * - https://creativecommons.org/licenses/by-nc-nd/4.0/
 *=============================================================================*/
/*:
 * @plugindesc Manage non-playable characters (NPC) <SpellCraft::NPC>
 * @author David Frendin
 *
 * @help
 * ============================================================================
 * SpellCraft - NPC
 * ============================================================================
 * 
 *=============================================================================*/
var Imported = Imported || {};


// Check dependencies
if (Imported.SpellCraft === undefined)
	throw new Error("Missing dependency: SpellCraft::Core");	



var SpellCraft = SpellCraft || {};
SpellCraft.NPC = SpellCraft.NPC || MVC.shallowClone(EventManager);

(function($)
{
	"use strict";

	var parameters = $plugins.filter(function(plugin) { return plugin.description.contains('<SpellCraft::NPC>'); });
	if (parameters.length === 0)
		throw new Error("Couldn't find SpellCraft::NPC parameters.");
	
	$.Parameters = parameters[0].parameters;
	$.Param = {};
	
	// Params
	var pConfiguration	  = String(parameters['Configuration File'] || 'data/Rumors.json');
	
	
	var routeOpenDoor = {'wait': true, 'skippable': false, 'repeat': false, 'list': [{
					"code": 17
				}, {
					"code": 15,
					"parameters": [3]
				}, {
					"code": 18
				}, {
					"code": 15,
					"parameters": [3]
				}, {
					"code": 19
				}, {
					"code": 37
				}, {
					"code": 0
				}]};

	var routeCloseDoor = {'wait': true, 'skippable': false, 'repeat': false, 'list': [
		{"code":38,"indent":null}
		,{"code":16,"indent":null}
		,{"code":15,"parameters":[3],"indent":null}
		,{"code":17,"indent":null}
		,{"code":15,"parameters":[3],"indent":null}
		,{"code":18,"indent":null}
		,{"code":0}
	]};

	

	// Code
	console.log("Reading NPC config: data/NPC.json");
	$.NPCData = JSON.parse(SpellCraft.IO.readFile('data', 'NPC.json'));
	console.log('file contents:');
	console.log($.NPCData);
	
	for (let i = 0; i < $.NPCData.length; i++)
	{
		$.NPCData[i].script = SpellCraft.IO.readFile('js/npc', $.NPCData[i].id + '.js')
	}
	
	
	$.MapNPCs = [];
	



	
	$.GetCurrentWaypoint = function (npc, mapId)
	{
		if (!mapId)
			mapId = $gameMap._mapId;

		//console.log('Trying to get current waypoint for npc ' + npc.name + ' for mapId ' + mapId);

		
		//Does the NPC have waypoints setup for current map?
		if (('map' + mapId in npc.maps) === false)
			return false;
		
		npc.maps['map' + mapId].forEach(function (waypoint, index)
		{
			let _timeH = parseInt(waypoint.time.split(':')[0]);
			let _timeM = parseInt(waypoint.time.split(':')[1]);
			
			if (GameTime.hour <= _timeH)
			{
				if (GameTime.minute <= _timeM)
				{
					console.log('waypoint is in the future');
					//waypoint is in the future
					
					if (index == 0)
					{
						//if the first index is in the future, the last index should be the current
						return npc.maps['map' + mapId][npc.maps['map' + mapId].length - 1];
					}
					else
					{
						return npc.maps['map' + mapId][index--];
					}
				}
			}
		});
		
		return npc.maps['map' + mapId][0];
		
	};

	$.GetGameMapEventByEventId = function (eventId)
	{
		for (let i = 0; i < $gameMap._events.length; i++)
		{
			if (!$gameMap._events[i])
				continue;
			
			if ($gameMap._events[i]._eventId == eventId)
				return $gameMap._events[i];
		}
		return false;
	};

	$.GetDataMapEventByName = function (eventName)
	{
		console.log('trying to get datamap event by name ' + eventName);
		console.log($dataMap.events);
		
		for (let i = 0; i < $dataMap.events.length; i++)
		{
			if (!$dataMap.events[i])
				continue;
				
			if ($dataMap.events[i].name == eventName)
				return $dataMap.events[i];
		}
		return false;
	};
	
	$.IsWaypointInFuture = function (wp)
	{
		let _timeH = parseInt(wp.time.split(':')[0]);
		let _timeM = parseInt(wp.time.split(':')[1]);
		
		if (GameTime.hour <= _timeH)
		{
			if (GameTime.minute <= _timeM)
			{
				return true;
			}
		}
		return false;
	};
	
	Game_Map.prototype.setupOld = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId)
	{
		$.MapNPCs = [];
		
		if(mapId !== undefined && mapId > 0)
		{

			// Add all NPCs that have waypoints for the current map
			for (let i = 0; i < $.NPCData.length; i++)
			{
				if ('map' + mapId in $.NPCData[i].waypoints)
				{
					$.MapNPCs.push({'data': $.NPCData[i], 'waypoints': $.NPCData[i].waypoints['map' + mapId]});
				}
			};
			
			// Sort waypoints for each NPC on the map
			for (let i = 0; i < $.MapNPCs.length; i++)
			{
				// Create simple timestamp (sts, number of minutes since 00:00 in-game time)
				for (let j = 0; j < $.MapNPCs[i].waypoints.length; j++)
				{
					$.MapNPCs[i].waypoints[j].sts = (parseInt($.MapNPCs[i].waypoints[j].time.split(':')[0]) * 60) + parseInt($.MapNPCs[i].waypoints[j].time.split(':')[1]);
					console.log('sts set to: ' + $.MapNPCs[i].waypoints[j].sts);
				}
				
				// Sort waypoints according to their simple timestamps
				$.MapNPCs[i].waypoints.sort(function(wp1, wp2)
				{
					return wp1.sts - wp2.sts;
				});
				
				// Move past waypoints to the back of the waypoints queue
				for (let j = 0; j < $.MapNPCs[i].waypoints.length; j++)
				{
					if (GameTime.sts > $.MapNPCs[i].waypoints[0].sts)
					{
						//waypoint is in the past, move to the back of the array
						$.MapNPCs[i].waypoints.push($.MapNPCs[i].waypoints.shift());
					}
					else
					{
						break;
					}
				}
				
				// Set last waypoint, should be the waypoint in the end of the array
				for (let j = 0; j < $.MapNPCs[i].waypoints.length; j++)
				{
					$.MapNPCs[i].last_waypoint = $.MapNPCs[i].waypoints[$.MapNPCs[i].waypoints.length-1];
				}
				

				console.log('$.MapNPCs');
				console.log($.MapNPCs);
				
			}
			
			
			console.log('NPC fix for mapId: ' + mapId);

			

		}
	   
	   
	   
		return this.setupOld.apply(this, arguments);
	}
	
	var startOld = Scene_Map.prototype.start;
	Scene_Map.prototype.start = function()
	{
		//Add NPCs by their starting positions
		
		if ($gameMap._mapId != 6)
			return startOld.apply(this, arguments);
		
		for (let i = 0; i < $.MapNPCs.length; i++)
		{
			if ($.MapNPCs[i].last_waypoint.action)
			{
				if ($.MapNPCs[i].last_waypoint.action.type == 'exit_using_door')
				{
					console.log('NPC has not entered the scene');
					continue;
				}
			}
			
			let x = $.MapNPCs[i].last_waypoint.location.x;
			let y = $.MapNPCs[i].last_waypoint.location.y;
			let characterName = $.MapNPCs[i].data.characterName;
			let characterIndex = $.MapNPCs[i].data.characterIndex;
			
			$.MapNPCs[i].event = $gameMap.createNormalEventAt(characterName, characterIndex, x, y, 2, $.MapNPCs[i].data.script, true);
		}
		

		return startOld.apply(this, arguments);
	};
	
	$.on('changeTime', function()
	{
		for (let i = 0; i < $.MapNPCs.length; i++)
		{
			if (GameTime.sts > $.MapNPCs[i].waypoints[0].sts)
			{
				if ($.MapNPCs[i].waypoints[0].action)
				{
					if ($.MapNPCs[i].waypoints[0].action.type == 'enter_using_door')
					{
						let doorEventName = $.MapNPCs[i].waypoints[0].action.door_name;
						let doorEventData = $.GetDataMapEventByName(doorEventName);
						let doorEvent = $.GetGameMapEventByEventId(doorEventData.id);
						
						console.log('doorEvent');
						console.log(doorEvent);
						
						doorEvent.forceMoveRoute(routeOpenDoor);
						//doorEvent.processMoveCommand({code: });
						
						
						let x = doorEvent._x;
						let y = doorEvent._y;
						let characterName = $.MapNPCs[i].data.characterName;
						let characterIndex = $.MapNPCs[i].data.characterIndex;
						
						console.log('spawning at x ' + x + ', y ' + y);
						
						$.MapNPCs[i].event = $gameMap.createNormalEventAt(characterName, characterIndex, x, y, 2, $.MapNPCs[i].data.script, true);
						
						let newX = $.MapNPCs[i].waypoints[0].location.x;
						let newY = $.MapNPCs[i].waypoints[0].location.y;
						$.MapNPCs[i].event.moveSpeed = 1;
						$.MapNPCs[i].event.setDestination(newX, newY, 2);
						
						doorEvent.forceMoveRoute(routeCloseDoor);

						
						//move current waypoint to the back of the array
						$.MapNPCs[i].last_waypoint = $.MapNPCs[i].waypoints[$.MapNPCs[i].waypoints.length-1];
						$.MapNPCs[i].waypoints.push($.MapNPCs[i].waypoints.shift());
						continue;

					}
				}
				else
				{
					//move to new location
					let x = $.MapNPCs[i].waypoints[0].location.x;
					let y = $.MapNPCs[i].waypoints[0].location.y;
					$.MapNPCs[i].event.moveSpeed = 1;
					$.MapNPCs[i].event.setDestination(x, y, 2);
					
					//move current waypoint to the back of the array
					$.MapNPCs[i].last_waypoint = $.MapNPCs[i].waypoints[$.MapNPCs[i].waypoints.length-1];
					$.MapNPCs[i].waypoints.push($.MapNPCs[i].waypoints.shift());
					continue;
				}
			}


		}
		
		
		/*if ($.FutureQueue.length == 0)
			return;
		
		if (!$.IsWaypointInFuture($.FutureQueue[0].waypoint))
		{
			console.log('waypoint is not in future');
		}
		else
		{
			console.log('waypoint is in future: in-game time ' + GameTime.hour + ':' + GameTime.minute + ', matching against waypoint ' + $.FutureQueue[0].waypoint.time.split(':')[0] + ':' + $.FutureQueue[0].waypoint.time.split(':')[1]);
		}
		
		//in-game time has changed, check if we should update waypoints
		while (!$.IsWaypointInFuture($.FutureQueue[0].waypoint))
		{
			console.log('Waypoint for ' + $.FutureQueue[0].npc_id + ' should be updated to X: ' + $.FutureQueue[0].waypoint.location.x + ', Y: ' + $.FutureQueue[0].waypoint.location.y);
			$.TempEvent.setDestination($.FutureQueue[0].waypoint.location.x, $.FutureQueue[0].waypoint.location.y, 2);
			//$gameMap.createNormalEventAt('Actor1', 0, 15, 12, 2, 1, true);

			$.PastQueue.push($.FutureQueue.shift());
			if ($.FutureQueue.length == 0)
				break;
		}*/
		
/*		$.FutureQueue.forEach(function (npcQueue, index)
		{
			//let _wp = $.GetCurrentWaypoint(npc);
			if (!$.IsWaypointInFuture(npcQueue.waypoint))
			{
				console.log('index is ' + index);
				$.PastQueue.push($.FutureQueue.shift());
				console.log('Waypoint for ' + npcQueue.npc_id + ' should be updated to X: ' + npcQueue.waypoint.location.x + ', Y: ' + npcQueue.waypoint.location.y);
			}
			else
			{
				//
			}
		});*/

	});
	
	
	//$gameMap._mapId
	

  
})(SpellCraft.NPC);

NPC = SpellCraft.NPC;
Imported.NPC = 1.0;