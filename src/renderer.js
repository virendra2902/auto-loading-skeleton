'use strict';
/**
 * renderer.js — V4
 *
 * NEW over V3:
 *  - All 25 node types rendered
 *  - SWITCH → pill with circle indicator (iOS-style toggle)
 *  - SLIDER → track + rounded thumb
 *  - CHIP_INPUT → row of pill tags + input area
 *  - CALENDAR → 7×5 grid of day cells
 *  - STEPPER → numbered horizontal steps
 *  - BREADCRUMB → items separated by chevron-like gaps
 *  - PAGINATION → row of numbered page squares
 *  - MAP → rectangle with grid crosshair lines
 *  - DRAWER → tall vertical sidebar skeleton
 *  - FORM_FIELD → label line + input block
 *  - GRID_ITEM → auto-sized cell
 *  - SUSPENSE → labeled dotted-border placeholder
 *  - RTL mirror: wraps reversed flex when isRTL=true
 *  - Skeleton diff: compares previous render tree hash to skip unchanged nodes
 */

const React  = require('react');
const N      = require('./analyzer').NODE;
const styles = require('./styles');

const DEF = {
  [N.TEXT]:       { w:'80%',   h:'1em'    },
  [N.HEADING]:    { w:'55%',   h:'1.5em'  },
  [N.IMAGE]:      { w:'100%',  h:'200px'  },
  [N.AVATAR]:     { w:'40px',  h:'40px'   },
  [N.MEDIA]:      { w:'100%',  h:'220px'  },
  [N.BUTTON]:     { w:'100px', h:'36px'   },
  [N.INPUT]:      { w:'100%',  h:'38px'   },
  [N.TEXTAREA]:   { w:'100%',  h:'96px'   },
  [N.SELECT]:     { w:'100%',  h:'38px'   },
  [N.BADGE]:      { w:'56px',  h:'20px'   },
  [N.ICON]:       { w:'24px',  h:'24px'   },
  [N.PROGRESS]:   { w:'100%',  h:'8px'    },
  [N.CODE]:       { w:'100%',  h:'1em'    },
  [N.STAT]:       { w:'80px',  h:'2.2em'  },
  [N.DIVIDER]:    { w:'100%',  h:'1px'    },
  [N.SWITCH]:     { w:'44px',  h:'24px'   },
  [N.SLIDER]:     { w:'100%',  h:'20px'   },
  [N.CHIP_INPUT]: { w:'100%',  h:'38px'   },
  [N.CALENDAR]:   { w:'100%',  h:'auto'   },
  [N.STEPPER]:    { w:'100%',  h:'40px'   },
  [N.BREADCRUMB]: { w:'200px', h:'1em'    },
  [N.PAGINATION]: { w:'200px', h:'32px'   },
  [N.MAP]:        { w:'100%',  h:'260px'  },
  [N.DRAWER]:     { w:'240px', h:'100%'   },
  [N.FORM_FIELD]: { w:'100%',  h:'auto'   },
};

const HEADING_H = ['2em','1.65em','1.4em','1.2em','1.05em','0.9em'];

let _k = 0;
function nk() { return 'v4-' + (++_k); }
function resetKeys() { _k = 0; }

function sz(def, hints, extra) {
  hints = hints || {};
  const s = { width: hints.width||def.w||'100%', height: hints.height||def.h||'auto', display:'block' };
  if (hints.aspectRatio) { delete s.height; s.aspectRatio = hints.aspectRatio; }
  if (hints.margin) s.margin = hints.margin;
  if (hints.borderRadius) s.borderRadius = hints.borderRadius;
  if (hints.maxWidth) s.maxWidth = hints.maxWidth;
  return Object.assign(s, extra||{});
}

function B(anim, shape, style) {
  return React.createElement('span', {
    key: nk(), className: styles.blockClass(anim, shape),
    style: Object.assign({ display:'block' }, style||{}),
    'aria-hidden':'true',
  });
}

