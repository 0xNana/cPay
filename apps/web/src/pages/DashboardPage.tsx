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
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSaved, setAlertSaved] = useState<string | null>(null);
  const [showAlertPreview, setShowAlertPreview] = useState(false);

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

  const onSaveAlertEmail = () => {
    const email = alertEmail.trim();
    if (!email) {
      setAlertSaved("Enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAlertSaved("Enter a valid email address.");
      setShowAlertPreview(false);
      return;
    }
    setAlertSaved("Saved locally for this browser session.");
    setShowAlertPreview(true);
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
      <Section title="Payment Email Alerts" subtitle="Get a direct email when your payroll payment lands. No marketing emails.">
        <div className="card">
          <p style={{ marginTop: 0 }}>
            Used only for payment notifications. We do not use this address for campaigns or newsletters.
          </p>
          <div className="cta-actions">
            <input
              className="faucet-input email-alert-input"
              type="email"
              placeholder="you@company.com"
              value={alertEmail}
              onChange={(event) => setAlertEmail(event.target.value)}
            />
            <button className="button" onClick={onSaveAlertEmail}>Enable Alerts</button>
          </div>
          {alertSaved ? <p style={{ marginBottom: 0 }}>{alertSaved}</p> : null}
          {showAlertPreview ? (
            <div className="card" style={{ marginTop: 12 }}>
              <p style={{ marginTop: 0, marginBottom: 10, fontWeight: 700 }}>Email Preview</p>
              <p style={{ margin: "4px 0" }}><strong>To:</strong> {alertEmail}</p>
              <p style={{ margin: "4px 0" }}><strong>Subject:</strong> Your onchain pay slip is available</p>
              <p style={{ margin: "4px 0" }}><strong>From:</strong> elegant.eth</p>
              <p style={{ margin: "4px 0" }}><strong>Timestamp:</strong> Mar-01-2026 03:03:59 PM UTC</p>
              <p style={{ margin: "4px 0" }}><strong>Value:</strong> ****** cUSDC</p>
            </div>
          ) : null}
        </div>
      </Section>
    </>
  );
}
