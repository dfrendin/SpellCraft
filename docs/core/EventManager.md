# SpellCraft.EventManager
SpellCraft provides a simple observer/emitter-type framework for MV plugins.

## Subscribing to an event
```$sc.EventManager.on(eventName, callback);```

Example:
```javascript
$sc.EventManager.on('setupNewGame', function () {
    // this code is executed directly after DataManager.setupNewGame is run 
});
```

## Emitting an event
```$sc.EventManager.emit(eventName, params, scope);```

Params and scope are optional parameters, scope is what ```this``` will refer to when the callback is being executed.

Example:
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

## Events

Predefined events that SpellCraft emits based on MV overrides.

| eventName | Triggered by |
| ------ | ------ |
| preSetupNewGame | DataManager.setupNewGame |
| setupNewGame | DataManager.setupNewGame |
| preGameMapSetup | Game_Map.gameMapSetup |
| gameMapSetup | Game_Map.gameMapSetup |
| preCreateWeather | Spriteset_Map.createWeather |
| createWeather | Spriteset_Map.createWeather |
| preSpritesetMapUpdate | Spriteset_Map.update |
| spritesetMapUpdate | Spriteset_Map.update |
| preSpritesetMapTerminate | Spriteset_Map.terminate |
| spritesetMapTerminate | Spriteset_Map.terminate |
| changeTime | SpellCraft |
