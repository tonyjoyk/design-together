import { useState, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────
const PLATFORMS = ['Android App','iOS App','Web — Desktop','Web — Mobile','Cross-platform'];
const USER_TYPES = ['General public','Clinical staff / admin','Expert / professional','Mixed'];
const CHANGE_TYPES = ['Add fields or content','Add a new feature','Improve what exists','Restructure or reorganise','New screen'];
const QUESTIONS = [
  {id:'q1',text:'Will the CV risk score update after statins are added?',opts:['Yes — recalculates','No — stays fixed','Not decided yet']},
  {id:'q2',text:'Which risk scoring method?',opts:['Non-lab (no blood tests)','Lab-based (needs cholesterol)','Both']},
  {id:'q3',text:'Store full BMI history or latest value only?',opts:['Latest only','Full history','Latest + flag big changes']},
  {id:'q4',text:'Risk display for diabetic patients with existing CVD?',opts:['Standard score','"Very High Risk" always','Ask product team']},
];
const CAT_ICONS = {form_complexity:'⬜',feature_injection:'✦',navigation_restructuring:'⊞',data_display:'▤',empty_error_states:'◯',onboarding:'→',unclear:'?'};

// ─── Palette ──────────────────────────────────────────────────────
const P = {bg:'#F7F4EF',card:'#FDFCF9',border:'#E8E2D9',text:'#1A1A1A',muted:'#777',faint:'#BBB',primary:'#C4622D',pl:'#FDF1EB'};

// ─── System Prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior UX designer. Analyse UI problems and give specific, practical advice.

Copy rules — apply to every word you write:
- Max 15 words per sentence
- Plain language, 8th grade reading level
- No jargon (no: seamless, leverage, pivotal, delve, cutting-edge)
- Use bullet points for lists
- Direct statements, no hedging

If screenshots are provided, study them and factor them into your analysis.

Return ONLY valid JSON — no markdown, no backticks, nothing else:
{
  "category": "form_complexity|feature_injection|navigation_restructuring|data_display|empty_error_states|onboarding|unclear",
  "categoryLabel": "Short label",
  "categoryDescription": "One sentence. Max 15 words.",
  "pushback": {
    "needed": true,
    "issue": "What is wrong with the request. Max 20 words.",
    "recommendation": "What to do instead. Max 20 words."
  },
  "assumptions": ["Max 12 words each"],
  "blocking": ["Critical missing info. Max 12 words each"],
  "directions": [
    {
      "id": "A",
      "name": "2–4 word name",
      "principle": "Core UX principle",
      "rationale": "Why this fits. Max 15 words.",
      "layout": "What user sees. Key screens. Max 40 words.",
      "watchOut": "When this fails. Max 12 words.",
      "quickWins": ["Actionable. Max 12 words each."]
    },
    {
      "id": "B",
      "name": "2–4 word name",
      "principle": "Core UX principle",
      "rationale": "Why this fits. Max 15 words.",
      "layout": "What user sees. Key screens. Max 40 words.",
      "watchOut": "When this fails. Max 12 words.",
      "quickWins": ["Actionable. Max 12 words each."]
    }
  ]
}
Always return exactly 2 directions.`;

// ─── Atom Components ──────────────────────────────────────────────
function Label({ children }) {
  return <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:P.muted,marginBottom:'8px'}}>{children}</div>;
}
function Card({ children, style={} }) {
  return <div style={{background:P.card,border:`0.5px solid ${P.border}`,borderRadius:'12px',padding:'18px 20px',marginBottom:'12px',...style}}>{children}</div>;
}
function Btn({ label, onClick, disabled }) {
  return (
    <button onClick={disabled?undefined:onClick} style={{width:'100%',padding:'13px',borderRadius:'8px',fontSize:'13.5px',fontWeight:600,cursor:disabled?'default':'pointer',background:disabled?P.border:'#1a1a1a',color:disabled?P.muted:'#fff',border:'none',fontFamily:'inherit',transition:'opacity .15s',opacity:1}}>
      {label}
    </button>
  );
}
function Chip({ label, sel, onClick, dashed }) {
  return (
    <button onClick={onClick} style={{padding:'7px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:sel?600:500,cursor:'pointer',border:`${dashed?'1.5px dashed':'1.5px solid'} ${sel?P.primary:P.border}`,background:sel?P.pl:P.card,color:sel?P.primary:P.muted,fontFamily:'inherit',transition:'all .15s'}}>
      {label}
    </button>
  );
}

// ─── ChipGroup with Other ─────────────────────────────────────────
function ChipGroup({ label, options, value, onValue, otherText, onOtherText }) {
  const isOther = value === '__other__';
  return (
    <div style={{marginBottom:'20px'}}>
      <Label>{label}</Label>
      <div style={{display:'flex',flexWrap:'wrap',gap:'7px',marginBottom:isOther?'10px':0}}>
        {options.map(o => <Chip key={o} label={o} sel={value===o} onClick={()=>onValue(o)}/>)}
        <Chip label="Other" sel={isOther} onClick={()=>onValue('__other__')} dashed/>
      </div>
      {isOther && (
        <input autoFocus type="text" value={otherText} onChange={e=>onOtherText(e.target.value)} placeholder="Type your answer…"
          style={{display:'block',width:'100%',padding:'9px 12px',border:`1.5px solid ${P.primary}`,borderRadius:'8px',background:P.pl,fontFamily:'inherit',fontSize:'13px',color:P.text,outline:'none'}}/>
      )}
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────
function FileUploadZone({ screenshots, onAdd, onRemove }) {
  const ref = useRef();
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        onAdd({ name:file.name, base64:dataUrl.split(',')[1], mediaType:file.type, preview:dataUrl });
      };
      reader.readAsDataURL(file);
    });
  }
  function onDrop(e) { e.preventDefault(); handleFiles(e.dataTransfer.files); }
  return (
    <div>
      <Label>Upload screenshots <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:'11px'}}>(optional — helps Claude see your current UI)</span></Label>
      {screenshots.length > 0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginBottom:'10px'}}>
          {screenshots.map((s,i) => (
            <div key={i} style={{position:'relative',width:'72px'}}>
              <img src={s.preview} alt={s.name} style={{width:'72px',height:'56px',objectFit:'cover',borderRadius:'6px',border:`0.5px solid ${P.border}`,display:'block'}}/>
              <button onClick={()=>onRemove(i)} style={{position:'absolute',top:'-6px',right:'-6px',width:'18px',height:'18px',borderRadius:'50%',background:'#1a1a1a',color:'#fff',border:'none',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
              <div style={{fontSize:'8px',color:P.muted,marginTop:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
            </div>
          ))}
        </div>
      )}
      <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
        style={{border:`1.5px dashed ${P.border}`,borderRadius:'8px',padding:'16px',textAlign:'center',cursor:'pointer',background:P.bg}}
        onClick={()=>ref.current.click()}>
        <div style={{fontSize:'20px',marginBottom:'4px'}}>↑</div>
        <div style={{fontSize:'12px',color:P.muted}}>Drop images here or click to upload</div>
        <div style={{fontSize:'10px',color:P.faint,marginTop:'3px'}}>PNG, JPG, WEBP</div>
        <input ref={ref} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleFiles(e.target.files)}/>
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────
function LoadingScreen({ msgs }) {
  const [active,setActive] = useState(0);
  useState(()=>{
    if(active>=msgs.length-1) return;
    const t=setTimeout(()=>setActive(i=>i+1),800);
    return()=>clearTimeout(t);
  });
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'70px 0',gap:'16px'}}>
      <div style={{width:'32px',height:'32px',border:`3px solid ${P.border}`,borderTopColor:P.primary,borderRadius:'50%',animation:'spin .75s linear infinite'}}/>
      <div style={{display:'flex',flexDirection:'column',gap:'5px',textAlign:'center'}}>
        {msgs.map((m,i)=><div key={i} style={{fontSize:'13px',color:P.muted,transition:'opacity .3s',opacity:i===active?1:0.25}}>{m}</div>)}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ─── Wireframe SVG Components ──────────────────────────────────────
// Following the wireframe style guide: 320×680 viewBox, grayscale palette,
// phone frame rx=18, status bar #ced4da, nav #495057, cards rx=4 stroke=#c8c8c8
function Phone({ sid, children }) {
  return (
    <svg viewBox="0 0 320 680" width="155" height="330" style={{display:'block',margin:'0 auto'}}>
      <defs><clipPath id={`cp${sid}`}><rect x="10" y="10" width="300" height="660" rx="18"/></clipPath></defs>
      <rect x="10" y="10" width="300" height="660" rx="18" fill="white"/>
      <g clipPath={`url(#cp${sid})`}>{children}</g>
      <rect x="10" y="10" width="300" height="660" rx="18" fill="none" stroke="#000000" strokeWidth="2"/>
    </svg>
  );
}
function SBar() {
  return (<>
    <rect x="10" y="10" width="300" height="22" fill="#ced4da"/>
    <text x="24" y="26" fontSize="9" fill="#495057" fontFamily="sans-serif">9:41</text>
    <text x="294" y="26" fontSize="9" fill="#495057" fontFamily="sans-serif" textAnchor="end">WiFi  Batt</text>
  </>);
}
function NBar({ title, action }) {
  return (<>
    <rect x="10" y="32" width="300" height="44" fill="#495057"/>
    <line x1="30" y1="54" x2="38" y2="47" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="30" y1="54" x2="38" y2="61" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="30" y1="54" x2="48" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="160" y="58" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">{title}</text>
    {action&&<><rect x="262" y="43" width="38" height="22" rx="2" fill="none" stroke="white" strokeWidth="1"/><text x="281" y="58" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">{action}</text></>}
  </>);
}
function SubBand({ name, sub, chip }) {
  return (<>
    <rect x="10" y="76" width="300" height="48" fill="#868e96"/>
    <text x="28" y="97" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">{name}</text>
    <text x="28" y="113" fontSize="10" fill="#ced4da" fontFamily="sans-serif">{sub}</text>
    {chip&&<><rect x="218" y="84" width="82" height="20" rx="10" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="0.5" strokeOpacity="0.4"/><text x="259" y="98" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="bold">{chip}</text></>}
  </>);
}
function SecCard({ x=18, y, w=284, h, title, children, newBadge }) {
  return (<>
    <rect x={x} y={y} width={w} height={h} rx="4" fill="white" stroke="#c8c8c8" strokeWidth="0.75"/>
    <circle cx={x+18} cy={y+15} r="10" fill="#495057"/>
    <text x={x+18} y={y+19} textAnchor="middle" fontSize="12" fill="white" fontFamily="sans-serif">+</text>
    <text x={x+36} y={y+19} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">{title}</text>
    {newBadge&&<><rect x={x+w-50} y={y+7} width="40" height="16" rx="3" fill="#ced4da"/><text x={x+w-30} y={y+19} textAnchor="middle" fontSize="8" fill="#495057" fontFamily="sans-serif">+ NEW</text></>}
    <line x1={x} y1={y+28} x2={x+w} y2={y+28} stroke="#e0e0e0" strokeWidth="0.5"/>
    {children}
  </>);
}
function Field({ x, y, w, label, placeholder }) {
  return (<>
    <text x={x} y={y} fontSize="9" fill="#868e96" fontFamily="sans-serif">{label}</text>
    <rect x={x} y={y+3} width={w} height="26" fill="transparent" stroke="#495057" strokeWidth="1"/>
    <text x={x+8} y={y+20} fontSize="10" fill="#adb5bd" fontFamily="sans-serif">{placeholder||'Input field text'}</text>
  </>);
}
function SaveBar({ y=620 }) {
  return (<>
    <rect x="10" y={y} width="300" height="48" fill="#495057"/>
    <line x1="148" y1={y+24} x2="153" y2={y+30} stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="153" y1={y+30} x2="163" y2={y+18} stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="175" y={y+28} fontSize="12" fontWeight="bold" fill="white" fontFamily="sans-serif">SAVE</text>
  </>);
}

function Screen1() {
  return (<Phone sid="s1">
    <SBar/><NBar title="Register Patient"/>
    {/* Step indicator */}
    <circle cx="120" cy="93" r="9" fill="#495057"/><text x="120" y="97" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif">1</text>
    <line x1="129" y1="93" x2="151" y2="93" stroke="#495057" strokeWidth="1.5"/>
    <circle cx="160" cy="93" r="9" fill="#40c057"/><text x="160" y="97" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif">2</text>
    <line x1="169" y1="93" x2="191" y2="93" stroke="#ced4da" strokeWidth="1.5"/>
    <circle cx="200" cy="93" r="9" fill="white" stroke="#ced4da" strokeWidth="1.5"/><text x="200" y="97" textAnchor="middle" fontSize="9" fill="#ced4da" fontFamily="sans-serif">3</text>
    <text x="160" y="113" textAnchor="middle" fontSize="9" fill="#868e96" fontFamily="sans-serif">Step 2 of 3 — Physical info</text>
    {/* Personal info card */}
    <SecCard y={122} h={104} title="PERSONAL INFO">
      <Field x={28} y={151} w={264} label="Full name"/>
      <Field x={28} y={187} w={264} label="Date of birth" placeholder="DD / MM / YYYY"/>
    </SecCard>
    {/* Physical measurements card — NEW */}
    <SecCard y={234} h={152} title="PHYSICAL MEASUREMENTS" newBadge>
      <Field x={28} y={263} w={120} label="Height (cm)"/>
      <Field x={162} y={263} w={130} label="Weight (kg)"/>
      {/* BMI auto-calc */}
      <text x={28} y={304} fontSize="9" fill="#495057" fontFamily="sans-serif" fontWeight="bold">BMI (auto-calculated)</text>
      <rect x={28} y={308} width={264} height={58} rx="3" fill="#efefef" stroke="#495057" strokeWidth="1" strokeDasharray="4,3"/>
      <text x={90} y={346} textAnchor="middle" fontSize="30" fontWeight="bold" fill="#495057" fontFamily="sans-serif">25.5</text>
      <rect x={118} y={322} width={76} height={20} rx="10" fill="#c8c8c8"/>
      <text x={156} y={336} textAnchor="middle" fontSize="10" fill="#495057" fontFamily="sans-serif">Normal</text>
      <text x={28} y={376} fontSize="9" fill="#868e96" fontFamily="sans-serif">Calculated from height and weight</text>
    </SecCard>
    {/* NEXT CTA */}
    <rect x="18" y="402" width="284" height="43" rx="4" fill="#40c057" stroke="#495057" strokeWidth="1"/>
    <text x="160" y="427" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000000" fontFamily="sans-serif">NEXT</text>
  </Phone>);
}

function Screen2() {
  return (<Phone sid="s2">
    <SBar/><NBar title="Bekele Tadesse" action="EDIT"/>
    <SubBand name="Bekele Tadesse" sub="Male · 56y · Hypertension" chip="● Med Risk · 42%"/>
    {/* Last visit */}
    <SecCard y={132} h={78} title="LAST VISIT">
      <text x={28} y={160} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">BP 148/92</text>
      <rect x={242} y={149} width={44} height={16} rx="3" fill="#efefef" stroke="#c92a2a" strokeWidth="0.75"/>
      <text x={264} y={161} textAnchor="middle" fontSize="9" fill="#c92a2a" fontFamily="sans-serif">HIGH ↑</text>
      <text x={28} y={196} fontSize="10" fill="#868e96" fontFamily="sans-serif">Amlodipine 5mg · Metformin 500mg</text>
    </SecCard>
    {/* Medicines */}
    <SecCard y={218} h={84} title="MEDICINES">
      <text x={28} y={256} fontSize="10" fill="#495057" fontFamily="sans-serif">Amlodipine 5mg · daily</text>
      <text x={28} y={270} fontSize="10" fill="#495057" fontFamily="sans-serif">Metformin 500mg · twice daily</text>
      <text x={28} y={284} fontSize="10" fill="#495057" fontFamily="sans-serif">Rosuvastatin 10mg · daily</text>
    </SecCard>
    {/* Blood pressure */}
    <SecCard y={310} h={52} title="BLOOD PRESSURE">
      <text x={160} y={348} textAnchor="middle" fontSize="10" fill="#adb5bd" fontFamily="sans-serif">No readings added</text>
    </SecCard>
    {/* Assigned facility */}
    <rect x={18} y={370} width={284} height={52} rx="4" fill="white" stroke="#c8c8c8" strokeWidth="0.75"/>
    <text x={28} y={390} fontSize="11" fontWeight="bold" fill="#000" fontFamily="sans-serif">Assigned facility</text>
    <text x={294} y={390} textAnchor="end" fontSize="10" fill="#495057" fontFamily="sans-serif">CHANGE</text>
    <text x={28} y={406} fontSize="10" fill="#495057" fontFamily="sans-serif">Addis Ababa General Hospital</text>
    <SaveBar/>
  </Phone>);
}

function Screen3({ iterated }) {
  if (iterated) return (<Phone sid="s3b">
    <SBar/><NBar title="Bekele Tadesse" action="EDIT"/>
    <SubBand name="Bekele Tadesse" sub="Male · 56y · Hypertension" chip="● High Risk · 42%"/>
    {/* Collapsed risk card */}
    <rect x={18} y={132} width={284} height={44} rx="4" fill="#efefef" stroke="#c8c8c8" strokeWidth="0.75"/>
    <text x={28} y={152} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">CV RISK SCORE</text>
    <rect x={148} y={138} width={78} height={20} rx="10" fill="#868e96"/>
    <text x={187} y={152} textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">42% · High</text>
    <line x1="278" y1="152" x2="284" y2="158" stroke="#495057" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="284" y1="158" x2="290" y2="152" stroke="#495057" strokeWidth="1.5" strokeLinecap="round"/>
    <text x={294} y={170} textAnchor="end" fontSize="9" fill="#868e96" fontFamily="sans-serif">Tap to expand</text>
    {/* Last visit */}
    <SecCard y={184} h={78} title="LAST VISIT">
      <text x={28} y={212} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">BP 148/92</text>
      <rect x={242} y={201} width={44} height={16} rx="3" fill="#efefef" stroke="#c92a2a" strokeWidth="0.75"/>
      <text x={264} y={213} textAnchor="middle" fontSize="9" fill="#c92a2a" fontFamily="sans-serif">HIGH ↑</text>
      <text x={28} y={244} fontSize="10" fill="#868e96" fontFamily="sans-serif">Amlodipine 5mg · Metformin 500mg</text>
    </SecCard>
    {/* Statin alert */}
    <rect x={18} y={270} width={284} height={44} rx="2" fill="#efefef" stroke="#c92a2a" strokeWidth="1"/>
    <ellipse cx={38} cy={292} rx={11} ry={11} fill="none" stroke="#c92a2a" strokeWidth="1"/>
    <text x={38} y={296} textAnchor="middle" fontSize="11" fill="#c92a2a" fontFamily="sans-serif">!</text>
    <text x={56} y={288} fontSize="10" fontWeight="bold" fill="#c92a2a" fontFamily="sans-serif">Statin review needed</text>
    <text x={56} y={302} fontSize="9" fill="#c92a2a" fontFamily="sans-serif">Consider Atorvastatin 10mg daily</text>
    {/* Medicines */}
    <SecCard y={322} h={72} title="MEDICINES">
      <text x={28} y={350} fontSize="10" fill="#495057" fontFamily="sans-serif">Amlodipine 5mg · daily</text>
      <text x={28} y={364} fontSize="10" fill="#495057" fontFamily="sans-serif">Metformin 500mg · twice daily</text>
      <text x={28} y={378} fontSize="9" fill="#868e96" fontFamily="sans-serif">+ 1 more</text>
    </SecCard>
    <SaveBar/>
  </Phone>);

  return (<Phone sid="s3">
    <SBar/><NBar title="Bekele Tadesse" action="EDIT"/>
    {/* Full CV risk panel — always visible, Direction B */}
    <rect x={10} y={76} width={300} height={108} fill="#efefef"/>
    <line x1="10" y1="183" x2="310" y2="183" stroke="#c8c8c8" strokeWidth="0.5"/>
    <text x={28} y={96} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">CV RISK SCORE</text>
    <text x={28} y={130} fontSize="38" fontWeight="bold" fill="#495057" fontFamily="sans-serif">42%</text>
    <rect x={104} y={110} width={80} height={24} rx="12" fill="#868e96"/>
    <text x={144} y={126} textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif">HIGH RISK</text>
    {/* Risk bar */}
    <rect x={28} y={148} width={264} height={8} rx="4" fill="#ced4da"/>
    <rect x={28} y={148} width={158} height={8} rx="4" fill="#868e96"/>
    <rect x={183} y={143} width={4} height={18} rx="1" fill="#000000"/>
    <text x={28} y={168} fontSize="9" fill="#868e96" fontFamily="sans-serif">Low</text>
    <text x={160} y={168} textAnchor="middle" fontSize="9" fill="#868e96" fontFamily="sans-serif">Medium</text>
    <text x={294} y={168} textAnchor="end" fontSize="9" fill="#868e96" fontFamily="sans-serif">High</text>
    {/* Last visit */}
    <SecCard y={191} h={66} title="LAST VISIT">
      <text x={28} y={219} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">BP 148/92</text>
      <rect x={242} y={208} width={44} height={16} rx="3" fill="#efefef" stroke="#c92a2a" strokeWidth="0.75"/>
      <text x={264} y={220} textAnchor="middle" fontSize="9" fill="#c92a2a" fontFamily="sans-serif">HIGH ↑</text>
      <text x={28} y={245} fontSize="9" fill="#868e96" fontFamily="sans-serif">14 May 2025</text>
    </SecCard>
    {/* Statin alert */}
    <rect x={18} y={265} width={284} height={44} rx="2" fill="#efefef" stroke="#c92a2a" strokeWidth="1"/>
    <ellipse cx={38} cy={287} rx={11} ry={11} fill="none" stroke="#c92a2a" strokeWidth="1"/>
    <text x={38} y={291} textAnchor="middle" fontSize="11" fill="#c92a2a" fontFamily="sans-serif">!</text>
    <text x={56} y={283} fontSize="10" fontWeight="bold" fill="#c92a2a" fontFamily="sans-serif">Statin recommended</text>
    <text x={56} y={297} fontSize="9" fill="#c92a2a" fontFamily="sans-serif">Consider Atorvastatin 10mg daily</text>
    {/* Medicines */}
    <SecCard y={317} h={72} title="MEDICINES">
      <text x={28} y={345} fontSize="10" fill="#495057" fontFamily="sans-serif">Amlodipine 5mg · daily</text>
      <text x={28} y={359} fontSize="10" fill="#495057" fontFamily="sans-serif">Metformin 500mg · twice daily</text>
      <text x={28} y={373} fontSize="9" fill="#868e96" fontFamily="sans-serif">+ 1 more</text>
    </SecCard>
    <SaveBar/>
  </Phone>);
}

function Screen4() {
  return (<Phone sid="s4">
    <SBar/><NBar title="Bekele Tadesse" action="EDIT"/>
    <SubBand name="Bekele Tadesse" sub="Male · 56y · Hypertension"/>
    {/* Last visit */}
    <SecCard y={132} h={78} title="LAST VISIT">
      <text x={28} y={160} fontSize="11" fontWeight="bold" fill="#495057" fontFamily="sans-serif">BP 148/92</text>
      <rect x={242} y={149} width={44} height={16} rx="3" fill="#efefef" stroke="#c92a2a" strokeWidth="0.75"/>
      <text x={264} y={161} textAnchor="middle" fontSize="9" fill="#c92a2a" fontFamily="sans-serif">HIGH ↑</text>
      <text x={28} y={192} fontSize="10" fill="#868e96" fontFamily="sans-serif">Amlodipine 5mg · Metformin 500mg</text>
    </SecCard>
    {/* Medicines */}
    <SecCard y={218} h={72} title="MEDICINES">
      <text x={28} y={246} fontSize="10" fill="#495057" fontFamily="sans-serif">Amlodipine 5mg · daily</text>
      <text x={28} y={260} fontSize="10" fill="#495057" fontFamily="sans-serif">Metformin 500mg · twice daily</text>
      <text x={28} y={274} fontSize="9" fill="#868e96" fontFamily="sans-serif">Rosuvastatin 10mg · daily</text>
    </SecCard>
    {/* Contextual statin review — only when risk ≥10% */}
    <rect x={18} y={298} width={284} height={56} rx="2" fill="#efefef" stroke="#495057" strokeWidth="1"/>
    <ellipse cx={38} cy={326} rx={11} ry={11} fill="none" stroke="#495057" strokeWidth="1"/>
    <text x={38} y={330} textAnchor="middle" fontSize="9" fill="#495057" fontFamily="sans-serif">i</text>
    <text x={56} y={318} fontSize="10" fontWeight="bold" fill="#495057" fontFamily="sans-serif">Statin review needed</text>
    <text x={56} y={331} fontSize="9" fill="#495057" fontFamily="sans-serif">Risk ≥10%. Consider dose increase.</text>
    <text x={56} y={344} fontSize="8" fill="#868e96" fontFamily="sans-serif">Shows only when action is needed</text>
    {/* Blood pressure */}
    <SecCard y={362} h={52} title="BLOOD PRESSURE">
      <text x={160} y={400} textAnchor="middle" fontSize="10" fill="#adb5bd" fontFamily="sans-serif">No readings added</text>
    </SecCard>
    {/* Risk footnote — always present but minimal */}
    <text x={28} y={430} fontSize="9" fill="#adb5bd" fontFamily="sans-serif">CV risk: 42% · Non-lab · 14 May 2025</text>
    <SaveBar/>
  </Phone>);
}

const SCREEN_META = [
  {id:1,title:'Patient registration',sub:'BMI field added — step 2 of 3',tag:'Both directions',tc:'#777'},
  {id:2,title:'Patient profile',sub:'Risk chip in subheader',tag:'Direction A',tc:'#C4622D'},
  {id:3,title:'Patient profile',sub:'Full CV risk panel always visible',tag:'Direction B',tc:'#5B8FA8'},
  {id:4,title:'Patient profile',sub:'Contextual — shows when needed',tag:'Recommended',tc:'#2D6A4F'},
];
const SCREENS = {1:<Screen1/>,2:<Screen2/>};

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState('intake');

  // Intake
  const [platform, setPlatform] = useState('Android App');
  const [platformOther, setPlatformOther] = useState('');
  const [userType, setUserType] = useState('Clinical staff / admin');
  const [userTypeOther, setUserTypeOther] = useState('');
  const [changeType, setChangeType] = useState('Add a new feature');
  const [changeTypeOther, setChangeTypeOther] = useState('');
  const [existing, setExisting] = useState('Simple — a lightweight Android EMR for clinical staff. Tracks hypertensive and diabetic patients. Has a registration form (name, DOB, sex, BP history, smoking status) and a patient profile page. A statin nudge shows only for patients with CVD risk ≥10%. BMI is currently captured only for high-risk patients.');
  const [change, setChange] = useState('1. Add a BMI field to patient registration — Ethiopia wants it for all new patients.\n2. Show the CV risk score permanently on the patient profile, not just as a nudge that disappears after statins are added.');
  const [screenshots, setScreenshots] = useState([]);

  // Analysis result
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [assumptionNote, setAssumptionNote] = useState('');

  // Questions
  const [answers, setAnswers] = useState({});
  const [answerOthers, setAnswerOthers] = useState({});

  // Wireframes
  const [selected, setSelected] = useState(new Set());
  const [iterNote, setIterNote] = useState('');
  const [iterated, setIterated] = useState(false);

  function getVal(val, other) { return val === '__other__' ? other : val; }
  function isAnswered(q) { const a = answers[q.id]; return a && (a !== '__other__' || (answerOthers[q.id]||'').trim()); }
  const allAnswered = QUESTIONS.every(isAnswered);

  async function runAnalysis() {
    setStep('loading-analyse');
    setApiError('');
    const content = [];
    screenshots.forEach(s => content.push({type:'image',source:{type:'base64',media_type:s.mediaType,data:s.base64}}));
    content.push({type:'text',text:`Platform: ${getVal(platform,platformOther)}\nUser type: ${getVal(userType,userTypeOther)}\nChange type: ${getVal(changeType,changeTypeOther)}\n\nWhat exists:\n${existing}\n\nWhat needs to change:\n${change}${screenshots.length>0?`\n\n${screenshots.length} screenshot(s) attached — study them carefully.`:''}`});
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:SYSTEM_PROMPT,messages:[{role:'user',content}]})});
      const data = await res.json();
      const text = data.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'';
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
      setResult(parsed);
      setStep('pushback');
    } catch(e) {
      setApiError('Analysis failed. Check your input and try again.');
      setStep('intake');
    }
  }

  function toggleScreen(id) {
    setSelected(prev => { const n = new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function doIterate() {
    setStep('loading-iter');
    setTimeout(()=>{ setIterated(true); setSelected(new Set()); setStep('wireframes'); }, 2400);
  }

  const pipStep = ['intake','pushback','questions','wireframes'].indexOf(step.replace(/loading-.*/,'pushback'));

  return (
    <div style={{minHeight:'100vh',background:P.bg,fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;}textarea,input{resize:vertical;}`}</style>
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'0 24px 56px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
            <div style={{width:'28px',height:'28px',background:P.primary,borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px'}}>✦</div>
            <div>
              <div style={{fontSize:'13px',fontWeight:600,color:P.text,letterSpacing:'-.01em'}}>DesignBrief</div>
              <div style={{fontSize:'9px',color:P.muted,letterSpacing:'.08em'}}>UI DIRECTION TOOL</div>
            </div>
          </div>
          <div style={{display:'flex',gap:'5px'}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:i<=pipStep?P.primary:P.border,transition:'background .3s'}}/>)}
          </div>
        </div>

        {/* ── INTAKE ── */}
        {step==='intake' && (
          <div>
            <h2 style={{fontSize:'24px',fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",color:P.text,marginBottom:'4px'}}>What's the problem?</h2>
            <p style={{fontSize:'13px',color:P.muted,marginBottom:'20px',lineHeight:1.6}}>Fill in what you know. Pre-filled with an example.</p>
            {apiError && <div style={{padding:'11px 14px',background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:'8px',marginBottom:'14px',fontSize:'13px',color:'#B91C1C'}}>{apiError}</div>}
            <Card>
              <ChipGroup label="Platform" options={PLATFORMS} value={platform} onValue={setPlatform} otherText={platformOther} onOtherText={setPlatformOther}/>
              <ChipGroup label="Users" options={USER_TYPES} value={userType} onValue={setUserType} otherText={userTypeOther} onOtherText={setUserTypeOther}/>
              <ChipGroup label="Type of change" options={CHANGE_TYPES} value={changeType} onValue={setChangeType} otherText={changeTypeOther} onOtherText={setChangeTypeOther}/>
            </Card>
            <Card>
              <div style={{marginBottom:'16px'}}>
                <Label>What exists today</Label>
                <textarea value={existing} onChange={e=>setExisting(e.target.value)} style={{width:'100%',minHeight:'80px',padding:'10px 12px',border:`0.5px solid ${P.border}`,borderRadius:'8px',background:P.bg,fontFamily:'inherit',fontSize:'13px',color:P.text}}/>
              </div>
              <div>
                <Label>What needs to change</Label>
                <textarea value={change} onChange={e=>setChange(e.target.value)} style={{width:'100%',minHeight:'72px',padding:'10px 12px',border:`0.5px solid ${P.border}`,borderRadius:'8px',background:P.bg,fontFamily:'inherit',fontSize:'13px',color:P.text}}/>
              </div>
            </Card>
            <Card style={{marginBottom:'16px'}}>
              <FileUploadZone screenshots={screenshots} onAdd={s=>setScreenshots(p=>[...p,s])} onRemove={i=>setScreenshots(p=>p.filter((_,j)=>j!==i))}/>
            </Card>
            <Btn label="Analyse →" onClick={runAnalysis}/>
          </div>
        )}

        {/* ── LOADING ── */}
        {step==='loading-analyse' && <LoadingScreen msgs={['Reading your brief…','Checking if the request makes sense…','Building directions…']}/>}
        {step==='loading-wires' && <LoadingScreen msgs={['Drawing wireframes…','Laying out screens…','Done.']}/>}
        {step==='loading-iter' && <LoadingScreen msgs={['Applying your feedback…','Redrawing…','Done.']}/>}

        {/* ── PUSHBACK ── */}
        {step==='pushback' && result && (
          <div>
            {/* Recap */}
            <div style={{background:P.bg,border:`0.5px solid ${P.border}`,borderRadius:'8px',padding:'11px 14px',marginBottom:'12px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
              <div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'5px'}}>
                  {[getVal(platform,platformOther),getVal(userType,userTypeOther),getVal(changeType,changeTypeOther)].map(t=><span key={t} style={{background:'#eee',color:P.muted,fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'4px'}}>{t}</span>)}
                </div>
                <div style={{fontSize:'12px',color:P.muted}}>{change.split('\n')[0].slice(0,80)}{change.length>80?'…':''}</div>
              </div>
              <button onClick={()=>setStep('intake')} style={{fontSize:'11px',fontWeight:600,color:P.muted,background:'none',border:`0.5px solid ${P.border}`,padding:'5px 11px',borderRadius:'6px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>Edit ↩</button>
            </div>

            {/* Category */}
            <Card style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'9px',background:P.pl,color:P.primary,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>{CAT_ICONS[result.category]||'?'}</div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}>
                  <span style={{fontSize:'9px',color:P.muted,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Problem type</span>
                  <span style={{background:P.pl,color:P.primary,padding:'2px 9px',borderRadius:'12px',fontSize:'10px',fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase'}}>{result.categoryLabel}</span>
                </div>
                <div style={{fontSize:'13px',color:P.text,lineHeight:1.6}}>{result.categoryDescription}</div>
              </div>
            </Card>

            {/* Blocking gaps */}
            {result.blocking?.length>0 && (
              <div style={{background:'#FEF2F2',border:'1.5px solid #FCA5A5',borderRadius:'12px',padding:'14px 18px',marginBottom:'12px'}}>
                <div style={{fontSize:'10px',fontWeight:700,color:'#DC2626',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'8px'}}>🛑 Missing info — results below are provisional</div>
                {result.blocking.map((b,i)=><div key={i} style={{fontSize:'13px',color:'#555',lineHeight:1.5,marginBottom:'4px'}}>· {b}</div>)}
              </div>
            )}

            {/* Pushback */}
            {result.pushback?.needed && (
              <div style={{borderRadius:'12px',padding:'18px 20px',border:'1.5px solid #F0D97A',background:'#FFFBEB',marginBottom:'12px'}}>
                <div style={{fontSize:'10px',fontWeight:700,color:'#B8860B',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'10px'}}>⚠ Worth checking first</div>
                <div style={{marginBottom:'10px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#B8860B',marginBottom:'4px'}}>The issue</div>
                  <div style={{fontSize:'13px',color:P.text,lineHeight:1.6}}>{result.pushback.issue}</div>
                </div>
                <div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#B8860B',marginBottom:'4px'}}>What we'd suggest instead</div>
                  <div style={{fontSize:'13px',color:P.text,lineHeight:1.6}}>{result.pushback.recommendation}</div>
                </div>
              </div>
            )}

            {/* Assumptions */}
            {result.assumptions?.length>0 && (
              <Card style={{marginBottom:'14px'}}>
                <Label>We assumed these — correct if wrong</Label>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
                  {result.assumptions.map((a,i)=>(
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                      <span style={{color:'#D97706',flexShrink:0,marginTop:'2px',fontSize:'13px'}}>·</span>
                      <span style={{fontSize:'13px',color:P.text,lineHeight:1.55}}>{a}</span>
                    </div>
                  ))}
                </div>
                <Label>Add a correction or note <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span></Label>
                <textarea value={assumptionNote} onChange={e=>setAssumptionNote(e.target.value)} placeholder="e.g. 'BMI will be manually entered, not auto-calculated.'"
                  style={{width:'100%',minHeight:'56px',padding:'10px 12px',border:`0.5px solid ${P.border}`,borderRadius:'8px',background:P.bg,fontFamily:'inherit',fontSize:'13px',color:P.text}}/>
              </Card>
            )}

            <Btn label="Continue to questions →" onClick={()=>setStep('questions')}/>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {step==='questions' && (
          <div>
            <h2 style={{fontSize:'22px',fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",color:P.text,marginBottom:'4px'}}>4 quick questions</h2>
            <p style={{fontSize:'13px',color:P.muted,marginBottom:'20px'}}>Answers shape the wireframes. Tap to select.</p>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'12px'}}>
              <span style={{fontSize:'12px',fontWeight:600,color:allAnswered?'#2D6A4F':P.muted}}>
                {QUESTIONS.filter(isAnswered).length} of {QUESTIONS.length} answered {allAnswered?'✓':''}
              </span>
            </div>
            {QUESTIONS.map(q=>{
              const ans = answers[q.id]||'';
              const other = answerOthers[q.id]||'';
              const isOther = ans==='__other__';
              const done = isAnswered(q);
              return (
                <Card key={q.id} style={{marginBottom:'10px',borderLeft:done?`3px solid #40c057`:'none',borderRadius:done?'0 12px 12px 0':'12px'}}>
                  <div style={{fontSize:'13.5px',fontWeight:500,color:P.text,marginBottom:'10px',lineHeight:1.45}}>{q.text}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'7px',marginBottom:isOther?'8px':0}}>
                    {q.opts.map(o=><Chip key={o} label={o} sel={ans===o} onClick={()=>setAnswers(p=>({...p,[q.id]:o}))}/>)}
                    <Chip label="Other" sel={isOther} onClick={()=>setAnswers(p=>({...p,[q.id]:'__other__'}))} dashed/>
                  </div>
                  {isOther&&<input autoFocus type="text" value={other} onChange={e=>setAnswerOthers(p=>({...p,[q.id]:e.target.value}))} placeholder="Type your answer…"
                    style={{display:'block',width:'100%',padding:'9px 12px',border:`1.5px solid ${P.primary}`,borderRadius:'8px',background:P.pl,fontFamily:'inherit',fontSize:'13px',color:P.text,outline:'none',marginTop:'0'}}/>}
                </Card>
              );
            })}
            <Btn label={allAnswered?'Draw wireframes →':`Answer all ${QUESTIONS.length} to continue (${QUESTIONS.filter(isAnswered).length}/${QUESTIONS.length})`} disabled={!allAnswered} onClick={()=>setStep('wireframes')}/>
            {!allAnswered&&<p style={{textAlign:'center',fontSize:'11px',color:P.faint,marginTop:'8px'}}>Tap an option for each question</p>}
          </div>
        )}

        {/* ── WIREFRAMES ── */}
        {step==='wireframes' && (
          <div>
            <h2 style={{fontSize:'22px',fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif",color:P.text,marginBottom:'4px'}}>{iterated?'Screens updated':'2 directions · 4 screens'}</h2>
            <p style={{fontSize:'13px',color:P.muted,marginBottom:'16px'}}>Tap a screen to select it for iteration.</p>

            {/* Direction summaries from API or fallback */}
            {(result?.directions||[{id:'A',name:'Minimal risk chip',principle:'Progressive Disclosure',rationale:'Shows risk only in the header. Clean for low-risk patients.',watchOut:'May be missed by doctors who skip the header.'},{id:'B',name:'Full risk panel',principle:'Visibility of system status',rationale:'Permanent risk card at top of every profile.',watchOut:'Adds visual weight for 60% of patients who need no action.'}]).map(d=>(
              <div key={d.id} style={{border:`0.5px solid ${P.border}`,borderRadius:'8px',padding:'14px 16px',marginBottom:'10px',background:P.card}}>
                <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'4px'}}>
                  <span style={{fontSize:'10px',fontWeight:700,color:d.id==='A'?P.primary:'#5B8FA8',letterSpacing:'.06em',textTransform:'uppercase'}}>Direction {d.id}</span>
                  <span style={{fontSize:'13px',fontWeight:600,color:P.text}}>{d.name}</span>
                  <span style={{fontSize:'10px',color:P.muted,marginLeft:'auto'}}>{d.principle}</span>
                </div>
                <div style={{fontSize:'12.5px',color:P.muted,lineHeight:1.5,marginBottom:'4px'}}>{d.rationale}</div>
                {d.watchOut&&<div style={{fontSize:'11px',color:'#B8860B',marginTop:'4px'}}>⚠ {d.watchOut}</div>}
              </div>
            ))}

            {/* Screen grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginTop:'8px'}}>
              {SCREEN_META.map(s=>{
                const sel = selected.has(s.id);
                const screen = s.id===3?<Screen3 iterated={iterated}/>:s.id===4?<Screen4/>:(SCREENS[s.id]||<Screen1/>);
                return (
                  <div key={s.id} onClick={()=>toggleScreen(s.id)} style={{display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-start',cursor:'pointer'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      <div style={{width:'22px',height:'22px',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,border:`1.5px solid ${sel?P.primary:P.border}`,background:sel?P.primary:P.card,color:sel?'#fff':P.muted,transition:'all .15s',flexShrink:0}}>{s.id}</div>
                      <div><div style={{fontSize:'11px',fontWeight:600,color:P.text}}>{s.title}</div><div style={{fontSize:'9px',color:P.muted}}>{s.sub}</div></div>
                    </div>
                    <div style={{borderRadius:'14px',overflow:'hidden',border:sel?`3px solid ${P.primary}`:'2px solid #2a2a2a',boxShadow:sel?`0 0 0 4px ${P.pl}`:'none',transition:'all .15s',alignSelf:'center'}}>
                      {screen}
                    </div>
                    <span style={{fontSize:'9px',fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase',color:s.tc,background:`${s.tc}18`,padding:'2px 9px',borderRadius:'10px',border:`1px solid ${s.tc}28`}}>{s.tag}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick wins */}
            {result?.directions?.[0]?.quickWins?.length>0&&(
              <div style={{background:'#F0F7F4',border:'1.5px solid #A7D4BC',borderRadius:'12px',padding:'14px 18px',marginTop:'16px'}}>
                <div style={{fontSize:'10px',fontWeight:700,color:'#2D6A4F',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'10px'}}>✓ Quick wins — apply to any direction</div>
                {[...new Set([...result.directions[0].quickWins,...(result.directions[1]?.quickWins||[])])].slice(0,4).map((w,i)=>(
                  <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start',marginBottom:'7px'}}>
                    <span style={{color:'#2D6A4F',fontWeight:700,flexShrink:0,fontSize:'13px'}}>→</span>
                    <span style={{fontSize:'13px',color:'#333',lineHeight:1.5}}>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Iteration panel */}
            {selected.size>0?(
              <div style={{background:P.bg,border:`1.5px solid ${P.primary}`,borderRadius:'12px',padding:'16px 18px',marginTop:'16px'}}>
                <div style={{fontSize:'10px',fontWeight:700,color:P.primary,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'10px'}}>
                  Iterating on screen{selected.size>1?'s':''} {Array.from(selected).sort().join(', ')}
                </div>
                <textarea value={iterNote} onChange={e=>setIterNote(e.target.value)} placeholder="Describe the change… e.g. 'Screen 3 is too heavy. Try a collapsed version.'"
                  style={{width:'100%',minHeight:'60px',padding:'10px 12px',border:`0.5px solid ${P.border}`,borderRadius:'8px',background:P.card,fontFamily:'inherit',fontSize:'13px',color:P.text,marginBottom:'10px',display:'block'}}/>
                <Btn label={`Regenerate screen${selected.size>1?'s':''} ${Array.from(selected).sort().join(', ')} →`} onClick={doIterate}/>
              </div>
            ):(
              <p style={{fontSize:'12px',color:P.faint,textAlign:'center',marginTop:'14px'}}>Tap a screen to select it for iteration</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
