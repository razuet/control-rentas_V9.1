const grid=document.getElementById('grid');
const reportBox=document.getElementById('report');
const now=new Date();
const monthName=now.toLocaleString('es-MX',{month:'long'});
const year=now.getFullYear();
const monthLabel=monthName.charAt(0).toUpperCase()+monthName.slice(1)+' '+year;
const monthKey=year+'-'+(now.getMonth()+1);
document.getElementById('monthLabel').textContent=monthLabel;

function formatMoney(value){
  if(!value) return '';
  return '$' + Number(value).toLocaleString('en-US', {maximumFractionDigits:0});
}

const allData=JSON.parse(localStorage.getItem('rentMonthly'))||{};
if(!allData[monthKey]){
  allData[monthKey]=Array.from({length:16}).map(()=>({tenant:'',amount:'',due:'',status:'Pendiente',notes:''}));
}
let data=allData[monthKey];

function save(){
  allData[monthKey]=data;
  localStorage.setItem('rentMonthly',JSON.stringify(allData));
}

function render(){
  grid.innerHTML='';
  data.forEach((unit,i)=>{
    const card=document.createElement('div');
    card.className='card';
    let statusClass='pendiente';
    if(unit.status==='Al día')statusClass='al-dia';
    if(unit.status==='Atrasado')statusClass='atrasado';
    if(unit.status==='Pago anticipado')statusClass='anticipado';

    const displayAmount = formatMoney(unit.amount);

    card.innerHTML=`
      <h3>Depto ${i+1}</h3>
      <div class="status ${statusClass}">${unit.status}</div>
      <input placeholder="Inquilino" value="${unit.tenant}">
      <input type="number" placeholder="Monto" value="${unit.amount}">
      <div class="monto-display">${displayAmount}</div>
      <input type="date" value="${unit.due}">
      <select>
        <option ${unit.status==='Al día'?'selected':''}>Al día</option>
        <option ${unit.status==='Pendiente'?'selected':''}>Pendiente</option>
        <option ${unit.status==='Atrasado'?'selected':''}>Atrasado</option>
        <option ${unit.status==='Pago anticipado'?'selected':''}>Pago anticipado</option>
      </select>
      <textarea placeholder="Observaciones">${unit.notes}</textarea>
    `;
    const inputs=card.querySelectorAll('input,textarea,select');
    inputs[0].oninput=e=>{data[i].tenant=e.target.value;save();};
    inputs[1].oninput=e=>{data[i].amount=e.target.value;save();render();};
    inputs[3].oninput=e=>{data[i].due=e.target.value;save();};
    inputs[4].onchange=e=>{data[i].status=e.target.value;save();render();};
    inputs[5].oninput=e=>{data[i].notes=e.target.value;save();};
    grid.appendChild(card);
  });
}

function generateReport(){
  let paid=0,early=0;
  let list=[];
  data.forEach((u,i)=>{
    const amt=parseFloat(u.amount)||0;
    if(u.status==='Al día')paid+=amt;
    if(u.status==='Pago anticipado')early+=amt;
    if(u.status==='Al día' || u.status==='Pago anticipado'){
      list.push({depto:i+1,name:u.tenant,amount:amt});
    }
  });

  const total = paid + early;
  list.sort((a,b)=>a.depto-b.depto);

  let listHtml='<h4>Pagos registrados</h4>';
  list.forEach(item=>{
    listHtml+=`
      <div class="item">
        <div><strong>Depto ${item.depto} – ${formatMoney(item.amount)}</strong></div>
        <div>${item.name||'Sin nombre'}</div>
      </div>
    `;
  });

  reportBox.innerHTML=`
    <h3>Reporte de ${monthLabel}</h3>
    <p>Pagado: ${formatMoney(paid)}</p>
    <p class="purple">Pago anticipado: ${formatMoney(early)}</p>
    <p class="total">Total: ${formatMoney(total)}</p>
    ${listHtml}
  `;

  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
}

function scrollToTop(){
  window.scrollTo({top:0,behavior:'smooth'});
}

render();