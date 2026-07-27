-- MementoOS MVP — Protokoll ohne Fremdschlüssel (0007)
--
-- Korrektur zu 0006. Dort wurde CASCADE durch SET NULL ersetzt, damit ein
-- Fall löschbar wird. Das genügt nicht: SET NULL ist ein UPDATE, und der
-- Nur-Anfügen-Trigger weist auch UPDATE ab. Das Löschen scheiterte weiterhin,
-- nur mit anderer Meldung:
--
--   delete from cases -> UPDATE audit_log SET case_id = NULL
--                     -> «audit_log ist ausschliesslich anfügbar»
--
-- Richtig ist, auf den Fremdschlüssel ganz zu verzichten. Ein Protokoll ist
-- eine historische Aufzeichnung, kein Teil des lebenden Datenbestands: es
-- soll gerade überdauern, worauf es verweist. Ein Fremdschlüssel auf
-- veränderliche Geschäftsdaten zwingt es dagegen, deren Lebensdauer zu
-- teilen — und genau daran ist das Löschen gescheitert.
--
-- case_id bleibt als schlichte Kennung stehen. Nach dem Löschen eines Falls
-- zeigt sie ins Leere, und das ist beabsichtigt: die Spur «wer wann worauf
-- zugegriffen hat» bleibt, die Daten selbst sind fort. Personenbezogenes
-- über die verstorbene Person oder die Angehörigen stand im Protokoll
-- ohnehin nie — nur Rolle, Feldgruppen, Sitzungskennung und Zeitpunkt.
--
-- Damit ist Artikel 17 DSGVO erfüllbar: der Fall lässt sich löschen.
-- Geprüft: nach dem Löschen sind cases, deceased, participants, invites,
-- invite_sessions und profiles leer, das Protokoll steht unverändert.

alter table public.audit_log
  drop constraint if exists audit_log_case_id_fkey;

comment on column public.audit_log.case_id is
  'Fall-Kennung ohne Fremdschlüssel: das Protokoll überdauert den Fall. '
  'Nach dem Löschen zeigt der Wert ins Leere — gewollt.';
