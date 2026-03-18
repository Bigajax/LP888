import { useEffect } from 'react';

const GOLD = '#D4AF37';
const DARK = '#050505';

export default function AbundanciaErro() {
  useEffect(() => {
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
      {/* Ícone de erro */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 0 48px rgba(192,57,43,0.35)',
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.2,
          marginBottom: '16px',
          maxWidth: '480px',
        }}
      >
        Pagamento não concluído
      </h1>

      {/* Subtítulo */}
      <p
        style={{
          fontSize: 'clamp(15px, 3.5vw, 18px)',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.6,
          maxWidth: '400px',
          marginBottom: '40px',
        }}
      >
        Algo deu errado durante o pagamento. Não se preocupe — nenhuma cobrança foi realizada.
      </p>

      {/* Card de sugestões */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '28px 32px',
          maxWidth: '400px',
          width: '100%',
          marginBottom: '40px',
          textAlign: 'left',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          O que pode ter acontecido
        </p>
        {[
          'Dados do cartão incorretos',
          'Saldo insuficiente',
          'Pagamento cancelado antes de finalizar',
          'Instabilidade temporária do banco',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>•</span>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <a
          href="https://lp-888.vercel.app/"
          style={{
            display: 'block',
            padding: '15px 32px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #B8962E 100%)`,
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(212,175,55,0.35)',
            textAlign: 'center',
          }}
        >
          Tentar novamente
        </a>
        <a
          href="https://lp-888.vercel.app/"
          style={{
            display: 'block',
            padding: '14px 32px',
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '50px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'center',
          }}
        >
          Voltar à página inicial
        </a>
      </div>
    </div>
  );
}
