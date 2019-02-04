var me = false;

for (var i = 0; i < NPC.MapNPCs.length; i++)
{
	console.log('checking ' + NPC.MapNPCs[i].event._eventId + ' against ' + this._eventId);
	if (NPC.MapNPCs[i].event._eventId == this._eventId)
	{
		me = NPC.MapNPCs[i];
		break;
	}
}



//this.command101('test');

//console.log(JSON.parse(JSON.stringify(this._eventId)));
//console.log(JSON.parse(JSON.stringify(NPC.MapNPCs)));

//console.log(JSON.parse(JSON.stringify(me)));
		
/*		if (args.length > 3) {
			var faceFile = String(args[3]);
			
			var faceNum = 0;
			if (args.length > 4) {
				faceNum = Number(args[4]);
			}
			
			$gameMessage.setFaceImage(faceFile, faceNum);
		}
*/
//me.gameMessage.newPage();
//me.gameMessage.add("What do you want?");


this.setWaitMode('message');
$gameMessage.newPage();
$gameMessage.setFaceImage(me.data.characterName, me.data.characterIndex);
$gameMessage.add("My name is Michael.");

