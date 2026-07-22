import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { verbuende } from "@/components/audience/data/verbuende";

/* Steep-страница аудитории — тонкий рендер над data-моделью. */

export const metadata = audienceMetadata(verbuende);

export default function FuerVerbuende() {
  return <AudiencePage data={verbuende} />;
}
