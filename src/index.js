import 'core-js';
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import loadImages from "./image-loader";
import createCanvas from "./create-canvas";
import TweenLite from 'gsap';
import times from './times';
import {random,chance} from './random';

let textureRainFg, textureRainBg,
  textureStormLightningFg, textureStormLightningBg,
  textureFalloutFg, textureFalloutBg,
  textureSunFg, textureSunBg,
  textureDrizzleFg, textureDrizzleBg,
  dropColor, dropAlpha;

let textureFg,
  textureFgCtx,
  textureBg,
  textureBgCtx;

let textureBgSize={
  width:window.innerWidth,
  height:window.innerHeight
}
let textureFgSize={
  width:window.innerWidth,
  height:window.innerHeight
}

let raindrops,
  renderer,
  canvas;

let parallax={x:0,y:0};

function loadTextures(){
  loadImages([
    {name:"dropAlpha",src:"img/drop-alpha.png"},
    {name:"dropColor",src:"img/drop-color.png"},

    {name:"textureRainFg",src:"img/city.png"},
    {name:"textureRainBg",src:"img/city-blur.png"},

    {name:"textureStormLightningFg",src:"img/city-lightning.png"},
    {name:"textureStormLightningBg",src:"img/city-lightning-blur.png"},
  ]).then((images)=>{
    textureRainFg = images.textureRainFg.img;
    textureRainBg = images.textureRainBg.img;

    textureStormLightningFg = images.textureStormLightningFg.img;
    textureStormLightningBg = images.textureStormLightningBg.img;

    dropColor = images.dropColor.img;
    dropAlpha = images.dropAlpha.img;

    init();
  });
}

loadTextures();

function init(){
  canvas=document.querySelector('#canvas');

  let dpi=window.devicePixelRatio;
  canvas.width=window.innerWidth*dpi;
  canvas.height=window.innerHeight*dpi;
  canvas.style.width=window.innerWidth+"px";
  canvas.style.height=window.innerHeight+"px";

  raindrops=new Raindrops(
    canvas.width,
    canvas.height,
    dpi,
    dropAlpha,
    dropColor,{
      trailRate:1,
      trailScaleRange:[0.2,0.45],
      collisionRadius : 0.45,
      dropletsCleaningRadiusMultiplier : 0.28,
    }
  );

  textureFg = createCanvas(textureFgSize.width,textureFgSize.height);
  textureFgCtx = textureFg.getContext('2d');
  textureBg = createCanvas(textureBgSize.width,textureBgSize.height);
  textureBgCtx = textureBg.getContext('2d');

  generateTextures(textureRainFg,textureRainBg);

  renderer = new RainRenderer(canvas, raindrops.canvas, textureFg, textureBg, null,{
    brightness:1.04,
    alphaMultiply:6,
    alphaSubtract:3,
    // minRefraction:256,
    // maxRefraction:512
  });

  let defaultWeatherData={
    minR:10,
    maxR:40,
    maxDrops:900,
    rainChance:0.3,
    rainLimit:3,
    dropletsRate:50,
    dropletsSize:[2,4],
    dropletsCleaningRadiusMultiplier:0.43,
    globalTimeScale:1,
    trailRate:1,
    autoShrink:true,
    spawnArea:[-0.1,0.95],
    trailScaleRange:[0.2,0.5],
    fg:textureRainFg,
    bg:textureRainBg,
    flashFg:null,
    flashBg:null,
    flashChance:0,
    collisionRadius:0.65,
    collisionRadiusIncrease:0.01,
    dropFallMultiplier:1,
    collisionBoostMultiplier:0.05,
    collisionBoost:1,
  }

  let drizzleWeatherData={
    minR:10,
    maxR:40,
    rainChance:0.15,
    rainLimit:2,
    dropletsRate:10,
    dropletsSize:[3.5,6],
    fg:textureDrizzleFg,
    bg:textureDrizzleBg
  };

  let rainyWeatherData={
    minR:20,
    maxR:50,
    rainChance:0.35,
    rainLimit:6,
    dropletsRate:50,
    dropletsSize:[3,5.5],
    trailRate:1,
    trailScaleRange:[0.25,0.35],
    fg:textureRainFg,
    bg:textureRainBg,
    collisionRadiusIncrease:0.0002
  };

  let stormyWeatherData={
    maxR:55,
    rainChance:0.4,
    dropletsRate:80,
    dropletsSize:[3,5.5],
    trailRate:2.5,
    trailScaleRange:[0.25,0.4],
    fg:textureRainFg,
    bg:textureRainBg,
    flashFg:textureStormLightningFg,
    flashBg:textureStormLightningBg,
    flashChance:0.1
  };

  let typhoonWeatherData={
    minR:30,
    maxR:60,
    rainChance:0.5,
    dropletsRate:80,
    dropletsSize:[3,5.5],
    trailRate:4,
    fg:textureRainFg,
    bg:textureRainBg,
    flashFg:textureStormLightningFg,
    flashBg:textureStormLightningBg,
    flashChance:0.15,
    collisionRadiusIncrease:0
  };

  // Choose the weather data to use
  let weatherData = rainyWeatherData;

  //lively api
  //docs: https://github.com/rocksdanister/lively/wiki/Web-Guide-IV-:-Interaction
  function livelyPropertyListener(name, val) {
    switch (name) {
      case "minR":
        weatherData.minR = val;
        break;
      case "maxR":
        weatherData.maxR = val;
        break;
      case "rainChance":
        weatherData.rainChance = val;
        break;
      case "rainLimit":
        weatherData.rainLimit = val;
        break;
      case "dropletsRate":
        weatherData.dropletsRate = val;
        break;
    }

    raindrops.options = Object.assign(raindrops.options, weatherData);
    raindrops.clearDrops();
  }

  raindrops.options=Object.assign(raindrops.options,weatherData)
  raindrops.clearDrops();

  //setupParallax();
  setupFlash(weatherData);
}

