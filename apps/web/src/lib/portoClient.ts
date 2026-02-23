import { Porto } from "porto";
import { WalletClient, WalletActions, walletActions } from "porto/viem";
import { createPublicClient, http, type Address } from "viem";
import { sepolia } from "viem/chains";
import { appConfig } from "./config";
const PORTO_SESSION_KEY = "cpay_porto_account";

const porto = Porto.create({
  chains: [sepolia],
  merchantUrl: appConfig.merchantUrl,
  announceProvider: false
});
export const portoProvider = porto.provider;

if (appConfig.portoDebug) {
  const originalRequest = porto.provider.request.bind(porto.provider);
  porto.provider.request = (async (request: unknown) => {
    const method = typeof request === "object" && request !== null && "method" in request ? (request as { method: string }).method : "unknown";
    console.debug("[porto:rpc] ->", method, request);
    const start = Date.now();
    try {
      const result = await originalRequest(request as any);
      console.debug("[porto:rpc] <-", method, { durationMs: Date.now() - start, result });
      return result;
    } catch (error) {
      console.error("[porto:rpc] !!", method, {
        durationMs: Date.now() - start,
        error
      });
      throw error;
    }
  }) as typeof porto.provider.request;
}

const baseWalletClient = WalletClient.fromPorto(porto, { chain: sepolia });

export const walletClient = baseWalletClient.extend(walletActions);

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(appConfig.rpcUrl)
});

const observerAbi = [
  {
    type: "function",
    name: "observer",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "setObserver",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "newObserver", type: "address" }
    ],
    outputs: []
  }
] as const;

const operatorAbi = [
  {
    type: "function",
    name: "isOperator",
    stateMutability: "view",
    inputs: [
      { name: "holder", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "setOperator",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "until", type: "uint48" }
    ],
    outputs: []
  }
] as const;

const faucetErc20Abi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

const wrapperAbi = [
  {
    type: "function",
    name: "wrap",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
] as const;

export async function connectPortoAccount(options?: { createAccount?: boolean }) {
  const response = await WalletActions.connect(walletClient, {
    chainIds: [appConfig.chainId],
    createAccount: options?.createAccount ?? true
  });
  return response.accounts[0]?.address;
}

export async function loginUser() {
  return connectPortoAccount({ createAccount: false });
}

export function getSavedPortoAccount(): Address | null {
  try {
    const value = window.localStorage.getItem(PORTO_SESSION_KEY);
    if (!value || !value.startsWith("0x") || value.length !== 42) return null;
    return value as Address;
  } catch {
    return null;
  }
}

export function savePortoAccount(address: Address | null) {
  try {
    if (address) window.localStorage.setItem(PORTO_SESSION_KEY, address);
    else window.localStorage.removeItem(PORTO_SESSION_KEY);
  } catch {}
}

async function claimViaBackend(address: Address, amount: string) {
  const faucetUrl = appConfig.faucetUrl;
  if (!faucetUrl) {
    throw new Error("Missing faucet endpoint. Set VITE_FAUCET_URL or VITE_API_BASE_URL.");
  }

  const response = await fetch(faucetUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, amount })
  });
  if (!response.ok) {
    let message = "Faucet claim failed.";
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.message || payload.error || message;
    } catch {}
    throw new Error(message);
  }
  const payload = (await response.json()) as { txHash?: string };
  if (!payload.txHash) throw new Error("Faucet claim submitted but no transaction hash returned.");
  return payload.txHash as `0x${string}`;
}

