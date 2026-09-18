(function(){
  // Catalogue search stays independent of the other page enhancements. It uses
  // inline display as well as `hidden`, so it works with every card layout.
  const input=document.getElementById('project-search');
  if(input){
    const cards=[...document.querySelectorAll('[data-project-card]')];
    const empty=document.querySelector('.empty');
    const applySearch=()=>{const query=input.value.trim().toLocaleLowerCase();let matches=0;cards.forEach(card=>{const show=!query||card.textContent.toLocaleLowerCase().includes(query);card.hidden=!show;card.style.display=show?'':'none';if(show)matches++});if(empty){empty.hidden=matches!==0;empty.style.display=matches?'none':''}};
    ['input','search','keyup'].forEach(event=>input.addEventListener(event,applySearch));
    applySearch();
  }
})();

(function(){
  const toggle=document.querySelector('.nav-toggle'), links=document.querySelector('.nav-links');
  if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});links.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false')});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){links.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus()}})}
  const path=location.pathname.toLowerCase(), navItems=[...document.querySelectorAll('.nav-links a')];
  if(path.includes('/projects/')){navItems.forEach(a=>a.removeAttribute('aria-current'));const slug=document.body.dataset.project||'';const target=slug.startsWith('lox')?'#projects':(/^micro/i.test(slug)?'#toolkit':'#other');navItems.find(a=>a.getAttribute('href')?.includes(target))?.setAttribute('aria-current','page')}
  document.querySelectorAll('pre code').forEach(code=>{const wrap=code.closest('.code-wrap,.ds-code');if(!wrap||wrap.querySelector('.copy'))return;const b=document.createElement('button');b.className='copy';b.type='button';b.textContent='Copy';b.setAttribute('aria-label','Copy code example');b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.textContent);b.textContent='Copied';b.setAttribute('aria-label','Code copied');track('copy_code',{project:document.body.dataset.project||'home'});setTimeout(()=>{b.textContent='Copy';b.setAttribute('aria-label','Copy code example')},1500)}catch(e){b.textContent='Select text'}});wrap.appendChild(b)});
  const search=document.querySelector('#project-search'), selects=[...document.querySelectorAll('[data-filter]')], cards=[...document.querySelectorAll('[data-project-card]')], empty=document.querySelector('.empty');
  const resultCount=document.querySelector('[data-result-count]');
  function filter(){const q=(search?.value||'').toLocaleLowerCase();let shown=0;cards.forEach(c=>{const ok=(!q||c.textContent.toLocaleLowerCase().includes(q))&&selects.every(s=>{if(!s.value)return true;const value=c.dataset[s.dataset.filter]||'';return value===s.value||value.split(/\s+/).includes(s.value)});c.hidden=!ok;if(ok)shown++});if(empty){empty.hidden=shown!==0;empty.style.display=shown?'none':''}if(resultCount)resultCount.textContent=String(shown)}
  if(selects.length){const params=new URLSearchParams(location.search);selects.forEach(select=>{const requested=params.get(select.dataset.filter);if(requested&&[...select.options].some(option=>option.value===requested))select.value=requested})}
  if(cards.length)filter();
  search?.addEventListener('input',filter);selects.forEach(s=>s.addEventListener('change',()=>{filter();track('use_filter',{filter:s.dataset.filter,value:s.value})}));
  document.querySelector('[data-filter-reset]')?.addEventListener('click',()=>{if(search)search.value='';selects.forEach(s=>s.value='');filter();search?.focus()});
  window.track=function(name,params){if(typeof window.gtag==='function')window.gtag('event',name,params||{})};
  document.addEventListener('click',e=>{const a=e.target.closest('a[data-event]');if(a)track(a.dataset.event,{href:a.href,project:document.body.dataset.project||'home'})});
  const demo=document.querySelector('[data-demo]');if(demo){const out=demo.querySelector('.demo-output');demo.addEventListener('click',e=>{if(!e.target.matches('[data-run-demo]'))return;const type=demo.dataset.demo;let text='';if(type==='loxbudget'){const pressure=Number(demo.querySelector('input').value);text=pressure<50?'ALLOW_FULL: operation may start':pressure<75?'ALLOW_DEGRADED: use reduced profile':pressure<90?'DEFER: retry after pressure falls':'DENY: budget is unsafe'}else if(type==='loxdb'){const op=demo.querySelector('select').value;text=op==='interrupt'?'write intent → interruption → WAL scan → last valid state restored':'write intent → data update → sync → commit complete'}else if(type==='loxseq'){text=out.dataset.step==='2'?'checkpoint read → recovery verdict → resume policy applied':'step 1 → checkpoint → step 2';out.dataset.step='2'}else if(type==='loxsort'){const stable=demo.querySelector('input').checked;text=stable?'Stable required → bottom-up merge if scratch is sufficient':'Constraints evaluated → profile selects eligible strategy'}else if(type==='loxguard'){text='failure captured → evidence recorded → configured policy action requested'}else{text='Input accepted → documented state transition shown'}out.textContent=text;track('run_demo',{project:type})})}
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.classList.add('motion-ready');const items=[...document.querySelectorAll('.problem,.card,.flagship,.demo,.panel,.meta > div')];items.forEach(el=>el.classList.add('motion-item'));const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-in');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});items.forEach(el=>observer.observe(el));document.querySelectorAll('.flow').forEach(flow=>{const pulse=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){flow.classList.add('flow-active');pulse.disconnect()}}),{threshold:.55});pulse.observe(flow)});document.querySelectorAll('[data-run-demo]').forEach(button=>button.addEventListener('click',()=>{const box=button.closest('.demo');box.classList.remove('demo-running');requestAnimationFrame(()=>box.classList.add('demo-running'))}))}
  const map=document.querySelector('[data-problem-map]');if(map){document.documentElement.classList.add('map-ready');const nodes=[...map.querySelectorAll('[data-map-target]')],panels=[...document.querySelectorAll('[data-map-panel]')];const open=node=>{const id=node.dataset.mapTarget;nodes.forEach(n=>n.setAttribute('aria-expanded',String(n===node)));panels.forEach(p=>p.hidden=p.dataset.mapPanel!==id);track('problem_map_open',{problem:id})};nodes.forEach((node,index)=>{node.addEventListener('click',()=>open(node));node.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();let next=index;if(e.key==='Home')next=0;else if(e.key==='End')next=nodes.length-1;else next=(index+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length;nodes[next].focus()})});open(nodes[0])}
})();

