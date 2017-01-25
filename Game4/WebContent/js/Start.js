function _StartPreferences(){
	this.GAME_WIDTH = 480;
	this.GAME_HEIGHT = 800;
	this.INGAME_UI_TOP_OFFSET = 172;
	this.INGAME_UI_LEFT_OFFSET = -3;
	this.GEM_SIZE = 68;
	this.GEM_SPACING = 0;
	this.GEM_SIZE_SPACED = this.GEM_SIZE + this.GEM_SPACING;
	this.GEM_TWEEN_SPEED = 150;
	this.BOARD_COLS = 7;
	this.BOARD_ROWS = 7;
	this.MATCH_MIN = 3;
	this.SCORE_PER_GEM = 10;
	this.GEM_REFILL_DURATION_TIME = 50;
	this.GAME_LIMIT_TIME = 60;
	this.GAME_TIMER_DURATION_MS = 250;
	this.GAUGE_TIMER_BODY_INITIAL_SCALE = 0.8;
	this.UNIT_SCORE						= 100;
	this.COMBO_TIME						= 1500;
}
var StartPreferences = new _StartPreferences();

var gems;
var selectedGem = null;
var selectedGemStartPos;
var selectedGemTween = null;
var tempShiftedGem = null;
var allowInput;
var scoreText;
var comboText;
var isFocus = false;

var startTimestamp = 0;
var pauseTimestamp = 0;
var remainSecond = 0;

var startComboStamp = 0;
var comboDeltaTime = 0;
var isComboUp = false;

var remainTimeText = 0;

var isPause = false;
var isReady = false;

var blind;

var resultPopup;
/**
 * Start state.
 */
function Start() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Start.prototype = proto;

Start.prototype.preload = function() {
	if (FB_DATA != null) {
		this.game.load.crossOrigin = "Anonymous";
		this.game.load.image('myProfileImage', FB_DATA['profile']);	
	}
	
}

Start.prototype.create = function() {
	this.initUI();
	
	spawnBoard();

	 // currently selected gem starting position. used to stop player form
		// moving gems too far.
    selectedGemStartPos = { x: 0, y: 0 };
    
    // used to disable input while gems are dropping down and respawning

	blind = window.game.add.graphics(0,0);
	blind.beginFill(0x000000, 1);
	blind.drawRect(0, 0, window.game.world.width, window.game.world.height);
	blind.alpha  = 0.7;
	blind.visible = false;
	
	resultPopup = new PopupResult();
	resultPopup.init(window.game, this);
	
    checkAllAndKillGemMatches();
    
    window.game.input.addMoveCallback(slideGem, this);

    allowInput = true;
	isPause = false;
	isComboUp = false;
	isReady = false;
};

Start.prototype.update = function() {
	if (isPause === true) {
		return;
	}
	
	if (isReady === false){
		this.showReadyMessage();
		return;
	}

	var currentTimestamp = (new Date()).getTime();
	remainSecond = StartPreferences.GAME_LIMIT_TIME - ((currentTimestamp - startTimestamp) / 1000);

	if (remainSecond <= 0) {
		allowInput = false;
		remainTimeText.text = 0.00 + "";

        // / 최고 점수 업데이트
        if (Score.score > USER_DATA['topScore']) {
            if (USE_FB_INTEGRATION === true) {
                if (this.IS_SERVER_RUNNING == undefined || this.IS_SERVER_RUNNING == false) {
                    this.IS_SERVER_RUNNING = true;
                    $.post('http://stz-phaser-proto.appspot.com/update/score', JSON.stringify({id:USER_DATA['id'], topScore:Score.score}), function(response) {
                        var jsonObje = JSON.parse(response);
                        if (jsonObje.hasOwnProperty('code') == false) {
                            if (USER_DATA['id'] = jsonObje['id']) {
                                USER_DATA['topScore'] = jsonObje['topScore'];
                            }
                            this.IS_SERVER_RUNNING = false;
                        }
                    });
                }    
            }
        }
        // / 최고 점수 업데이트
        if(resultPopup.isUpdate == false){
        	 this.showEnd();
        }
        else{
        	resultPopup.update();
        }
	
	} else {
		this.scene.fImg_time_gauge_body.scale.x = (StartPreferences.GAUGE_TIMER_BODY_INITIAL_SCALE / StartPreferences.GAME_LIMIT_TIME * remainSecond);
		this.scene.fImg_time_gauge_tail.x = this.scene.fImg_time_gauge_body.x + this.scene.fImg_time_gauge_body.width;
		
		remainTimeText.text = remainSecond.toFixed(2) + "";
	}
	
	if(startComboStamp != 0){
		
		var currentComboStamp = (new Date()).getTime();
		comboDeltaTime = currentComboStamp - startComboStamp;
		comboText.text = Score.getCombo();
		
		if(isComboUp === true){
			this.scene.fImg_Combo.alpha = 0;
			comboText.alpha = 0;
		}
		
		if(comboText.alpha < 1){
			this.scene.fImg_Combo.alpha += 0.02;
			comboText.alpha += 0.02;
		}
	
		if(Score.setCombo(comboDeltaTime, isComboUp) === 0){
			startComboStamp = 0;
			
			this.scene.fImg_Combo.alpha = 0;
			comboText.alpha = 0;
		}
		
	}
	
	isComboUp = false;
	scoreText.text = Score.getScore();
}

