import { useState, useEffect, useRef } from 'react';
import { Check, Plus, Brain, Magnet } from 'lucide-react';
import { trackEvent } from '../lib/meta';

const TOTAL_PARTICIPANTS = 4247;
const PRODUCT_KEY = 'protocolo_abundancia_7_dias';

const BLUE = '#D4AF37';
const LILAC = '#F7E7B7';
const DARK = '#050505';
const BODY = '#2F2F2F';
const SHADOW = '0 20px 60px rgba(0,0,0,0.15)';

const SESSION_DURATIONS_MIN: Record<number, number> = {
  1: 8,
  2: 8,
  3: 7,
  4: 6,
  5: 7,
  6: 6,
  7: 7,
};

const formatMMSS = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// ─── App Mockup Components ────────────────────────────────────────────────────

const IPhoneFrame = ({ rotate = 0, children }: {
  rotate?: number; children: React.ReactNode;
}) => (
  <div style={{ transform: `rotate(${rotate}deg)`, width: '260px', margin: '0 auto', position: 'relative' }}>
    {/* Outer shell */}
    <div style={{
      background: 'linear-gradient(150deg, #2C2C2E 0%, #1C1C1E 45%, #111113 100%)',
      borderRadius: '46px',
      padding: '11px 10px',
      boxShadow: [
        '0 0 0 1px rgba(255,255,255,0.13)',
        'inset 0 0 0 1px rgba(0,0,0,0.55)',
        '0 40px 90px rgba(0,0,0,0.6)',
        '0 12px 28px rgba(212,175,55,0.15)',
      ].join(', '),
      position: 'relative',
    }}>
      {/* Silent switch */}
      <div style={{ position: 'absolute', left: '-3px', top: '76px', width: '3px', height: '22px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      {/* Volume up */}
      <div style={{ position: 'absolute', left: '-3px', top: '112px', width: '3px', height: '38px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      {/* Volume down */}
      <div style={{ position: 'absolute', left: '-3px', top: '158px', width: '3px', height: '38px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      {/* Power button */}
      <div style={{ position: 'absolute', right: '-3px', top: '124px', width: '3px', height: '60px', background: 'linear-gradient(to left, #080808, #1E1E1E)', borderRadius: '0 2px 2px 0' }} />

      {/* Screen */}
      <div style={{ borderRadius: '37px', overflow: 'hidden', background: '#0A0A0A', position: 'relative', height: '512px', display: 'flex', flexDirection: 'column' }}>
        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
          width: '86px', height: '26px',
          background: '#000',
          borderRadius: '20px',
          zIndex: 10,
        }} />

        {/* Status bar */}
        <div style={{
          padding: '14px 22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '50px',
          flexShrink: 0,
          background: 'white',
        }}>
          <span style={{ color: '#0A0A0A', fontSize: '14px', fontWeight: 700 }}>9:41</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {/* Signal bars */}
            <svg width="13" height="9" viewBox="0 0 17 12" fill="#0A0A0A">
              <rect x="0" y="8" width="3" height="4" rx="0.5"/>
              <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
              <rect x="9" y="3" width="3" height="9" rx="0.5"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.35"/>
            </svg>
            {/* WiFi */}
            <svg width="12" height="9" viewBox="0 0 15 11" fill="none">
              <circle cx="7.5" cy="9.5" r="1.2" fill="#0A0A0A"/>
              <path d="M4.5 7a4.24 4.24 0 016 0" stroke="#0A0A0A" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M2 4.5A7.78 7.78 0 0113 4.5" stroke="#0A0A0A" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
              <path d="M0 2A10.6 10.6 0 0115 2" stroke="#0A0A0A" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            </svg>
            {/* Battery */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '18px', height: '9px', border: '1.5px solid rgba(0,0,0,0.55)', borderRadius: '2.5px', padding: '1px', position: 'relative' }}>
                <div style={{ width: '73%', height: '100%', background: '#0A0A0A', borderRadius: '1px' }} />
              </div>
              <div style={{ width: '2px', height: '4px', background: 'rgba(0,0,0,0.35)', borderRadius: '0 1px 1px 0', marginLeft: '1px' }} />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

const PlayerMockup = ({ day, title, progress = 38, rotate = -1.5, durationMin }: {
  day: number; title: string; progress?: number; rotate?: number; durationMin?: number;
}) => {
  const totalMinutes = durationMin ?? SESSION_DURATIONS_MIN[day] ?? 8;
  const totalSeconds = totalMinutes * 60;
  const currentSeconds = Math.min(totalSeconds, Math.max(0, Math.round((progress / 100) * totalSeconds)));

  return (
    <IPhoneFrame rotate={rotate}>
      <div style={{ background: 'linear-gradient(180deg, #3B1C00 0%, #5C3410 45%, #2C1800 100%)', height: '100%' }}>
      {/* Back button */}
      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Cover art */}
      <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '148px', height: '148px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
          <img src={`/dia${day}.webp`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '14px 20px 0', textAlign: 'center' }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', lineHeight: '1.35', margin: 0 }}>
          Dia {day} – {title}
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '18px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        {/* Back 15s */}
        <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: '50px', padding: '7px 13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
          <svg width="15" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L3 8v6h6l-2.18-2.18A6.93 6.93 0 0 1 12.5 10c3.04 0 5.64 1.96 6.58 4.69l1.95-.65A9 9 0 0 0 12.5 8z"/>
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8px', fontWeight: 600, lineHeight: 1 }}>15s</span>
        </div>
        {/* Pause */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        </div>
        {/* Forward 15s */}
        <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: '50px', padding: '7px 13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
          <svg width="15" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M11.5 8c2.65 0 5.05 1 6.9 2.6L21 8v6h-6l2.18-2.18A6.93 6.93 0 0 0 11.5 10c-3.04 0-5.64 1.96-6.58 4.69L2.97 14.04A9 9 0 0 1 11.5 8z"/>
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8px', fontWeight: 600, lineHeight: 1 }}>15s</span>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ margin: '16px 0 0', background: 'rgba(0,0,0,0.38)', borderRadius: '20px 20px 0 0', padding: '14px 16px 18px' }}>
        {/* Sons de Fundo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px', padding: '7px 12px', display: 'flex', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '8px', letterSpacing: '1px', fontWeight: 600, margin: 0 }}>SONS DE FUNDO</p>
              <p style={{ color: 'white', fontSize: '11px', fontWeight: 700, margin: 0 }}>432Hz</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', minWidth: '28px' }}>{formatMMSS(currentSeconds)}</span>
          <div style={{ flex: 1, position: 'relative', height: '3px', background: 'rgba(255,255,255,0.18)', borderRadius: '3px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: BLUE, borderRadius: '3px' }} />
            <div style={{ position: 'absolute', left: `${progress}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '9px', height: '9px', borderRadius: '50%', background: BLUE }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', minWidth: '28px', textAlign: 'right' }}>{formatMMSS(totalSeconds)}</span>
        </div>
      </div>
    </div>
    </IPhoneFrame>
  );
};

const SessionListMockup = ({ rotate = 1.5 }: { rotate?: number }) => (
  <IPhoneFrame rotate={rotate}>
    <div style={{ background: 'linear-gradient(180deg, #3B1C00 0%, #4A2A0A 100%)', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '8px 16px 12px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 2px' }}>Código da Abundância</p>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', margin: 0 }}>7 Sessões</p>
      </div>
      {/* List */}
      <div style={{ padding: '0 10px 16px' }}>
        {([
          { day: 1, title: 'O Diagnóstico', durationMin: SESSION_DURATIONS_MIN[1], done: true },
          { day: 2, title: 'Quebrando o Contrato', durationMin: SESSION_DURATIONS_MIN[2], done: false, active: true },
          { day: 3, title: 'O canal que seu cérebro fechou para se proteger.', durationMin: SESSION_DURATIONS_MIN[3], done: false },
          { day: 4, title: 'A versão de você que nunca aprendeu a ter.', durationMin: SESSION_DURATIONS_MIN[4], done: false },
          { day: 5, title: 'Por que você sabota quando está quase lá.', durationMin: SESSION_DURATIONS_MIN[5], done: false },
          { day: 6, title: 'A crença que você nem sabe que tem.', durationMin: SESSION_DURATIONS_MIN[6], done: false },
          { day: 7, title: 'A Nova Identidade', durationMin: SESSION_DURATIONS_MIN[7], done: false },
        ] as { day: number; title: string; durationMin: number; done: boolean; active?: boolean }[]).map((s) => (
          <div key={s.day} style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '7px 10px', borderRadius: '12px', marginBottom: '3px',
            background: s.active ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.05)',
            border: s.active ? '1px solid rgba(212,175,55,0.35)' : '1px solid transparent',
          }}>
            {/* Thumbnail */}
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, opacity: s.done ? 0.5 : 1 }}>
              <img src={`/dia${s.day}.webp`} alt={`Dia ${s.day}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: s.active ? 'white' : s.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)', fontSize: '10px', fontWeight: s.active ? 700 : 400, margin: '0 0 1px', whiteSpace: 'normal', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                Dia {s.day} · {s.title}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: 0 }}>{s.durationMin} min</p>
            </div>
            {s.done ? (
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
            ) : s.active ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(212,175,55,0.4)' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            ) : (
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </IPhoneFrame>
);

const ProgressMockup = ({ rotate = -1.5 }: { rotate?: number }) => (
  <IPhoneFrame rotate={rotate}>
    <div style={{ background: 'linear-gradient(180deg, #3B1C00 0%, #4A2A0A 100%)', padding: '8px 14px 20px', height: '100%', boxSizing: 'border-box' }}>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3px' }}>SEU PROGRESSO</p>
      <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>6 de 7 dias concluídos</p>

      {/* Day thumbnails grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px', marginBottom: '14px' }}>
        {[1,2,3,4,5,6,7].map(d => (
          <div key={d} style={{ position: 'relative' }}>
            <div style={{ borderRadius: '9px', overflow: 'hidden', border: d <= 6 ? `1.5px solid rgba(212,175,55,0.5)` : '1.5px solid rgba(255,255,255,0.1)', opacity: d <= 6 ? 1 : 0.3 }}>
              <img src={`/dia${d}.webp`} alt={`Dia ${d}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
            </div>
            {d <= 6 && (
              <div style={{ position: 'absolute', top: '3px', right: '3px', width: '14px', height: '14px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
            )}
            <p style={{ color: d <= 6 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)', fontSize: '8px', textAlign: 'center', margin: '3px 0 0' }}>Dia {d}</p>
          </div>
        ))}
        <div />
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Progresso geral</span>
          <span style={{ color: BLUE, fontSize: '10px', fontWeight: 700 }}>86%</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <div style={{ width: '86%', height: '100%', background: `linear-gradient(90deg, ${BLUE}, ${LILAC})`, borderRadius: '4px' }} />
        </div>
      </div>

      {/* Next session */}
      <div style={{ padding: '10px 12px', background: 'rgba(212,175,55,0.12)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          <img src="/dia7.webp" alt="Dia 7" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', margin: '0 0 2px', letterSpacing: '1px' }}>PRÓXIMA SESSÃO</p>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '11px', margin: 0 }}>Dia 7 · A Nova Identidade</p>
        </div>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(212,175,55,0.4)' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  </IPhoneFrame>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const LandingCodigoDaAbundancia = () => {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([0]));
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [metric1Count, setMetric1Count] = useState(0);
  const [metric3Count, setMetric3Count] = useState(0);
  const ofertaRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent('PageView').catch(() => {});
  }, []);

  useEffect(() => {
    const el = ofertaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('ViewContent', {
            value: 67,
            currency: 'BRL',
            contentIds: [PRODUCT_KEY],
            contentType: 'product',
          }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = metricsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !metricsVisible) {
          setMetricsVisible(true);
          const duration = 1800;
          const fps = 60;
          const steps = (duration / 1000) * fps;
          const inc1 = 4247 / steps;
          const inc3 = 93 / steps;
          let c1 = 0, c3 = 0;
          const interval = setInterval(() => {
            c1 += inc1;
            c3 += inc3;
            if (c1 >= 4247) {
              setMetric1Count(4247);
              setMetric3Count(93);
              clearInterval(interval);
            } else {
              setMetric1Count(Math.floor(c1));
              setMetric3Count(Math.floor(c3));
            }
          }, 1000 / fps);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [metricsVisible]);

  useEffect(() => {
    const delay = setTimeout(() => {
      const duration = 2000;
      const fps = 60;
      const steps = (duration / 1000) * fps;
      const increment = TOTAL_PARTICIPANTS / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= TOTAL_PARTICIPANTS) {
          setDisplayCount(TOTAL_PARTICIPANTS);
          clearInterval(interval);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, 1000 / fps);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const scrollToOferta = () => {
    document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = async () => {
    if (loadingPayment) return;
    setLoadingPayment(true);
    trackEvent('InitiateCheckout', {
      value: 67,
      currency: 'BRL',
      contentIds: [PRODUCT_KEY],
    }).catch(() => {});
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mp/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey: 'protocolo_abundancia_7_dias', origin: 'landing_page', siteUrl: 'https://abundancia-lp.vercel.app' }),
      });
      if (!res.ok) throw new Error('Erro ao criar preferência');
      const data = await res.json();
      const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      const preferenceId = data.preference_id ?? new URL(data.init_point).searchParams.get('pref_id');
      if (preferenceId && publicKey) {
        await loadMpSdk();
        const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' });
        mp.checkout({ preference: { id: preferenceId }, autoOpen: true });
      } else if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível iniciar o pagamento. Tente novamente em instantes.');
    } finally {
      setLoadingPayment(false);
    }
  };

  const loadMpSdk = (): Promise<void> => {
    if ((window as any).MercadoPago) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
      document.head.appendChild(script);
    });
  };

  const faqs = [
    {
      question: 'Já tentei outros programas de mentalidade e não funcionou',
      answer: 'Este protocolo não trabalha com crença ou motivação — trabalha com repetição neurológica. Crenças mudam devagar. Padrões neurais mudam por exposição repetida. Você não precisa acreditar. Precisa ouvir.',
    },
    {
      question: 'Funciona mesmo se eu não acredito nisso?',
      answer: 'A neuroplasticidade não precisa da sua crença para funcionar. Seu cérebro já é reprogramado por experiências todo dia — com ou sem a sua permissão. O protocolo só usa esse mecanismo de forma intencional. Você não precisa acreditar. Precisa só fazer.',
    },
    {
      question: 'E se não funcionar para mim?',
      answer: 'Você tem 7 dias de garantia incondicional. Se não sentir mudança, devolvemos 100% do valor. Risco zero.',
    },
    {
      question: 'Isso é só meditação, já tentei',
      answer: 'O Código da Abundância não é uma meditação relaxante. É um protocolo de reprogramação. Cada sessão tem um objetivo neurológico específico e uma sequência deliberada. Relaxamento é efeito colateral, não o objetivo.',
    },
    {
      question: 'Eu não sei meditar',
      answer: 'Perfeito. Isso não é meditação. É escuta guiada com protocolo neurológico. Você só precisa de fones de ouvido e 20 minutos.',
    },
    {
      question: 'Por que R$67 por algo que é um áudio?',
      answer: 'Porque o valor não está no formato, está na transformação. Uma hora de coaching custa R$300. Uma sessão de terapia custa R$180. Aqui você tem 7 sessões por menos da metade de uma única consulta.',
    },
  ];

