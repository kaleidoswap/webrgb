/**
 * WebRGB — the `window.rgb` provider a wallet injects into web pages so a
 * dApp can issue, receive, send and track RGB assets, and pay or receive them
 * over Lightning, without running its own RGB backend.
 *
 * The reference implementation is the KaleidoSwap browser extension
 * (`src/injected.ts`); this file mirrors it. `window.webln`, `window.webbtc`
 * and `window.nostr` are separate specs with their own typings.
 *
 * Every call rejects with a {@link ProviderError} whose `code` tells a user's
 * refusal apart from a wallet fault.
 */

/** Error codes the provider rejects with. */
export type ProviderErrorCode =
  | "USER_REJECTED"
  | "NOT_ENABLED"
  | "METHOD_NOT_SUPPORTED"
  | "INTERNAL_ERROR";

export interface ProviderError extends Error {
  code: ProviderErrorCode;
}

// ---------------------------------------------------------------------------
// window.rgb
// ---------------------------------------------------------------------------

/** Which RGB runtime the wallet is connected with. */
export type RgbProtocol = "RGB_L1" | "RGB_LN";

export type RgbTransferStatus =
  | "WaitingCounterparty"
  | "WaitingConfirmations"
  | "Settled"
  | "Failed"
  | (string & {});

export interface RgbInfo {
  /** `false` when no RGB wallet is connected; other calls will then reject. */
  ready: boolean;
  network: string;
  protocol: RgbProtocol | null;
  /**
   * Methods the connected wallet can serve. `issueAsset` appears only when the
   * runtime can mint; `makeLnInvoice` / `payLnInvoice` only when `protocol` is
   * `"RGB_LN"`.
   */
  methods: string[];
}

export interface RgbBlindReceiveArgs {
  assetId: string;
  /** Omit for an any-amount invoice. */
  amount?: number;
  durationSeconds?: number;
  minConfirmations?: number;
}

export interface RgbBlindReceiveResult {
  invoice: string;
  recipientId?: string;
  expirationTimestamp?: number;
}

export interface RgbIssueAssetArgs {
  /** Only `"nia"` is served today; `"uda"` and `"cfa"` reject with METHOD_NOT_SUPPORTED. */
  schema: "nia" | "uda" | "cfa";
  /** 1–8 uppercase letters or digits. */
  ticker: string;
  name: string;
  /** Per-allocation issuance amounts. */
  amounts: number[];
  precision?: number;
}

export interface RgbIssueAssetResult {
  assetId: string;
  asset: Record<string, unknown>;
}

export interface RgbAssetBalance {
  assetId: string;
  balance: number;
  raw: unknown;
}

export type RgbSendAssetArgs =
  | {
      /** Receiver's RGB invoice (`rgb:…/…utxob:…`). Preferred. */
      invoice: string;
      feeRate?: number;
    }
  | {
      assetId: string;
      amount: number;
      recipientId: string;
      feeRate?: number;
      transportEndpoints?: string[];
    };

export interface RgbTransfer {
  assetId?: string;
  transferId?: string | number;
  status?: RgbTransferStatus;
  kind?: string;
  amount?: number;
  recipientId?: string;
  txid?: string;
  [key: string]: unknown;
}

export interface RgbTransferStatusResult {
  found: boolean;
  status: RgbTransferStatus | null;
  transfer: RgbTransfer | null;
}

export interface RgbMakeLnInvoiceArgs {
  assetId: string;
  /** Omit for an any-amount invoice. */
  assetAmount?: number;
  /**
   * Bitcoin the HTLC carries. The node enforces a floor and the wallet raises
   * the figure to it; the confirmation shows what is actually encoded.
   */
  amountSats?: number;
  description?: string;
  expirySeconds?: number;
}

export interface RgbMakeLnInvoiceResult {
  /** BOLT-11 invoice carrying the asset. */
  invoice: string;
  paymentHash: string;
  expiresAt?: number;
  assetId: string;
  assetAmount?: number;
}

export interface RgbPayLnInvoiceResult {
  paymentHash: string;
  preimage?: string;
  status?: string;
  /** Bitcoin the HTLC carried. */
  amountSats: number;
  assetId?: string;
  assetAmount?: number;
}

export type RgbEvent = "transferReceived" | "transferSettled";

export interface RgbProvider {
  readonly enabled: boolean;
  /** Connect the origin. Shares the approval with webln/webbtc. */
  enable(): Promise<void>;
  getInfo(): Promise<RgbInfo>;
  /** Bitcoin address of the RGB wallet, used to anchor RGB state. */
  getAddress(): Promise<{ address: string }>;
  blindReceive(args: RgbBlindReceiveArgs): Promise<RgbBlindReceiveResult>;
  issueAsset(args: RgbIssueAssetArgs): Promise<RgbIssueAssetResult>;
  listAssets(): Promise<unknown[]>;
  getAssetBalance(assetId: string): Promise<RgbAssetBalance>;
  sendAsset(args: RgbSendAssetArgs): Promise<unknown>;
  listTransfers(assetId?: string): Promise<unknown>;
  getTransferStatus(
    transferId: string | number,
    assetId?: string,
  ): Promise<RgbTransferStatusResult>;
  /** RGB over Lightning; `RGB_LN` wallets only. */
  makeLnInvoice(args: RgbMakeLnInvoiceArgs): Promise<RgbMakeLnInvoiceResult>;
  /** Pay a BOLT-11 invoice that carries an asset; `RGB_LN` wallets only. */
  payLnInvoice(args: { invoice: string } | string): Promise<RgbPayLnInvoiceResult>;
  on(event: RgbEvent, listener: (transfer: RgbTransfer) => void): void;
  off(event: RgbEvent, listener: (transfer: RgbTransfer) => void): void;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

export interface RequestProviderOptions {
  /** How long to wait for `rgb:ready` before rejecting. Default 3000 ms. */
  timeoutMs?: number;
}

/**
 * Resolve `window.rgb`, waiting for the wallet's `rgb:ready` event if the
 * page ran before the provider was installed. Rejects with a
 * {@link ProviderError} (`METHOD_NOT_SUPPORTED`) when no provider appears
 * within the timeout.
 */
export function requestProvider(options?: RequestProviderOptions): Promise<RgbProvider>;

declare global {
  interface Window {
    rgb?: RgbProvider;
  }

  interface WindowEventMap {
    /** Dispatched once `window.rgb` is installed. */
    "rgb:ready": CustomEvent<{ version: string }>;
  }
}
