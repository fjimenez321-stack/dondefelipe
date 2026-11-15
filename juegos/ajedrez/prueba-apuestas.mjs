// Pruebas de las reglas de las apuestas del ajedrez (Hipopesos y gatitos), los cobros y el ranking.
// Se ejecutan con el emulador de Firebase (necesita Java y Node), desde la raíz del repositorio:
//   npm i -D firebase-tools @firebase/rules-unit-testing firebase
//   npx firebase emulators:exec --only firestore --project demo-ajedrez "node juegos/ajedrez/prueba-apuestas.mjs"
// (en firebase.json, el emulador de Firestore debe usar el puerto 8085)
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {setLogLevel,doc,setDoc,updateDoc,getDoc,deleteDoc,serverTimestamp,runTransaction} from 'firebase/firestore';
import fs from 'fs';
setLogLevel('silent');
const env=await initializeTestEnvironment({projectId:'demo-ajedrez',firestore:{rules:fs.readFileSync(new URL('../../firebase/firestore.rules', import.meta.url),'utf8'),host:'127.0.0.1',port:8085}});
const ctx=(uid)=>env.authenticatedContext(uid,{email:uid+'@ejemplo.cl',email_verified:true,name:uid[0].toUpperCase()+uid.slice(1)+' Pérez'}).firestore();
await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();
  for(const u of ['ana','beto','cata']){
    await setDoc(doc(db,'banco_vinculos',u+'@ejemplo.cl'),{cuenta:'c-'+u,numero:'1',nombre:u});
    await setDoc(doc(db,'banco_cuentas','c-'+u),{numero:'1',nombre:u,apellido:'P',curso:'',saldo:50000,ops:0,estado:'Activa'});
    await setDoc(doc(db,'gatitos',u),{uid:u,nombre:u,ids:u==='ana'?['naranjo','siames']:['gris','negro'],favorito:u==='ana'?'naranjo':'gris',actualizado:new Date()});
  }});
const A=ctx('ana'),B=ctx('beto'),C=ctx('cata');
let fallas=0;
async function prueba(n,p,debe){try{await (debe?assertSucceeds(p):assertFails(p));console.log('  ✓',n);}catch(e){fallas++;console.log('  ✗',n,(e.message||'').replace(/\s+/g,' ').slice(0,3000));}}
const sala=(db,c)=>doc(db,'ajedrez_salas',c);
const leer=async(c)=>{let r;await env.withSecurityRulesDisabled(async x=>{r=(await getDoc(sala(x.firestore(),c))).data();});return r;};
const base=(cod,uid,col,apuesta)=>({codigo:cod,creador:uid,creadorNombre:'X',estado:'espera',blancas:col==='w'?{uid,nombre:'X'}:null,negras:col==='b'?{uid,nombre:'X'}:null,jugadores:[uid],
  tiempo:{base:0,inc:0},reloj:{w:0,b:0},jugadas:[],fen:'x',turno:'w',turnoDesde:serverTimestamp(),seq:0,tablas:'',resultado:null,revancha:'',revanchaDe:'',de:'',
  creado:serverTimestamp(),actualizado:serverTimestamp(),apuesta,pagos:{w:'',b:''},contado:{w:false,b:false},confirmado:false,disputa:false,finEn:null});
// operación de banco dentro de una transacción
async function op(tx,db,u,monto,tipo,cod){
  const rc=doc(db,'banco_cuentas','c-'+u),c=(await tx.get(rc)).data();const ops=(c.ops||0)+1,saldo=c.saldo+monto,id='op-c-'+u+'-'+ops;
  tx.update(rc,{saldo,ops,actualizado:serverTimestamp()});
  tx.set(doc(db,'banco_movs',id),{cuenta:'c-'+u,numero:'1',nombre:u,curso:'',monto,motivo:'ajedrez',tipo,saldoDespues:saldo,profe:'',fecha:serverTimestamp(),ajedrez:cod});
  return id;
}
async function gat(tx,db,u,ids,cod,cobro){const r=doc(db,'gatitos',u);tx.update(r,{ids,favorito:ids[0]||null,[cobro?'ajedrezCobro':'ajedrez']:cod,actualizado:serverTimestamp()});}

