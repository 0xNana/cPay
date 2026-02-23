import { Link } from "react-router-dom";
import { Section } from "../components/Cards";
import { Table } from "../components/Table";
import { getActivePayrollRun } from "../lib/payrollRunStore";
import { validatePayrollRun } from "../lib/payrollValidation";

export function PayrollDraftPage() {
  const run = getActivePayrollRun();
  const isEmpty = run.payments.length === 0;
  const validation = validatePayrollRun(run);
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
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Validation Check</h3>
          <p style={{ marginTop: 0 }}>{validation.ok ? "Validation passed." : "Validation failed. Fix issues before execution."}</p>
          <ul className="list">
            {validation.checks.map((check) => (
              <li key={check.label}>
                {check.ok ? "OK" : "FAIL"} - {check.label}: {check.detail}
              </li>
            ))}
          </ul>
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
    </Section>
  );
}
