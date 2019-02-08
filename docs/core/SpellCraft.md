# SpellCraft Core


## Notes/comments
SpellCraft treats comments and notes stored in MV as potential sources of JSON. As such it will automatically try to parse notes and comments, and if successful, store the parsed object as a property on the object the data is read from.

The objects that have comments or notes are:
* $dataMap
* Game_Map
* Game_Event (comments through pages)

The instances of these objects will have a new property named ```noteJson```, containing the parsed JSON object.

### Example
If you set the notes field of a map to:
```
{ "hello": "World!" }
```

You can access the value of the maps "hello" value as such:
```javascript
$sc.EventManager.on('gameMapSetup', function(p) {
    console.log(this.noteJson.hello); //prints: "World!""
});
```

### Compatibility with other plugins
With respect to other plugins, if a note or comment can not be validated as JSON the value of .nodeJson will simply be ```false```.

Other plugins treat notes and comments fields differently. One common method is to parse each line and match it against a regular expression to determine if the line matches a defined tag, such as ```[tag]```, ```<tag>``` or similar.

To enable both third party plugins which scan lines for tags while also having comments/notes JSON valid, a recommendation is to add the tags as an array in the JSON:
```javascript
{
  "hello": "World!", 
  "tags":[
    "[tag1]",
    "[tag2]"
  ]
}
```
Third party plugins should be able to correctly match the tag definitions while at the same time the field is valid JSON and can be parsed as a data object.