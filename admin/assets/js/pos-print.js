/* ============================================================
 * WellFix POS — Print / Document engine (WFPrint) v2
 * Premium A4 TAX INVOICE · distinct QUOTATION · SERVICE INVOICE
 * 80mm thermal · UPI QR (image only, no id text) · amount-in-words
 * Pure client-side. Business details read from localStorage 'wf_pos_biz'.
 * ============================================================ */
(function(global){
  'use strict';

  function base(){var b=(typeof POS_BASE!=='undefined'?POS_BASE:'/wellfix-website');return location.origin+b;}
  var BIZ_DEFAULT={
    name:'WellFix Appliances', tagline:'Home Appliance Sales & Service',
    address:'Thrissur, Kerala, India', phone:'8301879406',
    email:'wellfixappliances@gmail.com', gstin:'',
    upiId:'8301879406@ybl', upiName:'WellFix Appliances', bank:'',
    logo:'', tplInvoice:'classic', tplThermal:'standard',
    terms:'Goods once sold are taken back / exchanged within 7 days with the original bill. Warranty as per manufacturer.'
  };
  function biz(){
    var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){b={};}
    var m=Object.assign({},BIZ_DEFAULT,b);
    m.logoGreen=base()+'/assets/images/brand/wellfix-logo-green.png';
    m.logoWhite=base()+'/assets/images/brand/wellfix-logo-white.png';
    m.iconGreen=base()+'/assets/images/brand/wellfix-icon-green.png';
    if(m.logo&&m.logo.indexOf('data:')===0){m.logoGreen=m.logo;m.logoWhite=m.logo;}
    return m;
  }
  function saveBiz(patch){var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){}Object.assign(b,patch);localStorage.setItem('wf_pos_biz',JSON.stringify(b));}

  function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  // Indian number to words
  function inWords(num){
    num=Math.round(Number(num)||0);
    if(num===0)return 'Zero Rupees Only';
    var a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function two(n){return n<20?a[n]:(b[Math.floor(n/10)]+(n%10?' '+a[n%10]:''));}
    function three(n){return (n>=100?(a[Math.floor(n/100)]+' Hundred'+(n%100?' ':'')):'')+(n%100?two(n%100):'');}
    var out='',cr=Math.floor(num/10000000);num%=10000000;
    var la=Math.floor(num/100000);num%=100000;
    var th=Math.floor(num/1000);num%=1000;
    if(cr)out+=three(cr)+' Crore ';
    if(la)out+=three(la)+' Lakh ';
    if(th)out+=three(th)+' Thousand ';
    if(num)out+=three(num);
    return out.trim()+' Rupees Only';
  }

  // UPI QR (image only) — amount + payee, no visible id text on docs
  function upiQR(amount,note,size){
    var b=biz();
    var upi='upi://pay?pa='+encodeURIComponent(b.upiId)+'&pn='+encodeURIComponent(b.upiName||b.name)+(amount?('&am='+Number(amount).toFixed(2)):'')+'&tn='+encodeURIComponent(note||'')+'&cu=INR';
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+(size||220)+'x'+(size||220)+'&qzone=1&data='+encodeURIComponent(upi);
  }

  function rowsHtml(items,withDisc){
    return items.map(function(it,i){
      var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="c">'+(i+1)+'</td><td>'+esc(it.name)+(it.sku?'<span class="sku">'+esc(it.sku)+'</span>':'')+'</td>'
        +'<td class="c">'+it.qty+'</td><td class="r">'+money(it.price)+'</td>'
        +(withDisc?'<td class="r">'+(it.disc?('-'+money(it.disc)):'—')+'</td>':'')
        +'<td class="r b">'+money(amt)+'</td></tr>';
    }).join('');
  }

  // ===================== PREMIUM TAX / SERVICE INVOICE =====================
  function invoiceDoc(bill,kind){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var title=kind==='service'?'SERVICE INVOICE':'TAX INVOICE';
    var qr=upiQR(p.total,p.invoice_number,150);
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'
    +'@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}'
    +'body{font-family:"Segoe UI",Arial,sans-serif;color:#1d2421;font-size:12px}'
    +'.sheet{padding:0 0 24px}'
    +'.band{background:#034732;color:#fff;padding:22px 32px;display:flex;justify-content:space-between;align-items:center}'
    +'.band .l{display:flex;align-items:center;gap:14px}'
    +'.band img{height:50px}'
    +'.band .nm{font-size:21px;font-weight:800;letter-spacing:.3px}'
    +'.band .tg{font-size:11px;color:#bfe3d4;margin-top:2px}'
    +'.band .r{text-align:right}.band .ti{font-size:24px;font-weight:800;letter-spacing:2px}'
    +'.band .no{font-size:12px;color:#dcefe7;margin-top:4px}'
    +'.strip{height:5px;background:#F0C419}'
    +'.parties{display:flex;justify-content:space-between;padding:22px 32px 8px;gap:30px}'
    +'.parties .h{font-size:10px;letter-spacing:1px;color:#0a5c43;font-weight:700;margin-bottom:5px;text-transform:uppercase}'
    +'.parties .nm2{font-weight:700;font-size:13px}'
    +'.parties .muted{color:#5e6a65;font-size:11.5px;line-height:1.6}'
    +'table{width:100%;border-collapse:collapse;margin:10px 0 0}'
    +'thead th{background:#eef6f2;color:#034732;font-size:10px;letter-spacing:.5px;text-transform:uppercase;padding:11px 32px;text-align:left}'
    +'thead th.c{text-align:center}thead th.r{text-align:right}'
    +'tbody td{padding:12px 32px;border-bottom:1px solid #eef1ef;font-size:12px}'
    +'tbody td.c{text-align:center}tbody td.r{text-align:right}tbody td.b{font-weight:700}'
    +'tbody tr:nth-child(even){background:#fafcfb}'
    +'.sku{display:block;font-size:9.5px;color:#97a09b;margin-top:2px}'
    +'.lower{display:flex;justify-content:space-between;padding:18px 32px;gap:30px;align-items:flex-start}'
    +'.pay{display:flex;gap:12px;align-items:center}'
    +'.pay img{width:96px;height:96px;border:1px solid #e3e8e5;border-radius:8px;padding:4px}'
    +'.pay .t{font-size:11px;font-weight:700;color:#034732}.pay .s{font-size:10px;color:#7d8884;max-width:150px;line-height:1.5}'
    +'.tot{min-width:250px}'
    +'.tot .r1{display:flex;justify-content:space-between;padding:7px 0;font-size:12.5px;border-bottom:1px solid #eef1ef}'
    +'.tot .r1 .muted{color:#5e6a65}'
    +'.tot .grand{display:flex;justify-content:space-between;align-items:center;background:#034732;color:#fff;padding:12px 16px;border-radius:8px;margin-top:8px}'
    +'.tot .grand .x{font-size:13px;font-weight:700}.tot .grand .y{font-size:19px;font-weight:800}'
    +'.words{padding:0 32px 6px;font-size:11px;color:#3b4844}.words b{color:#034732}'
    +'.foot{padding:14px 32px 0;border-top:1px solid #eef1ef;margin-top:6px;display:flex;justify-content:space-between;gap:24px;align-items:flex-end}'
    +'.terms{font-size:10px;color:#6b7570;max-width:60%;line-height:1.6}.terms b{color:#034732}'
    +'.sign{text-align:center;font-size:11px}.sign .ln{border-top:1px solid #9aa39e;margin-top:40px;padding-top:5px;min-width:170px}'
    +'.ty{text-align:center;color:#0a5c43;font-weight:700;font-size:12px;margin:16px 0 0}'
    +'</style></head><body><div class="sheet">'
    +'<div class="band"><div class="l"><img src="'+esc(b.logoWhite)+'" onerror="this.style.display=\'none\'"><div><div class="nm">'+esc(b.name)+'</div><div class="tg">'+esc(b.tagline)+'</div></div></div>'
    +'<div class="r"><div class="ti">'+title+'</div><div class="no">'+esc(p.invoice_number)+'</div></div></div><div class="strip"></div>'
    +'<div class="parties"><div><div class="h">Billed To</div><div class="nm2">'+esc(p.customer_name||'Walk-in Customer')+'</div><div class="muted">'+(p.customer_phone?esc(p.customer_phone)+'<br>':'')+'</div></div>'
    +'<div style="text-align:right"><div class="h">Invoice Details</div><div class="muted">Date: '+new Date().toLocaleDateString('en-IN')+'<br>Payment: '+esc((p.payment_method||'').toUpperCase())+(b.gstin?('<br>GSTIN: '+esc(b.gstin)):'')+'</div></div></div>'
    +'<table><thead><tr><th class="c">#</th><th>Description</th><th class="c">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>'+rowsHtml(items,false)+'</tbody></table>'
    +'<div class="lower"><div class="pay"><img src="'+qr+'" onerror="this.style.display=\'none\'"><div><div class="t">Scan &amp; Pay</div><div class="s">Pay via any UPI app — Google Pay, PhonePe, Paytm, BHIM.</div></div></div>'
    +'<div class="tot"><div class="r1"><span class="muted">Sub Total</span><span>'+money(p.subtotal)+'</span></div>'
    +(p.discount_amount?'<div class="r1"><span class="muted">Discount</span><span>-'+money(p.discount_amount)+'</span></div>':'')
    +'<div class="r1"><span class="muted">GST'+(p.tax_pct?(' ('+p.tax_pct+'%)'):'')+'</span><span>'+money(p.tax_amount)+'</span></div>'
    +'<div class="grand"><span class="x">TOTAL</span><span class="y">'+money(p.total)+'</span></div></div></div>'
    +'<div class="words"><b>In words:</b> '+inWords(p.total)+'</div>'
    +'<div class="foot"><div class="terms"><b>Terms &amp; Conditions</b><br>'+esc(b.terms)+'</div>'
    +'<div class="sign">For '+esc(b.name)+'<div class="ln">Authorised Signature</div></div></div>'
    +'<div class="ty">Thank you for your business!</div>'
    +'</div></body></html>';
  }

  // ===================== DISTINCT QUOTATION =====================
  function quotationDoc(bill){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var valid=new Date(Date.now()+7*864e5).toLocaleDateString('en-IN');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'
    +'@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}'
    +'body{font-family:"Segoe UI",Arial,sans-serif;color:#1d2421;font-size:12px}'
    +'.sheet{padding:34px 34px 24px;border-top:7px solid #F0C419}'
    +'.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}'
    +'.top img{height:46px}'
    +'.top .nm{font-size:18px;font-weight:800;color:#034732}.top .mut{font-size:11px;color:#5e6a65;line-height:1.6;margin-top:3px}'
    +'.top .q{text-align:right}.top .q .t{font-size:30px;font-weight:800;color:#034732;letter-spacing:1px}'
    +'.top .q .no{font-size:11px;color:#5e6a65;margin-top:4px;line-height:1.7}'
    +'.cust{margin:18px 0 6px;padding:12px 0;border-top:1px solid #e6eae8;border-bottom:1px solid #e6eae8;display:flex;justify-content:space-between}'
    +'.cust .h{font-size:10px;letter-spacing:1px;color:#0a5c43;font-weight:700;text-transform:uppercase;margin-bottom:4px}'
    +'.cust .v{font-weight:700;font-size:13px}'
    +'table{width:100%;border-collapse:collapse;margin-top:14px}'
    +'thead th{background:#034732;color:#fff;font-size:10px;letter-spacing:.5px;text-transform:uppercase;padding:10px 12px;text-align:left}'
    +'thead th.c{text-align:center}thead th.r{text-align:right}'
    +'tbody td{padding:11px 12px;border-bottom:1px solid #eef1ef}tbody td.c{text-align:center}tbody td.r{text-align:right}tbody td.b{font-weight:700}'
    +'.sku{display:block;font-size:9.5px;color:#97a09b}'
    +'.tot{margin-left:auto;width:270px;margin-top:14px}'
    +'.tot .r1{display:flex;justify-content:space-between;padding:7px 2px;border-bottom:1px solid #eef1ef}'
    +'.tot .grand{display:flex;justify-content:space-between;background:#F0C419;color:#1d2421;padding:11px 14px;border-radius:7px;margin-top:8px;font-weight:800;font-size:16px}'
    +'.cols{display:flex;gap:26px;margin-top:24px}'
    +'.cols .box{flex:1}.cols .h{font-size:11px;font-weight:800;color:#034732;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;border-bottom:2px solid #F0C419;display:inline-block;padding-bottom:3px}'
    +'.cols .bd{font-size:11px;color:#4a544f;line-height:1.7;white-space:pre-line}'
    +'.sign{text-align:right;margin-top:34px;font-size:11px}.sign .ln{display:inline-block;border-top:1px solid #9aa39e;margin-top:36px;padding-top:5px;min-width:180px}'
    +'</style></head><body><div class="sheet">'
    +'<div class="top"><div><img src="'+esc(b.logoGreen)+'" onerror="this.style.display=\'none\'"><div class="nm" style="margin-top:6px">'+esc(b.name)+'</div><div class="mut">'+esc(b.address)+'<br>Ph: '+esc(b.phone)+(b.email?(' · '+esc(b.email)):'')+'</div></div>'
    +'<div class="q"><div class="t">QUOTATION</div><div class="no">'+esc(p.invoice_number)+'<br>Date: '+new Date().toLocaleDateString('en-IN')+'<br>Valid until: '+valid+'</div></div></div>'
    +'<div class="cust"><div><div class="h">Prepared For</div><div class="v">'+esc(p.customer_name||'—')+'</div>'+(p.customer_phone?('<div style="font-size:11px;color:#5e6a65">'+esc(p.customer_phone)+'</div>'):'')+'</div>'
    +'<div style="text-align:right"><div class="h">Estimate Total</div><div class="v" style="color:#034732;font-size:18px">'+money(p.total)+'</div></div></div>'
    +'<table><thead><tr><th class="c">#</th><th>Description</th><th class="c">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>'+rowsHtml(items,false)+'</tbody></table>'
    +'<div class="tot"><div class="r1"><span>Sub Total</span><span>'+money(p.subtotal)+'</span></div>'
    +(p.discount_amount?'<div class="r1"><span>Discount</span><span>-'+money(p.discount_amount)+'</span></div>':'')
    +'<div class="r1"><span>GST'+(p.tax_pct?(' ('+p.tax_pct+'%)'):'')+'</span><span>'+money(p.tax_amount)+'</span></div>'
    +'<div class="grand"><span>Estimated Total</span><span>'+money(p.total)+'</span></div></div>'
    +'<div class="cols"><div class="box"><div class="h">Terms &amp; Conditions</div><div class="bd">'+esc(b.terms)+'\nThis is an estimate only, not a tax invoice. Prices valid for 7 days.</div></div>'
    +'<div class="box"><div class="h">Bank Details</div><div class="bd">'+(b.bank?esc(b.bank):'UPI: '+esc(b.upiId))+'\nName: '+esc(b.upiName||b.name)+'</div></div></div>'
    +'<div class="sign">For '+esc(b.name)+'<div class="ln">Authorised Signature</div></div>'
    +'</div></body></html>';
  }

  // ===================== 80mm THERMAL =====================
  function thermalDoc(bill){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var rows=items.map(function(it){var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="l">'+esc(it.name)+'<br><span class="d">'+it.qty+' x '+money(it.price)+'</span></td><td class="r">'+money(amt)+'</td></tr>';}).join('');
    var showQR=(p.invoice_type!=='quotation');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'
    +'@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}'
    +'body{width:80mm;padding:5mm 4mm;font-family:"Courier New",monospace;color:#000;font-size:11px;line-height:1.45}'
    +'.c{text-align:center}.b{font-weight:bold}.lg{height:38px;margin:0 auto 4px;display:block}'
    +'.hr{border-top:1px dashed #000;margin:5px 0}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}'
    +'td.r{text-align:right}.d{font-size:9px;color:#333}.tot{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px}'
    +'.qr{display:block;margin:6px auto}</style></head><body>'
    +'<img class="lg" src="'+esc(b.iconGreen)+'" onerror="this.style.display=\'none\'">'
    +'<div class="c b" style="font-size:13px">'+esc(b.name)+'</div>'
    +'<div class="c" style="font-size:9px">'+esc(b.address)+'<br>Ph: '+esc(b.phone)+(b.gstin?('<br>GSTIN: '+esc(b.gstin)):'')+'</div><div class="hr"></div>'
    +'<div style="font-size:10px">'+(p.invoice_type==='quotation'?'QUOTATION':'INVOICE')+': '+esc(p.invoice_number)+'<br>'+new Date().toLocaleString('en-IN')+'<br>Customer: '+esc(p.customer_name||'Walk-in')+'</div><div class="hr"></div>'
    +'<table>'+rows+'</table><div class="hr"></div>'
    +'<table><tr><td>Sub Total</td><td class="r">'+money(p.subtotal)+'</td></tr>'
    +(p.discount_amount?'<tr><td>Discount</td><td class="r">-'+money(p.discount_amount)+'</td></tr>':'')
    +(p.tax_amount?'<tr><td>GST'+(p.tax_pct?(' '+p.tax_pct+'%'):'')+'</td><td class="r">'+money(p.tax_amount)+'</td></tr>':'')+'</table>'
    +'<div class="tot"><span>TOTAL</span><span>'+money(p.total)+'</span></div>'
    +'<div style="font-size:10px;margin-top:3px">Paid via '+esc((p.payment_method||'').toUpperCase())+'</div>'
    +(showQR?'<div class="c" style="font-size:9px;margin-top:6px">Scan to Pay</div><img class="qr" width="130" height="130" src="'+upiQR(p.total,p.invoice_number,170)+'" onerror="this.style.display=\'none\'">':'')
    +'<div class="hr"></div><div class="c" style="font-size:10px">Thank you! Visit again.</div></body></html>';
  }

  function openPrint(html){
    var w=window.open('','_blank','width=440,height=720');
    if(!w){alert('Please allow pop-ups to print / save as PDF.');return;}
    w.document.open();w.document.write(html);w.document.close();w.focus();
    setTimeout(function(){try{w.print();}catch(e){}},450);
  }
  function docFor(bill){
    var t=bill.payload.invoice_type;
    if(t==='quotation')return quotationDoc(bill);
    if(t==='service')return invoiceDoc(bill,'service');
    return invoiceDoc(bill,'invoice');
  }
  function downloadQR(amount,note,filename){
    var url=upiQR(amount,note,420);var a=document.createElement('a');
    a.href=url;a.download=(filename||'wellfix-upi-qr')+'.png';a.target='_blank';
    document.body.appendChild(a);a.click();a.remove();return url;
  }

  global.WFPrint={
    biz:biz,saveBiz:saveBiz,upiQR:upiQR,downloadQR:downloadQR,inWords:inWords,
    a4:docFor,thermal:thermalDoc,
    printA4:function(bill){openPrint(docFor(bill));},
    printThermal:function(bill){openPrint(thermalDoc(bill));},
    DEFAULT:BIZ_DEFAULT
  };
})(window);
