import {
  chooseDownloadFormat,
  buildDownloadFilename,
  calculatePdfPageSize,
  getCardExportOptions,
  waitForImageReady,
} from './download-utils.mjs';

const teachings=[
 {q:"常保初發心，成道有餘。",g:"守住最初的善念，今日把一件應做的事踏實完成。",ge:"Hold on to your first sincere intention — complete one thing you should do today, step by step."},
 {q:"修道要真修，辦道要真辦，行道要真行，成道要真成。",g:"真誠不在言語，而在每一次選擇與行動。",ge:"Sincerity isn't in words, but in every choice and action you make."},
 {q:"以仁義為懷，講道德說仁義，倡仁行義。",g:"先從體諒身邊的人開始，讓仁義落實於日常。",ge:"Start by understanding those around you, and let benevolence show up in daily life."},
 {q:"道就是命，德就是你做出來的。",g:"今日所行的一件善事，就是德性的累積。",ge:"One good deed done today is virtue being built up."},
 {q:"盡忠盡孝，立德立功立言。",g:"珍惜因緣、盡好本分，便是安定身心之道。",ge:"Cherish the ties that bring people together and do your part well — that is the way to a settled heart."},
 {q:"心正則意誠，意誠則事成。",g:"放下紛擾，先把內心安住，再向前一步。",ge:"Let go of the noise, settle your heart first, then take the next step."},
 {q:"慈悲沒有敵人，智慧不起煩惱。",g:"用柔和的心回應眼前的人事，轉念便有光明。",ge:"Meet the people and events in front of you with a gentle heart; a change of thought brings light."},
 {q:"莫以善小而不為，莫以惡小而為之。",g:"微小的善意也能成為別人今日的溫暖。",ge:"Even a small kindness can be someone else's warmth today."},
 {q:"知足常樂，能忍自安。",g:"感謝已經擁有的，心便寬廣而自在。",ge:"Be grateful for what you already have, and your heart grows spacious and at ease."},
 {q:"日日是好日，步步起善念。",g:"不必等待完美時機，此刻就能重新開始。",ge:"You don't need to wait for the perfect moment — you can begin again right now."},
 {q:"正己成人，涵養德行。",g:"先端正自己，再用榜樣成全他人。",ge:"Straighten yourself first, then help others through your example."},
 {q:"無怨無悔，犧牲奉獻。",g:"願意付出而不計較，生命自然充滿力量。",ge:"Give without keeping score, and life naturally fills with strength."},
 {q:"修道先修心，心正則路自正。",g:"今日先安定內心，行事自然不偏方向。",ge:"Settle your heart first today, and your actions will naturally stay on course."},
 {q:"自性本來光明，莫讓脾氣遮蔽。",g:"脾氣一起，先深呼吸，讓本性重新透出光亮。",ge:"When temper rises, take a deep breath and let your true nature shine through again."},
 {q:"改毛病、去脾氣，就是每日的修行。",g:"找出今日最容易犯的一個習氣，練習放下它。",ge:"Notice the one habit you're most likely to slip into today, and practice letting it go."},
 {q:"真正的道場，就在自己的心中。",g:"不必外求，此刻安住當下，就是修行之地。",ge:"No need to look outward — settling into this moment is itself the place of practice."},
 {q:"修行不離生活，生活處處皆是功課。",g:"把眼前的小事當作修行，用心做好它。",ge:"Treat the small task in front of you as practice, and do it wholeheartedly."},
 {q:"無人看見之時，更要守住自己的良心。",g:"獨處時的選擇最能見真章，請對自己誠實。",ge:"What you choose when no one is watching reveals the most — be honest with yourself."},
 {q:"心清則智慧生，心靜則真理明。",g:"放下雜念片刻，讓心安靜下來聆聽自己。",ge:"Set aside stray thoughts for a moment and let your heart quiet down enough to listen to itself."},
 {q:"修道不是改變別人，而是先改變自己。",g:"想要別人改變之前，先問自己能先做什麼。",ge:"Before wishing others would change, ask what you can change first."},
 {q:"日日反省，日日革新，才能日日進步。",g:"今晚花五分鐘，回顧今天哪裡可以更好。",ge:"Tonight, spend five minutes reviewing where today could have been better."},
 {q:"認識自己的本性，才能找到真正的方向。",g:"靜下心問自己：什麼才是真正重要的事。",ge:"Quiet your mind and ask yourself: what truly matters?"},
 {q:"慈悲不是言語，而是真心為眾生著想。",g:"今天為身邊一個人設身處地想一想。",ge:"Today, put yourself in the shoes of someone close to you."},
 {q:"能體諒別人的苦，就是慈悲的開始。",g:"遇到讓你不耐煩的人，先想想他可能正在承受什麼。",ge:"When someone tests your patience, first consider what they might be going through."},
 {q:"打開自己的心，才能走進眾生的心。",g:"放下防備，真誠傾聽今天遇見的一個人。",ge:"Lower your guard and truly listen to one person you meet today."},
 {q:"不放棄任何一個人，就是菩薩的慈悲。",g:"對讓你失望的人，再給一次耐心與機會。",ge:"Give someone who disappointed you another chance, with patience."},
 {q:"渡人之前，先以自己的德行感動人。",g:"用今天的言行，讓人感受到善意而非說教。",ge:"Let today's words and actions show kindness, not lecturing."},
 {q:"真心待人，比千言萬語更有力量。",g:"少說一句道理，多做一件真心的事。",ge:"Say one less lecture, do one more sincere deed."},
 {q:"給人希望，就是為人點亮一盞心燈。",g:"對灰心的人說一句鼓勵的話。",ge:"Offer a word of encouragement to someone who feels discouraged."},
 {q:"看見別人的需要，便伸出自己的雙手。",g:"留意身邊誰正需要幫助，主動伸出手。",ge:"Notice who around you needs help, and reach out first."},
 {q:"慈悲沒有分別心，對人人皆存善念。",g:"對陌生人與熟人，一樣保持溫和的態度。",ge:"Stay just as gentle with strangers as you are with people you know."},
 {q:"自己得明白，也要幫助別人離苦得樂。",g:"把自己領悟的道理，用溫和的方式分享出去。",ge:"Share what you've come to understand, gently, with others."},
 {q:"愿有多大，生命的力量就有多大。",g:"重新想一想自己當初許下的心愿。",ge:"Take a moment to recall the vow you first made."},
 {q:"莫忘初發心，修辦之路才能走得長遠。",g:"疲累時，回想最初為何出發。",ge:"When you're tired, remember why you set out in the first place."},
 {q:"有愿就有力量，有心就有道路。",g:"心中有目標，眼前的難關自然有方法。",ge:"With a clear goal in your heart, a way through the present difficulty will appear."},
 {q:"愿不是說給上天聽，而是做給自己看。",g:"把心中的愿，化成今天一個具體的行動。",ge:"Turn the vow in your heart into one concrete action today."},
 {q:"今天能修道是福氣，能辦道更是愿力。",g:"珍惜今天能付出的機會，別讓它白白流過。",ge:"Treasure today's chance to give — don't let it slip by."},
 {q:"認定正確的方向，就不要輕易退轉。",g:"遇到動搖時，重新確認自己相信的方向。",ge:"When you waver, reaffirm the direction you believe in."},
 {q:"一念真心發出，便要一生守護。",g:"對曾經許下的承諾，今天再堅持一次。",ge:"Hold to a promise you once made — once more today."},
 {q:"遇到困難時，更要想起當初的愿心。",g:"卡關的時候，問自己：初心還在嗎。",ge:"When you're stuck, ask yourself: is my original intention still there?"},
 {q:"愿立於心，更要落實於行。",g:"挑一件擱置已久的心愿，今天往前推一步。",ge:"Pick a long-delayed wish and push it one step forward today."},
 {q:"一生能完成自己的誓愿，便是不留遺憾。",g:"想想此生最想完成的一件事，開始行動。",ge:"Think of the one thing you most want to accomplish in this life, and begin."},
 {q:"天職不是名位，而是一份責任。",g:"把手邊的職責當成責任而非光環來看待。",ge:"See the duty in front of you as a responsibility, not a badge of honor."},
 {q:"有使命的人，更應謙卑而行。",g:"越受人肯定，越要提醒自己保持謙虛。",ge:"The more you're recognized, the more you should remind yourself to stay humble."},
 {q:"能承擔，就是成長的開始。",g:"主動接下一件別人不願承擔的事。",ge:"Volunteer for something others are reluctant to take on."},
 {q:"在自己的位置上盡心，就是了愿。",g:"把眼前的角色做到盡心，就是修行。",ge:"Doing your current role wholeheartedly is itself practice."},
 {q:"事情來時勇於擔當，事情過後不居其功。",g:"事情做完後，把功勞留給團隊而非自己。",ge:"After finishing a task, credit the team rather than yourself."},
 {q:"職責無大小，盡心便有功德。",g:"不論任務大小，都用同樣的認真去完成。",ge:"Whether the task is big or small, complete it with the same care."},
 {q:"肩負使命，不是為自己，而是為眾生。",g:"做事前想一想，這件事能幫助到誰。",ge:"Before you act, think about who this can help."},
 {q:"真正的領導，是先要求自己。",g:"想要求別人做到之前，先檢視自己是否做到。",ge:"Before asking others to meet a standard, check whether you've met it yourself."},
 {q:"做得越多，心要越低。",g:"貢獻越多的時候，越要提醒自己放低身段。",ge:"The more you contribute, the more you should remind yourself to stay humble."},
 {q:"天職珍貴，更應以德性來承擔。",g:"用品德而非能力，來衡量自己是否配得上這份責任。",ge:"Measure whether you're worthy of a responsibility by character, not just ability."},
 {q:"人與人相處，就是修行最好的考場。",g:"把今天一次不愉快的相處，當成修心的機會。",ge:"Turn one unpleasant interaction today into a chance to train the heart."},
 {q:"能容別人的不同，才能擴大自己的心量。",g:"遇到與自己不同的意見，先試著理解而非反駁。",ge:"When you meet an opinion different from yours, try to understand it before arguing back."},
 {q:"少看別人的不是，多反省自己的不足。",g:"想批評別人之前，先檢查自己有沒有同樣的問題。",ge:"Before criticizing someone, check whether you share the same flaw."},
 {q:"別人對不起我，我仍不可對不起良心。",g:"就算受了委屈，也不用不對的方式回應。",ge:"Even when wronged, don't respond in the wrong way."},
 {q:"不把怨恨留在心中，就是放過自己。",g:"放下一件心裡的舊怨，讓自己輕鬆一點。",ge:"Let go of one old grudge and give yourself some ease."},
 {q:"相聚是緣，更要懂得彼此珍惜。",g:"對今天相處的人，多一份感謝與珍惜。",ge:"Feel a little more gratitude and appreciation for the people you're with today."},
 {q:"多一分體諒，就少一分爭執。",g:"爭執前先深呼吸，換個角度體諒對方。",ge:"Before an argument, take a breath and try to see it from the other side."},
 {q:"合作不是要求別人配合我，而是彼此成全。",g:"合作時多問對方需要什麼，而非只想著自己。",ge:"When collaborating, ask more about what others need instead of only thinking of yourself."},
 {q:"修道人要化解成見，不增加對立。",g:"遇到意見不合，先找共同點而非放大差異。",ge:"When opinions clash, look for common ground before magnifying the differences."},
 {q:"心量有多大，能成就的事情就有多大。",g:"練習把心放寬一點，能容納的人事也會變多。",ge:"Practice widening your heart, and it will hold more people and more things."},
 {q:"常懷感恩，煩惱自然減少。",g:"今天寫下三件值得感謝的小事。",ge:"Write down three small things you're grateful for today."},
 {q:"知恩的人，才懂得報恩。",g:"想一想誰曾幫助過你，找機會表達謝意。",ge:"Think of someone who once helped you, and find a chance to say thank you."},
 {q:"一切順境逆境，都可以成為我的老師。",g:"把今天遇到的困難，當成一次學習的機會。",ge:"Treat a difficulty you face today as a chance to learn."},
 {q:"有人教導，要懂得珍惜；有人提醒，要懂得感謝。",g:"被提醒或糾正時，先說一聲謝謝而非辯解。",ge:"When corrected or reminded, say thank you first instead of explaining yourself."},
 {q:"越有能力，越要保持謙虛。",g:"做得好的時候，提醒自己還有進步空間。",ge:"When things go well, remind yourself there's still room to grow."},
 {q:"空杯才能再裝水，謙卑才能再學習。",g:"放下「我已經懂了」的心態，重新學習一次。",ge:"Set aside the thought 'I already know this' and learn it again."},
 {q:"不自滿，智慧才有成長的空間。",g:"對自己熟悉的事，保持一點初學者的好奇心。",ge:"Keep a beginner's curiosity even about things you know well."},
 {q:"得到幫助要感恩，有能力更要幫助別人。",g:"曾受過的幫助，找機會轉而幫助別人。",ge:"Pass on help you once received by helping someone else."},
 {q:"所有成就，都不是自己一人的功勞。",g:"想到今天的成果時，記得感謝背後幫忙的人。",ge:"When you think of today's achievement, remember to thank those who helped behind the scenes."},
 {q:"心存天恩師德，更要以實際行動報恩。",g:"把感恩化為行動，而不只是放在心裡。",ge:"Turn gratitude into action, not just a feeling kept inside."},
 {q:"修道不是沒有困難，而是不被困難打倒。",g:"遇到難關時，提醒自己這只是過程而非終點。",ge:"When facing a hard time, remind yourself it's only a stage, not the end."},
 {q:"逆境來時，正是磨煉心性的機會。",g:"把眼前的挫折，當作一次磨練心性的練習。",ge:"Treat the setback in front of you as practice for tempering your character."},
 {q:"愈是艱難，愈要守住初衷。",g:"事情越難的時候，越要記得自己為何開始。",ge:"The harder things get, the more you should remember why you started."},
 {q:"事情來了盡心做，事情過了不掛心。",g:"做完一件事後，練習放下不再反覆掛念。",ge:"After finishing something, practice letting it go instead of dwelling on it."},
 {q:"不怕路遠，只怕自己停下腳步。",g:"今天再往目標邁出一小步，不求快只求不停。",ge:"Take one more small step toward your goal today — not fast, just without stopping."},
 {q:"精進不是一時勇猛，而是長久不退。",g:"選一件小事，練習每天持續而非三分鐘熱度。",ge:"Pick one small thing and practice doing it daily, rather than a burst of enthusiasm that fades."},
 {q:"忍得過一時，智慧便增長一分。",g:"想發脾氣時，先忍一口氣，讓智慧有機會出現。",ge:"When you're about to lose your temper, hold back a breath and give wisdom a chance to appear."},
 {q:"每一次考驗，都可以成為成長的階梯。",g:"把眼前的考驗，當成墊高自己的一階。",ge:"Treat the test in front of you as a step that raises you higher."},
 {q:"跌倒不可怕，失去愿心才真正可惜。",g:"失敗了沒關係，別讓它澆熄你原本的心愿。",ge:"It's okay to fail — just don't let it extinguish the vow you started with."},
 {q:"像逆流而上的魚，再艱難也莫忘回家的方向。",g:"再累也別忘記，自己最初想回到的地方。",ge:"However tired you are, don't forget the place you originally wanted to return to."},
 {q:"功德不是求來的，而是在付出中累積。",g:"今天做一件不求回報的小事。",ge:"Do one small thing today without expecting anything in return."},
 {q:"真布施，是做了之後不放在心上。",g:"幫助別人後，練習不再提起、不掛心。",ge:"After helping someone, practice not bringing it up again or dwelling on it."},
 {q:"為眾生付出，不計較自己得到多少。",g:"付出的時候，先別急著算得失。",ge:"When giving, don't rush to calculate gains and losses."},
 {q:"能讓別人得到利益，就是自己的福氣。",g:"想一想今天能為誰帶來一點好處。",ge:"Think about who you can bring a little benefit to today."},
 {q:"做善事不要等待，有機會便去做。",g:"想到一件該做的好事，現在就去做，別等以後。",ge:"When a good deed comes to mind, do it now — don't wait for later."},
 {q:"多做一分，少計較一分，心就自在一分。",g:"少計較一點得失，心會輕鬆很多。",ge:"Worry a little less about gains and losses, and your heart will feel much lighter."},
 {q:"無為的付出，最能顯出真心。",g:"做一件好事，不必讓人知道是你做的。",ge:"Do a good deed without needing anyone to know it was you."},
 {q:"生命的價值，在於曾為多少人帶來光明。",g:"想想自己今天能為誰帶來一點溫暖。",ge:"Think about who you can bring a little warmth to today."},
 {q:"行功立德要從日常小事做起。",g:"從今天一件微不足道的小事開始累積。",ge:"Start building from one seemingly insignificant thing today."},
 {q:"自己有一盞燈，更要為別人點燈。",g:"把自己擁有的美好，分享給需要的人。",ge:"Share the good things you have with someone who needs them."},
 {q:"修道人先把人做好，道才有根基。",g:"先把身邊該盡的本分做好，再談其他。",ge:"Fulfill the duties right in front of you first, before anything else."},
 {q:"孝不只在供養，更要讓父母安心。",g:"今天打通電話，讓父母知道你一切安好。",ge:"Call your parents today and let them know you're doing well."},
 {q:"對父母有敬、有順，才是真正的孝。",g:"對父母的叮嚀，多一份耐心與尊重。",ge:"Meet your parents' reminders with a little more patience and respect."},
 {q:"沒有人看見時仍守道德，才是真君子。",g:"獨自一人時，也用同樣的標準要求自己。",ge:"Hold yourself to the same standard even when you're alone."},
 {q:"不耍心機、不用手段，守住坦蕩良心。",g:"遇到誘惑時，選擇比較誠實但踏實的那條路。",ge:"When tempted, choose the more honest, solid path."},
 {q:"說到就要做到，承諾就要守信。",g:"檢查今天有沒有一句話沒有兌現。",ge:"Check whether there's a promise today you haven't kept."},
 {q:"有禮、有讓，才能顯出修行人的風範。",g:"在爭執前，先讓一步試試看。",ge:"Before an argument, try yielding a step first."},
 {q:"德性不是講出來的，而是行為中自然流露。",g:"用行動證明品德，而不只是用言語。",ge:"Prove your character through action, not just words."},
 {q:"做事存忠信，待人存仁厚。",g:"今天做事多一分負責，待人多一分寬厚。",ge:"Be a little more responsible in your work today, and a little more generous with people."},
 {q:"品德建立在每一個不起眼的小選擇中。",g:"留意今天一個看似微小卻能顯出品格的選擇。",ge:"Notice one small choice today that quietly reveals your character."},
 {q:"同心才能走遠，同德才能成事。",g:"團隊合作時，先求彼此心意相通。",ge:"In teamwork, seek to understand each other's hearts first."},
 {q:"修辦不是一個人的事，而是眾人的愿。",g:"記得自己不是孤軍奮戰，還有夥伴同行。",ge:"Remember you're not fighting alone — there are companions walking with you."},
 {q:"分工不分心，各盡其職就是團結。",g:"把自己份內的事做好，就是對團隊最大的支持。",ge:"Doing your own part well is the greatest support you can give the team."},
 {q:"道場事情有多有少，盡自己一份心即可。",g:"不論分配到多少任務，都盡力做好就好。",ge:"Whatever task you're given, just do your best with it."},
 {q:"不比較誰做得多，只問自己是否盡心。",g:"停止和別人比較，只問自己有沒有盡力。",ge:"Stop comparing yourself to others; just ask whether you gave your best."},
 {q:"前人開路，後學更要珍惜並繼續向前。",g:"感謝前人鋪的路，並把它繼續延伸下去。",ge:"Be grateful for the path those before you paved, and carry it further."},
 {q:"承上啟下，是一份感恩，也是一份責任。",g:"把前人交付的心意，好好傳承給下一代。",ge:"Pass on faithfully what those before you entrusted to you."},
 {q:"以道為親，以德相聚，以愿同行。",g:"珍惜因共同信念而相聚的每一份緣。",ge:"Cherish every bond formed through a shared belief."},
 {q:"讓自己成為一盞燈，也讓更多人找到光明。",g:"用自己的言行，成為別人黑暗中的一點光。",ge:"Let your words and actions become a point of light in someone else's darkness."},
 {q:"一代接一代守住愿心，讓聖業與慧命永續流傳。",g:"想一想自己能為下一代留下什麼。",ge:"Think about what you can leave behind for the next generation."}
];
const screens=[...document.querySelectorAll(".screen")];
const show=id=>screens.forEach(s=>s.classList.toggle("active",s.id===id));
const portraitPositions={p1:"0% 0%",p2:"33.333% 0%",p3:"66.667% 0%",p4:"100% 0%",p5:"0% 100%",p6:"33.333% 100%",p7:"66.667% 100%",p8:"100% 100%"};
const newPortraits={n1:"baishui-shengdi-v1.jpg",n2:"buxiuxi-pusa-v1.jpg",n3:"jesus-christ-v1.jpg",n4:"virgin-mary-v1.jpg"};
function portraitBg(name,portraitClass){
  const isRenyi=name==="仁義大仙";
  const isNew=/^n/.test(portraitClass);
  const src=isRenyi?'images/renyi-daxian-v1.jpg?v=20260812-2':isNew?`images/${newPortraits[portraitClass]}?v=20260812-1`:'images/eight-immortals-v3.jpg?v=20260812-5';
  const image=`url("${src}")`;
  const position=isRenyi||isNew?"center":portraitPositions[portraitClass];
  const size=isRenyi||isNew?"cover":"400% 200%";
  return{image,position,size,src,isSprite:!isRenyi&&!isNew};
}
let currentName=null,currentItem=null,currentPortraitClass=null;
const choices=document.querySelector(".choices");
const shuffled=[...choices.children];
for(let i=shuffled.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
}
shuffled.forEach(choice=>choices.appendChild(choice));
document.querySelectorAll(".choices button").forEach(btn=>btn.addEventListener("click",()=>{
  const name=btn.dataset.name;
  const portraitClass=[...btn.querySelector(".portrait").classList].find(c=>/^[pn]\d$/.test(c));
  show("drawing");
  window.setTimeout(()=>{
    const item=teachings[Math.floor(Math.random()*teachings.length)];
    currentName=name;currentItem=item;currentPortraitClass=portraitClass;
    document.querySelector("#chosen-name").textContent=name+" 慈悲指引";
    const resultPortrait=document.querySelector("#seal");
    resultPortrait.textContent="";
    resultPortrait.className="seal result-portrait "+portraitClass;
    const bg=portraitBg(name,portraitClass);
    resultPortrait.style.setProperty("background-image",bg.image,"important");
    resultPortrait.style.backgroundPosition=bg.position;
    resultPortrait.style.backgroundSize=bg.size;
    resultPortrait.setAttribute("aria-label",name+"畫像");
    document.querySelector("#quote").textContent="「"+item.q+"」";
    document.querySelector("#guidance").textContent=item.g;
    document.querySelector("#guidance-en").textContent=item.ge;
    show("result");
  },2200);
}));
document.querySelector("#again").addEventListener("click",()=>show("choose"));

