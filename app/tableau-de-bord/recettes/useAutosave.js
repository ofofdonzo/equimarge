'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dbMessage } from './data';

export const SAVED = 'Enregistré';
export const SAVING = 'Enregistrement…';
export const INVALID = 'Valeur non enregistrée : saisissez un nombre positif.';

// Enregistrement différé des saisies : on attend 600 ms après la dernière frappe.
// « Enregistré » ne s'affiche qu'une fois toutes les sauvegardes terminées ; les saisies en attente sont envoyées
// si l'on quitte l'onglet, et flush() les envoie tout de suite (avant une mise à jour groupée).
export default function useAutosave() {
  const [state, setState] = useState(SAVED);
  const timers = useRef({});
  const pending = useRef(0);
  const failure = useRef('');

  const exec = useCallback(async (fn) => {
    const { error } = await fn();
    if (error) failure.current = dbMessage(error);
    pending.current -= 1;
    if (pending.current === 0) {
      setState(failure.current ? `Échec de l'enregistrement : ${failure.current}` : SAVED);
      failure.current = '';
    }
  }, []);

  const schedule = useCallback(
    (key, fn) => {
      const t = timers.current[key];
      if (t) clearTimeout(t.id);
      else pending.current += 1;
      setState(SAVING);
      timers.current[key] = {
        fn,
        id: setTimeout(() => {
          delete timers.current[key];
          exec(fn);
        }, 600),
      };
    },
    [exec]
  );

  const cancel = useCallback((key) => {
    const t = timers.current[key];
    if (!t) return;
    clearTimeout(t.id);
    delete timers.current[key];
    pending.current -= 1;
    if (pending.current === 0) setState(SAVED);
  }, []);

  const flush = useCallback(
    () =>
      Promise.all(
        Object.entries(timers.current).map(([key, t]) => {
          clearTimeout(t.id);
          delete timers.current[key];
          return exec(t.fn);
        })
      ),
    [exec]
  );

  // Ajout ou suppression : enregistré tout de suite, avec un message d'erreur lisible
  const run = useCallback(async (fn, failMessage) => {
    setState(SAVING);
    const res = await fn();
    if (res.error) setState(`${failMessage} : ${dbMessage(res.error)}`);
    else if (pending.current === 0) setState(SAVED);
    return res;
  }, []);

  useEffect(() => {
    const warn = (e) => {
      if (pending.current > 0) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    const list = timers.current;
    return () => {
      window.removeEventListener('beforeunload', warn);
      // Changement d'onglet de l'espace : les saisies en attente partent quand même
      Object.values(list).forEach((t) => {
        clearTimeout(t.id);
        t.fn();
      });
    };
  }, []);

  return { state, setState, schedule, cancel, flush, run };
}
