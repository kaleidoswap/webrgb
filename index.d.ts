/**
 * Type declarations for the wallet providers the KaleidoSwap browser
 * extension injects into web pages.
 *
 * Source of truth is the extension's `src/injected.ts`; this file mirrors it.
 * `window.webln` follows the WebLN spec and is typed by `@webbtc/webln-types`
 * (install it alongside this package); the other four surfaces are declared
 * here.
 *
 * Every provider rejects with a {@link ProviderError} whose `code` tells a
 * user's refusal apart from a wallet fault.
 */

/** Error codes shared by every injected provider. */
export type ProviderErrorCode =
  | "USER_REJECTED"
  | "NOT_ENABLED"
  | "METHOD_NOT_SUPPORTED"
  | "INTERNAL_ERROR";

export interface ProviderError extends Error {
  code: ProviderErrorCode;
}

export type ProviderEventListener = (payload: unknown) => void;

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
// window.webbtc
// ---------------------------------------------------------------------------

export interface WebBtcInfo {
  network?: string;
  methods: string[];
  [key: string]: unknown;
}

export interface WebBtcProvider {
  readonly enabled: boolean;
  enable(): Promise<void>;
  getInfo(): Promise<WebBtcInfo>;
  getAddress(opts?: { protocol?: string }): Promise<{ address: string; [key: string]: unknown }>;
  signPsbt(psbtHex: string): Promise<{ signed: string; [key: string]: unknown }>;
  finalizePsbt(psbtHex: string): Promise<{ hex: string; [key: string]: unknown }>;
  broadcastTransaction(txHex: string): Promise<{ txid: string; [key: string]: unknown }>;
  /** BIP-322 message signature. */
  signMessage(
    message: string,
    address?: string,
  ): Promise<{ signature: string; address?: string; [key: string]: unknown }>;
  /** A single BIP-21 or BOLT-11 payment request string. */
  sendPayment(paymentRequest: string): Promise<unknown>;
  sendTransaction(address: string, amount: number): Promise<{ txid: string; [key: string]: unknown }>;
  on(event: string, listener: ProviderEventListener): void;
  off(event: string, listener: ProviderEventListener): void;
}

// ---------------------------------------------------------------------------
// window.bitcoin  (Bitcoin Wallet Standard, Unisat/OKX/Leather-style)
// ---------------------------------------------------------------------------

export interface BitcoinWalletProvider {
  readonly enabled: boolean;
  connect(): Promise<string[]>;
  requestAccounts(): Promise<string[]>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<string[]>;
  getPublicKey(): Promise<string>;
  signMessage(message: string, type?: "ecdsa" | "bip322-simple"): Promise<string>;
  signPsbt(psbtHex: string, options?: Record<string, unknown>): Promise<string>;
  pushPsbt(psbtHex: string): Promise<string>;
  sendBitcoin(toAddress: string, satoshis: number, options?: Record<string, unknown>): Promise<string>;
  on(event: string, listener: ProviderEventListener): void;
  off(event: string, listener: ProviderEventListener): void;
  removeListener(event: string, listener: ProviderEventListener): void;
}

// ---------------------------------------------------------------------------
// window.nostr  (NIP-07)
// ---------------------------------------------------------------------------

export interface NostrUnsignedEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey?: string;
}

export interface NostrSignedEvent extends NostrUnsignedEvent {
  id: string;
  pubkey: string;
  sig: string;
}

export interface NostrRelayPolicy {
  read: boolean;
  write: boolean;
}

export interface NostrCipher {
  encrypt(pubkey: string, plaintext: string): Promise<string>;
  decrypt(pubkey: string, ciphertext: string): Promise<string>;
}

export interface NostrProvider {
  getPublicKey(): Promise<string>;
  signEvent(event: NostrUnsignedEvent): Promise<NostrSignedEvent>;
  getRelays(): Promise<Record<string, NostrRelayPolicy>>;
  /** Extension-specific: Schnorr-sign a 32-byte hex digest. */
  signSchnorr(sigHash: string): Promise<string>;
  /** Extension-specific: SHA-256 the message, then Schnorr-sign the digest. */
  hashAndSignSchnorr(message: string): Promise<string>;
  nip04: NostrCipher;
  nip44: NostrCipher;
}

// ---------------------------------------------------------------------------
// Ready events
// ---------------------------------------------------------------------------

/** Dispatched on `window` once the providers are installed. */
export type ProviderReadyEvent =
  | "webln:ready"
  | "weblnReady"
  | "webbtc:ready"
  | "webbtcReady"
  | "bitcoin:ready"
  | "nostr:ready"
  | "rgb:ready";

declare global {
  interface Window {
    rgb?: RgbProvider;
    webbtc?: WebBtcProvider;
    bitcoin?: BitcoinWalletProvider;
    nostr?: NostrProvider;
  }

  interface WindowEventMap {
    "rgb:ready": CustomEvent<{ version: string }>;
    "webbtc:ready": CustomEvent<{ version: string }>;
    "bitcoin:ready": CustomEvent<{ version: string }>;
    "nostr:ready": CustomEvent<{ version: string }>;
  }
}
