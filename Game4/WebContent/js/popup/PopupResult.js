function PopupResult() {
	
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
PopupResult.prototype = proto;

PopupResult.prototype = {
preload : function(){
	
},

init : function(game){
	PopupResult.prototype.scene = new PopupResultResource(game);
	PopupResult.prototype.scene.visible = false;
	
	PopupResult.prototype.scene.fBtn_game_close.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_game_close.events.onInputDown.add(Start.prototype.exitGame, this);
	
	PopupResult.prototype.scene.fBtn_popup_restart.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_popup_restart.events.onInputDown.add(Start.prototype.restartGame, this);
},

show : function(){
	PopupResult.prototype.scene.visible = true;
},

hide : function(){
	PopupResult.prototype.scene.visible = false;
}
}