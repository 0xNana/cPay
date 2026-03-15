import { Link } from "react-router-dom";
import { Section } from "../components/Cards";
import { ExecutionActions } from "../components/ExecutionActions";
import { getActivePayrollRun } from "../lib/payrollRunStore";

export function ExecutionConfirmationPage() {
  const run = getActivePayrollRun();
  return (
    <Section title="Confirm Payroll Run" subtitle="Final confirmation before submitting batched transaction.">
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Batch Summary</h3>
          <ul className="list compact-list">
            <li>Run ID: {run.runId}</li>
            <li>Network: {run.network}</li>
            <li>Payments: {run.stats.employees}</li>
            <li>Total Amount: {run.stats.totalDisplay}</li>
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Payroll Execution</h3>
          <ul className="list compact-list">
            <li>Uploading payroll file and parsing instructions</li>
            <li>Detecting employee payments from `pain.001`</li>
            <li>Encrypting salaries locally with FHE</li>
            <li>Submitting one confidential payroll transaction</li>
          </ul>
        </div>
      </div>
      <ExecutionActions />
      <div className="cta-row">
        <Link className="button ghost" to="/payroll/draft">Cancel</Link>
        <Link className="button ghost" to="/payroll/completed">View Results</Link>
      </div>
    </Section>
  );
}
