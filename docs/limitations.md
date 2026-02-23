# Known Limitations

## Current Constraints
- Decryption is currently stable in observer mode; client-side relayer signing with Porto account can fail relayer signature validation.
- Faucet is currently backend-driven for reliability (direct AA path can hit nonce/order issues on chained calls).
- Sepolia testnet only for this submission.
- Contract batch size is capped at 100 payments, but current practical sponsored-execution size is lower due to AA bundle/call-data limits when FHE input proofs are large.
- For MVP UX, sample flows are focused on smaller payroll batches (5-15 payments). Current observed stable sponsored execution is up to 15 payments; 20 failed in current setup.

## Security/Trust Notes
- Merchant sponsor policy must stay strict (allowlist chain, target contract, selector, payload sanity checks).
- Observer signer is a trusted backend key in current decrypt/observer flows.
- Relayer availability is required for encryption/decryption.

## Planned Improvements
- Remove observer dependency when Porto-compatible relayer signing path is fully stable.
- Harden policy/rate-limiting for production-grade abuse controls.
- Expand ISO 20022 coverage beyond MVP subset.
- Add dynamic chunking for large payrolls (split one payroll file into multiple onchain runs) based on measured proof payload size and AA relay limits.
