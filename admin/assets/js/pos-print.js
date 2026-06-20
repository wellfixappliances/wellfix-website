/* ============================================================
 * WellFix POS — Print / Document engine (WFPrint)
 * A4 invoice · quotation · service bill · 80mm thermal · UPI QR
 * Pure client-side (browser print -> PDF). No backend needed.
 * Business details + template choice read from localStorage
 * key 'wf_pos_biz' (editable in POS Settings).
 * ============================================================ */
(function(global){
  'use strict';

  // Absolute origin so logos and QR resolve inside the print popup
  function base(){
    var b=(typeof POS_BASE!=='undefined'?POS_BASE:'/wellfix-website');
    return location.origin+b;
  }
  var BIZ_DEFAULT={
    name:'WellFix Appliances',
    tagline:'Sales & Service',
    address:'Thrissur, Kerala, India',
    phone:'8301879406',
    email:'wellfixappliances@gmail.com',
    gstin:'',
    upiId:'8301879406@ybl',
    upiName:'WellFix Appliances',
    bank:'',
    logo:'', // absolute or relative; falls back to brand asset
    tplInvoice:'classic',  // classic | modern | minimal
    tplThermal:'standard', // standard | compact | branded
    terms:'Goods once sold will be taken back / exchanged within 7 days with original bill. Warranty as per manufacturer.'
  };
  function biz(){
    var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){b={};}
    var m=Object.assign({},BIZ_DEFAULT,b);
    if(!m.logo)m.logo=base()+'/assets/images/brand/wellfix-logo-green.png';
    else if(m.logo.indexOf('http')!==0&&m.logo.indexOf('data:')!==0)m.logo=base()+m.logo;
    return m;
  }
  function saveBiz(patch){var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){}Object.assign(b,patch);localStorage.setItem('wf_pos_biz',JSON.stringify(b));}

  function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  // UPI QR via public QR service (works offline-of-our-server, online generally)
  function upiQR(amount,note,size){
    var b=biz();
    var pa=encodeURIComponent(b.upiId), pn=encodeURIComponent(b.upiName||b.name);
    var tn=encodeURIComponent(note||'');
    var am=amount?('&am='+encodeURIComponent(Number(amount).toFixed(2))):'';
    var upi='upi://pay?pa='+pa+'&pn='+pn+am+'&tn='+tn+'&cu=INR';
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+(size||220)+'x'+(size||220)+'&data='+encodeURIComponent(upi);
  }
  function docTitle(type){return type==='quotation'?'QUOTATION':(type==='service'?'SERVICE INVOICE':'TAX INVOICE');}

  // ---- A4 document (invoice / quotation / service) -----------
  function a4(bill){
    var b=biz(), p=bill.payload, items=bill.cart||[];
    var type=(p.invoice_type==='quotation')?'quotation':(p.invoice_type==='service'?'service':'invoice');
    var rows=items.map(function(it,i){
      var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td>'+(i+1)+'</td><td class="l">'+esc(it.name)+(it.sku?'<div class="sku">'+esc(it.sku)+'</div>':'')+'</td>'
        +'<td>'+it.qty+'</td><td class="r">'+money(it.price)+'</td><td class="r">'+(it.disc?('-'+money(it.disc)):'—')+'</td>'
        +'<td class="r">'+money(amt)+'</td></tr>';
    }).join('');
    var showQR=(type!=='quotation');
    var qr=showQR?('<div class="pay"><img src="'+upiQR(p.total,p.invoice_number,200)+'" width="120" height="120" alt="UPI QR"><div class="paymeta"><b>Scan to pay (UPI)</b><div>'+esc(b.upiId)+'</div>'+(b.bank?('<div>'+esc(b.bank)+'</div>'):'')+'</div></div>'):'';
    var accent= b.tplInvoice==='modern' ? '#0a5c43' : (b.tplInvoice==='minimal'?'#0c1311':'#034732');
    var headBg= b.tplInvoice==='minimal' ? '#ffffff' : accent;
    var headColor= b.tplInvoice==='minimal' ? '#0c1311' : '#ffffff';
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title>'
    +'<style>'
    +'@page{size:A4;margin:14mm}'
    +'*{box-sizing:border-box;margin:0;padding:0}'
    +'body{font-family:Arial,Helvetica,sans-serif;color:#1a211e;font-size:12px;line-height:1.5}'
    +'.head{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 18px;background:'+headBg+';color:'+headColor+';border-radius:8px}'
    +'.head .biz{display:flex;gap:12px;align-items:center}'
    +'.head img{height:46px;background:#fff;border-radius:6px;padding:3px}'
    +'.head h1{font-size:19px;letter-spacing:.5px}'
    +'.head .sub{font-size:10px;opacity:.85}'
    +'.head .doc{text-align:right}.head .doc .t{font-size:20px;font-weight:800;letter-spacing:1px}'
    +'.meta{display:flex;justify-content:space-between;margin:16px 2px;gap:20px}'
    +'.meta .box{font-size:11px}.meta .box b{display:block;color:'+accent+';margin-bottom:3px;text-transform:uppercase;font-size:10px;letter-spacing:.5px}'
    +'table{width:100%;border-collapse:collapse;margin-top:8px}'
    +'th{background:'+accent+';color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.4px;padding:8px 6px;text-align:center}'
    +'th.l,td.l{text-align:left}th.r,td.r{text-align:right}'
    +'td{padding:8px 6px;border-bottom:1px solid #e6e9e7;text-align:center;font-size:11px}'
    +'td .sku{font-size:9px;color:#8a938f}'
    +'.foot{display:flex;justify-content:space-between;margin-top:14px;gap:20px}'
    +'.pay{display:flex;gap:10px;align-items:center;font-size:10px}.pay .paymeta b{color:'+accent+'}'
    +'.totals{min-width:230px;font-size:12px}'
    +'.totals .r1{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee}'
    +'.totals .tot{display:flex;justify-content:space-between;padding:9px 12px;margin-top:6px;background:'+accent+';color:#fff;border-radius:6px;font-size:15px;font-weight:800}'
    +'.terms{margin-top:22px;font-size:9.5px;color:#5a635f;border-top:1px solid #e6e9e7;padding-top:8px}'
    +'.sign{margin-top:30px;text-align:right;font-size:11px}.sign .ln{display:inline-block;border-top:1px solid #888;padding-top:4px;min-width:160px;margin-top:34px}'
    +'</style></head><body>'
    +'<div class="head"><div class="biz"><img src="'+esc(b.logo)+'" onerror="this.style.display=\'none\'"><div><h1>'+esc(b.name)+'</h1><div class="sub">'+esc(b.tagline)+'</div></div></div>'
    +'<div class="doc"><div class="t">'+docTitle(type)+'</div><div style="font-size:11px;margin-top:4px">'+esc(p.invoice_number)+'</div></div></div>'
    +'<div class="meta"><div class="box"><b>From</b>'+esc(b.name)+'<br>'+esc(b.address)+'<br>Ph: '+esc(b.phone)+(b.gstin?('<br>GSTIN: '+esc(b.gstin)):'')+'</div>'
    +'<div class="box" style="text-align:right"><b>Bill To</b>'+esc(p.customer_name||'Walk-in')+(p.customer_phone?('<br>'+esc(p.customer_phone)):'')+'<br>Date: '+new Date().toLocaleDateString('en-IN')+'</div></div>'
    +'<table><thead><tr><th>#</th><th class="l">Item</th><th>Qty</th><th class="r">Rate</th><th class="r">Disc</th><th class="r">Amount</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="foot">'+qr+'<div class="totals"><div class="r1"><span>Sub Total</span><span>'+money(p.subtotal)+'</span></div>'
    +'<div class="r1"><span>Discount</span><span>-'+money(p.discount_amount)+'</span></div>'
    +'<div class="r1"><span>GST'+(p.tax_pct?(' ('+p.tax_pct+'%)'):'')+'</span><span>'+money(p.tax_amount)+'</span></div>'
    +'<div class="tot"><span>'+(type==='quotation'?'Estimated':'Total')+'</span><span>'+money(p.total)+'</span></div></div></div>'
    +'<div class="terms"><b>Terms:</b> '+esc(b.terms)+(type==='quotation'?' This is an estimate, not a tax invoice. Prices valid 7 days.':'')+'</div>'
    +'<div class="sign">For '+esc(b.name)+'<div class="ln">Authorised Signature</div></div>'
    +'</body></html>';
  }

  // ---- 80mm thermal receipt ---------------------------------
  function thermal(bill){
    var b=biz(), p=bill.payload, items=bill.cart||[];
    var rows=items.map(function(it){var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="l">'+esc(it.name)+'<br><span class="d">'+it.qty+' x '+money(it.price)+'</span></td><td class="r">'+money(amt)+'</td></tr>';}).join('');
    var showQR=(p.invoice_type!=='quotation');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title>'
    +'<style>'
    +'@page{size:80mm auto;margin:0}'
    +'*{margin:0;padding:0;box-sizing:border-box}'
    +'body{width:80mm;padding:6mm 4mm;font-family:"Courier New",monospace;color:#000;font-size:11px;line-height:1.4}'
    +'.c{text-align:center}.b{font-weight:bold}.lg{height:34px;margin:0 auto 4px;display:block}'
    +'.hr{border-top:1px dashed #000;margin:5px 0}'
    +'table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}'
    +'td.r{text-align:right}td.l{text-align:left}.d{font-size:9px;color:#333}'
    +'.tot{display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-top:4px}'
    +'.qr{display:block;margin:6px auto}'
    +'</style></head><body>'
    +'<img class="lg" src="'+esc(b.logo)+'" onerror="this.style.display=\'none\'">'
    +'<div class="c b">'+esc(b.name)+'</div>'
    +'<div class="c" style="font-size:9px">'+esc(b.address)+'<br>Ph: '+esc(b.phone)+(b.gstin?('<br>GSTIN: '+esc(b.gstin)):'')+'</div>'
    +'<div class="hr"></div>'
    +'<div style="font-size:10px">'+(p.invoice_type==='quotation'?'QUOTATION':'INVOICE')+': '+esc(p.invoice_number)+'<br>'+new Date().toLocaleString('en-IN')+'<br>Customer: '+esc(p.customer_name||'Walk-in')+'</div>'
    +'<div class="hr"></div>'
    +'<table>'+rows+'</table>'
    +'<div class="hr"></div>'
    +'<table><tr><td class="l">Sub Total</td><td class="r">'+money(p.subtotal)+'</td></tr>'
    +(p.discount_amount?'<tr><td class="l">Discount</td><td class="r">-'+money(p.discount_amount)+'</td></tr>':'')
    +(p.tax_amount?'<tr><td class="l">GST'+(p.tax_pct?(' '+p.tax_pct+'%'):'')+'</td><td class="r">'+money(p.tax_amount)+'</td></tr>':'')+'</table>'
    +'<div class="tot"><span>TOTAL</span><span>'+money(p.total)+'</span></div>'
    +'<div style="font-size:10px;margin-top:3px">Paid via '+esc((p.payment_method||'').toUpperCase())+'</div>'
    +(showQR?'<img class="qr" width="120" height="120" src="'+upiQR(p.total,p.invoice_number,160)+'">':'')
    +'<div class="hr"></div><div class="c" style="font-size:10px">Thank you! Visit again.</div>'
    +'</body></html>';
  }

  function openPrint(html){
    var w=window.open('','_blank','width=420,height=700');
    if(!w){alert('Please allow pop-ups to print/save the document.');return;}
    w.document.open();w.document.write(html);w.document.close();
    w.focus();
    setTimeout(function(){try{w.print();}catch(e){}},400);
  }

  function downloadQR(amount,note,filename){
    var url=upiQR(amount,note,400);
    var a=document.createElement('a');a.href=url;a.download=(filename||'wellfix-upi-qr')+'.png';a.target='_blank';
    document.body.appendChild(a);a.click();a.remove();
    return url;
  }

  global.WFPrint={
    biz:biz, saveBiz:saveBiz, upiQR:upiQR, downloadQR:downloadQR,
    a4:a4, thermal:thermal,
    printA4:function(bill){openPrint(a4(bill));},
    printThermal:function(bill){openPrint(thermal(bill));},
    DEFAULT:BIZ_DEFAULT
  };
})(window);
