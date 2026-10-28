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

// Logo : trois barres montantes sur un carré en dégradé. `id` doit être unique dans la page.
export function LogoMark({ id = 'logo', size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E7490" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect x="8" y="17" width="4" height="8" rx="2" fill="#fff" fillOpacity=".65" />
      <rect x="14" y="12" width="4" height="13" rx="2" fill="#fff" fillOpacity=".82" />
      <rect x="20" y="7" width="4" height="18" rx="2" fill="#fff" />
    </svg>
  );
}
