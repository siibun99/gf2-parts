// Local-only fixture preview. No requests or writes to the production database.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixture = process.argv.includes('--fixture');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml'};
const headers = Object.fromEntries(fs.readFileSync(path.join(root,'_headers'),'utf8').split(/\r?\n/).filter(x=>/^  \S/.test(x)).map(x=>{const i=x.indexOf(':');return [x.slice(0,i).trim(),x.slice(i+1).trim()];}));
http.createServer((req,res)=>{
  let name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name === '/') name='/index.html';
  if(name === '/admin') name='/admin.html';
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep) || name.includes('/.') || !mime[path.extname(file)]) {res.writeHead(404);return res.end();}
  try {
    let content=fs.readFileSync(file);
    if(fixture && path.extname(file)==='.html') content=content.toString().replace(/<script src="vendor\/supabase.js"[^>]*><\/script>/, '<script src="tests/preview-fixture.js"></script>').replace('<body>', '<body><p style="margin:0;padding:8px;background:#ffda85;color:#111">로컬 시험용 데이터 · 실제 DB와 연결되지 않음</p>');
    res.writeHead(200,{...headers,'Content-Type':mime[path.extname(file)]+'; charset=utf-8','Cache-Control':'no-store'});res.end(content);
  } catch {res.writeHead(404);res.end();}
}).listen(4173,'127.0.0.1',()=>console.log('Local preview http://127.0.0.1:4173 '+(fixture?'(fixture)':'')));