Start.prototype.showEnd = function(){
	blind.visible = true;
	this.scene.fInGameMessagePopup.visible = true;
	this.scene.fMessageTimeOver.visible = true;
	if(this.scene.fMessageTimeOver.alpha < 1){
		this.scene.fMessageTimeOver.alpha += 0.02;
	}
	else {
		this.scene.fInGameMessagePopup.visible = false;
		Score.setMaxScore();
		resultPopup.show(Score.getScore());
	}	
}

Start.prototype.showReadyMessage = function(){
	if(this.scene.fInGameMessagePopup.visible === false){
		this.scene.fInGameMessagePopup.visible = true;
		
		blind.visible = true;
		
		var messageGroup = this.game.add.group();
		messageGroup.add(this.scene.fInGameMessagePopup);
		gems.bringToTop(messageGroup);

	}
	
	if(this.scene.fMessageReady.alpha < 1){
		this.scene.fMessageReady.alpha += 0.03;
	}
	else if(this.scene.fMessageReady.alpha >= 1){
		if(this.scene.fMessageGo.alpha < 1){
			this.scene.fMessageGo.alpha += 0.03;
		}
		else{
			this.scene.fInGameMessagePopup.visible = false;
			this.scene.fMessageGo.alpha = 0 ;
			this.scene.fMessageReady.alpha = 0 ;
			
			if(startTimestamp == 0){
				startTimestamp = (new Date()).getTime();
			}
			else{
				var currentTimestamp = (new Date()).getTime();
				var offsetTimestampFromPause = currentTimestamp - pauseTimestamp;
				startTimestamp += offsetTimestampFromPause;
			}
			
			blind.visible = false;
			isReady = true;
		}
	}	
}

Start.prototype.initUI = function () {
	this.scene = new startScene(this.game);
	this.game.time.advancedTiming = true;

	this.scene.fBtn_game_pause.inputEnalbed = true;
	this.scene.fBtn_game_pause.events.onInputDown.add(this.pauseGame, this);
	this.scene.fBtn_game_pause.visible = true;
	
	this.scene.fBtn_game_resume.inputEnabled = true;
	this.scene.fBtn_game_resume.events.onInputDown.add(this.resumeGame, this);
	this.scene.fBtn_game_resume.visible = false;
	
	this.scene.fBtn_popup_resume.inputEnabled = true;
	this.scene.fBtn_popup_resume.events.onInputDown.add(this.resumeGame, this);
	
	this.scene.fBtn_popup_restart.inputEnabled = true;
	this.scene.fBtn_popup_restart.events.onInputDown.add(this.restartGame, this);
	
	this.scene.fBtn_popup_go_main.inputEnabled = true;
	this.scene.fBtn_popup_go_main.events.onInputDown.add(this.exitGame, this);
	
	this.scene.fPopupPause.visible = false;
	
	this.scene.fInGameMessagePopup.visible = false;
	this.scene.fMessageGo.alpha = 0 ;
	this.scene.fMessageReady.alpha = 0 ;
	this.scene.fMessageTimeOver.alpha = 0 ;

	if (FB_DATA != null) {
		myProfileImage = window.game.add.image(36, 33, 'myProfileImage');	
	}
	
	scoreText = window.game.add.bitmapText(240, 70, 'textScore', '0', 30);
	scoreText.anchor.set(0.5);
	
	comboText = window.game.add.bitmapText(420, 125, 'comboFont', '0', 35);
	comboText.anchor.set(0.5);
	
	this.scene.fImg_Combo.alpha = 0;
	comboText.alpha = 0;
	
	remainTimeText = window.game.add.text(230, 718, StartPreferences.GAME_LIMIT_TIME.toFixed(2), {
		fontSize : '18px',
		fill : '#000'
	});
	remainTimeText.anchor.set(0.5);	
	
	Score.setInit();
	
	startTimestamp = 0;
	startComboStamp = 0;
}

