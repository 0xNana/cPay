# cPay — Confidential Payroll

cPay is a confidential onchain payroll app built on Zama FHE + ERC-7984.

## Monorepo Structure
- `apps/web` — frontend (Vite + React)
- `apps/api` — backend API (merchant sponsoring, faucet, decrypt, execute)
- `packages/contracts` — Solidity contracts and tests
- `docs` — public docs

## Quick Start
```bash
npm install
npm --workspace apps/web run dev
npm --workspace apps/api run dev
```

## Contracts
```bash
npm run contracts:compile
npm run contracts:test
```

## Core Capabilities
- Upload payroll instructions via ISO 20022 `pain.001`.
- Validate payroll batches before execution.
- Encrypt payroll amounts before onchain submission.
- Execute payroll through ERC-7984 confidential transfers.
- Download local payroll receipt as `pain.002`.
- Decrypt confidential balances from the connected account.

## Runtime Modes (MVP)
- Execution: `porto_direct`
- Decrypt: `observer`
- Faucet: `backend`

Configured via frontend env vars:
- `VITE_EXECUTION_MODE`
- `VITE_DECRYPT_MODE`
- `VITE_FAUCET_MODE`

## Public Documentation
- `docs/overview.md`
- `docs/architecture.md`
- `docs/how-it-works.md`
- `docs/deployment.md`
- `docs/limitations.md`
- `docs/demo-script-outline.md`
