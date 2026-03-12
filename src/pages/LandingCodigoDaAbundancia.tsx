import { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

const TOTAL_PARTICIPANTS = 4247;

const LandingCodigoDaAbundancia = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const getCounterMessage = (count: number) => {
    if (count === 0) return null;
    if (count <= 2) return { text: `Você marcou ${count} de 6. O padrão já está visível.`, color: 'text-gray-400' };
    if (count <= 4) return { text: `Você marcou ${count} de 6. Isso não é acaso — é um sistema operando contra você.`, color: 'text-[#FFB932]' };
    if (count === 5) return { text: `Você marcou 5 de 6. O termostato financeiro está no controle da sua vida.`, color: 'text-[#FFB932]' };
    return { text: `Você marcou todos os 6. Você não precisa de mais força de vontade. Precisa reprogramar o sistema.`, color: 'text-[#FFB932]' };
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCTA = async () => {
    if (loadingPayment) return;
    setLoadingPayment(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mp/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey: 'protocolo_abundancia_7_dias', origin: 'landing_page' }),
      });
      if (!res.ok) throw new Error('Erro ao criar preferência');
      const data = await res.json();

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (isMobile) {
        // Mobile: redirect direto — melhor UX, abre app MP se instalado
        window.location.href = data.init_point;
        return;
      }

      // Desktop: abre modal
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

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.querySelector('div')?.offsetWidth ?? 280;
    carouselRef.current.scrollBy({ left: dir === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
  };

  const getCardBorder = (day: number) => {
    if (day <= 2) return 'border-gray-700/50 hover:border-[#FFB932]/50';
    if (day <= 5) return 'border-[#FFB932]/20 hover:border-[#FFB932]/50';
    if (day === 6) return 'border-[#FFB932]/50 hover:border-[#FFB932]/70';
    return 'border-[#FFB932]/60 hover:border-[#FFB932]/80';
  };

  const getCardBg = (day: number) => {
    if (day === 7) return 'bg-[#FFB932]/5 hover:bg-[#FFB932]/10';
    return 'bg-gray-800/50 hover:bg-gray-800/70';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header: logo menor em mobile */}
      <header className="w-full bg-[#FFB932] border-b border-[#e6a520] shadow-lg shadow-[#FFB932]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-center">
          <img src="/logo-ecotopia.webp" alt="Ecotopia" className="h-16 sm:h-20 w-auto" />
        </div>
      </header>

      {/* pt-16 mobile (header ~64px), pt-24 sm (header ~88px) */}
      <main>
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 sm:w-96 sm:h-96 animate-spin-slow">
              <svg viewBox="0 0 200 200" className="w-full h-full text-[#FFB932]">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="100" y1="20" x2="100" y2="35"
                    stroke="currentColor" strokeWidth="0.5"
                    transform={`rotate(${i * 30} 100 100)`}
                  />
                ))}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={100 + 70 * Math.cos((i * Math.PI) / 4)}
                    cy={100 + 70 * Math.sin((i * Math.PI) / 4)}
                    r="3" fill="currentColor"
                  />
                ))}
              </svg>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FFB932]/10 border border-[#FFB932]/20 text-[#FFB932] text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              7 DIAS · PROTOCOLO PROGRESSIVO
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Você trabalha. Você se esforça.
              <br />
              Mas o dinheiro nunca fica.
            </h1>

            <p className="text-base sm:text-xl text-gray-300 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Isso não é falta de disciplina. É o seu cérebro executando um programa instalado há anos — feito para te manter exatamente onde você está.
            </p>

            {/* Social proof: empilha em telas muito pequenas */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8">
              <div className="flex -space-x-2">
                {[
                  '/avatar-fernanda.webp',
                  '/avatar-marcos.webp',
                  '/avatar-camila.webp',
                  '/avatar-extra.webp',
                  '/avatar-fernanda.webp',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="avatar"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-950 object-cover bg-gray-700"
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-400 text-center">
                +{TOTAL_PARTICIPANTS.toLocaleString('pt-BR')} pessoas já reprogramaram sua mente financeira
              </span>
            </div>

            {/* CTA hero: largura total em mobile */}
            <button
              onClick={handleCTA}
              disabled={loadingPayment}
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-[#FFB932] hover:bg-[#FFB932]/90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-base sm:text-lg shadow-lg shadow-[#FFB932]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingPayment ? 'Aguarde...' : 'Quero reprogramar minha mente agora → R$ 67'}
            </button>

            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              Acesso imediato · Pagamento único · Sem mensalidade
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Reconhece alguma dessas situações?
            </h2>

            <p className="text-center text-sm text-gray-500 mb-6">Clique nos que se aplicam a você</p>

            <div className="space-y-3 sm:space-y-4 mb-8">
              {[
                'Quando o dinheiro começa a entrar bem, algo sempre aparece para zerar',
                'Você gasta antes de poupar, como se o dinheiro precisasse sair logo',
                'Você trabalha mais que muita gente que ganha mais que você',
                'Você sente culpa quando gasta, ansiedade quando poupa',
                'Você já tentou planilha, curso financeiro, lei da atração — e voltou para o mesmo lugar',
                'No fundo, você acha que riqueza é para um certo tipo de pessoa. E você não tem certeza se é esse tipo.',
              ].map((item, index) => {
                const checked = checkedItems.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleCheck(index)}
                    className={`w-full flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all text-left cursor-pointer border ${
                      checked
                        ? 'bg-[#FFB932]/10 border-[#FFB932]/60'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-[#FFB932]/30 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                      checked
                        ? 'bg-[#FFB932] border-[#FFB932]'
                        : 'border-gray-600'
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

            {/* Counter feedback */}
            {checkedItems.size > 0 && (() => {
              const msg = getCounterMessage(checkedItems.size);
              return msg ? (
                <div className={`text-center py-4 px-6 rounded-lg bg-gray-800/50 border border-[#FFB932]/20 mb-8 transition-all`}>
                  <p className={`text-base sm:text-lg font-medium ${msg.color}`}>{msg.text}</p>
                  {checkedItems.size >= 3 && (
                    <button
                      onClick={handleCTA}
                      disabled={loadingPayment}
                      className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#FFB932] hover:bg-[#FFB932]/90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base shadow-lg shadow-[#FFB932]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loadingPayment ? 'Aguarde...' : 'Quero reprogramar minha mente agora → R$ 67'}
                    </button>
                  )}
                </div>
              ) : null;
            })()}

            {checkedItems.size === 0 && (
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed text-center">
                Se você se reconheceu em qualquer item acima, o problema não é você. É o{' '}
                <strong className="text-[#FFB932]">termostato financeiro</strong> que opera dentro de você — invisível, automático, e incrivelmente eficaz em te manter no mesmo nível.
              </p>
            )}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Por que força de vontade nunca foi suficiente
            </h2>

            <div className="space-y-6 sm:space-y-8 text-base sm:text-lg text-gray-300 leading-relaxed">
              <div className="px-2 sm:px-6 py-2">
                <p className="mb-4">
                  Pense num ar condicionado. Você pode abrir a janela, ligar o ventilador, fazer o que for — mas se o termostato estiver configurado para 22°C, o sistema vai trabalhar até voltar para lá.
                </p>
                <p>
                  <strong className="text-white">O seu cérebro funciona exatamente assim com dinheiro.</strong> Tem um ponto definido. E quando você começa a ultrapassar esse ponto, o sistema inteiro se ativa para te trazer de volta.
                </p>
              </div>

              <p className="text-center text-lg sm:text-xl font-medium text-[#FFB932]">
                O problema não é motivação. O problema é que o termostato está calibrado errado.
              </p>

              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-[#FFB932]/5 to-transparent border border-[#FFB932]/20">
                <p>
                  Você não recalibra um termostato com força de vontade. Você recalibra{' '}
                  <strong className="text-white">reprogramando o sistema operacional que o controla.</strong>
                </p>
                <p className="mt-4">
                  É exatamente isso que o <strong className="text-[#FFB932]">Código da Abundância</strong> foi projetado para fazer.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#FFB932]">
                Código da Abundância
              </h2>
              <p className="text-base sm:text-xl italic text-gray-400">
                7 sessões de meditação guiada para reprogramar sua identidade financeira
              </p>
            </div>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-12 text-center max-w-3xl mx-auto">
              Não é motivação. Não é pense positivo e o dinheiro vem. É um protocolo de 7 dias que combina{' '}
              <strong className="text-white">neurociência da reprogramação de crenças</strong> com{' '}
              <strong className="text-white">Lei da Atração aplicada ao estado emocional.</strong>
            </p>

            {/* Carousel controls */}
            <div className="relative">
              {/* Left arrow */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[#FFB932] hover:bg-gray-700 transition-colors shadow-lg hidden sm:flex"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Cards track */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[
                  { day: 1, title: 'O Diagnóstico', description: 'Você finalmente vê com clareza os padrões que operam no escuro', img: '/dia1.webp' },
                  { day: 2, title: 'Quebrando o Contrato', description: 'Você desfaz o acordo inconsciente que fez com a escassez', img: '/dia2.webp' },
                  { day: 3, title: 'A Frequência do Receber', description: 'Você abre o canal que estava bloqueado para a abundância entrar', img: '/dia3.webp' },
                  { day: 4, title: 'Você no Futuro Próspero', description: 'Você habita neurologicamente a versão próspera de você mesmo', img: '/dia4.webp' },
                  { day: 5, title: 'Gratidão Como Imã', description: 'Você cria o estado emocional que expande a percepção de oportunidades', img: '/dia5.webp' },
                  { day: 6, title: 'Merecimento Sem Culpa', description: 'Você dissolve a crença mais profunda: a de que não merece', img: '/dia6.webp' },
                  { day: 7, title: 'A Nova Identidade', description: 'Você não tenta mais atrair dinheiro. Você se torna uma pessoa próspera', img: '/dia7.webp' },
                ].map((session) => (
                  <div
                    key={session.day}
                    className={`group flex-shrink-0 w-56 sm:w-64 rounded-xl border overflow-hidden transition-all snap-start ${getCardBorder(session.day)} ${getCardBg(session.day)}`}
                  >
                    {/* Image */}
                    <div className="w-full aspect-square overflow-hidden">
                      <img
                        src={session.img}
                        alt={session.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-md bg-[#FFB932]/20 flex items-center justify-center text-[#FFB932] text-sm font-bold border border-[#FFB932]/30 group-hover:bg-[#FFB932]/30 transition-colors flex-shrink-0">
                          {session.day}
                        </span>
                        <h3 className={`text-sm font-bold leading-tight ${session.day === 7 ? 'text-[#FFB932]' : 'text-white'}`}>
                          {session.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{session.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[#FFB932] hover:bg-gray-700 transition-colors shadow-lg hidden sm:flex"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile swipe hint */}
            <p className="text-center text-xs text-gray-600 mt-1 sm:hidden">← deslize para ver todos os dias →</p>

            <p className="text-base sm:text-xl text-gray-300 leading-relaxed mt-10 sm:mt-12 text-center italic">
              Cada sessão se aprofunda onde a anterior terminou. No 7º dia, a mudança não está mais no que você pensa sobre dinheiro.{' '}
              <strong className="text-[#FFB932] not-italic font-bold">Está em quem você é.</strong>
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              O que muda depois de 7 dias
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {[
                {
                  name: 'Fernanda Rocha, 37',
                  role: 'Nutricionista autônoma · Curitiba',
                  avatar: '/avatar-fernanda.webp',
                  result: 'Fiz o protocolo sem muita expectativa. No Dia 2, quando ele fala sobre o contrato inconsciente com a escassez, eu chorei. Lembrei da minha mãe dizendo que dinheiro é difícil. Carregava isso há 30 anos. Dois meses depois fechei meu maior contrato — R$4.800 num único cliente.',
                },
                {
                  name: 'Marcos Vinícius, 44',
                  role: 'Engenheiro civil · Goiânia',
                  avatar: '/avatar-marcos.webp',
                  result: 'Sou cético por formação. Entrei achando que era autoajuda disfarçada. O que me pegou foi a parte da neuroplasticidade no Dia 1 — fez sentido técnico. Terminei os 7 dias. Não virei milionário, mas tomei uma decisão de investimento que vinha adiando há 2 anos. Pequeno? Talvez. Mas real.',
                },
                {
                  name: 'Camila Duarte, 31',
                  role: 'Empreendedora · Florianópolis',
                  avatar: '/avatar-camila.webp',
                  result: 'O Dia 6 foi o mais difícil. Merecimento sem culpa. Eu realmente não achava que merecia ganhar mais do que meu pai ganhou a vida inteira. Ouvi essa sessão três vezes. Na terceira, alguma coisa destravou. Reajustei meus preços na semana seguinte — algo que eu nunca tinha conseguido fazer.',
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-lg bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700/50"
                >
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-5 leading-relaxed">"{testimonial.result}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover bg-gray-700 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
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

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Tudo que você recebe hoje
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              {[
                { item: '7 sessões de meditação guiada (~20 min cada)', value: 'De R$280' },
                { item: 'Áudio de emergência: SOS Ansiedade Financeira Aguda', value: 'De R$47' },
                { item: 'Acesso vitalício — ouça quantas vezes quiser', value: '' },
                { item: 'Disponível no app Ecotopia — iOS e Android', value: '' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932] flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-300">{item.item}</span>
                  </div>
                  {item.value && (
                    <span
                      className="text-gray-400 font-medium flex-shrink-0"
                      style={{ fontSize: '13px', textDecoration: 'line-through', textDecorationThickness: '2px' }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-[#FFB932]/10 to-transparent border border-[#FFB932]/30 mb-8 sm:mb-12">
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed text-center">
                Um coaching financeiro custa R$300 a hora. Uma sessão com terapeuta, R$180.
                <br className="hidden sm:block" />
                {' '}
                <strong className="text-white">
                  O Código da Abundância: acesso completo por{' '}
                  <span className="text-[#FFB932] text-xl sm:text-2xl">R$67</span> — pagamento único.
                </strong>
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleCTA}
                disabled={loadingPayment}
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-[#FFB932] hover:bg-[#FFB932]/90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-base sm:text-lg shadow-lg shadow-[#FFB932]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loadingPayment ? 'Aguarde...' : <>Quero meu Código da Abundância — R$ 67 <span className="group-hover:translate-x-1 transition-transform">→</span></>}
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Perguntas frequentes
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  question: 'Isso é só meditação, já tentei',
                  answer: 'O Código da Abundância não é uma meditação relaxante. É um protocolo de reprogramação. Cada sessão tem um objetivo neurológico específico e uma sequência deliberada. Relaxamento é efeito colateral, não o objetivo.',
                },
                {
                  question: 'Eu não sei meditar',
                  answer: 'Cada sessão é 100% guiada por voz. Você não precisa saber nada, ter experiência ou sentar em posição específica. Precisa apenas de 20 minutos e fone de ouvido.',
                },
                {
                  question: 'E se não funcionar para mim?',
                  answer: 'Neuroplasticidade não é opcional — é como o cérebro funciona. O que pode variar é a velocidade. Algumas pessoas sentem mudança no Dia 2. Para outras, a virada vem no Dia 6. A sequência foi desenhada para respeitar esse processo.',
                },
                {
                  question: 'Por que R$67 por algo que é um áudio?',
                  answer: 'Quanto você já gastou em coisas que não mudaram nada? Um jantar, um curso que ficou pela metade, uma assinatura que você nem usa? R$67 por uma reprogramação que opera no nível mais profundo da sua mente — e que você pode usar para sempre — é o menor investimento que você pode fazer em si mesmo hoje.',
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-6 text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <span className="text-sm sm:text-lg font-medium text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#FFB932] flex-shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gradient-to-b from-gray-900/50 to-gray-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              Seu cérebro vai continuar executando o programa antigo amanhã.
              <br />
              <span className="text-gray-400">A menos que você decida mudar hoje.</span>
            </h2>

            <p className="text-white/80 mb-12 sm:mb-16" style={{ fontSize: '16px' }}>
              Você chegou até aqui porque algo nessa página tocou num ponto verdadeiro. Não ignore isso.
            </p>

            <div className="max-w-md mx-auto space-y-3 mb-10 sm:mb-12 text-left">
              {[
                '7 sessões completas de reprogramação financeira',
                'Áudio SOS de emergência incluso',
                'Acesso vitalício no app Ecotopia',
                'Pagamento único — R$67',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB932] flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCTA}
              disabled={loadingPayment}
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-[#FFB932] hover:bg-[#FFB932]/90 text-gray-950 font-bold rounded-lg transition-all transform hover:scale-105 text-lg sm:text-xl shadow-xl shadow-[#FFB932]/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingPayment ? 'Aguarde...' : '→ Quero meu Código da Abundância agora'}
            </button>

            <p className="text-xs sm:text-sm text-gray-500 mt-6">
              Acesso imediato após o pagamento · Sem assinatura · Sem renovação automática
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-500">
            <p>© 2024 Ecotopia. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>

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
      `}</style>
    </div>
  );
};

export default LandingCodigoDaAbundancia;
