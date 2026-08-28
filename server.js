const express = require("express");
const app = express();

app.use(express.json({limit:"5mb"}));

let s={
 app:null,
 appAt:null,
 seen:null,
 music:null,
 musicAt:null,
 focus:null
};

const ONLINE=3600000;
const MUSIC=1800000;

const clean=x=>x==null||String(x).trim()===""?null:String(x).trim();

app.get("/api/status",(req,res)=>{
 if(s.musicAt&&Date.now()-s.musicAt>=MUSIC){
  s.music=null;
  s.musicAt=null;
 }

 res.json({
  ...s,
  online:s.seen&&Date.now()-s.seen<ONLINE
 });
});

app.post("/app",(req,res)=>{
 let a=clean(req.body.app)||clean(req.body.name);
 if(!a)return res.status(400).json({ok:false});
 if(s.app!==a)s.appAt=Date.now();
 s.app=a;
 s.seen=Date.now();
 res.json({ok:true});
});

app.post("/app/clear",(req,res)=>{
 s.app=null;
 s.appAt=null;
 s.seen=Date.now();
 res.json({ok:true});
});

app.post("/heartbeat",(req,res)=>{
 s.seen=Date.now();
 res.json({ok:true});
});

app.post("/now-playing",(req,res)=>{
 let b=req.body;
 let music={
  title:clean(b.title),
  artist:clean(b.artist),
  album:clean(b.album),
  cover:clean(b.albumCover)||clean(b.cover)||clean(b.artwork)
 };

 if(music.title||music.artist||music.album||music.cover){
  s.music=music;
  s.musicAt=Date.now();
 }else{
  s.music=null;
  s.musicAt=null;
 }

 s.seen=Date.now();
 res.json({ok:true});
});

app.post("/now-playing/clear",(req,res)=>{
 s.music=null;
 s.musicAt=null;
 res.json({ok:true});
});

app.post("/focus",(req,res)=>{
 let name=clean(req.body.name);

 if(!name||name.toLowerCase()=="no focus mode"){
  s.focus=null;
 }else{
  s.focus={
   name,
   icon:clean(req.body.icon)||"🌙",
   description:clean(req.body.description)||"Notifications are filtered by this Focus Mode."
  };
 }

 s.seen=Date.now();
 res.json({ok:true});
});

app.post("/focus/clear",(req,res)=>{
 s.focus=null;
 res.json({ok:true});
});

function icon(a){
 a=a.toLowerCase();
 if(a.includes("spotify"))return"🟢";
 if(a.includes("music"))return"🎵";
 if(a.includes("youtube"))return"▶️";
 if(a.includes("instagram"))return"📸";
 if(a.includes("discord"))return"💬";
 if(a.includes("safari"))return"🧭";
 if(a.includes("chrome"))return"🌐";
 if(a.includes("messages"))return"💬";
 if(a.includes("photos"))return"🌅";
 if(a.includes("camera"))return"📷";
 if(a.includes("settings"))return"⚙️";
 if(a.includes("reddit"))return"👽";
 if(a.includes("tiktok"))return"🎵";
 if(a.includes("netflix"))return"🎬";
 return"📱";
}

