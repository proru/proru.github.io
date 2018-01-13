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
        // объдиняем два массива игрока и врагов
        this.bodies = createInvaders(this).concat([new Player(this,gameSize)]);

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
            console.log(this.bodies.length);
            var bodies = this.bodies;

            var notCollisingWithAnything = function(b1){
                return bodies.filter(function(b2){
                    return collising(b1,b2);
                }).length==0;
            }
            // отфилтровываем те только элементы которые не столкнулись не с кем
            this.bodies = this.bodies.filter(notCollisingWithAnything);
            // удаляем каждый элемент который вылетел за пределы
            for(var i =0;i<this.bodies.length; i++){
                if(this.bodies[i].position.y<0){
                    this.bodies.splice(i,1);
                }
            }
            // обновляем каждый элемент в массиве 
            for(var i =0;i<this.bodies.length; i++){
                this.bodies[i].update();
            }
        },
        // рисуем перед этим очищаем чтобы следов не было 
        // каждый элемент прорисовываем 
        draw: function(screen,gameSize){
            //screen.fillRect(150,150,32,32);
            clearCanvas(screen,gameSize);
            for(var i =0;i<this.bodies.length; i++){
                drawRect(screen,this.bodies[i])
            }
        },
        // добавляем элементы пули
        addBody: function(body){
            this.bodies.push(body);
        },
        invadersBelow: function(invader){
            return this.bodies.filter(function(b){
                return b instanceof Invader && 
                b.position.y > invader.position.y &&
                b.position.x - invader.position.x < invader.size.width;
            }).length == 0;
        },
    }
    //враги класс больше размер, специальные патроль чтобы они 
    // плавали туда сюда как целое
    var Invader = function(game,position){
        this.game =game;
        this.size ={width:10,height:10};
        this.position = position;
        this.patrolx=0;
        this.speedx=4;  
    }
    Invader.prototype = {
        // когда заходят за рамки чтобы меняли направление на противоположное
        update: function(){
            if(this.patrolx < 0 || this.patrolx > 450){
                this.speedx = -this.speedx;
            }
            console.log(this.patrolx);
            console.log(this.position.x);
            // движение каждый раз увеличиваем координату на скорость
            this.position.x+=this.speedx;
            this.patrolx+=this.speedx;
            if(Math.random() <0.02 && this.game.invadersBelow(this)){
                var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y +this.size.height/2}
                    ,{x:Math.random()-0.5,y:2});
                this.game.addBody(bullet);
            }
        }
    }

    var Player = function(game , gameSize) {
        this.game = game;
        // счетчики для пуль по времени и по количеству
        this.bullets =0;
        this.timer =0;
        this.size = {width:16,height:16};
        // появляемся по середине
        this.position = {x:gameSize.x/2 -this.size.width/2, y: gameSize.y- this.size.height};
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
            if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
                if(this.bullets<2) {
                    var bullet = new Bullet({x:this.position.x +this.size.width/2-3/2,y:this.position.y-this.size.height/2},{x:0,y:-6});
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
        this.size = {width:3,height:3};
        this.position = position;
        this.velocity = velocity;
    }
    Bullet.prototype = {
        update: function(){
          //this.position.x += this.velocity.x;
          this.position.y += this.velocity.y
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
        this.KEYS = {LEFT:37, RIGHT:39, SPACE:32, UP:38, DOWN:40};
    }
    // создаем сразу много врагов с помощью 
    // цикла и функции инициализации
    var createInvaders = function(game){
        var invaders = [];
        for(var i =0;i<10;i++){
            var x =50 +(i%5)*50;
            var y =50 +(i%2)*50;
            // добавляем в массив нового врага
            invaders.push(new Invader(game,{x:x,y:y}));

        }
        return invaders;
    }
    // механика соударений условие кто на кого должен залезть 
    // чтобы считалось соударением
    var collising = function(b1,b2){
        return !(b1==b2 ||
            b1.position.x+b1.size.width/2<b2.position.x-b2.size.width/2 ||
            b1.position.y+b1.size.height/2<b2.position.y-b2.size.height/2||
            b1.position.x-b1.size.width/2>b2.position.x+b2.size.width/2 ||
            b1.position.y-b1.size.height/2>b2.position.y+b2.size.height/2);
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
    var drawRect = function(screen, body){
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
    } 
    var clearCanvas = function(screen,gameSize){
        screen.clearRect(0,0,gameSize.x,gameSize.y); 
    }
    window.onload = function(){
        new Game("screen");
    }
})();