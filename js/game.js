
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

// Global vars
var platforms;
var baddies;
var score;
var scoreText;
var debugText;

// Preload images and other assets
function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
}

// Initialize a new game
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0,0,'sky');

    // Movement
    cursors = game.input.keyboard.createCursorKeys();

    // Used for debug output
    debugText = game.add.text(16, 40, '', {fontSize: '8px', fill: '#000'});

    // Create ... all the things!
    createPlatforms();
    createPlayer();
    createBaddies();
    createStars();
    createScore();
}

function createPlayer() {
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function createPlatforms() {
    platforms = game.add.group();
    platforms.enableBody = true;

    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2,2);
    ground.body.immovable = true;

    var ledge1 = platforms.create(400, 400, 'ground');
    ledge1.body.immovable = true;

    ledge2 = platforms.create(-150, 250, 'ground');
    ledge2.body.immovable = true;
}

// Scoreboard
function createScore() {
    score = 0;
    scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'}); 
}

function createBaddies() {
    baddies = game.add.group();
    // baddies.enableBody = true;
    var max = 3;
    for (var i = 0; i < max; i++)
    {
        // debugText.text = 'create baddie #' + i;
        debugText.text = 'width: ' + game.world.width;

        // Evenly spaced out
        var x_pos = (game.world.width / (max + 1)) * i;
        var baddie = baddies.create(x_pos, 100, 'baddie');
        game.physics.arcade.enable(baddie);
        baddie.body.bounce.y = 0.2;
        baddie.body.gravity.y = 300;
        baddie.body.collideWorldBounds = true;
        baddie.animations.add('left', [0,1], 10, true);
        baddie.animations.add('right', [2,3], 10, true);
    }
}

// Vanilla collectables
function createStars() {
    stars = game.add.group();
    stars.enableBody = true;
    for (var i = 0; i < 12; i++)
    {
        var star = stars.create(i * 70, 0, 'star');
        star.body.gravity.y = 80;
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}

function update() {
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.collide(baddies, platforms);

    updatePlayer(player);
    updateBaddies(player);
}

// Aquire the star
function collectStar(player, star) {
    star.kill();
    score += 10;
    scoreText.text = 'score: ' + score;
}

function updatePlayer(player) {
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;
        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 150;
        player.animations.play('right');
    }
    else
    {
        player.animations.stop();
        player.frame = 4;
    }
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

    // Allow slowing vertical velocity if button is not held down
    // else if (cursors.up.isUp && !player.body.touching.down)
    // {
    //     player.body.velocity.y = 0;
    // }
}

function updateBaddies(player) {
    for (var i = 0; i < baddies.length; i++)
    {
        var baddie = baddies.getAt(i);
        if (baddie.body.x > player.body.x + 5)
        { 
            // Follow to left
            baddie.body.velocity.x = -125;
            baddie.animations.play('left');

        }
        else if (baddie.body.x < player.body.x - 5)
        {
            // Follow to right
            baddie.body.velocity.x = 125;
            baddie.animations.play('right');
        }
        else
        {
            // Stop following 
            baddie.body.velocity.x = 0;
        }
    }

}