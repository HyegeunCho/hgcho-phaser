window.START_ANIPANG = function()
{
	// Create your Phaser game and inject it into an auto-created canvas.
	// We did it in a window.onload event, but you can do it anywhere (requireJS
	// load, anonymous function, jQuery dom ready, - whatever floats your boat)
	this.game = new Phaser.Game(480, 800, Phaser.AUTO);

	// Add the States your game has.
	this.game.state.add("Boot", Boot);
	this.game.state.add("Preload", Preload);
	this.game.state.add("Menu", Menu);
	this.game.state.add("PopupResult", PopupResult);
	this.game.state.add("Start", Start);
	
	// Now start the Boot state.
	this.game.state.start("Boot");    
};