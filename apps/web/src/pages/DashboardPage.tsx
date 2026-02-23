import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Section, Stat } from "../components/Cards";
import { downloadPain001SampleFile, pain001SampleFiles } from "../data/pain001Template";
import { parsePain001 } from "../lib/pain001Parser";
import { getActivePayrollRun, saveActivePayrollRun } from "../lib/payrollRunStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const activeRun = getActivePayrollRun();
  const hasRun = activeRun.payments.length > 0;
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    try {
      const xml = await file.text();
      const run = parsePain001(xml);
      saveActivePayrollRun(run);
      navigate("/payroll/draft");
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Section
        title="cPay — Confidential Payroll"
        subtitle="Run payroll securely using stablecoins. Upload ISO 20022 payment files, run payroll in a single batch, and download payment status reports with confidential settlement."
      >
        {hasRun ? (
          <div className="grid-3">
            <Stat label="Employees" value={String(activeRun.stats.employees)} />
            <Stat label="Payroll Total" value={activeRun.stats.totalDisplay} />
            <Stat label="Network" value={activeRun.network} />
          </div>
        ) : null}
      </Section>
      <Section title="Run Payroll" subtitle="Upload and run your payroll batch.">
        <div className="cta-row">
          <span>Upload your `pain.001` XML or use one of the prepared Seismic/FHEVM sample files.</span>
          <div className="cta-actions">
            {pain001SampleFiles.map((sample) => (
              <button
                key={sample.fileName}
                className="button ghost"
                onClick={() => downloadPain001SampleFile(sample.fileName)}
              >
                {sample.label}
              </button>
            ))}
            <label className="button ghost" style={{ cursor: busy ? "wait" : "pointer" }}>
              {busy ? "Parsing..." : "Upload pain.001"}
              <input
                type="file"
                accept=".xml,text/xml,application/xml"
                onChange={onUpload}
                disabled={busy}
                style={{ display: "none" }}
              />
            </label>
            <Link className="button" to="/payroll/draft">Open Draft</Link>
          </div>
        </div>
        {uploadError ? <p style={{ color: "#f87171", marginTop: "0.75rem" }}>{uploadError}</p> : null}
      </Section>
    </>
  );
}
