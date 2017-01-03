// Example by https://twitter.com/awapblog
// ingame gemmatch state.

function Level() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State.prototype);
Level.prototype = proto;
Level.prototype.constructor = Level;

Level.prototype.init = function() {
	isFirstProtrait = this.scale.isPortrait;
	// Phser Auto Scaling :
	// http://www.html5gamedevs.com/topic/5949-solution-scaling-for-multiple-devicesresolution-and-screens/
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.minWidth = GAME_WIDTH / 2;
	this.scale.minHeight = GAME_HEIGHT / 2;

	if (this.game.device.desktop) {
		this.scale.maxWidth = GAME_WIDTH;
		this.scale.maxHeight = GAME_HEIGHT;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.updateLayout(true);
	} else {
		this.scale.maxWidth = 2048; // You can change this to gameWidth*2.5 if
									// needed
		this.scale.maxHeight = 1228; // Make sure these values are
										// proportional to the gameWidth and
										// gameHeight
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.forceOrientation(false, true);

		this.scale.enterIncorrectOrientation.add(handleIncorrect);
		this.scale.leaveIncorrectOrientation.add(handleCorrect);
		this.scale.updateLayout(true);
	}
}

Level.prototype.preload = function() {
	this.game.load.pack("ingame", "assets/asset-pack.json");
	// this.game.load.spritesheet("GEMS", "assets/sprites/diamonds32x5.png",
	// GEM_SIZE, GEM_SIZE);
	this.game.load.spritesheet("GEMS", "assets/sprites/blocks.png", 81, 82);
	this.add.plugin(Phaser.Plugin.Debug);
}

Level.prototype.create = function() {

	this.scene = new ingame(this.game);

	this.game.time.advancedTiming = true;

	this.scene.fBtnPause.inputEnalbed = true;
	this.scene.fBtnPause.events.onInputDown.add(pauseGame, this);
	this.scene.fBtnPause.visible = true;

	this.scene.fBtnResume.inputEnabled = true;
	this.scene.fBtnResume.events.onInputDown.add(resumeGame, this);
	this.scene.fBtnResume.visible = false;

	this.groupMessageUI = this.game.add.group();
	this.groupMessageUI.add(this.scene.fMessageReady);
	this.groupMessageUI.add(this.scene.fMessageGo);
	this.groupMessageUI.add(this.scene.fMessageTimeOver);

	this.scene.fMessageReady.visible = false;
	this.scene.fMessageGo.visible = false;
	this.scene.fMessageTimeOver.visible = false;

	initUI();
	// fill the screen with as many gems as possible
	spawnBoard();

	var tempMask = this.game.add.graphics(this.scene.fGameBoard.x, this.scene.fGameBoard.y);
	tempMask.beginFill(0xffffff);
	tempMask.drawRect(0, 0, this.scene.fGameBoard.width, this.scene.fGameBoard.height);
	
	gems.mask = tempMask;
	
	// currently selected gem starting position. used to stop player form moving
	// gems too far.
	selectedGemStartPos = {
		x : 0,
		y : 0
	};

	// used to disable input while gems are dropping down and respawning
	allowInput = true;

	this.game.input.addMoveCallback(slideGem, this);

	gameScore = 0;

	startTimestamp = (new Date()).getTime();

	this.game.scale.updateOrientationState();
}

Level.prototype.render = function() {
	// game.debug.text(game.time.fps, 2, 14, "#00ff00");
}

Level.prototype.update = function() {
	if (isPause == true) {
		return;
	}

	var currentTimestamp = (new Date()).getTime();
	remainSecond = GAME_LIMIT_TIME
			- ((currentTimestamp - startTimestamp) / 1000);

	if (remainSecond <= 0) {
		allowInput = false;
		remainTimeText.text = 0.00 + "";
		// remainTimeText.text = 'reaminTime: ' + 0.00 + " / " + (function() {
		// if (game.scale.isGamePortrait) {
		// return "True";
		// } else {
		// return "False";
		// }
		// }());
		this.game.world.bringToTop(this.groupMessageUI);
		this.scene.fMessageTimeOver.visible = true;
	} else {
		remainTimeText.text = remainSecond.toFixed(2) + "";
		// remainTimeText.text = 'reaminTime: ' + remainSecond.toFixed(2) + " /
		// " + (function() {
		// if (game.scale.isGamePortrait) {
		// return "True";
		// } else {
		// return "False";
		// }
		// }());;
	}
}

var BLOCK_TYPE = [ "ani", "ari", "blue", "lucy", "micky", "mongyi", "pinky",
		"mao", "bomb" ];

var GAME_WIDTH = 480;
var GAME_HEIGHT = 800;

