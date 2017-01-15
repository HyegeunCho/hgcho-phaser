/**
 * Menu state.
 */
function Menu() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Menu.prototype = proto;

Menu.prototype.preload = function() {
	this.scene = new preBackGround(this.game);
	
	this.scene.fBtn_login_facebook.visible = false;
	this.scene.fBtn_login_guest.visible = false;
	
	this.scene.fGroupAnimTimeOver.visible = false;
	
	this.txtTouched = this.game.add.sprite(40,501, "TXTTOUCHED");
	this.txtTouched.animations.add("touched", Phaser.Animation.generateFrameNames("touched", 1, 2, ".png", 4), 10, true);
	this.txtTouched.animations.play("touched");
};

Menu.prototype.create = function() {
	this.input.onDown.add(this.startGame, this);
};

Menu.prototype.startGame = function() {
	this.game.state.start("Start");
};