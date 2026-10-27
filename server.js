const express = require('express');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// create folders
if(!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if(!fs.existsSync('./messages.json')) fs.writeFileSync('./messages.json','[]');

const FILE='./messages.json';
const read=()=>{try{return JSON.parse(fs.readFileSync(FILE));}catch{return []}};
const write=(d)=>fs.writeFileSync(FILE, JSON.stringify(d));

// serve uploaded files
app.use('/uploads', express.static('uploads'));

// upload config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req,file,cb)=> cb(null, Date.now()+'-'+file.originalname.replace(/[^a-z0-9\.]/gi,'_'))
});
const upload = multer({storage, limits:{fileSize: 15*1024*1024}}); // 15MB max

// Upload endpoint
app.post('/upload', upload.single('file'), (req,res)=>{
  if(!req.file) return res.status(400).json({error:"no file"});
  let url = `https://fosnalic-live.onrender.com/uploads/${req.file.filename}`;
  res.json({url, type: req.file.mimetype});
});

// Messages
app.get('/messages', (req,res)=>{
  let data=read();
  let q=(req.query.q||"").toLowerCase();
  let type=req.query.type||"all"; // all, image, video, audio, text
  if(q) data=data.filter(m=>(m.text+m.name).toLowerCase().includes(q));
  if(type!=="all") data=data.filter(m=>m.mediaType===type || (type==="text" && !m.mediaType));
  res.json(data);
});

app.post('/messages', (req,res)=>{
  let {name,text,replyTo,mediaUrl,mediaType}=req.body;
  if(!text && !mediaUrl) return res.status(400).send("empty");
  let data=read();
  let msg={
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,4),
    name:(name||"Guest").slice(0,20),
    text:(text||"").slice(0,500),
    replyTo: replyTo||null,
    mediaUrl: mediaUrl||null,
    mediaType: mediaType||null, // image, video, audio
    time: new Date().toISOString()
  };
  data.unshift(msg);
  data=data.slice(0,300);
  write(data);
  res.json({ok:true, msg});
});

app.listen(process.env.PORT||10000, ()=>console.log("Live v3 media ready"));
