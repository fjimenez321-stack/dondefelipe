// Pruebas de las reglas de Firestore para las salas de ajedrez (ajedrez_salas).
// Se ejecutan con el emulador de Firebase (necesita Java y Node):
//   npm i -D firebase-tools @firebase/rules-unit-testing firebase
//   npx firebase emulators:exec --only firestore --project demo-ajedrez "node juegos/ajedrez/prueba-reglas.mjs"
// (desde la raíz del repositorio; el emulador debe escuchar en el puerto 8085:
//  agrega en firebase.json  "emulators": { "firestore": { "port": 8085 } })
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {setLogLevel,doc,setDoc,updateDoc,getDoc,deleteDoc,serverTimestamp,runTransaction} from 'firebase/firestore';
import fs from 'fs';
setLogLevel('silent');
const env=await initializeTestEnvironment({projectId:'demo-ajedrez',firestore:{rules:fs.readFileSync(new URL('../../firebase/firestore.rules', import.meta.url),'utf8'),host:'127.0.0.1',port:8085}});
const ctx=(uid)=>env.authenticatedContext(uid,{email:uid+'@ejemplo.cl',email_verified:true}).firestore();
const a=ctx('ana'),b=ctx('beto'),c=ctx('cata');
const r=(db,cod)=>doc(db,'ajedrez_salas',cod);
let fallas=0;
async function prueba(n,p,debe){try{await (debe?assertSucceeds(p):assertFails(p));console.log('  ✓',n);}catch(e){fallas++;console.log('  ✗',n,e.message);}}
const base=(cod,t)=>({codigo:cod,creador:'ana',creadorNombre:'Ana P.',estado:'espera',blancas:{uid:'ana',nombre:'Ana P.'},negras:null,jugadores:['ana'],
  tiempo:{base:t,inc:2000},reloj:{w:t,b:t},jugadas:[],fen:'x',turno:'w',turnoDesde:serverTimestamp(),seq:0,tablas:'',resultado:null,revancha:'',revanchaDe:'',de:'',creado:serverTimestamp(),actualizado:serverTimestamp()});
const leer=async(db,cod)=>(await getDoc(r(db,cod))).data();
const sleep=ms=>new Promise(s=>setTimeout(s,ms));

console.log('Crear y unirse');
await prueba('crear sala',setDoc(r(a,'ABCD'),base('ABCD',60000)),true);
await prueba('crear sala a nombre de otro',setDoc(r(b,'ABCE'),base('ABCE',60000)),false);
await prueba('crear con reloj regalado',setDoc(r(a,'ABCF'),{...base('ABCF',60000),reloj:{w:60000,b:1}}),false);
await prueba('tercero no puede jugar en espera',updateDoc(r(c,'ABCD'),{jugadas:['e2e4'],seq:1}),false);
await prueba('beto se une como negras',updateDoc(r(b,'ABCD'),{negras:{uid:'beto',nombre:'Beto R.'},jugadores:['ana','beto'],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp()}),true);
await prueba('cata no puede unirse después',updateDoc(r(c,'ABCD'),{negras:{uid:'cata',nombre:'C'},jugadores:['ana','beto','cata'],seq:2,actualizado:serverTimestamp()}),false);

console.log('Jugadas');
const mov=(d,u,extra)=>({jugadas:[...d.jugadas,u],fen:'x',turno:d.turno==='w'?'b':'w',turnoDesde:serverTimestamp(),seq:d.seq+1,tablas:'',actualizado:serverTimestamp(),...(extra||{})});
let d=await leer(a,'ABCD');
await prueba('negras no juegan en turno de blancas',updateDoc(r(b,'ABCD'),mov(d,'e7e5')),false);
await prueba('jugada con texto raro',updateDoc(r(a,'ABCD'),mov(d,'hola')),false);
await prueba('blancas e2e4 (reloj sin tocar)',updateDoc(r(a,'ABCD'),mov(d,'e2e4')),true);
d=await leer(a,'ABCD');
await sleep(1200);
await prueba('negras se regalan tiempo',updateDoc(r(b,'ABCD'),mov(d,'e7e5',{reloj:{w:60000,b:70000}})),false);
await prueba('negras cambian una jugada anterior',updateDoc(r(b,'ABCD'),{...mov(d,'e7e5'),jugadas:['d2d4','e7e5']}),false);
await prueba('negras tocan el reloj blanco',updateDoc(r(b,'ABCD'),mov(d,'e7e5',{reloj:{w:1,b:60000}})),false);
const usado=Date.now()-d.turnoDesde.toMillis();
await prueba('negras e7e5 con reloj correcto',updateDoc(r(b,'ABCD'),mov(d,'e7e5',{reloj:{w:60000,b:Math.round(60000-usado+2000)}})),true);
d=await leer(a,'ABCD');
console.log('    reloj negras:',d.reloj.b);
await prueba('mate falso a favor del rival',updateDoc(r(a,'ABCD'),mov(d,'d1h5',{estado:'fin',resultado:{ganador:'b',motivo:'jaque-mate'}})),false);

