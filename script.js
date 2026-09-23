
const petToggle=document.getElementById('has-pet'),petFields=document.getElementById('pet-fields');
function syncPetFields(){
  if(!petToggle||!petFields)return;
  const on=petToggle.checked;
  petFields.hidden=!on;
  petFields.querySelectorAll('[data-pet-required]').forEach(el=>{el.required=on;});
  if(!on){petFields.querySelectorAll('input,textarea,select').forEach(el=>{el.value='';});}
}
if(petToggle&&petFields){petToggle.addEventListener('change',syncPetFields);syncPetFields();}

const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.site-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));}
const form=document.getElementById('stay-request-form');if(form){form.addEventListener('submit',async e=>{e.preventDefault();const status=document.getElementById('request-status');status.textContent='Submitting…';const data=Object.fromEntries(new FormData(form).entries());data.hasPet=form.elements.hasPet.checked;try{const r=await fetch('/api/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Unable to submit request.');status.textContent=j.message||'Your request has been received.';form.reset();syncPetFields();}catch(err){status.textContent=err.message;}});}