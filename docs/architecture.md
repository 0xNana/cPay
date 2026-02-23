# Architecture

## Components
- `apps/web` (frontend): upload/validate payroll file, encrypt amounts, collect user signatures, submit payroll runs, display status.
- `apps/api` (backend): Porto merchant sponsor route, faucet endpoint, observer decrypt endpoint, optional backend payroll execution endpoint.
- `packages/contracts` (smart contracts): `PayrollExecutor` + confidential token wrapper + test/deploy scripts.

## Contract Layer
- `PayrollExecutor`:
  - Validates batch shape and expiry.
  - Enforces replay/nonce checks.
  - Enforces `MAX_BATCH_SIZE = 100`.
  - Calls ERC-7984 `confidentialTransferFrom(from, to, encryptedAmount, inputProof)` per payment.
  - Emits run and per-payment events.
- Confidential token:
  - ERC-7984-compatible wrapper contract.
  - Must run with Zama coprocessor config (`ZamaEthereumConfig` inheritance path in contracts).

## Runtime Modes (current)
- Execution mode: `porto_direct` by default in frontend.
- Decrypt mode: `observer` (current stable mode).
- Faucet mode: `backend` (stable for nonce/order reliability).
- Large-batch note: although onchain max is 100, practical AA-sponsored batch size depends on encrypted proof payload size and relay bundle limits (current MVP operational cap: 15).

These are configured with:
- `VITE_EXECUTION_MODE`
- `VITE_DECRYPT_MODE`
- `VITE_FAUCET_MODE`

## Trust Boundaries
- Employer signs payroll actions from Porto account.
- Merchant sponsors gas under allowlist checks.
- Observer signer is currently required for decrypt endpoint and backend execution mode.
- Relayer is required for encryption/decryption operations.
