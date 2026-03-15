import { Link } from "react-router-dom";
import { Section } from "../components/Cards";
import { Table } from "../components/Table";
import { getActivePayrollRun } from "../lib/payrollRunStore";
import { validatePayrollRun } from "../lib/payrollValidation";

export function PayrollDraftPage() {
  const run = getActivePayrollRun();
  const isEmpty = run.payments.length === 0;
  const validation = validatePayrollRun(run);
  const batchLimitIssue = validation.checks.find((check) => check.label === "MVP batch limit" && !check.ok);
  const title = run.cycleName && run.cycleName !== "Payroll Draft" ? `Payroll Draft: ${run.cycleName}` : "Payroll Draft";
  return (
    <Section title={title} subtitle="Review before executing the batch.">
      {isEmpty ? (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>No Payroll Loaded</h3>
          <p style={{ marginTop: 0 }}>
            Upload a `pain.001` file from Dashboard to generate this draft.
          </p>
          <Link className="button" to="/dashboard">Go To Dashboard</Link>
        </div>
      ) : (
        <div className="draft-workspace">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Validation Check</h3>
            <p style={{ marginTop: 0 }}>{validation.ok ? "Validation passed." : "Validation failed. Fix issues before execution."}</p>
            {batchLimitIssue ? (
              <p style={{ marginTop: 0, color: "#b91c1c" }}>
                Batch exceeds MVP limit (15). Please split the payroll file and re-upload.
              </p>
            ) : null}
            <ul className="list">
              {validation.checks.map((check) => (
                <li key={check.label}>
                  {check.ok ? "OK" : "FAIL"} - {check.label}: {check.detail}
                </li>
              ))}
            </ul>
          </div>
          <aside className="card">
            <h3 style={{ marginTop: 0 }}>Payroll Batch Preview</h3>
            <div className="detail-list">
              <div className="detail-row">
                <span className="detail-label">Source File</span>
                <strong>pain.001</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Employees</span>
                <strong>{run.stats.employees}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Payroll</span>
                <strong>{run.stats.totalDisplay}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <strong>{validation.ok ? "Ready to Encrypt" : "Needs Review"}</strong>
              </div>
            </div>
            <p className="note-text">This preview is generated before FHE encryption and on-chain batch settlement.</p>
          </aside>
        </div>
      )}
      <div className="draft-table-wrap">
        <Table headers={["Employee ID", "Role", "Name", "Recipient", "Amount", "Status"]}>
          {run.payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.role}</td>
              <td>{p.name}</td>
              <td>{p.recipient}</td>
              <td>{p.amountDisplay}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </Table>
      </div>
      <div className="cta-row">
        <span>
          {isEmpty
            ? "No payroll loaded."
            : validation.ok
              ? "Validation passed."
              : "Validation failed."}
        </span>
        <div className="cta-actions">
          <Link className="button ghost" to="/dashboard">Back To Dashboard</Link>
          <Link
            className="button"
            to={!isEmpty && validation.ok ? "/payroll/confirm" : "#"}
            onClick={(e) => {
              if (isEmpty || !validation.ok) e.preventDefault();
            }}
            aria-disabled={isEmpty || !validation.ok}
            style={isEmpty || !validation.ok ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            Continue
          </Link>
        </div>
      </div>
    </Section>
  );
}
