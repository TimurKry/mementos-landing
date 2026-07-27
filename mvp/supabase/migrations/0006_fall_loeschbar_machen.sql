-- MementoOS MVP — Löschbarkeit des Falls, erster Versuch (0006)
--
-- ACHTUNG: Dieser Schritt allein genügt nicht. Er ist als angewandte
-- Migration Teil der Geschichte und bleibt deshalb stehen; die Auflösung
-- steht in 0007. Wer die Reihenfolge liest, soll den Irrweg sehen.
--
-- Befund beim Test am echten Projekt: ein Fall liess sich überhaupt nicht
-- löschen. audit_log.case_id hing mit ON DELETE CASCADE am Fall, und der
-- Nur-Anfügen-Trigger aus 0004 weist genau dieses DELETE ab. Beide Regeln
-- sind für sich richtig, zusammen blockieren sie sich:
--
--   delete from cases -> Kaskade will audit_log-Zeilen löschen
--                     -> «audit_log ist ausschliesslich anfügbar»
--
-- In einer Branche unter der DSGVO ist das ein Fehler: Artikel 17 verlangt,
-- dass personenbezogene Daten gelöscht werden können.
--
-- Versuchte Auflösung: ON DELETE SET NULL statt CASCADE — die Protokollzeile
-- überlebt, der Bezug fällt weg. Warum das nicht reicht, steht in 0007.

alter table public.audit_log
  drop constraint if exists audit_log_case_id_fkey;

alter table public.audit_log
  add constraint audit_log_case_id_fkey
  foreign key (case_id) references public.cases(id) on delete set null;
