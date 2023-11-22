class Fase_3 extends Phaser.Scene {


    // função para carregamento de assets
    preload() {
        this.load.spritesheet('player_sp', "assets/spritesheets/player_sp.png", { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('seuze_sp', "assets/spritesheets/seuze_sp.png", { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('esqueletobom', "assets/spritesheets/esqueletobom.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('esqueletobom_', "assets/spritesheets/esqueletobom.png", { frameWidth: 64, frameHeight: 64, margin: 32 });
        this.load.spritesheet('ratoesqueleto_sp', "assets/spritesheets/ratoesqueleto_sp.png", { frameWidth: 64, frameHeight: 64 });

        this.load.image('tiles', "assets/maps/maptiles.png");
        this.load.image('tiles1', "assets/maps/props.png");

        this.load.tilemapTiledJSON("map", "assets/maps/mapa2.json");
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('maptiles', 'tiles');
        this.tileset1 = this.map.addTilesetImage('props', 'tiles1');

        this.wallsLayer = this.map.createDynamicLayer('ground', this.tileset, 0, 0);
        this.wallsLayer1 = this.map.createDynamicLayer('colision', this.tileset, 0, 0);
        this.groundLayer = this.map.createDynamicLayer('walls', this.tileset, 0, 0);
        this.wallsLayer = this.map.createDynamicLayer('props', this.tileset1, 0, 0);
        console.log("create map")
    }

    createActors() {

        // criação jogador
        this.player = new player(this, 280, 620, 'player_sp', 0);
        this.player.setScale(0.4);
        this.player.has_bow = false;    // previne de atirar flechas

        // Cria o seu zé (NPC amigo)
        this.seuze = this.physics.add.sprite(270, 250, 'seuze_sp', 52);
        this.seuze.setScale(0.4);

        // Cria o rato (Inimigo)
        this.rato = this.physics.add.sprite(600, 220, 'ratoesqueleto_sp', 57);
        this.rato.setScale(0.7);

        // criação da colisão com camadas
        this.wallsLayer1.setCollisionBetween(0, 1000, true)
        this.physics.add.collider(this.player, this.wallsLayer1);

        // Cria grupo de esqueletos e inicia 5 itens
        this.esqueletos = this.physics.add.group();
        this.esqueletos.enableBody = true;
        this.esqueletos.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < 5; i++) {
            var esqueleto = this.physics.add.sprite(-10, -10, 'esqueletobom', 31);
            esqueleto.setScale(0.4);
            esqueleto.body.setSize(30, 40);
            esqueleto.setActive(false);
            esqueleto.setVisible(false);
            esqueleto.on(Phaser.Animations.Events.ANIMATION_COMPLETE, remove_esqueleto, this);
            this.esqueletos.add(esqueleto);
        }
        console.log("create Actors")
        console.log(this.rato)
    }

    createAnimations() {

        this.anims.create({
            key: 'esqueleto_walk',
            frames: this.anims.generateFrameNumbers('esqueletobom', { start: 117, end: 125 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'esqueleto_stop',
            frames: this.anims.generateFrameNumbers('esqueletobom', { start: 117, end: 117 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'esqueleto_atk',
            frames: this.anims.generateFrameNumbers('esqueletobom_', { frames: [280, 276, 286, 284, 282, 278] }),//      [324, 326, 328, 330]
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'esqueleto_die',
            frames: this.anims.generateFrameNumbers('esqueletobom', { frames: [40, 41, 42, 43] }),
            frameRate: 3,
            hideOnComplete: true,
            onComplete: remove_esqueleto,
            //onCompleteParams: [this],
            repeat: 0
        });

        console.log("create Animations")

    }


    // função para criação dos elementos
    create() {
        this.createMap();
        this.createActors();
        this.createAnimations();

        //this.esqueletos.play('esqueleto_walk');


        // ligação das teclas de movimento
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyS = this.input.keyboard.addKey('S');
        this.keySPACE = this.input.keyboard.addKey('SPACE');

        this.keyE = this.input.keyboard.addKey('E');

        // definição de zoom da câmera e comando para seguir jogador
        this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.player, true, 0.2, 0.2)

        // criação da zona
        this.zone_dlg = this.add.zone(270, 250).setSize(100, 100);
        this.physics.world.enable(this.zone_dlg);
        this.physics.add.overlap(this.player, this.zone_dlg);

        this.zone_ques = this.add.zone(600, 250).setSize(100, 100);
        this.physics.world.enable(this.zone_ques);
        this.physics.add.overlap(this.player, this.zone_ques);

        this.zone_dlg1 = this.add.zone(300, 450).setSize(100, 0);
        this.physics.world.enable(this.zone_dlg1);
        this.physics.add.overlap(this.player, this.zone_dlg1);

        // Criação da zona do esqueleto
        this.zone_esqueleto = this.add.zone(525, 475).setSize(200, 200);
        this.physics.world.enable(this.zone_esqueleto);


        // criação da mensagem "pressione E para interagir"
        var px = this.cameras.main.width * 0.35;  // pos horizontal
        var py = 2 * this.cameras.main.height / 3;  // pos vertical
        console.log('pp', px, py)
        this.interact_txt = this.add.text(px, py, "Pressione E para interagir", {
            font: "15px Arial",
            fill: "#A0A0A0",
            align: "center",
            stroke: '#000000',
            strokeThickness: 4,
        });
        this.interact_txt.setScrollFactor(0);  // deixa em posição relativa à camera (e não ao mapa)
        this.interact_txt.setVisible(false);   // deixa invisível

        // criação de lista de textos (diálogs) e do objeto dialog
        this.txtLst_0 = ["[SEU ZÉ]: Olá jovem guerreiro, O que faz por aqui, uai?\n", "[GUERREIRO]: Eu preciso atravessar o cemitério para completar minha missão, porém há uma orda de esqueletos e não consigo pensar em como superá-los.", "[SEU ZÉ]: Esses cabeça de esqueleto são osso duro de roer, mas você pode correr pra conversar com o Mr. Stuart Mouse.", "[GUERREIRO]: Obrigado meu caro senhor, que Deus lhe pague."];
        this.txtLst_1 = ["Zé: Você agora tem oque é necessário."];
        this.txtLst_2 = ["CUIDADO: A cidade está sitiada pelo o Rei do camundongos e seus servos os cabeça de caveira!\nCaso esteja perdido procure ajuda!"];


        this.quest_0 = ["\n\n\nOlá humano desprezivel, para passar por mim você precisará acertar uma questão de matemática!\n\n Jogar baralho é uma atividade que estimula o raciocínio. Um jogo tradicional é a Paciência, que utiliza 52 cartas. Inicialmente são formadas sete colunas com as cartas. A primeira coluna tem uma carta, a segunda tem duas cartas,w e assim sucessivamente até a sétima coluna, a qual tem sete cartas, e o que sobra forma o monte, que são as cartas não utilizadas nas colunas.\nA quantidade de cartas que forma o monte é",
            1, "◯ 21 cartas", "◯ 24 cartas", "◯ 26 cartas", "◯ 28 cartas"]



        this.firstDialog = true;
        this.dialogs = new dialogs(this);


        // flag para responder uma única vez à tecla pressionada
        this.spacePressed = false;

        // Cria timer
        this.spawn_timer = this.time.addEvent({ delay: Phaser.Math.Between(1000, 3000), callback: spawn, callbackScope: this });

        //this.esqueletos.play('esqueleto_walk');

    }

    // update é chamada a cada novo quadro
    update() {
        // verifica e trata se jogador em zona ativa
        this.checkActiveZone();


        // verifica se precisa avançar no diálogo
        if (this.dialogs.isActive && !this.spacePressed && this.keySPACE.isDown) {
            this.dialogs.nextDlg();
            this.spacePressed = true;   // seta flag para false para esperar a tecla espaço ser levantada
        }
        // se tecla solta, limpa a flag
        if (!this.keySPACE.isDown) {
            this.spacePressed = false;
        }

        
        
        let i = 0;
        this.esqueletos.getMatching('active', true).forEach(function (esqueleto) {
            setEsqueletoSpeed(esqueleto, this.player, i);
            i+=1;

            var dx = this.player.x - esqueleto.x;
            var dy = this.player.y - esqueleto.y;
            var amp = Math.sqrt(dx * dx + dy * dy);
            if (amp < 20){
                if (esqueleto.anims.currentAnim.key != 'esqueleto_atk')
                    esqueleto.play('esqueleto_atk');
                if (amp < 2) {
                    console.log("Dano");
                    // this.enemyHit();
                }
            }else{
                if (esqueleto.anims.currentAnim.key != 'esqueleto_walk')
                    esqueleto.play('esqueleto_walk');
            }
        
            if (esqueleto.x < this.player.x) {
                esqueleto.flipX = true;
            } else {
                esqueleto.flipX = false;
            }

        }, this);

    }

    enemyHit (){
        this.player.getDamage(3);
        console.log(this.player.getHPValue())
        if (this.player.getHPValue() <= 0){
            localStorage.setItem('hp',100);
            this.player.die();
        }
    }
    // trata zona ativa
    checkActiveZone() {
        // se jogador dentro de zona e o diálogo não está ativo
        if (this.player.body.embedded && !this.dialogs.isActive) {
            // mostra a mensagem e verifica a tecla pressionada
            this.interact_txt.setVisible(true);
            if (this.keyE.isDown) {
                this.startDialogOrQuestion();
            }
        }
        // se diálogo ativo ou fora da zona, esconde a msg
        else {
            this.interact_txt.setVisible(false);
        }
    }
    startDialogOrQuestion() {
        if (this.physics.overlap(this.player, this.zone_dlg)) {
            if (this.firstDialog) {
                this.dialogs.updateDlgBox(this.txtLst_0);
                this.firstDialog = false;
            }
            else {
                this.dialogs.updateDlgBox(this.txtLst_1);
            }
        }

        if (this.physics.overlap(this.player, this.zone_ques)) {
            this.dialogs.scene.dialogs.makeQuestion(this.quest_0, acertou_fcn, errou_fcn);
        }

        if (this.physics.overlap(this.player, this.zone_dlg1)) {
            this.dialogs.updateDlgBox(this.txtLst_2);
        }
    }
}
let coordSpawn = [[505,505], [545,518], [529,474], [564,480], [600,470]];
let indice = 0;
function acertou_fcn(ptr) {
    console.log("acertou");
    this.dialogs.hideBox();
}

function errou_fcn(ptr) {
    console.log("errou")
    this.dialogs.hideBox();
}
/*function spawn(){
    console.log('spawn');
    this.spawn_timer = this.time.addEvent({ delay: Phaser.Math.Between(1000, 3000), callback: spawn, callbackScope: this });
}*/


function spawn() {
    if (Phaser.Geom.Rectangle.Overlaps(this.zone_esqueleto.getBounds(), this.player.getBounds())) {
        console.log('spawn');
        var esqueleto = this.esqueletos.getFirstDead(false);
        if (esqueleto) {

            esqueleto.body.reset(coordSpawn[indice][0], coordSpawn[indice][1]);
            indice += 1;
            esqueleto.setActive(true);
            esqueleto.setVisible(true);
            esqueleto.play('esqueleto_walk');
        }

    }
    this.spawn_timer = this.time.addEvent({ delay: Phaser.Math.Between(1000, 3000), callback: spawn, callbackScope: this });
}

function setEsqueletoSpeed(esqueleto, player, i) {
    //console.log(esqueleto)
    /*
    if (esqueleto.anims.currentAnim.key == 'esqueleto_die' ){
        if (esqueleto.anims.isPlaying == false){
            esqueleto.setActive(false);
        }
        return
    }*/


    if(player.x > 420 && player.y > 370 && player.y < 570 ){
        var dx = player.x - esqueleto.x;
        var dy = player.y - esqueleto.y;
        var amp = Math.sqrt(dx * dx + dy * dy);
        esqueleto.setVelocityX(30 * dx / amp);
        esqueleto.body.setVelocityY(30 * dy / amp);
    }else{
        var dx = coordSpawn[i][0] - esqueleto.x;
        var dy = coordSpawn[i][1] - esqueleto.y;
        var amp = Math.sqrt(dx * dx + dy * dy);
        if( amp < 1){
            esqueleto.setVelocityX(0 * dx / amp);
            esqueleto.body.setVelocityY(0 * dy / amp);
            //esqueleto.anims.stop();  // Interrompe a animação atual
            esqueleto.setTexture('esqueletobom', 117);
        }else{
            esqueleto.setVelocityX(30 * dx / amp);
            esqueleto.body.setVelocityY(30 * dy / amp); 
        }
    }


    
        


}

function playerHit(player, esqueleto) {
    // Lógica para tratar quando o jogador é atingido pelo esqueleto
    // Adapte conforme a lógica do seu jogo, pode incluir redução de vida, efeitos, etc.
    console.log('Player hit!');
}

function remove_esqueleto(par0) {
    console.log('rem', par0);
    console.log(this);
}