# Changelog

All notable changes to `@kaleidorg/webrgb` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-09-21

The KaleidoSwap extension 0.3.0 is the first release that injects
`window.rgb`, so this is the first version with a shipped provider to mirror.

### Added

- `SPEC.md`: the interface contract, separated from any one implementation —
  including which calls may raise a confirmation and which must not.
- Discovery, EIP-6963 style: `listProviders()`, `onProviderAnnounced()` and
  `announceProvider()` over the `rgb:requestProvider` / `rgb:announceProvider`
  events, so two installed wallets no longer race for the single `window.rgb`
  slot. `requestProvider()` now resolves from an announcement as well.
- `@kaleidorg/webrgb/mock`: `createMockProvider()` and `installMockProvider()`,
  an in-memory wallet that enforces the same rules as a real one, so a dApp can
  be built and tested with nothing installed.
- `@kaleidorg/webrgb/conformance`: `runConformance()` and `formatReport()`,
  read-only checks a wallet can run against itself.
- `isProviderError()`, `providerErrorCode()` and `RGB_ERROR_CODES`, so handling
  a rejection no longer needs a cast — the error a page catches is a plain
  `Error` and `instanceof` never worked.
- `supports(info, method)` and the `RgbMethod` union for typed feature
  detection; `toAssetArray()` / `toTransferArray()` for wallets that wrap their
  lists.
- `decodeRgbInvoice(invoice)`: read what an invoice asks for before sending
  against it — read-only, no confirmation, `amount: null` for an any-amount
  invoice. Served by the extension from 0.3.1.
- `requestProvider({ enable: true })`, and `timeoutMs: 0` for "do not wait".
- Runtime tests (`node --test`), a NodeNext type-check of the published
  `exports` map, and `attw` + `publint` over the packed tarball.

### Changed

- `listAssets()`, `listTransfers()` and `sendAsset()` are typed to what a
  wallet actually returns (`RgbAsset`, `RgbTransfer`, `RgbSendAssetResult`)
  instead of `unknown`. Narrowing a list now needs `toAssetArray()` /
  `toTransferArray()`.
- `getInfo().methods` is `RgbMethod[]`; `protocol` admits a string a future
  runtime may introduce.
- The playground gained discovery, conformance and the mock wallet, so it is
  useful without an extension installed.

## [0.1.0] - 2026-09-15

First cut of the WebRGB declarations, mirroring the `window.rgb` provider the
KaleidoSwap browser extension injects.

### Added

- `RgbProvider` and its argument and result types: `enable`, `getInfo`,
  `getAddress`, `blindReceive`, `issueAsset`, `listAssets`, `getAssetBalance`,
  `sendAsset`, `listTransfers`, `getTransferStatus`, `makeLnInvoice`,
  `payLnInvoice`, and the `transferReceived` / `transferSettled` events.
- `ProviderError` with the `USER_REJECTED`, `NOT_ENABLED`,
  `METHOD_NOT_SUPPORTED` and `INTERNAL_ERROR` codes.
- `Window` augmentation for `window.rgb` and the `rgb:ready` event.
- `requestProvider()`, which resolves `window.rgb` or waits for `rgb:ready`.
