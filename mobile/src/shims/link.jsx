import { SITE } from '../config';
import { openUrl } from '../platform';

// Remplace next/link dans l'application : un lien vers une page du site l'ouvre dans Safari intégré.
export default function Link({ href, children, prefetch: _prefetch, replace: _replace, scroll: _scroll, onClick, ...rest }) {
  const path = typeof href === 'string' ? href : String(href?.pathname || '/');
  const target = /^https:\/\//.test(path) ? path : SITE + (path.startsWith('/') ? path : '/' + path);
  return (
    <a
      {...rest}
      href={target}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        openUrl(target);
      }}
    >
      {children}
    </a>
  );
}
