(function(){
"use strict";
var D=window.D, ICO=window.ICO, K=D.K, T=D.now.slice(0,10);
var $=function(id){return document.getElementById(id);};
var nf=new Intl.NumberFormat("fr-FR");
function fm(n){return nf.format(Math.round(n)).replace(/\u202f|\u00a0/g,"\u00a0");}
function dec(n,d){return (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toFixed(d).replace(".",",");}
function M(n,d){d=d===undefined?1:d;var s=dec(n/1e6,d);if(d>0&&/,0+$/.test(s))s=s.replace(/,0+$/,"");return s+"\u00a0M";}
function pc(n,d){return dec(n,d||0).replace(/,0$/,"")+"\u00a0%";}
function ic(n,c){return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
var JOURS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function pd(s){var p=s.slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function dl(s){var d=pd(s);return d.getDate()+(d.getDate()==1?"er":"")+" "+MOIS[d.getMonth()];}
function dshort(s){var d=pd(s);return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);}
function dj(s){return Math.round((pd(s)-pd(T))/864e5);}
function lc1(x){return x.charAt(0).toLowerCase()+x.slice(1);}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove("on");},2600);}
function icons(root){(root||document).querySelectorAll("i[data-i]").forEach(function(e){e.outerHTML=ic(e.getAttribute("data-i"));});}
function kc(o){var tag=o.go?'button type="button" data-goto="'+o.go+'"':"div";return "<"+tag+' class="kc'+(o.key?" key":"")+'"><p class="l">'+ic(o.ico)+o.l+'</p><div class="vr"><p class="v">'+o.v+(o.u?"<small>"+o.u+"</small>":"")+"</p>"+(o.sp?'<div class="sp">'+o.sp+"</div>":"")+'</div><div class="s"><span>'+o.s+"</span></div></"+(o.go?"button":"div")+">";}
function spark(vals,col,ref){var w=92,h=36,mn=Math.min.apply(null,vals.concat(ref!==undefined?[ref]:[])),mx=Math.max.apply(null,vals.concat(ref!==undefined?[ref]:[]));if(mx==mn)mx=mn+1;
  var pts=vals.map(function(v,i){return [i*(w/(vals.length-1)),h-3-(v-mn)/(mx-mn)*(h-6)];});
  var p=pts.map(function(q,i){return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join(" ");
  var r=ref!==undefined?'<line x1="0" x2="'+w+'" y1="'+(h-3-(ref-mn)/(mx-mn)*(h-6)).toFixed(1)+'" y2="'+(h-3-(ref-mn)/(mx-mn)*(h-6)).toFixed(1)+'" stroke="#A3A3A0" stroke-dasharray="3 3" stroke-width="1"/>':"";
  var l=pts[pts.length-1];return '<svg viewBox="0 0 '+w+' '+h+'">'+r+'<path d="'+p+'" fill="none" stroke="'+col+'" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+l[0]+'" cy="'+l[1]+'" r="2.6" fill="'+col+'"/></svg>';}

var state={v:"ensemble",z:"all",dseg:"all",cseg:"all",aseg:"all"};
var CH={};
var ZL=D.zones;
function inZ(z){return state.z=="all"||!z||z==state.z;}
function inZs(z){return state.z=="all"||z==state.z;}

/* ---------- chiffres par zone ---------- */
function apps(){return D.apps.filter(function(a){return inZs(a.z||a.zone);});}
function stats(){
  var A=apps(), arret=A.filter(function(a){return a.st=="arret";}), surv=A.filter(function(a){return a.st=="surv";});
  var Tk=D.tickets.filter(function(t){return inZs(t.z);});
  var arr=Tk.map(function(t){return t.arr;});
  var mean=arr.reduce(function(a,b){return a+b;},0)/Math.max(arr.length,1);
  var lt=arr.filter(function(x){return x<=60;}).length/Math.max(arr.length,1)*100;
  var Ct=D.contrats.filter(function(c){return inZs(c.z);});
  var mrr=Ct.reduce(function(a,c){return a+c.annuel;},0)/12;
  var all=state.z=="all";
  return {n:A.length,arret:arret.length,surv:surv.length,dispo:all?K.dispo:(A.length-arret.length)/A.length*100,
    arr:all?K.arr_moy:mean,lt:all?K.arr_1h:lt,tk:Tk.length,mrr:all?K.mrr:mrr,ct:Ct.length,
    bloq:Tk.filter(function(t){return t.bloq;}).length};
}
function months(){var out=[];for(var i=11;i>=0;i--){var d=new Date(2026,10-i,1);out.push(d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2));}return out;}

/* ---------- graphiques ---------- */
Chart.defaults.font.family='"Inter",system-ui,sans-serif';Chart.defaults.font.size=12;Chart.defaults.color="#6B6B6B";
Chart.defaults.plugins.legend.display=false;Chart.defaults.animation=window.__CAPTURE?false:{duration:300};
Chart.defaults.plugins.tooltip.backgroundColor="#1F2330";Chart.defaults.plugins.tooltip.padding=10;Chart.defaults.plugins.tooltip.cornerRadius=8;
Chart.defaults.maintainAspectRatio=false;
var GRID={color:"#EEF1F5",drawTicks:false},NOG={display:false};
function mk(id,cfg){if(CH[id])CH[id].destroy();var c=$(id);if(!c)return;CH[id]=new Chart(c,cfg);}
var refLine={id:"refLine",afterDatasetsDraw:function(ch,a,o){var y=ch.options.plugins.refLine;if(!y||y.v===undefined)return;var sc=ch.scales[y.axis||"y"];if(!sc)return;var py=sc.getPixelForValue(y.v);var cx=ch.ctx;cx.save();cx.strokeStyle=y.c||"#1F2330";cx.setLineDash([4,4]);cx.lineWidth=1.2;cx.beginPath();cx.moveTo(ch.chartArea.left,py);cx.lineTo(ch.chartArea.right,py);cx.stroke();cx.restore();}};
var todayLine={id:"todayLine",afterDatasetsDraw:function(ch){var o=ch.options.plugins.todayLine;if(!o||o.v===undefined||!ch.scales.x)return;var x=ch.scales.x.getPixelForValue(o.v);var cx=ch.ctx;cx.save();cx.strokeStyle="#1F2330";cx.setLineDash([4,4]);cx.lineWidth=1.2;cx.beginPath();cx.moveTo(x,ch.chartArea.top);cx.lineTo(x,ch.chartArea.bottom);cx.stroke();cx.restore();}};
var centerTxt={id:"centerTxt",afterDraw:function(ch){var o=ch.options.plugins.centerTxt;if(!o||!o.a)return;var a=ch.chartArea,cx=ch.ctx,x=(a.left+a.right)/2,y=(a.top+a.bottom)/2;cx.save();cx.textAlign="center";cx.fillStyle="#1F2330";cx.font='600 26px "Inter",sans-serif';cx.fillText(o.a,x,y+4);cx.fillStyle="#6B6B6B";cx.font='400 12px "Inter",sans-serif';cx.fillText(o.b,x,y+24);cx.restore();}};
Chart.register(refLine,todayLine,centerTxt);

/* ---------- navigation ---------- */
var VIEWS={ensemble:"Ensemble",decisions:"Décisions à prendre",echeancier:"Échéancier",tresorerie:"Trésorerie",alertes:"Alertes"};
function go(v,noScroll){if(!VIEWS[v])v="ensemble";state.v=v;
  document.querySelectorAll(".view").forEach(function(e){e.classList.toggle("on",e.id=="v-"+v);});
  document.querySelectorAll("[data-v]").forEach(function(e){e.classList.toggle("on",e.getAttribute("data-v")==v);});
  $("crumb-v").textContent=VIEWS[v];if(location.hash!="#"+v)history.replaceState(null,"","#"+v);
  render();if(!noScroll)window.scrollTo(0,0);}
document.addEventListener("click",function(e){var b=e.target.closest("[data-v]");if(b){go(b.getAttribute("data-v"));return;}
  var g=e.target.closest("[data-goto]");if(g){go(g.getAttribute("data-goto"));return;}});
window.addEventListener("hashchange",function(){go(location.hash.slice(1),true);});

/* filtre de zone */
function zoneMenu(){var h='<button class="mi'+(state.z=="all"?" on":"")+'" data-z="all"><span class="lgt">'+ic("map-pin")+'</span><span>Toutes les zones<small>'+K.appareils+' appareils, '+K.contrats+' contrats</small></span>'+ic("check","ck")+'</button><div class="msep"></div>';
  Object.keys(ZL).forEach(function(z){var n=D.apps.filter(function(a){return a.z==z;}).length,c=D.contrats.filter(function(x){return x.z==z;}).length;
    h+='<button class="mi'+(state.z==z?" on":"")+'" data-z="'+z+'"><span class="lgt">'+ic("map-pin")+'</span><span>'+ZL[z]+'<small>'+n+' appareils, '+c+' contrats</small></span>'+ic("check","ck")+'</button>';});
  $("z-m").innerHTML=h;}
$("z-b").addEventListener("click",function(e){e.stopPropagation();zoneMenu();$("z-m").classList.toggle("on");});
$("z-m").addEventListener("click",function(e){var b=e.target.closest("[data-z]");if(!b)return;state.z=b.getAttribute("data-z");$("z-m").classList.remove("on");
  $("z-l").textContent=state.z=="all"?"Toutes les zones":ZL[state.z];$("z-b").classList.toggle("on",state.z!="all");render();});
document.addEventListener("click",function(e){if(!e.target.closest(".sel"))$("z-m").classList.remove("on");});

function zchip(){return state.z=="all"?"":'<span class="fchip">'+ic("map-pin")+ZL[state.z]+'<button type="button" data-clear="1" aria-label="Retirer le filtre">'+ic("x")+'</button></span>';}
document.addEventListener("click",function(e){if(e.target.closest("[data-clear]")){state.z="all";$("z-l").textContent="Toutes les zones";$("z-b").classList.remove("on");render();}});

/* volet */
function openDr(k,html){$("dr-k").innerHTML=k;$("dr-b").innerHTML=html;$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").addEventListener("click",closeDr);$("scrim").addEventListener("click",closeDr);
document.addEventListener("keydown",function(e){if(e.key=="Escape")closeDr();});

/* ---------- décisions ---------- */
var CHOIX={};try{CHOIX=JSON.parse(localStorage.getItem("sodebat-dir-choix")||"{}");}catch(e){}
function saveC(){try{localStorage.setItem("sodebat-dir-choix",JSON.stringify(CHOIX));}catch(e){}}
var URG={r:["r","Urgent"],a:["a","Cette semaine"],n:["n","Ce mois-ci"]};
function decs(){return D.decisions.filter(function(d){return inZ(d.z);});}
function quand(d){var n=dj(d.quand);return n<=0?"aujourd'hui":(n==1?"demain":JOURS[pd(d.quand).getDay()]+" "+dshort(d.quand));}
function dcard(d){var u=URG[d.urg],c=CHOIX[d.id];
  return '<div class="card dk'+(c!==undefined?" ok":"")+'"><div class="dk-h"><span class="lgt">'+ic(d.ic)+'</span><span class="cat">'+d.cat+(d.z?" , "+ZL[d.z]:"").replace(" , ",", ")+'</span><span class="pill '+u[0]+'">'+u[1]+'</span></div>'+
  '<h3>'+d.t+'</h3><p class="w">'+d.why+'</p>'+
  '<div class="dk-m"><div><small>Enjeu</small><b>'+M(d.m)+'</b> <small style="display:inline">'+d.ml+'</small></div><div><small>À trancher</small><b>'+(dj(d.quand)<=7?quand(d):dl(d.quand))+'</b></div><div><small>Qui</small><b>'+d.qui.replace("Direction ","Dir. ")+'</b></div></div>'+
  '<div class="dk-f">'+(c!==undefined?'<span class="done">'+ic("circle-check-big")+'Décidé : '+esc(d.opts[c]).slice(0,60)+(d.opts[c].length>60?"…":"")+'</span>':'')+'<button class="btn '+(c!==undefined?"":"pri")+'" data-dec="'+d.id+'" style="margin-left:auto">'+ic("gavel")+(c!==undefined?"Revoir":"Décider")+'</button></div></div>';}
document.addEventListener("click",function(e){var b=e.target.closest("[data-dec]");if(!b)return;var d=D.decisions.filter(function(x){return x.id==b.getAttribute("data-dec");})[0];
  var h='<div class="tags"><span class="pill '+URG[d.urg][0]+'">'+URG[d.urg][1]+'</span><span class="pill n">'+d.cat+'</span></div><h3>'+d.t+'</h3><p class="why">'+d.why+'</p>'+
  '<dl class="props"><dt>Enjeu</dt><dd>'+fm(d.m)+' FCFA '+d.ml+'</dd><dt>À trancher</dt><dd>'+JOURS[pd(d.quand).getDay()]+' '+dl(d.quand)+'</dd><dt>Qui décide</dt><dd>'+d.qui+'</dd></dl>'+
  '<p class="lbl">Choisir une option</p><div class="acts">'+d.opts.map(function(o,i){return '<button class="btn opt'+(CHOIX[d.id]===i?" on":"")+'" data-opt="'+d.id+'|'+i+'"><span class="n">'+String.fromCharCode(65+i)+'</span><span>'+o+(i===d.reco?'<small>Option proposée</small>':'')+'</span></button>';}).join("")+'</div>'+
  (CHOIX[d.id]!==undefined?'<button class="btn" data-undo="'+d.id+'" style="margin-top:12px">'+ic("rotate-ccw")+'Annuler la décision</button>':'')+
  '<p class="dnote">Le choix est noté sur cet appareil pour le suivi de la réunion de direction. Rien n\'est envoyé.</p>';
  openDr(ic("gavel")+"Décision",h);});
document.addEventListener("click",function(e){var b=e.target.closest("[data-opt]");if(b){var p=b.getAttribute("data-opt").split("|");CHOIX[p[0]]=+p[1];saveC();closeDr();render();toast("Décision notée : option "+String.fromCharCode(65+ +p[1]));return;}
  var u=e.target.closest("[data-undo]");if(u){delete CHOIX[u.getAttribute("data-undo")];saveC();closeDr();render();toast("Décision annulée");}});

/* ---------- vue Ensemble ---------- */
function vEnsemble(){var s=stats(),all=state.z=="all";
  var dz=decs().filter(function(d){return CHOIX[d.id]===undefined;});
  $("lede-e").innerHTML=(all?"":"Zone "+ZL[state.z]+". ")+"Le parc tourne à <b>"+pc(s.dispo,1)+"</b> de disponibilité avec <b"+(s.arret?' class="r"':'')+">"+s.arret+" appareil"+(s.arret>1?"s":"")+" à l'arrêt</b>. "+
    (all?"La trésorerie tient jusqu'à Noël, puis passe <span class=\"r\">sous le seuil de sécurité la semaine du 28/12</span>. ":"")+
    "<b>"+dz.length+" décision"+(dz.length>1?"s":"")+"</b> attend"+(dz.length>1?"ent":"")+" la direction."+zchip();
  var mo=months(),byM={};D.tickets.filter(function(t){return inZs(t.z);}).forEach(function(t){(byM[t.m]=byM[t.m]||[]).push(t.arr);});
  var avg=mo.map(function(m){var a=byM[m]||[];return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null;});
  var cnt=mo.map(function(m){return (byM[m]||[]).length;});
  var avgS=avg.filter(function(x){return x!==null;});
  $("kpis-e").innerHTML=
    kc({key:1,ico:"gauge",l:"Disponibilité du parc",v:dec(s.dispo,1).replace(/,0$/,""),u:"%",
      s:'<b>'+(s.n-s.arret)+' sur '+s.n+'</b> appareils en service'+(s.arret?', <span class="r">'+s.arret+' à l\'arrêt</span>':'')})+
    kc({ico:"repeat",l:"Chiffre d'affaires récurrent maintenance",v:dec(s.mrr/1e6,s.mrr<1e7?2:1).replace(/,0+$/,""),u:"M FCFA HT par mois",
      s:'<b>'+s.ct+' contrats</b>, soit '+M(s.mrr*12,1)+' par an',go:"tresorerie"})+
    kc({ico:"timer",l:"Délai moyen d'arrivée sur panne",v:Math.round(s.arr),u:"min",sp:spark(avgS.slice(-6),"#004AAD",60),
      s:'<span class="dl '+(s.lt>=70?"up":"dn")+'">'+Math.round(s.lt)+' %</span> des arrivées en moins d\'une heure, sur '+s.tk+' pannes en 12 mois'});
  var A=apps(),late=K.retard_visites;
  $("kmini-e").innerHTML=[
    ["wrench","Visites préventives faites",all?pc(K.taux_prev,1):"","",all?K.faites+" sur "+K.prev_dues+" dues":"",0,"alertes"],
    ["trending-up","Affaires en cours",M(K.pipeline,1),"FCFA",M(K.pondere,1)+" pondérés",0,"echeancier"],
    ["hand-coins","Créances échues",M(K.echu,1),"FCFA TTC",K.echu_clients+" clients",1,"alertes"],
    ["wallet","Trésorerie disponible",M(K.solde,1),"FCFA","point bas "+M(K.low,1),0,"tresorerie"]
  ].filter(function(x){return all||x[0]!="wrench";}).map(function(x){return '<button class="km'+(x[5]?" bad":"")+'" data-goto="'+x[6]+'"><span class="lgt">'+ic(x[0])+'</span><div><small>'+x[1]+'</small><b>'+(x[2]||x[4])+'<em>'+x[3]+'</em></b><small>'+(x[2]?x[4]:"")+'</small></div></button>';}).join("");
  // donut parc
  var ok=A.length-s.arret-s.surv;
  $("u-parc").textContent=A.length+" appareils";
  mk("c-parc",{type:"doughnut",data:{labels:["En service","Sous surveillance","À l'arrêt"],datasets:[{data:[ok,s.surv,s.arret],backgroundColor:["#004AAD","#38B6FF","#C8352B"],borderWidth:2,borderColor:"#fff"}]},
    options:{cutout:"72%",plugins:{centerTxt:{a:pc(s.dispo,1),b:"disponibles"}}}});
  var types={};A.forEach(function(a){types[a.type]=(types[a.type]||0)+1;});
  $("l-parc").innerHTML=[["#004AAD","En service",ok],["#38B6FF","Sous surveillance",s.surv],["#C8352B","À l'arrêt",s.arret]].map(function(x){return '<div class="r"><i style="background:'+x[0]+'"></i><span>'+x[1]+'</span><b>'+x[2]+'</b></div>';}).join("")+
    '<div class="r"><i style="background:transparent"></i><small>'+Object.keys(types).sort(function(a,b){return types[b]-types[a];}).map(function(t){return types[t]+" "+t.toLowerCase()+(types[t]>1&&!/s$/.test(t)?"s":"");}).join(", ").replace(/monte-charges/,"monte-charges").replace(/monte-maladess/,"monte-malades")+'</small><span></span></div>';
  var ar=A.filter(function(a){return a.st=="arret";});
  $("n-parc").innerHTML=ar.length?"<b>À l'arrêt :</b> "+ar.map(function(a){return a.site+" ("+lc1(a.lib)+")";}).join(", ")+".":"Aucun appareil à l'arrêt dans cette zone.";
  // SAV combo
  mk("c-sav",{type:"bar",data:{labels:mo.map(function(m){return MC[+m.slice(5)-1];}),datasets:[
    {type:"line",label:"Délai moyen",data:avg.map(function(v){return v===null?null:Math.round(v);}),borderColor:"#004AAD",backgroundColor:"#004AAD",pointRadius:3,tension:.3,yAxisID:"y",spanGaps:true,order:1},
    {type:"bar",label:"Pannes",data:cnt,backgroundColor:"#C9DDF3",borderRadius:4,yAxisID:"y2",order:2,barPercentage:.6}]},
    options:{scales:{x:{grid:NOG},y:{grid:GRID,border:{display:false},min:0,suggestedMax:120,ticks:{callback:function(v){return v+" min";},maxTicksLimit:5}},y2:{position:"right",grid:NOG,border:{display:false},min:0,suggestedMax:30,ticks:{maxTicksLimit:4}}},
      plugins:{refLine:{v:60,c:"#6B6B6B"},tooltip:{callbacks:{label:function(c){return c.dataset.yAxisID=="y"?" Délai moyen : "+c.raw+" min":" Pannes : "+c.raw;}}}}}});
  // ventes empilées
  var V=D.ventes,G=[["neuf","#004AAD"],["modern","#38B6FF"],["conf","#7FB8E6"],["maint","#3A3A3B"],["rep","#A3A3A0"]];
  mk("c-ven",{type:"bar",data:{labels:V.mois,datasets:G.map(function(g){return {label:D.gammes[g[0]],data:V[g[0]],backgroundColor:g[1],borderRadius:2,stack:"s",barPercentage:.62};})},
    options:{scales:{x:{stacked:true,grid:NOG},y:{stacked:true,grid:GRID,border:{display:false},ticks:{maxTicksLimit:5,callback:function(v){return v+" M";}}}},
      plugins:{refLine:{v:100,c:"#6B6B6B"},tooltip:{mode:"index",callbacks:{label:function(c){return c.raw?" "+c.dataset.label+" : "+dec(c.raw,2).replace(/,?0+$/,"")+" M":null;},footer:function(it){var t=it.reduce(function(a,c){return a+c.raw;},0);return "Total : "+dec(t,2).replace(/,?0+$/,"")+" M";}}}}}});
  $("lg-ven").innerHTML=G.map(function(g){return '<span><i style="background:'+g[1]+'"></i>'+D.gammes[g[0]]+'</span>';}).join("")+'<span><i class="ln"></i>Objectif indicatif 100 M</span>';
  // décisions courtes
  var dd=decs().slice(0,4);
  $("e-dec").innerHTML=dd.map(function(d){var c=CHOIX[d.id]!==undefined;return '<div class="li" data-dec="'+d.id+'"><div class="who"><span class="lgt">'+ic(d.ic)+'</span><div><p class="nm">'+d.t+'</p><p class="mt2">'+(c?"Décidé":"À trancher "+(dj(d.quand)<=7?quand(d):"le "+dshort(d.quand)))+'</p></div></div><div class="rr"><span class="amt">'+M(d.m)+'</span>'+(c?'<span class="pill g">'+ic("check")+'Fait</span>':'<span class="pill '+URG[d.urg][0]+'">'+URG[d.urg][1]+'</span>')+'</div></div>';}).join("")||'<p class="empty">Aucune décision pour cette zone.</p>';
  // domaines
  var dz2=function(arr){return arr.filter(function(x){return inZ(x.z);});};
  var ren=dz2(D.renouv).filter(function(r){return r.jours<=90&&r.statut!="renouvele";});
  var chz=dz2(D.chantiers);var Tk=D.tickets.filter(function(t){return inZs(t.z);});var opz=D.open.filter(function(t){return inZs(t.z);});
  var ech=D.echus.filter(function(e){return inZs(e.z);});
  $("e-dom").innerHTML=[
    ["trending-up","Commercial",all?[["Affaires en cours",M(K.pipeline)+" sur "+K.affaires+" devis"],["Devis envoyés sous 24 h",pc(K.taux24)],["Appels d'offres ouverts",K.ao_ouverts+" pour "+M(K.ao_montant,0)],["Signé en novembre",M(K.signe_nov*1e6,2)]]:
      [["Contrats à renouveler sous 90 jours",ren.length],["Montant annuel en jeu",M(ren.reduce(function(a,r){return a+r.annuel;},0),2)]],D.sources.commercial,"Tableau commercial"],
    ["wrench","Opérations",[["Visites préventives faites",all?pc(K.taux_prev,1):"toutes zones"],["Visites en retard",all?String(K.retard_visites):"toutes zones",all],["Chantiers en cours",chz.length+(chz.filter(function(c){return c.retard;}).length?", dont "+chz.filter(function(c){return c.retard;}).length+" en retard":"")],["Pièces en rupture",String(K.rupture),1]],D.sources.operations,"Tableau des opérations"],
    ["timer","Service après-vente",[["Pannes sur 12 mois",String(Tk.length)],["Tickets en cours",String(opz.length),opz.length>0],["Personnes bloquées en cabine",String(Tk.filter(function(t){return t.bloq;}).length)],["Rapport envoyé sous 24 h",all?pc(K.rap24):"toutes zones"],["Satisfaction",all?dec(K.sat,1)+" sur 5":"toutes zones"]],D.sources.sav,"Tableau du SAV"],
    ["banknote","Finance",[["Récurrent maintenance",M(s.mrr,1)+" par mois"],["Créances échues",M(ech.reduce(function(a,e){return a+e.ttc;},0),1)+" TTC",1],["Marge maintenance",pc(K.marge_maint,1)],["Marge chantiers en cours",pc(K.marge_ch,1)]],D.sources.finance,"Tableau financier"]
  ].map(function(x){return '<div class="card dc"><p class="dc-h"><span class="lgt">'+ic(x[0])+'</span>'+x[1]+'</p><ul>'+x[2].map(function(r){return '<li><span>'+r[0]+'</span><b'+(r[2]?' class="r"':'')+'>'+r[1]+'</b></li>';}).join("")+'</ul><a class="lnk" href="'+x[3]+'" target="_blank" rel="noopener">Ouvrir le tableau '+x[1].toLowerCase().replace("service après-vente","du service après-vente").replace(/^(commercial|finance)$/,"$1").replace("opérations","des opérations")+ic("arrow-right")+'</a></div>';}).join("");
}

/* ---------- vue Décisions ---------- */
function vDecisions(){var L=decs();
  var segs=[["all","Toutes"],["todo","À trancher"],["done","Décidées"]];
  var cnt={all:L.length,todo:L.filter(function(d){return CHOIX[d.id]===undefined;}).length};cnt.done=cnt.all-cnt.todo;
  $("d-seg").innerHTML=segs.map(function(s){return '<button data-ds="'+s[0]+'" class="'+(state.dseg==s[0]?"on":"")+'">'+s[1]+' <span class="c">'+cnt[s[0]]+'</span></button>';}).join("");
  var tot=L.filter(function(d){return CHOIX[d.id]===undefined;}).reduce(function(a,d){return a+d.m;},0);
  $("lede-d").innerHTML="<b>"+cnt.todo+" décision"+(cnt.todo>1?"s":"")+"</b> à trancher"+(cnt.done?", "+cnt.done+" déjà prise"+(cnt.done>1?"s":""):"")+". Les deux urgentes engagent la fin d'année : l'appel d'offres du centre hospitalier, à rendre lundi, et le point bas de trésorerie du 28/12."+zchip();
  var F=L.filter(function(d){return state.dseg=="all"||(state.dseg=="todo")==(CHOIX[d.id]===undefined);});
  $("d-cards").innerHTML=F.map(dcard).join("")||'<p class="empty card">Rien à afficher.</p>';}
document.addEventListener("click",function(e){var b=e.target.closest("[data-ds]");if(b){state.dseg=b.getAttribute("data-ds");render();}});

/* ---------- vue Échéancier ---------- */
var KIND={contrat:["refresh-cw","Contrat"],ao:["landmark","Appel d'offres"],chantier:["hard-hat","Chantier"]};
function vEcheancier(){var L=D.ech.filter(function(e){return inZ(e.z)&&dj(e.d)>=0&&dj(e.d)<=95;});
  var cnt={all:L.length};["contrat","ao","chantier"].forEach(function(k){cnt[k]=L.filter(function(e){return e.k==k;}).length;});
  $("c-seg").innerHTML=[["all","Tout"],["contrat","Contrats"],["ao","Appels d'offres"],["chantier","Chantiers"]].map(function(s){return '<button data-cs="'+s[0]+'" class="'+(state.cseg==s[0]?"on":"")+'">'+s[1]+' <span class="c">'+cnt[s[0]]+'</span></button>';}).join("");
  var sev=L.filter(function(e){return dj(e.d)<=7;});
  $("lede-c").innerHTML="<b>"+L.length+" échéances</b> d'ici fin février, dont <b>"+sev.length+"</b> dans les 7 prochains jours. "+(state.z=="all"?"La plus proche : l'offre du centre hospitalier régional, lundi 30/11, avec la caution et l'offre financière encore à boucler.":"")+zchip();
  var ren=L.filter(function(e){return e.k=="contrat"&&e.st!="Renouvelé";}),ao=L.filter(function(e){return e.k=="ao"&&!/Offre déposée/.test(e.st);}),ch=L.filter(function(e){return e.k=="chantier";});
  $("kpis-c").innerHTML=kc({key:1,ico:"refresh-cw",l:"Contrats à renouveler sous 90 jours",v:state.z=="all"?K.renouv90_n:ren.filter(function(e){return dj(e.d)<=90;}).length,u:"contrats",
      s:state.z=="all"?'<b>'+M(K.renouv90_m,2)+' FCFA par an</b>, '+K.renouv90_app+' appareils, <span class="r">'+K.renouv_risque+' à risque</span>':'<b>'+M(ren.filter(function(e){return dj(e.d)<=90;}).reduce(function(a,e){return a+e.m;},0),2)+' FCFA par an</b>'})+
    kc({ico:"landmark",l:"Appels d'offres à remettre",v:ao.length,u:"offres",s:'<b>'+M(ao.reduce(function(a,e){return a+e.m;},0),0)+' FCFA</b>'+(ao.length?', dont '+ao.filter(function(e){return dj(e.d)<=7;}).length+' sous 7 jours':'')})+
    kc({ico:"hard-hat",l:"Réceptions de chantier",v:ch.length,u:"chantiers",s:ch.filter(function(e){return e.bad;}).length?'<span class="r">'+ch.filter(function(e){return e.bad;}).length+' en retard</span>, retard maximal '+Math.max.apply(null,D.chantiers.filter(function(c){return inZ(c.z);}).map(function(c){return c.retard;}))+' jours':'Toutes dans les temps'});
  // gantt
  var C=D.chantiers.filter(function(c){return inZ(c.z);});
  $("gt-w").style.height=Math.max(140,C.length*44+60)+"px";
  var t0=function(s){return pd(s).getTime();};
  mk("c-gantt",{type:"bar",data:{labels:C.map(function(c){var n=c.client.replace("Résidence ","Rés. ").replace("Immeuble ","Imm. ");return window.innerWidth<700?n.replace(/^(Rés\. |Imm\. |Clinique |Villa )/,"").replace(/^Les /,""):n;}),datasets:[
      {label:"Prévu",data:C.map(function(c){return [t0(c.d0),t0(c.fin_p)];}),backgroundColor:"#C9DDF3",borderRadius:4,barPercentage:.7,categoryPercentage:.9,grouped:false,order:2},
      {label:"Glissement",data:C.map(function(c){return c.retard?[t0(c.fin_p),t0(c.fin_r)]:null;}),backgroundColor:"#C8352B",borderRadius:4,barPercentage:.32,categoryPercentage:.9,grouped:false,order:1},
      {label:"Avancement",data:C.map(function(c){return [t0(c.d0),Math.min(t0(T),t0(c.fin_r))];}),backgroundColor:"#004AAD",borderRadius:4,barPercentage:.32,categoryPercentage:.9,grouped:false,order:0}]},
    options:{indexAxis:"y",scales:{x:{type:"linear",min:t0("2026-08-01"),max:t0("2027-02-01"),grid:GRID,border:{display:false},afterBuildTicks:function(ax){var t=[];for(var m=7;m<=13;m++){t.push({value:new Date(2026,m,1).getTime()});}ax.ticks=window.innerWidth<700?t.filter(function(x,i){return i%2==1;}):t;},ticks:{maxRotation:0,callback:function(v){var d=new Date(v);return MC[d.getMonth()];}}},y:{grid:NOG,ticks:{font:{size:12}}}},
      plugins:{todayLine:{v:t0(T)},tooltip:{callbacks:{title:function(it){return C[it[0].dataIndex].client;},label:function(c){var x=C[c.dataIndex];
        if(c.datasetIndex==0)return " Prévu : réception le "+dshort(x.fin_p);if(c.datasetIndex==1)return " Réception réelle prévue le "+dshort(x.fin_r)+" ("+x.retard+" j)";return " Étape en cours : "+x.etape;}}}}}});
  // liste
  var F=L.filter(function(e){return state.cseg=="all"||e.k==state.cseg;});
  var h="",cur="";F.forEach(function(e){var m=e.d.slice(0,7);if(m!=cur){if(cur)h+="</div>";cur=m;h+='<p class="mh">'+MOIS[+m.slice(5)-1]+" "+m.slice(0,4)+'</p><div class="card">';}
    var n=dj(e.d);h+='<div class="ev"><div class="dt"><b>'+pd(e.d).getDate()+'</b><small>'+MC[pd(e.d).getMonth()]+'</small></div><div><p class="tt">'+e.t+'</p><p class="ss">'+e.s+'</p><div class="tg"><span class="pill n">'+ic(KIND[e.k][0])+KIND[e.k][1]+'</span>'+(e.z?'<span class="pill n">'+ZL[e.z]+'</span>':'')+(e.risque||[]).map(function(r){return '<span class="pill a">'+r+'</span>';}).join("")+'</div></div>'+
      '<div class="rt"><b>'+M(e.m,e.m<1e7?2:1)+'</b><span class="pill '+(e.bad?"r":(/Renouvelé|Dans les temps|complet|déposée/.test(e.st)?"g":"n"))+'">'+e.st+'</span><span class="hint">'+(n==0?"aujourd'hui":"dans "+n+" j")+'</span></div></div>';});
  $("c-list").innerHTML=(h?h+"</div>":'<p class="empty card">Aucune échéance.</p>');}
document.addEventListener("click",function(e){var b=e.target.closest("[data-cs]");if(b){state.cseg=b.getAttribute("data-cs");render();}});

/* ---------- vue Trésorerie ---------- */
function vTresorerie(){var W=D.weeks;
  var lowW=W.filter(function(w){return w.s1==K.low;})[0];
  $("lede-t").innerHTML="Disponible aujourd'hui : <b>"+M(K.solde,1)+" FCFA</b>. Le solde tient jusqu'à Noël puis tombe à <span class=\"r\">"+M(K.low,1)+" la semaine du "+dshort(lowW.a)+"</span>, sous le seuil de sécurité de "+M(K.seuil,0)+" : salaires de décembre et solde SODIMAS partent la même semaine. Les trimestres de maintenance de janvier le remontent à "+M(W[6].s1,1)+"."+(state.z!="all"?' <span class="hint">La trésorerie se lit pour toute l\'entreprise : le filtre de zone ne s\'applique pas ici.</span>':"");
  $("kpis-t").innerHTML=kc({key:1,ico:"wallet",l:"Disponible aujourd'hui",v:dec(K.solde/1e6,1),u:"M FCFA",s:"4 comptes et la caisse"})+
    kc({ico:"trending-down",l:"Point bas sur 13 semaines",v:dec(K.low/1e6,1),u:"M FCFA",s:'<span class="dl dn">sous le seuil</span> semaine du '+dshort(lowW.a)})+
    kc({ico:"hand-coins",l:"Créances échues",v:dec(K.echu/1e6,1),u:"M FCFA TTC",s:'<b>'+M(K.echu_pub,1)+'</b> dus par '+D.pub.length+' établissements publics'})+
    kc({ico:"receipt",l:"Encaissé en novembre",v:dec(K.enc_nov/1e6,1),u:"M FCFA TTC",s:'À émettre en décembre : <b>'+K.dec_n+' factures, '+M(K.dec_ht,1)+' HT</b>'});
  var lab=W.map(function(w){return dshort(w.a);});
  mk("c-tre",{type:"line",data:{labels:lab,datasets:[{data:W.map(function(w){return w.s1/1e6;}),borderColor:"#004AAD",borderWidth:2.2,tension:.25,fill:true,
      backgroundColor:function(c){var ch=c.chart,a=ch.chartArea;if(!a)return "rgba(0,74,173,.08)";var g=ch.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,"rgba(0,74,173,.16)");g.addColorStop(1,"rgba(0,74,173,0)");return g;},
      pointRadius:W.map(function(w){return w.s1==K.low?5:2.5;}),pointBackgroundColor:W.map(function(w){return w.s1<K.seuil?"#C8352B":"#004AAD";}),pointBorderColor:"#fff"}]},
    options:{scales:{x:{grid:NOG,ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:window.innerWidth<700?5:13}},y:{grid:GRID,border:{display:false},min:0,ticks:{maxTicksLimit:5,callback:function(v){return v+" M";}}}},
      plugins:{refLine:{v:K.seuil/1e6,c:"#C8352B"},tooltip:{callbacks:{title:function(it){var w=W[it[0].dataIndex];return "Semaine du "+dshort(w.a)+" au "+dshort(w.b);},label:function(c){return " Solde fin de semaine : "+dec(c.raw,1)+" M";}}}}}});
  mk("c-flux",{type:"bar",data:{labels:lab,datasets:[{label:"Entrées",data:W.map(function(w){return w.in/1e6;}),backgroundColor:"#38B6FF",borderRadius:3,barPercentage:.8,categoryPercentage:.7},
      {label:"Sorties",data:W.map(function(w){return -w.out/1e6;}),backgroundColor:"#3A3A3B",borderRadius:3,barPercentage:.8,categoryPercentage:.7}]},
    options:{scales:{x:{stacked:true,grid:NOG,ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:window.innerWidth<700?5:7}},y:{stacked:true,grid:GRID,border:{display:false},ticks:{maxTicksLimit:6,callback:function(v){return v+" M";}}}},
      plugins:{tooltip:{callbacks:{label:function(c){return " "+c.dataset.label+" : "+dec(Math.abs(c.raw),1)+" M";}}}}}});
  var dl0=K.delai,mx=Math.max(dl0.syn,dl0.ent,dl0.ban,dl0.pub);
  $("t-delai").innerHTML=[["pub",1],["syn"],["ent"],["ban"]].map(function(x){var k=x[0];return '<div class="r'+(x[1]?" top":"")+'"><span class="n">'+D.ctypes[k]+'</span><span class="t"><i style="width:'+(dl0[k]/mx*100)+'%'+(x[1]?";background:#C8352B":"")+'"></i></span><span class="v">'+dl0[k]+' j</span></div>';}).join("");
  var cm=Math.max.apply(null,D.comptes.map(function(c){return c[1];}));
  $("u-cpt").textContent=M(K.solde,1)+" FCFA";
  $("t-cpt").innerHTML=D.comptes.map(function(c,i){return '<div class="r'+(i==0?" top":"")+'"><span class="n">'+c[0]+'</span><span class="t"><i style="width:'+(c[1]/cm*100)+'%"></i></span><span class="v">'+M(c[1],1)+'</span></div>';}).join("");
  $("t-wk").innerHTML='<thead><tr><th>Semaine</th><th class="r">Solde début</th><th class="r">Entrées</th><th class="r">Sorties</th><th class="r">Solde fin</th><th>État</th></tr></thead><tbody>'+
    W.map(function(w){var low=w.s1<K.seuil;return '<tr><td data-l="Semaine" class="w"><b>'+dshort(w.a)+' au '+dshort(w.b)+'</b></td><td class="r" data-l="Solde début">'+M(w.s0,1)+'</td><td class="r" data-l="Entrées">+ '+M(w.in,1)+'</td><td class="r" data-l="Sorties">'+(w.out?"- "+M(w.out,1):"0")+'</td><td class="num" data-l="Solde fin">'+M(w.s1,1)+'</td><td data-l="État">'+(low?'<span class="pill r">'+ic("triangle-alert")+'Sous le seuil</span>':'<span class="pill g">'+ic("check")+'Au-dessus du seuil</span>')+'</td></tr>';}).join("")+'</tbody>';}

/* ---------- vue Alertes ---------- */
var ALOWN={rep:["Chef d'équipe maintenance","Programmer l'expertise","wrench","Expertise programmée, technicien prévenu sur WhatsApp"],
  ren:["Responsable commercial","Préparer la proposition","file-check","Proposition préparée, envoyée au commercial pour relecture"],
  ch:["Conducteur de travaux","Prévenir le client","arrow-right","Client prévenu, nouvelle date envoyée par email"],
  pub:["Recouvrement","Envoyer la relance","hand-coins","Relance envoyée au service financier du client"]},ALDONE={};
document.addEventListener("click",function(e){var b=e.target.closest("[data-al]");if(!b)return;ALDONE[b.getAttribute("data-al")]=ALOWN[b.getAttribute("data-ak")][3];vAlertes();});
function alerts(){var out=[];
  var rep=D.rep.filter(function(r){return inZs(r.z);});
  out.push({k:"rep",ic:"repeat",c:"r",t:"Pannes répétées",s:"3 pannes ou plus en 30 jours sur le même appareil, 12 derniers mois",
    items:rep.map(function(r){return {t:r.site+", "+lc1(r.lib),s:r.n+" pannes à partir du "+dshort(r.debut)+", alerte du "+dshort(r.alerte)+" ; "+r.pannes+" pannes en 12 mois",tag:r.st=="arret"?["r","À l'arrêt"]:(r.st=="surv"?["a","Sous surveillance"]:["g","En service"])};})});
  var ren=D.renouv.filter(function(r){return inZ(r.z)&&r.statut!="renouvele"&&r.risque.length&&r.jours<=90;});
  out.push({k:"ren",ic:"refresh-cw",c:"r",t:"Contrats à risque de non-renouvellement",s:"échéance sous 90 jours, contrat pas encore renouvelé",
    items:ren.map(function(r){return {t:r.client,s:r.risque.map(function(x,i){return i?lc1(x):x;}).join(", ")+" ; fin le "+dshort(r.echeance)+(r.retard?", facture en retard de "+r.retard+" j":""),m:r.annuel,tag:["a",r.statut=="proposition"?"Proposition envoyée":"Proposition à préparer"]};})});
  var ch=D.chantiers.filter(function(c){return inZ(c.z)&&c.retard>0;});
  out.push({k:"ch",ic:"hard-hat",c:"a",t:"Retards de chantier",s:"réception décalée par rapport au planning signé",
    items:ch.sort(function(a,b){return b.retard-a.retard;}).map(function(c){return {t:c.client,s:c.objet+" ; "+(c.etape=="Réception"?"réception en cours, terminée le ":"étape en cours : "+lc1(c.etape)+", réception le ")+dshort(c.fin_r)+" au lieu du "+dshort(c.fin_p),m:c.prix,tag:["r",c.retard+" j de retard"]};})});
  var pub=D.echus.filter(function(e){return e.type=="pub"&&inZs(e.z);});var by={};pub.forEach(function(e){(by[e.client]=by[e.client]||[]).push(e);});
  out.push({k:"pub",ic:"landmark",c:"r",t:"Impayés des établissements publics",s:"factures échues, délai moyen de paiement public "+K.delai.pub+" jours",
    items:Object.keys(by).map(function(c){var L=by[c],old=L.map(function(e){return e.due;}).sort()[0];return {t:c,s:L.length+" facture"+(L.length>1?"s":"")+" échue"+(L.length>1?"s":"")+", la plus ancienne depuis le "+dshort(old)+" ("+(-dj(old))+" j)",m:L.reduce(function(a,e){return a+e.ttc;},0),tag:-dj(old)>90?["r","Plus de 90 jours"]:["a","Échu"]};}).sort(function(a,b){return b.m-a.m;})});
  return out;}
function vAlertes(){var A=alerts(),tot=A.reduce(function(a,x){return a+x.items.length;},0);
  $("a-seg").innerHTML=[["all","Toutes",tot]].concat(A.map(function(a){return [a.k,a.t.replace("Contrats à risque de non-renouvellement","Contrats à risque").replace("Impayés des établissements publics","Impayés publics"),a.items.length];})).map(function(s){return '<button data-as="'+s[0]+'" class="'+(state.aseg==s[0]?"on":"")+'">'+s[1]+' <span class="c">'+s[2]+'</span></button>';}).join("");
  var all=state.z=="all";
  $("lede-a").innerHTML="<b>"+tot+" alertes</b> ouvertes. "+(all?"Les établissements publics doivent <span class=\"r\">"+M(K.echu_pub,1)+" FCFA</span>, soit près des deux tiers des créances échues ; deux immeubles cumulent pannes répétées et risque de non-renouvellement : Les Acajous et l'Hôtel Les Aigrettes.":"")+zchip();
  $("a-list").innerHTML='<div class="al-ban">'+ic("bell-ring")+'<div><b>Chaque matin à 7 h</b>, ces alertes partent par email à la direction et par WhatsApp au responsable de chaque ligne. Un clic sur l\'action la confie et la trace ici.</div></div>'+A.filter(function(a){return state.aseg=="all"||a.k==state.aseg;}).map(function(a){
    return '<div class="card al"><div class="al-h"><span class="ic '+(a.c=="a"?"a":"")+'">'+ic(a.ic)+'</span><div><p class="t">'+a.t+'</p><p class="s">'+a.s+'</p></div><span class="n">'+a.items.length+'</span></div>'+
      (a.items.length?a.items.map(function(i,n){var O=ALOWN[a.k],key=a.k+n,done=ALDONE[key];return '<div class="li li-al"><div><p class="nm">'+i.t+'</p><p class="mt2">'+i.s+'</p><p class="al-own">'+ic("users")+'Suivi : <b>'+O[0]+'</b></p></div><div class="rr">'+(i.m?'<span class="amt">'+M(i.m,i.m<1e7?2:1)+'</span>':'')+'<span class="pill '+i.tag[0]+'">'+i.tag[1]+'</span>'+(done?'<span class="al-done">'+ic("check")+done+'</span>':'<button type="button" class="al-b" data-al="'+key+'" data-ak="'+a.k+'">'+ic(O[2])+(/envoy/.test(i.tag[1])?"Relancer le client":O[1])+'</button>')+'</div></div>';}).join(""):'<p class="empty">Aucune alerte dans cette zone.</p>')+'</div>';}).join("");
  var P=D.pub.filter(function(p){return inZs(p.z);});
  mk("c-pub",{type:"bar",data:{labels:P.map(function(p){return p.client.replace("Immeuble administratif","Imm. administratif").replace("Clinique Les Tecks Bouaké","Clinique Les Tecks");}),datasets:[{data:P.map(function(p){return p.m/1e6;}),backgroundColor:["#C8352B","#E07A70","#EFB2AB"],borderRadius:4,barPercentage:.6}]},
    options:{indexAxis:"y",scales:{x:{grid:GRID,border:{display:false},ticks:{maxTicksLimit:5,callback:function(v){return v+" M";}}},y:{grid:NOG}},plugins:{tooltip:{callbacks:{label:function(c){return " "+dec(c.raw,2)+" M FCFA TTC";}}}}}});
  $("n-pub").innerHTML=P.length?"<b>"+M(P.reduce(function(a,p){return a+p.m;},0),1)+" FCFA</b> échus chez "+P.length+" établissement"+(P.length>1?"s":"")+" public"+(P.length>1?"s":"")+(all?", dont "+M(K.echu_90,1)+" depuis plus de 90 jours.":"."):"Aucun impayé public dans cette zone.";
  var Ap=apps().filter(function(a){return a.pannes>0;});
  var repIds={};D.rep.forEach(function(r){repIds[r.app]=1;});
  mk("c-rep",{type:"scatter",data:{datasets:[
      {label:"Appareils",data:Ap.filter(function(a){return !repIds[a.id];}).map(function(a,i){return {x:a.pannes+((i%5)-2)*.06,y:(i*37%100)/100,a:a};}),backgroundColor:"rgba(0,74,173,.25)",pointRadius:4},
      {label:"Pannes répétées",data:Ap.filter(function(a){return repIds[a.id];}).map(function(a,i){return {x:a.pannes,y:.2+i*.2,a:a};}),backgroundColor:"#C8352B",pointRadius:7}]},
    options:{scales:{x:{grid:GRID,border:{display:false},min:0,suggestedMax:10,title:{display:true,text:"pannes en 12 mois"},ticks:{stepSize:1}},y:{display:false,min:-.1,max:1.1}},
      plugins:{tooltip:{callbacks:{label:function(c){var a=c.raw.a;return " "+a.site+", "+lc1(a.lib)+" : "+a.pannes+" pannes";}}}}}});}
document.addEventListener("click",function(e){var b=e.target.closest("[data-as]");if(b){state.aseg=b.getAttribute("data-as");render();}});

/* ---------- rendu ---------- */
function badges(){var todo=D.decisions.filter(function(d){return CHOIX[d.id]===undefined;}).length,al=alerts().reduce(function(a,x){return a+x.items.length;},0),
  ec=D.ech.filter(function(e){return dj(e.d)>=0&&dj(e.d)<=7;}).length;
  $("k-dec").textContent=todo||"";$("m-dec").textContent=todo||"";$("k-al").textContent=al;$("m-al").textContent=al;$("k-ech").textContent=ec?ec+" sous 7 j":"";}
function render(){badges();({ensemble:vEnsemble,decisions:vDecisions,echeancier:vEcheancier,tresorerie:vTresorerie,alertes:vAlertes})[state.v]();}
var d0=pd(T);$("date").textContent=JOURS[d0.getDay()]+" "+d0.getDate()+" "+MOIS[d0.getMonth()]+" 2026, 8 h";
icons();
window.__K=function(){var s0=state.z;state.z="all";var s=stats();var r={dispo:s.dispo,mrr:s.mrr,arr_moy:s.arr,arr_1h:s.lt,arret:s.arret,tickets:s.tk,ouverts:D.open.length,echu:D.echus.reduce(function(a,e){return a+e.ttc;},0),solde:K.solde,low:Math.min.apply(null,D.weeks.map(function(w){return w.s1;})),pipeline:K.pipeline,pondere:K.pondere};state.z=s0;return r;};
go(location.hash.slice(1)||"ensemble",true);
})();