Start.prototype.pauseGame = function() {
	blind.visible = true;
	pauseTimestamp = (new Date()).getTime();
	allowInput = false;
	
	var popupGroup = this.game.add.group();
	popupGroup.add(this.scene.fPopupPause);
	gems.bringToTop(popupGroup);

	this.scene.fPopupPause.visible = true;
	
	this.scene.fBtn_game_pause.visible = false;
	this.scene.fBtn_game_resume.visible = true;
}

Start.prototype.resumeGame = function () {
	
	this.scene.fPopupPause.visible = false;
	
	allowInput = true;
	isPause = false;
	isReady = false;
	
	this.scene.fBtn_game_pause.visible = true;
	this.scene.fBtn_game_resume.visible = false;
}

Start.prototype.restartGame = function() {
	
	this.initUI();
	
	this.resumeGame();
	
	this.create();
}

Start.prototype.exitGame = function() {
	this.game.state.start("Menu");
}

var currentPlayingAnimations = {};
Start.prototype.playAnimations = function(inName, inPosX, inPosY, inCallback) {
	
	if (currentPlayingAnimations.hasOwnProperty(inName) && currentPlayingAnimations[inName] == true) {
		return;
	}
	
	if (inName === "animTimeOver") {
		
		var timeOverAnim = this.game.add.sprite(174, 295, "EFFECTS");
		timeOverAnim.animations.add("timeover", Phaser.Animation.generateFrameNames("animTimeOver", 0, 42, "", 4), 30, false);
		timeOverAnim.animations.play("timeover");
		currentPlayingAnimations[inName] = true;	
		timeOverAnim.animations.currentAnim.onComplete.add(() => {
			this.pauseGame();
			currentPlayingAnimations[inName] = false;
			timeOverAnim.destroy();
		});
	}
	
	if (inName == "animBlockMatch") {
		var blockMatchAnim = game.add.sprite((inPosX  * StartPreferences.GEM_SIZE) + StartPreferences.INGAME_UI_LEFT_OFFSET
				, (inPosY  * StartPreferences.GEM_SIZE) + StartPreferences.INGAME_UI_TOP_OFFSET, "EFFECTS");
		blockMatchAnim.anchor.set(0.4, 0.6);
		blockMatchAnim.animations.add("blockmatch", Phaser.Animation.generateFrameNames("animBlockMatchEffect", 0, 5, "", 4), 30, false);
		blockMatchAnim.animations.play("blockmatch");
		
		blockMatchAnim.animations.currentAnim.onComplete.add(() => {
			blockMatchAnim.destroy();
		});
	}
}

var showReadyDelta = 0;

function spawnBoard() {

    gems = this.game.add.group();

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        for (var j = 0; j < StartPreferences.BOARD_ROWS; j++)
        {
            var gem = gems.create((i * StartPreferences.GEM_SIZE_SPACED) + StartPreferences.INGAME_UI_LEFT_OFFSET,
            		(j * StartPreferences.GEM_SIZE_SPACED) + StartPreferences.INGAME_UI_TOP_OFFSET, "GEMS");
            
            gem.name = 'gem' + i.toString() + 'x' + j.toString();
            gem.inputEnabled = true;
            gem.events.onInputDown.add(selectGem, this);
            gem.events.onInputUp.add(releaseGem, this);
            randomizeGemColor(gem);
            setGemPos(gem, i, j); // each gem has a position on the board
        }
    }    
}

// set the gem spritesheet to a random frame
var frameArray = [{normal : 0, click : 7},
                  {normal : 1, click : 11},
                  {normal : 2, click : 12},
                  {normal : 5, click : 3},
                  {normal : 6, click : 4},
                  {normal : 10, click : 8}]
		
		
