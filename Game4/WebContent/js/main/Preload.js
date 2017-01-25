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
	
	this.scene = new preBackGround(this.game);
	
	// initial setting 
	this.scene.fBtn_login_facebook.visible = false;
	this.scene.fBtn_login_guest.visible = false;
	
	this.aniLoading = this.game.add.sprite(155, 451, "PREIMAGE");
	this.aniLoading.animations.add("aniLoading", Phaser.Animation.generateFrameNames("loading", 0, 2, ".png", 4), 10, true);
	this.aniLoading.animations.play("aniLoading");
	
	this.load.pack("start", "assets/assets-pack.json");
	this.game.load.spritesheet("GEMS", "assets/start/block/blocks.png", 81, 82);
	this.game.load.atlas("EFFECTS", "assets/start/effect/effect.png", "assets/start/effect/effect.json", Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
	this.game.load.atlas("BESTSCORE", "assets/start/effect/bestScore.png", "assets/start/effect/bestScore.json", Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
	this.game.load.bitmapFont('comboFont', 'assets/start/font/comboFont.png', 'assets/start/font/comboFont.xml');
	this.game.load.bitmapFont('textScore', 'assets/start/font/textScoreFont.png', 'assets/start/font/textScoreFont.xml');
	this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	this.game.load.atlas("TXTTOUCHED", "assets/start/UI/txtTounched.png", "assets/start/UI/txtTounched.json", Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
};

Preload.prototype.WaitUserLogin = function() {
	this.scene.fGroupAnimTimeOver.visible = false;
	this.aniLoading.animations.stop("aniLoading");
	this.aniLoading.visible = false;
	
	this.scene.fBtn_login_facebook.inputEnabled = true;
	this.scene.fBtn_login_facebook.visible = true;
	this.scene.fBtn_login_guest.inputEnabled = true;
	this.scene.fBtn_login_guest.visible = true;
	
	this.scene.fBtn_login_facebook.events.onInputDown.add(this.LoginToFacebook);
	this.scene.fBtn_login_guest.events.onInputDown.add(function(){
		FB_DATA.init();
        USER_DATA.init();
		this.game.state.start("Menu");
	});
}

var LoginStatusChangeCallback = function(response) {
	if (response.status === 'connected') {
		FB.api('/me', {fields:'id,name,picture'}, function(apiResponse) {
			if (apiResponse.hasOwnProperty('id')) {
                FB_DATA['id'] = apiResponse['id'];
            }

            if (apiResponse.hasOwnProperty('name')) {
                FB_DATA['name'] = apiResponse['name'];
            }

            if (apiResponse.hasOwnProperty('picture')) {
                if (apiResponse['picture'].hasOwnProperty('data')) {
                    if (apiResponse['picture']['data'].hasOwnProperty('url')) {
                        FB_DATA['profile'] = apiResponse['picture']['data']['url'];
                    }
                }
            }

            $.post("http://stz-phaser-proto.appspot.com/init", JSON.stringify(FB_DATA), function(data) {
                var jsonObj = JSON.parse(data);
            	console.log(jsonObj);
            	USER_DATA['id'] = jsonObj['id'];
            	USER_DATA['topScore'] = jsonObj['topScore'];
            	Score.maxScore = USER_DATA['topScore'];
            	console.log("Score.maxScore = " + Score.maxScore);
            	window.game.state.start("Start");
            })

           console.log(FB_DATA);
            
		});
		return true;
	} 
	return false;	
};

Preload.prototype.LoginToFacebook = function() {
	FB.login(function(response) {
		if (LoginStatusChangeCallback(response) === false) {
			this.WaitUserLogin();
		}
	});
};

Preload.prototype.create = function() {
	
	if (USE_FB_INTEGRATION == true) {
		
		this.WaitUserLogin();
		return;
		//this.WaitUserLogin();
		FB.getLoginStatus(function(response) {
			if (LoginStatusChangeCallback(response) === false) {
				this.WaitUserLogin();
			}
		});		
	} else {
		FB_DATA.init();
		this.game.state.start("Menu");
	}

};
