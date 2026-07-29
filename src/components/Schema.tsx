/* Strukturierte Daten als <script type="application/ld+json">.

   Eigene Komponente, weil das Einbetten von JSON in HTML genau eine
   Fehlerquelle hat: steht im Inhalt die Zeichenfolge `</script>`, endet das
   Element mitten im Datenblock und der Rest der Seite ist Text. Unsere
   Antworten sind Freitext aus den Zielgruppendaten, also kann das passieren.
   `</` wird deshalb maskiert.

   dangerouslySetInnerHTML ist hier richtig und nicht gefährlich: der Inhalt
   kommt aus JSON.stringify über eigene Datenobjekte, nie aus einer Eingabe. */

export function Schema({ daten }: { daten: object }) {
  const json = JSON.stringify(daten).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