function randomizeGemColor(gem) {
	gem.frame = frameArray[this.game.rnd.integerInRange(0, 5)].normal;
	
}

// set the position on the board for a gem
function setGemPos(gem, posX, posY) {

	gem.posX = posX;
	gem.posY = posY;
	gem.id = calcGemId(posX, posY);
}

function calcGemId(posX, posY) {

	return posX + posY * StartPreferences.BOARD_COLS;

}

function slideGem(pointer, x, y) {

    // check if a selected gem should be moved and do it

    if (selectedGem && pointer.isDown)
    {
        var cursorGemPosX = getGemPos(x, true);
        var cursorGemPosY = getGemPos(y, false);

        if (checkIfGemCanBeMovedHere(selectedGemStartPos.x, selectedGemStartPos.y, cursorGemPosX, cursorGemPosY))
        {
            if (cursorGemPosX !== selectedGem.posX || cursorGemPosY !== selectedGem.posY)
            {
                // move currently selected gem
                if (selectedGemTween !== null)
                {
                    game.tweens.remove(selectedGemTween);
                }

                selectedGemTween = tweenGemPos(selectedGem, cursorGemPosX, cursorGemPosY);

                gems.bringToTop(selectedGem);

                // if we moved a gem to make way for the selected gem earlier,
				// move it back into its starting position
                if (tempShiftedGem !== null)
                {
                    tweenGemPos(tempShiftedGem, selectedGem.posX , selectedGem.posY);
                    swapGemPosition(selectedGem, tempShiftedGem);
                }

                // when the player moves the selected gem, we need to swap the
				// position of the selected gem with the gem currently in that
				// position
                tempShiftedGem = getGem(cursorGemPosX, cursorGemPosY);

                if (tempShiftedGem === selectedGem)
                {
                    tempShiftedGem = null;
                }
                else
                {
                    tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY);
                    swapGemPosition(selectedGem, tempShiftedGem);
                }
            }
        }
    }
}

// select a gem and remember its starting position
var _preGem = null;

function selectGem(gem) {
    if (allowInput && isReady)
    {
    	if(_preGem != null){
    		for(var i = 0; i < frameArray.length; i++){
    			if(_preGem.frame == frameArray[i].click){
    				_preGem.frame = frameArray[i].normal;
    			}
    		}
    	}
    	
    	for(var i = 0; i < frameArray.length; i++){
			if(gem.frame == frameArray[i].normal){
				gem.frame = frameArray[i].click;
			}
		}
    	
        selectedGem = gem;
        selectedGemStartPos.x = gem.posX;
        selectedGemStartPos.y = gem.posY;
        
        _preGem = gem;
    }

}


function releaseGem() {
    if (tempShiftedGem == null && isFocus === false) {
        selectedGem = null;
        return;
    }
    
    if(_preGem != null){
		for(var i = 0; i < frameArray.length; i++){
			if(_preGem.frame == frameArray[i].click){
				_preGem.frame = frameArray[i].normal;
			}
		}
	}
	
    isFocus = false;

    // when the mouse is released with a gem selected
    // 1) check for matches
    // 2) remove matched gems
    // 3) drop down gems above removed gems
    // 4) refill the board

    this.game.time.events.add(200, function(){
        checkAndKillGemMatches();

        removeKilledGems();

        var dropGemDuration = dropGems();

        // delay board refilling until all existing gems have dropped down
        this.game.time.events.add(dropGemDuration * 50, refillBoard);

        allowInput = false;

        selectedGem = null;
        tempShiftedGem = null;    	
    }, this);
}

// find a gem on the board according to its position on the board
function getGem(posX, posY) {

    return gems.iterate("id", calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);

}

// since the gems are a spritesheet, their color is the same as the current
// frame number
function getGemColor(gem) {

    return gem.frame;

}

// gems can only be moved 1 square up/down or left/right
function checkIfGemCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {

    if (toPosX < 0 || toPosX >= StartPreferences.BOARD_COLS || toPosY < 0 || toPosY >= StartPreferences.BOARD_ROWS)
    {
        return false;
    }

    if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1)
    {
        return true;
    }

    if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1)
    {
        return true;
    }

    return false;
}

