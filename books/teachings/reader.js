import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const params=new URLSearchParams(location.search);
const file=params.get('file')||'chongde-origin.pdf';
const title=params.get('title')||'崇德佛堂由來';
document.title=`${title}｜翻頁閱讀`;
document.querySelector('#bookTitle').textContent=title;
document.querySelector('#downloadLink').href=file;

const canvas=document.querySelector('#pageCanvas');
const ctx=canvas.getContext('2d');
const book=document.querySelector('#book');
const loading=document.querySelector('#loading');
const pageInput=document.querySelector('#pageInput');
let pdf=null,current=1,zoom=1,renderTask=null,touchX=0;

async function renderPage(pageNo,center=true){
  if(!pdf)return;
  current=Math.max(1,Math.min(pdf.numPages,pageNo));
  pageInput.value=current;
  document.querySelector('#prev').disabled=current===1;
  document.querySelector('#next').disabled=current===pdf.numPages;
  loading.classList.remove('hidden');
  if(renderTask)try{renderTask.cancel()}catch{}
  const page=await pdf.getPage(current);
  const base=page.getViewport({scale:1});
  const availableH=Math.max(300,book.clientHeight-24);
  const availableW=Math.max(240,book.clientWidth-24);
  const fit=Math.min(availableW/base.width,availableH/base.height);
  const viewport=page.getViewport({scale:fit*zoom});
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.floor(viewport.width*dpr);canvas.height=Math.floor(viewport.height*dpr);
  canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
  renderTask=page.render({canvasContext:ctx,viewport,transform:[dpr,0,0,dpr,0,0]});
  try{await renderTask.promise}catch(error){if(error?.name!=='RenderingCancelledException')throw error}
  loading.classList.add('hidden');
  if(center){book.scrollLeft=Math.max(0,(book.scrollWidth-book.clientWidth)/2);book.scrollTop=Math.max(0,(book.scrollHeight-book.clientHeight)/2)}
}
function setZoom(value){zoom=Math.max(.75,Math.min(2.5,value));document.querySelector('#zoomLevel').textContent=`${Math.round(zoom*100)}%`;renderPage(current)}
document.querySelector('#prev').onclick=()=>renderPage(current-1);
document.querySelector('#next').onclick=()=>renderPage(current+1);
document.querySelector('#first').onclick=()=>renderPage(1);
pageInput.onchange=()=>renderPage(Number(pageInput.value));
document.querySelector('#zoomOut').onclick=()=>setZoom(zoom-.25);
document.querySelector('#zoomIn').onclick=()=>setZoom(zoom+.25);
document.querySelector('#zoomReset').onclick=()=>setZoom(1);
document.querySelector('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
addEventListener('keydown',event=>{if(event.key==='ArrowLeft')renderPage(current-1);if(event.key==='ArrowRight')renderPage(current+1);if(event.key==='+'||event.key==='=')setZoom(zoom+.25);if(event.key==='-')setZoom(zoom-.25);if(event.key==='0')setZoom(1)});
book.addEventListener('touchstart',event=>touchX=event.touches[0].clientX,{passive:true});
book.addEventListener('touchend',event=>{const distance=event.changedTouches[0].clientX-touchX;if(Math.abs(distance)>55)renderPage(current+(distance<0?1:-1))},{passive:true});
addEventListener('resize',()=>renderPage(current,false));
try{pdf=await pdfjsLib.getDocument(file).promise;document.querySelector('#pageCount').textContent=pdf.numPages;pageInput.max=pdf.numPages;await renderPage(1)}catch(error){loading.textContent='無法載入 PDF，請改用右上角下載。';console.error(error)}
