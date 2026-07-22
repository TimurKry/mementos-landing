import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { bestatter } from "@/components/audience/data/bestatter";

/* Steep-страница аудитории — тонкий рендер над data-моделью.
   Весь контент и разметка — в @/components/audience. */

export const metadata = audienceMetadata(bestatter);

export default function FuerBestatter() {
  return <AudiencePage data={bestatter} />;
}
