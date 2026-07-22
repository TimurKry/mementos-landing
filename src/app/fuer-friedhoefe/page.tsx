import { AudiencePage, audienceMetadata } from "@/components/audience/AudiencePage";
import { friedhoefe } from "@/components/audience/data/friedhoefe";

/* Steep-страница аудитории — тонкий рендер над data-моделью. */

export const metadata = audienceMetadata(friedhoefe);

export default function FuerFriedhoefe() {
  return <AudiencePage data={friedhoefe} />;
}
