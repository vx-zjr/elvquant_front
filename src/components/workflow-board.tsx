"use client";

import { Activity, Database, FileText, Play, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ExecutionLane } from "@/components/execution-lane";
import type { Workflow } from "@/lib/contracts";
import type { Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";

type WorkflowBoardProps = {
  workflows: Workflow[];
  locale: Locale;
};

const ICONS = [Activity, Database, ShieldCheck, FileText];

export function WorkflowBoard({ workflows, locale }: WorkflowBoardProps) {
  const dictionary = dictionaries[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "synthetic_demo");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selected = useMemo(
    () => workflows.find((workflow) => workflow.id === workflowId) ?? workflows[0],
    [workflowId, workflows],
  );

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });
      if (!response.ok) {
        setMessage(`${dictionary.failed}: ${response.status}`);
        return;
      }
      const payload = await response.json();
      setMessage(`${dictionary.completed}: ${payload.runId}`);
      const lang = searchParams.get("lang") ?? locale;
      router.push(`/runs/${payload.runId}?lang=${lang}`);
      router.refresh();
    });
  }

  return (
    <section className="workflow-board">
      <div className="section-heading">
        <span className="eyebrow">{dictionary.runWorkflow}</span>
        <h2>{selected?.label ?? dictionary.workflow}</h2>
        <p>{selected?.description}</p>
      </div>
      <div className="workflow-grid">
        {workflows.map((workflow, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <button
              className={workflow.id === workflowId ? "workflow-card active" : "workflow-card"}
              key={workflow.id}
              onClick={() => setWorkflowId(workflow.id)}
              type="button"
            >
              <Icon size={18} />
              <strong>{workflow.label}</strong>
              <span>{workflow.requiresData ? dictionary.dataRequired : dictionary.localOnly}</span>
            </button>
          );
        })}
      </div>
      <button className="button primary run-action" onClick={submit} disabled={isPending} type="button">
        <Play size={17} /> {isPending ? dictionary.running : dictionary.startRun}
      </button>
      <ExecutionLane selected={selected} locale={locale} isPending={isPending} />
      {message ? <p className="inline-message">{message}</p> : null}
    </section>
  );
}
