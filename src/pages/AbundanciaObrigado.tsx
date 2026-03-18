import { useEffect } from 'react';
import { trackEvent } from '../lib/meta';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F7E7B7';
const DARK = '#050505';

export default function AbundanciaObrigado() {
  useEffect(() => {
    trackEvent('Purchase', { content_name: 'protocolo_abundancia_7_dias', value: 67, currency: 'BRL' }).catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: DARK,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      }}
    >
      {/* Ícone de sucesso */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${GOLD} 0%, #B8962E 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: `0 0 48px rgba(212,175,55,0.45)`,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: 'clamp(26px, 6vw, 38px)',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.2,
          marginBottom: '16px',
          maxWidth: '520px',
        }}
      >
        Compra realizada com sucesso!
      </h1>

      {/* Subtítulo */}
      <p
        style={{
          fontSize: 'clamp(15px, 3.5vw, 18px)',
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.6,
          maxWidth: '440px',
          marginBottom: '40px',
        }}
      >
        Bem-vindo ao <strong style={{ color: GOLD_LIGHT }}>Código da Abundância</strong>. Verifique seu e-mail — as instruções de acesso chegam em instantes.
      </p>

      {/* Card de próximos passos */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid rgba(212,175,55,0.25)`,
          borderRadius: '16px',
          padding: '28px 32px',
          maxWidth: '420px',
          width: '100%',
          marginBottom: '40px',
          textAlign: 'left',
        }}
      >
        <p style={{ color: GOLD, fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
          Próximos passos
        </p>
        {[
          { num: '1', text: 'Verifique sua caixa de entrada e o spam' },
          { num: '2', text: 'Clique no link de acesso enviado por e-mail' },
          { num: '3', text: 'Comece a Sessão 1 hoje mesmo' },
        ].map(({ num, text }) => (
          <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                minWidth: '28px',
                height: '28px',
                borderRadius: '50%',
                background: `rgba(212,175,55,0.15)`,
                border: `1px solid rgba(212,175,55,0.4)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: GOLD,
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {num}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Botão voltar */}
      <a
        href="https://lp-888.vercel.app/"
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: `linear-gradient(135deg, ${GOLD} 0%, #B8962E 100%)`,
          color: '#0A0A0A',
          fontWeight: 700,
          fontSize: '15px',
          borderRadius: '50px',
          textDecoration: 'none',
          boxShadow: `0 4px 24px rgba(212,175,55,0.35)`,
        }}
      >
        Voltar à página inicial
      </a>
    </div>
  );
}
