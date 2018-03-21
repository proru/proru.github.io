;(function(){
    var Game = function(canvasId){
        console.log("Hello game!");
        // берем элемент в котором все рисовать будем
        var canvas = document.getElementById(canvasId)
        var screen = canvas.getContext('2d');
        var gameSize = {
            x: canvas.width,
            y: canvas.height
        };
        this.amount_kill=0;
        this.amount_kill_all=0;
        this.btnNew = document.getElementById('btnNew');
        var btnPause = document.getElementById("btnPause");
        var spanScored = document.getElementById("spanShowScore");
        this.spanScored = spanScored;
        var selectDiff = document.getElementById("selectDiff");
        this.btnNew.onclick =window.onload;
        this.selectDiff = selectDiff;
        
        this.amount_enemies = 10;
       // var image_zone = new Image();
        //image_zone.src = "zone_2.png";
        //screen.fillStyle = image_zone;
        // объдиняем два массива игрока и врагов
        this.bodies = [new Player(this,gameSize)];
        this.enemies = createInvaders(this);
        
        // вложенные функции для обновления игры постоянного
        var self = this;
        loadSound("shoot.wav",function(shootSound){
            self.shootSound = shootSound;
            var tick = function(){
            self.update(gameSize);
            self.draw(screen,gameSize);
            requestAnimationFrame(tick);
            }
            tick();
        });

    }    

    Game.prototype = {
        update: function(gameSize){


            //console.log("update")
            // добавляем постоянно врагов 
            // если их меньше чем должно быть 
            //if(this.enemies.length < this.amount_enemies ){
            //this.enemies =this.enemies.concat( createInvaders(this));
           // }

           
           this.amount_kill = this.amount_enemies*2-this.enemies.length;
           this.spanScored.innerHTML =this.amount_kill_all*2+this.amount_kill;
           if(this.enemies.length==0){
            this.amount_kill_all+=this.amount_enemies;
            this.amount_enemies=this.amount_enemies*2;
            this.enemies = createInvaders(this);
           }
                
            console.log(this.bodies.length);
            var bodies = this.bodies;
            var enemies = this.enemies;

        
            // провяряем врезались они в друг друга или нет
            // проверяет для каждого прогоняет весь массив и если хотя бы один элемент нашелся не 
            // нулевая длина массива удаляем этот элемент 
            var notCollisingWithAnythingEnemies = function(b1){
                return bodies.filter(function(b2){
                    return collising(b1,b2);
                }).length==0;
            }
            // отфилтровываем те только элементы которые не столкнулись не с кем
            this.enemies = this.enemies.filter(notCollisingWithAnythingEnemies);
            var notCollisingWithAnythingBodies = function(b1){
                return enemies.filter(function(b2){
                    return collising(b1,b2);
                }).length==0;
            }
            this.bodies = this.bodies.filter(notCollisingWithAnythingBodies);
            // удаляем каждый элемент который вылетел за пределы
            for(var i =0;i<this.bodies.length; i++){
                if(this.bodies[i].position.y<0 || this.bodies[i].position.x<0 || this.bodies[i].position.x> 1500 || this.bodies[i].position.y>2000 ){
                   // удалить один элемент после i того элемента
                    this.bodies.splice(i,1);
                }
            }
            for(var i =0;i<this.enemies.length; i++){
                if(this.enemies[i].position.y<0 || this.enemies[i].position.x<0 || this.enemies[i].position.x> 1500 || this.enemies[i].position.y>2000 ){
                   // удалить один элемент после i того элемента
                    this.enemies.splice(i,1);
                }
            }
            // обновляем каждый элемент в массиве 
            for(var i =0;i<this.bodies.length; i++){
                this.bodies[i].update();
            }
            // обновляем всех врагов
            for(var i=0;i<this.enemies.length;i++){
                this.enemies[i].update();
            }
            
        },
        // рисуем перед этим очищаем чтобы следов не было 
        // каждый элемент прорисовываем 
        draw: function(screen,gameSize){
            //screen.fillRect(150,150,32,32);
            
            
            clearCanvas(screen,gameSize);
            //drawImage(screen,screen.game,image_zone);
            var image_hero = new Image();
            image_hero.src= "Hero.png";
            drawImage(screen,this.bodies[0],image_hero);
            for(var i =1;i<this.bodies.length; i++){
                drawRect(screen,this.bodies[i],"rgba(41, 73, 255,1)");
            }
            var image_enemy = new Image();
            image_enemy.src = "enemy_2.png";
            
            for(var i =0;i<this.enemies.length; i++){
                //drawRect(screen,this.enemies[i],"rgba(116, 117, 117, 0.5)")
                drawImage(screen,this.enemies[i],image_enemy);
            }
        },
        // добавляем элементы пули
        // в конец массива 
        addBody: function(body){
            this.bodies.push(body);
        },
        // добавляем в конец врага 
        addEnemy: function(enemy){
            this.enemies.push(enemy);
        }
        //invadersBelow: function(invader){
        //    return this.bodies.filter(function(b){
        //        return b instanceof Invader && 
        //        b.position.y > invader.position.y &&
        //        b.position.x - invader.position.x < invader.size.width;
        //    }).length == 0;
        //},
    }
    //враги класс больше размер, специальные патроль чтобы они 
    // плавали туда сюда как целое
    var Invader = function(game,position){
        this.game =game;
        this.size ={width:30,height:30};
        this.position = position;
        this.patrolx=0;
        this.speedx=Math.random()+0.1;  
        this.speedy=this.speedx;
    }
    Invader.prototype = {
        // когда заходят за рамки чтобы меняли направление на противоположное
        update: function(){
            //if(this.patrolx < 0 || this.patrolx > 450){
            //    this.speedx = -this.speedx;
            // }
            //console.log(this.patrolx);
            //console.log(this.position.x);
            // движение каждый раз увеличиваем координату на скорость
            var distantion_x = this.game.bodies[0].position.x - this.position.x;
            var distantion_y = this.game.bodies[0].position.y - this.position.y;
            if(distantion_x<0){ 
                this.position.x-=  this.speedx*2*Math.random();
            } else{
                this.position.x+=  this.speedx*2*Math.random();
            }

            if(distantion_y<0){ 
                this.position.y-=  this.speedx*2*Math.random();
            } else{
                this.position.y+=  this.speedx*2*Math.random();
            }
            
            //this.position.y += this.speedy;
            //this.patrolx+=this.speedx;
           // if(Math.random() <0.02 && this.game.invadersBelow(this)){
            //    var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y +this.size.height/2}
            //      ,{x:Math.random()-0.5,y:4});
            //   this.game.addBody(bullet);
           // }
        }
    }

    var Player = function(game , gameSize) {
        this.game = game;
        // счетчики для пуль по времени и по количеству
        this.bullets =0;
        this.timer =0;
        this.size = {width:30,height:30};
        // появляемся по середине
        this.position = {x:gameSize.x/2 -this.size.width/2, y: gameSize.y/2- this.size.height/2};
        this.keyboarder = new Keyboarder();
    }
    Player.prototype = {
        // обрабатываем клавиатуру
        update: function(){
            if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
                this.position.x -=3;
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
                this.position.x +=3;
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.UP)){
                this.position.y -=3;
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)){
                this.position.y +=3;
            }
            // выпускаем по пять пуль
            if(this.keyboarder.isDown(this.keyboarder.KEYS.UP_FIRE)){
                if(this.bullets<5) {
                    var bullet = new Bullet({x:this.position.x +this.size.width/2-3/2,y:this.position.y-this.size.height/2},{x:0,y:-20});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }  
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.DOWN_FIRE)){
                if(this.bullets<5) {
                    var bullet = new Bullet({x:this.position.x +this.size.width/2,y:this.position.y+this.size.height},{x:0,y:20});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }  
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT_FIRE)){
                if(this.bullets<5) {
                    var bullet = new Bullet({x:this.position.x ,y:this.position.y+this.size.height/2},{x:-20,y:0});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }  
            }
            if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT_FIRE)){
                if(this.bullets<5) {
                    var bullet = new Bullet({x:this.position.x +this.size.width,y:this.position.y+this.size.height/2},{x:20,y:0});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }  
            }
            this.timer++;
            // ограничение по числу заходов сюда 12
            if(this.timer%12==0){
                this.bullets =0;
            }
        }
    }
    // характеристики пуль
    var Bullet = function(position , velocity) {
        this.size = {width:2,height:2};
        this.position = position;
        this.velocity = velocity;
    }
    Bullet.prototype = {
        update: function(){
          //this.position.x += this.velocity.x;
          this.position.y += this.velocity.y
          this.position.x+=this.velocity.x
        }
    }
    //функция обработки клавиатуры
    var Keyboarder = function(){
        var keyState = {};

        window.onkeydown = function(e){
            keyState[e.keyCode] = true;
        }
        window.onkeyup = function(e){
            keyState[e.keyCode] = false;
        }
        this.isDown = function(keyCode){
            return keyState[keyCode]==true;
        }
        // словарь клавиш по номерам чтобы точно знать что 
        // мы нажимаем и регагировать соответственно
        this.KEYS = {LEFT:37, RIGHT:39, SPACE:32, UP:38, DOWN:40, UP_FIRE:87, DOWN_FIRE:83,LEFT_FIRE:65,RIGHT_FIRE:68};
    }
    // создаем сразу много врагов с помощью 
    // цикла и функции инициализации
    var createInvaders = function(game){
        var invaders = [];
        amount_enemies=game.amount_enemies;
        for(var i =0;i<amount_enemies;i++){
            var x =800*Math.random();
            var y =600;
            // добавляем в массив нового врага
            invaders.push(new Invader(game,{x:x,y:y}));
            var x =800*Math.random();
            var y =50*Math.random();
            invaders.push(new Invader(game,{x:x,y:y}));
        }
        return invaders;
    }
    // механика соударений условие кто на кого должен залезть 
    // чтобы считалось соударением
    var collising = function(b1,b2){
        return !(
           // !(b1 instanceof Player && b2 instanceof Invader || b2 instanceof Player && b1 instanceof Invader) &&  (b1==b2 ||
          //  b1.position.x+b1.size.width/2<b2.position.x-b2.size.width/2  ||
          //  b1.position.y+b1.size.height/2<b2.position.y-b2.size.height/2||
          //  b1.position.x-b1.size.width/2>b2.position.x+b2.size.width/2 ||
          //  b1.position.y-b1.size.height/2>b2.position.y+b2.size.height/2 ) 
          //  !(b1 instanceof Bullet && b2 instanceof Invader || b2 instanceof Bullet && b1 instanceof Invader) &&  
          //(b1==b2 ||
               ( b1.position.x+b1.size.width/2<b2.position.x-b2.size.width/2  ||
                b1.position.y+b1.size.height/2<b2.position.y-b2.size.height/2||
                b1.position.x-b1.size.width/2>b2.position.x+b2.size.width/2 ||
                b1.position.y-b1.size.height/2>b2.position.y+b2.size.height/2 )
            );
    }
    var loadSound = function(url, callback){
        var loaded = function(){
            callback(sound);
            sound.removeEventListener("canplaythrough",loaded);
        }
        var sound = new Audio(url);
        sound.addEventListener("canplaythrough",loaded);
        sound.load();
    }
    // отрисовать тело
    var drawRect = function(screen, body,color){
        screen.fillStyle = color;
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
    } 
    var drawImage = function(screen, body,image){
        screen.drawImage(image,body.position.x, body.position.y, body.size.width, body.size.height);
        //drawImage(image, x, y, width, height)
    }
    var clearCanvas = function(screen,gameSize){
        screen.clearRect(0,0,gameSize.x,gameSize.y); 
       // screen.drawImage(image,0,0,gameSize.x,gameSize.y);
        //screen.fillStyle()
    }
   
    window.onload = function(){
        new Game("screen");
    }
})();