const CtaBtn = ({ label, white = false, large = false, maxWidth }: {
  label: string; white?: boolean; large?: boolean; maxWidth?: number | string;
}) => (
  <button
    onClick={handleCTA}
    disabled={loadingPayment}
    className="cta-btn inline-flex items-center justify-center gap-2 font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
    style={{
      background: white ? 'white' : BLUE,
      color: white ? BLUE : 'white',
      borderRadius: '14px',
      padding: large ? '16px 32px' : '14px 24px',
      fontSize: '16px',
      fontWeight: 700,
      boxShadow: white ? '0 8px 40px rgba(0,0,0,0.2)' : `0 8px 32px rgba(212,175,55,0.35)`,
      minHeight: '52px',
      maxWidth: maxWidth ?? (large ? '320px' : undefined),
      width: (maxWidth || large) ? '100%' : undefined,
      margin: large ? '0 auto' : undefined,
    }}
  >
    {loadingPayment ? 'Aguarde...' : label}
  </button>
);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif", color: DARK }}>

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <img
            src="/logo-ecotopia.webp"
            alt="Ecotopia"
            style={{ height: '56px', width: 'auto', cursor: 'pointer' }}
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          />

          {/* Links centrais — desktop only */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Como funciona', id: 'hero' },
              { label: 'Depoimentos', id: 'depoimentos' },
              { label: 'Preço', id: 'oferta' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: DARK, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Direita */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToOferta}
              className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: DARK, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Entrar
            </button>
            <button
              onClick={scrollToOferta}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: BLUE,
                borderRadius: '100px',
                padding: '9px 20px',
                boxShadow: '0 2px 8px rgba(212,175,55,0.35)',
              }}
            >
              Começar agora <span style={{ fontSize: '13px' }}>›</span>
            </button>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '60px' }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative overflow-hidden hero-section"
          style={{ background: '#FFFFFF' }}
        >
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-widest" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: BLUE }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              7 DIAS · PROTOCOLO PROGRESSIVO
            </div>

            {/* Headline */}
            <h1
              className="hero-h1 font-bold mb-6 leading-tight"
              style={{ fontFamily: "'GT Walsheim', sans-serif", color: DARK, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
            >
              Você trabalha, se esforça —<br />
              <span style={{ color: BLUE }}>
                mas o dinheiro nunca fica.
              </span>
            </h1>

            <p className="hero-subtitle mb-8 sm:mb-12 max-w-2xl mx-auto" style={{ color: '#555555', lineHeight: '1.55', fontSize: '15px' }}>
              Não é falta de disciplina. É um padrão invisível operando no seu cérebro. Em 7 sessões de áudio, você o identifica e desliga. Sem planilhas. Sem coach. Neurociência pura.
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex -space-x-2 shrink-0">
                {['/avatar-fernanda.webp', '/avatar-marcos.webp', '/avatar-camila.webp', '/avatar-extra.webp', '/avatar-fernanda.webp'].map((src, i) => (
                  <img key={i} src={src} alt="avatar" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover bg-gray-200" />
                ))}
              </div>
              <span className="text-sm leading-snug text-left min-w-0" style={{ color: BODY }}>
                <span className="font-semibold" style={{ color: DARK }}>+{displayCount.toLocaleString('pt-BR')}</span> pessoas já transformaram
                <span className="hidden sm:inline"> sua relação com o dinheiro</span>
              </span>
            </div>

            {/* CTA */}
            <CtaBtn label="Quero desligar esse padrão →" large />

            <p className="hero-micro text-sm mt-3 mb-2 font-medium" style={{ color: 'rgba(92,81,64,0.7)', fontSize: '12px' }}>Acesso imediato · R$67 uma vez · Garantia 7 dias</p>

            <div className="flex items-center justify-center mt-2 gap-2 mb-8 sm:mb-12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="hero-guarantee text-sm" style={{ color: BODY, fontSize: '13px' }}>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>

            {/* Browser Mockup — estilo Mac Safari */}
            <div
              className="hero-mockup relative mx-auto fade-in"
              style={{
                maxWidth: '620px',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                transform: 'rotate(-1deg)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '20px',
              }}
            >
              {/* ── Chrome bar ── */}
              <div style={{ background: '#FFFFFF', padding: '0 14px', height: '44px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>

                {/* Traffic lights */}
                <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
                  {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                    <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                  ))}
                </div>

                {/* Back / Forward */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>

                {/* URL bar */}
                <div style={{
                  flex: 1,
                  height: '28px',
                  background: '#F2F2F2',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 10px',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: '7.5px', fontFamily: "'Inter', sans-serif", letterSpacing: '0em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ecofrontend888.vercel.app/app/protocolo-7-dias
                  </span>
                </div>

                {/* Tabs area (right of URL) */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {/* Share icon */}
                  <div style={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </div>
                  {/* Tab + */}
                  <div style={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Tab bar ── */}
              <div style={{ background: '#ECECEC', display: 'flex', alignItems: 'flex-end', padding: '0 14px', height: '34px', gap: '2px' }}>
                {/* Active tab */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '8px 8px 0 0',
                  padding: '0 14px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  minWidth: '180px',
                  maxWidth: '220px',
                }}>
                  <img src="/logo-ecotopia.webp" alt="" style={{ height: '14px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(0,0,0,0.7)', fontSize: '11px', fontFamily: "'Inter', sans-serif", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
                    Código da Abundância
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                {/* Inactive tab */}
                <div style={{ padding: '0 12px', height: '26px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>Nova aba</span>
                </div>
              </div>

              {/* ── Webpage content ── */}
              <div style={{ background: 'radial-gradient(ellipse at 50% 20%, #7A4010 0%, #1E0900 45%, #080500 100%)', padding: '16px 18px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: BLUE, boxShadow: '0 0 0 4px rgba(212,175,55,0.12)' }} />
                    <p style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: '13px', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Protocolo completo — 7 dias
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, background: 'rgba(212,175,55,0.14)', border: '1px solid rgba(212,175,55,0.35)', color: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '999px', fontSize: '10px', fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.04em' }}>
                    7 sessões · acesso imediato
                  </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Sessions list */}
                  <div style={{ flex: '1 1 320px', minWidth: '280px', background: 'rgba(0,0,0,0.45)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.09)', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                        Sua trilha
                      </p>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
                        2/7 em andamento
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                      {([
                        { day: 1, title: 'O Diagnóstico', done: true },
                        { day: 2, title: 'Quebrando o Contrato', done: false, active: true },
                        { day: 3, title: 'O canal que seu cérebro fechou para se proteger.', done: false },
                        { day: 4, title: 'A versão de você que nunca aprendeu a ter.', done: false },
                        { day: 5, title: 'Por que você sabota quando está quase lá.', done: false },
                        { day: 6, title: 'A crença que você nem sabe que tem.', done: false },
                        { day: 7, title: 'A Nova Identidade', done: false },
                      ] as { day: number; title: string; done: boolean; active?: boolean }[]).map((s) => (
                        <div
                          key={s.day}
                          style={{
                            padding: '8px 8px',
                            borderRadius: '12px',
                            background: s.active ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.06)',
                            border: s.active ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                            <p style={{ margin: 0, color: s.active ? 'white' : 'rgba(255,255,255,0.75)', fontSize: '10px', fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
                              Dia {s.day}
                            </p>
                            {s.done ? (
                              <div style={{ width: '16px', height: '16px', borderRadius: '6px', background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              </div>
                            ) : s.active ? (
                              <div style={{ fontSize: '9px', fontFamily: "'Inter', sans-serif", fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(212,175,55,0.28)', border: '1px solid rgba(212,175,55,0.4)', padding: '2px 6px', borderRadius: '999px' }}>
                                agora
                              </div>
                            ) : null}
                          </div>
                          <p style={{ margin: 0, color: s.done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.78)', fontSize: '9px', fontFamily: "'Inter', sans-serif", fontWeight: s.active ? 800 : 600, whiteSpace: 'normal', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                            {s.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player preview */}
                  <div style={{ flex: '1 1 220px', minWidth: '220px', background: 'rgba(0,0,0,0.45)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.09)', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 10px 26px rgba(0,0,0,0.55)' }}>
                        <img src="/dia2.webp" alt="Dia 2" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, color: 'rgba(212,175,55,0.85)', fontSize: '9px', fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: '0.08em' }}>
                          AGORA TOCANDO
                        </p>
                        <p style={{ margin: '2px 0 0', color: 'white', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: 800, whiteSpace: 'normal', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                          Dia 2 · Quebrando o Contrato
                        </p>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
                          {SESSION_DURATIONS_MIN[2]} min · sem anúncios
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '999px', border: '1.5px solid rgba(212,175,55,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                        </svg>
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '999px', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(212,175,55,0.35)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D0D0D"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '999px', border: '1.5px solid rgba(212,175,55,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                        </svg>
                      </div>
                    </div>

                    <div style={{ paddingBottom: '2px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.12)', height: '3px', borderRadius: '4px', marginBottom: '6px', position: 'relative' }}>
                        <div style={{ width: '28%', height: '100%', background: BLUE, borderRadius: '4px', position: 'relative' }}>
                          <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '9px', height: '9px', borderRadius: '50%', background: BLUE }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>03:12</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>11:40</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '6px', background: 'rgba(212,175,55,0.16)', border: '1px solid rgba(212,175,55,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontFamily: "'Inter', sans-serif", whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.15 }}>
                      Dias 1–7 desbloqueados · sem assinatura
                    </p>
                  </div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
                    R$67 uma vez
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cloud curve */}
          <div style={{ lineHeight: 0, marginTop: '-1px' }}>
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,80 L0,40 Q180,0 360,32 Q540,64 720,28 Q900,-8 1080,30 Q1260,68 1440,36 L1440,80 Z" fill="#FFFFFF"/>
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MÉTRICAS
        ══════════════════════════════════════════ */}
        <section className="metrics-section bg-white px-5 sm:px-6 lg:px-8 pt-6 pb-10 sm:py-20">
          <div className="max-w-4xl mx-auto" ref={metricsRef}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                {
                  key: 'people',
                  value: metric1Count > 0 ? `${metric1Count.toLocaleString('pt-BR')}+` : '4.247+',
                  label: (
                    <>
                      <span className="sm:hidden">reprogramadas</span>
                      <span className="hidden sm:inline">pessoas já reprogramaram</span>
                    </>
                  ),
                },
                {
                  key: 'days',
                  value: '7 dias',
                  label: (
                    <>
                      <span className="sm:hidden">protocolo</span>
                      <span className="hidden sm:inline">para mudar o padrão</span>
                    </>
                  ),
                },
                {
                  key: 'impact',
                  value: metric3Count > 0 ? `${metric3Count}%` : '93%',
                  label: (
                    <>
                      <span className="sm:hidden">na 1ª semana</span>
                      <span className="hidden sm:inline">sentiram diferença na 1ª semana</span>
                    </>
                  ),
                },
              ].map((m) => (
                <div key={m.key} className="metric-card text-center py-5 px-2 sm:py-7 sm:px-3 rounded-2xl" style={{ background: '#FBF7ED', boxShadow: SHADOW }}>
                  <p className="metric-value font-bold mb-1 whitespace-nowrap tabular-nums leading-none" style={{ color: BLUE, fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.25rem, 4vw, 3rem)' }}>
                    {m.value}
                  </p>
                  <p className="metric-label whitespace-nowrap" style={{ color: BODY, fontSize: '14px' }}>{m.label}</p>
                </div>
              ))}
            </div>
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { key: 'neuro', desktop: 'Neurociência aplicada', mobile: 'Neurociência' },
                { key: 'law', desktop: 'Lei da Atração emocional', mobile: 'Lei da Atração' },
                { key: 'prog', desktop: 'Progressão deliberada', mobile: 'Progressão' },
              ].map((b) => (
                <span key={b.key} className="metric-badge px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)', color: BLUE, letterSpacing: '0.03em' }}>
                  <span className="sm:hidden">{b.mobile}</span>
                  <span className="hidden sm:inline">{b.desktop}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DEPOIMENTO FERNANDA — antes do editorial
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-10 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="p-7 sm:p-9 rounded-3xl relative overflow-hidden" style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 16px 48px rgba(212,175,55,0.12)', borderTop: `4px solid ${BLUE}` }}>
              <span className="absolute top-3 right-6 select-none pointer-events-none" style={{ fontSize: '8rem', lineHeight: 1, color: 'rgba(212,175,55,0.06)', fontFamily: "'Inter', sans-serif" }}>"</span>
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => <svg key={j} className="w-5 h-5" fill="#D4AF37" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              <p className="text-base sm:text-lg leading-relaxed mb-6 relative z-10" style={{ color: BODY }}>
                "Fiz o protocolo sem muita expectativa. No Dia 2, quando ele fala sobre o contrato inconsciente com a escassez, eu chorei. Lembrei da minha mãe dizendo que dinheiro é difícil. Carregava isso há 30 anos. Dois meses depois fechei meu maior contrato —{' '}
                <strong style={{ color: BLUE }}>R$4.800 num único cliente.</strong>"
              </p>
              <div className="flex items-center gap-3">
                <img src="/avatar-fernanda.webp" alt="Fernanda Rocha" className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm" style={{ color: DARK }}>Fernanda Rocha, 37</p>
                  <p className="text-xs" style={{ color: '#5C5140' }}>Nutricionista autônoma · Curitiba</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            EDITORIAL TITLE
        ══════════════════════════════════════════ */}
        <section className="editorial-section px-5 sm:px-6 lg:px-8 py-14 sm:py-20 text-center" style={{ background: '#FBF7ED' }}>
          <div className="max-w-3xl mx-auto fade-in">
            <h2 className="editorial-title" style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', color: DARK, fontWeight: 800, lineHeight: 1.2 }}>
              E se o problema nunca foi falta de esforço?
              <br />
              <span className="editorial-highlight" style={{ color: BLUE }}>E se for um programa rodando sem sua permissão?</span>
            </h2>
          </div>
        </section>

        {/* Ponte narrativa */}
        <div className="text-center px-5 py-8 bg-white">
          <p style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: DARK, fontWeight: 700, lineHeight: 1.35 }}>
            Veja o que acontece em cada sessão — e por que a ordem importa.
          </p>
        </div>

        {/* ══════════════════════════════════════════
            FEATURE 1 — texto esquerda / mockup direita
        ══════════════════════════════════════════ */}
        <section className="feature-section px-5 sm:px-6 lg:px-8 py-14 sm:py-[7.5rem] bg-white">
          <div className="max-w-5xl mx-auto fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text */}
              <div>
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-widest mb-5" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.2)`, color: BLUE }}>
                  DIA 1 · O DIAGNÓSTICO
                </span>
                <h3 className="feature-title" style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: DARK, fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
                  Enxergue o padrão que sempre operou no escuro.
                </h3>
                <p className="feature-body text-base sm:text-lg leading-relaxed mb-6" style={{ color: BODY, lineHeight: '1.65' }}>
                  Antes de mudar, você precisa ver. No Dia 1, você descobre o termostato financeiro que opera em silêncio — o ponto definido pelo seu cérebro que sabota qualquer avanço. Enquanto o termostato estiver em 22°C, o sistema vai trabalhar para voltar lá. Com dinheiro é igual.{' '}
                  <strong>A maioria das pessoas nunca percebeu que opera no piloto automático da escassez.</strong>
                </p>
                {/* Pull quote */}
                <blockquote className="py-5 px-6 rounded-2xl" style={{ background: 'rgba(247,231,183,0.1)', border: '1.5px solid rgba(247,231,183,0.25)' }}>
                  <p className="text-base sm:text-lg font-bold italic" style={{ fontFamily: "'Inter', sans-serif", color: DARK }}>
                    "Força de vontade não recalibra termostato. Reprogramação sim."
                  </p>
                </blockquote>
              </div>
              {/* Mockup */}
              <div className="feature-mockup flex items-center justify-center">
                <PlayerMockup day={1} title="O Diagnóstico" progress={38} rotate={-2} />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE 2 — mockup esquerda / texto direita
        ══════════════════════════════════════════ */}
        <section className="feature-section px-5 sm:px-6 lg:px-8 py-14 sm:py-[7.5rem]" style={{ background: '#FBF7ED' }}>
          <div className="max-w-5xl mx-auto fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Mockup first on mobile, left on desktop */}
              <div className="feature-mockup flex items-center justify-center order-2 lg:order-1">
                <SessionListMockup rotate={1.5} />
              </div>
              {/* Text */}
              <div className="order-1 lg:order-2">
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-widest mb-5" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.2)`, color: BLUE }}>
                  DIA 2 · QUEBRANDO O CONTRATO
                </span>
                <h3 className="feature-title" style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: DARK, fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
                  O contrato que você nunca assinou — mas cumpre todo dia.
                </h3>
                <p className="feature-body text-base sm:text-lg leading-relaxed mb-6" style={{ color: BODY, lineHeight: '1.65' }}>
                  Quando criança, você absorveu crenças sobre dinheiro que viraram contratos invisíveis. "Dinheiro é difícil." "Não é para mim." No Dia 2, você identifica e quebra esse contrato. É a sessão mais poderosa do protocolo — e a que mais transforma.{' '}
                  <strong>É a sessão que mais faz chorar. E a que mais transforma.</strong>
                </p>
                <button
                  onClick={scrollToOferta}
                  className="inline-flex items-center gap-1 font-semibold text-sm transition-all hover:gap-2"
                  style={{ color: BLUE }}
                >
                  Ver o protocolo completo →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE 3 — texto esquerda / mockup direita
        ══════════════════════════════════════════ */}
        <section className="feature-section px-5 sm:px-6 lg:px-8 py-14 sm:py-[7.5rem] bg-white">
          <div className="max-w-5xl mx-auto fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-widest mb-5" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.2)`, color: BLUE }}>
                  DIA 3 · A FREQUÊNCIA DO RECEBER
                </span>
                <h3 className="feature-title" style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: DARK, fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
                  O canal que seu cérebro fechou para se proteger.
                </h3>
                <p className="feature-body text-base sm:text-lg leading-relaxed" style={{ color: BODY, lineHeight: '1.65' }}>
                  A maioria das pessoas sabe pedir. Pouquíssimas sabem receber. Você abre o canal que estava bloqueado e começa a perceber oportunidades que antes eram invisíveis. Não é magia — <strong>seu cérebro finalmente calibrado para ver o que sempre esteve ali.</strong>
                </p>
              </div>
              <div className="feature-mockup flex items-center justify-center">
                <PlayerMockup day={3} title="A Frequência do Receber" progress={55} rotate={1.5} />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE 4 — mockup esquerda / texto direita
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-20 sm:py-[7.5rem]" style={{ background: '#FBF7ED' }}>
          <div className="max-w-5xl mx-auto fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="flex items-center justify-center order-2 lg:order-1">
                <ProgressMockup rotate={-1.5} />
              </div>
              <div className="order-1 lg:order-2">
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-widest mb-5" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.2)`, color: BLUE }}>
                  DIA 6 · MERECIMENTO SEM CULPA
                </span>
                <h3 style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: DARK, fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
                  A crença que você nem sabe que tem.
                </h3>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: BODY, lineHeight: '1.65' }}>
                  O maior bloqueio financeiro não é falta de esforço — é a crença de que você não merece. É a sessão que mais pessoas relatam ter ouvido mais de uma vez. Porque a mudança que ela provoca é profunda.
                </p>
                <p className="text-sm font-semibold mt-4" style={{ color: BLUE }}>
                  92% dos participantes ouviram essa sessão mais de uma vez.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LINHA DE TENSÃO
        ══════════════════════════════════════════ */}
        <div className="text-center px-5 py-10 bg-white">
          <p style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', color: DARK, fontWeight: 700, lineHeight: 1.35 }}>
            Cada sessão dura menos que um café. E opera enquanto você não está prestando atenção.
          </p>
        </div>

        {/* ══════════════════════════════════════════
            CTA INTERMEDIÁRIO
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center bg-white">
          <div className="max-w-2xl mx-auto fade-in">
            <h2 style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: DARK, fontWeight: 800, lineHeight: 1.2, marginBottom: '32px' }}>
              Você vai continuar tentando do mesmo jeito?
            </h2>
            <CtaBtn label="Quero tentar diferente — R$67 →" large />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PROPOSTA DE VALOR
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-20 sm:py-[7.5rem]" style={{ background: '#FBF7ED' }}>
          <div className="max-w-5xl mx-auto fade-in">
            <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-12" style={{ fontFamily: "'GT Walsheim', sans-serif", color: DARK }}>
              Não é só um áudio. É seu protocolo de transformação.
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-7 sm:p-8 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: SHADOW }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Brain width="24" height="24" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-3" style={{ color: DARK }}>Neuroplasticidade aplicada</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: BODY, lineHeight: '1.65' }}>
                  Seu cérebro foi condicionado a um nível fixo de prosperidade. Cada sessão cria novos caminhos neurais substituindo os padrões antigos — não pela força da vontade, mas pela reorganização do próprio sistema que os criou.
                </p>
                <p className="text-xs mt-3 font-semibold" style={{ color: BLUE }}>
                  Estudos mostram que novos padrões neurais se formam em 7-21 dias de repetição deliberada.
                </p>
              </div>
              <div className="p-7 sm:p-8 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: SHADOW }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Magnet width="24" height="24" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-3" style={{ color: DARK }}>Lei da Atração emocional</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: BODY, lineHeight: '1.65' }}>
                  Não é sobre pensar positivo. É sobre sentir diferente. Quando o estado emocional muda, as decisões mudam. E os resultados seguem.
                </p>
              </div>
            </div>
            <div className="p-7 sm:p-8 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: SHADOW }}>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: BODY, lineHeight: '1.65' }}>
                Foi projetado para funcionar mesmo se você nunca meditou, mesmo se é cético, mesmo se já tentou tudo. Cada sessão se aprofunda onde a anterior terminou. No 7º dia, a reprogramação opera no nível da identidade.
              </p>
              <div className="h-px mb-4" style={{ background: 'rgba(0,0,0,0.07)' }} />
              <p className="text-sm sm:text-base font-semibold text-center" style={{ color: BLUE }}>
                Funciona até para quem não acredita. A neuroplasticidade não precisa da sua permissão.
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-3 text-center">
                O Código da Abundância — 7 sessões completas — por
              </p>
              <p className="font-extrabold leading-none mb-3 text-center" style={{ fontSize: 'clamp(3.5rem, 10vw, 5rem)', color: '#F5C842' }}>R$67</p>
              <p className="text-sm text-gray-400 text-center">uma única vez · Sem renovação · Sem assinatura</p>
            </div>
            <div className="text-center mt-10">
              <CtaBtn label="Começar agora — R$67 →" large />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DEPOIMENTOS
        ══════════════════════════════════════════ */}
        <section id="depoimentos" className="overflow-hidden">
          {/* Gradient header band */}
          <div className="px-5 sm:px-6 lg:px-8 py-16 text-center" style={{ background: BLUE }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: "'GT Walsheim', sans-serif" }}>
              Eles completaram o protocolo.<br />Veja o que dizem.
            </h2>
          </div>

          {/* Cards */}
          <div className="px-5 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
            <div className="max-w-5xl mx-auto fade-in">
              {/* 2x2 grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {[
                  {
                    name: 'Marcos Vinícius, 44', role: 'Engenheiro civil · Goiânia', avatar: '/avatar-marcos.webp',
                    text: <>"Sou cético por formação. O que me pegou foi a neuroplasticidade no Dia 1 — fez sentido técnico. Terminei os 7 dias. Não virei milionário, mas <strong style={{ color: BLUE }}>tomei uma decisão de investimento que vinha adiando há 2 anos.</strong> Pequeno? Talvez. Mas real."</>,
                    accent: LILAC,
                  },
                  {
                    name: 'Camila Duarte, 31', role: 'Empreendedora · Florianópolis', avatar: '/avatar-camila.webp',
                    text: <>"O Dia 6 foi o mais difícil. Merecimento sem culpa. Ouvi essa sessão três vezes. Na terceira, alguma coisa destravou. <strong style={{ color: BLUE }}>Reajustei meus preços na semana seguinte</strong> — algo que eu nunca tinha conseguido fazer."</>,
                    accent: BLUE,
                  },
                  {
                    name: 'Juliana Costa, 29', role: 'Professora · São Paulo', avatar: '/avatar-extra.webp',
                    text: <>"Sempre gastei quando me sentia ansiosa. Depois do Dia 5, entendi de onde isso vinha. Pela primeira vez em anos, <strong style={{ color: BLUE }}>fechei o mês no azul — não por força de vontade</strong>, mas porque o gatilho simplesmente perdeu força."</>,
                    accent: LILAC,
                  },
                  {
                    name: 'Paulo Mendes, 48', role: 'Servidor público · Recife', avatar: '/avatar-marcos.webp',
                    text: <>"Fui muito cético. Mas minha esposa fez e ficou diferente — mais tranquila com dinheiro. Fiz também. Não é milagre, mas há um mês <strong style={{ color: BLUE }}>finalmente iniciei minha reserva de emergência</strong> — algo que procrastinava há 6 anos."</>,
                    accent: BLUE,
                  },
                ].map((t, i) => (
                  <div key={i} className="p-6 rounded-2xl relative overflow-hidden" style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: SHADOW, borderTop: `3px solid ${t.accent}` }}>
                    <span className="absolute top-2 right-4 select-none pointer-events-none" style={{ fontSize: '5rem', lineHeight: 1, color: 'rgba(212,175,55,0.06)', fontFamily: "'Inter', sans-serif" }}>"</span>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => <svg key={j} className="w-4 h-4" fill="#D4AF37" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    </div>
                    <p className="text-sm sm:text-base mb-5 leading-relaxed relative z-10" style={{ color: BODY }}>{t.text}</p>
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: DARK }}>{t.name}</p>
                        <p className="text-xs" style={{ color: '#5C5140' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="font-semibold text-sm sm:text-base mb-3" style={{ color: BODY }}>
                  +{TOTAL_PARTICIPANTS.toLocaleString('pt-BR')} pessoas. E crescendo toda semana.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: BLUE }}>
                  ⭐ 4.9/5 de avaliação média
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PREÇO
        ══════════════════════════════════════════ */}
        <section ref={ofertaRef} id="oferta" className="px-5 sm:px-6 lg:px-8 py-20 sm:py-[7.5rem]" style={{ background: '#FBF7ED' }}>
          <div className="max-w-xl mx-auto fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center" style={{ fontFamily: "'GT Walsheim', sans-serif", color: DARK }}>
              Tudo isso por menos que um jantar fora.
            </h2>
            <div className="h-0.5 w-12 bg-[#FFB932] mx-auto mb-8 sm:mb-12 rounded-full" />

            <div className="rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 24px 64px rgba(212,175,55,0.15), 0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ height: '4px', background: BLUE }} />
              <div className="p-7 sm:p-10">
                {/* Anchor price */}
                <div className="text-center mb-6 py-4 rounded-2xl" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <p className="text-sm mb-1" style={{ color: '#5C5140' }}>
                    Valor real: <span style={{ textDecoration: 'line-through' }}>R$280</span>
                  </p>
                  <p className="font-bold text-lg" style={{ color: BLUE }}>Hoje: R$67 <span className="text-sm font-semibold">(76% off)</span></p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    { item: '7 sessões de reprogramação neurológica — protocolo progressivo (6–8 min cada)', value: 'De R$280' },
                    { item: 'Acesso vitalício — ouça quantas vezes quiser, para sempre', value: '' },
                    { item: 'Disponível no app Ecotopia — iOS e Android', value: '' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FBF4DF', border: '1px solid #F1D99D' }}>
                          <Check className="w-3 h-3" style={{ color: '#D4AF37' }} />
                        </div>
                        <span className="text-sm sm:text-base" style={{ color: BODY }}>{item.item}</span>
                      </div>
                      {item.value && <span className="text-sm flex-shrink-0" style={{ color: '#5C5140', textDecoration: 'line-through' }}>{item.value}</span>}
                    </div>
                  ))}
                </div>

                <div className="h-px mb-8" style={{ background: 'rgba(0,0,0,0.07)' }} />

                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.2)`, color: BLUE }}>
                    Oferta especial
                  </div>
                  <p className="text-sm sm:text-base mb-3" style={{ color: BODY }}>
                    Coaching financeiro: <span style={{ textDecoration: 'line-through', color: '#5C5140' }}>R$300/hora</span>.{' '}
                    Terapia: <span style={{ textDecoration: 'line-through', color: '#5C5140' }}>R$180/sessão</span>.{' '}
                    Código da Abundância: 7 sessões completas por R$67. Uma vez. Para sempre.
                  </p>
                  <p className="text-sm mb-3" style={{ color: BODY }}>Seu investimento hoje:</p>
                  <p className="font-extrabold leading-none mb-2" style={{ fontSize: 'clamp(3.5rem, 10vw, 5rem)', color: BLUE, fontFamily: "'Inter', sans-serif" }}>R$67</p>
                  <p className="text-sm" style={{ color: '#5C5140' }}>uma única vez · Sem renovação · Sem assinatura</p>
                </div>

                <div className="flex justify-center">
                  <CtaBtn label="Começar agora — R$67 →" />
                </div>

                {/* Social counter */}
                <p className="text-center text-sm mt-3 font-medium" style={{ color: '#5C5140' }}>
                  🔥 Mais de 4.247 pessoas já começaram.
                </p>

                {/* Garantia inline */}
                <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FBF4DF' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    </div>
                    <p className="text-sm" style={{ color: BODY }}>
                      Garantia de 7 dias. Se não sentir diferença, devolvemos <strong style={{ color: DARK }}>100% do valor</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-20 sm:py-[7.5rem] bg-white">
          <div className="max-w-3xl mx-auto fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-center" style={{ fontFamily: "'GT Walsheim', sans-serif", color: DARK }}>
              Tem alguma dúvida?
            </h2>
            <div className="h-1 w-12 mx-auto rounded-full mb-12" style={{ background: BLUE }} />

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-card rounded-2xl overflow-hidden transition-all"
                  style={{ background: '#FBF7ED', border: `1.5px solid ${openFaqs.has(index) ? `rgba(212,175,55,0.25)` : 'rgba(0,0,0,0.07)'}`, boxShadow: SHADOW }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 text-left"
                  >
                    <span className="text-sm sm:text-base font-semibold" style={{ color: DARK }}>{faq.question}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: openFaqs.has(index) ? `rgba(212,175,55,0.1)` : 'white', border: `1.5px solid ${openFaqs.has(index) ? `rgba(212,175,55,0.25)` : 'rgba(0,0,0,0.08)'}` }}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-[250ms]" style={{ color: BLUE, transform: openFaqs.has(index) ? 'rotate(45deg)' : 'rotate(0deg)' }} />
                    </div>
                  </button>
                  <div style={{ maxHeight: openFaqs.has(index) ? '400px' : '0', overflow: 'hidden', transition: 'max-height 300ms ease-in-out' }}>
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <p className="text-sm sm:text-base leading-relaxed" style={{ color: BODY }}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section className="px-5 sm:px-6 lg:px-8 py-20 sm:py-28 text-center" style={{ background: BLUE }}>
          <div className="max-w-2xl mx-auto fade-in">
            <div className="h-px w-20 mx-auto mb-10" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <h2 className="font-bold mb-4 leading-tight text-white" style={{ fontFamily: "'GT Walsheim', sans-serif", fontSize: 'clamp(1.8rem, 4.5vw, 3rem)' }}>
              Daqui a 7 dias, você pode estar no mesmo lugar. Ou pode estar diferente.
            </h2>
            <p className="text-lg font-semibold mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
              A escolha é agora.
            </p>

            <div className="max-w-sm mx-auto space-y-3 mb-10 text-left">
              {[
                '7 sessões de reprogramação neurológica — protocolo progressivo',
                'Acesso vitalício no app Ecotopia',
                'Garantia de 7 dias — teste sem risco',
                'Pagamento único — R$67',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCTA}
              disabled={loadingPayment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-xl sm:text-2xl transition-all hover:opacity-95 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'white', color: BLUE, borderRadius: '100px', padding: '20px 48px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            >
              {loadingPayment ? 'Aguarde...' : 'Começar agora — R$67 →'}
            </button>

            <p className="text-xs sm:text-sm mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Acesso imediato · Sem assinatura · Sem renovação automática · Garantia de 7 dias
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <footer className="bg-white border-t px-5 sm:px-6 lg:px-8 py-10" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <img src="/logo-ecotopia.webp" alt="Ecotopia" className="h-9 w-auto" style={{ opacity: 0.55 }} />
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {['Termos de uso', 'Política de privacidade', 'Contato'].map((link, i, arr) => (
                <span key={link} className="flex items-center gap-5">
                  <a href="#" className="text-xs sm:text-sm transition-colors hover:opacity-80" style={{ color: '#5C5140' }}>{link}</a>
                  {i < arr.length - 1 && <span style={{ color: '#BFAF90', fontSize: '12px' }}>·</span>}
                </span>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: '#5C5140' }}>© 2024 Ecotopia. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>

      {/* Sticky bar mobile */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[999]"
        style={{
          background: 'white',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease',
        }}
      >
        <button
          onClick={handleCTA}
          disabled={loadingPayment}
          style={{
            background: BLUE,
            color: 'white',
            width: '100%',
            height: '44px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 200ms',
          }}
        >
          {loadingPayment ? 'Aguarde...' : 'Começar agora — R$67 →'}
        </button>
      </div>

      <style>{`
        .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade-in-visible { opacity: 1; transform: translateY(0); }
        .cta-btn { transition: box-shadow 200ms ease, transform 200ms ease, opacity 200ms ease; }
        .cta-btn:hover:not(:disabled) { box-shadow: 0 12px 40px rgba(212,175,55,0.5) !important; }
        .faq-card { transition: border-color 200ms ease; }
        .faq-card:hover { border-color: rgba(212,175,55,0.3) !important; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        @media (max-width: 639px) {
          /* ── Global ── */
          .mobile-px { padding-left: 20px !important; padding-right: 20px !important; }

          /* ── Hero ── */
          .hero-h1 { font-size: 2rem !important; }
          .hero-urgency { font-size: 13px !important; }
          .hero-subtitle { font-size: 15px !important; line-height: 1.55 !important; }
          .hero-micro { font-size: 12px !important; }
          .hero-guarantee { font-size: 13px !important; }
          .hero-mockup { border-radius: 10px !important; margin-bottom: 20px !important; }

          /* ── CTA Buttons ── */
          .cta-btn {
            padding: 16px 32px !important;
            font-size: 16px !important;
            border-radius: 14px !important;
            max-width: 320px !important;
            min-height: 52px !important;
            width: auto !important;
          }
          .cta-btn-full { max-width: 100% !important; width: 100% !important; }

          /* ── Metrics ── */
          .metric-label { font-size: 10px !important; letter-spacing: -0.01em; }
          .metric-badge { font-size: 10px !important; padding: 5px 12px !important; }

          /* ── Editorial ── */
          .editorial-h2 { font-size: 26px !important; line-height: 1.25 !important; }
          .editorial-gold { font-size: 22px !important; }

          /* ── Features ── */
          .feature-h3 { font-size: 24px !important; }
          .feature-body { font-size: 15px !important; line-height: 1.6 !important; }
          .phone-wrap { max-width: 240px !important; margin: 0 auto !important; }
          .feature-gap { gap: 24px !important; }

          /* ── Proposta de Valor ── */
          .proposta-title { font-size: 24px !important; }
          .card-h4 { font-size: 15px !important; }
          .card-p { font-size: 14px !important; line-height: 1.5 !important; }
          .card-highlight { font-size: 14px !important; }

          /* ── Depoimentos ── */
          .depo-title { font-size: 24px !important; }
          .depo-card-inner { padding: 24px 20px !important; }
          .depo-badge { font-size: 13px !important; }

          /* ── Preço ── */
          .preco-title { font-size: 24px !important; }
          .preco-item-text { font-size: 13px !important; }
          .preco-item-val { font-size: 12px !important; }
          .preco-big { font-size: 52px !important; }
          .preco-sub { font-size: 13px !important; }
          .preco-social { font-size: 13px !important; }
          .preco-guarantee { font-size: 13px !important; }
          .preco-badge { font-size: 10px !important; }
          .preco-compare { font-size: 13px !important; }
          .preco-anchor-main { font-size: 18px !important; }
          .preco-anchor-sub { font-size: 14px !important; }

          /* ── FAQ ── */
          .faq-btn { padding: 18px 16px !important; }
          .faq-answer-wrap { padding: 0 16px 16px !important; }
          .faq-answer-text { font-size: 14px !important; line-height: 1.55 !important; }
          .faq-q-text { font-size: 15px !important; }

          /* ── CTA Final ── */
          .cta-final-h2 { font-size: 22px !important; }
          .cta-final-sub { font-size: 18px !important; }
          .cta-final-micro { font-size: 11px !important; }
          .cta-final-item { font-size: 14px !important; }
        }
        /* Shield pulse animation */
        @keyframes shield-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 185, 50, 0.2); }
          50% { box-shadow: 0 0 0 10px rgba(255, 185, 50, 0); }
        }
        .shield-pulse {
          animation: shield-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingCodigoDaAbundancia;
