
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var isAutoMode = false;
var lastUpdateTime = 0;

function preload() {

    //  Here we load the Starling Texture Atlas and XML file
    game.load.atlasXML('seacreatures', 'assets/sprites/seacreatures.png', 'assets/sprites/seacreatures.xml');
    //  Here is the exact same set of animations but as a JSON file instead
    // game.load.atlas('seacreatures', 'assets/sprites/seacreatures_json.png', 'assets/sprites/seacreatures_json.json');

    //  Just a few images to use in our underwater scene
    game.load.image('undersea', 'assets/pics/undersea.jpg');
    game.load.image('coral', 'assets/pics/seabed.png');

    game.add.plugin(Phaser.Plugin.Debug);

}

function create() {

    game.add.image(0, 0, 'undersea');

    isAutoMode = (drawCount == 0);

    for (var i = 0; i < drawCount; i++)
    {
        createAnimation();        
    }
    
    game.add.image(0, 466, 'coral');

    // to: function ( properties, duration, ease, autoStart, delay, repeat, yoyo ) {
}

function createAnimation()
{
    var greenJellyfish = game.add.sprite(Math.random() * WIDTH, Math.random() * HEIGHT, 'seacreatures');
    greenJellyfish.animations.add('swim', Phaser.Animation.generateFrameNames('greenJellyfish', 0, 39, '', 4), 30, true);
    greenJellyfish.animations.play('swim');
    game.add.tween(greenJellyfish).to({ y: 250 }, 4000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);        
}

function update()
{
    if (isAutoMode == false)
        return;

    if (drawCount >= AUTO_PLAY_STOP_COUNT)
        return;

    if (lastUpdateTime == 0) 
    {
        lastUpdateTime = (new Date()).getTime();
    }

    var currentTime = (new Date()).getTime();
    if ((currentTime - lastUpdateTime) < AUTO_PLAY_TIME_OFFSET)    
        return;

    lastUpdateTime = currentTime;

    drawCount = drawCount + AUTO_PLAY_INCR_ANIM_COUNT;

    for (var i = 0; i < AUTO_PLAY_INCR_ANIM_COUNT; i++)
    {
        createAnimation();
    }
}

function render()
{
    if (isAutoMode == false)
        return;

    game.debug.text(drawCount, 2, 14, "#00ff00");
}
