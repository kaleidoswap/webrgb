# Changelog

All notable changes to `@kaleidorg/webrgb` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
