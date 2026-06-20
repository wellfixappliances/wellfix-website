/* ============================================================
 * WellFix POS — Print engine (WFPrint) v3
 * Premium TAX INVOICE + QUOTATION matching brand design.
 * Manrope font · CGST/SGST split · amount-in-words · UPI QR.
 * All text from localStorage 'wf_pos_biz' (editable in Settings).
 * ============================================================ */
(function(global){
  'use strict';

  function base(){var b=(typeof POS_BASE!=='undefined'?POS_BASE:'/wellfix-website');return location.origin+b;}
  var BIZ_DEFAULT={
    name:'WellFix Appliances', tagline:'Home Appliance Sales & Service', branch:'',
    address:'Venkitangu, Thrissur, Kerala - 680023', phone:'+91 85900 04349',
    email:'wellfixappliances@gmail.com', website:'www.wellfixappliances.com', gstin:'32ABCDE1234F1Z5',
    upiId:'wellfix@upi', upiName:'WellFix Appliances', bank:'',
    logo:'', icon:'', tplInvoice:'classic', tplThermal:'standard', state:'Kerala (32)',
    terms:'This quotation is valid for 7 days from the date of this document.|Prices are inclusive of all applicable taxes.|Delivery charges extra if applicable.|Warranty as per manufacturer policy.|Goods once sold cannot be taken back or exchanged.|Subject to stock availability.|Prices may change without prior notice.',
    warranty:'Product warranty as per manufacturer policy. Warranty card & bill must be kept for any claims.',
    returnPolicy:'Goods once sold cannot be taken back or exchanged within 7 days except in case of manufacturing defects.'
  };
  function resolveAsset(l){if(!l)return '';if(l.indexOf('data:')===0||l.indexOf('http')===0)return l;return base()+'/'+l.replace(/^\/+/,'');}
  function biz(){
    var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){b={};}
    var m=Object.assign({},BIZ_DEFAULT,b);
    var custom=resolveAsset(m.logo);
    m.logoGreen=custom||(base()+'/assets/images/brand/wellfix-logo-green.png');
    m.logoWhite=custom||(base()+'/assets/images/brand/wellfix-logo-white.png');
    m.iconGreen=resolveAsset(m.icon)||custom||(base()+'/assets/images/brand/wellfix-icon-white.png');
    return m;
  }
  function saveBiz(patch){var b={};try{b=JSON.parse(localStorage.getItem('wf_pos_biz')||'{}');}catch(e){}Object.assign(b,patch);localStorage.setItem('wf_pos_biz',JSON.stringify(b));}

  function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function finYear(d){d=d||new Date();var y=d.getFullYear(),m=d.getMonth();var s=(m<3)?y-1:y;return s+'-'+String(s+1).slice(-2);}

  function inWords(num){
    num=Number(num)||0;var rs=Math.floor(num);var ps=Math.round((num-rs)*100);
    var a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function two(n){return n<20?a[n]:(b[Math.floor(n/10)]+(n%10?' '+a[n%10]:''));}
    function three(n){return (n>=100?(a[Math.floor(n/100)]+' Hundred'+(n%100?' ':'')):'')+(n%100?two(n%100):'');}
    function whole(n){if(n===0)return 'Zero';var o='',cr=Math.floor(n/10000000);n%=10000000;var la=Math.floor(n/100000);n%=100000;var th=Math.floor(n/1000);n%=1000;if(cr)o+=three(cr)+' Crore ';if(la)o+=three(la)+' Lakh ';if(th)o+=three(th)+' Thousand ';if(n)o+=three(n);return o.trim();}
    var out=whole(rs)+' Rupees';if(ps)out+=' and '+whole(ps)+' Paise';return out+' Only';
  }

  function upiQR(amount,note,size){
    var b=biz();
    var upi='upi://pay?pa='+encodeURIComponent(b.upiId)+'&pn='+encodeURIComponent(b.upiName||b.name)+(amount?('&am='+Number(amount).toFixed(2)):'')+'&tn='+encodeURIComponent(note||'')+'&cu=INR';
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+(size||220)+'x'+(size||220)+'&qzone=1&data='+encodeURIComponent(upi);
  }
  function qrFor(data,size){return 'https://api.qrserver.com/v1/create-qr-code/?size='+(size||140)+'x'+(size||140)+'&qzone=1&data='+encodeURIComponent(data);}

  function ic(n){var p={
    pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
    phone:'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>',
    user:'<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    doc:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    box:'<path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>',
    head:'<path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>',
    pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'
  };return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(p[n]||'')+'</svg>';}

  var HEX='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="#F0C419" stroke-width="9"/><polygon points="50,24 73,37 73,63 50,76 27,63 27,37" fill="#fff"/><circle cx="50" cy="50" r="9" fill="#034732"/></svg>';

  function headCSS(){
    return "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');"
    +"*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}"
    +"body{font-family:'Manrope',Arial,sans-serif;color:#1d2421;font-size:11px;background:#fff}"
    +".pg{width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative}"
    +".g{color:#034732}.gold{color:#F0C419}";
  }
  function contactRows(b){
    return '<div class="crow">'+ic('pin')+'<span>'+esc(b.address)+'</span></div>'
      +'<div class="crow">'+ic('phone')+'<span>'+esc(b.phone)+'</span></div>'
      +'<div class="crow">'+ic('mail')+'<span>'+esc(b.email)+'</span></div>'
      +'<div class="crow">'+ic('globe')+'<span>'+esc(b.website)+'</span></div>';
  }

  function invoiceDoc(bill,kind){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var title=kind==='service'?'SERVICE INVOICE':(kind==='credit'?'CREDIT NOTE':'TAX INVOICE');
    var cgst=(p.tax_amount||0)/2, half=(p.tax_pct||0)/2;
    var rows=items.map(function(it,i){var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="c">'+(i+1)+'</td><td><b>'+esc(it.name)+'</b>'+(it.sku?'<div class="sub">'+esc(it.sku)+'</div>':'')+'</td>'
        +'<td class="c">'+esc(it.hsn||'—')+'</td><td class="c">'+it.qty+'</td><td class="r">'+Number(it.price).toLocaleString('en-IN',{minimumFractionDigits:2})+'</td>'
        +'<td class="c">'+(it.gst?(p.tax_pct||0)+'%':'—')+'</td><td class="r"><b>'+Number(amt).toLocaleString('en-IN',{minimumFractionDigits:2})+'</b></td></tr>';
    }).join('');
    var css=headCSS()
    +".hd{display:flex;min-height:150px}"
    +".hd .badge-l{width:175px;background:#034732;position:relative;clip-path:polygon(0 0,100% 0,78% 100%,0 100%);display:flex;align-items:center;justify-content:center}"
    +".hd .badge-l svg,.hd .badge-l img{width:108px;height:108px;object-fit:contain;margin-left:-18px}"
    +".hd .mid{flex:1;padding:16px 14px 10px 6px}"
    +".hd .bn{font-size:25px;font-weight:800;color:#034732;letter-spacing:-.5px;line-height:1}"
    +".hd .tg{font-size:11px;color:#3b4844;font-weight:600;margin:3px 0 9px}"
    +".crow{display:flex;align-items:center;gap:7px;font-size:10px;color:#3b4844;margin:3px 0}.crow svg{width:13px;height:13px;color:#0a5c43;flex-shrink:0}"
    +".gstin{font-weight:800;color:#034732;font-size:11px;margin-top:7px;letter-spacing:.3px}"
    +".hd .rt{width:215px;border-left:1px solid #e6eae8;padding:16px 18px}"
    +".hd .rt .ti{font-size:23px;font-weight:800;color:#034732;text-align:right;letter-spacing:-.5px}"
    +".hd .rt .ob{background:#F0C419;color:#1d2421;font-size:8.5px;font-weight:800;text-align:center;padding:4px;border-radius:3px;margin:7px 0 12px;letter-spacing:.4px}"
    +".meta div{display:flex;justify-content:space-between;font-size:10px;margin:5px 0;color:#3b4844}.meta div b{color:#1d2421}"
    +".sep{height:4px;background:linear-gradient(90deg,#034732,#F0C419)}"
    +".bill2{display:flex;padding:16px 22px;gap:30px;border-bottom:1px solid #eef1ef}"
    +".bill2 .col{flex:1;display:flex;gap:10px}"
    +".cir{width:30px;height:30px;border-radius:50%;background:#eef6f2;color:#0a5c43;display:flex;align-items:center;justify-content:center;flex-shrink:0}.cir svg{width:15px;height:15px}"
    +".bill2 .h{font-size:9px;font-weight:800;color:#0a5c43;letter-spacing:.6px}.bill2 .nm{font-weight:800;font-size:13px;margin:3px 0 5px}"
    +".kv{font-size:10px;color:#5e6a65;margin:3px 0;display:flex;gap:8px}.kv b{color:#1d2421;min-width:78px;display:inline-block}"
    +"table{width:100%;border-collapse:collapse}"
    +"thead th{background:#034732;color:#fff;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;padding:10px 8px;text-align:center}"
    +"thead th.l{text-align:left}thead th.r{text-align:right}"
    +"tbody td{padding:11px 8px;border-bottom:1px solid #eef1ef;font-size:10.5px;text-align:center;vertical-align:top}"
    +"tbody td.r{text-align:right}tbody td:nth-child(2){text-align:left}"
    +"tbody td .sub{font-size:9px;color:#8a938f;font-weight:500;margin-top:2px}"
    +".lower{display:flex;padding:18px 22px;gap:18px}"
    +".scan{flex:1;border:1px solid #e6eae8;border-radius:8px;padding:12px;display:flex;gap:12px;align-items:center}"
    +".scan .qt{font-size:11px;font-weight:800;color:#0a5c43;letter-spacing:.4px;margin-bottom:5px}"
    +".scan img{width:96px;height:96px}.scan .pp{font-size:9.5px;color:#5e6a65;line-height:1.5}.scan .uid{font-size:10px;color:#034732;font-weight:700;margin-top:6px}"
    +".tot{width:46%}"
    +".tot .r1{display:flex;justify-content:space-between;padding:7px 12px;font-size:11px;color:#3b4844;border-bottom:1px solid #f0f3f1}"
    +".tot .gt{display:flex;justify-content:space-between;align-items:center;background:#034732;color:#fff;padding:11px 14px;font-weight:800;margin-top:2px}.tot .gt .a{font-size:18px}"
    +".tot .ro{display:flex;justify-content:space-between;padding:6px 12px;font-size:9.5px;color:#8a938f}"
    +".words{display:flex;align-items:center;gap:12px;margin:4px 22px;background:#eef6f2;border-radius:8px;padding:12px 16px}"
    +".words .cir{background:#034732;color:#fff}.words .h{font-size:9px;font-weight:800;color:#0a5c43;letter-spacing:.5px}.words .v{font-size:11px;font-weight:600;color:#1d2421;margin-top:2px}"
    +".foot{display:flex;padding:18px 22px;gap:22px;border-top:1px solid #eef1ef;margin-top:6px}"
    +".foot .col{flex:1;display:flex;gap:10px}.foot .cir{background:#eef6f2}.foot .h{font-size:9.5px;font-weight:800;color:#034732;letter-spacing:.4px}.foot .b{font-size:9px;color:#5e6a65;line-height:1.5;margin-top:3px}.foot .b b{color:#034732}"
    +".signs{display:flex;justify-content:space-between;align-items:flex-end;padding:6px 30px 14px}"
    +".signs .s{text-align:center;font-size:10px;color:#5e6a65}.signs .ln{border-top:1px solid #9aa39e;width:150px;margin-bottom:5px}"
    +".ty{text-align:center;font-family:'Brush Script MT',cursive;font-size:26px;color:#0a5c43}.ty small{display:block;font-family:'Manrope';font-size:9px;color:#5e6a65}"
    +".barbtm{background:#034732;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:12px 22px;margin-top:8px}"
    +".barbtm .lft{display:flex;align-items:center;gap:10px}.barbtm svg.hx{width:26px;height:26px}.barbtm .t1{font-size:10px;font-weight:800;letter-spacing:.4px}.barbtm .t2{font-size:8.5px;color:#bfe3d4}"
    +".barbtm .rgt{display:flex;align-items:center;gap:8px;font-size:8.5px;color:#bfe3d4;text-align:right}.barbtm .soc{display:flex;gap:6px}.barbtm .soc span{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center}.barbtm .soc svg{width:11px;height:11px}";
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'+css+'</style></head><body><div class="pg">'
    +'<div class="hd"><div class="badge-l">'+(b.iconGreen?'<img src="'+esc(b.iconGreen)+'" onerror="this.outerHTML=\''+HEX.replace(/"/g,'&quot;')+'\'">':HEX)+'</div>'
    +'<div class="mid"><div class="bn">'+esc(b.name).toUpperCase()+'</div><div class="tg">'+esc(b.tagline)+'</div>'+contactRows(b)+(b.gstin?('<div class="gstin">GSTIN: '+esc(b.gstin)+'</div>'):'')+'</div>'
    +'<div class="rt"><div class="ti">'+title+'</div><div class="ob">ORIGINAL FOR RECIPIENT</div><div class="meta">'
    +'<div><span>Invoice No.</span><b>'+esc(p.invoice_number)+'</b></div><div><span>Date</span><b>'+new Date().toLocaleDateString('en-GB')+'</b></div>'
    +'<div><span>Time</span><b>'+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})+'</b></div>'
    +'<div><span>Financial Year</span><b>'+finYear()+'</b></div><div><span>Payment</span><b>'+esc((p.payment_method||'').toUpperCase())+'</b></div>'
    +'<div><span>Sales Person</span><b>'+esc(p.cashier||'—')+'</b></div></div></div></div><div class="sep"></div>'
    +'<div class="bill2"><div class="col"><div class="cir">'+ic('user')+'</div><div><div class="h">BILLED TO</div><div class="nm">'+esc(p.customer_name||'Walk-in Customer')+'</div><div class="kv"><b>Phone</b>'+esc(p.customer_phone||'—')+'</div><div class="kv"><b>Address</b>—</div></div></div>'
    +'<div class="col"><div class="cir">'+ic('doc')+'</div><div><div class="h">INVOICE DETAILS</div><div class="kv" style="margin-top:6px"><b>Place of Supply</b>'+esc(b.state)+'</div><div class="kv"><b>Reverse Charge</b>No</div></div></div></div>'
    +'<table><thead><tr><th>#</th><th class="l">Description</th><th>HSN Code</th><th>Qty</th><th class="r">Rate (₹)</th><th>GST %</th><th class="r">Amount (₹)</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lower"><div class="scan"><div><div class="qt">SCAN &amp; PAY</div><div class="pp">Pay via any UPI App<br>(Google Pay, PhonePe,<br>Paytm, BHIM etc.)</div><div class="uid">UPI ID: '+esc(b.upiId)+'</div></div><img src="'+upiQR(p.total,p.invoice_number,150)+'" onerror="this.style.display=\'none\'"></div>'
    +'<div class="tot"><div class="r1"><span>Sub Total</span><span>'+money(p.subtotal)+'</span></div>'
    +(p.discount_amount?'<div class="r1"><span>Discount</span><span>-'+money(p.discount_amount)+'</span></div>':'')
    +'<div class="r1"><span>CGST ('+half+'%)</span><span>'+money(cgst)+'</span></div><div class="r1"><span>SGST ('+half+'%)</span><span>'+money(cgst)+'</span></div>'
    +'<div class="gt"><span>GRAND TOTAL</span><span class="a">'+money(p.total)+'</span></div><div class="ro"><span>Rounded Off</span><span>₹0.00</span></div></div></div>'
    +'<div class="words"><div class="cir">'+ic('pen')+'</div><div><div class="h">AMOUNT IN WORDS</div><div class="v">'+inWords(p.total)+'</div></div></div>'
    +'<div class="foot"><div class="col"><div class="cir">'+ic('shield')+'</div><div><div class="h">WARRANTY</div><div class="b">'+esc(b.warranty)+'</div></div></div>'
    +'<div class="col"><div class="cir">'+ic('box')+'</div><div><div class="h">RETURN POLICY</div><div class="b">'+esc(b.returnPolicy)+'</div></div></div>'
    +'<div class="col"><div class="cir">'+ic('head')+'</div><div><div class="h">NEED SUPPORT?</div><div class="b">For service &amp; support<br><b>'+esc(b.phone)+'</b><br>'+esc(b.email)+'</div></div></div></div>'
    +'<div class="signs"><div class="s"><div class="ln"></div>Customer Signature</div><div class="ty">Thank You !<small>for choosing '+esc(b.name)+'.</small></div><div class="s"><div class="ln"></div>Authorized Signature</div></div>'
    +'<div class="barbtm"><div class="lft"><span class="hx">'+HEX+'</span><div><div class="t1">SHOP WITH CONFIDENCE.</div><div class="t2">WE’RE HERE TO SERVE YOU BETTER.</div></div></div>'
    +'<div class="rgt"><div class="soc"><span>'+ic('phone')+'</span><span>'+ic('mail')+'</span><span>'+ic('globe')+'</span></div><div>Follow us for offers &amp; updates</div></div></div>'
    +'</div></body></html>';
  }

  function quotationDoc(bill){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var valid=new Date(Date.now()+7*864e5).toLocaleDateString('en-GB');
    var cgst=(p.tax_amount||0)/2, half=(p.tax_pct||0)/2;
    var rows=items.map(function(it,i){var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="c">'+(i+1)+'</td><td><b>'+esc(it.name)+'</b>'+(it.sku?'<div class="sub">'+esc(it.sku)+'</div>':'')+'</td><td class="c">'+esc(it.brand||'—')+'</td><td class="c">'+it.qty+'</td><td class="r">'+Number(it.price).toLocaleString('en-IN',{minimumFractionDigits:2})+'</td><td class="r">'+Number(amt).toLocaleString('en-IN',{minimumFractionDigits:2})+'</td></tr>';
    }).join('');
    var terms=(b.terms||'').split('|').filter(Boolean).map(function(t){return '<li>'+esc(t)+'</li>';}).join('');
    var why=[['shield','Genuine Products'],['box','Expert Installation'],['head','Service Support'],['box','Fast Delivery'],['shield','6+ Years Experience']]
      .map(function(w){return '<div class="wc"><div class="cir">'+ic(w[0])+'</div><span>'+w[1]+'</span></div>';}).join('');
    var css=headCSS()
    +".hd{display:flex;min-height:150px;background:#034732;position:relative;overflow:hidden;border-bottom:5px solid #F0C419}"
    +".hd:after{content:'';position:absolute;top:0;right:0;width:210px;height:100px;background:#F0C419;clip-path:polygon(52% 0,100% 0,100% 100%);z-index:0}"
    +".hd .rt .ribbon,.hd .rt .meta{position:relative;z-index:2}"
    +".hd .badge-l{width:175px;display:flex;align-items:center;justify-content:center;z-index:2}.hd .badge-l svg,.hd .badge-l img{width:108px;height:108px;object-fit:contain}"
    +".hd .mid{flex:1;padding:18px 14px;color:#fff;z-index:2}"
    +".hd .bn{font-size:25px;font-weight:800;letter-spacing:-.5px}.hd .tg{font-size:11px;color:#bfe3d4;border-bottom:2px solid #F0C419;display:inline-block;padding-bottom:4px;margin:3px 0 9px}"
    +".crow{display:flex;align-items:center;gap:7px;font-size:10px;color:#dcefe7;margin:3px 0}.crow svg{width:13px;height:13px;color:#F0C419;flex-shrink:0}"
    +".hd .rt{width:230px;padding:16px 18px;z-index:2;color:#fff}"
    +".ribbon{background:#F0C419;color:#1d2421;text-align:center;padding:8px 6px 14px;clip-path:polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);margin-bottom:12px}.ribbon .a{font-size:8px;font-weight:700}.ribbon .b{font-size:15px;font-weight:800}.ribbon .s{color:#034732;font-size:9px}"
    +".meta div{display:flex;justify-content:space-between;font-size:10px;margin:5px 0}.meta div b{color:#fff}"
    +".title{text-align:center;padding:16px 0 6px}.title .t{font-size:30px;font-weight:800;color:#034732;letter-spacing:2px}.title .s{font-size:10px;color:#5e6a65;letter-spacing:3px}"
    +".boxes{display:flex;gap:16px;padding:8px 22px}"
    +".bx{flex:1;border:1px solid #e6eae8;border-radius:8px;padding:0 0 12px;overflow:hidden}"
    +".bx .h{background:#034732;color:#fff;font-size:9.5px;font-weight:800;letter-spacing:.5px;padding:7px 12px;display:flex;align-items:center;gap:7px;clip-path:polygon(0 0,100% 0,94% 100%,0 100%)}.bx .h svg{width:13px;height:13px}"
    +".bx .row{display:flex;font-size:10px;color:#3b4844;padding:7px 14px 0}.bx .row b{min-width:96px;color:#1d2421}.bx .row .line{flex:1;border-bottom:1px dotted #aab3ae;margin-left:6px}"
    +"table{width:calc(100% - 44px);border-collapse:collapse;margin:12px 22px}"
    +"thead th{background:#034732;color:#fff;font-size:9.5px;font-weight:700;text-transform:uppercase;padding:9px 8px;text-align:center}thead th.l{text-align:left}thead th.r{text-align:right}"
    +"tbody td{padding:10px 8px;border:1px solid #eef1ef;font-size:10.5px;text-align:center}tbody td.r{text-align:right}tbody td:nth-child(2){text-align:left}.sub{font-size:9px;color:#8a938f}"
    +".lower{display:flex;gap:16px;padding:4px 22px}"
    +".tc{flex:1}.tc .h{background:#034732;color:#fff;font-size:9.5px;font-weight:800;padding:7px 12px;display:flex;gap:7px;align-items:center;clip-path:polygon(0 0,100% 0,94% 100%,0 100%);border-radius:4px 4px 0 0}.tc .h svg{width:13px;height:13px}"
    +".tc ul{border:1px solid #e6eae8;border-top:none;padding:10px 14px 10px 26px;border-radius:0 0 8px 8px}.tc li{font-size:9px;color:#4a544f;margin:4px 0}"
    +".tc .notes{border:1px solid #e6eae8;border-top:none;padding:12px 14px;border-radius:0 0 8px 8px;min-height:60px}.tc .nl{border-bottom:1px dotted #aab3ae;height:16px}"
    +".tot{width:42%}"
    +".tot .r1{display:flex;justify-content:space-between;border:1px solid #eef1ef;border-bottom:none;padding:8px 12px;font-size:10.5px}"
    +".tot .gt{background:#034732;color:#fff;text-align:center;padding:10px;font-weight:800}.tot .gt .l{font-size:10px;letter-spacing:.5px}.tot .gt .a{font-size:20px}"
    +".tot .wrd{background:#F0C419;color:#1d2421;text-align:center;font-size:9px;font-weight:700;padding:7px}"
    +".why{display:flex;justify-content:space-around;border:1px solid #e6eae8;border-radius:8px;margin:14px 22px;padding:12px}"
    +".wc{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:8.5px;font-weight:700;color:#3b4844;text-align:center}.wc .cir{width:30px;height:30px;border-radius:50%;background:#eef6f2;color:#0a5c43;display:flex;align-items:center;justify-content:center}.wc svg{width:15px;height:15px}"
    +".qbar{display:flex;gap:14px;padding:6px 22px 16px;align-items:flex-end}"
    +".connect{background:#034732;border-radius:8px;padding:10px;display:flex;gap:10px}.connect .qc{text-align:center;color:#fff;font-size:7.5px}.connect img{width:54px;height:54px;background:#fff;border-radius:4px;padding:2px}"
    +".help{flex:1;display:flex;align-items:center;gap:10px;font-size:10px;color:#3b4844}.help .cir{width:34px;height:34px;border-radius:50%;background:#eef6f2;color:#0a5c43;display:flex;align-items:center;justify-content:center}.help b{color:#034732}"
    +".qsign{display:flex;gap:30px}.qsign .s{font-size:9px;color:#5e6a65}.qsign .ln{border-top:1px solid #9aa39e;width:120px;margin-top:24px;padding-top:4px}"
    +".qfoot{background:#034732;color:#fff;text-align:center;font-family:'Brush Script MT',cursive;font-size:18px;padding:9px}";
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'+css+'</style></head><body><div class="pg">'
    +'<div class="hd"><div class="badge-l">'+(b.iconGreen?'<img src="'+esc(b.iconGreen)+'" onerror="this.outerHTML=\''+HEX.replace(/"/g,'&quot;')+'\'">':HEX)+'</div>'
    +'<div class="mid"><div class="bn">'+esc(b.name).toUpperCase()+'</div><div class="tg">'+esc(b.tagline)+'</div>'+contactRows(b)+'</div>'
    +'<div class="rt"><div class="ribbon"><div class="a">VALID FOR</div><div class="b">7 DAYS</div><div class="s">★★★★</div></div><div class="meta"><div><span>Quote No.</span><b>'+esc(p.invoice_number)+'</b></div><div><span>Date</span><b>'+new Date().toLocaleDateString('en-GB')+'</b></div><div><span>Validity</span><b>'+valid+'</b></div><div><span>Sales Person</span><b>'+esc(p.cashier||'—')+'</b></div></div></div></div>'
    +'<div class="title"><div class="t">QUOTATION</div><div class="s">ESTIMATE FOR CUSTOMER</div></div>'
    +'<div class="boxes"><div class="bx"><div class="h">'+ic('user')+'CUSTOMER DETAILS</div>'
    +'<div class="row"><b>Customer Name</b><span class="line"></span></div><div class="row"><b>Phone Number</b><span class="line"></span></div><div class="row"><b>Address</b><span class="line"></span></div><div class="row"><b>Appliance Type</b><span class="line"></span></div></div>'
    +'<div class="bx"><div class="h">'+ic('doc')+'QUOTE DETAILS</div><div class="row"><b>Place of Supply</b><span>'+esc(b.state)+'</span></div><div class="row"><b>Payment Mode</b><span>Cash / UPI / Card / Bank</span></div><div class="row"><b>Delivery</b><span>As per Availability</span></div><div class="row"><b>Installation</b><span>Free / Extra (if applicable)</span></div></div></div>'
    +'<table><thead><tr><th>#</th><th class="l">Description</th><th>Brand / Model</th><th>Qty</th><th class="r">Rate (₹)</th><th class="r">Amount (₹)</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lower"><div class="tc"><div class="h">'+ic('doc')+'TERMS &amp; CONDITIONS</div><ul>'+terms+'</ul><div style="height:8px"></div><div class="h">'+ic('pen')+'SPECIAL INSTRUCTIONS / NOTES</div><div class="notes"><div class="nl"></div><div class="nl"></div></div></div>'
    +'<div class="tot"><div class="r1"><span>Sub Total</span><span>'+money(p.subtotal)+'</span></div><div class="r1"><span>CGST ('+half+'%)</span><span>'+money(cgst)+'</span></div><div class="r1"><span>SGST ('+half+'%)</span><span>'+money(cgst)+'</span></div>'+(p.discount_amount?'<div class="r1"><span>Discount</span><span>- '+money(p.discount_amount)+'</span></div>':'')+'<div class="gt"><div class="l">GRAND TOTAL</div><div class="a">'+money(p.total)+'</div></div><div class="wrd">('+inWords(p.total)+')</div></div></div>'
    +'<div class="why">'+why+'</div>'
    +'<div class="qbar"><div class="connect"><div class="qc"><img src="'+qrFor('https://wa.me/91'+(b.phone||'').replace(/\D/g,''),120)+'"><div>WhatsApp</div></div><div class="qc"><img src="'+qrFor((b.website||'wellfix'),120)+'"><div>Reviews</div></div><div class="qc"><img src="'+upiQR(p.total,p.invoice_number,120)+'"><div>UPI Pay</div></div></div>'
    +'<div class="help"><div class="cir">'+ic('head')+'</div><div><b>NEED HELP?</b><br>For Service &amp; Support<br><b>'+esc(b.phone)+'</b><br>'+esc(b.email)+'</div></div>'
    +'<div class="qsign"><div class="s"><div class="ln"></div>Customer Signature<br>Date: ____</div><div class="s"><div class="ln"></div>Authorized Signature<br>Date: ____</div></div></div>'
    +'<div class="qfoot">Thank you for choosing '+esc(b.name)+' !</div>'
    +'</div></body></html>';
  }

  function thermalDoc(bill){
    var b=biz(),p=bill.payload,items=bill.cart||[];
    var rows=items.map(function(it){var amt=it.qty*it.price-(it.disc||0);
      return '<tr><td class="l">'+esc(it.name)+'<br><span class="d">'+it.qty+' x '+money(it.price)+'</span></td><td class="r">'+money(amt)+'</td></tr>';}).join('');
    var showQR=(p.invoice_type!=='quotation');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(p.invoice_number)+'</title><style>'
    +"@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');"
    +'@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    +"body{width:80mm;padding:5mm 4mm;font-family:'Manrope',monospace;color:#000;font-size:11px;line-height:1.45}"
    +'.c{text-align:center}.b{font-weight:800}.lg{height:40px;margin:0 auto 4px;display:block}'
    +'.hr{border-top:1px dashed #000;margin:5px 0}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}'
    +'td.r{text-align:right}.d{font-size:9px;color:#333}.tot{display:flex;justify-content:space-between;font-weight:800;font-size:14px;margin-top:4px}.qr{display:block;margin:6px auto}</style></head><body>'
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
    +(showQR?'<div class="c" style="font-size:9px;margin-top:6px">Scan to Pay (UPI)</div><img class="qr" width="130" height="130" src="'+upiQR(p.total,p.invoice_number,170)+'" onerror="this.style.display=\'none\'">':'')
    +'<div class="hr"></div><div class="c" style="font-size:10px">Thank you! Visit again.</div></body></html>';
  }

  function openPrint(html){var w=window.open('','_blank','width=460,height=760');if(!w){alert('Allow pop-ups to print / save as PDF.');return;}w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(function(){try{w.print();}catch(e){}},500);}
  function docFor(bill){var t=bill.payload.invoice_type;if(t==='quotation')return quotationDoc(bill);if(t==='service')return invoiceDoc(bill,'service');if(t==='return'||t==='refund')return invoiceDoc(bill,'credit');return invoiceDoc(bill,'invoice');}
  function downloadQR(amount,note,filename){var url=upiQR(amount,note,420);var a=document.createElement('a');a.href=url;a.download=(filename||'wellfix-upi-qr')+'.png';a.target='_blank';document.body.appendChild(a);a.click();a.remove();return url;}
  function downloadBrandedQR(amount,note,filename){
    var b=biz();var qrUrl=upiQR(amount,note,300);
    var canvas=document.createElement('canvas');canvas.width=620;canvas.height=780;var ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,620,780);ctx.fillStyle='#034732';ctx.fillRect(0,0,620,130);ctx.fillStyle='#F0C419';ctx.fillRect(0,130,620,8);
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 36px Arial';ctx.fillText(b.name,310,62);ctx.font='16px Arial';ctx.fillStyle='#bfe3d4';ctx.fillText('Scan & Pay with any UPI app',310,98);
    ctx.fillStyle='#5e6a65';ctx.font='17px Arial';ctx.fillText('Amount to pay',310,185);ctx.fillStyle='#034732';ctx.font='bold 50px Arial';ctx.fillText('₹'+Number(amount||0).toLocaleString('en-IN'),310,235);
    var img=new Image();img.crossOrigin='anonymous';
    img.onload=function(){ctx.drawImage(img,160,270,300,300);ctx.fillStyle='#1d2421';ctx.font='15px Arial';if(note)ctx.fillText(note,310,610);ctx.fillStyle='#F0C419';ctx.fillRect(0,650,620,6);ctx.fillStyle='#5e6a65';ctx.font='15px Arial';ctx.fillText(b.address,310,695);ctx.fillText('Ph: '+b.phone,310,722);try{var a=document.createElement('a');a.download=(filename||'wellfix-pay-qr')+'.png';a.href=canvas.toDataURL('image/png');a.click();}catch(e){var a2=document.createElement('a');a2.href=qrUrl;a2.download='wellfix-qr.png';a2.target='_blank';a2.click();}};
    img.onerror=function(){var a=document.createElement('a');a.href=qrUrl;a.download='wellfix-qr.png';a.target='_blank';a.click();};
    img.src=qrUrl;
  }

  global.WFPrint={
    biz:biz,saveBiz:saveBiz,upiQR:upiQR,downloadQR:downloadQR,downloadBrandedQR:downloadBrandedQR,inWords:inWords,
    a4:docFor,thermal:thermalDoc,html:function(bill,fmt){return fmt==='thermal'?thermalDoc(bill):docFor(bill);},
    printA4:function(bill){openPrint(docFor(bill));},printThermal:function(bill){openPrint(thermalDoc(bill));},
    DEFAULT:BIZ_DEFAULT
  };
})(window);
