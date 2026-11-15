import { useState, useRef } from 'react';
import LoadingScreen from './components/LoadingScreen.jsx';
import WireframeDisplay from './components/WireframeDisplay.jsx';
import ScreenLightbox from './components/ScreenLightbox.jsx';
import { analyze, generateWireframes, iterateScreens, buildPayload } from './lib/api.js';

const EXISTING_PLACEHOLDER = 'Simple is a lightweight Android EMR for clinical staff. Tracks hypertensive and diabetic patients. Has a registration form (name, DOB, sex, BP history, smoking status) and a patient profile page. A statin nudge shows only for patients with CVD risk ≥10%. BMI is currently captured only for high-risk patients.';
const CHANGE_PLACEHOLDER = '1. Add a BMI field to patient registration and main patient page. Client wants it for all new patients.\n2. Show the CV risk score permanently on the patient profile, not just as a nudge that disappears after statins are added.';

const MAX_PROJECT_FILES = 5;
const MAX_PROJECT_FILE_BYTES = 500 * 1024;
const PROJECT_FILE_EXTENSIONS = ['.txt', '.md', '.json'];

function normalizeId(id) {
  const n = Number(id);
  return Number.isNaN(n) ? id : n;
}

function idsMatch(a, b) {
  return normalizeId(a) === normalizeId(b);
}

const PLATFORMS = ['Android App', 'iOS App', 'Web — Desktop', 'Web — Mobile', 'Cross-platform'];
const USER_TYPES = ['General public', 'Uses software regularly', 'Technical users', 'Mixed'];
const CHANGE_TYPES = ['Add fields or content', 'Add a new feature', 'Improve what exists', 'Restructure or reorganise', 'New screen'];
const CAT_ICONS = { form_complexity: '⬜', feature_injection: '✦', navigation_restructuring: '⊞', data_display: '▤', empty_error_states: '◯', onboarding: '→', unclear: '?' };

const P = { bg: '#F7F4EF', card: '#FDFCF9', border: '#E8E2D9', text: '#1A1A1A', muted: '#777', faint: '#BBB', primary: '#C4622D', pl: '#FDF1EB' };