console.log('Apuesta en Hipopesos');
await prueba('ana crea sala con ₣5.000',runTransaction(A,async tx=>{const id=await op(tx,A,'ana',-5000,'ajedrez-apuesta','HIPO');tx.set(sala(A,'HIPO'),base('HIPO','ana','w',{tipo:'hipopesos',monto:5000,w:{cuenta:'c-ana',mov:id},b:null}));}),true);
await prueba('crear diciendo 5.000 pero pagando 1.000',runTransaction(A,async tx=>{const id=await op(tx,A,'ana',-1000,'ajedrez-apuesta','HIP2');tx.set(sala(A,'HIP2'),base('HIP2','ana','w',{tipo:'hipopesos',monto:5000,w:{cuenta:'c-ana',mov:id},b:null}));}),false);
await prueba('crear con apuesta sin pagar',setDoc(sala(A,'HIP3'),base('HIP3','ana','w',{tipo:'hipopesos',monto:5000,w:{cuenta:'c-ana',mov:'op-c-ana-9'},b:null})),false);
await prueba('apuesta de ajedrez a una sala ajena (beto)',runTransaction(B,async tx=>{await op(tx,B,'beto',-5000,'ajedrez-apuesta','HIPO');}),false);
let d=await leer('HIPO');
const unir=(u,col,ap)=>({[col==='w'?'blancas':'negras']:{uid:u,nombre:'Y'},jugadores:['ana',u],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp(),...(ap?{apuesta:ap}:{})});
await prueba('beto se une sin pagar',updateDoc(sala(B,'HIPO'),unir('beto','b')),false);
await prueba('beto se une pagando ₣5.000',runTransaction(B,async tx=>{const id=await op(tx,B,'beto',-5000,'ajedrez-apuesta','HIPO');tx.update(sala(B,'HIPO'),unir('beto','b',{...d.apuesta,b:{cuenta:'c-beto',mov:id}}));}),true);
// 20 jugadas
const J=['e2e4','e7e5','g1f3','b8c6','f1c4','f8c5','b1c3','g8f6','d2d3','d7d6','c1g5','h7h6','g5h4','g7g5','h4g3','c8g4','h2h3','g4h5','e1g1','e8g8'];
for(let i=0;i<20;i++){d=await leer('HIPO');const db=i%2?B:A;await updateDoc(sala(db,'HIPO'),{jugadas:[...d.jugadas,J[i]],fen:'x',turno:d.turno==='w'?'b':'w',turnoDesde:serverTimestamp(),seq:d.seq+1,tablas:'',actualizado:serverTimestamp()});}
d=await leer('HIPO');
await prueba('beto cobra antes de terminar',runTransaction(B,async tx=>{await op(tx,B,'beto',10000,'ajedrez-premio','HIPO');tx.update(sala(B,'HIPO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('ana se rinde',updateDoc(sala(A,'HIPO'),{estado:'fin',resultado:{ganador:'b',motivo:'abandono'},finEn:serverTimestamp(),seq:d.seq+1,actualizado:serverTimestamp()}),true);
d=await leer('HIPO');
await prueba('ana (perdió) intenta cobrar premio',runTransaction(A,async tx=>{await op(tx,A,'ana',10000,'ajedrez-premio','HIPO');tx.update(sala(A,'HIPO'),{pagos:{w:'premio',b:''},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('ana pide devolución',runTransaction(A,async tx=>{await op(tx,A,'ana',5000,'ajedrez-devolucion','HIPO');tx.update(sala(A,'HIPO'),{pagos:{w:'devuelto',b:''},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('beto cobra ₣20.000 (más de lo justo)',runTransaction(B,async tx=>{await op(tx,B,'beto',20000,'ajedrez-premio','HIPO');tx.update(sala(B,'HIPO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
const rk=(u,n,cod)=>({juego:'ajedrez',uid:u,nombre:u[0].toUpperCase()+u.slice(1)+' P.',curso:'',puntaje:n,fecha:serverTimestamp(),ultima:cod});
await prueba('beto cobra ₣10.000 y suma la victoria',runTransaction(B,async tx=>{await op(tx,B,'beto',10000,'ajedrez-premio','HIPO');
  tx.update(sala(B,'HIPO'),{pagos:{w:'',b:'premio'},contado:{w:false,b:true},seq:d.seq+1,actualizado:serverTimestamp()});tx.set(doc(B,'rankings','ajedrez','mejores','beto'),rk('beto',1,'HIPO'));}),true);
d=await leer('HIPO');
await prueba('beto cobra dos veces',runTransaction(B,async tx=>{await op(tx,B,'beto',10000,'ajedrez-premio','HIPO');tx.update(sala(B,'HIPO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('beto suma otra victoria con la misma sala',runTransaction(B,async tx=>{tx.update(sala(B,'HIPO'),{contado:{w:false,b:true},seq:d.seq+1,actualizado:serverTimestamp()});tx.set(doc(B,'rankings','ajedrez','mejores','beto'),rk('beto',2,'HIPO'));}),false);
await prueba('beto se pone 50 victorias',setDoc(doc(B,'rankings','ajedrez','mejores','beto'),rk('beto',50,'HIPO')),false);
const saldo=async u=>{let r;await env.withSecurityRulesDisabled(async x=>{r=(await getDoc(doc(x.firestore(),'banco_cuentas','c-'+u))).data().saldo;});return r;};
console.log('    saldos: ana',await saldo('ana'),'beto',await saldo('beto'));

console.log('Apuesta de gatitos con jaque mate');
await prueba('ana apuesta un gatito que no tiene',runTransaction(A,async tx=>{await gat(tx,A,'ana',['naranjo','siames'],'GATO');tx.set(sala(A,'GATO'),base('GATO','ana','w',{tipo:'gatito',w:{gatito:'dorado'},b:null}));}),false);
await prueba('ana apuesta a Naranjo',runTransaction(A,async tx=>{await gat(tx,A,'ana',['siames'],'GATO');tx.set(sala(A,'GATO'),base('GATO','ana','w',{tipo:'gatito',w:{gatito:'naranjo'},b:null}));}),true);
d=await leer('GATO');
await prueba('beto se une apostando a Gris',runTransaction(B,async tx=>{await gat(tx,B,'beto',['negro'],'GATO');tx.update(sala(B,'GATO'),unir('beto','b',{...d.apuesta,b:{gatito:'gris'}}));}),true);
const M=['f2f3','e7e5','g2g4','d8h4'];
for(let i=0;i<3;i++){d=await leer('GATO');await updateDoc(sala(i%2?B:A,'GATO'),{jugadas:[...d.jugadas,M[i]],fen:'x',turno:d.turno==='w'?'b':'w',turnoDesde:serverTimestamp(),seq:d.seq+1,tablas:'',actualizado:serverTimestamp()});}
d=await leer('GATO');
await prueba('beto da mate',updateDoc(sala(B,'GATO'),{jugadas:[...d.jugadas,M[3]],fen:'x',turno:'w',turnoDesde:serverTimestamp(),seq:d.seq+1,tablas:'',estado:'fin',resultado:{ganador:'b',motivo:'jaque-mate'},finEn:serverTimestamp(),actualizado:serverTimestamp()}),true);
d=await leer('GATO');
await prueba('beto cobra sin que ana confirme',runTransaction(B,async tx=>{await gat(tx,B,'beto',['negro','naranjo','gris'],'GATO',true);tx.update(sala(B,'GATO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('beto se confirma a sí mismo',updateDoc(sala(B,'GATO'),{confirmado:true,seq:d.seq+1,actualizado:serverTimestamp()}),false);
await prueba('ana confirma el mate',updateDoc(sala(A,'GATO'),{confirmado:true,seq:d.seq+1,actualizado:serverTimestamp()}),true);
d=await leer('GATO');
await prueba('beto cobra 3 gatitos (uno inventado)',runTransaction(B,async tx=>{await gat(tx,B,'beto',['negro','naranjo','gris','dorado'],'GATO',true);tx.update(sala(B,'GATO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
await prueba('mate con 4 jugadas no suma ranking',runTransaction(B,async tx=>{tx.update(sala(B,'GATO'),{contado:{w:false,b:true},seq:d.seq+1,actualizado:serverTimestamp()});tx.set(doc(B,'rankings','ajedrez','mejores','beto'),rk('beto',2,'GATO'));}),false);
await prueba('beto cobra Naranjo y Gris',runTransaction(B,async tx=>{await gat(tx,B,'beto',['negro','naranjo','gris'],'GATO',true);tx.update(sala(B,'GATO'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),true);
d=await leer('GATO');
await prueba('ana recupera su gatito tras perder',runTransaction(A,async tx=>{await gat(tx,A,'ana',['siames','naranjo'],'GATO',true);tx.update(sala(A,'GATO'),{pagos:{w:'devuelto',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);

console.log('Cancelar, tablas y reclamos');
await prueba('cata crea con ₣3.000',runTransaction(C,async tx=>{const id=await op(tx,C,'cata',-3000,'ajedrez-apuesta','CANC');tx.set(sala(C,'CANC'),base('CANC','cata','b',{tipo:'hipopesos',monto:3000,w:null,b:{cuenta:'c-cata',mov:id}}));}),true);
await prueba('cata borra la sala con su apuesta adentro',deleteDoc(sala(C,'CANC')),false);
d=await leer('CANC');
await prueba('cata cancela y recupera ₣3.000',runTransaction(C,async tx=>{await op(tx,C,'cata',3000,'ajedrez-devolucion','CANC');tx.update(sala(C,'CANC'),{estado:'fin',resultado:{ganador:'',motivo:'cancelada'},finEn:serverTimestamp(),pagos:{w:'',b:'devuelto'},seq:d.seq+1,actualizado:serverTimestamp()});}),true);
console.log('    saldo cata',await saldo('cata'));
await prueba('ana crea con ₣2.000 (tablas)',runTransaction(A,async tx=>{const id=await op(tx,A,'ana',-2000,'ajedrez-apuesta','TABL');tx.set(sala(A,'TABL'),base('TABL','ana','w',{tipo:'hipopesos',monto:2000,w:{cuenta:'c-ana',mov:id},b:null}));}),true);
d=await leer('TABL');
await runTransaction(C,async tx=>{const id=await op(tx,C,'cata',-2000,'ajedrez-apuesta','TABL');tx.update(sala(C,'TABL'),{negras:{uid:'cata',nombre:'C'},jugadores:['ana','cata'],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp(),apuesta:{...d.apuesta,b:{cuenta:'c-cata',mov:id}}});});
d=await leer('TABL');
await updateDoc(sala(C,'TABL'),{tablas:'b',seq:d.seq+1,actualizado:serverTimestamp()});d=await leer('TABL');
await prueba('ana acepta tablas',updateDoc(sala(A,'TABL'),{estado:'fin',resultado:{ganador:'',motivo:'acuerdo'},finEn:serverTimestamp(),seq:d.seq+1,actualizado:serverTimestamp()}),true);
d=await leer('TABL');
await prueba('ana recupera ₣2.000',runTransaction(A,async tx=>{await op(tx,A,'ana',2000,'ajedrez-devolucion','TABL');tx.update(sala(A,'TABL'),{pagos:{w:'devuelto',b:''},seq:d.seq+1,actualizado:serverTimestamp()});}),true);
d=await leer('TABL');
await prueba('ana se lleva también lo de cata',runTransaction(A,async tx=>{await op(tx,A,'ana',2000,'ajedrez-devolucion','TABL');tx.update(sala(A,'TABL'),{pagos:{w:'devuelto',b:'devuelto'},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
// disputa
await runTransaction(A,async tx=>{const id=await op(tx,A,'ana',-1000,'ajedrez-apuesta','DISP');tx.set(sala(A,'DISP'),base('DISP','ana','w',{tipo:'hipopesos',monto:1000,w:{cuenta:'c-ana',mov:id},b:null}));});
d=await leer('DISP');
await runTransaction(B,async tx=>{const id=await op(tx,B,'beto',-1000,'ajedrez-apuesta','DISP');tx.update(sala(B,'DISP'),unir('beto','b',{...d.apuesta,b:{cuenta:'c-beto',mov:id}}));});
d=await leer('DISP');
await updateDoc(sala(A,'DISP'),{jugadas:['e2e5'],fen:'x',turno:'b',turnoDesde:serverTimestamp(),seq:d.seq+1,tablas:'',actualizado:serverTimestamp()});d=await leer('DISP');
await prueba('beto detecta jugada ilegal y reclama',updateDoc(sala(B,'DISP'),{estado:'fin',resultado:{ganador:'',motivo:'disputa'},disputa:true,finEn:serverTimestamp(),seq:d.seq+1,actualizado:serverTimestamp()}),true);
d=await leer('DISP');
await prueba('con reclamo nadie cobra',runTransaction(A,async tx=>{await op(tx,A,'ana',1000,'ajedrez-devolucion','DISP');tx.update(sala(A,'DISP'),{pagos:{w:'devuelto',b:''},seq:d.seq+1,actualizado:serverTimestamp()});}),false);
const P=env.authenticatedContext('profe',{email:'fjimenez321@gmail.com',email_verified:true}).firestore();
await prueba('el profe resuelve: gana beto',updateDoc(sala(P,'DISP'),{resultado:{ganador:'b',motivo:'profe'},disputa:false,confirmado:true,seq:d.seq+1}),true);
d=await leer('DISP');
await prueba('beto cobra tras el profe',runTransaction(B,async tx=>{await op(tx,B,'beto',2000,'ajedrez-premio','DISP');tx.update(sala(B,'DISP'),{pagos:{w:'',b:'premio'},seq:d.seq+1,actualizado:serverTimestamp()});}),true);
await prueba('sala sin apuesta se sigue creando',setDoc(sala(A,'LIBR'),base('LIBR','ana','w',null)),true);
await prueba('y se puede borrar en espera',deleteDoc(sala(A,'LIBR')),true);
console.log('Gatitos de siempre');
await prueba('ana cambia su favorito',updateDoc(doc(A,'gatitos','ana'),{favorito:'siames',actualizado:serverTimestamp()}),true);
await prueba('ana se agrega un gatito gratis',updateDoc(doc(A,'gatitos','ana'),{ids:['siames','dorado'],actualizado:serverTimestamp()}),false);
await prueba('ana cambia el código de ajedrez sin apostar',updateDoc(doc(A,'gatitos','ana'),{ajedrez:'ZZZZ',actualizado:serverTimestamp()}),false);
console.log(fallas?fallas+' fallas':'Todo bien');
await env.cleanup();process.exit(fallas?1:0);
