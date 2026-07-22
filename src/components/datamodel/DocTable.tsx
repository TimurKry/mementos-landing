import { documents, roles } from "./data";
import type { RoleId } from "./data";

function Chip({ role, kind }: { role: RoleId; kind: "wr" | "rd" }) {
  return (
    <span
      className={`m-[2px] inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] ${
        kind === "wr" ? "border-ink text-ink" : "border-blue text-blue"
      }`}
    >
      {roles[role].label}
    </span>
  );
}

/* Документы как ACL-таблица: кто загрузил (чёрные чипы) и кому видно
   (синие). Отдельный вид — документы хранятся по участнику и типу. */
export function DocTable() {
  return (
    <div>
      <div className="dm-table overflow-x-auto rounded-[16px] border border-hair bg-card">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr>
              <th className="mono-label border-b border-hair px-4 py-3 text-left text-[10px] font-medium text-stone">Dokument</th>
              <th className="mono-label border-b border-hair px-4 py-3 text-left text-[10px] font-medium text-stone">
                <span className="text-ink">↦</span> Hochgeladen von
              </th>
              <th className="mono-label border-b border-hair px-4 py-3 text-left text-[10px] font-medium text-stone">
                <span className="text-blue">⇥</span> Sichtbar für
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d, i) => (
              <tr key={d.doc} className={i % 2 ? "bg-hair/10" : ""}>
                <td className="border-b border-line px-4 py-2.5 text-[12px] text-ink">{d.doc}</td>
                <td className="border-b border-line px-3 py-2">{d.from.map((r) => <Chip key={r} role={r} kind="wr" />)}</td>
                <td className="border-b border-line px-3 py-2">{d.see.map((r) => <Chip key={r} role={r} kind="rd" />)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3.5 rounded-[12px] bg-periwinkle/45 px-4 py-3 text-[11px] leading-relaxed text-ink">
        <b className="font-medium">Speicherung:</b> Ablage je Beteiligtem und Dokumenttyp · automatische Versionierung ·
        fehlende Pflichtdokumente werden angezeigt · jeder Zugriff und Upload steht im Protokoll.
      </div>
    </div>
  );
}