async function claimViaPortoDirect(address: Address, amount: bigint) {
  if (!appConfig.payrollUnderlying) throw new Error("Missing VITE_PAYROLL_UNDERLYING_ADDRESS.");
  if (!appConfig.payrollToken) throw new Error("Missing VITE_PAYROLL_TOKEN_ADDRESS.");

  const mintTx = await walletClient.writeContract({
    address: appConfig.payrollUnderlying,
    abi: faucetErc20Abi,
    functionName: "mint",
    args: [address, amount],
    chain: walletClient.chain,
    account: address
  });
  await waitForTxConfirmation(mintTx);

  const approveTx = await walletClient.writeContract({
    address: appConfig.payrollUnderlying,
    abi: faucetErc20Abi,
    functionName: "approve",
    args: [appConfig.payrollToken, amount],
    chain: walletClient.chain,
    account: address
  });
  await waitForTxConfirmation(approveTx);

  const wrapTx = await walletClient.writeContract({
    address: appConfig.payrollToken,
    abi: wrapperAbi,
    functionName: "wrap",
    args: [address, amount],
    chain: walletClient.chain,
    account: address
  });

  return wrapTx;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function claimPayrollTokens(address: Address, amount = "1000000") {
  const amountRaw = BigInt(amount);
  if (appConfig.faucetMode === "backend") {
    return claimViaBackend(address, amount);
  }
  if (appConfig.faucetMode === "porto_direct") {
    return claimViaPortoDirect(address, amountRaw);
  }
  // hybrid: try porto direct first, fallback to backend signer.
  try {
    return await claimViaPortoDirect(address, amountRaw);
  } catch (directError) {
    const message = String((directError as Error)?.message || directError);
    const invalidNonce = /invalid nonce|invalid transaction nonce/i.test(message);
    if (invalidNonce) {
      // Porto AA sometimes returns stale nonce right after previous UserOps.
      await sleep(1200);
      try {
        return await claimViaPortoDirect(address, amountRaw);
      } catch (retryError) {
        if (appConfig.portoDebug) {
          console.debug("[faucet] porto_direct retry failed, fallback backend", {
            error: String((retryError as Error)?.message || retryError)
          });
        }
        return claimViaBackend(address, amount);
      }
    }
    if (appConfig.portoDebug) {
      console.debug("[faucet] porto_direct failed, fallback backend", {
        error: message
      });
    }
    return claimViaBackend(address, amount);
  }
}

export async function signUpWithPasskeyAndFund() {
  const address = await connectPortoAccount({ createAccount: true });
  if (!address) throw new Error("No account returned from Porto.");

  return {
    address,
    funded: false,
    note: "Smart account created. Use Faucet to claim payroll tokens."
  };
}

export async function waitForTxConfirmation(txHash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1
  });
}

export async function setTokenObserver(account: Address, observer: Address) {
  if (!appConfig.payrollToken) throw new Error("Missing VITE_PAYROLL_TOKEN_ADDRESS.");
  return walletClient.writeContract({
    address: appConfig.payrollToken,
    abi: observerAbi,
    functionName: "setObserver",
    args: [account, observer],
    chain: walletClient.chain,
    account
  });
}

export async function getTokenObserver(account: Address): Promise<Address> {
  if (!appConfig.payrollToken) throw new Error("Missing VITE_PAYROLL_TOKEN_ADDRESS.");
  return publicClient.readContract({
    address: appConfig.payrollToken,
    abi: observerAbi,
    functionName: "observer",
    args: [account]
  }) as Promise<Address>;
}

export async function isExecutorOperator(account: Address, executor: Address): Promise<boolean> {
  if (!appConfig.payrollToken) throw new Error("Missing VITE_PAYROLL_TOKEN_ADDRESS.");
  return publicClient.readContract({
    address: appConfig.payrollToken,
    abi: operatorAbi,
    functionName: "isOperator",
    args: [account, executor]
  }) as Promise<boolean>;
}

export async function setExecutorOperator(account: Address, executor: Address, until: number) {
  if (!appConfig.payrollToken) throw new Error("Missing VITE_PAYROLL_TOKEN_ADDRESS.");
  return walletClient.writeContract({
    address: appConfig.payrollToken,
    abi: operatorAbi,
    functionName: "setOperator",
    args: [executor, until],
    chain: walletClient.chain,
    account
  });
}
