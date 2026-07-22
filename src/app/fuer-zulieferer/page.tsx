import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { zulieferer } from "@/components/audience/data/zulieferer";

/* Steep-страница аудитории — тонкий рендер над data-моделью. */

export const metadata = audienceMetadata(zulieferer);

export default function FuerZulieferer() {
  return <AudiencePage data={zulieferer} />;
}
