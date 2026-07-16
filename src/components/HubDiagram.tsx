import {
  IconFamilie,
  IconBestatter,
  IconKrematorium,
  IconFriedhof,
  IconTransport,
  IconSarg,
  IconUrne,
  IconFloristik,
  Logo,
} from "./icons";

type Node = {
  label: string;
  status: string;
  icon: React.ReactNode;
  pos: string; // absolute position classes (desktop)
  wobble: string;
};

const ic = "h-6 w-6";

const nodes: Node[] = [
  { label: "Familie", status: "Eingebunden", icon: <IconFamilie className={ic} />, pos: "left-[36px] top-[36px]", wobble: "w1" },
  { label: "Bestatter", status: "Verbunden", icon: <IconBestatter className={ic} />, pos: "left-[221px] top-[24px]", wobble: "w2" },
  { label: "Krematorium", status: "Verbunden", icon: <IconKrematorium className={ic} />, pos: "left-[405px] top-[36px]", wobble: "w3" },
  { label: "Friedhof", status: "Verbunden", icon: <IconFriedhof className={ic} />, pos: "left-[16px] top-[188px]", wobble: "w2" },
  { label: "Transport", status: "Verbunden", icon: <IconTransport className={ic} />, pos: "left-[426px] top-[188px]", wobble: "w1" },
  { label: "Särge", status: "Verbunden", icon: <IconSarg className={ic} />, pos: "left-[36px] top-[340px]", wobble: "w3" },
  { label: "Urnen", status: "Verbunden", icon: <IconUrne className={ic} />, pos: "left-[221px] top-[352px]", wobble: "w1" },
  { label: "Floristik", status: "Verbunden", icon: <IconFloristik className={ic} />, pos: "left-[405px] top-[340px]", wobble: "w2" },
];

/* Соединения: от края ядра к краю карточки, точки на обоих концах */
const lines: Array<[number, number, number, number]> = [
  [213, 175, 146, 120],
  [280, 175, 280, 108],
  [347, 175, 413, 120],
  [185, 230, 134, 230],
  [375, 230, 426, 230],
  [213, 285, 146, 340],
  [280, 285, 280, 352],
  [347, 285, 413, 340],
];

export function HubDiagram() {
  return (
    <div
      className="relative mx-auto grid w-full max-w-[560px] grid-cols-2 gap-3 pt-2 md:block md:h-[460px] md:pt-0"
      aria-label="Diagramm: MementoOS verbindet alle Beteiligten eines Bestattungsfalls"
    >
      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 560 460" aria-hidden="true">
        <circle cx="280" cy="230" r="122" fill="none" stroke="#E6E2D9" strokeWidth="1" />
        <circle cx="280" cy="230" r="178" fill="none" stroke="#ECE8E0" strokeWidth="1" />
        <g className="dash-anim" stroke="#8B877D" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round">
          {lines.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <g fill="#1A1A1A">
          {lines.flatMap(([x1, y1, x2, y2], i) => [
            <circle key={`a${i}`} cx={x1} cy={y1} r="2.4" />,
            <circle key={`b${i}`} cx={x2} cy={y2} r="2.4" />,
          ])}
        </g>
      </svg>

      <div className="order-first col-span-2 md:absolute md:left-1/2 md:top-1/2 md:w-[190px] md:-translate-x-1/2 md:-translate-y-1/2">
        <div className="hatch hatch-strong bg-ink px-4 py-5 text-center text-paper" style={{ borderRadius: "16px 7px 18px 8px / 8px 17px 7px 16px" }}>
          <Logo className="mx-auto mb-2.5 h-[26px] w-[29px]" fill="#F7F5F1" />
          <b className="block text-[17px] font-semibold">MementoOS</b>
          <span className="mt-1 block text-[11.5px] text-ash">Ein Fall. Alle Beteiligten.</span>
        </div>
      </div>

      {nodes.map((n) => (
        <div key={n.label} className={`${n.wobble} border-[1.2px] border-ink bg-card px-2 py-2.5 text-center md:absolute md:w-[118px] ${n.pos}`}>
          <span className="mx-auto mb-1 block w-fit text-ink">{n.icon}</span>
          <b className="block text-[12.5px] font-semibold">{n.label}</b>
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] text-stone">
            <i className="inline-block h-1.5 w-1.5 rounded-full bg-wald" />
            {n.status}
          </span>
        </div>
      ))}
    </div>
  );
}
