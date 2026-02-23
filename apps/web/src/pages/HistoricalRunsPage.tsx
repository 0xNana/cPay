import { Link } from "react-router-dom";
import { Section } from "../components/Cards";
import { Table } from "../components/Table";
import { getActivePayrollRun } from "../lib/payrollRunStore";

export function HistoricalRunsPage() {
  const active = getActivePayrollRun();
  const currentStatus =
    active.executionState?.status === "confirmed"
      ? "Completed"
      : active.executionState?.status === "failed"
        ? "Failed"
        : active.executionState?.status === "submitted"
          ? "Processing"
          : "Draft";

  return (
    <Section title="Runs" subtitle="Audit and track every onchain payroll run.">
      <Table headers={["Run ID", "Date", "Payments", "Status", "Action"]}>
        <tr key={`active-${active.runId}`}>
          <td>{active.runId || "-"}</td>
          <td>{new Date(active.createdAt).toISOString().slice(0, 10)}</td>
          <td>{active.stats.employees}</td>
          <td>{currentStatus}</td>
          <td><Link to={currentStatus === "Completed" ? "/payroll/completed" : "/payroll/processing"}>Open</Link></td>
        </tr>
      </Table>
    </Section>
  );
}
