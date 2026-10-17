import {editorial} from './editorial.js';
import {gallery,bindGallery} from './gallery.js';
import {notebook} from './notebook.js';
const variants=[editorial,gallery,notebook];
const stage=document.getElementById('stage');
const picker=document.querySelector('.proto-picker');
const highlight=picker.querySelector('.proto-picker-highlight');
const items=[...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
const replay=picker.querySelector('.proto-picker-replay');
let current=0;
let locale=new URLSearchParams(location.search).get('lang')==='en'?'en':'zh';
function moveHighlight(){const el=items[current];highlight.style.width=el.offsetWidth+'px';highlight.style.transform=`translateX(${el.offsetLeft}px)`;}
function mount(i,replaying=false){
  stage.innerHTML=variants[i](locale);
  document.documentElement.lang=locale==='zh'?'zh-CN':'en';
  if(replaying)stage.firstElementChild.classList.add('replay');
  stage.querySelector('[data-locale]').addEventListener('click',()=>{
    locale=locale==='zh'?'en':'zh';
    const url=new URL(location);url.searchParams.set('lang',locale);history.replaceState(null,'',url);mount(current);
  });
  if(i===1)bindGallery(stage,locale);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  stage.querySelectorAll('[data-parallax]').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse'||reduced.matches)return;
      const r=el.getBoundingClientRect();
      el.style.setProperty('--px',`${(e.clientX-r.left-r.width/2)*.015}px`);
      el.style.setProperty('--py',`${(e.clientY-r.top-r.height/2)*.015}px`);
    });
    el.addEventListener('pointerleave',()=>{el.style.removeProperty('--px');el.style.removeProperty('--py');});
  });
}
function setActive(i){
  if(i<0||i>=variants.length)i=0;
  current=i;
  items.forEach((el,j)=>{el.toggleAttribute('data-active',j===i);if(j===i)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
  moveHighlight();
  const url=new URL(location);url.searchParams.set('v',i+1);history.replaceState(null,'',url);
  mount(i);window.scrollTo(0,0);
}
items.forEach((el,i)=>el.addEventListener('click',()=>setActive(i)));
replay.addEventListener('click',()=>mount(current,true));
window.addEventListener('resize',moveHighlight);
document.addEventListener('keydown',e=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable)return;
  if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
  const num=parseInt(e.key,10);
  if(num>=1&&num<=variants.length){e.preventDefault();setActive(num-1);}
  else if(e.key==='ArrowRight'){e.preventDefault();setActive((current+1)%variants.length);}
  else if(e.key==='ArrowLeft'){e.preventDefault();setActive((current-1+variants.length)%variants.length);}
  else if(e.key==='r'||e.key==='R')mount(current,true);
});
setActive((parseInt(new URLSearchParams(location.search).get('v'),10)||1)-1);
requestAnimationFrame(()=>requestAnimationFrame(()=>picker.setAttribute('data-ready','')));
