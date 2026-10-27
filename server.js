const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const FILE = './messages.json';
if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');

function read(){ try{ return JSON.parse(fs.readFileSync(FILE)); }catch{ return []; } }
function write(d){ fs.writeFileSync(FILE, JSON.stringify(d)); }

app.get('/messages', (req,res)=>{
  let data = read();
  // search ?q=keyword
  let q = (req.query.q||"").toLowerCase();
  if(q) data = data.filter(m=> (m.text+m.name).toLowerCase().includes(q));
  res.json(data);
});

app.post('/messages', (req,res)=>{
  let {name,text,replyTo}=req.body;
  if(!text||text.length>400) return res.status(400).send("bad");
  let data = read();
  let msg = {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,5),
    name: (name||"Guest").slice(0,20),
    text: text.slice(0,400),
    replyTo: replyTo||null, // id of parent message
    time: new Date().toISOString()
  };
  data.unshift(msg);
  data = data.slice(0,200);
  write(data);
  res.json({ok:true, msg});
});

app.listen(process.env.PORT||10000, ()=>console.log("Live v2"));
