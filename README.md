# SpellCraft
A RPG Maker MV plugin.

## Event management
SpellCraft provides a simple observer/emitter-type framework for MV.

By default various MV events are emitted, such as when DataManager.setupNewGame is run. Normally you would override MVs function and use it as entry points where the plugin is called from within the MV environment.

SpellCraft Core allready overrides various usefull functions and emits events once these functions are executed - allowing plugin design to subscribe to events rather than overriding code.

```javascript
$sc.EventManager.on('setupNewGame', function () {
    // this code is executed directly after DataManager.setupNewGame is run 
})
```
A simple example that subscribes to the "setupNewGame" event and passes an anonymous function to be executed once the event has been triggered.

You can also use EventManager to emit your own events as well as subscribe to them.
```javascript
this.add = function() {
    this.value++;
    if (this.value == 10)
        $sc.EventManager.emit('countedTo10');
}

$sc.EventManager.on('countedTo10', function () {
    console.log('Recieved countedTo10 event');
})
```


# Credits / recognition
 - Khas - Amazing work on MV plugins with WebGL, gained loads of insights by his inspirational works.
 -- http://arcthunder.blogspot.com/
 - freepik - Awesome vector graphics used in the boilerplate project.
 -- https://www.freepik.com/free-photos-vectors/design
 - Hudell - Amazing source of information and inspiration with his orange plugins for MV.
 -- https://tropicalpuppy.com/
 - Kino - NodeJS IO tutorial. 
 -- https://forums.rpgmakerweb.com/index.php?threads/rpgmakermv-node-js-part-1-reading-and-writing-files.80140/