// Icônes au trait (grille 24 × 24) : elles prennent la couleur du texte qui les entoure.
function icon(children) {
  return function Icon({ size = 20, ...props }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {children}
      </svg>
    );
  };
}

export const ArrowRight = icon(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
export const Check = icon(<path d="M5 12.5 9.5 17 19 7.5" />);
export const Plus = icon(<path d="M12 5v14M5 12h14" />);
export const Pencil = icon(<><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>);
export const BarChart = icon(<><path d="M4 20h16" /><path d="M7 16v-4" /><path d="M12 16V7" /><path d="M17 16v-7" /></>);
export const Target = icon(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>);
export const Clock = icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const Lock = icon(<><rect x="4.5" y="11" width="15" height="9.5" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const TrendUp = icon(<><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>);
export const Alert = icon(<><path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4" /><path d="M12 17.5h.01" /></>);
export const Receipt = icon(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6" /><path d="M9 12h6" /></>);
export const Percent = icon(<><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></>);
export const Wallet = icon(<><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10.5h18" /><path d="M16 15h1.5" /></>);
export const Shield = icon(<><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>);
export const LogOut = icon(<><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="m16 16 4-4-4-4" /><path d="M20 12H10" /></>);
export const ClipboardList = icon(<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 2.5h6v3H9z" /><path d="M9 11h6" /><path d="M9 15h4" /></>);
export const Database = icon(<><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" /><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>);
export const Search = icon(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>);
export const Scale = icon(<><path d="M12 4v16" /><path d="M8 20h8" /><path d="M5 7h14" /><path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0L5 7Z" /><path d="m19 7-2.5 6a2.5 2.5 0 0 0 5 0L19 7Z" /></>);
export const Users = icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></>);

// Icône de chaque domaine de conformité (clés de COMPLIANCE dans components/offers.js)
export const DOMAIN_ICONS = { procedures: ClipboardList, rgpd: Database, lcbft: Search, sapin: Scale, social: Users };

// Logo : bouclier vert (conformité) gravé d'un « E » dont la branche du haut sort du cadre (marge qui
// progresse), sur un carré bleu nuit. `id` doit être unique dans la page (il préfixe les dégradés).
export function LogoMark({ id = 'logo', size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E2A52" />
          <stop offset="1" stopColor="#071631" />
        </linearGradient>
        <radialGradient id={`${id}-g`} cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity=".45" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-s`} x1="12" y1="10" x2="50" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ADE80" />
          <stop offset=".5" stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="20" y1="18" x2="56" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86EFAC" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}-t)`} />
      <circle cx="32" cy="32" r="26" fill={`url(#${id}-g)`} />
      <g transform="translate(32 32) scale(.8) translate(-33.75 -31.7)">
        <path d="M30 9 49 15.8v14c0 11.8-8 19.9-19 24.6C19 49.7 11 41.6 11 29.8v-14L30 9Z" fill={`url(#${id}-s)`} />
        <path d="M30 9v45.4C19 49.7 11 41.6 11 29.8v-14L30 9Z" fill="#fff" fillOpacity=".14" />
        <rect x="19.5" y="18" width="6" height="25.5" rx="2.4" fill="#fff" fillOpacity=".95" />
        <rect x="19.5" y="37.5" width="12" height="6" rx="2.4" fill="#fff" fillOpacity=".7" />
        <rect x="19.5" y="27.75" width="17" height="6" rx="2.4" fill="#fff" fillOpacity=".85" />
        <rect x="19.5" y="18" width="37" height="6" rx="2.4" fill={`url(#${id}-b)`} />
      </g>
    </svg>
  );
}