// count how many gems of the same color lie in a given direction
// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie
// to the right of the gem
// stops counting as soon as a gem of a different color or the board end is
// encountered
function countSameColorGems(startGem, moveX, moveY) {

    var curX = startGem.posX + moveX;
    var curY = startGem.posY + moveY;
    var count = 0;

    while (curX >= 0 && curY >= 0 && curX < StartPreferences.BOARD_COLS && curY < StartPreferences.BOARD_ROWS && getGemColor(getGem(curX, curY)) === getGemColor(startGem))
    {
        count++;
        curX += moveX;
        curY += moveY;
    }

    return count;

}

// swap the position of 2 gems when the player drags the selected gem into a new
// location
function swapGemPosition(gem1, gem2) {

    var tempPosX = gem1.posX;
    var tempPosY = gem1.posY;
    setGemPos(gem1, gem2.posX, gem2.posY);
    setGemPos(gem2, tempPosX, tempPosY);

}

// count how many gems of the same color are above, below, to the left and right
// if there are more than 3 matched horizontally or vertically, kill those gems
// if no match was made, move the gems back into their starting positions
function checkAndKillGemMatches() {

    if (selectedGem === null) { return; }

    if (tempShiftedGem === null ) { return; }

    var canKill = false;

    // process the selected gem

    var countUp = countSameColorGems(selectedGem, 0, -1);
    var countDown = countSameColorGems(selectedGem, 0, 1);
    var countLeft = countSameColorGems(selectedGem, -1, 0);
    var countRight = countSameColorGems(selectedGem, 1, 0);

    var countHoriz = countLeft + countRight + 1;
    var countVert = countUp + countDown + 1;

    if (countVert >= StartPreferences.MATCH_MIN)
    {
        killGemRange(selectedGem.posX, selectedGem.posY - countUp, selectedGem.posX, selectedGem.posY + countDown);
        Score.setScore(countVert);
        canKill = true;
    }

    if (countHoriz >= StartPreferences.MATCH_MIN)
    {
        killGemRange(selectedGem.posX - countLeft, selectedGem.posY, selectedGem.posX + countRight, selectedGem.posY);
        Score.setScore(countHoriz);
        canKill = true;
    }

    // now process the shifted (swapped) gem

    countUp = countSameColorGems(tempShiftedGem, 0, -1);
    countDown = countSameColorGems(tempShiftedGem, 0, 1);
    countLeft = countSameColorGems(tempShiftedGem, -1, 0);
    countRight = countSameColorGems(tempShiftedGem, 1, 0);

    countHoriz = countLeft + countRight + 1;
    countVert = countUp + countDown + 1;

    if (countVert >= StartPreferences.MATCH_MIN)
    {
        killGemRange(tempShiftedGem.posX, tempShiftedGem.posY - countUp, tempShiftedGem.posX, tempShiftedGem.posY + countDown);
        Score.setScore(countVert);
        canKill = true;
    }

    if (countHoriz >= StartPreferences.MATCH_MIN)
    {
        killGemRange(tempShiftedGem.posX - countLeft, tempShiftedGem.posY, tempShiftedGem.posX + countRight, tempShiftedGem.posY);
        Score.setScore(countHoriz);
        canKill = true;
    }

    if (! canKill) // there are no matches so swap the gems back to the
					// original positions
    {
        var gem = selectedGem;

        if (gem.posX !== selectedGemStartPos.x || gem.posY !== selectedGemStartPos.y)
        {
            if (selectedGemTween !== null)
            {
                game.tweens.remove(selectedGemTween);
            }

            selectedGemTween = tweenGemPos(gem, selectedGemStartPos.x, selectedGemStartPos.y);

            if (tempShiftedGem !== null)
            {
                tweenGemPos(tempShiftedGem, gem.posX, gem.posY);
            }

            swapGemPosition(gem, tempShiftedGem);

            tempShiftedGem = null;

        }
    }
    else{
    	
    	startComboStamp = (new Date()).getTime();
    	isComboUp = true;
    }

}

