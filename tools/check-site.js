const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p)}}walk(root);
const html=files.filter(f=>f.endsWith('.html'));let errors=[];
for(const file of html){const text=fs.readFileSync(file,'utf8'), rel=path.relative(root,file);for(const required of ['<title>','name="description"','rel="canonical"','property="og:title"','name="twitter:card"','id="main"'])if(!text.includes(required))errors.push(`${rel}: missing ${required}`);const ids=new Set([...text.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){const ref=m[1];if(/^(https?:|mailto:|data:)/.test(ref))continue;const [target,hash]=ref.split('#');const resolved=path.resolve(path.dirname(file),target||path.basename(file));if(target&&!fs.existsSync(resolved))errors.push(`${rel}: missing ${ref}`);if(hash){let targetText=text;if(target){if(!fs.existsSync(resolved)||!resolved.endsWith('.html'))continue;targetText=fs.readFileSync(resolved,'utf8')}if(!new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`).test(targetText))errors.push(`${rel}: missing anchor ${ref}`)}}const h1=(text.match(/<h1\b/g)||[]).length;if(h1!==1)errors.push(`${rel}: expected one h1, found ${h1}`)}
// Keep project data internally auditable without relying on a brittle web scraper.
const build=fs.readFileSync(path.join(root,'tools','build-site.js'),'utf8');
const required=['repo','lastVerified'];
for(const field of required)if(!build.includes(field))errors.push(`project data: missing ${field} metadata support`);
const stale=[...build.matchAll(/lastVerified:\s*['"](\d{4}-\d{2}-\d{2})/g)].map(m=>m[1]).filter(d=>(Date.now()-Date.parse(d))>90*864e5);
if(stale.length)errors.push(`project data: ${stale.length} audit date(s) older than 90 days`);
for(const m of build.matchAll(/tags:\s*\[([^\]]*)\]/g)){const tags=[...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1].toLowerCase());if(new Set(tags).size!==tags.length)errors.push('project data: duplicate tags');if(tags.some(x=>!x.trim()||/placeholder|todo/.test(x)))errors.push('project data: empty or placeholder tag')}
if(/repo:\s*['"]https:\/\/github\.com\/[^'"]+['"][\s\S]{0,900}?(?:Not confirmed|Source unavailable|Unverified)/i.test(build)&&!build.includes('Object.assign(unavailable'))errors.push('project data: public GitHub repo paired with unavailable/unverified placeholder');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`OK: ${html.length} HTML files; local links, anchors, metadata and project-data checks verified.`);
