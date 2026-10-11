import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Script, createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(root,name),'utf8');
const v1=read('ver.1.html'),v2=read('ver.2.html'),index=read('index.html');
const script=html=>html.match(/<script>([\s\S]*?)<\/script>/)[1];
assert.equal(index,v2,'The default entry must remain identical to ver.2');
assert.ok(script(v2).startsWith(script(v1).trimEnd()),'Versions must share the same workforce logic');
for(const [name,html] of [['ver.1.html',v1],['ver.2.html',v2],['index.html',index]]){
 new Script(script(html),{filename:name});
 const markup=html.split('<script>')[0];
 const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`${name}: duplicate HTML IDs`);
 assert.ok(!html.includes('employeeData'),'Personal employee roster must be absent');
 const symbols=new Set([...markup.matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]));
 for(const match of markup.matchAll(/<use href="#([^"]+)"/g))assert.ok(symbols.has(match[1]),`${name}: missing icon ${match[1]}`);
 for(const match of html.matchAll(/(?:src=|url\()['"]?(assets\/[a-zA-Z0-9._-]+)/g))assert.ok(existsSync(resolve(root,match[1])),`${name}: missing ${match[1]}`);
}
// Execute only the model and report functions, without running browser or UI code.
let reportBlob,downloadName;
const anchor={click(){downloadName=this.download;},remove(){}};
const context=createContext({assert,Blob,console,document:{createElement:()=>anchor,body:{appendChild(){}}},URL:{createObjectURL(blob){reportBlob=blob;return 'blob:test';},revokeObjectURL(){}},setTimeout(){},clearTimeout(){}});
const model=script(v1).split('const actions=')[0];
runInContext(model,context);
runInContext(`
let cases=0;
for(const month of [6,7,8])for(const department of ['all',...departments.map(d=>d.id)]){
 state.month=month;state.department=department;const s=snapshot();
 assert.equal(composition(s.list,month,'jobs').reduce((a,b)=>a+b,0),s.total,'Job headcount must sum to the selected workforce');
 assert.equal(composition(s.list,month,'tenure').reduce((a,b)=>a+b,0),s.total,'Tenure headcount must sum to the selected workforce');
 assert.equal(composition(s.list,month,'jobs',true).reduce((a,b)=>a+b,0),s.plan,'Job plans must sum to the approved workforce plan');
 assert.ok(s.allocated<=s.total,'Project participants cannot exceed total headcount');
 assert.ok(s.projectPlan<=s.plan,'Project assignments cannot exceed approved headcount');
 assert.ok(s.cost<=s.budget,'Sample costs must stay within their stated budgets');
 assert.equal(s.prev+hiresAt(s.list,month)-exitsAt(s.list,month),s.total,'Monthly headcount must reconcile');
 s.projects.forEach(p=>{assert.ok(p.actual<=p.plan);assert.ok(p.gap>=0);});
 cases++;
}
state.month=8;state.department='all';const baseline=snapshot();
assert.equal(baseline.total,1284);assert.equal(baseline.plan,1320);
assert.ok(Math.abs(baseline.cost-96.5)<.001);assert.equal(baseline.budget,99);
assert.equal(baseline.allocated,815);assert.equal(baseline.projectPlan,897);
assert.equal(baseline.projects.filter(p=>p.coverage<90).length,2);
state.search='AI';assert.equal(filteredProjects(baseline).length,1);
state.search='';state.status='attention';assert.equal(filteredProjects(baseline).length,2);
state.status='normal';assert.equal(filteredProjects(baseline).length,3);
state.status='all';state.sort='gap';state.direction=-1;
assert.equal(filteredProjects(baseline)[0].id,'P01');
state.month=7;state.department='engineering';notify=()=>{};exportCSV();
console.log('PASS: '+cases+' monthly / organizational accounting scenarios, project search, status filters, sorting');
`,context);
const csv=await reportBlob.text();
assert.equal(downloadName,'samsung-workforce-2026-08-engineering.csv');
assert.ok(csv.includes('"개발본부","474","493"'),'CSV must use the selected organization and period');
assert.ok(csv.includes('"일반 운영 인력","114"'));
assert.ok(csv.includes('"직무","현원","정원"')&&csv.includes('"근속 구간","인원","구성비(%)"'));
assert.ok(!csv.includes('"영업본부","232"'),'Unselected organizations must not be exported');
console.log('PASS: filtered CSV content, HTML/JS syntax, icons, assets and version parity');
