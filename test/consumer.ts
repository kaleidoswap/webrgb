// Compile-only consumer: the declarations must let a dApp be written against
// every injected provider without casts, and must reject misuse.
import { requestProvider } from "@kaleidorg/webrgb";
import type { ProviderError, RgbTransfer } from "@kaleidorg/webrgb";

async function useRgb(): Promise<void> {
  if (!window.rgb) return;
  await window.rgb.enable();
  const info = await window.rgb.getInfo();
  if (!info.ready) return;

  const { invoice } = await window.rgb.blindReceive({ assetId: "rgb:x", amount: 1 });
  await window.rgb.sendAsset({ invoice });
  await window.rgb.sendAsset({ assetId: "rgb:x", amount: 1, recipientId: "utxob:y" });

  if (info.protocol === "RGB_LN") {
    const ln = await window.rgb.makeLnInvoice({ assetId: "rgb:x", assetAmount: 5 });
    const paid = await window.rgb.payLnInvoice({ invoice: ln.invoice });
    paid.assetAmount?.toFixed(0);
    await window.rgb.payLnInvoice(ln.invoice);
  }

  const onSettled = (t: RgbTransfer): void => {
    t.status === "Settled";
  };
  window.rgb.on("transferSettled", onSettled);
  window.rgb.off("transferSettled", onSettled);

  // @ts-expect-error unknown event name
  window.rgb.on("somethingElse", onSettled);
  // @ts-expect-error sendAsset needs an invoice or the explicit triple
  await window.rgb.sendAsset({ assetId: "rgb:x" });
}

async function useDiscovery(): Promise<void> {
  const rgb = await requestProvider({ timeoutMs: 5000 });
  await rgb.enable();
  const rgbDefault = await requestProvider();
  rgbDefault.enabled;
}

window.addEventListener("rgb:ready", (e) => {
  e.detail.version.length;
});

function isUserRejected(err: unknown): boolean {
  return (err as ProviderError).code === "USER_REJECTED";
}

void useRgb;
void useDiscovery;
void isUserRejected;