function Label({ children }) {
  return <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: P.muted, marginBottom: '8px' }}>{children}</div>;
}
function Card({ children, style = {} }) {
  return <div style={{ background: P.card, border: `0.5px solid ${P.border}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '12px', ...style }}>{children}</div>;
}
function Btn({ label, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{ width: '100%', padding: '13px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: disabled ? 'default' : 'pointer', background: disabled ? P.border : '#1a1a1a', color: disabled ? P.muted : '#fff', border: 'none', fontFamily: 'inherit' }}>
      {label}
    </button>
  );
}
function Chip({ label, sel, onClick, dashed }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: sel ? 600 : 500, cursor: 'pointer', border: `${dashed ? '1.5px dashed' : '1.5px solid'} ${sel ? P.primary : P.border}`, background: sel ? P.pl : P.card, color: sel ? P.primary : P.muted, fontFamily: 'inherit' }}>
      {label}
    </button>
  );
}
function ChipGroup({ label, options, value, onValue, otherText, onOtherText }) {
  const isOther = value === '__other__';
  return (
    <div style={{ marginBottom: '20px' }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: isOther ? '10px' : 0 }}>
        {options.map((o) => <Chip key={o} label={o} sel={value === o} onClick={() => onValue(o)} />)}
        <Chip label="Other" sel={isOther} onClick={() => onValue('__other__')} dashed />
      </div>
      {isOther && (
        <input autoFocus type="text" value={otherText} onChange={(e) => onOtherText(e.target.value)} placeholder="Type your answer…"
          style={{ display: 'block', width: '100%', padding: '9px 12px', border: `1.5px solid ${P.primary}`, borderRadius: '8px', background: P.pl, fontFamily: 'inherit', fontSize: '13px', color: P.text, outline: 'none' }} />
      )}
    </div>
  );
}
// Shrinks screenshots so uploads stay under the host's 4.5 MB request limit.
const MAX_IMAGE_EDGE = 1568;
function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

function FileUploadZone({ screenshots, onAdd, onRemove }) {
  const ref = useRef();
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      downscaleImage(file).then((dataUrl) => {
        onAdd({ name: file.name, base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', preview: dataUrl });
      }).catch(() => {});
    });
  }
  function onDrop(e) { e.preventDefault(); handleFiles(e.dataTransfer.files); }
  return (
    <div>
      <Label>Upload screenshots <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '11px' }}>(optional)</span></Label>
      {screenshots.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          {screenshots.map((s, i) => (
            <div key={i} style={{ position: 'relative', width: '72px' }}>
              <img src={s.preview} alt={s.name} style={{ width: '72px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: `0.5px solid ${P.border}`, display: 'block' }} />
              <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#1a1a1a', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
              <div style={{ fontSize: '8px', color: P.muted, marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            </div>
          ))}
        </div>
      )}
      <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
        style={{ border: `1.5px dashed ${P.border}`, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: P.bg }}
        onClick={() => ref.current.click()}>
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>↑</div>
        <div style={{ fontSize: '12px', color: P.muted }}>Drop images here or click to upload</div>
        <div style={{ fontSize: '10px', color: P.faint, marginTop: '3px' }}>PNG, JPG, WEBP</div>
        <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

function ProjectContextZone({ projectContextText, onTextChange, projectFiles, onAddFile, onRemoveFile }) {
  const ref = useRef();

  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (projectFiles.length >= MAX_PROJECT_FILES) return;
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!PROJECT_FILE_EXTENSIONS.includes(ext)) return;
      if (file.size > MAX_PROJECT_FILE_BYTES) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onAddFile({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          content: e.target.result,
        });
      };
      reader.readAsText(file);
    });
  }

  function onDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <Label>
        Project context{' '}
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '11px' }}>(optional)</span>
      </Label>
      <p style={{ fontSize: '12px', color: P.muted, marginBottom: '10px', lineHeight: 1.5 }}>
        Paste product notes, Slack threads, or design language. Upload PRD excerpts as .txt, .md, or .json.
      </p>
      <textarea
        value={projectContextText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="e.g. terminology, visual style, user roles, constraints from your product team…"
        style={{ width: '100%', minHeight: '72px', padding: '10px 12px', border: `0.5px solid ${P.border}`, borderRadius: '8px', background: P.bg, fontFamily: 'inherit', fontSize: '13px', color: P.text, marginBottom: '12px' }}
      />
      {projectFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {projectFiles.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', background: P.bg, borderRadius: '6px', border: `0.5px solid ${P.border}` }}>
              <span style={{ fontSize: '12px', color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button type="button" onClick={() => onRemoveFile(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.muted, fontFamily: 'inherit', fontSize: '12px', flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: `1.5px dashed ${P.border}`, borderRadius: '8px', padding: '14px', textAlign: 'center', cursor: projectFiles.length >= MAX_PROJECT_FILES ? 'default' : 'pointer', background: P.bg, opacity: projectFiles.length >= MAX_PROJECT_FILES ? 0.6 : 1 }}
        onClick={() => projectFiles.length < MAX_PROJECT_FILES && ref.current.click()}
      >
        <div style={{ fontSize: '12px', color: P.muted }}>Upload context files</div>
        <div style={{ fontSize: '10px', color: P.faint, marginTop: '3px' }}>.txt, .md, .json — max {MAX_PROJECT_FILES} files</div>
        <input ref={ref} type="file" accept=".txt,.md,.json,text/plain,text/markdown,application/json" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ padding: '11px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#B91C1C', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontFamily: 'inherit', fontSize: '12px' }}>✕</button>}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState('intake');
  const [platform, setPlatform] = useState('Android App');
  const [platformOther, setPlatformOther] = useState('');
  const [userType, setUserType] = useState('General public');
  const [userTypeOther, setUserTypeOther] = useState('');
  const [changeType, setChangeType] = useState('Add a new feature');
  const [changeTypeOther, setChangeTypeOther] = useState('');
  const [existing, setExisting] = useState('');
  const [change, setChange] = useState('');
  const [projectContextText, setProjectContextText] = useState('');
  const [projectFiles, setProjectFiles] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [lightboxScreen, setLightboxScreen] = useState(null);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [assumptionNote, setAssumptionNote] = useState('');
  const [answers, setAnswers] = useState({});
  const [answerOthers, setAnswerOthers] = useState({});
  const [screens, setScreens] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [iterNote, setIterNote] = useState('');
  const [iterated, setIterated] = useState(false);

  const questions = result?.questions || [];
  function getVal(val, other) { return val === '__other__' ? other : val; }
  function isAnswered(q) { const a = answers[q.id]; return a && (a !== '__other__' || (answerOthers[q.id] || '').trim()); }
  const allAnswered = questions.length > 0 && questions.every(isAnswered);

  function getState() {
    return {
      platform, platformOther, userType, userTypeOther, changeType, changeTypeOther,
      existing, change, screenshots, projectContextText, projectFiles,
      result, answers, answerOthers, assumptionNote,
      screens, selected, iterNote,
    };
  }

  async function runAnalysis() {
    setStep('loading-analyse');
    setApiError('');
    try {
      const data = await analyze(buildPayload(getState(), { profile: 'analyze' }));
      setResult(data);
      setAnswers({});
      setAnswerOthers({});
      setStep('pushback');
    } catch (e) {
      setApiError(e.message || 'Analysis failed. Check your input and try again.');
      setStep('intake');
    }
  }

  async function runWireframes() {
    setStep('loading-wires');
    setApiError('');
    try {
      const data = await generateWireframes(buildPayload(getState(), { profile: 'wireframes' }));
      setScreens((data.screens || []).map((s) => ({ ...s, id: normalizeId(s.id) })));
      setStep('wireframes');
    } catch (e) {
      setApiError(e.message || 'Wireframe generation failed. Try again.');
      setStep('questions');
    }
  }

  async function doIterate() {
    if (!iterNote.trim()) return;
    setStep('loading-iter');
    setApiError('');
    try {
      const data = await iterateScreens(buildPayload(getState(), { profile: 'iterate' }));
      const updated = data.screens || [];
      let applied = 0;
      setScreens((prev) => prev.map((s) => {
        const u = updated.find((x) => idsMatch(x.id, s.id));
        if (!u) return s;
        applied += 1;
        return { ...s, ...u, id: normalizeId(u.id ?? s.id) };
      }));
      if (applied === 0) {
        setApiError('Regeneration did not apply — try more specific feedback.');
        setStep('wireframes');
        return;
      }
      setIterated(true);
      setSelected(new Set());
      setIterNote('');
      setStep('wireframes');
    } catch (e) {
      setApiError(e.message || 'Iteration failed. Try again.');
      setStep('wireframes');
    }
  }

  function toggleScreen(id) {
    const nid = normalizeId(id);
    setSelected((prev) => {
      const n = new Set([...prev].map(normalizeId));
      if (n.has(nid)) n.delete(nid);
      else n.add(nid);
      return n;
    });
  }

  const stepForPip = step.replace(/loading-.*/, (m) => {
    if (m === 'loading-analyse') return 'intake';
    if (m === 'loading-wires') return 'questions';
    if (m === 'loading-iter') return 'wireframes';
    return 'pushback';
  });
  const pipStep = ['intake', 'pushback', 'questions', 'wireframes'].indexOf(
    ['intake', 'pushback', 'questions', 'wireframes'].includes(stepForPip) ? stepForPip : 'pushback',
  );

  const screenCount = screens.length;
  const directionFallback = [
    { id: 'A', name: 'Minimal risk chip', principle: 'Progressive Disclosure', rationale: 'Shows risk only in the header.', watchOut: 'May be missed by doctors who skip the header.' },
    { id: 'B', name: 'Full risk panel', principle: 'Visibility of system status', rationale: 'Permanent risk card at top of every profile.', watchOut: 'Adds visual weight for low-risk patients.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;}textarea,input{resize:vertical;}`}</style>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 56px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '28px', height: '28px', background: P.primary, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px' }}>✦</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: P.text }}>Design Together</div>
              <div style={{ fontSize: '9px', color: P.muted, letterSpacing: '.08em' }}>UI DIRECTION TOOL</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= pipStep ? P.primary : P.border }} />)}
          </div>
        </div>

        {step === 'intake' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif", color: P.text, marginBottom: '4px' }}>What's the problem?</h2>
            <p style={{ fontSize: '13px', color: P.muted, marginBottom: '20px', lineHeight: 1.6 }}>Fill in what you know about the design problem.</p>
            <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />
            <Card>
              <ChipGroup label="Platform" options={PLATFORMS} value={platform} onValue={setPlatform} otherText={platformOther} onOtherText={setPlatformOther} />
              <ChipGroup label="Users" options={USER_TYPES} value={userType} onValue={setUserType} otherText={userTypeOther} onOtherText={setUserTypeOther} />
              <ChipGroup label="Type of change" options={CHANGE_TYPES} value={changeType} onValue={setChangeType} otherText={changeTypeOther} onOtherText={setChangeTypeOther} />
            </Card>
            <Card>
              <ProjectContextZone
                projectContextText={projectContextText}
                onTextChange={setProjectContextText}
                projectFiles={projectFiles}
                onAddFile={(f) => setProjectFiles((p) => [...p, f])}
                onRemoveFile={(id) => setProjectFiles((p) => p.filter((x) => x.id !== id))}
              />
            </Card>
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Label>What exists today</Label>
                <textarea value={existing} onChange={(e) => setExisting(e.target.value)} placeholder={EXISTING_PLACEHOLDER} style={{ width: '100%', minHeight: '80px', padding: '10px 12px', border: `0.5px solid ${P.border}`, borderRadius: '8px', background: P.bg, fontFamily: 'inherit', fontSize: '13px', color: P.text }} />
              </div>
              <div>
                <Label>What needs to change</Label>
                <textarea value={change} onChange={(e) => setChange(e.target.value)} placeholder={CHANGE_PLACEHOLDER} style={{ width: '100%', minHeight: '72px', padding: '10px 12px', border: `0.5px solid ${P.border}`, borderRadius: '8px', background: P.bg, fontFamily: 'inherit', fontSize: '13px', color: P.text }} />
              </div>
            </Card>
            <Card style={{ marginBottom: '16px' }}>
              <FileUploadZone screenshots={screenshots} onAdd={(s) => setScreenshots((p) => [...p, s])} onRemove={(i) => setScreenshots((p) => p.filter((_, j) => j !== i))} />
            </Card>
            <Btn label="Analyse →" onClick={runAnalysis} />
          </div>
        )}

        {step === 'loading-analyse' && <LoadingScreen msgs={['Reading your brief…', 'Checking if the request makes sense…', 'Building directions…']} />}
        {step === 'loading-wires' && <LoadingScreen msgs={['Drawing wireframes…', 'Laying out screens…', 'Done.']} />}
        {step === 'loading-iter' && <LoadingScreen msgs={['Applying your feedback…', 'Redrawing…', 'Done.']} />}

        {step === 'pushback' && result && (
          <div>
            <div style={{ background: P.bg, border: `0.5px solid ${P.border}`, borderRadius: '8px', padding: '11px 14px', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '5px' }}>
                  {[getVal(platform, platformOther), getVal(userType, userTypeOther), getVal(changeType, changeTypeOther)].map((t) => <span key={t} style={{ background: '#eee', color: P.muted, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{t}</span>)}
                </div>
                <div style={{ fontSize: '12px', color: P.muted }}>{change.split('\n')[0].slice(0, 80)}{change.length > 80 ? '…' : ''}</div>
              </div>
              <button onClick={() => setStep('intake')} style={{ fontSize: '11px', fontWeight: 600, color: P.muted, background: 'none', border: `0.5px solid ${P.border}`, padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Edit ↩</button>
            </div>
            <Card style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: P.pl, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{CAT_ICONS[result.category] || '?'}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '9px', color: P.muted, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Problem type</span>
                  <span style={{ background: P.pl, color: P.primary, padding: '2px 9px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{result.categoryLabel}</span>
                </div>
                <div style={{ fontSize: '13px', color: P.text, lineHeight: 1.6 }}>{result.categoryDescription}</div>
              </div>
            </Card>
            {result.blocking?.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '12px', padding: '14px 18px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Missing info — results below are provisional</div>
                {result.blocking.map((b, i) => <div key={i} style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, marginBottom: '4px' }}>· {b}</div>)}
              </div>
            )}
            {result.pushback?.needed && (
              <div style={{ borderRadius: '12px', padding: '18px 20px', border: '1.5px solid #F0D97A', background: '#FFFBEB', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#B8860B', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Worth checking first</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B8860B', marginBottom: '4px' }}>The issue</div>
                  <div style={{ fontSize: '13px', color: P.text, lineHeight: 1.6 }}>{result.pushback.issue}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B8860B', marginBottom: '4px' }}>What we'd suggest instead</div>
                  <div style={{ fontSize: '13px', color: P.text, lineHeight: 1.6 }}>{result.pushback.recommendation}</div>
                </div>
              </div>
            )}
            {result.assumptions?.length > 0 && (
              <Card style={{ marginBottom: '14px' }}>
                <Label>We assumed these — correct if wrong</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {result.assumptions.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#D97706', flexShrink: 0, marginTop: '2px', fontSize: '13px' }}>·</span>
                      <span style={{ fontSize: '13px', color: P.text, lineHeight: 1.55 }}>{a}</span>
                    </div>
                  ))}
                </div>
                <Label>Add a correction or note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></Label>
                <textarea value={assumptionNote} onChange={(e) => setAssumptionNote(e.target.value)} placeholder="e.g. 'BMI will be manually entered, not auto-calculated.'"
                  style={{ width: '100%', minHeight: '56px', padding: '10px 12px', border: `0.5px solid ${P.border}`, borderRadius: '8px', background: P.bg, fontFamily: 'inherit', fontSize: '13px', color: P.text }} />
              </Card>
            )}
            <Btn label="Continue to questions →" onClick={() => setStep('questions')} />
          </div>
        )}

        {step === 'questions' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif", color: P.text, marginBottom: '4px' }}>
              {questions.length} quick question{questions.length !== 1 ? 's' : ''}
            </h2>
            <p style={{ fontSize: '13px', color: P.muted, marginBottom: '20px' }}>Answers shape the wireframes. Tap to select.</p>
            <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />
            {questions.length === 0 ? (
              <Card><p style={{ fontSize: '13px', color: P.muted }}>No questions returned. Go back and re-run analysis.</p></Card>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: allAnswered ? '#2D6A4F' : P.muted }}>
                    {questions.filter(isAnswered).length} of {questions.length} answered {allAnswered ? '✓' : ''}
                  </span>
                </div>
                {questions.map((q) => {
                  const ans = answers[q.id] || '';
                  const other = answerOthers[q.id] || '';
                  const isOther = ans === '__other__';
                  const done = isAnswered(q);
                  return (
                    <Card key={q.id} style={{ marginBottom: '10px', borderLeft: done ? '3px solid #40c057' : 'none', borderRadius: done ? '0 12px 12px 0' : '12px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: P.text, marginBottom: '10px', lineHeight: 1.45 }}>{q.text}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: isOther ? '8px' : 0 }}>
                        {q.opts.map((o) => <Chip key={o} label={o} sel={ans === o} onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))} />)}
                        <Chip label="Other" sel={isOther} onClick={() => setAnswers((p) => ({ ...p, [q.id]: '__other__' }))} dashed />
                      </div>
                      {isOther && <input autoFocus type="text" value={other} onChange={(e) => setAnswerOthers((p) => ({ ...p, [q.id]: e.target.value }))} placeholder="Type your answer…"
                        style={{ display: 'block', width: '100%', padding: '9px 12px', border: `1.5px solid ${P.primary}`, borderRadius: '8px', background: P.pl, fontFamily: 'inherit', fontSize: '13px', color: P.text, outline: 'none' }} />}
                    </Card>
                  );
                })}
                <Btn label={allAnswered ? 'Draw wireframes →' : `Answer all ${questions.length} to continue (${questions.filter(isAnswered).length}/${questions.length})`} disabled={!allAnswered} onClick={runWireframes} />
              </>
            )}
          </div>
        )}

        {step === 'wireframes' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif", color: P.text, marginBottom: '4px' }}>
              {iterated ? 'Screens updated' : `2 directions · ${screenCount} screen${screenCount !== 1 ? 's' : ''}`}
            </h2>
            <p style={{ fontSize: '13px', color: P.muted, marginBottom: '16px' }}>Click a wireframe to enlarge. Tap the label or number to select for iteration.</p>
            <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />

            {(result?.directions || directionFallback).map((d) => (
              <div key={d.id} style={{ border: `0.5px solid ${P.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '10px', background: P.card }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: d.id === 'A' ? P.primary : '#5B8FA8', letterSpacing: '.06em', textTransform: 'uppercase' }}>Direction {d.id}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: P.text }}>{d.name}</span>
                  <span style={{ fontSize: '10px', color: P.muted, marginLeft: 'auto' }}>{d.principle}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: P.muted, lineHeight: 1.5, marginBottom: '4px' }}>{d.rationale}</div>
                {d.watchOut && <div style={{ fontSize: '11px', color: '#B8860B', marginTop: '4px' }}>⚠ {d.watchOut}</div>}
              </div>
            ))}

            {screens.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '8px' }}>
                {screens.map((s) => {
                  const sid = normalizeId(s.id);
                  const sel = [...selected].some((x) => idsMatch(x, sid));
                  const tc = s.tagColor || '#777';
                  return (
                    <div key={sid} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                      <div role="button" tabIndex={0} onClick={() => toggleScreen(sid)} onKeyDown={(e) => e.key === 'Enter' && toggleScreen(sid)} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', width: '100%' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, border: `1.5px solid ${sel ? P.primary : P.border}`, background: sel ? P.primary : P.card, color: sel ? '#fff' : P.muted, flexShrink: 0 }}>{s.id}</div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: P.text }}>{s.title}</div>
                          <div style={{ fontSize: '9px', color: P.muted }}>{s.sub}</div>
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setLightboxScreen(s); }}
                        onKeyDown={(e) => e.key === 'Enter' && setLightboxScreen(s)}
                        style={{ borderRadius: '14px', overflow: 'hidden', border: sel ? `3px solid ${P.primary}` : '2px solid #2a2a2a', boxShadow: sel ? `0 0 0 4px ${P.pl}` : 'none', alignSelf: 'stretch', width: '100%', cursor: 'zoom-in' }}
                      >
                        <WireframeDisplay key={`${sid}-${s.svg?.length || 0}`} svg={s.svg} />
                      </div>
                      <span role="button" tabIndex={0} onClick={() => toggleScreen(sid)} onKeyDown={(e) => e.key === 'Enter' && toggleScreen(sid)} style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: tc, background: `${tc}18`, padding: '2px 9px', borderRadius: '10px', border: `1px solid ${tc}28`, cursor: 'pointer' }}>{s.tag}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card><p style={{ fontSize: '13px', color: P.muted }}>No wireframes generated. Return to questions and try again.</p></Card>
            )}

            {result?.directions?.[0]?.quickWins?.length > 0 && (
              <div style={{ background: '#F0F7F4', border: '1.5px solid #A7D4BC', borderRadius: '12px', padding: '14px 18px', marginTop: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#2D6A4F', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Quick wins — apply to any direction</div>
                {[...new Set([...result.directions[0].quickWins, ...(result.directions[1]?.quickWins || [])])].slice(0, 4).map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '7px' }}>
                    <span style={{ color: '#2D6A4F', fontWeight: 700, flexShrink: 0, fontSize: '13px' }}>→</span>
                    <span style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.size > 0 ? (
              <div style={{ background: P.bg, border: `1.5px solid ${P.primary}`, borderRadius: '12px', padding: '16px 18px', marginTop: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: P.primary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Iterating on screen{selected.size > 1 ? 's' : ''} {Array.from(selected).sort((a, b) => a - b).join(', ')}
                </div>
                <textarea value={iterNote} onChange={(e) => setIterNote(e.target.value)} placeholder="Describe the change… e.g. 'Screen 3 is too heavy. Try a collapsed version.'"
                  style={{ width: '100%', minHeight: '60px', padding: '10px 12px', border: `0.5px solid ${P.border}`, borderRadius: '8px', background: P.card, fontFamily: 'inherit', fontSize: '13px', color: P.text, marginBottom: '10px', display: 'block' }} />
                <Btn label={`Regenerate screen${selected.size > 1 ? 's' : ''} ${Array.from(selected).sort((a, b) => a - b).join(', ')} →`} onClick={doIterate} disabled={!iterNote.trim()} />
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: P.faint, textAlign: 'center', marginTop: '14px' }}>Tap a screen to select it for iteration</p>
            )}
          </div>
        )}

      </div>
      {lightboxScreen && (
        <ScreenLightbox screen={lightboxScreen} onClose={() => setLightboxScreen(null)} />
      )}
    </div>
  );
}