var INGAME_UI_TOP_OFFSET = 175;
var INGAME_UI_LEFT_OFFSET = -8;
var GEM_SIZE = 68;
var GEM_SPACING = 0;
var GEM_SIZE_SPACED = GEM_SIZE + GEM_SPACING;
var BOARD_COLS;
var BOARD_ROWS;
var MATCH_MIN = 3; // min number of same color gems required in a row to be
					// considered a match
var SCORE_PER_GEM = 10;

var GEM_REFILL_DURATION_TIME = 50;
var GAME_LIMIT_TIME = 60;
var GAME_TIMER_DURATION_MS = 250;

// UI Component
var scoreText;
var remainTimeText;
var imgBtnPause;
var imgBtnResume;

var gems;
var selectedGem = null;
var selectedGemStartPos;
var selectedGemTween;
var tempShiftedGem = null;
var allowInput;

var gameScore = 0;
var startTimestamp = 0;
var pauseTimestamp = 0;
var remainSecond = 0;

var isPause = false;

var isFirstPortrait = true;

function handleIncorrect() {
	if (!this.game.device.desktop) {
		document.getElementById("turn").style.display = "block";
	}
}

function handleCorrect() {
	if (!this.game.device.desktop) {
		if (!isFirstProtrait) {
			document.getElementById("turn").style.display = "block";
		} else {
			document.getElementById("turn").style.display = "none";
		}
	}
}

function pauseGame() {
	pauseTimestamp = (new Date()).getTime();
	allowInput = false;
	isPause = true;

	imgBtnPause.visible = false;
	imgBtnResume.visible = true;
}

function resumeGame() {
	var currentTimestamp = (new Date()).getTime();
	var offsetTimestampFromPause = currentTimestamp - pauseTimestamp;
	startTimestamp += offsetTimestampFromPause;

	console.log("[resumeGame] remainSecond(" + remainSecond.toFixed(2)
			+ "), currentTimestamp(" + currentTimestamp + ")");

	isPause = false;
	allowInput = true;

	imgBtnPause.visible = true;
	imgBtnResume.visible = false;
}

function gofull(pointer) {
	if ((pointer.x < 0 || pointer.x > 50)
			&& (pointer.y < 530 || pointer.y > 580)) {
		return;
	}
	if (this.game.scale.isFullScreen) {
		this.game.scale.stopFullScreen();
	} else {
		this.game.scale.startFullScreen(true);
	}
}

function releaseGem() {

	if (tempShiftedGem === null) {
		selectedGem = null;
		return;
	}

	// when the mouse is released with a gem selected
	// 1) check for matches
	// 2) remove matched gems
	// 3) drop down gems above removed gems
	// 4) refill the board

	checkAndKillGemMatches();

	removeKilledGems();

	var dropGemDuration = dropGems();

	// delay board refilling until all existing gems have dropped down
	this.game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME,
			refillBoard);

	allowInput = false;

	selectedGem = null;
	tempShiftedGem = null;

}

function slideGem(pointer, x, y) {

	// check if a selected gem should be moved and do it

	if (selectedGem && pointer.isDown) {
		var cursorGemPosX = getGemPos(x, true);
		var cursorGemPosY = getGemPos(y, false);

		if (checkIfGemCanBeMovedHere(selectedGemStartPos.x,
				selectedGemStartPos.y, cursorGemPosX, cursorGemPosY)) {
			if (cursorGemPosX !== selectedGem.posX
					|| cursorGemPosY !== selectedGem.posY) {
				// move currently selected gem
				if (selectedGemTween !== null) {
					this.game.tweens.remove(selectedGemTween);
				}

				selectedGemTween = tweenGemPos(selectedGem, cursorGemPosX,
						cursorGemPosY);

				gems.bringToTop(selectedGem);

				// if we moved a gem to make way for the selected gem earlier,
				// move it back into its starting position
				if (tempShiftedGem !== null) {
					tweenGemPos(tempShiftedGem, selectedGem.posX,
							selectedGem.posY).onComplete.add(releaseGem, this);
					swapGemPosition(selectedGem, tempShiftedGem);
					tween._lastChild.onCompete.add(releaseGem, this);
				}

				// when the player moves the selected gem, we need to swap the
				// position of the selected gem with the gem currently in that
				// position
				tempShiftedGem = getGem(cursorGemPosX, cursorGemPosY);

				if (tempShiftedGem === selectedGem) {
					tempShiftedGem = null;
				} else {
					tweenGemPos(tempShiftedGem, selectedGem.posX,
							selectedGem.posY).onComplete.add(releaseGem, this);
					swapGemPosition(selectedGem, tempShiftedGem);
				}
			}
		}
	}
}

