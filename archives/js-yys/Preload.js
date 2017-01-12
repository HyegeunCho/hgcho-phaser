/**
 * Preload state.
 */
function Preload() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Preload.prototype = proto;

Preload.prototype.preload = function() {
	
	this.load.pack("start", "assets-yys/assets-pack.json");
	this.game.load.spritesheet("GEMS", "assets-yys/start/block/blocks.png", 81, 82);
	this.game.load.atlas("EFFECTS", "assets-yys/start/effect/effect.png", "assets-yys/start/effect/effect.json", Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
	this.game.load.bitmapFont('comboFont', 'assets-yys/start/font/comboFont.png', 'assets-yys/start/font/comboFont.xml');
	this.game.load.bitmapFont('textScore', 'assets-yys/start/font/textScoreFont.png', 'assets-yys/start/font/textScoreFont.xml');
	
	this.scene = new preBackGround(this.game);

	var aniLoading = this.game.add.sprite(155, 451, "PREIMAGE");
	aniLoading.animations.add("aniLoading", Phaser.Animation.generateFrameNames("loading", 0, 2, ".png", 4), 10, true);
	aniLoading.animations.play("aniLoading");

	
	this.scene.fGroupAnimTimeOver.visible = false;
};

Preload.prototype.create = function() {
	this.game.state.start("Start");
};