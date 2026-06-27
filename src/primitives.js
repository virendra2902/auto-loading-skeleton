'use strict';
/**
 * primitives.js — V4
 * All V3 primitives retained + new ones:
 *   SkeletonSwitch, SkeletonSlider, SkeletonCalendar,
 *   SkeletonStepper, SkeletonBreadcrumb, SkeletonPagination,
 *   SkeletonMap, SkeletonChipInput, SkeletonKanban, SkeletonChatBubble
 */
const React  = require('react');
const styles = require('./styles');
const ctx    = require('./context');

function useA(p) {
  const c = React.useContext(ctx.SkeletonContext);
  React.useEffect(()=>{styles.injectStyles();},[]);
  if(typeof document!=='undefined') styles.injectStyles();
  return p||c.animation||'shimmer';
}
const B = (anim,shape,style,key) => React.createElement('span',{key:key||undefined,'data-ask4':'',className:styles.blockClass(anim,shape),style:{display:'block',...(style||{})},'aria-hidden':'true'});

/* ── V3 primitives (API unchanged) ── */
function SkeletonBlock(p){const a=useA(p.animation);return B(a,p.shape,{width:p.width||'100%',height:p.height||'16px',...(p.style||{})});}
function SkeletonText(p){const a=useA(p.animation),lines=p.lines||3,lh=p.lineHeight||'1em',gap=p.gap||'7px',lw=p.lastLineWidth||'60%',els=[];for(let i=0;i<lines;i++)els.push(B(a,null,{width:i===lines-1?lw:(i===0?'95%':'100%'),height:lh,marginBottom:i<lines-1?gap:0},'l'+i));return React.createElement('div',{'aria-hidden':'true',style:p.style||{}},els);}
function SkeletonAvatar(p){const a=useA(p.animation),s=p.size||'40px';return B(a,'circle',{width:s,height:s,flexShrink:0,...(p.style||{})});}
function SkeletonImage(p){const a=useA(p.animation);return B(a,'rounded',{width:'100%',height:p.height||'200px',...(p.style||{})});}
function SkeletonBadge(p){const a=useA(p.animation);return B(a,'pill',{width:p.width||'60px',height:'20px',display:'inline-block',...(p.style||{})});}
function SkeletonButton(p){const a=useA(p.animation);return B(a,'pill',{width:p.width||'100px',height:p.height||'36px',...(p.style||{})});}
function SkeletonInput(p){const a=useA(p.animation);return B(a,'rounded',{width:'100%',height:p.height||'38px',...(p.style||{})});}
function SkeletonList(p){const a=useA(p.animation),count=p.count||3,gap=p.gap||'12px',rh=p.rowHeight||'60px',items=[];for(let i=0;i<count;i++)items.push(p.renderItem?React.createElement('div',{key:i},p.renderItem({animation:a,index:i})):B(a,'rounded',{width:'100%',height:rh,marginBottom:i<count-1?gap:0},i));return React.createElement('div',{role:'status','aria-busy':'true'},items);}
function SkeletonForm(p){const a=useA(p.animation),fields=p.fields||3,rows=[];for(let i=0;i<fields;i++)rows.push(React.createElement('div',{key:i,style:{marginBottom:'16px'}},B(a,null,{width:'110px',height:'.8em',marginBottom:'6px'}),B(a,'rounded',{width:'100%',height:'38px'})));rows.push(B(a,'pill',{width:'120px',height:'38px',marginTop:'8px'},'btn'));return React.createElement('div',{role:'status','aria-busy':'true'},rows);}
function SkeletonCard(p){const a=useA(p.animation),showImg=p.image!==false,showAv=p.avatar!==false,lines=p.lines||3,showFoot=p.footer!==false,imgH=p.imageHeight||'180px',parts=[];if(showImg)parts.push(B(a,'rounded',{width:'100%',height:imgH,marginBottom:'12px'},'img'));parts.push(React.createElement('div',{key:'hdr',style:{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}},showAv&&B(a,'circle',{width:'36px',height:'36px',flexShrink:0}),React.createElement('div',{style:{flex:1}},B(a,null,{width:'55%',height:'.9em',marginBottom:'5px'}),B(a,null,{width:'35%',height:'.75em'}))));for(let i=0;i<lines;i++)parts.push(B(a,null,{width:i===lines-1?'65%':'100%',height:'.85em',marginBottom:i<lines-1?'6px':'12px'},'l'+i));if(showFoot)parts.push(React.createElement('div',{key:'foot',style:{display:'flex',gap:'8px'}},B(a,'pill',{width:'60px',height:'24px'},'fa'),B(a,'pill',{width:'60px',height:'24px'},'fb')));return React.createElement('div',{role:'status','aria-busy':'true',style:p.style||{}},parts);}
function SkeletonTable(p){const a=useA(p.animation),rows=p.rows||5,cols=p.cols||4,ws=['75%','55%','65%','45%'],tRows=[];const hc=[];for(let c=0;c<cols;c++)hc.push(React.createElement('th',{key:c,style:{padding:'8px 10px'}},B(a,null,{width:'65%',height:'.78em'})));tRows.push(React.createElement('tr',{key:'h'},hc));for(let r=0;r<rows;r++){const cells=[];for(let c=0;c<cols;c++)cells.push(React.createElement('td',{key:c,style:{padding:'8px 10px'}},B(a,null,{width:ws[(r+c)%ws.length],height:'.78em'})));tRows.push(React.createElement('tr',{key:r},cells));}return React.createElement('div',{role:'status','aria-busy':'true',style:{overflowX:'auto',...(p.style||{})}},React.createElement('table',{style:{width:'100%',borderCollapse:'collapse'},'aria-hidden':'true'},React.createElement('tbody',null,tRows)));}
function SkeletonNav(p){const a=useA(p.animation),count=p.items||5,vert=p.vertical||false,ws=['60px','80px','50px','72px','56px','90px'],items=[];for(let i=0;i<count;i++)items.push(B(a,'pill',{width:ws[i%ws.length],height:'28px',flexShrink:0},i));return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',flexDirection:vert?'column':'row',gap:'8px',alignItems:vert?'flex-start':'center',...(p.style||{})}},items);}
function SkeletonCode(p){const a=useA(p.animation),lines=p.lines||6,ws=['45%','80%','62%','90%','38%','72%'],rows=[];for(let i=0;i<lines;i++)rows.push(React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:i<lines-1?'5px':0}},B(a,null,{width:'14px',height:'.7em',flexShrink:0,opacity:'.35'}),B(a,null,{flex:1,height:'.85em',maxWidth:ws[i%ws.length]})));return React.createElement('div',{role:'status','aria-busy':'true',style:{background:'rgba(0,0,0,.18)',borderRadius:'8px',padding:'12px 14px',...(p.style||{})}},rows);}
function SkeletonStat(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',flexDirection:'column',gap:'8px',...(p.style||{})}},B(a,null,{width:p.width||'90px',height:p.height||'2.2em'}),B(a,null,{width:'65px',height:'.8em'}));}
function SkeletonRating(p){const a=useA(p.animation),stars=p.stars||5,items=[];for(let i=0;i<stars;i++)items.push(B(a,'circle',{width:'18px',height:'18px',display:'inline-block',marginRight:'3px'},i));return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',alignItems:'center',...(p.style||{})}},items);}
function SkeletonProgress(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{width:p.width||'100%',height:p.height||'8px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'9999px',overflow:'hidden',...(p.style||{})},'aria-hidden':'true'},B(a,null,{width:p.value?p.value+'%':'60%',height:'100%'}));}
function SkeletonTimeline(p){const a=useA(p.animation),events=p.events||4,items=[];for(let i=0;i<events;i++)items.push(React.createElement('div',{key:i,style:{display:'flex',gap:'12px',marginBottom:'20px'}},React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center'}},B(a,'circle',{width:'28px',height:'28px',flexShrink:0}),i<events-1&&React.createElement('span',{style:{width:'2px',flex:1,minHeight:'20px',background:'var(--ask4-base,#e2e8f0)',margin:'4px 0',display:'block'}})),React.createElement('div',{style:{flex:1,paddingTop:'4px'}},B(a,null,{width:'45%',height:'.85em',marginBottom:'6px'}),B(a,null,{width:'100%',height:'.75em',marginBottom:'5px'}),B(a,null,{width:'80%',height:'.75em'}))));return React.createElement('div',{role:'status','aria-busy':'true',style:p.style||{}},items);}
function SkeletonProfile(p){const a=useA(p.animation);const parts=[B(a,'rounded',{width:'100%',height:'180px',marginBottom:0},'cover'),React.createElement('div',{key:'hdr',style:{display:'flex',alignItems:'flex-end',gap:'16px',margin:'-32px 0 16px 16px'}},B(a,'circle',{width:'72px',height:'72px',flexShrink:0},'av'),React.createElement('div',{style:{flex:1,paddingBottom:'4px'}},B(a,null,{width:'180px',height:'1.2em',marginBottom:'5px'}),B(a,null,{width:'120px',height:'.85em'}))),React.createElement('div',{key:'bio',style:{marginBottom:'16px'}},B(a,null,{width:'100%',height:'.85em',marginBottom:'6px'}),B(a,null,{width:'90%',height:'.85em',marginBottom:'6px'}),B(a,null,{width:'70%',height:'.85em'})),React.createElement('div',{key:'stats',style:{display:'flex',gap:'24px',marginBottom:'16px'}},...[1,2,3].map(i=>React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',gap:'5px'}},B(a,null,{width:'40px',height:'1.2em'}),B(a,null,{width:'55px',height:'.75em'})))),React.createElement('div',{key:'tags',style:{display:'flex',gap:'8px',flexWrap:'wrap'}},...[56,72,48,64].map((w,i)=>B(a,'pill',{width:w+'px',height:'22px',display:'inline-block'},i)))];return React.createElement('div',{role:'status','aria-busy':'true',style:p.style||{}},parts);}
function SkeletonDashboard(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',flexDirection:'column',gap:'20px',...(p.style||{})}},React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'14px'}},...[1,2,3,4].map(i=>React.createElement('div',{key:i,style:{padding:'14px',background:'rgba(0,0,0,.06)',borderRadius:'10px'}},B(a,null,{width:'80px',height:'1.8em',marginBottom:'8px'}),B(a,null,{width:'60px',height:'.75em'})))),B(a,'rounded',{width:'100%',height:'220px'},'chart'),React.createElement(SkeletonTable,{rows:4,cols:4,animation:a}));}
function SkeletonSearch(p){const a=useA(p.animation),results=p.results||5;return React.createElement('div',{role:'status','aria-busy':'true',style:p.style||{}},B(a,'rounded',{width:'100%',height:'44px',marginBottom:'16px'},'sb'),...Array.from({length:results},(_,i)=>React.createElement('div',{key:i,style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'12px'}},B(a,'rounded',{width:'48px',height:'48px',flexShrink:0}),React.createElement('div',{style:{flex:1}},B(a,null,{width:'60%',height:'.9em',marginBottom:'5px'}),B(a,null,{width:'85%',height:'.75em'})))));}

/* ── V4 NEW PRIMITIVES ── */
function SkeletonSwitch(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{width:'44px',height:'24px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'9999px',position:'relative',flexShrink:0,...(p.style||{})},'aria-hidden':'true'},React.createElement('span',{className:styles.blockClass(a,'circle'),style:{width:'18px',height:'18px',position:'absolute',top:'3px',left:'3px',background:'rgba(255,255,255,0.6)'}}));}
function SkeletonSlider(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{width:p.width||'100%',height:'20px',display:'flex',alignItems:'center',...(p.style||{})},'aria-hidden':'true'},React.createElement('div',{style:{flex:1,height:'4px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'9999px',position:'relative'}},B(a,null,{width:'40%',height:'100%',borderRadius:'9999px'}),React.createElement('span',{className:styles.blockClass(a,'circle'),style:{width:'16px',height:'16px',position:'absolute',top:'-6px',left:'38%'}})));}
function SkeletonCalendar(p){const a=useA(p.animation);const rows=[];const hdr=[];for(let d=0;d<7;d++)hdr.push(B(a,null,{width:'24px',height:'.7em',margin:'0 auto 8px'},'h'+d));rows.push(React.createElement('div',{key:'hdr',style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'6px'}},hdr));for(let r=0;r<5;r++){const cells=[];for(let c=0;c<7;c++){const skip=(r===0&&c<2)||(r===4&&c>4);cells.push(skip?React.createElement('span',{key:'c'+c,style:{display:'block'}}):B(a,'rounded',{width:'28px',height:'28px',margin:'0 auto'},'c'+c));}rows.push(React.createElement('div',{key:'r'+r,style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'4px'}},cells));}return React.createElement('div',{role:'status','aria-busy':'true',style:{padding:'12px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'var(--ask4-radius-lg,10px)',display:'inline-block',width:p.width||'auto',...(p.style||{})},'aria-hidden':'true'},rows);}
function SkeletonStepper(p){const a=useA(p.animation),count=p.steps||4,steps=[];for(let i=0;i<count;i++){steps.push(React.createElement('div',{key:'s'+i,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',flex:1}},B(a,'circle',{width:'28px',height:'28px',margin:'0 auto'}),B(a,null,{width:'48px',height:'.7em',margin:'0 auto'})));if(i<count-1)steps.push(React.createElement('div',{key:'l'+i,style:{flex:.5,height:'2px',background:'var(--ask4-base,#e2e8f0)',marginTop:'14px',opacity:.5}}));}return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',alignItems:'flex-start',width:'100%',...(p.style||{})}},steps);}
function SkeletonBreadcrumb(p){const a=useA(p.animation),crumbs=[],ws=['50px','60px','45px','70px'];for(let i=0;i<4;i++){crumbs.push(B(a,null,{width:ws[i],height:'.8em',display:'inline-block'},'b'+i));if(i<3)crumbs.push(React.createElement('span',{key:'s'+i,style:{width:'8px',height:'.8em',display:'inline-block',opacity:.3,background:'var(--ask4-base,#e2e8f0)',margin:'0 4px'}}));}return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',alignItems:'center',gap:'2px',...(p.style||{})}},crumbs);}
function SkeletonPagination(p){const a=useA(p.animation),pages=[],ws=['32px','32px','32px','24px','32px','32px'];for(let i=0;i<ws.length;i++)pages.push(B(a,'rounded',{width:ws[i],height:'32px',display:'inline-block',flexShrink:0},i));return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',alignItems:'center',gap:'6px',...(p.style||{})}},pages);}
function SkeletonMap(p){const a=useA(p.animation);return React.createElement('div',{role:'status','aria-busy':'true',style:{width:p.width||'100%',height:p.height||'260px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'var(--ask4-radius-lg,10px)',position:'relative',overflow:'hidden',...(p.style||{})},'aria-hidden':'true'},B(a,null,{position:'absolute',top:'50%',left:0,right:0,height:'1px',transform:'translateY(-50%)',opacity:.3}),B(a,null,{position:'absolute',left:'50%',top:0,bottom:0,width:'1px',transform:'translateX(-50%)',opacity:.3}),B(a,'rounded',{position:'absolute',bottom:'20px',right:'20px',width:'36px',height:'36px'}));}
function SkeletonChipInput(p){const a=useA(p.animation),ws=['52px','68px','44px','60px'],chips=ws.map((w,i)=>B(a,'pill',{width:w,height:'22px',display:'inline-block',marginRight:'6px'},i));return React.createElement('div',{role:'status','aria-busy':'true',style:{width:'100%',minHeight:'38px',display:'flex',flexWrap:'wrap',alignItems:'center',gap:'4px',padding:'6px 10px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'var(--ask4-radius-lg,10px)',opacity:.7,...(p.style||{})},'aria-hidden':'true'},chips);}

function SkeletonKanban(p) {
  const a = useA(p.animation), cols = p.cols||3, cards = p.cardsPerCol||3;
  const columns = [];
  for (let c=0;c<cols;c++) {
    const colCards = [];
    for (let k=0;k<cards;k++) colCards.push(React.createElement('div',{key:k,style:{background:'var(--ask4-base,#e2e8f0)',borderRadius:'8px',padding:'10px',marginBottom:'8px'}},B(a,null,{width:'70%',height:'.85em',marginBottom:'6px'}),B(a,null,{width:'90%',height:'.75em',marginBottom:'6px'}),React.createElement('div',{style:{display:'flex',gap:'6px'}},B(a,'circle',{width:'20px',height:'20px',flexShrink:0}),B(a,'pill',{width:'50px',height:'18px'}))));
    columns.push(React.createElement('div',{key:c,style:{flex:1,minWidth:'160px'}},B(a,null,{width:'80px',height:'.9em',marginBottom:'12px'}),colCards));
  }
  return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',gap:'14px',alignItems:'flex-start',overflowX:'auto',...(p.style||{})}},columns);
}

function SkeletonChatBubble(p) {
  const a = useA(p.animation), msgs = p.messages||4;
  const bubbles = [];
  for (let i=0;i<msgs;i++) {
    const own = i%3===1;
    bubbles.push(React.createElement('div',{key:i,style:{display:'flex',justifyContent:own?'flex-end':'flex-start',gap:'8px',marginBottom:'12px',alignItems:'flex-end'}},
      !own && B(a,'circle',{width:'28px',height:'28px',flexShrink:0}),
      React.createElement('div',{style:{maxWidth:'65%'}},
        B(a,'rounded',{width:[120,80,150,100][i%4]+'px',height:'36px'})
      ),
      own && B(a,'circle',{width:'28px',height:'28px',flexShrink:0})
    ));
  }
  return React.createElement('div',{role:'status','aria-busy':'true',style:{display:'flex',flexDirection:'column',...(p.style||{})}},bubbles);
}

[SkeletonBlock,SkeletonText,SkeletonAvatar,SkeletonImage,SkeletonBadge,SkeletonButton,
 SkeletonInput,SkeletonList,SkeletonForm,SkeletonCard,SkeletonTable,SkeletonNav,
 SkeletonCode,SkeletonStat,SkeletonRating,SkeletonProgress,SkeletonTimeline,
 SkeletonProfile,SkeletonDashboard,SkeletonSearch,SkeletonSwitch,SkeletonSlider,
 SkeletonCalendar,SkeletonStepper,SkeletonBreadcrumb,SkeletonPagination,SkeletonMap,
 SkeletonChipInput,SkeletonKanban,SkeletonChatBubble].forEach(C => { if(!C.displayName) C.displayName = C.name; });

module.exports = {
  SkeletonBlock,SkeletonText,SkeletonAvatar,SkeletonImage,SkeletonBadge,SkeletonButton,
  SkeletonInput,SkeletonList,SkeletonForm,SkeletonCard,SkeletonTable,SkeletonNav,
  SkeletonCode,SkeletonStat,SkeletonRating,SkeletonProgress,SkeletonTimeline,
  SkeletonProfile,SkeletonDashboard,SkeletonSearch,SkeletonSwitch,SkeletonSlider,
  SkeletonCalendar,SkeletonStepper,SkeletonBreadcrumb,SkeletonPagination,SkeletonMap,
  SkeletonChipInput,SkeletonKanban,SkeletonChatBubble,
};