function setupParallax(){
  document.addEventListener('mousemove',(event)=>{
    let x=event.pageX;
    let y=event.pageY;

    TweenLite.to(parallax,1,{
      x:((x/canvas.width)*2)-1,
      y:((y/canvas.height)*2)-1,
      ease:Quint.easeOut,
      onUpdate:()=>{
        renderer.parallaxX=parallax.x;
        renderer.parallaxY=parallax.y;
      }
    })
  });
}

function setupFlash(weatherData){
  setInterval(()=>{
    if(chance(weatherData.flashChance)){
      flash(weatherData.bg,weatherData.fg,weatherData.flashBg,weatherData.flashFg);
    }
  },500)
}

function flash(baseBg,baseFg,flashBg,flashFg){
  let flashValue={v:0};
  function transitionFlash(to,t=0.025){
    return new Promise((resolve,reject)=>{
      TweenLite.to(flashValue,t,{
        v:to,
        ease:Quint.easeOut,
        onUpdate:()=>{
          generateTextures(baseFg,baseBg);
          generateTextures(flashFg,flashBg,flashValue.v);
          renderer.updateTextures();
        },
        onComplete:()=>{
          resolve();
        }
      });
    });
  }

  let lastFlash=transitionFlash(1);
  times(random(2,7),(i)=>{
    lastFlash=lastFlash.then(()=>{
      return transitionFlash(random(0.1,1))
    })
  })
  lastFlash=lastFlash.then(()=>{
    return transitionFlash(1,0.1);
  }).then(()=>{
    transitionFlash(0,0.25);
  });
}

function generateTextures(fg,bg,alpha=1){
  textureFgCtx.globalAlpha=alpha;
  textureFgCtx.drawImage(fg,0,0,textureFgSize.width,textureFgSize.height);

  textureBgCtx.globalAlpha=alpha;
  textureBgCtx.drawImage(bg,0,0,textureBgSize.width,textureBgSize.height);
}
