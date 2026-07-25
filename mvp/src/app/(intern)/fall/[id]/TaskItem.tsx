"use client";

import { useTransition } from "react";
import { toggleTaskAction } from "@/app/actions";
import type { Task } from "@/lib/types";
import { roleLabel } from "@/lib/access";

/* Задача с переключением offen ↔ erledigt через server action. */
export function TaskItem({ caseId, task }: { caseId: string; task: Task }) {
  const [pending, start] = useTransition();
  const done = task.status === "erledigt";
  return (
    <button
      onClick={() => task.id && start(() => toggleTaskAction(caseId, task.id!))}
      disabled={pending || !task.id}
      className="card flex w-full items-start gap-2.5 p-3 text-left disabled:opacity-60"
    >
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${
          done ? "bg-white text-void" : "border border-steel"
        }`}
        aria-hidden="true"
      >
        {done && "✓"}
      </span>
      <span className="min-w-0">
        <span className={`block text-[13px] ${done ? "text-steel line-through" : ""}`}>{task.title}</span>
        <span className="mt-0.5 block text-[10.5px] text-steel">
          {task.assignee ? roleLabel[task.assignee] : "—"}{task.due ? ` · ${task.due}` : ""}
        </span>
      </span>
    </button>
  );
}