app.get("/",(req,res)=>res.send(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>iPhone Status</title>
<style>
*{box-sizing:border-box}
body{
 margin:0;padding:25px 14px;
 background:#000;color:#fff;
 font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif
}
main{max-width:680px;margin:auto}
h1{
 font-size:27px;margin:0 0 5px;
 -webkit-text-stroke:.7px #a855f7;
 text-shadow:0 0 10px #8b2be2
}
.sub{color:#7c3aed;font-size:12px;margin-bottom:20px}
.card{
 display:none;margin:12px 0;padding:18px;
 background:#010101;
 border:1px solid #42135f;
 border-radius:17px;
 box-shadow:
 inset 0 0 15px #7e22ce44,
 inset 0 0 45px #7e22ce22,
 0 0 5px #7e22ce22
}
.show{display:block}
.label{
 color:#a855f7;font-size:10px;
 font-weight:bold;letter-spacing:1.5px;
 text-transform:uppercase;margin-bottom:15px
}
.row{display:flex;align-items:center;gap:15px}
.icon,.cover{
 width:62px;height:62px;
 border-radius:14px;
 background:#050505;
 border:1px solid #6d28d9;
 box-shadow:inset 0 0 20px #a855f733;
 display:flex;align-items:center;justify-content:center;
 font-size:27px;flex-shrink:0
}
.cover{object-fit:cover}
.name{
 font-size:20px;font-weight:900;
 -webkit-text-stroke:.5px #a855f7;
 text-shadow:0 0 8px #8b2be2
}
.muted{color:#a78bfa;font-size:12px;margin-top:4px}
.timer{
 margin-top:17px;padding-top:12px;
 border-top:1px solid #321040;
 display:flex;justify-content:space-between;
 color:#7c3aed;font-size:12px
}
.time{color:#fff;font-weight:bold}
.song{font-size:18px;font-weight:900}
.artist{color:#c4b5fd;font-size:13px;margin-top:4px}
.album{color:#7c3aed;font-size:11px;margin-top:3px}
</style>
</head>
<body>
<main>
<h1>iPhone Status</h1>
<div class="sub">Live activity dashboard</div>

<div id="online" class="card">
<div class="name">iPhone</div>
<div class="muted">● Online</div>
</div>

<div id="app" class="card">
<div class="label">Currently Using</div>
<div class="row">
<div id="appIcon" class="icon">📱</div>
<div id="appName" class="name"></div>
</div>
<div class="timer">
<span>Opened for</span>
<span id="timer" class="time">00:00:00</span>
</div>
</div>

<div id="music" class="card">
<div class="label">Music</div>
<div class="row">
<div id="cover"></div>
<div>
<div id="song" class="song"></div>
<div id="artist" class="artist"></div>
<div id="album" class="album"></div>
</div>
</div>
</div>

<div id="focus" class="card">
<div class="label">Focus Mode</div>
<div class="row">
<div id="focusIcon" class="icon">🌙</div>
<div>
<div id="focusName" class="name"></div>
<div id="focusDesc" class="muted"></div>
</div>
</div>
</div>

</main>

<script>
let opened=null;

const $=id=>document.getElementById(id);

async function update(){
 try{
  let d=await fetch("/api/status",{cache:"no-store"}).then(r=>r.json());

  $("online").classList.toggle("show",!!d.online);

  $("app").classList.toggle("show",!!d.app&&!!d.online);

  if(d.app){
   $("appName").textContent=d.app;
   $("appIcon").textContent=icon(d.app);
   opened=d.appAt;
  }else opened=null;

  $("music").classList.toggle("show",!!d.music&&!!d.online);

  if(d.music){
   $("song").textContent=d.music.title||"Unknown song";
   $("artist").textContent=d.music.artist||"";
   $("album").textContent=d.music.album||"";

   if(d.music.cover){
    $("cover").innerHTML=
     '<img class="cover" src="'+
     d.music.cover+
     '">';
   }else{
    $("cover").innerHTML=
     '<div class="cover">🎵</div>';
   }
  }

  $("focus").classList.toggle(
   "show",!!d.focus&&!!d.online
  );

  if(d.focus){
   $("focusName").textContent=d.focus.name;
   $("focusIcon").textContent=d.focus.icon;
   $("focusDesc").textContent=d.focus.description;
  }

 }catch(e){}
}

function timer(){
 if(!opened){
  $("timer").textContent="00:00:00";
  return;
 }

 let x=Math.floor((Date.now()-opened)/1000);

 let h=Math.floor(x/3600);
 let m=Math.floor(x%3600/60);
 let s=x%60;

 $("timer").textContent=
  [h,m,s].map(x=>String(x).padStart(2,"0")).join(":");
}

function icon(a){
 a=a.toLowerCase();
 if(a.includes("spotify"))return"🟢";
 if(a.includes("music"))return"🎵";
 if(a.includes("youtube"))return"▶️";
 if(a.includes("instagram"))return"📸";
 if(a.includes("discord"))return"💬";
 if(a.includes("safari"))return"🧭";
 if(a.includes("chrome"))return"🌐";
 if(a.includes("messages"))return"💬";
 if(a.includes("photos"))return"🌅";
 if(a.includes("camera"))return"📷";
 if(a.includes("settings"))return"⚙️";
 if(a.includes("reddit"))return"👽";
 if(a.includes("tiktok"))return"🎵";
 if(a.includes("netflix"))return"🎬";
 return"📱";
}

update();
timer();

setInterval(update,3000);
setInterval(timer,1000);
</script>

</body>
</html>`));

const PORT=process.env.PORT||10000;

app.listen(PORT,"0.0.0.0",()=>{
 console.log("Status server running on "+PORT);
});