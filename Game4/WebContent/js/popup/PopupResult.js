function PopupResult() {
	
}

var scoreResultText;
/** @type Phaser.State */
var proto = Object.create(Phaser.State);
PopupResult.prototype = proto;

PopupResult.prototype = {
preload : function(){
	
},

init : function(game, start){
	PopupResult.prototype.scene = new PopupResultResource(game);
	PopupResult.prototype.scene.visible = false;
	
	PopupResult.prototype.scene.fBtn_game_close.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_game_close.events.onInputDown.add(Start.prototype.exitGame, start);
	
	PopupResult.prototype.scene.fBtn_popup_restart.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_popup_restart.events.onInputDown.add(Start.prototype.restartGame, start);
	
	scoreResultText = window.game.add.bitmapText(240, 280, 'textScore', '0', 30);
	scoreResultText.anchor.set(0.5);
	scoreResultText.visible = false;
},

show : function(score){
	scoreResultText.visible = true;
	scoreResultText.text = score;
	PopupResult.prototype.scene.visible = true;
},

hide : function(){
	PopupResult.prototype.scene.visible = false;
}
}
