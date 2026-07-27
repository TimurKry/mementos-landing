-- MementoOS MVP — Nachzug der Rechte (0005)
--
-- Befund beim Anwenden auf das echte Projekt: app.set_case_ref() und
-- app.handle_new_user() standen ohne eigene ACL da, also mit dem
-- voreingestellten EXECUTE für PUBLIC.
--
-- Ursache ist die Reihenfolge in 0004: beide entstehen in den Abschnitten 10
-- und 11, also NACH dem Rechtemodell in Abschnitt 9. Der dortige
-- «revoke execute on all functions in schema app» hat sie nicht mehr erfasst.
-- ALTER DEFAULT PRIVILEGES hätte es auffangen sollen, ist auf dem Projekt
-- aber nicht gegriffen — anders als beim Test auf einem lokalen
-- PostgreSQL 16. Verlassen kann man sich darauf also nicht.
--
-- Ausgenutzt werden konnte das nicht: anon hat kein USAGE auf app, und beide
-- Funktionen liefern «trigger» — solche Funktionen sind ohnehin nicht direkt
-- aufrufbar. Es geht um die saubere Ausgangslage: nur wenn im Bestand keine
-- Funktion ohne ACL steht, fällt bei der nächsten Prüfung eine echte auf.
-- Bekanntes Rauschen verdeckt sonst das Signal.
--
-- Deshalb hier ein abschliessender Durchgang. Er steht bewusst am Ende und
-- ist wiederholbar: was später hinzukommt, wird davon erneut erfasst.

revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

-- Der öffentliche Vertrag bleibt unverändert: genau diese drei für anon.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;

-- Wird von den RLS-Policies gebraucht; ohne diese Zeile fällt die gesamte
-- RLS aus (Policy-Ausdrücke laufen mit den Rechten der aufrufenden Rolle).
grant execute on function public.is_case_owner(uuid)               to authenticated;
grant execute on function public.create_invite(uuid, public.role)  to authenticated;
grant execute on function public.list_invites(uuid)                to authenticated;
grant execute on function public.revoke_invite(uuid)               to authenticated;
grant execute on function public.revoke_session(uuid)              to authenticated;
