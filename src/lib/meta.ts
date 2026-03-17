/**
 * meta.ts — Meta Pixel (browser) + Conversions API (server-side) para abundanciaLP.
 *
 * Estratégia de deduplicação:
 *   1. Gera um UUID (eventId) antes de qualquer disparo.
 *   2. Passa o eventId ao fbq() como 4º argumento: { eventID: eventId }.
 *   3. Envia o mesmo eventId ao endpoint CAPI (/api/meta/event).
 *   A Meta usa o par (event_name + event_id) para eliminar duplicatas.
 */

export const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function getCookie(name: string): string {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Retorna o valor de _fbc.
 * Prioridade: cookie _fbc → construído a partir de fbclid na URL → vazio.
 * Formato: fb.<subdomain_index>.<creation_time>.<fbclid>
 */
function resolveFbc(): string {
  const fromCookie = getCookie('_fbc');
  if (fromCookie) return fromCookie;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (fbclid) {
    return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
  }
  return '';
}

// ─── Pixel init ───────────────────────────────────────────────────────────────

/** Injeta o script base do Meta Pixel e chama fbq('init'). Idempotente. */
export function initMetaPixel(): void {
  if (!PIXEL_ID) {
    console.warn('[Meta Pixel] VITE_META_PIXEL_ID não definido — pixel desativado');
    return;
  }
  if (typeof window === 'undefined' || (window as any).fbq) return;

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  (window as any).fbq('init', PIXEL_ID);
}

// ─── Pixel fire ───────────────────────────────────────────────────────────────

function firePixel(
  eventName: string,
  params: Record<string, unknown>,
  eventId: string,
): void {
  if (typeof window === 'undefined' || !(window as any).fbq) return;
  const method = STANDARD_EVENTS.has(eventName) ? 'track' : 'trackCustom';
  (window as any).fbq(method, eventName, params, { eventID: eventId });
}

// ─── CAPI fire ────────────────────────────────────────────────────────────────

export interface TrackParams {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  [key: string]: unknown; // permite propriedades customizadas (section_name, faq_question, etc.)
}

// Eventos padrão Meta — todos os outros usam fbq('trackCustom')
const STANDARD_EVENTS = new Set([
  'PageView', 'ViewContent', 'Search', 'AddToCart', 'AddToWishlist',
  'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead',
  'CompleteRegistration', 'Contact', 'Donate', 'Schedule',
  'StartTrial', 'SubmitApplication', 'Subscribe',
]);

/** Envia o evento ao endpoint Vercel serverless que chama a CAPI. Nunca lança. */
async function fireCAPI(
  eventName: string,
  eventId: string,
  params: TrackParams,
): Promise<void> {
  try {
    await fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        fbc: resolveFbc(),
        ...params,
      }),
    });
  } catch {
    // CAPI é não-fatal — o Pixel já foi disparado
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Dispara o evento no Pixel (browser) e na CAPI (servidor) com o mesmo eventId.
 * Garante deduplicação perfeita entre os dois canais.
 */
export async function trackEvent(
  eventName: string,
  params: TrackParams = {},
): Promise<void> {
  const eventId = crypto.randomUUID();

  const { value, currency, contentIds, contentType, ...customProps } = params;

  // Monta params do pixel — inclui props customizadas para eventos trackCustom
  const pixelParams: Record<string, unknown> = { ...customProps };
  if (value !== undefined) pixelParams.value = value;
  if (currency) pixelParams.currency = currency;
  if (contentIds?.length) {
    pixelParams.content_ids = contentIds;
    pixelParams.content_type = contentType ?? 'product';
  }

  firePixel(eventName, pixelParams, eventId);

  // CAPI em paralelo — não bloqueia a UI
  await fireCAPI(eventName, eventId, params);
}