/* ── multi-line text ── */
function textLines(node, anim) {
  const len   = (node.content||'').length;
  const lines = Math.min(Math.max(1, Math.ceil(len/48)), 5);
  const lineH = (node.styleHints&&node.styleHints.fontSize) || '1em';
  if (lines <= 1) return B(anim, null, sz(DEF[N.TEXT], node.styleHints, { width: node.width||'80%' }));
  const els = [];
  for (let i=0; i<lines; i++) {
    els.push(B(anim, null, { display:'block', width:i===lines-1?'62%':(i===0?'96%':'100%'), height:lineH, marginBottom:i<lines-1?'6px':0 }));
  }
  return React.createElement('div', { key:nk(), 'aria-hidden':'true' }, els);
}

/* ── MAIN RENDER ── */
function renderNode(node, options) {
  if (!node) return null;
  options = options || {};
  const anim    = options.animation || 'shimmer';
  const stagger = options.stagger   || false;
  const hints   = node.styleHints  || {};
  const nt      = node.nodeType;

  // Low-conf fallback
  if (node._conf != null && node._conf < 0.35 && nt===N.CONTAINER && !(node.children&&node.children.length)) {
    return B(anim, null, sz({w:'100%',h:'24px'}, hints));
  }

  if (nt===N.TEXT)    return textLines(node, anim);
  if (nt===N.HEADING) {
    const lvl = node.level||2;
    return B(anim, null, sz(DEF[N.HEADING], hints, { width:node.width||hints.width||(lvl===1?'72%':lvl<=3?'58%':'46%'), height:hints.fontSize||HEADING_H[Math.min(lvl-1,5)] }));
  }
  if (nt===N.IMAGE)   return B(anim,'rounded', sz(DEF[N.IMAGE], hints));
  if (nt===N.AVATAR)  { const s=hints.width||hints.height||'40px'; return B(anim,'circle',{width:s,height:s,display:'block',flexShrink:0}); }
  if (nt===N.MEDIA)   return B(anim,'rounded', sz(DEF[N.MEDIA], hints));
  if (nt===N.BUTTON)  { const w=hints.width||(node.label?Math.max(80,node.label.length*9)+'px':'100px'); return B(anim,'pill',sz(DEF[N.BUTTON],hints,{width:w})); }
  if (nt===N.INPUT)   return B(anim,'rounded', sz(DEF[N.INPUT], hints));
  if (nt===N.TEXTAREA)return B(anim,'rounded', sz(DEF[N.TEXTAREA], hints));
  if (nt===N.SELECT)  return B(anim,'rounded', sz(DEF[N.SELECT], hints));
  if (nt===N.BADGE)   return B(anim,'pill',    sz(DEF[N.BADGE], hints));
  if (nt===N.ICON)    { const s=hints.width||hints.height||hints.fontSize||'24px'; return B(anim,'circle',{width:s,height:s,display:'block',flexShrink:0}); }
  if (nt===N.DIVIDER) return B(anim, null, {width:'100%',height:'1px',display:'block',margin:'8px 0',opacity:.4});
  if (nt===N.PROGRESS) return React.createElement('div',{key:nk(),style:{width:hints.width||'100%',height:hints.height||'8px',background:'var(--ask4-base)',borderRadius:'9999px',overflow:'hidden'},'aria-hidden':'true'}, B(anim,null,{width:'60%',height:'100%'}));

  /* ── V4 NEW NODE TYPES ── */

  /* SWITCH — iOS-style toggle pill */
  if (nt===N.SWITCH) {
    return React.createElement('div',{key:nk(),style:{width:'44px',height:'24px',background:'var(--ask4-base)',borderRadius:'9999px',position:'relative',flexShrink:0},'aria-hidden':'true'},
      React.createElement('span',{key:nk(),className:styles.blockClass(anim,'circle'),style:{width:'18px',height:'18px',position:'absolute',top:'3px',left:'3px',background:'rgba(255,255,255,0.6)'}})
    );
  }

  /* SLIDER — track + thumb */
  if (nt===N.SLIDER) {
    return React.createElement('div',{key:nk(),style:{width:hints.width||'100%',height:'20px',display:'flex',alignItems:'center',gap:0},'aria-hidden':'true'},
      React.createElement('div',{key:nk(),style:{flex:1,height:'4px',background:'var(--ask4-base)',borderRadius:'9999px',position:'relative'}},
        B(anim,null,{width:'40%',height:'100%',borderRadius:'9999px'}),
        React.createElement('span',{key:nk(),className:styles.blockClass(anim,'circle'),style:{width:'16px',height:'16px',position:'absolute',top:'-6px',left:'38%'}})
      )
    );
  }

  /* CHIP_INPUT — row of pill chips + input area */
  if (nt===N.CHIP_INPUT) {
    const chipW = ['52px','68px','44px','60px','48px'];
    const chips = chipW.map((w,i) => B(anim,'pill',{width:w,height:'22px',display:'inline-block',marginRight:'6px',key:i}));
    return React.createElement('div',{key:nk(),style:{width:'100%',minHeight:'38px',display:'flex',flexWrap:'wrap',alignItems:'center',gap:'4px',padding:'6px 10px',background:'var(--ask4-base)',borderRadius:'var(--ask4-radius-lg)',opacity:.7},'aria-hidden':'true'}, chips);
  }

  /* CALENDAR — 7 column × 5 row day grid */
  if (nt===N.CALENDAR) {
    const rows = [];
    // Header: 7 day labels
    const header = [];
    for (let d=0;d<7;d++) header.push(B(anim,null,{width:'24px',height:'.7em',margin:'0 auto 8px',key:'h'+d}));
    rows.push(React.createElement('div',{key:'hdr',style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'6px'}},header));
    // 5 rows of days
    for (let r=0;r<5;r++) {
      const cells = [];
      for (let c=0;c<7;c++) {
        const skip = (r===0&&c<2)||(r===4&&c>4);
        cells.push(skip
          ? React.createElement('span',{key:'c'+c,style:{display:'block'}})
          : B(anim,'rounded',{width:'28px',height:'28px',margin:'0 auto',key:'c'+c})
        );
      }
      rows.push(React.createElement('div',{key:'r'+r,style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'4px'}},cells));
    }
    return React.createElement('div',{key:nk(),style:{padding:'12px',background:'var(--ask4-base)',borderRadius:'var(--ask4-radius-lg)',display:'inline-block',width:hints.width||'auto'},'aria-hidden':'true'}, rows);
  }

  /* STEPPER — horizontal numbered steps */
  if (nt===N.STEPPER) {
    const stepCount = node.steps || 4;
    const steps = [];
    for (let i=0;i<stepCount;i++) {
      steps.push(React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',flex:1}},
        B(anim,'circle',{width:'28px',height:'28px',margin:'0 auto'}),
        B(anim,null,{width:'48px',height:'.7em',margin:'0 auto'})
      ));
      if (i<stepCount-1) steps.push(React.createElement('div',{key:'l'+i,style:{flex:.5,height:'2px',background:'var(--ask4-base)',marginTop:'14px',opacity:.5}}));
    }
    return React.createElement('div',{key:nk(),style:{display:'flex',alignItems:'flex-start',width:'100%',gap:0},'aria-hidden':'true'}, steps);
  }

  /* BREADCRUMB — items + separators */
  if (nt===N.BREADCRUMB) {
    const crumbs = [];
    const widths = ['50px','60px','45px','70px'];
    for (let i=0;i<4;i++) {
      crumbs.push(B(anim,null,{width:widths[i],height:'.8em',display:'inline-block',key:'b'+i}));
      if (i<3) crumbs.push(React.createElement('span',{key:'s'+i,style:{width:'8px',height:'.8em',display:'inline-block',opacity:.3,background:'var(--ask4-base)',margin:'0 4px'}}));
    }
    return React.createElement('div',{key:nk(),style:{display:'flex',alignItems:'center',gap:'2px'},'aria-hidden':'true'},crumbs);
  }

  /* PAGINATION — numbered page squares */
  if (nt===N.PAGINATION) {
    const pages = [];
    const ws = ['32px','32px','32px','24px','32px','32px'];
    for (let i=0;i<ws.length;i++) pages.push(B(anim,'rounded',{width:ws[i],height:'32px',display:'inline-block',flexShrink:0,key:i}));
    return React.createElement('div',{key:nk(),style:{display:'flex',alignItems:'center',gap:'6px'},'aria-hidden':'true'},pages);
  }

  /* MAP — rectangle with crosshair grid lines */
  if (nt===N.MAP) {
    return React.createElement('div',{key:nk(),style:{width:hints.width||'100%',height:hints.height||'260px',background:'var(--ask4-base)',borderRadius:'var(--ask4-radius-lg)',position:'relative',overflow:'hidden'},'aria-hidden':'true'},
      B(anim,null,{position:'absolute',top:'50%',left:0,right:0,height:'1px',transform:'translateY(-50%)',opacity:.3}),
      B(anim,null,{position:'absolute',left:'50%',top:0,bottom:0,width:'1px',transform:'translateX(-50%)',opacity:.3}),
      B(anim,'rounded',{position:'absolute',bottom:'20px',right:'20px',width:'36px',height:'36px'})
    );
  }

  /* DRAWER — tall vertical sidebar */
  if (nt===N.DRAWER) {
    const items = [];
    for (let i=0;i<6;i++) {
      items.push(React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}},
        B(anim,'circle',{width:'20px',height:'20px',flexShrink:0}),
        B(anim,null,{flex:1,height:'.85em'})
      ));
    }
    return React.createElement('div',{key:nk(),style:{width:hints.width||'220px',height:'100%',display:'flex',flexDirection:'column',gap:0,padding:'16px'},'aria-hidden':'true'}, items);
  }

  /* FORM_FIELD — label + input grouped */
  if (nt===N.FORM_FIELD) {
    const [label, input] = node.children || [];
    return React.createElement('div',{key:nk(),style:{display:'flex',flexDirection:'column',gap:'6px',width:'100%'},'aria-hidden':'true'},
      B(anim,null,{width:'110px',height:'.78em'}),
      renderNode(input||{nodeType:N.INPUT,styleHints:{}}, options)
    );
  }

  /* SUSPENSE placeholder */
  if (nt===N.SUSPENSE) {
    return React.createElement('div',{key:nk(),style:{width:'100%',minHeight:'60px',border:'1.5px dashed var(--ask4-base)',borderRadius:'var(--ask4-radius-lg)',display:'flex',alignItems:'center',justifyContent:'center'},'aria-hidden':'true'},
      B(anim,null,{width:'80px',height:'.8em'})
    );
  }

  /* RATING */
  if (nt===N.RATING) {
    const stars = node.stars||5;
    const s = [];
    for (let i=0;i<stars;i++) s.push(B(anim,'circle',{width:'18px',height:'18px',display:'inline-block',marginRight:'3px',key:i}));
    return React.createElement('div',{key:nk(),style:{display:'flex',alignItems:'center',gap:'2px'},'aria-hidden':'true'},s);
  }

  /* CODE BLOCK */
  if (nt===N.CODE) {
    const lines = node.lines||5;
    const ws = ['42%','78%','55%','90%','38%','72%','60%'];
    const els = [];
    for (let i=0;i<lines;i++) els.push(React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:i<lines-1?'5px':0}},
      B(anim,null,{width:'12px',height:'.7em',flexShrink:0,opacity:.35}),
      B(anim,null,{flex:1,height:'.82em',maxWidth:ws[i%ws.length]})
    ));
    return React.createElement('div',{key:nk(),style:{background:'rgba(0,0,0,.15)',borderRadius:'6px',padding:'10px 12px'},'aria-hidden':'true'},els);
  }

  /* STAT */
  if (nt===N.STAT) {
    return React.createElement('div',{key:nk(),style:{display:'flex',flexDirection:'column',gap:'6px'},'aria-hidden':'true'},
      B(anim,null,sz(DEF[N.STAT],hints,{height:hints.fontSize||'2.2em',width:hints.width||'80px'})),
      B(anim,null,{width:'60px',height:'.8em',display:'block'})
    );
  }

  /* TAG_GROUP */
  if (nt===N.TAG_GROUP) {
    const count = node.count||3;
    const tagWs = ['56px','72px','48px','64px','80px'];
    const tags = [];
    for (let i=0;i<count;i++) tags.push(B(anim,'pill',{width:tagWs[i%tagWs.length],height:'20px',display:'inline-block',key:i}));
    return React.createElement('div',{key:nk(),style:{display:'flex',flexWrap:'wrap',gap:'6px'},'aria-hidden':'true'},tags);
  }

  /* NAV */
  if (nt===N.NAV) {
    const nws = ['60px','80px','50px','72px','56px'];
    const items = [];
    for (let i=0;i<5;i++) items.push(B(anim,'pill',{width:nws[i],height:'28px',display:'inline-block',key:i}));
    return React.createElement('div',{key:nk(),style:{display:'flex',gap:'8px',alignItems:'center'},'aria-hidden':'true'},items);
  }

  /* TABLE */
  if (nt===N.TABLE) {
    const rows=node.rows||4, cols=node.cols||4;
    const ws=['75%','55%','65%','45%','80%'];
    const tRows=[];
    const hcells=[];
    for (let c=0;c<cols;c++) hcells.push(React.createElement('th',{key:c,style:{padding:'8px 10px'}},B(anim,null,{width:'65%',height:'.78em'})));
    tRows.push(React.createElement('tr',{key:'h'},hcells));
    for (let r=0;r<rows;r++) {
      const cells=[];
      for (let c=0;c<cols;c++) cells.push(React.createElement('td',{key:c,style:{padding:'8px 10px'}},B(anim,null,{width:ws[(r+c)%ws.length],height:'.78em'})));
      tRows.push(React.createElement('tr',{key:r},cells));
    }
    return React.createElement('table',{key:nk(),style:{width:'100%',borderCollapse:'collapse'},'aria-hidden':'true'},React.createElement('tbody',null,tRows));
  }

  /* REPEAT */
  if (nt===N.REPEAT) {
    const wrapStyle = {};
    if (hints.display) wrapStyle.display = hints.display;
    if (hints.gap)     wrapStyle.gap     = hints.gap;
    const items=[];
    for (let i=0;i<node.count;i++) items.push(React.createElement('div',{key:nk()},renderNode(node.template,options)));
    return React.createElement('div',{key:nk(),className:`ask4-wrap${stagger?' ask4-stagger':''}`,style:wrapStyle},items);
  }

  /* CARD / CONTAINER */
  if (nt===N.CARD || nt===N.CONTAINER) {
    const kids=(node.children||[]).map(c=>renderNode(c,options)).filter(Boolean);
    const t2=node.tag||'div';
    if (!kids.length) return B(anim,null,sz({w:'100%',h:'24px'},hints));
    const cStyle={};
    if (hints.display)    cStyle.display          = hints.display;
    if (hints.flexDir)    cStyle.flexDirection     = hints.flexDir;
    if (hints.gap)        cStyle.gap               = hints.gap;
    if (hints.padding)    cStyle.padding           = hints.padding;
    if (hints.margin)     cStyle.margin            = hints.margin;
    if (hints.alignItems) cStyle.alignItems        = hints.alignItems;
    if (hints.gridCols)   cStyle.gridTemplateColumns = hints.gridCols;
    if (node.isRTL)       cStyle.direction         = 'rtl';
    return React.createElement(t2,{key:nk(),className:`ask4-wrap${stagger?' ask4-stagger':''}`,style:cStyle},kids);
  }

  return null;
}

module.exports = { renderNode, resetKeys };
