/************ LANGUAGE STRINGS *************/
const langText = {
  en:{ title:"Auto Calculator", total:"Total:", clear:"Clear", reset:"Reset All", save:"Save", apply:"Apply",
       final:"Final:", multiplierPlaceholder:"Enter multiplier", history:"History", value:"Value" },
  gu:{ title:"ઓટો કેલ્ક્યુલેટર", total:"કુલ:", clear:"સાફ કરો", reset:"બધું રીસેટ", save:"સેવ કરો", apply:"લાગુ કરો",
       final:"ફાઇનલ:", multiplierPlaceholder:"ગુણાક દાખલ કરો", history:"હિસ્ટ્રી", value:"વેલ્યુ" },
  hi:{ title:"ऑटो कैलकुलेटर", total:"कुल:", clear:"साफ करें", reset:"सब रीसेट", save:"सेव", apply:"लागू करें",
       final:"फाइनल:", multiplierPlaceholder:"गुणक दर्ज करें", history:"हिस्ट्री", value:"वैल्यू" }
};

let currentLang="en";

/******** INPUTS *********/
let inputs=[];
const container=document.getElementById("inputsContainer");

for(let i=1;i<=30;i++){
  let inp=document.createElement("input");
  inp.placeholder="Value "+i;
  inp.className="line-input";
  inp.oninput=()=>{ formatInput(inp); calculateDayTotal(); autoSave(); };
  container.appendChild(inp);
  inputs.push(inp);
}

/******** FORMAT *********/
function formatIndian(x){
  x=x.toString();
  let after="";
  if(x.includes(".")){
    after="."+x.split(".")[1];
    x=x.split(".")[0];
  }
  let last3=x.slice(-3);
  let rest=x.slice(0,-3);
  if(rest!=="") last3=","+last3;
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g,",")+last3+after;
}

function formatInput(inp){
  let v=inp.value.replace(/,/g,"");
  if(v===""||isNaN(v)) return;
  inp.value=formatIndian(v);
}

/******** TOTAL *********/
function calculateDayTotal(){
  let sum=0;
  inputs.forEach(i=>{
    let v=parseFloat(i.value.replace(/,/g,""));
    if(!isNaN(v)) sum+=v;
  });
  document.getElementById("dayTotal").textContent=formatIndian(sum);
  return sum;
}

/******** MULTIPLIER *********/
let historyTotalSum=0;

function applyMultiplier(){
  let m=parseFloat(document.getElementById("multiplierInput").value);
  if(isNaN(m)) return;
  let final=historyTotalSum*m;
  document.getElementById("finalBox").textContent=
    langText[currentLang].final+" "+formatIndian(final);
  autoSave();
}

/******** HISTORY *********/
let history=JSON.parse(localStorage.getItem("calcHistory")||"[]");

function renderHistory(){
  let box=document.getElementById("historyBox");
  box.innerHTML=`<h3>${langText[currentLang].history}</h3>`;
  historyTotalSum=0;

  history.forEach((h,i)=>{
    historyTotalSum+=parseFloat(h.total.replace(/,/g,""))||0;
    box.innerHTML+=`
      <div class="history-item">
        <div>
          <b>${h.date}</b><br>
          ${h.values}<br>
          Total: ${h.total}<br>
          Final: ${h.final}
        </div>
        <div class="del-btn" onclick="deleteHistory(${i})">X</div>
      </div>`;
  });

  document.getElementById("dayTotal").textContent=formatIndian(historyTotalSum);
}

function saveHistory(){
  let total=calculateDayTotal();
  if(total===0) return alert("Enter values first");
  let m=document.getElementById("multiplierInput").value||1;
  history.push({
    date:new Date().toLocaleString(),
    values:inputs.map(i=>i.value).filter(v=>v).join(" + "),
    total:formatIndian(total),
    final:formatIndian(total*m)
  });
  localStorage.setItem("calcHistory",JSON.stringify(history));
  renderHistory();
}

function deleteHistory(i){
  history.splice(i,1);
  localStorage.setItem("calcHistory",JSON.stringify(history));
  renderHistory();
}

/******** RESET *********/
function resetLines(){
  inputs.forEach(i=>i.value="");
  document.getElementById("dayTotal").textContent="0";
}

function resetEverything(){
  resetLines();
  history=[];
  localStorage.clear();
  document.getElementById("finalBox").textContent=langText[currentLang].final+" 0";
  renderHistory();
}

/******** LANGUAGE *********/
function changeLanguage(){
  currentLang=document.getElementById("langSelect").value;
  let t=langText[currentLang];
  document.getElementById("titleText").textContent=t.title;
  document.getElementById("totalLabel").textContent=t.total;
  document.getElementById("btnClear").textContent=t.clear;
  document.getElementById("btnReset").textContent=t.reset;
  document.getElementById("btnSave").textContent=t.save;
  document.getElementById("btnApply").textContent=t.apply;
  document.getElementById("multiplierInput").placeholder=t.multiplierPlaceholder;
  inputs.forEach((inp,i)=>inp.placeholder=t.value+" "+(i+1));
  renderHistory();
}

/******** AUTO SAVE *********/
function autoSave(){
  localStorage.setItem("autoCalcSave",JSON.stringify({
    inputs:inputs.map(i=>i.value),
    multiplier:document.getElementById("multiplierInput").value,
    final:document.getElementById("finalBox").textContent,
    lang:currentLang
  }));
}

(function(){
  let d=JSON.parse(localStorage.getItem("autoCalcSave")||"{}");
  if(d.inputs) inputs.forEach((i,n)=>i.value=d.inputs[n]||"");
  if(d.multiplier) document.getElementById("multiplierInput").value=d.multiplier;
  if(d.final) document.getElementById("finalBox").textContent=d.final;
  if(d.lang){
    currentLang=d.lang;
    document.getElementById("langSelect").value=currentLang;
    changeLanguage();
  }
  renderHistory();
})();
