import {header,footer,path,t,sculpture} from './shared.js';
export function gallery(locale) {
  return `<div class="direction gallery">${header(locale)}<main>
    <section class="gallery-room" aria-labelledby="hero-title">
      <div class="gallery-intro"><span class="eyebrow">A STUDY IN SYSTEMS</span><h1 id="hero-title">Derek<br><em>Wang.</em></h1><p>${t(locale,'编写系统，<br>也保持好奇。','Building systems.<br>Staying curious.')}</p><span class="mono biography">MSCS @ USC<br>AGENT / BACKEND ENGINEERING</span><a class="gallery-about" href="${path(locale,'/about')}">${t(locale,'认识我','About me')} <span>↗</span></a></div>
      <div class="sculpture-space" data-parallax><span class="gallery-cross" aria-hidden="true">+</span>${sculpture()}<div class="sculpture-shadow"></div><div class="object-label mono"><span>OBJECT 001</span><span>CONTINUOUS / CONNECTED</span></div></div>
      <div class="gallery-margin mono"><span>FORM FOLLOWS CURIOSITY</span><span>2026</span></div>
    </section>
    <section class="exhibit" aria-label="${t(locale,'项目展签','Project exhibit')}"><div class="exhibit-controls"><span class="mono">${t(locale,'精选 / SELECTED WORK','SELECTED WORK')}</span><div class="project-switch" role="group" aria-label="${t(locale,'选择项目','Choose a project')}"><button data-project="calle" aria-pressed="true">01</button><button data-project="matrix" aria-pressed="false">02</button></div></div><div class="exhibit-detail" aria-live="polite"><span class="mono" data-project-type>VOICE AGENT / GOAL RUNTIME</span><h2 data-project-title>CALL-E</h2><p data-project-description>${t(locale,'面向长期目标的语音 Agent。让一次对话，成为持续执行的起点。','A voice agent for long-term goals. A conversation becomes a starting point for continued action.')}</p></div><a class="exhibit-open" data-project-link href="${path(locale,'/projects/call-e')}">${t(locale,'走进项目','Explore project')} <span>↗</span></a></section>
    </main>${footer(locale,'CODE AS PRACTICE. SYSTEMS AS FORM.')}</div>`;
}
export function bindGallery(stage, locale) {
  const projects={calle:['CALL-E','VOICE AGENT / GOAL RUNTIME',t(locale,'面向长期目标的语音 Agent。让一次对话，成为持续执行的起点。','A voice agent for long-term goals. A conversation becomes a starting point for continued action.'),'/projects/call-e'],matrix:['MATRIX','AI INTELLIGENCE / SIGNAL & CONTEXT',t(locale,'追踪 AI 进展与长期趋势。从可追溯的证据里，理解正在发生的变化。','AI developments and long-term trends. Understanding change through traceable evidence.'),'/projects/ai-intelligence']};
  stage.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    const p=projects[button.dataset.project];
    stage.querySelectorAll('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    stage.querySelector('[data-project-title]').textContent=p[0];
    stage.querySelector('[data-project-type]').textContent=p[1];
    stage.querySelector('[data-project-description]').textContent=p[2];
    stage.querySelector('[data-project-link]').href=path(locale,p[3]);
    stage.querySelector('.sculpture').classList.toggle('turned',button.dataset.project==='matrix');
  }));
}
