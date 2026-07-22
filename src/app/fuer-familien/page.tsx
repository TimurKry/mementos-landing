import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { familien } from "@/components/audience/data/familien";

/* Steep-страница аудитории — тонкий рендер над data-моделью. */

export const metadata = audienceMetadata(familien);

export default function FuerFamilien() {
  return <AudiencePage data={familien} />;
}
