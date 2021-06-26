
let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')
let score = document.querySelector('#score')
let start = document.querySelector('#startGame')
let modal = document.querySelector('#modal')
let finalScore = document.querySelector('#finalScore');
console.log(score);
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        ctx.fillStyle  = this.color;
        ctx.fill()
    }
}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        ctx.fillStyle  = this.color;
        ctx.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        ctx.fillStyle  = this.color;
        ctx.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
const friction = 0.98; //will use this to make particles decelerate after hitting
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha; //this will make a particle gets faded
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        ctx.fillStyle  = this.color;
        ctx.fill()
        ctx.restore();
    }
    update(){
        this.draw()
        this.velocity.x *= friction; //making particles slower with time
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}
let x = canvas.width/2;
let y = canvas.height/2;
let player = new Player(x,y,30,"white");
let projectiles = [];
let enemies = [];
let particles = [];

function init(){
     player = new Player(x,y,30,"white");
     projectiles = [];
     enemies = [];
     particles = [];
     alterscore = 0;
     score.innerHTML = alterscore;
     finalScore.innerHTML = alterscore;
}


function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random() * (30 - 5) + 4;
        let x;
        let y;
        if(Math.random()<0.5){
             x = Math.random() < 0.5 ? 0 - radius:canvas.width + radius;
             y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius:canvas.height + radius;
        }
        
        const color = `hsl(${Math.random() * 360},50%,50%)`; //hue saturation lightness
        const angle = Math.atan2(canvas.height/2 - y,canvas.width/2 - x)
        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
    }
        enemies.push(new Enemy(x,y,radius,color,velocity));
    },1000)
}
let animationId;
let alterscore = 0;
function animate(){
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle,index) =>{
        if(particle.alpha <= 0){
            particles.splice(index,1);
        }else{
            particle.update();
        }
    })
    projectiles.forEach((projectile,pindex) =>{
        projectile.update()
        //removing projectiles off the screen after game ends
        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width||projectile.y + projectile.radius < 0||projectile.y - projectile.radius > canvas.height){
            setTimeout(() =>{
                projectiles.splice(pindex,1);
            },0)
        }
    })
    enemies.forEach((enemy,index)=>{
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y);
        //end the game
        if(dist - enemy.radius - player.radius < 1){ 
            cancelAnimationFrame(animationId);
            modal.style.display = 'flex';
            finalScore.innerHTML = alterscore;
        }
        projectiles.forEach((projectile,pindex) =>{
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y);
            //when collision occurs
            
            if(dist - enemy.radius - projectile.radius < 1){ 
                //creating explosions on hit
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x,projectile.y,Math.random() * 2,enemy.color,{
                        x:(Math.random() - 0.5) * (Math.random() * 5),
                        y:(Math.random() - 0.5) * (Math.random() * 5)
                    }))
                }
                if(enemy.radius - 10 > 5){
                    //increasing sccore on hit by 100
                    alterscore += 100;
                    score.innerHTML = alterscore;
                    gsap.to(enemy,{
                        radius:enemy.radius - 10
                    })
                    enemy.radius -= 10;
                    setTimeout(() =>{
                        projectiles.splice(pindex,1);
                    },0)
                }else{
                    //when enemy is killed altogether,you get 250 points
                    alterscore += 250;
                    score.innerHTML = alterscore;
                    setTimeout(() =>{
                        enemies.splice(index,1);
                        projectiles.splice(pindex,1);
                    },0)
                }
            }
        })
    })
}

addEventListener("click",(event)=>{
    const angle = Math.atan2(event.clientY - canvas.height/2,event.clientX - canvas.width/2)
    const velocity = {
        x:Math.cos(angle) * 5,
        y:Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity))
})

start.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemies()
    modal.style.display = 'none'
})