// Keep arrow-key navigation inside the currently open problem domain.
(function(){
  const explorer=document.querySelector('[data-explorer]');
  if(!explorer)return;
  explorer.addEventListener('keydown',event=>{
    const current=event.target.closest('.domain-problems [data-need]');
    if(!current||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const buttons=[...current.closest('.domain-problems').querySelectorAll('[data-need]')];
    const index=buttons.indexOf(current),forward=event.key==='ArrowRight'||event.key==='ArrowDown';
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(forward?1:-1)+buttons.length)%buttons.length;
    event.preventDefault();event.stopImmediatePropagation();buttons[next].focus();buttons[next].click();
  },true);
  const domains=[...explorer.querySelectorAll('.problem-domain')];
  domains.forEach(domain=>domain.addEventListener('toggle',()=>{
    if(domain.open)domains.forEach(other=>{if(other!==domain)other.open=false});
  }));
})();

(function(){
  const explorer=document.querySelector('[data-explorer]');
  if(explorer){const buttons=[...explorer.querySelectorAll('[data-need]')],results=[...explorer.querySelectorAll('[data-needs]')],context=explorer.querySelector('[data-recommendation-context]');const select=button=>{if(!button)return;const need=button.dataset.need;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));let shown=0;results.forEach(card=>{const match=need==='all'||(card.dataset.needs||'').split(/\s+/).includes(need);card.hidden=!match;card.classList.toggle('is-match',match);if(match)shown++});if(context)context.textContent=`For: ${button.dataset.needLabel} · ${shown} ${shown===1?'project':'projects'}`;explorer.dataset.activeNeed=need};explorer.addEventListener('click',event=>{const button=event.target.closest('[data-need]');if(button&&explorer.contains(button))select(button)});explorer.addEventListener('keydown',event=>{const button=event.target.closest('[data-need]');if(!button||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const index=buttons.indexOf(button),forward=event.key==='ArrowRight'||event.key==='ArrowDown';const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(forward?1:-1)+buttons.length)%buttons.length;buttons[next].focus();select(buttons[next])});select(buttons.find(button=>button.getAttribute('aria-pressed')==='true')||buttons[0])}
  document.querySelectorAll('.product-experience').forEach(box=>{const run=()=>{const steps=[...box.querySelectorAll('span')];steps.forEach(step=>step.classList.remove('active'));steps.forEach((step,index)=>setTimeout(()=>step.classList.add('active'),index*320))};box.addEventListener('mouseenter',run);box.addEventListener('focus',run);box.addEventListener('click',run)});
})();

