import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Section, Stat } from "../Cards";
import { downloadPain001SampleFile, pain001SampleFiles } from "../../data/pain001Template";
import type { PayrollRunDraft } from "../../lib/payrollRunStore";

type DashboardHeroSectionProps = {
  hasRun: boolean;
  run: PayrollRunDraft;
};

export function DashboardHeroSection({ hasRun, run }: DashboardHeroSectionProps) {
  return (
    <Section
      title="cPay — Confidential Payroll"
      subtitle="Confidential Payroll on Ethereum. Upload ISO 20022 payroll files, encrypt salaries locally, and execute batch payroll without revealing compensation on-chain."
    >
      {hasRun ? (
        <div className="grid-3">
          <Stat label="Employees" value={String(run.stats.employees)} />
          <Stat label="Payroll Total" value={run.stats.totalDisplay} />
          <Stat label="Network" value={run.network} />
        </div>
      ) : null}
    </Section>
  );
}

type RunPayrollSectionProps = {
  busy: boolean;
  uploadError: string | null;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function RunPayrollSection({ busy, uploadError, onUpload }: RunPayrollSectionProps) {
  return (
    <Section title="Run Payroll" subtitle="Upload and run your payroll batch.">
      <div className="cta-row">
        <div className="stack-sm">
          <span>Upload your `pain.001` XML or use one of the prepared sample files.</span>
          <span className="badge">ISO 20022 Payroll Standard</span>
        </div>
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
  );
}

type BatchPreviewSectionProps = {
  hasRun: boolean;
  run: PayrollRunDraft;
};

export function BatchPreviewSection({ hasRun, run }: BatchPreviewSectionProps) {
  if (!hasRun) return null;

  return (
    <Section title="Payroll Batch Preview" subtitle="Parsed from the uploaded ISO 20022 file before encryption and submission.">
      <div className="grid-4">
        <Stat label="Source File" value="pain.001" />
        <Stat label="Employees" value={String(run.stats.employees)} />
        <Stat label="Total Payroll" value={run.stats.totalDisplay} />
        <Stat label="Status" value="Ready to Encrypt" />
      </div>
      <div className="cta-row">
        <span>Review the parsed batch, then continue to confidential execution.</span>
        <div className="cta-actions">
          <Link className="button ghost" to="/payroll/draft">Review Draft</Link>
          <Link className="button" to="/payroll/confirm">Run Payroll</Link>
        </div>
      </div>
    </Section>
  );
}

export function WhyCPaySection() {
  return (
    <Section
      title="Why Confidential Payroll Matters"
      subtitle="Public blockchains are transparent by default. cPay keeps payroll verifiable on-chain while keeping salary amounts private."
    >
      <div className="comparison-grid">
        <div className="comparison-card">
          <h3>Public Payroll Leaks Compensation Data</h3>
          <ul className="list compact-list">
            <li>Salary data is exposed permanently on public block explorers</li>
            <li>Compensation, bonus timing, and payroll patterns become visible to anyone</li>
          </ul>
        </div>
        <div className="comparison-card comparison-card-positive">
          <h3>cPay Keeps Payroll Verifiable and Private</h3>
          <ul className="list compact-list">
            <li>Salaries stay encrypted during execution</li>
            <li>Employers get on-chain settlement without publishing compensation</li>
            <li>Employees decrypt only their own payment</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

type PaymentEmailAlertsSectionProps = {
  alertEmail: string;
  alertSaved: string | null;
  showAlertPreview: boolean;
  onAlertEmailChange: (value: string) => void;
  onSaveAlertEmail: () => void;
};

export function PaymentEmailAlertsSection({
  alertEmail,
  alertSaved,
  showAlertPreview,
  onAlertEmailChange,
  onSaveAlertEmail
}: PaymentEmailAlertsSectionProps) {
  return (
    <Section title="Payment Email Alerts">
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Used only for payment notifications. We do not use this address for campaigns or newsletters.
        </p>
        <div className="email-alert-row">
          <input
            className="faucet-input email-alert-input"
            type="email"
            placeholder="you@company.com"
            value={alertEmail}
            onChange={(event) => onAlertEmailChange(event.target.value)}
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
  );
}

type PayrollNetworkFooterSectionProps = {
  systemStatus: string;
  systemStatusTone: "good" | "warn";
};

export function PayrollNetworkFooterSection({
  systemStatus,
  systemStatusTone
}: PayrollNetworkFooterSectionProps) {
  const statusClassName = systemStatusTone === "good" ? "status-text status-text-good" : "status-text status-text-warn";

  return (
    <div className="status-footer" aria-label="Payroll system status">
      <div className="status-footer-item">
        <span className="detail-label">Encryption Engine</span>
        <span className="status-text status-text-good">FHE Active</span>
      </div>
      <div className="status-footer-item status-footer-item-right">
        <span className="detail-label">System Status</span>
        <span className={statusClassName}>{systemStatus}</span>
      </div>
    </div>
  );
}
