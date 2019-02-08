## Time
SpellCraft provides functionality for in-game time management.

### Description
The in-game time updates once every second, and advances the in-game time by 10 in-game seconds.
So for every 6 seconds, a full in-game minute has passed and it takes 6 real minutes for an in-game hour to progress.
This behaviour is configurable and can be set to a faster or lower pace if desirable.

### Trigger execution on code based on in-game time
Everytime the in-game clock updates the ```'changeTime'``` event is emitted, with the current in-game time as a parameter.

Example:
```javascript
$sc.EventManager.on('changeTime', function (p) {
    if (p.timestamp > 60 * 36) {
        // 36 in-game hours have passed
    }
    if (p.hour == 11 and p.minute == 30) {
        // the in-game time is now 11:30am
    }
};
```

### Programmatically change in-game time
In-game time can be changed programmatically.
```javascript
$sc.Time.set(11, 30); //change time to 11:30am
```