(function(){
  if(!location.pathname.toLowerCase().includes('/projects/'))return;
  const slug=document.body.dataset.project||'';
  const target=slug.startsWith('lox')?'lox-family.html':/^micro/i.test(slug)?'micro-toolkit.html':'beyond-lox.html';
  document.querySelectorAll('.nav-links a').forEach(link=>{link.removeAttribute('aria-current');if(link.getAttribute('href')?.endsWith(target))link.setAttribute('aria-current','page')});
})();

(function(){
  const resourceDemo=document.querySelector('[data-resource-demo]');
  if(resourceDemo){const inputs=[...resourceDemo.querySelectorAll('[data-resource]')],decision=resourceDemo.querySelector('.decision-panel');const update=()=>{const values=Object.fromEntries(inputs.map(input=>[input.dataset.resource,Number(input.value)]));inputs.forEach(input=>input.parentElement.querySelector('output').textContent=`${input.value}%`);let state='ALLOW_FULL',reason='All configured resource thresholds are safe.';if(values.energy<20){state='DEFER';reason='Energy reserve is below the configured threshold.'}else if(values.flash<15||values.ram>92){state='DENY';reason=values.flash<15?'Flash-write budget is exhausted.':'RAM pressure exceeds the hard limit.'}else if(values.energy<40||values.flash<35||values.ram>72){state='ALLOW_DEGRADED';reason='Use the reduced resource profile.'}decision.querySelector('strong').textContent=state;decision.querySelector('small').textContent=reason;decision.dataset.state=state.toLowerCase();};inputs.forEach(input=>input.addEventListener('input',update));update()}
  const walDemo=document.querySelector('[data-wal-demo]');
  if(walDemo){const steps=[...walDemo.querySelectorAll('.wal-track span')],panel=walDemo.querySelector('.decision-panel'),button=walDemo.querySelector('[data-wal-run]');button.addEventListener('click',()=>{steps.forEach(s=>s.classList.remove('active','done'));let index=0;panel.querySelector('strong').textContent='WRITING';panel.querySelector('small').textContent='The record write has started.';const advance=()=>{if(index>0){steps[index-1].classList.remove('active');steps[index-1].classList.add('done')}if(index<steps.length){steps[index].classList.add('active');panel.querySelector('strong').textContent=['WRITING','POWER LOST','REOPENING','REPLAYING','RESTORED'][index];panel.querySelector('small').textContent=['Record data enters the documented write flow.','Commit is interrupted before completion.','The database opens after restart.','Valid WAL state is evaluated during recovery.','The last committed record is available again.'][index];index++;setTimeout(advance,550)}else button.disabled=false};button.disabled=true;advance()})}
})();

// Lightweight editorial motion: decorative only, with full reduced-motion
// support and no dependency on animation for accessing content.
(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typewriter=document.querySelector('[data-typewriter]');
  if(typewriter&&!reduced){
    const copy=typewriter.textContent;
    typewriter.textContent='';
    typewriter.classList.add('is-typing');
    let index=0;
    const tick=()=>{typewriter.textContent=copy.slice(0,++index);if(index<copy.length)setTimeout(tick,index<10?34:22);else typewriter.classList.remove('is-typing')};
    setTimeout(tick,220);
  }
  const lively=[...document.querySelectorAll('.area,.portfolio-card,.families > a,.section-heading')];
  if(!reduced&&'IntersectionObserver' in window){
    document.body.classList.add('lively-ready');
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('lively-in');reveal.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -35px'});
    lively.forEach((item,index)=>{item.style.setProperty('--reveal-order',index%6);reveal.observe(item)});
  }
  document.querySelectorAll('.area,.portfolio-card,.families > a').forEach(card=>card.addEventListener('pointermove',event=>{
    const box=card.getBoundingClientRect();
    card.style.setProperty('--pointer-x',`${event.clientX-box.left}px`);
    card.style.setProperty('--pointer-y',`${event.clientY-box.top}px`);
  }));
})();

// Design-system progression is an enhancement: sections remain visible unless
// the observer has been installed successfully, and reduced-motion skips it.
(function(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const reveal=[...document.querySelectorAll('.ds-section,.ds-feature')];
  reveal.forEach(item=>item.classList.add('ds-reveal'));
  document.body.classList.add('ds-motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.08,rootMargin:'0px 0px -24px'});
  reveal.forEach(item=>observer.observe(item));
  document.querySelectorAll('.ds-diagram').forEach(diagram=>{
    diagram.querySelectorAll('svg path').forEach(path=>{if(!path.closest('defs'))path.setAttribute('data-signal','')});
    const signalObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){diagram.classList.add('is-active');signalObserver.disconnect()}}),{threshold:.25});
    signalObserver.observe(diagram);
  });
})();

