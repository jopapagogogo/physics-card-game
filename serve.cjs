const http = require('http'); const fs = require('fs'); const path = require('path');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{let url=req.url.split('?')[0]; url=url==='/'?'/index.html':url;
try{const d=fs.readFileSync(path.join(__dirname,url));res.writeHead(200,{'Content-Type':MIME[path.extname(url)]||'text/plain','Cache-Control':'no-cache'});res.end(d)}
catch(e){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404: '+url)}}).listen(8080,()=>console.log('http://localhost:8080'));
