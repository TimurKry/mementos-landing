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

/* Monad-pipeline: pill-узлы с hairline-границей, изогнутые Ash-кривые,
   мятное свечение у хаба. Хореография: reveal → кривые рисуются
   штрихом → точки-окончания → по линиям бегут «пакеты данных». */

type Node = {
  label: string;
  icon: React.ReactNode;
  pos: string;
};

const ic = "h-4 w-4";

const nodes: Node[] = [
  { label: "Familie", icon: <IconFamilie className={ic} />, pos: "md:left-[52px] md:top-[52px]" },
  { label: "Bestatter", icon: <IconBestatter className={ic} />, pos: "md:left-[228px] md:top-[26px]" },
  { label: "Krematorium", icon: <IconKrematorium className={ic} />, pos: "md:left-[398px] md:top-[52px]" },
  { label: "Friedhof", icon: <IconFriedhof className={ic} />, pos: "md:left-[18px] md:top-[214px]" },
  { label: "Transport", icon: <IconTransport className={ic} />, pos: "md:left-[430px] md:top-[214px]" },
  { label: "Särge", icon: <IconSarg className={ic} />, pos: "md:left-[52px] md:top-[376px]" },
  { label: "Urnen", icon: <IconUrne className={ic} />, pos: "md:left-[236px] md:top-[400px]" },
  { label: "Floristik", icon: <IconFloristik className={ic} />, pos: "md:left-[398px] md:top-[376px]" },
];

/* изогнутые связи: от ядра к узлам, quadratic curves */
const curves: string[] = [
  "M232 200 Q 170 140 120 78",
  "M280 186 Q 280 130 280 62",
  "M328 200 Q 390 140 440 78",
  "M212 230 Q 150 232 96 232",
  "M348 230 Q 410 232 464 232",
  "M232 260 Q 170 320 120 388",
  "M280 274 Q 280 340 284 414",
  "M328 260 Q 390 320 440 388",
];

const endpoints: [number, number][] = [
  [120, 78], [280, 62], [440, 78], [96, 232],
  [464, 232], [120, 388], [284, 414], [440, 388],
];

export function HubDiagram() {
  return (
    <div
      className="relative mx-auto flex w-full max-w-[560px] flex-wrap justify-center gap-2.5 pt-2 md:block md:h-[460px] md:pt-0"
      aria-label="Diagramm: MementoOS verbindet alle Beteiligten eines Bestattungsfalls"
    >
      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 560 460" aria-hidden="true">
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a7fccd" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#a7fccd" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="hub-glow" cx="280" cy="230" r="130" fill="url(#hubGlow)" />

        {/* кривые рисуются последовательно после reveal */}
        <g stroke="#cecac8" strokeWidth="1" fill="none" strokeLinecap="round">
          {curves.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="diagram-path"
              style={{ "--draw-delay": `${0.15 + i * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </g>

        {/* точки-окончания */}
        <g fill="#242424">
          {endpoints.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.2" className="diagram-dot" />
          ))}
        </g>

        {/* пакеты данных: бегут по кривым к хабу и обратно */}
        <g className="flow-dot" fill="#2b59d1">
          {curves.map((d, i) => (
            <circle key={i} r="2.4" opacity="0.9">
              <animateMotion
                dur={`${3.6 + (i % 4) * 0.7}s`}
                begin={`${i * 0.45}s`}
                repeatCount="indefinite"
                path={d}
                keyPoints={i % 2 === 0 ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          ))}
        </g>
      </svg>

      {/* центральный хаб */}
      <div className="order-first w-full md:absolute md:left-1/2 md:top-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-ink py-3 pl-4 pr-6 text-paper soft-ambient">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/15">
            <Logo className="h-4 w-[18px]" fill="#f6f3f1" />
          </span>
          <span>
            <b className="block font-[family-name:var(--font-display)] text-[17px] font-normal leading-tight">
              MementoOS
            </b>
            <span className="mono-label block text-[9px] text-ash">Ein Fall · Alle Beteiligten</span>
          </span>
        </div>
      </div>

      {/* pill-узлы: hairline-граница, каскадное появление */}
      {nodes.map((n, i) => (
        <div
          key={n.label}
          className={`diagram-node inline-flex items-center gap-2 rounded-full border border-hair bg-paper py-2 pl-3 pr-4 md:absolute ${n.pos}`}
          style={{ "--node-delay": `${0.3 + i * 0.08}s` } as React.CSSProperties}
        >
          <span className="text-ink">{n.icon}</span>
          <span className="mono-label text-[11px] text-ink">{n.label}</span>
        </div>
      ))}
    </div>
  );
}
