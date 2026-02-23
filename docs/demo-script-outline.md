# 2-Minute Demo Script (Judge-Optimized)

## 0:00 - 0:15 | Problem + Promise
- Voiceover:
  - "Public blockchains expose payroll amounts, which is a blocker for real finance teams."
  - "cPay solves this with confidential payroll on Zama using ERC-7984."
- Screen:
  - Landing/dashboard headline.

## 0:15 - 0:35 | Account + Funding
- Voiceover:
  - "We use a Porto smart account for UX, then fund confidential payroll token balance."
- Screen:
  - Login/Sign up.
  - Faucet claim success.
  - Open `Balance` tab showing encrypted balance and `Decrypt Balance`.

## 0:35 - 1:05 | Upload + Validation
- Voiceover:
  - "Payroll starts from ISO 20022 `pain.001`."
  - "We parse and validate recipients, duplicates, positive amounts, and totals before execution."
- Screen:
  - Download sample + upload `pain.001` (10 or 15 employees).
  - Draft page with green validation checks.

## 1:05 - 1:35 | Confidential Execution
- Voiceover:
  - "Before execution, the payer authorizes the executor with `setOperator`."
  - "Amounts are encrypted client-side, submitted in one payroll batch, and settled onchain."
- Screen:
  - Confirm screen -> `Run Payroll`.
  - Processing console lines:
    - payout permission confirmed
    - confidential inputs encrypted
    - transaction submitted
    - confirmed in block
  - Show tx hash.

## 1:35 - 1:50 | Results + Receipt
- Voiceover:
  - "We get per-payment outcomes and generate a local `pain.002` payroll receipt."
- Screen:
  - Completed run page.
  - Click `Download Payroll Receipt (pain.002)`.

## 1:50 - 2:00 | Confidentiality Proof + Close
- Voiceover:
  - "Balances remain encrypted onchain and only the account owner can decrypt."
  - "cPay brings enterprise payroll UX to confidential onchain finance."
- Screen:
  - `Balance` page decrypt action for recipient/employee account.

## Demo Rules (for reliability)
- Use 5/10/15 payment samples only (current stable operational range).
- Keep one continuous take with visible tx hash and final confirmed status.
- Prepare one fallback tx hash screenshot in case explorer lag occurs.
