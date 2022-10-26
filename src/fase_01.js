// cada cena do jogo é uma classe que extende a classe base Phaser.Scene
class Phase_01 extends Phaser.Scene
{
    // O construtor registra o nome da cena
    constructor ()
    {
        super('Phase_01'); 
    }

    // esta função é usada para receber dados, no caso o status da parede
    init(data)
    {
        this.movingWall_sts = 0;
        if ('movingWall_sts' in data){
            this.movingWall_sts = data.movingWall_sts;
        }
    }

    // função para carregamento de assets
    preload ()
    {
        // carregando spritesheets
        this.load.spritesheet('player_sp', 'assets/spritesheets/dante_1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('wizardIdle_sp', 'assets/spritesheets/wizard_idle.png', { frameWidth: 80, frameHeight: 80});
        this.load.spritesheet('tiles_sp', 'assets/images/dungeon-16-16.png', { frameWidth: 16, frameHeight: 16});
        
        // carregando mapa (json) e gráficos do mapa
        this.load.image('tiles', 'assets/images/dungeon-16-16.png');
        this.load.tilemapTiledJSON('themap', 'assets/maps/map_phase_01.json');
    }

    create_map(){
        // criação do mapa e ligação com a imagem (tilesheet)
        this.map = this.make.tilemap({ key: 'themap', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('dungeon_ts', 'tiles');

        // criação das camadas
        this.groundLayer = this.map.createLayer('ground', this.tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', this.tileset, 0, 0);
        if (this.movingWall_sts != 1)
            this.movingWall = this.map.createLayer('movingWall', this.tileset, 0, 0);        
    }

    create_actors()
    {
        // criação das armadilhas
        this.traps  = this.physics.add.group();
        for (let i=36; i<=43; i++){
            this.traps.add(this.add.sprite(36*16+8, i*16+8, 'tiles_sp', 353))
        }

        // criação do jogador
        this.player = this.physics.add.sprite(250, 75, 'player_sp', 0)
        this.player.setScale(0.6)

        // criação dos inimigos
        this.enemy_0  = this.physics.add.sprite(38*16, 1*16, 'tiles_sp', 638)
        this.enemy_1  = this.physics.add.sprite(44*16, 1*16, 'tiles_sp', 638)
        this.enemy_2  = this.physics.add.sprite(50*16, 1*16, 'tiles_sp', 638)
        this.enemy_3  = this.physics.add.sprite(64*16, 20*16, 'tiles_sp', 503)
        this.enemy_0.setScale(2);this.enemy_1.setScale(2);this.enemy_2.setScale(2);this.enemy_3.setScale(2);

        this.mage  = this.physics.add.sprite(78, 128, 'wizardIdle_sp', 0);
        this.mage.setScale(0.9)

        // camera seguindo o jogador
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5)   

        this.stairs = this.physics.add.sprite(98*16, 58*16, 'tiles_sp', 357);
        this.stairs.setScale(2);

    }

    create_animations()
    {
        // animações (caminhando)        
        this.anims.create({
            key: 'pl_wlk_dwn',
            frames: this.anims.generateFrameNumbers('player_sp', {frames: [0, 4, 8, 12]}),
            frameRate: 8,
            repeat: -1
            });
        this.anims.create({
            key: 'pl_wlk_lef',
            frames: this.anims.generateFrameNumbers('player_sp', {frames: [1, 5, 9, 13]}),
            frameRate: 8,
            repeat: -1
            });
        this.anims.create({
            key: 'pl_wlk_up',
            frames: this.anims.generateFrameNumbers('player_sp', {frames: [2, 6, 10, 14]}),
            frameRate: 8,
            repeat: -1
            });
        this.anims.create({
            key: 'pl_wlk_rig',
            frames: this.anims.generateFrameNumbers('player_sp', {frames: [3, 7, 11, 15]}),
            frameRate: 8,
            repeat: -1
            });

        this.anims.create({
            key: 'mage_idle',
            frames: this.anims.generateFrameNumbers('wizardIdle_sp', {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8,9, 8, 7, 6, 5, 4, 3, 2, 1]}),
            frameRate: 6,
            repeat: -1
            });

        this.anims.create({
            key: 'trap_anim',
            frames: this.anims.generateFrameNumbers('tiles_sp', {frames: [353,354,355,356,356]}),
            frameRate: 6,
            repeat: -1,
            repeatDelay: 2000,
            yoyo: true
            });

    }

    create_collisions()
    {

        // criação da colisão com paredes
        this.wallsLayer.setCollisionBetween(30, 40, true)
        this.physics.add.collider(this.player, this.wallsLayer);
        if (this.movingWall_sts != 1){
            this.movingWall.setCollisionByExclusion([-1])
            this.physics.add.collider(this.player, this.movingWall);
        }

        if (this.movingWall_sts != 1){
            this.door_3 = this.physics.add.sprite(23*16, 3*16, 'tiles_sp', 65);
            this.physics.add.overlap(this.player, this.door_3, this.trataPorta, null, this);
        }

        // colisão com os inimigos
        this.physics.add.overlap(this.player, this.enemy_0, this.enemyHit, null, this);
        this.physics.add.overlap(this.player, this.enemy_1, this.enemyHit, null, this);
        this.physics.add.overlap(this.player, this.enemy_2, this.enemyHit, null, this);
        this.physics.add.overlap(this.player, this.enemy_3, this.enemyHit, null, this);
        
        // colisão com armadilhas
        this.physics.add.overlap(this.player, this.traps, this.trapHit, null, this);
        
    }

    create_tweens()
    {
        // movimento sobe e desce dos inimigos
          this.tweens.add({
            targets: [this.enemy_0, this.enemy_1, , this.enemy_2],
            y: 9*16,
            duration: 600,
            ease: 'Sine.easeInOut',
            offset:2000,
            //easeParams: [ 3.5 ],
            delay: 1000, 
            repeat:-1,
            yoyo:true,
        });

        var t0 = this.add.text(15, 180, "Você nunca verá as fadinhas", {
            font: "15px Arial",
            fill: "#F0A020",
            align: "center"
        });        
        var t1 = this.add.text(160, 100, "Vai se lascar!", {
            font: "25px Arial",
            fill: "#20C020",
            align: "center"
        });
        t0.alpha = 0
        t1.alpha = 0

        this.timeline = this.tweens.createTimeline();
        this.timeline.add({
            targets: t0,
            alpha: 1,
            ease: 'linear',
            duration: 1000, 
            yoyo: true,
            hold: 3000
        });

        this.timeline.add({
            targets: t1,
            alpha: 1,
            ease: 'linear',
            duration: 1000,
            yoyo: true,
            hold: 3000
        });
        this.timeline.add({
            targets: this.mage,
            alpha: 0,
            ease: 'linear',
            duration: 1000,
        });
        //this.timeline.play();
        console.log('tline');

    }

    // função para criação dos elementos
    create ()
    {
        console.log("create sc 1")

        this.create_map();

        this.create_actors();

        this.create_collisions();

        this.create_animations();

        this.create_tweens();

        // ligação das teclas de movimento
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyS = this.input.keyboard.addKey('S');
        this.keySPACE = this.input.keyboard.addKey('SPACE');


        // estado do jogador
        this.cur_wlk = 0
        if (this.movingWall_sts == 0)
        {
            this.timeline.play();
            this.mage.play('mage_idle')
        }
        else{
            this.mage.alpha = 0;
        }
        this.traps.playAnimation('trap_anim')
    }


    // update é chamada a cada novo quadro
    update ()
    {
        // testa se tecla pressionada e seta a velocidade do jogador 
        if (this.keyD?.isDown) {
            this.player.setVelocityX(210);
            if (this.cur_wlk != 1 && this.player.body.velocity.y == 0){
                this.cur_wlk = 1;
                this.player.play("pl_wlk_rig");
            }
        }
        else if (this.keyA?.isDown) {
            this.player.setVelocityX(-210);
            if (this.cur_wlk != 2 && this.player.body.velocity.y == 0){
                this.cur_wlk = 2;
                this.player.play("pl_wlk_lef");
            }
        }
        else{
            this.player.setVelocityX(0); 
            if (this.cur_wlk != 0 && this.player.body.velocity.y == 0){
                this.cur_wlk = 0;
                this.player.anims.stop();
            }
        }

        // velocidade vertical
        if (this.keyW.isDown) {
            this.player.setVelocityY(-210);
            if (this.cur_wlk != 3){
                this.cur_wlk = 3;
                this.player.play("pl_wlk_up");
            }
        }
        else if (this.keyS.isDown) {
            this.player.setVelocityY(210);
            if (this.cur_wlk != 4){
                this.cur_wlk = 4;
                this.player.play("pl_wlk_dwn");
            }
        }
        else{
            this.player.setVelocityY(0); 
        }

        /*
        if (Phaser.Input.Keyboard.JustDown(this.keyD))
        {
            console.log('jd')
            this.player.play("pl_wlk_rig");
        }*/


        // Movimento do inimigo
        var dx = this.player.x-this.enemy_3.x;
        var dy = this.player.y-this.enemy_3.y;
        if (dx*dx + dy*dy < 150*150){
            this.enemy_3.setVelocityX(dx);
            this.enemy_3.setVelocityY(dy);
        }
        else{
            this.enemy_3.setVelocityX(0);
            this.enemy_3.setVelocityY(0);

        }
        
    }

    trataPorta (porta, player){
        console.log("porta");
        this.scene.start('brick_push_scene');
    }

    enemyHit (player, enemy){
        //player.disableBody(true, false);
        console.log("enemy hit");
    }

    trapHit(player, trap){
        if (trap.anims.getProgress() > 0.1)
        {
            console.log("trap hit");
        }
        
    }
}