function initUI() {
	scoreText = this.game.add.text(240, 62, '0', {
		fontSize : '45px',
		fill : '#fff'
	});
	scoreText.anchor.set(0.5);
	remainTimeText = this.game.add.text(230, 705, GAME_LIMIT_TIME.toFixed(2), {
		fontSize : '20px',
		fill : '#fff'
	});
	remainTimeText.anchor.set(0.5);
}

// fill the screen with as many gems as possible
function spawnBoard() {

	BOARD_COLS = BOARD_ROWS = 7;

	gems = this.game.add.group();

	for (var i = 0; i < BOARD_COLS; i++) {
		for (var j = 0; j < BOARD_ROWS; j++) {
			var gem = gems.create(getGemCoord(i, true), getGemCoord(j, false),
					"GEMS");
			gem.name = 'gem' + i.toString() + 'x' + j.toString();
			gem.inputEnabled = true;
			gem.events.onInputDown.add(selectGem, this);
			gem.events.onInputUp.add(releaseGem, this);
			randomizeGemColor(gem);
			setGemPos(gem, i, j); // each gem has a position on the board
		}
	}

	if (checkAllMatchedBlocks() > 0) {
		var dropGemDuration = dropGems();

		// delay board refilling until all existing gems have dropped down
		this.game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME,
				refillBoard);

		allowInput = false;

		selectedGem = null;
		tempShiftedGem = null;
	}
}

function checkAllMatchedBlocks() {
	var willKillGems = [];

	gems.forEach(function(currentGem) {
		if (currentGem.alive) {
			countUp = countSameColorGems(currentGem, 0, -1);
			countDown = countSameColorGems(currentGem, 0, 1);
			countLeft = countSameColorGems(currentGem, -1, 0);
			countRight = countSameColorGems(currentGem, 1, 0);

			countHoriz = countLeft + countRight + 1;
			countVert = countUp + countDown + 1;

			if (countVert >= MATCH_MIN) {
				killGemRange(currentGem.posX, currentGem.posY - countUp,
						currentGem.posX, currentGem.posY + countDown);
			}

			if (countHoriz >= MATCH_MIN) {
				killGemRange(currentGem.posX - countLeft, currentGem.posY,
						currentGem.posX + countRight, currentGem.posY);
			}
		}
	});

	var allRemovedBlocks = removeKilledGems();

	return allRemovedBlocks;
}

// select a gem and remember its starting position
function selectGem(gem) {

	if (allowInput) {
		selectedGem = gem;
		selectedGemStartPos.x = gem.posX;
		selectedGemStartPos.y = gem.posY;
	}
}

// find a gem on the board according to its position on the board
function getGem(posX, posY) {

	return gems.iterate("id", calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);

}

// convert world coordinates to board position
function getGemPos(coordinate, isX) {

	return Math.floor((coordinate - (isX ? INGAME_UI_LEFT_OFFSET
			: INGAME_UI_TOP_OFFSET))
			/ GEM_SIZE_SPACED);

}

function getGemCoord(inPos, isX) {
	return (inPos * GEM_SIZE_SPACED)
			+ (isX ? INGAME_UI_LEFT_OFFSET : INGAME_UI_TOP_OFFSET);
}

// set the position on the board for a gem
function setGemPos(gem, posX, posY) {

	gem.posX = posX;
	gem.posY = posY;
	gem.id = calcGemId(posX, posY);
}

// the gem id is used by getGem() to find specific gems in the group
// each position on the board has a unique id
function calcGemId(posX, posY) {

	return posX + posY * BOARD_COLS;

}

// since the gems are a spritesheet, their color is the same as the current
// frame number
function getGemColor(gem) {

	return gem.frame;

}

// set the gem spritesheet to a random frame
function randomizeGemColor(gem) {

	gem.frame = this.game.rnd.integerInRange(0, gem.animations.frameTotal - 1);

}

