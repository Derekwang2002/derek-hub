import {header,footer,path,t,wave} from './shared.js';
export function editorial(locale) {
  return `<div class="direction editorial">${header(locale)}<main>
    <div class="edition mono"><span>${t(locale,'个人网站 / 工程、学习与记录','A PERSONAL INDEX / ENGINEERING & LEARNING')}</span><span>LOS ANGELES · 2026</span></div>
    <section class="editorial-hero" aria-labelledby="hero-title">
      <div class="editorial-name"><span class="eyebrow">COMPUTER SCIENCE & CURIOSITY</span><h1 id="hero-title">Derek<br><span>Wang<span class="period">.</span></span></h1><div class="name-note"><span class="asterisk" aria-hidden="true">✳</span><p>${t(locale,'把想法，做成系统。','Ideas, made into systems.')}<br><span>MSCS @ USC · Agent / Backend Engineering</span></p></div></div>
      <figure class="editorial-art" data-parallax><div class="art-corner mono">FIG. 01 / CONTINUITY</div>${wave()}<figcaption><span class="mono">01 — ∞</span><span>${t(locale,'在逻辑与想象之间','Between logic and imagination')}</span><span aria-hidden="true">↗</span></figcaption></figure>
    </section>
    <section class="editorial-index" aria-label="${t(locale,'探索网站','Explore the site')}"><div class="index-heading"><span class="mono">THE INDEX</span><p>${t(locale,'一些构建，<br>一些思考。','Things I build.<br>Things I think about.')}</p></div><a class="index-link" href="${path(locale,'/projects/call-e')}"><span class="mono">01 / BUILD</span><h2>CALL-E <span>↗</span></h2><p>${t(locale,'面向长期目标的语音 Agent','A voice agent for long-term goals')}</p></a><a class="index-link" href="${path(locale,'/projects/ai-intelligence')}"><span class="mono">02 / OBSERVE</span><h2>MATRIX <span>↗</span></h2><p>${t(locale,'追踪 AI 进展与长期趋势','AI developments and long-term trends')}</p></a><a class="index-link" href="${path(locale,'/notes')}"><span class="mono">03 / LEARN</span><h2>${t(locale,'学习笔记','Field notes')} <span>↗</span></h2><p>${t(locale,'把学到的东西，慢慢写清楚','Making sense of what I learn')}</p></a></section>
    </main>${footer(locale,'ENGINEERING, WITH A POINT OF VIEW.')}</div>`;
}
