function PopupResult() {
	
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
PopupResult.prototype = proto;

PopupResult.prototype = {
preload : function(){
	
},

init : function(game){
	this.scene = new PopupResultResource(game);
	this.scene.visible = false;
},

show : function(){
	this.scene.visible = true;
},

hide : function(){
	this.scene.visible = false;
}
}