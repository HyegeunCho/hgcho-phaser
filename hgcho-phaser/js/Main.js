window.onload = function() {
	// create the game
	this.game = new Phaser.Game(480, 800, Phaser.AUTO);
	// add the level sate
	this.game.state.add("Level", Level);
	// start the level
	this.game.state.start("Level");
};
