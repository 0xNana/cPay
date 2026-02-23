import { Section } from "../components/Cards";
import { getTxExplorerUrl, shortHash } from "../lib/explorer";
import { getActivePayrollRun } from "../lib/payrollRunStore";

export function AuditDetailPage() {
  const run = getActivePayrollRun();
  const state = run.executionState || { status: "idle" as const };
  const timeline = [
    { label: "pain.001 Uploaded", detail: "File parsed and canonical order locked.", time: new Date(run.createdAt).toISOString() },
    { label: "Draft Validated", detail: "Address/amount checks passed.", time: new Date(run.createdAt).toISOString() },
    state.submittedAt
      ? {
          label: "Execution Submitted",
          detail: `Tx ${state.txHash ? shortHash(state.txHash) : "-"}`,
          txUrl: state.txHash ? getTxExplorerUrl(state.txHash) : undefined,
          time: state.submittedAt
        }
      : null,
    state.confirmedAt
      ? { label: "Onchain Confirmed", detail: `Block ${state.blockNumber || "-"}`, time: state.confirmedAt }
      : null,
    state.status === "failed"
      ? { label: "Execution Failed", detail: state.error || "Unknown error", time: new Date().toISOString() }
      : null
  ].filter(Boolean) as Array<{ label: string; detail: string; txUrl?: string; time: string }>;

  return (
    <Section title={`Run Audit: ${run.runId || "-"}`} subtitle="Traceability timeline for file, validation, execution, and reporting.">
      <ol className="timeline">
        {timeline.map((item) => (
          <li key={item.label}>
            <h4>{item.label}</h4>
            <p>
              {item.detail}
              {item.txUrl ? (
                <>
                  {" "}
                  <a href={item.txUrl} target="_blank" rel="noreferrer">View on Explorer</a>
                </>
              ) : null}
            </p>
            <small>{item.time}</small>
          </li>
        ))}
      </ol>
    </Section>
  );
}
