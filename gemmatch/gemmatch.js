// Example by https://twitter.com/awapblog

var GAME_WIDTH = 526;
var GAME_HEIGHT = 640;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var UI_OFFSET = 32;
var GEM_SIZE = 64;
var GEM_SPACING = 2;
var GEM_SIZE_SPACED = GEM_SIZE + GEM_SPACING;
var BOARD_COLS;
var BOARD_ROWS;
var MATCH_MIN = 3; // min number of same color gems required in a row to be considered a match
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

function preload() {

    game.load.spritesheet("GEMS", "assets/sprites/diamonds32x5.png", GEM_SIZE, GEM_SIZE);
    game.load.image('btnFullscreen', 'assets/btn_fullscreen.png');
    game.load.image('btnPause', 'assets/btn_pause.png');
    game.load.image('btnResume', 'assets/btn_resume.png');

    game.add.plugin(Phaser.Plugin.Debug);
}

function create() {

    game.time.advancedTiming = true;

    initUI();
    // fill the screen with as many gems as possible
    spawnBoard();

    // currently selected gem starting position. used to stop player form moving gems too far.
    selectedGemStartPos = { x: 0, y: 0 };
    
    // used to disable input while gems are dropping down and respawning
    allowInput = true;

    game.input.addMoveCallback(slideGem, this);

    gameScore = 0;

    startTimestamp = (new Date()).getTime();
}

function render()
{
    //game.debug.text(game.time.fps, 2, 14, "#00ff00");
}

function update()
{
    if (isPause == true) 
    {
        return;
    }
    var currentTimestamp = (new Date()).getTime();
    remainSecond = GAME_LIMIT_TIME - ((currentTimestamp - startTimestamp) / 1000);
    
    if (remainSecond <= 0) 
    {
        allowInput = false;
        remainTimeText.text = 'reaminTime: ' + 0.00;

    } else 
    {
        remainTimeText.text = 'reaminTime: ' + remainSecond.toFixed(2);    
    }
}

function pauseGame()
{
    pauseTimestamp = (new Date()).getTime();
    allowInput = false;
    isPause = true;
    
    imgBtnPause.visible = false;
    imgBtnResume.visible = true;
}

function resumeGame()
{
    var currentTimestamp = (new Date()).getTime();
    var offsetTimestampFromPause = currentTimestamp - pauseTimestamp;
    startTimestamp += offsetTimestampFromPause;

    console.log("[resumeGame] remainSecond(" + remainSecond.toFixed(2) + "), currentTimestamp(" + currentTimestamp + ")");

    isPause = false;
    allowInput = true;

    imgBtnPause.visible = true;
    imgBtnResume.visible = false;
}

function gofull(pointer)
{
    if ((pointer.x < 0 || pointer.x > 50) && (pointer.y < 530 || pointer.y > 580)) 
    {
        return;
    }
    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen(true);
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
    game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME, refillBoard);

    allowInput = false;

    selectedGem = null;
    tempShiftedGem = null;

}

function slideGem(pointer, x, y) {

    // check if a selected gem should be moved and do it

    if (selectedGem && pointer.isDown)
    {
        var cursorGemPosX = getGemPos(x);
        var cursorGemPosY = getGemPos(y);

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

                // if we moved a gem to make way for the selected gem earlier, move it back into its starting position
                if (tempShiftedGem !== null)
                {
                    tweenGemPos(tempShiftedGem, selectedGem.posX , selectedGem.posY).onComplete.add(releaseGem, this);
                    swapGemPosition(selectedGem, tempShiftedGem);
                    tween._lastChild.onCompete.add(releaseGem, this);
                }

                // when the player moves the selected gem, we need to swap the position of the selected gem with the gem currently in that position 
                tempShiftedGem = getGem(cursorGemPosX, cursorGemPosY);

                if (tempShiftedGem === selectedGem)
                {
                    tempShiftedGem = null;
                }
                else
                {
                    tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY).onComplete.add(releaseGem, this);
                    swapGemPosition(selectedGem, tempShiftedGem);
                }
            }
        }
    }
}

