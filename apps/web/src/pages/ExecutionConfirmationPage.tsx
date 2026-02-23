import { Link } from "react-router-dom";
import { Section } from "../components/Cards";
import { ExecutionActions } from "../components/ExecutionActions";
import { getActivePayrollRun } from "../lib/payrollRunStore";

export function ExecutionConfirmationPage() {
  const run = getActivePayrollRun();
  return (
    <Section title="Confirm Payroll Run" subtitle="Final confirmation before submitting batched transaction.">
      <ul className="list">
        <li>Run ID: {run.runId}</li>
        <li>Network: {run.network}</li>
        <li>Payments: {run.stats.employees}</li>
        <li>Total Amount: {run.stats.totalDisplay}</li>
      </ul>
      <ExecutionActions />
      <div className="cta-row">
        <Link className="button ghost" to="/payroll/draft">Cancel</Link>
        <Link className="button ghost" to="/payroll/completed">View Results</Link>
      </div>
    </Section>
  );
}
