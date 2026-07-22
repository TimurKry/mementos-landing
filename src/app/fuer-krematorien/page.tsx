import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { krematorien } from "@/components/audience/data/krematorien";

/* Steep-страница аудитории — тонкий рендер над data-моделью. */

export const metadata = audienceMetadata(krematorien);

export default function FuerKrematorien() {
  return <AudiencePage data={krematorien} />;
}
