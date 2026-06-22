const http = require('http'); const fs = require('fs'); const path = require('path');
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
http.createServer((req,res)=>{const url=req.url==='/'?'/index.html':req.url;
try{const d=fs.readFileSync(path.join(__dirname,url));res.writeHead(200,{'Content-Type':MIME[path.extname(url)]||'text/plain','Cache-Control':'no-cache'});res.end(d)}
catch(e){res.writeHead(404);res.end('404')}}).listen(8080,()=>console.log('http://localhost:8080'));
