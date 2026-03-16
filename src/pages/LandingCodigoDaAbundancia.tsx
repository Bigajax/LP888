import { useState, useEffect, useRef } from 'react';
import { Check, Plus } from 'lucide-react';
import { trackEvent } from '../lib/meta';

const TOTAL_PARTICIPANTS = 4247;
const PRODUCT_KEY = 'protocolo_abundancia_7_dias';

const LandingCodigoDaAbundancia = () => {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([0, 4]));
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const ofertaRef = useRef<HTMLElement>(null);

  // ── PageView: dispara uma vez ao montar ──────────────────────────────────
  useEffect(() => {
    trackEvent('PageView').catch(() => {});
  }, []);

  // ── ViewContent: dispara quando a seção de oferta entra na viewport ──────
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

  // Sticky bar: aparece após o hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero')?.offsetHeight ?? 600;
      setShowStickyBar(window.scrollY > heroHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Contador animado (hero social proof)
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

  // Fade-in on scroll
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
    const els = document.querySelectorAll('.fade-in');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const getCounterMessage = (count: number) => {
    if (count === 0) return null;
    if (count <= 2) return {
      text: `Você marcou ${count} de 6. O padrão já está visível.`,
      color: 'text-gray-400',
    };
    if (count <= 4) return {
      text: `Você marcou ${count} de 6. Isso confirma: seu termostato financeiro está ativo. A boa notícia? Dá pra recalibrar em 7 dias.`,
      color: 'text-[#FFB932]',
    };
    if (count === 5) return {
      text: `Você marcou 5 de 6. Isso confirma: o termostato está no controle da sua vida. A boa notícia? Dá pra recalibrar em 7 dias.`,
      color: 'text-[#FFB932]',
    };
    return {
      text: `Você marcou todos os 6. Isso não é coincidência — é um sistema operando contra você. A boa notícia? Dá pra recalibrar em 7 dias.`,
      color: 'text-[#FFB932]',
    };
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const scrollToChecklist = () => {
    document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = async () => {
    if (loadingPayment) return;
    setLoadingPayment(true);

    // InitiateCheckout: Pixel + CAPI antes de abrir o checkout
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
      const preferenceId = data.preference_id
        ?? new URL(data.init_point).searchParams.get('pref_id');

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

  const sessions = [
    { day: 1, title: 'O Diagnóstico', description: 'Você finalmente enxerga o padrão que sempre operou no escuro — e entende de onde ele veio.' },
    { day: 2, title: 'Quebrando o Contrato', description: 'Você desfaz o acordo que fez com a escassez ainda criança. O mais poderoso do protocolo.' },
    { day: 3, title: 'A Frequência do Receber', description: 'Você abre o canal que estava bloqueado e começa a perceber oportunidades que antes eram invisíveis.' },
    { day: 4, title: 'Você no Futuro Próspero', description: 'Você habita neurologicamente a versão próspera de você mesmo — antes que ela aconteça.' },
    { day: 5, title: 'Gratidão Como Imã', description: 'Você cria o estado emocional que expande a percepção de oportunidades e dissolve a ansiedade financeira.' },
    { day: 6, title: 'Merecimento Sem Culpa', description: 'Você dissolve a crença mais profunda e mais silenciosa: a de que abundância não é para você.' },
    { day: 7, title: 'A Nova Identidade', description: 'Você não tenta mais atrair dinheiro. Você se torna uma pessoa próspera. A diferença muda tudo.' },
  ];

  const getTimelineStyle = (day: number) => {
    if (day <= 2) return { border: 'border-gray-700/50', bg: 'bg-gray-800/40', badge: 'bg-[#FFB932]/10 border-[#FFB932]/20', num: 'text-gray-400' };
    if (day <= 4) return { border: 'border-[#FFB932]/25', bg: 'bg-gray-800/50', badge: 'bg-[#FFB932]/15 border-[#FFB932]/30', num: 'text-[#FFB932]' };
    if (day <= 6) return { border: 'border-[#FFB932]/45', bg: 'bg-[#FFB932]/5', badge: 'bg-[#FFB932]/20 border-[#FFB932]/40', num: 'text-[#FFB932]' };
    return { border: 'border-[#FFB932]/60', bg: 'bg-[#FFB932]/8', badge: 'bg-[#FFB932]/30 border-[#FFB932]/50', num: 'text-[#FFB932]' };
  };

  const testimonials = [
    {
      name: 'Fernanda Rocha, 37',
      role: 'Nutricionista autônoma · Curitiba',
      avatar: '/avatar-fernanda.webp',
      result: (
        <>
          Fiz o protocolo sem muita expectativa. No Dia 2, quando ele fala sobre o contrato inconsciente com a escassez, eu chorei. Lembrei da minha mãe dizendo que dinheiro é difícil. Carregava isso há 30 anos. Dois meses depois fechei meu maior contrato —{' '}
          <strong style={{ fontWeight: 700, color: '#F5C842' }}>R$4.800 num único cliente</strong>.
        </>
      ),
    },
    {
      name: 'Marcos Vinícius, 44',
      role: 'Engenheiro civil · Goiânia',
      avatar: '/avatar-marcos.webp',
      result: (
        <>
          Sou cético por formação. Entrei achando que era autoajuda disfarçada. O que me pegou foi a parte da neuroplasticidade no Dia 1 — fez sentido técnico. Terminei os 7 dias. Não virei milionário, mas{' '}
          <strong style={{ fontWeight: 700, color: '#F5C842' }}>tomei uma decisão de investimento que vinha adiando há 2 anos</strong>. Pequeno? Talvez. Mas real.
        </>
      ),
    },
    {
      name: 'Camila Duarte, 31',
      role: 'Empreendedora · Florianópolis',
      avatar: '/avatar-camila.webp',
      result: (
        <>
          O Dia 6 foi o mais difícil. Merecimento sem culpa. Eu realmente não achava que merecia ganhar mais do que meu pai ganhou a vida inteira. Ouvi essa sessão três vezes. Na terceira, alguma coisa destravou.{' '}
          <strong style={{ fontWeight: 700, color: '#F5C842' }}>Reajustei meus preços na semana seguinte</strong> — algo que eu nunca tinha conseguido fazer.
        </>
      ),
    },
    {
      name: 'Juliana Costa, 29',
      role: 'Professora · São Paulo',
      avatar: '/avatar-extra.webp',
      result: (
        <>
          Sempre gastei quando me sentia ansiosa. Depois do Dia 5, entendi de onde isso vinha. Pela primeira vez em anos,{' '}
          <strong style={{ fontWeight: 700, color: '#F5C842' }}>fechei o mês no azul — não por força de vontade</strong>, mas porque o gatilho simplesmente perdeu força.
        </>
      ),
    },
    {
      name: 'Paulo Mendes, 48',
      role: 'Servidor público · Recife',
      avatar: '/avatar-marcos.webp',
      result: (
        <>
          Fui muito cético. Mas minha esposa fez e ficou diferente — mais tranquila com dinheiro. Fiz também. Não é milagre, mas há um mês{' '}
          <strong style={{ fontWeight: 700, color: '#F5C842' }}>finalmente iniciei minha reserva de emergência</strong> — algo que procrastinava há 6 anos.
        </>
      ),
    },
  ];

  const faqs = [
    {
      question: 'Isso é só meditação, já tentei',
      answer: 'O Código da Abundância não é uma meditação relaxante. É um protocolo de reprogramação. Cada sessão tem um objetivo neurológico específico e uma sequência deliberada. Relaxamento é efeito colateral, não o objetivo.',
    },
    {
      question: 'Preciso ter experiência com meditação?',
      answer: 'Não. As sessões são guiadas do zero. Você só precisa de fone de ouvido e 20 minutos. Muitos dos nossos melhores resultados vieram de pessoas que nunca tinham meditado antes.',
    },
    {
      question: 'Eu não sei meditar',
      answer: 'Cada sessão é 100% guiada por voz. Você não precisa saber nada, ter experiência ou sentar em posição específica. Precisa apenas de 20 minutos e fone de ouvido.',
    },
    {
      question: 'E se não funcionar para mim?',
      answer: 'Neuroplasticidade não é opcional — é como o cérebro funciona. O que pode variar é a velocidade. Algumas pessoas sentem mudança no Dia 2. Para outras, a virada vem no Dia 6. A sequência foi desenhada para respeitar esse processo. E se mesmo assim você não sentir diferença, a garantia de 7 dias cobre totalmente.',
    },
    {
      question: 'Funciona mesmo se eu não acredito nisso?',
      answer: 'Essa é a pergunta mais honesta que alguém pode fazer. E a resposta é: a neuroplasticidade não precisa da sua crença para funcionar. Seu cérebro já é reprogramado por experiências todo dia — com ou sem a sua permissão. O protocolo só usa esse mesmo mecanismo de forma intencional. Você não precisa acreditar. Precisa só fazer.',
    },
    {
      question: 'Por que R$67 por algo que é um áudio?',
      answer: 'Quanto você já gastou em coisas que não mudaram nada? Um jantar, um curso que ficou pela metade, uma assinatura que você nem usa? R$67 por uma reprogramação que opera no nível mais profundo da sua mente — e que você pode usar para sempre — é o menor investimento que você pode fazer em si mesmo hoje. Uma sessão de coaching custa R$300. Uma hora de terapia, R$180.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="w-full bg-[#FFB932] border-b border-[#e6a520] shadow-lg shadow-[#FFB932]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-center">
          <img src="/logo-ecotopia.webp" alt="Ecotopia" className="h-16 sm:h-20 w-auto" />
        </div>
      </header>

      <main>
        {/* ─── 1. HERO ─── */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32 overflow-hidden">
          {/* Radial gradient background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,185,50,0.12) 0%, transparent 70%)',
          }} />
          {/* Decorative glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: '#FFB932' }} />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-5 blur-2xl pointer-events-none" style={{ background: '#FFB932' }} />

          <div className="relative max-w-4xl mx-auto text-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FFB932]/10 border border-[#FFB932]/25 text-[#FFB932] text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              7 DIAS · PROTOCOLO PROGRESSIVO
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Você trabalha. Você se esforça.
              <br />
              Mas o dinheiro nunca fica.
            </h1>

            <p className="text-base sm:text-xl text-gray-300 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Não é falta de esforço. É um padrão invisível que sabota cada real que entra na sua vida.{' '}
              <strong className="text-white">E ele pode ser desligado.</strong>
            </p>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8">
              <div className="flex -space-x-2">
                {['/avatar-fernanda.webp', '/avatar-marcos.webp', '/avatar-camila.webp', '/avatar-extra.webp', '/avatar-fernanda.webp'].map((src, i) => (
                  <img key={i} src={src} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-950 object-cover bg-gray-700" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-400 text-center">
                +{displayCount.toLocaleString('pt-BR')} pessoas já mudaram sua relação com o dinheiro em 7 dias
              </span>
            </div>

            {/* Hero CTA — sem preço, leva ao checklist */}
            <button
              onClick={scrollToChecklist}
              className="cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 py-5 px-8 bg-gradient-to-r from-[#FFB932] to-[#F5C842] hover:opacity-90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-base sm:text-lg"
            >
              Quero descobrir meu bloqueio financeiro →
            </button>

            <div className="flex items-center justify-center mt-3" style={{ gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Acesso imediato · Pagamento único · Sem mensalidade
            </p>
          </div>
        </section>

        {/* ─── 1.5. BARRA DE MÉTRICAS ─── */}
        <div className="bg-gray-900/30 border-y border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-[#FFB932]/20">
              <div className="py-6 sm:py-8 text-center px-4">
                <p className="text-[#FFB932] text-2xl sm:text-3xl font-bold mb-1">4.247+</p>
                <p className="text-xs sm:text-sm text-gray-400">participantes</p>
              </div>
              <div className="py-6 sm:py-8 text-center px-4">
                <p className="text-[#FFB932] text-2xl sm:text-3xl font-bold mb-1">7 dias</p>
                <p className="text-xs sm:text-sm text-gray-400">protocolo</p>
              </div>
              <div className="py-6 sm:py-8 text-center px-4">
                <p className="text-[#FFB932] text-2xl sm:text-3xl font-bold mb-1">100%</p>
                <p className="text-xs sm:text-sm text-gray-400">garantia 7 dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. IDENTIFICAÇÃO: CHECKLIST ─── */}
        <section id="checklist" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Marque o que parece familiar:
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-8">
              {[
                'Quando o dinheiro começa a entrar bem, algo sempre aparece para zerar',
                'No fundo, uma voz sussurra que abundância não é para você. E você não sabe de onde veio essa voz.',
                'Você gasta antes de poupar — como se guardar fosse perigoso',
                'Você trabalha mais que muita gente que ganha mais que você',
                'Você sente culpa quando gasta, ansiedade quando poupa',
                'Você já tentou planilha, curso financeiro, lei da atração — e voltou para o mesmo lugar',
              ].map((item, index) => {
                const checked = checkedItems.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleCheck(index)}
                    className={`w-full flex gap-3 sm:gap-4 p-4 rounded-lg text-left cursor-pointer border transition-all duration-150 ${
                      checked
                        ? 'bg-[#FFB932]/10 border-[#FFB932]/60 checkbox-checked'
                        : 'bg-transparent border-transparent hover:border-[#F5C842]/25 hover:bg-[#F5C842]/[0.04]'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                      checked ? 'bg-[#FFB932] border-[#FFB932] ring-2 ring-[#FFB932]/30' : 'border-gray-600 hover:border-[#FFB932]/50'
                    }`}>
                      {checked && (
                        <svg className="w-3.5 h-3.5 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm sm:text-base transition-colors ${checked ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {item}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Resultado dinâmico */}
            {checkedItems.size > 0 && (() => {
              const msg = getCounterMessage(checkedItems.size);
              return msg ? (
                <div className="text-center py-5 px-6 rounded-lg bg-gray-800/50 border border-[#FFB932]/20 mb-8 transition-all backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(255,185,50,0.05) 0%, rgba(30,30,46,0.5) 100%)' }}>
                  <p className={`text-base sm:text-lg font-medium ${msg.color} mb-1`}>{msg.text}</p>
                  {checkedItems.size >= 3 && (
                    <button
                      onClick={handleCTA}
                      disabled={loadingPayment}
                      className="cta-btn mt-4 inline-flex items-center gap-2 py-5 px-8 bg-gradient-to-r from-[#FFB932] to-[#F5C842] hover:opacity-90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loadingPayment ? 'Aguarde...' : 'Quero recalibrar meu termostato em 7 dias → R$67'}
                    </button>
                  )}
                </div>
              ) : null;
            })()}

            {checkedItems.size === 0 && (
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed text-center">
                Se você marcou qualquer item acima, existe uma razão concreta para isso. Não é caráter. Não é inteligência. É um{' '}
                <strong className="text-[#FFB932]">termostato financeiro</strong> invisível — calibrado errado, operando em silêncio, te mantendo exatamente onde está.
              </p>
            )}
          </div>
        </section>

        {/* ─── 3. EDUCAÇÃO: TERMOSTATO ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Por que força de vontade nunca foi suficiente
            </h2>

            {/* Analogia ar-condicionado */}
            <div className="px-2 sm:px-6 mb-8 text-base sm:text-lg text-gray-300 leading-relaxed space-y-4">
              <p>
                Pense num ar-condicionado. Você pode abrir todas as janelas, ligar ventiladores, fazer qualquer coisa — mas enquanto o termostato estiver em 22°C, o sistema vai trabalhar para voltar lá.
              </p>
              <p>
                <strong className="text-white">O seu cérebro funciona exatamente assim com dinheiro.</strong> Tem um ponto definido. E quando você começa a ultrapassar esse ponto, o sistema inteiro se ativa para te trazer de volta.
              </p>
            </div>

            {/* Pull-quote destaque */}
            <div className="w-full py-5 px-6 mb-8 rounded-lg border border-[#FFB932]/30 bg-[#FFB932]/5 text-center relative overflow-hidden">
              <span className="absolute left-4 top-0 text-[#FFB932]/15 font-serif leading-none select-none" style={{ fontSize: '6rem', lineHeight: 1 }}>"</span>
              <p className="text-xl sm:text-2xl font-bold text-[#FFB932] leading-snug relative z-10">
                "Força de vontade não recalibra termostato.<br className="hidden sm:block" /> Reprogramação sim."
              </p>
            </div>

            {/* Visual antes / depois */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-lg backdrop-blur-sm bg-red-950/25 border border-red-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <h4 className="font-bold text-red-400 text-xs sm:text-sm uppercase tracking-wider">
                    Termostato calibrado errado
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    'Trabalha duro',
                    'Começa a ganhar mais',
                    'Algo "aparece" pra gastar',
                    'Volta ao ponto zero',
                    '↺ O ciclo se repete',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${i === 4 ? 'bg-red-800/50 text-red-300' : 'bg-red-900/40 text-red-400'}`}>
                        {i === 4 ? '↺' : i + 1}
                      </span>
                      <span className={i === 4 ? 'text-red-400 font-medium' : ''}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-lg backdrop-blur-sm bg-[#FFB932]/8 border border-[#FFB932]/25">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB932" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                  </svg>
                  <h4 className="font-bold text-[#FFB932] text-xs sm:text-sm uppercase tracking-wider">
                    Termostato recalibrado
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    'Trabalha com intenção',
                    'Começa a ganhar mais',
                    'Mantém e consolida',
                    'Identidade próspera cresce',
                    '↑ Expande naturalmente',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${i === 4 ? 'bg-[#FFB932]/30 text-[#FFB932]' : 'bg-[#FFB932]/15 text-[#FFB932]'}`}>
                        {i === 4 ? '↑' : i + 1}
                      </span>
                      <span className={i === 4 ? 'text-[#FFB932] font-medium' : ''}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-[#FFB932]/5 to-transparent border border-[#FFB932]/20">
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Você não recalibra um termostato com força de vontade. Você recalibra{' '}
                <strong className="text-white">reprogramando o sistema operacional que o controla.</strong>
              </p>
              <p className="mt-4 text-base sm:text-lg text-gray-300">
                É exatamente isso que o <strong className="text-[#FFB932]">Código da Abundância</strong> foi projetado para fazer.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 4. SOLUÇÃO: PRODUTO + TIMELINE ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-3xl mx-auto fade-in">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#FFB932]">
                Código da Abundância
              </h2>
              <p className="text-base sm:text-xl italic text-gray-400">
                7 sessões de áudio. 20 minutos por dia. Reprogramação financeira em profundidade.
              </p>
            </div>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
              Não é motivação. Não é "pense positivo e o dinheiro vem". É um protocolo de 7 dias que combina{' '}
              <strong className="text-white">neurociência da reprogramação de crenças</strong> com{' '}
              <strong className="text-white">Lei da Atração aplicada ao estado emocional.</strong>
            </p>

            {/* Timeline com imagens */}
            <div className="space-y-4">
              {sessions.map((session) => {
                const s = getTimelineStyle(session.day);
                const isEven = session.day % 2 === 0;
                return (
                  <div key={session.day} className={`rounded-xl border transition-all hover:brightness-110 overflow-hidden ${s.border} ${s.bg}`}>
                    <div className={`flex flex-col sm:flex-row gap-0 ${isEven ? 'sm:flex-row-reverse' : ''}`}>
                      {/* Image */}
                      <div className="sm:w-36 sm:flex-shrink-0">
                        <img
                          src={`/dia${session.day}.webp`}
                          alt={`Dia ${session.day}`}
                          className="w-full h-32 sm:h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex gap-4 p-4 sm:p-5 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border text-base ${s.badge} ${s.num}`}>
                            {session.day}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-bold text-sm sm:text-base leading-tight ${session.day === 7 ? 'text-[#FFB932]' : 'text-white'}`}>
                              {session.title}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">~20 min</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{session.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-base sm:text-xl text-gray-300 leading-relaxed mt-10 text-center italic">
              Cada sessão se aprofunda onde a anterior terminou. No 7º dia, a mudança não está mais no que você pensa sobre dinheiro.{' '}
              <strong className="text-[#FFB932] not-italic font-bold">Está em quem você é.</strong>
            </p>
          </div>
        </section>

        {/* ─── 5. PROVA SOCIAL: DEPOIMENTOS ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-950 border-y border-gray-800/60">
          <div className="max-w-5xl mx-auto fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              O que muda depois de 7 dias
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4">
              {testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700/50 shadow-2xl ring-1 ring-[#FFB932]/20 overflow-hidden" style={{ borderLeft: '3px solid #F5C842' }}>
                  {/* Decorative quote */}
                  <span className="absolute top-2 right-4 text-[#FFB932]/15 font-serif leading-none select-none pointer-events-none" style={{ fontSize: '5rem', lineHeight: 1 }}>"</span>
                  <div className="flex gap-1 mb-3 sm:mb-4 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-5 leading-relaxed relative z-10">"{t.result}"</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:max-w-2xl md:mx-auto mb-8">
              {testimonials.slice(3).map((t, i) => (
                <div key={i} className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700/50 shadow-2xl ring-1 ring-[#FFB932]/20 overflow-hidden" style={{ borderLeft: '3px solid #F5C842' }}>
                  <span className="absolute top-2 right-4 text-[#FFB932]/15 font-serif leading-none select-none pointer-events-none" style={{ fontSize: '5rem', lineHeight: 1 }}>"</span>
                  <div className="flex gap-1 mb-3 sm:mb-4 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-5 leading-relaxed relative z-10">"{t.result}"</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[#FFB932] font-medium text-base sm:text-lg">
              +{TOTAL_PARTICIPANTS.toLocaleString('pt-BR')} pessoas já completaram o protocolo
            </p>
          </div>
        </section>

        {/* ─── 6. OFERTA: PREÇO ─── */}
        <section ref={ofertaRef} id="oferta" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Tudo que você recebe hoje
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              {[
                {
                  item: '7 sessões de reprogramação neurológica — protocolo progressivo (~20 min cada)',
                  value: 'De R$280',
                },
                {
                  item: 'Áudio SOS: Ansiedade Financeira Aguda — para crises, decisões difíceis e bloqueios imediatos',
                  value: 'De R$47',
                },
                {
                  item: 'Acesso vitalício — ouça quantas vezes quiser, para sempre',
                  value: '',
                },
                {
                  item: 'Disponível no app Ecotopia — iOS e Android',
                  value: '',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932] flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-300">{item.item}</span>
                  </div>
                  {item.value && (
                    <span className="text-gray-400 font-medium flex-shrink-0" style={{ fontSize: '13px', textDecoration: 'line-through', textDecorationThickness: '2px' }}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Caixa de preço com destaque */}
            <div
              className="p-6 sm:p-8 rounded-xl border border-[#FFB932]/30 mb-8 sm:mb-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,185,50,0.12) 0%, rgba(255,185,50,0.04) 50%, transparent 100%)',
                boxShadow: '0 0 60px rgba(255,185,50,0.12)',
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB932]/15 border border-[#FFB932]/30 text-[#FFB932] text-xs font-semibold uppercase tracking-wider mb-4">
                Oferta especial
              </div>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
                Uma hora de coaching financeiro:{' '}
                <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>R$300</span>.{' '}
                Uma sessão de terapia:{' '}
                <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>R$180</span>.
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-3">
                O Código da Abundância — 7 sessões completas — por
              </p>
              <p className="font-extrabold leading-none mb-3" style={{ fontSize: 'clamp(3.5rem, 10vw, 5rem)', color: '#F5C842' }}>R$67</p>
              <p className="text-sm text-gray-400">uma única vez · Sem renovação · Sem assinatura</p>
            </div>

            <div className="text-center">
              <button
                onClick={handleCTA}
                disabled={loadingPayment}
                className="cta-btn w-full sm:w-auto group inline-flex items-center justify-center gap-2 py-5 px-8 bg-gradient-to-r from-[#FFB932] to-[#F5C842] hover:opacity-90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-base sm:text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loadingPayment ? 'Aguarde...' : <>Quero meu Código da Abundância — R$67 <span className="group-hover:translate-x-1 transition-transform">→</span></>}
              </button>
            </div>
          </div>
        </section>

        {/* ─── 7. GARANTIA ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-2xl mx-auto text-center fade-in">
            <div
              className="p-8 sm:p-10 rounded-2xl border border-[#FFB932]/40"
              style={{ background: 'linear-gradient(135deg, rgba(255,185,50,0.08) 0%, rgba(17,24,39,0.9) 100%)' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFB932]/10 border-2 border-[#FFB932]/40 mb-6 shield-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFB932" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Garantia de 7 dias: teste sem risco
              </h2>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
                Faça o protocolo completo. Se ao fim de 7 dias você não sentir nenhuma diferença na sua relação com o dinheiro, basta enviar uma mensagem e devolvemos <strong className="text-white">100% do valor</strong>. Sem perguntas, sem burocracia.
              </p>

              <p className="text-sm text-gray-500">
                Você não tem nada a perder — exceto o padrão que está te mantendo onde está.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 8. FAQ ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center">
              Perguntas frequentes
            </h2>
            <div className="h-0.5 w-12 bg-[#FFB932] mx-auto mb-8 sm:mb-12 rounded-full" />

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden transition-colors hover:border-[#FFB932]/30">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-6 text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <span className="text-sm sm:text-lg font-medium text-white">{faq.question}</span>
                    <Plus
                      className="w-5 h-5 text-[#FFB932] flex-shrink-0 transition-transform duration-[250ms] ease"
                      style={{ transform: openFaqs.has(index) ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    style={{
                      maxHeight: openFaqs.has(index) ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 300ms ease-in-out',
                    }}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 9. FECHAMENTO ─── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20" style={{ background: 'linear-gradient(to bottom, rgba(17,24,39,0.5) 0%, rgba(255,185,50,0.04) 50%, rgba(3,7,18,1) 100%)' }}>
          <div className="max-w-4xl mx-auto text-center fade-in">
            {/* Decorative line */}
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#FFB932] to-transparent mx-auto mb-8" />

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              Seu cérebro vai continuar executando o programa antigo amanhã.
              <br />
              <span className="text-gray-400">A menos que você decida mudar hoje.</span>
            </h2>

            <p className="text-white/80 mb-4" style={{ fontSize: '16px' }}>
              Você chegou até o final desta página. Isso já diz algo sobre você.
            </p>

            <p className="text-white/80 mb-12 sm:mb-16" style={{ fontSize: '16px' }}>
              Você chegou até aqui porque algo nessa página tocou num ponto verdadeiro. Não ignore isso.
            </p>

            <div className="max-w-md mx-auto space-y-3 mb-10 sm:mb-12 text-left">
              {[
                '7 sessões de reprogramação neurológica — protocolo progressivo',
                'Áudio SOS: Ansiedade Financeira Aguda incluso',
                'Acesso vitalício no app Ecotopia',
                'Garantia de 7 dias — teste sem risco',
                'Pagamento único — R$67',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932] flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA final — maior e mais emocional */}
            <button
              onClick={handleCTA}
              disabled={loadingPayment}
              className="cta-btn cta-final w-full sm:w-auto group inline-flex items-center justify-center gap-3 py-6 px-10 bg-gradient-to-r from-[#FFB932] to-[#F5C842] hover:opacity-90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-xl sm:text-2xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingPayment ? 'Aguarde...' : <>Sim, eu escolho mudar agora — R$67 <span className="group-hover:translate-x-1 transition-transform">→</span></>}
            </button>

            <p className="text-xs sm:text-sm text-gray-500 mt-6">
              Acesso imediato · Sem assinatura · Sem renovação automática · Garantia de 7 dias
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
            <img src="/logo-ecotopia.webp" alt="Ecotopia" className="h-10 w-auto opacity-70" />
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <p className="text-xs sm:text-sm text-gray-500 text-center">© 2024 Ecotopia. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>

      {/* Sticky bar — mobile only, aparece após o hero */}
      <div
        onClick={handleCTA}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 py-4 cursor-pointer"
        style={{
          background: 'linear-gradient(90deg, #FFB932, #F5C842)',
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms ease',
        }}
      >
        <p className="text-center font-bold" style={{ color: '#0D0D1A' }}>
          R$ 67 · Acesso imediato →
        </p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .cta-btn {
          box-shadow: 0 0 24px rgba(245, 200, 66, 0.35);
          transition: box-shadow 200ms ease, transform 200ms ease, opacity 200ms ease;
        }
        .cta-btn:hover:not(:disabled) {
          box-shadow: 0 0 36px rgba(245, 200, 66, 0.55);
        }
        .cta-final {
          box-shadow: 0 0 40px rgba(245, 200, 66, 0.45);
        }
        .cta-final:hover:not(:disabled) {
          box-shadow: 0 0 60px rgba(245, 200, 66, 0.65);
        }
        /* Fade-in on scroll */
        .fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }
        /* Checkbox pulse on check */
        .checkbox-checked {
          animation: checkbox-pulse 0.25s ease;
        }
        @keyframes checkbox-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
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