// Follow the visible product section without taking control of page scrolling.
(function(){
  const nav=document.querySelector('.ds-product-nav');
  if(!nav||!('IntersectionObserver' in window))return;
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const sections=links.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
  if(!sections.length)return;
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    links.forEach(link=>{if(link.hash===`#${visible.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  },{rootMargin:'-18% 0px -68% 0px',threshold:[0,.25,.5]});
  sections.forEach(section=>observer.observe(section));
})();

// A restrained hero light uses one animation-frame update at a time.
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const hero=document.querySelector('.ds-hero-light');
  if(!hero||matchMedia('(hover: none)').matches)return;
  let x=.75,y=.45,px=0,py=0,frame=0;
  hero.addEventListener('pointermove',event=>{
    const box=hero.getBoundingClientRect();x=(event.clientX-box.left)/box.width*100;y=(event.clientY-box.top)/box.height*100;px=((event.clientX-box.left)/box.width-.5)*8;py=((event.clientY-box.top)/box.height-.5)*5;
    if(frame)return;frame=requestAnimationFrame(()=>{hero.style.setProperty('--light-x',`${x}%`);hero.style.setProperty('--light-y',`${y}%`);hero.style.setProperty('--hero-x',`${px}px`);hero.style.setProperty('--hero-y',`${py}px`);frame=0});
  },{passive:true});
})();

(function(){
  const meter=document.createElement('div');
  meter.className='scroll-meter';meter.setAttribute('aria-hidden','true');document.body.appendChild(meter);
  let scheduled=false;
  const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;meter.style.setProperty('--scroll-progress',max>0?String(scrollY/max):'0');scheduled=false};
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
  addEventListener('resize',update,{passive:true});update();
  document.querySelectorAll('.portfolio-card').forEach(card=>{
    const mark=document.createElement('span');mark.className='card-circuit';mark.setAttribute('aria-hidden','true');mark.innerHTML='<i></i><i></i><i></i>';
    card.prepend(mark);
  });
})();

(function(){
  const focus=document.querySelector('[data-hero-focus]');
  if(focus){
    const output=focus.querySelector('.focus-output'),title=focus.querySelector('.focus-title'),link=focus.querySelector('.focus-link'),buttons=[...focus.querySelectorAll('[data-focus]')];
    const content={
      storage:{title:'Persistent storage',text:'Predictable persistence for configuration, telemetry and small structured data.',label:'Explore LOX DB',href:'projects/loxdb.html'},
      recovery:{title:'Recovery & lifecycle',text:'Explicit restart, checkpoint and update paths for systems that must handle interruption.',label:'Explore LOX Boot',href:'projects/loxboot.html'},
      diagnostics:{title:'Diagnostics & evidence',text:'Bounded logs, alarms and crash records that help explain what happened.',label:'Explore panicdump',href:'projects/panicdump.html'},
      communication:{title:'Embedded communication',text:'Protocol and network components designed around constrained devices and explicit limits.',label:'Explore µMesh',href:'projects/umesh.html'},
      control:{title:'Deterministic control',text:'Small, explicit primitives for state, scheduling and repeatable decisions in portable C.',label:'Explore Axiom One',href:'projects/axiom-one.html'}
    };
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const selected=button.dataset.focus,entry=content[selected];
      if(!entry)return;
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      focus.dataset.active=selected;title.textContent=entry.title;output.textContent=entry.text;
      link.href=entry.href;link.firstChild.textContent=`${entry.label} `;
    }));
  }
  document.querySelectorAll('[data-count]').forEach(counter=>{
    const target=Number(counter.dataset.count)||0,draw=()=>{const started=performance.now(),duration=650;const tick=now=>{counter.textContent=String(Math.min(target,Math.round(target*((now-started)/duration))));if(now-started<duration)requestAnimationFrame(tick)};requestAnimationFrame(tick)};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))counter.textContent=String(target);else{const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){draw();observer.disconnect()}},{threshold:.4});observer.observe(counter)}
  });
})();

(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rocket=document.querySelector('[data-rocket-launch]');
  if(rocket){
    const launch=()=>{rocket.classList.remove('launched');void rocket.offsetWidth;rocket.classList.add('launched')};
    rocket.addEventListener('click',launch);
    if(!reduced)setTimeout(launch,650);
  }
  document.querySelectorAll('.button').forEach(button=>button.addEventListener('pointerdown',event=>{
    const ripple=document.createElement('i'),box=button.getBoundingClientRect();
    ripple.className='button-ripple';ripple.style.left=`${event.clientX-box.left}px`;ripple.style.top=`${event.clientY-box.top}px`;
    button.appendChild(ripple);ripple.addEventListener('animationend',()=>ripple.remove());
  }));
})();
