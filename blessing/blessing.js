const teachings=[
 {q:"常保初發心，成道有餘。",g:"守住最初的善念，今日把一件應做的事踏實完成。"},
 {q:"修道要真修，辦道要真辦，行道要真行，成道要真成。",g:"真誠不在言語，而在每一次選擇與行動。"},
 {q:"以仁義為懷，講道德說仁義，倡仁行義。",g:"先從體諒身邊的人開始，讓仁義落實於日常。"},
 {q:"道就是命，德就是你做出來的。",g:"今日所行的一件善事，就是德性的累積。"},
 {q:"盡忠盡孝，立德立功立言。",g:"珍惜因緣、盡好本分，便是安定身心之道。"},
 {q:"心正則意誠，意誠則事成。",g:"放下紛擾，先把內心安住，再向前一步。"},
 {q:"慈悲沒有敵人，智慧不起煩惱。",g:"用柔和的心回應眼前的人事，轉念便有光明。"},
 {q:"莫以善小而不為，莫以惡小而為之。",g:"微小的善意也能成為別人今日的溫暖。"},
 {q:"知足常樂，能忍自安。",g:"感謝已經擁有的，心便寬廣而自在。"},
 {q:"日日是好日，步步起善念。",g:"不必等待完美時機，此刻就能重新開始。"},
 {q:"正己成人，涵養德行。",g:"先端正自己，再用榜樣成全他人。"},
 {q:"無怨無悔，犧牲奉獻。",g:"願意付出而不計較，生命自然充滿力量。"}
];
const screens=[...document.querySelectorAll(".screen")];
const show=id=>screens.forEach(s=>s.classList.toggle("active",s.id===id));
document.querySelectorAll(".choices button").forEach(btn=>btn.addEventListener("click",()=>{
  const name=btn.dataset.name;
  const portraitClass=[...btn.querySelector(".portrait").classList].find(c=>/^p\d$/.test(c));
  show("drawing");
  window.setTimeout(()=>{
    const item=teachings[Math.floor(Math.random()*teachings.length)];
    document.querySelector("#chosen-name").textContent=name+" 慈悲指引";
    const resultPortrait=document.querySelector("#seal");
    resultPortrait.textContent="";
    resultPortrait.className="seal result-portrait "+portraitClass;
    resultPortrait.setAttribute("aria-label",name+"畫像");
    document.querySelector("#quote").textContent="「"+item.q+"」";
    document.querySelector("#guidance").textContent=item.g;
    show("result");
  },2200);
}));
document.querySelector("#again").addEventListener("click",()=>show("choose"));
document.querySelector("#copy").addEventListener("click",async e=>{
  const text=document.querySelector("#chosen-name").textContent+"\n"+document.querySelector("#quote").textContent+"\n"+document.querySelector("#guidance").textContent;
  try{await navigator.clipboard.writeText(text);e.currentTarget.textContent="已複製";setTimeout(()=>e.currentTarget.textContent="複製慈語",1500)}catch{e.currentTarget.textContent="請長按文字複製"}
});

