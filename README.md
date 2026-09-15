# @kaleidorg/webrgb

**WebRGB** is the `window.rgb` provider a wallet injects into web pages so a dApp can issue, receive, send and track [RGB](https://rgb.tech) assets, and pay or receive them over Lightning, without running its own RGB backend. It sits next to [WebLN](https://www.webln.dev/) (`window.webln`) and WebBTC (`window.webbtc`) and follows the same conventions: one `enable()` consent per origin, a confirmation in the wallet for every funds-touching call, and errors that carry a `code`.

The reference implementation is the [KaleidoSwap browser extension](https://docs.kaleidoswap.com/extensions/kaleidoswap-extension/dapp-connectivity). This package ships the TypeScript declarations and a small `requestProvider()` helper.

## Install

```bash
npm install @kaleidorg/webrgb
```

Importing anything from the package augments `Window`, so `window.rgb` is typed everywhere. For WebLN typings use `@webbtc/webln-types`; for NIP-07 use `nostr-tools`.

## Usage

```ts
import { requestProvider, type ProviderError } from "@kaleidorg/webrgb";

try {
  // Waits for the wallet's `rgb:ready` event if the page ran first.
  const rgb = await requestProvider();
  await rgb.enable();

  const info = await rgb.getInfo();
  // { ready, network, protocol: "RGB_L1" | "RGB_LN", methods: [...] }

  const { invoice } = await rgb.blindReceive({ assetId: "rgb:…", amount: 1 });

  if (info.protocol === "RGB_LN") {
    const ln = await rgb.makeLnInvoice({ assetId: "rgb:…", assetAmount: 5 });
    console.log("pay me over Lightning:", ln.invoice);
  }

  rgb.on("transferSettled", (t) => console.log("settled", t.transferId));
} catch (err) {
  if ((err as ProviderError).code === "USER_REJECTED") return; // the user said no
  throw err;
}
```

## Surface

| Method | Purpose |
|--------|---------|
| `enable()` / `getInfo()` | Connect the origin; learn network, runtime and served methods |
| `getAddress()` | Bitcoin address that anchors the wallet's RGB state |
| `blindReceive(args)` | Blinded-UTXO receive invoice for an asset |
| `issueAsset(args)` | Mint a new asset (gated by its own wallet capability) |
| `listAssets()` / `getAssetBalance(id)` | Holdings |
| `sendAsset(args)` | Send against an RGB invoice, or explicitly |
| `listTransfers(id?)` / `getTransferStatus(id)` | Transfer history and status |
| `makeLnInvoice(args)` / `payLnInvoice(args)` | RGB over Lightning; listed in `methods` only when the wallet has a Lightning node |
| `on` / `off` | `transferReceived` and `transferSettled` events |

Feature-detect with `getInfo().methods` rather than assuming a method exists: a node-less wallet rejects the Lightning methods with `METHOD_NOT_SUPPORTED`.

## Errors

| Code | Meaning |
|------|---------|
| `USER_REJECTED` | The user declined the connection or the confirmation prompt |
| `NOT_ENABLED` | Called before `enable()` resolved for this origin |
| `METHOD_NOT_SUPPORTED` | The connected wallet cannot serve this method, or no provider was found |
| `INTERNAL_ERROR` | Anything else; see `error.message` |

## Versioning

The declarations mirror the extension's `src/injected.ts`. A method added to the provider lands here as a minor bump; a changed signature as a major bump. If the two disagree, trust the wallet and open an issue.

## Development

```bash
npm install
npm test   # type-checks index.js and compiles test/consumer.ts against the declarations
```

## License

MIT
