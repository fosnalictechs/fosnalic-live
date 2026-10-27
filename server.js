const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const FILE = './messages.json';
if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
app.get('/messages', (req,res)=>{ res.json(JSON.parse(fs.readFileSync(FILE))); });
app.post('/messages', (req,res)=>{
  let {name,text}=req.body;
  if(!text||text.length>300) return res.status(400).send("bad");
  let data=JSON.parse(fs.readFileSync(FILE));
  data.unshift({name:(name||"Guest").slice(0,20),text:text.slice(0,300),time:new Date().toISOString()});
  data=data.slice(0,100);
  fs.writeFileSync(FILE, JSON.stringify(data));
  res.json({ok:true});
});
app.listen(10000, ()=>console.log("Live"));