function initUI()
{
    var imgBtnFullscreen = game.add.sprite(GAME_WIDTH - 64, 64 * 9, 'btnFullscreen');
    imgBtnFullscreen.anchor.set(0.5);
    imgBtnFullscreen.inputEnabled = true;
    imgBtnFullscreen.events.onInputDown.add(gofull, this);

    imgBtnPause = game.add.sprite(GAME_WIDTH - 64 * 2.5, 64 * 9, 'btnPause');
    imgBtnPause.anchor.set(0.5);
    imgBtnPause.inputEnabled = true;
    imgBtnPause.events.onInputDown.add(pauseGame, this);
    imgBtnPause.visible = true;

    imgBtnResume = game.add.sprite(GAME_WIDTH - 64 * 2.5, 64 * 9, 'btnResume');
    imgBtnResume.anchor.set(0.5);
    imgBtnResume.inputEnabled = true;
    imgBtnResume.events.onInputDown.add(resumeGame, this);
    imgBtnResume.visible = false;


    scoreText = game.add.text(16, GAME_HEIGHT - 64, 'score: 0', {fontSize: '32px', fill: '#fff'});
    remainTimeText = game.add.text(16, GAME_HEIGHT - (64 * 1.5), 'reaminTime : ' + GAME_LIMIT_TIME.toFixed(2), {fontSize: '32px', fill: '#fff'});
}

// fill the screen with as many gems as possible
function spawnBoard() {

    //BOARD_COLS = Math.floor(game.world.width / GEM_SIZE_SPACED);
    //BOARD_ROWS = Math.floor(game.world.height / GEM_SIZE_SPACED);
    BOARD_COLS = BOARD_ROWS = 8;

    gems = game.add.group();

    for (var i = 0; i < BOARD_COLS; i++)
    {
        for (var j = 0; j < BOARD_ROWS; j++)
        {
            var gem = gems.create(i * GEM_SIZE_SPACED, j * GEM_SIZE_SPACED, "GEMS");
            gem.name = 'gem' + i.toString() + 'x' + j.toString();
            gem.inputEnabled = true;
            gem.events.onInputDown.add(selectGem, this);
            gem.events.onInputUp.add(releaseGem, this);
            randomizeGemColor(gem);
            setGemPos(gem, i, j); // each gem has a position on the board
        }
    }

    if (checkAllMatchedBlocks() > 0)
    {
        var dropGemDuration = dropGems();

        // delay board refilling until all existing gems have dropped down
        game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME, refillBoard);

        allowInput = false;

        selectedGem = null;
        tempShiftedGem = null;
    }
}

function checkAllMatchedBlocks()
{
    var willKillGems = [];

    gems.forEach(function(currentGem)
    {
        if (currentGem.alive)
        {
            countUp = countSameColorGems(currentGem, 0, -1);
            countDown = countSameColorGems(currentGem, 0, 1);
            countLeft = countSameColorGems(currentGem, -1, 0);
            countRight = countSameColorGems(currentGem, 1, 0);

            countHoriz = countLeft + countRight + 1;
            countVert = countUp + countDown + 1;

            if (countVert >= MATCH_MIN)
            {
                killGemRange(currentGem.posX, currentGem.posY - countUp, currentGem.posX, currentGem.posY + countDown);
            }

            if (countHoriz >= MATCH_MIN)
            {
                killGemRange(currentGem.posX - countLeft, currentGem.posY, currentGem.posX + countRight, currentGem.posY);
            }
        }
    });

    var allRemovedBlocks = removeKilledGems();

    return allRemovedBlocks;
}

