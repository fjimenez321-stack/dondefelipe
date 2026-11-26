const fs=require('fs');const code=fs.readFileSync(__dirname+'/../src/characters.js','utf8');
const Characters=eval(code+';Characters');
for(const d of Characters.OFICIALES){const r=Characters.validate(d);console.log(d.meta.id,r.ok?'OK':'FAIL',r.costo,'/',r.presupuesto,r.errores.join(' | '),r.avisos.join(' | '));}
