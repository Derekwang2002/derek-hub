export const path = (locale, route) => `${locale === 'zh' ? '/zh' : ''}${route}`;
export const t = (locale, zh, en) => locale === 'zh' ? zh : en;
export function header(locale, signature = 'DEREK WANG') {
  return `<header class="masthead"><a class="wordmark" href="${path(locale, '/')}">${signature}<span class="brand-dot">●</span></a><nav aria-label="${t(locale,'主导航','Main navigation')}"><a href="${path(locale,'/notes')}">${t(locale,'笔记','Notes')}</a><a href="${path(locale,'/blog')}">${t(locale,'文章','Writing')}</a><a href="${path(locale,'/projects')}">${t(locale,'项目','Projects')}</a><a href="${path(locale,'/hub/all')}">${t(locale,'资源','Resources')}</a><a href="${path(locale,'/about')}">${t(locale,'关于','About')}</a></nav><button class="locale" data-locale aria-label="${t(locale,'Switch to English','切换到中文')}">${locale === 'zh' ? 'EN' : '中文'} <span aria-hidden="true">↗</span></button></header>`;
}
export function footer(locale, label) {
  return `<footer class="colophon"><span>© 2026 Derek Wang</span><span>${label}</span><a href="https://github.com/Derekwang2002">GitHub ↗</a></footer>`;
}
export function wave() {
  let lines = '';
  for(let j=0;j<66;j++) {
    let points = [];
    for(let i=0;i<=130;i++) {
      const u=i/130, v=j/65;
      const x=35+u*590;
      const y=225+(v-.5)*195*Math.sin(u*Math.PI)+Math.sin(u*Math.PI*2+v*2.8)*96+Math.sin(u*Math.PI)*24;
      points.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    lines += `<path d="${points.join(' ')}"/>`;
  }
  return `<svg viewBox="0 0 660 450" aria-hidden="true" class="wave-art"><g fill="none" stroke="currentColor" stroke-width=".65">${lines}</g></svg>`;
}
export function sculpture() {
  let rings=[];
  for(let j=0;j<112;j++) {
    let theta=j/112*Math.PI*2, points=[];
    for(let i=0;i<=100;i++) {
      let phi=i/100*Math.PI*2;
      let radius=127+48*Math.cos(phi);
      let x=radius*Math.cos(theta), y=radius*Math.sin(theta), z=48*Math.sin(phi);
      let y1=y*Math.cos(.98)-z*Math.sin(.98), z1=y*Math.sin(.98)+z*Math.cos(.98);
      let x2=x*Math.cos(.56)+z1*Math.sin(.56), z2=-x*Math.sin(.56)+z1*Math.cos(.56);
      const scale=1.42+z2*.001;
      points.push(`${i?'L':'M'}${(320+x2*scale).toFixed(2)},${(305+y1*scale).toFixed(2)}`);
    }
    rings.push({depth:Math.sin(theta),d:points.join(' ')});
  }
  rings.sort((a,b)=>a.depth-b.depth);
  return `<svg viewBox="0 0 640 610" aria-hidden="true" class="sculpture"><defs><radialGradient id="ink"><stop stop-color="#213a31"/><stop offset="1" stop-color="#14271f"/></radialGradient></defs><g>${rings.map(r=>`<path d="${r.d}" fill="none" stroke="${r.depth<0?'#657667':'#d5d7b7'}" stroke-width="1.3"/>`).join('')}</g></svg>`;
}
