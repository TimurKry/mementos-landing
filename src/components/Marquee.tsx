/* Бегущая строка ролей отрасли — текстура вместо логотипов клиентов
   (реальных клиентов не выдумываем). Пауза на hover. */

const roles = [
  "Bestatter",
  "Krematorien",
  "Friedhöfe",
  "Transport",
  "Floristik",
  "Särge & Urnen",
  "Familien",
  "Verbünde",
];

function Row() {
  return (
    <>
      {roles.map((r) => (
        <span key={r} className="flex items-center gap-10 pr-10">
          <span className="mono-label whitespace-nowrap text-[13px] text-stone">{r}</span>
          <span aria-hidden="true" className="text-[8px] text-hair">✦</span>
        </span>
      ))}
    </>
  );
}

export function Marquee() {
  return (
    <div className="marquee border-b border-line py-5" aria-label="Rollen der Branche">
      <div className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  );
}