function renderDownloadCard(){
  if(!currentItem)return;
  const bg=portraitBg(currentName,currentPortraitClass);
  document.querySelector("#download-card").innerHTML=`
    <div class="dc-top">
      <div>
        <p class="dc-kicker">崇德仁義 · 今日慈語</p>
        <h2 class="dc-title">${currentName} 慈悲指引</h2>
      </div>
      <span class="dc-portrait ${bg.isSprite?`dc-sprite ${currentPortraitClass}`:"dc-single"}"><img src="${bg.src}" alt=""></span>
    </div>
    <section class="dc-section dc-quote"><p>「${currentItem.q}」</p></section>
    <section class="dc-section">
      <p class="dc-text">${currentItem.g}</p>
      <p class="dc-text-en">${currentItem.ge}</p>
    </section>
    <div class="dc-foot">此頁旨在靜心自省與善念提醒，慈語不作占卜或重大決策依據。</div>`;
}
function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function canvasToBlob(canvas,type="image/png",quality=1){
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Canvas export failed")),type,quality);
  });
}
async function downloadBlessingCard(){
  if(!currentItem)return;
  const button=document.querySelector("#download-btn");
  const originalText="下載慈語卡片";
  button.disabled=true;
  button.textContent="正在製作卡片…";
  try{
    renderDownloadCard();
    if(document.fonts?.ready)await document.fonts.ready;
    await waitForImageReady(document.querySelector("#download-card .dc-portrait img"));
    if(!window.html2canvas)throw new Error("html2canvas is unavailable");
    const format=chooseDownloadFormat({
      userAgent:navigator.userAgent,
      maxTouchPoints:navigator.maxTouchPoints||0,
      innerWidth:window.innerWidth,
    });
    const exportOptions=getCardExportOptions(format);
    const card=document.querySelector("#download-card");
    const canvas=await window.html2canvas(card,{backgroundColor:"#fffaf0",scale:exportOptions.scale,useCORS:true,logging:false});
    const filename=buildDownloadFilename(currentName,format);
    if(format==="png"){
      const blob=await canvasToBlob(canvas,exportOptions.canvasMimeType,1);
      downloadBlob(blob,filename);
    }else{
      const jsPDF=window.jspdf?.jsPDF;
      if(!jsPDF)throw new Error("jsPDF is unavailable");
      const {width,height,orientation}=calculatePdfPageSize(canvas.width,canvas.height);
      const pdf=new jsPDF({orientation,unit:"px",format:[width,height],hotfixes:["px_scaling"]});
      const image=canvas.toDataURL(exportOptions.canvasMimeType);
      pdf.addImage(image,exportOptions.pdfImageFormat,0,0,width,height,undefined,"FAST");
      pdf.save(filename);
    }
    button.textContent="已產生下載";
    setTimeout(()=>{button.disabled=false;button.textContent=originalText;},1400);
  }catch(err){
    console.error(err);
    button.disabled=false;
    button.textContent="下載失敗，請再試一次";
    setTimeout(()=>button.textContent=originalText,1800);
  }
}
document.querySelector("#download-btn").addEventListener("click",downloadBlessingCard);
if(new URLSearchParams(location.search).get("debugIdx")!==null){
  const idx=Number(new URLSearchParams(location.search).get("debugIdx"));
  currentName="彌勒祖師";currentItem=teachings[idx];currentPortraitClass="p1";
  document.querySelector("#chosen-name").textContent=currentName+" 慈悲指引";
  document.querySelector("#quote").textContent="「"+currentItem.q+"」";
  document.querySelector("#guidance").textContent=currentItem.g;
  document.querySelector("#guidance-en").textContent=currentItem.ge;
  const bg=portraitBg(currentName,currentPortraitClass);
  const seal=document.querySelector("#seal");
  seal.className="seal result-portrait "+currentPortraitClass;
  seal.style.setProperty("background-image",bg.image,"important");
  seal.style.backgroundPosition=bg.position;seal.style.backgroundSize=bg.size;
  show("result");
}