console.log('Tablas, abandono, tiempo');
const acc=(d,x)=>({seq:d.seq+1,actualizado:serverTimestamp(),...x});
await prueba('beto ofrece tablas',updateDoc(r(b,'ABCD'),acc(d,{tablas:'b'})),true);
d=await leer(a,'ABCD');
await prueba('beto no puede aceptar su propia oferta',updateDoc(r(b,'ABCD'),acc(d,{estado:'fin',resultado:{ganador:'',motivo:'acuerdo'}})),false);
await prueba('cata (mirando) no acepta',updateDoc(r(c,'ABCD'),acc(d,{estado:'fin',resultado:{ganador:'',motivo:'acuerdo'}})),false);
await prueba('tiempo cobrado antes de tiempo',updateDoc(r(b,'ABCD'),acc(d,{estado:'fin',resultado:{ganador:'b',motivo:'tiempo'}})),false);
await prueba('ana acepta tablas',updateDoc(r(a,'ABCD'),acc(d,{estado:'fin',resultado:{ganador:'',motivo:'acuerdo'}})),true);
d=await leer(a,'ABCD');
await prueba('no se juega con la partida terminada',updateDoc(r(a,'ABCD'),mov(d,'d2d4')),false);
await prueba('revancha',updateDoc(r(b,'ABCD'),acc(d,{revancha:'WXYZ',revanchaDe:'beto'})),true);
await prueba('creador no borra partida terminada',deleteDoc(r(a,'ABCD')),false);

// partida corta para el tiempo
await setDoc(r(a,'TIME'),base('TIME',1500));
await updateDoc(r(b,'TIME'),{negras:{uid:'beto',nombre:'Beto'},jugadores:['ana','beto'],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp()});
d=await leer(a,'TIME');
await prueba('anular antes de 2 jugadas',updateDoc(r(b,'TIME'),acc(d,{estado:'fin',resultado:{ganador:'',motivo:'anulada'}})),true);
await setDoc(r(a,'TIM2'),base('TIM2',1500));
await updateDoc(r(b,'TIM2'),{negras:{uid:'beto',nombre:'Beto'},jugadores:['ana','beto'],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp()});
d=await leer(a,'TIM2');
await updateDoc(r(a,'TIM2'),mov(d,'e2e4'));
d=await leer(a,'TIM2');
await sleep(3200);
await prueba('negras ya sin tiempo no pueden jugar',updateDoc(r(b,'TIM2'),mov(d,'e7e5',{reloj:{w:1500,b:0}})),false);
await prueba('ana cobra el tiempo de beto',updateDoc(r(a,'TIM2'),acc(d,{estado:'fin',resultado:{ganador:'w',motivo:'tiempo'}})),true);
await setDoc(r(a,'RIND'),base('RIND',0));
await updateDoc(r(b,'RIND'),{negras:{uid:'beto',nombre:'Beto'},jugadores:['ana','beto'],estado:'jugando',turnoDesde:serverTimestamp(),seq:1,actualizado:serverTimestamp()});
d=await leer(a,'RIND');
await prueba('rendirse dando la victoria a sí mismo',updateDoc(r(a,'RIND'),acc(d,{estado:'fin',resultado:{ganador:'w',motivo:'abandono'}})),false);
await prueba('ana se rinde',updateDoc(r(a,'RIND'),acc(d,{estado:'fin',resultado:{ganador:'b',motivo:'abandono'}})),true);
await setDoc(r(a,'BORR'),base('BORR',0));
await prueba('creador cierra sala en espera',deleteDoc(r(a,'BORR')),true);
console.log(fallas?fallas+' fallas':'Todo bien');
await env.cleanup();process.exit(fallas?1:0);