// gems can only be moved 1 square up/down or left/right
function checkIfGemCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {

	if (toPosX < 0 || toPosX >= BOARD_COLS || toPosY < 0
			|| toPosY >= BOARD_ROWS) {
		return false;
	}

	if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1) {
		return true;
	}

	if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1) {
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

	while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS
			&& getGemColor(getGem(curX, curY)) === getGemColor(startGem)) {
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

	if (selectedGem === null) {
		return;
	}

	if (tempShiftedGem === null) {
		return;
	}

	var canKill = false;

	// process the selected gem

	var countUp = countSameColorGems(selectedGem, 0, -1);
	var countDown = countSameColorGems(selectedGem, 0, 1);
	var countLeft = countSameColorGems(selectedGem, -1, 0);
	var countRight = countSameColorGems(selectedGem, 1, 0);

	var countHoriz = countLeft + countRight + 1;
	var countVert = countUp + countDown + 1;

	if (countVert >= MATCH_MIN) {
		killGemRange(selectedGem.posX, selectedGem.posY - countUp,
				selectedGem.posX, selectedGem.posY + countDown);
		canKill = true;
	}

	if (countHoriz >= MATCH_MIN) {
		killGemRange(selectedGem.posX - countLeft, selectedGem.posY,
				selectedGem.posX + countRight, selectedGem.posY);
		canKill = true;
	}

	// now process the shifted (swapped) gem

	countUp = countSameColorGems(tempShiftedGem, 0, -1);
	countDown = countSameColorGems(tempShiftedGem, 0, 1);
	countLeft = countSameColorGems(tempShiftedGem, -1, 0);
	countRight = countSameColorGems(tempShiftedGem, 1, 0);

	countHoriz = countLeft + countRight + 1;
	countVert = countUp + countDown + 1;

	if (countVert >= MATCH_MIN) {
		killGemRange(tempShiftedGem.posX, tempShiftedGem.posY - countUp,
				tempShiftedGem.posX, tempShiftedGem.posY + countDown);
		canKill = true;
	}

	if (countHoriz >= MATCH_MIN) {
		killGemRange(tempShiftedGem.posX - countLeft, tempShiftedGem.posY,
				tempShiftedGem.posX + countRight, tempShiftedGem.posY);
		canKill = true;
	}

	if (!canKill) // there are no matches so swap the gems back to the
					// original positions
	{
		var gem = selectedGem;

		if (gem.posX !== selectedGemStartPos.x
				|| gem.posY !== selectedGemStartPos.y) {
			if (selectedGemTween !== null) {
				game.tweens.remove(selectedGemTween);
			}

			selectedGemTween = tweenGemPos(gem, selectedGemStartPos.x,
					selectedGemStartPos.y);

			if (tempShiftedGem !== null) {
				tweenGemPos(tempShiftedGem, gem.posX, gem.posY);
			}

			swapGemPosition(gem, tempShiftedGem);

			tempShiftedGem = null;

		}
	}

}

// kill all gems from a starting position to an end position
function killGemRange(fromX, fromY, toX, toY) {

	fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
	fromY = Phaser.Math.clamp(fromY, 0, BOARD_ROWS - 1);
	toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
	toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);

	for (var i = fromX; i <= toX; i++) {
		for (var j = fromY; j <= toY; j++) {
			var gem = getGem(i, j);
			gem.kill();
		}
	}
}

// move gems that have been killed off the board
function removeKilledGems() {

	var removedCount = 0;
	gems.forEach(function(gem) {
		if (!gem.alive) {
			removedCount++;
			setGemPos(gem, -1, -1);
			gameScore = gameScore + SCORE_PER_GEM;
			scoreText.text = gameScore;
		}
	});

	return removedCount;
}

// animated gem movement
function tweenGemPos(gem, newPosX, newPosY, durationMultiplier, inCallback) {

	console.log('Tween ', gem.name, ' from ', gem.posX, ',', gem.posY, ' to ',
			newPosX, ',', newPosY);
	if (durationMultiplier === null
			|| typeof durationMultiplier === 'undefined') {
		durationMultiplier = 1;
	}

	return this.game.add.tween(gem).to({
		x : getGemCoord(newPosX, true),
		y : getGemCoord(newPosY, false)
	}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);

}

// look for gems with empty space beneath them and move them down
function dropGems() {

	var dropRowCountMax = 0;

	for (var i = 0; i < BOARD_COLS; i++) {
		var dropRowCount = 0;

		for (var j = BOARD_ROWS - 1; j >= 0; j--) {
			var gem = getGem(i, j);

			if (gem === null) {
				dropRowCount++;
			} else if (dropRowCount > 0) {
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

	for (var i = 0; i < BOARD_COLS; i++) {
		var gemsMissingFromCol = 0;

		for (var j = BOARD_ROWS - 1; j >= 0; j--) {
			var gem = getGem(i, j);

			if (gem === null) {
				gemsMissingFromCol++;
				gem = gems.getFirstDead();
				gem.reset(getGemCoord(i, true), getGemCoord(
						-gemsMissingFromCol, false));
				randomizeGemColor(gem);
				setGemPos(gem, i, j);
				tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
			}
		}

		maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol,
				gemsMissingFromCol);
	}

	this.game.time.events.add(maxGemsMissingFromCol * 2 * 100, boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {
	if (checkAllMatchedBlocks() > 0) {
		var dropGemDuration = dropGems();

		// delay board refilling until all existing gems have dropped down
		this.game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME,
				refillBoard);

		allowInput = false;

		selectedGem = null;
		tempShiftedGem = null;
	} else {
		allowInput = true;
	}
}