// select a gem and remember its starting position
function selectGem(gem) {

    if (allowInput)
    {
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
function getGemPos(coordinate) {

    return Math.floor(coordinate / GEM_SIZE_SPACED);

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

// since the gems are a spritesheet, their color is the same as the current frame number
function getGemColor(gem) {

    return gem.frame;

}

// set the gem spritesheet to a random frame
function randomizeGemColor(gem) {

    gem.frame = game.rnd.integerInRange(0, gem.animations.frameTotal - 1);

}

// gems can only be moved 1 square up/down or left/right
function checkIfGemCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {

    if (toPosX < 0 || toPosX >= BOARD_COLS || toPosY < 0 || toPosY >= BOARD_ROWS)
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
// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie to the right of the gem
// stops counting as soon as a gem of a different color or the board end is encountered
function countSameColorGems(startGem, moveX, moveY) {

    var curX = startGem.posX + moveX;
    var curY = startGem.posY + moveY;
    var count = 0;

    while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getGemColor(getGem(curX, curY)) === getGemColor(startGem))
    {
        count++;
        curX += moveX;
        curY += moveY;
    }

    return count;

}

// swap the position of 2 gems when the player drags the selected gem into a new location
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

    if (countVert >= MATCH_MIN)
    {
        killGemRange(selectedGem.posX, selectedGem.posY - countUp, selectedGem.posX, selectedGem.posY + countDown);
        canKill = true;
    }

    if (countHoriz >= MATCH_MIN)
    {
        killGemRange(selectedGem.posX - countLeft, selectedGem.posY, selectedGem.posX + countRight, selectedGem.posY);
        canKill = true;
    }

    // now process the shifted (swapped) gem

    countUp = countSameColorGems(tempShiftedGem, 0, -1);
    countDown = countSameColorGems(tempShiftedGem, 0, 1);
    countLeft = countSameColorGems(tempShiftedGem, -1, 0);
    countRight = countSameColorGems(tempShiftedGem, 1, 0);

    countHoriz = countLeft + countRight + 1;
    countVert = countUp + countDown + 1;

    if (countVert >= MATCH_MIN)
    {
        killGemRange(tempShiftedGem.posX, tempShiftedGem.posY - countUp, tempShiftedGem.posX, tempShiftedGem.posY + countDown);
        canKill = true;
    }

    if (countHoriz >= MATCH_MIN)
    {
        killGemRange(tempShiftedGem.posX - countLeft, tempShiftedGem.posY, tempShiftedGem.posX + countRight, tempShiftedGem.posY);
        canKill = true;
    }

    if (! canKill) // there are no matches so swap the gems back to the original positions
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

}

// kill all gems from a starting position to an end position
function killGemRange(fromX, fromY, toX, toY) {

    fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
    fromY = Phaser.Math.clamp(fromY , 0, BOARD_ROWS - 1);
    toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
    toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);

    for (var i = fromX; i <= toX; i++)
    {
        for (var j = fromY; j <= toY; j++)
        {
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
            setGemPos(gem, -1,-1);
            gameScore = gameScore + SCORE_PER_GEM;
            scoreText.text = 'Score: ' + gameScore;
        }
    });

    return removedCount;
}

// animated gem movement
function tweenGemPos(gem, newPosX, newPosY, durationMultiplier, inCallback) {

    console.log('Tween ',gem.name,' from ',gem.posX, ',', gem.posY, ' to ', newPosX, ',', newPosY);
    if (durationMultiplier === null || typeof durationMultiplier === 'undefined')
    {
        durationMultiplier = 1;
    }

    
    return game.add.tween(gem).to({x: newPosX  * GEM_SIZE_SPACED, y: newPosY * GEM_SIZE_SPACED}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);

}

// look for gems with empty space beneath them and move them down
function dropGems() {

    var dropRowCountMax = 0;

    for (var i = 0; i < BOARD_COLS; i++)
    {
        var dropRowCount = 0;

        for (var j = BOARD_ROWS - 1; j >= 0; j--)
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

// look for any empty spots on the board and spawn new gems in their place that fall down from above
function refillBoard() {

    var maxGemsMissingFromCol = 0;

    for (var i = 0; i < BOARD_COLS; i++)
    {
        var gemsMissingFromCol = 0;

        for (var j = BOARD_ROWS - 1; j >= 0; j--)
        {
            var gem = getGem(i, j);

            if (gem === null)
            {
                gemsMissingFromCol++;
                gem = gems.getFirstDead();
                gem.reset(i * GEM_SIZE_SPACED, -gemsMissingFromCol * GEM_SIZE_SPACED);
                randomizeGemColor(gem);
                setGemPos(gem, i, j);
                tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
            }
        }

        maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
    }

    game.time.events.add(maxGemsMissingFromCol * 2 * 100, boardRefilled);

}

// when the board has finished refilling, re-enable player input
function boardRefilled() {
    if (checkAllMatchedBlocks() > 0)
    {
        var dropGemDuration = dropGems();

        // delay board refilling until all existing gems have dropped down
        game.time.events.add(dropGemDuration * GEM_REFILL_DURATION_TIME, refillBoard);

        allowInput = false;

        selectedGem = null;
        tempShiftedGem = null;
    }
    else 
    {
        allowInput = true;
    }
}