function checkAllAndKillGemMatches(){
	var canKill = false;
	for(var i =0; i < gems.length; i++)
	{
		var gem = gems.children[i];
		if( gem != null)
		{
			countUp = countSameColorGems(gem, 0, -1);
			countDown = countSameColorGems(gem, 0, 1);
			countLeft = countSameColorGems(gem, -1, 0);
			countRight = countSameColorGems(gem, 1, 0);
			
			countHoriz = countLeft + countRight + 1;
			countVert = countUp + countDown + 1;
			
			if (countVert >= StartPreferences.MATCH_MIN)
			{
				killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
				Score.setScore(countVert);
				canKill = true;
			}

			if (countHoriz >= StartPreferences.MATCH_MIN)
			{
			    killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
			    Score.setScore(countHoriz);
			    canKill = true;
			}
		}
	}
	if(canKill === true){
		isFocus = true;
		var dropGemDuration = dropGems();
	    // delay board refilling until all existing gems have dropped down
	    this.game.time.events.add(dropGemDuration * 50, releaseGem);
	}
	else{
		startComboStamp = (new Date()).getTime();
	}
	 
}

// kill all gems from a starting position to an end position
function killGemRange(fromX, fromY, toX, toY) {
	fromX = Phaser.Math.clamp(fromX, 0, StartPreferences.BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, StartPreferences.BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, StartPreferences.BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, StartPreferences.BOARD_ROWS - 1);

    for (var i = fromX; i <= toX; i++)
    {
        for (var j = fromY; j <= toY; j++)
        {
        	Start.prototype.playAnimations('animBlockMatch', i, j, function() {});
            var gem = getGem(i, j);
            gem.kill();
            gem = null;
        }
    }
}

// move gems that have been killed off the board
function removeKilledGems() {

    gems.forEach(function(gem) {
        if (!gem.alive) {
            setGemPos(gem, -1,-1);
        }
    });

}

// animated gem movement
function tweenGemPos(gem, newPosX, newPosY, durationMultiplier, inAfterCallback) {

    //console.log('Tween ',gem.name,' from ',gem.posX, ',', gem.posY, ' to ', newPosX, ',', newPosY);
    if (durationMultiplier === null
			|| typeof durationMultiplier === 'undefined') {
		durationMultiplier = 1;
	}

    var tween = game.add.tween(gem).to({x: (newPosX  * StartPreferences.GEM_SIZE) + StartPreferences.INGAME_UI_LEFT_OFFSET
    	, y: (newPosY * StartPreferences.GEM_SIZE_SPACED) + StartPreferences.INGAME_UI_TOP_OFFSET}, 150, Phaser.Easing.Linear.None, true);
    return tween; 
}

// look for gems with empty space beneath them and move them down
function dropGems() {

    var dropRowCountMax = 0;

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        var dropRowCount = 0;

        for (var j = StartPreferences.BOARD_ROWS - 1; j >= 0; j--)
        {
            var gem = getGem(i, j);

            if (gem === null)
            {
                dropRowCount++;
            }
            else if (dropRowCount > 0)
            {
                setGemPos(gem, gem.posX, gem.posY + dropRowCount);
                tweenGemPos(gem, gem.posX, gem.posY, dropRowCount);
            }
        }

        dropRowCountMax = Math.max(dropRowCount, dropRowCountMax);
    }

    return dropRowCountMax;

}

// look for any empty spots on the board and spawn new gems in their place that
// fall down from above
function refillBoard() {

    var maxGemsMissingFromCol = 0;

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        var gemsMissingFromCol = 0;

        for (var j = StartPreferences.BOARD_ROWS - 1; j >= 0; j--)
        {
            var gem = getGem(i, j);

            if (gem === null)
            {
                gemsMissingFromCol++;
                gem = gems.getFirstDead();
                gem.reset(i * StartPreferences.GEM_SIZE_SPACED + StartPreferences.INGAME_UI_LEFT_OFFSET,
                		-gemsMissingFromCol * StartPreferences.GEM_SIZE_SPACED + StartPreferences.INGAME_UI_TOP_OFFSET);
                randomizeGemColor(gem);
                setGemPos(gem, i, j);
                tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
            }
        }

        maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
    }

    game.time.events.add(maxGemsMissingFromCol * 2 * 50, boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {

    allowInput = true;
    checkAllAndKillGemMatches();
}
// convert world coordinates to board position
function getGemPos(coordinate, isX) {
	var posData = 0;
	
	if(isX === true)
	{
		posData = Math.floor((coordinate  - StartPreferences.INGAME_UI_LEFT_OFFSET) / StartPreferences.GEM_SIZE_SPACED);
	}
	else
	{
		posData = Math.floor((coordinate  - StartPreferences.INGAME_UI_TOP_OFFSET) / StartPreferences.GEM_SIZE_SPACED);
	}
    return posData;

}
