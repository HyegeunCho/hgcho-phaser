function PopupResult() {
	
}

var scoreResultText;
var bestScore;
var maxText;
/** @type Phaser.State */
var proto = Object.create(Phaser.State);
PopupResult.prototype = proto;

PopupResult.prototype = {
preload : function(){
	
},
isUpdate : false,

init : function(game, start){
	PopupResult.prototype.scene = new PopupResultResource(game);
	PopupResult.prototype.scene.visible = false;
	
	PopupResult.prototype.scene.fBestScore.visible = false;
	
	PopupResult.prototype.scene.fBtn_game_close.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_game_close.events.onInputDown.add(Start.prototype.exitGame, start);
	
	PopupResult.prototype.scene.fBtn_popup_restart.inputEnalbed = true;
	PopupResult.prototype.scene.fBtn_popup_restart.events.onInputDown.add(Start.prototype.restartGame, start);
	
	scoreResultText = window.game.add.bitmapText(240, 330, 'textScore', '0', 45);
	scoreResultText.anchor.set(0.5);
	scoreResultText.visible = false;
	
	maxText = game.add.text(200, 490, "- phaser -\nrocking with\ngoogle web fonts");
	maxText.anchor.setTo(0.5);
	maxText.font = 'Revalia';
	maxText.fontSize = 30;
  
	maxText.strokeThickness = 2;
	maxText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
	
	bestScore = start.game.add.sprite(255, 180, "BESTSCORE");
	bestScore.anchor.set(0.5);
	bestScore.visible = false;
	bestScore.animations.add("bestScore", Phaser.Animation.generateFrameNames("best_score", 1, 9, ".png", 4), 8, false);
	bestScore.animations.currentAnim.onComplete.add(() => {
		maxText.visible = true;
		maxText.text = "최고 점수 : " + Score.getScore();
	});
	
	this.isUpdate = false;
	maxText.visible = false;
},

update : function(){
	var n;
	n = (window.game.rnd.integerInRange(0, 16777215)).toString(16);
	maxText.fill = '#'+ n;
},

show : function(score){
	maxText.visible = false;
	
	if(Score.isChangeMaxScore === true){
		bestScore.visible = true;
		bestScore.animations.play("bestScore");
		this.isUpdate = true;
	}
	else{
		maxText.visible = true;
		maxText.text = "최고 점수 : " + Score.getMaxScore();
	}
		
	scoreResultText.visible = true;
	scoreResultText.text = score;
	PopupResult.prototype.scene.visible = true;
},

hide : function(){
	PopupResult.prototype.scene.visible = false;
}

}
