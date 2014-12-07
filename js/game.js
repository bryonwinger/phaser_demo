
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

// Global vars
var platforms;
var baddies;
var score;
var scoreText;
var lives;
var livesText;
var eventText;
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

    // Used for debugging output
    debugText = game.add.text(16, 50, '', {fontSize: '8px', fill: '#000'});

    // Event notifications - Game Over, Level, etc
    eventText = game.add.text(40, 150, '');

    scoreText = game.add.text(16, 50, '');
    // TODO: Replace this with fun icons
    livesText = game.add.text(690, 50, '');
    // Game timer
    timeText = game.add.text(400, 55, '', {fontSize: '8px', fill: '#000'});
    timeText.anchor.set(0.5);

    // Movement
    cursors = game.input.keyboard.createCursorKeys();

    newGame();
}

function newGame() {
    debugText.text = '';
    eventText.text = '';

    // Reset the leaderboard
    score = 0;
    lives = 3;
    scoreText.text = 'score: ' + score;
    livesText.text ='lives: ' + lives;
    game.time.reset();

    // Create ... all the things!
    createPlatforms();
    createPlayer();
    createBaddies();
    createStars();

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

function createBaddies() {
    baddies = game.add.group();
    // baddies.enableBody = true;
    var max = 3;
    for (var i = 0; i < max; i++)
    {
        // Evenly spaced out
        var x_pos = (game.world.width / (max + 1)) * (i + 1);
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
    // Collisions
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(baddies, platforms);
    game.physics.arcade.collide(baddies, baddies);

    // Overlapping sprites
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, baddies, playerBaddieCollision, null, this);

    // Frame updates
    updateTime();
    updatePlayer(player);
    updateBaddies(player);
    updateLeaderBoard();
}

function updateTime() {
    timeText.text = Math.round(game.time.totalElapsedSeconds());
}

function updateLeaderBoard() {
    scoreText.text = 'score: ' + score;
    livesText.text = 'lives: ' + lives;
}

function gameOver() {
    // Remove all the things
    stars.destroy();
    baddies.destroy();

    newGame();
}

// Aquire the star
function collectStar(player, star) {
    star.kill();
    score += 10;
}

// Determine if the player is stomping on the baddies head
function isCrushingBaddie(player, baddie) {
    // debugText.text = 'player.y: ' + player.y + 'baddie.y: ' + baddie.y;
    // if ((player.body.bottom >= baddie.body.y) && (player.body.blocked.down))
    return false;
}

function playerBaddieCollision(player, baddie) {
    if (isCrushingBaddie(player, baddie))
    {
        baddie.kill();
        score += 50;
    }
    else
    {
        player.kill();
        lives -= 1;

        if (lives < 0)
        {
            gameOver();
        }
        else
        {
            createPlayer();        }
    }
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

// Calculate the distance between two objects with .x and .y
function calcDistance(thing_one, thing_two) {
    dist = Phaser.Math.distanceRounded(
        thing_one.x, thing_one.y, thing_two.x, thing_two.y
    );
    return dist;
}

function updateBaddies(player) {
    baddie_speed = 100;
    sight_distance = 200;

    for (var i = 0; i < baddies.length; i++)
    {
        var baddie = baddies.getAt(i);

        var baddie_sees_player = sight_distance > calcDistance(player, baddie);

        // Chase the player if close enough
        if (baddie_sees_player)
        {
            if (baddie.body.x > player.body.x)
            {
                // Follow to left
                baddie.body.velocity.x = -baddie_speed;
                baddie.animations.play('left');
            }
            else if (baddie.body.x < player.body.x)
            {
                // Follow to right
                baddie.body.velocity.x = baddie_speed;
                baddie.animations.play('right');
            }
        }
        else
        {
            // Stop following
            baddie.body.velocity.x = 0;
            baddie.animations.stop();
            // TODO: Face last direction
            baddie.frame = 1;
        }
    }

}