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

//Begin namespace