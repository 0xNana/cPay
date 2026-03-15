import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  BatchPreviewSection,
  DashboardHeroSection,
  PaymentEmailAlertsSection,
  PayrollNetworkFooterSection,
  RunPayrollSection,
  WhyCPaySection
} from "../components/dashboard/DashboardSections";
import { hasExecutionConfig } from "../lib/config";
import { parsePain001 } from "../lib/pain001Parser";
import { getActivePayrollRun, saveActivePayrollRun } from "../lib/payrollRunStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const activeRun = getActivePayrollRun();
  const hasRun = activeRun.payments.length > 0;
  const systemStatus = hasExecutionConfig() ? "Operational" : "Configuration Required";
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
      <DashboardHeroSection hasRun={hasRun} run={activeRun} />
      <RunPayrollSection busy={busy} uploadError={uploadError} onUpload={onUpload} />
      <BatchPreviewSection hasRun={hasRun} run={activeRun} />
      <PaymentEmailAlertsSection
        alertEmail={alertEmail}
        alertSaved={alertSaved}
        showAlertPreview={showAlertPreview}
        onAlertEmailChange={setAlertEmail}
        onSaveAlertEmail={onSaveAlertEmail}
      />
      <WhyCPaySection />
      <PayrollNetworkFooterSection
        systemStatus={systemStatus}
        systemStatusTone={hasExecutionConfig() ? "good" : "warn"}
      />
    </>
  );
}
