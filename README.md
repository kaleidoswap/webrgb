# @kaleidorg/wallet-provider-types

TypeScript declarations for the providers the [KaleidoSwap browser extension](https://docs.kaleidoswap.com/extensions/kaleidoswap-extension/dapp-connectivity) injects into web pages:

| Global | Spec | Typed by |
|--------|------|----------|
| `window.webln` | [WebLN](https://www.webln.dev/) | `@webbtc/webln-types` (peer dependency) |
| `window.webbtc` | WebBTC | this package |
| `window.bitcoin` | Bitcoin Wallet Standard (Unisat/OKX/Leather-style) | this package |
| `window.nostr` | [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) | this package |
| `window.rgb` | KaleidoSwap RGB provider | this package |

## Install

```bash
npm install --save-dev @kaleidorg/wallet-provider-types @webbtc/webln-types
```

Then reference both once, in a `.d.ts` your project already includes or in `tsconfig.json`:

```json
{ "compilerOptions": { "types": ["@webbtc/webln-types", "@kaleidorg/wallet-provider-types"] } }
```

The package augments `Window`, so `window.rgb`, `window.webbtc`, `window.bitcoin` and `window.nostr` are typed everywhere. Each is optional: check it before use, or wait for the matching `*:ready` event.

## Usage

```ts
import type { ProviderError } from "@kaleidorg/wallet-provider-types";

window.addEventListener("rgb:ready", async () => {
  try {
    await window.rgb!.enable();
    const info = await window.rgb!.getInfo();

    if (info.protocol === "RGB_LN") {
      const { invoice } = await window.rgb!.makeLnInvoice({ assetId: "rgb:…", assetAmount: 5 });
      console.log("pay me over Lightning:", invoice);
    }
  } catch (err) {
    if ((err as ProviderError).code === "USER_REJECTED") return; // the user said no
    throw err;
  }
});
```

## Errors

Every provider rejects with an `Error` carrying `code`:

| Code | Meaning |
|------|---------|
| `USER_REJECTED` | The user declined the connection or the confirmation prompt |
| `NOT_ENABLED` | Called before `enable()` resolved for this origin |
| `METHOD_NOT_SUPPORTED` | The connected wallet cannot serve this method |
| `INTERNAL_ERROR` | Anything else; see `error.message` |

## Versioning

The declarations mirror the extension's `src/injected.ts`. A method added to the extension lands here as a minor bump; a changed signature as a major bump. The source of truth is the extension, so if the two disagree, trust the extension and open an issue.

## Development

```bash
npm install
npm test   # compiles test/consumer.ts against the declarations
```

## License

MIT
