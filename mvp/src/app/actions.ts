"use server";

import { revalidatePath } from "next/cache";
import { toggleTask } from "@/lib/data";

/* Server Action: переключить статус задачи offen ↔ erledigt. */
export async function toggleTaskAction(caseId: string, taskId: string) {
  await toggleTask(caseId, taskId);
  revalidatePath(`/fall/${caseId}`);
}
