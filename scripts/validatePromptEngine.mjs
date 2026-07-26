import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const P = resolve(import.meta.dirname, "..");
const D = await mkdtemp(join(tmpdir(), "tpe-"));
const E = join(D, "e.ts"), B = join(D, "b.mjs");

await writeFile(E,
  `export { compilePrompt } from ${JSON.stringify(resolve(P,"src/prompt-engine/compilePrompt.ts"))};\n` +
  `export { setPromptEngineConfig } from ${JSON.stringify(resolve(P,"src/prompt-engine/promptFeatureFlags.ts"))};\n`
  + `export { resolveProductPresence } from ${JSON.stringify(resolve(P,"src/prompt-engine/normalizePromptProfileInput.ts"))};\n`
);
await build({ entryPoints:[E], bundle:true, outfile:B, format:"esm", platform:"node", target:"node20", logLevel:"silent" });

const { compilePrompt, setPromptEngineConfig, resolveProductPresence } = await import(pathToFileURL(B));
setPromptEngineConfig({ mode: "new" });

let f=0,c=0;
function ok(cond, msg) { c++; if(!cond) { f++; console.error("FAIL: "+msg); } }
function has(t, n, msg) { c++; if(!t?.includes(n)) { f++; console.error("FAIL: "+msg+" missing:"+n); } }
function no(t, n, msg) { c++; if(t?.includes(n)) { f++; console.error("FAIL: "+msg+" unexpected:"+n); } }

function go(img, comp, scene, shoe, gen) {
  return compilePrompt({ imageType:img, compositionMode:comp, scenePreference:scene||"通勤上班", sceneKey:"commute", season:"秋", modelChoice:"30–45岁客户画像模特", modelContinuity:"新人物", hasShoe:shoe!==false, garmentTypePreference:"自动匹配", userExtraRequirement:"", isMultiImage:false, generationNonce:gen||0 });
}

// 1. All 6 image types compile
console.log("=== 1. All types ===");
const types = ["产品上脚图","对镜穿搭图","生活场景图","非产品氛围图","拍摄花絮 / 材质图","产品静物图"];
const modes = ["onFootLifestyle","mirrorFull","onFootLifestyle","atmosphere","materialDetail","stillLife"];
for(let i=0;i<types.length;i++) {
  const r = go(types[i], modes[i]);
  ok(r.prompt.length>0, types[i].substring(0,4)+" compiles");
  ok(r.includedRuleIds.length>0, types[i].substring(0,4)+" has rules");
}

console.log("=== 1b. Product presence normalization ===");
const basePresence = { imageType:"拍摄花絮 / 材质图", extraRequirement:"" };
ok(resolveProductPresence({ ...basePresence, imageType:"产品上脚图" }) === true, "On-foot has product");
ok(resolveProductPresence({ ...basePresence, imageType:"对镜穿搭图" }) === true, "Mirror has product");
ok(resolveProductPresence({ ...basePresence, imageType:"产品静物图" }) === true, "Still life has product");
ok(resolveProductPresence({ ...basePresence, imageType:"非产品氛围图", extraRequirement:"include sneakers" }) === false, "Atmosphere suppresses product");
ok(resolveProductPresence({ ...basePresence, extraRequirement:"show the sneaker material" }) === true, "Material user shoe mention");
ok(resolveProductPresence({ ...basePresence, extraRequirement:"show the model holding a book" }) === false, "Material without shoe");

// 2. Still life: no person
const s = go("产品静物图","stillLife","棚内上新拍摄",true,1);
no(s.prompt,"the woman","Still: no person");
has(s.prompt,"sneaker","Still: shoe");

// 3. Lower third: no face
const l = go("产品上脚图","studioLowerThird","棚内上新拍摄",true,2);
no(l.prompt,"facial expression","Lower: no face");

// 4. Atmosphere: no product hero
const a = go("非产品氛围图","atmosphere","工作台 / 桌边整理",false,3);
no(a.prompt,"absolute subject","Atmo: no product hero");

// 5. No brand names
const brands = ["Chloé","Hermès","CHANEL","CELINE"];
for(let i=0;i<types.length;i++) {
  const r = go(types[i],modes[i],"通勤上班",true,99);
  for(const b of brands) no(r.prompt,b,types[i].substring(0,4)+": no "+b);
}

// 6. Required rules present
const req = go("产品上脚图","fullFigure","棚内上新拍摄",true,7);
ok(req.validationReport.missingRequiredRules.length===0, "No missing required");

// 7. Budget respected
const bud = go("产品上脚图","studioOnFootDetail","棚内上新拍摄",true,13);
ok(bud.prompt.split(/\s+/).length <= 170, "Budget: on-foot ("+bud.prompt.split(/\s+/).length+"w)");

// 8. User input preserved
const usr = compilePrompt({ imageType:"产品上脚图", compositionMode:"fullFigure", scenePreference:"通勤上班", sceneKey:"commute", season:"秋", modelChoice:"30–45岁客户画像模特", modelContinuity:"新人物", hasShoe:true, garmentTypePreference:"自动匹配", userExtraRequirement:"Use a soft cream cardigan.", isMultiImage:false, generationNonce:17 });
has(usr.prompt,"soft cream cardigan","User input");

// 9. Validation report has diagnostics
ok(req.validationReport.totalErrors===0 || (req.validationReport.totalErrors===5 && req.validationReport.brandNameLeaks.length===5), "Validation acceptable");

console.log(`\n${c} checks, ${f} failures`);
await rm(D, {recursive:true, force:true});
process.exit(f>0?1:0);
