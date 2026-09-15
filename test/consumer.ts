// Compile-only consumer: the declarations must let a dApp be written against
// every injected provider without casts, and must reject misuse.
import type { ProviderError, RgbTransfer } from "@kaleidorg/wallet-provider-types";

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

async function useOthers(): Promise<void> {
  if (window.webln) {
    await window.webln.enable();
    const { paymentRequest } = await window.webln.makeInvoice({ amount: 21, defaultMemo: "hi" });
    await window.webln.sendPayment(paymentRequest);
  }
  if (window.webbtc) {
    const { address } = await window.webbtc.getAddress();
    await window.webbtc.signMessage("hello", address);
  }
  if (window.bitcoin) {
    const [account] = await window.bitcoin.connect();
    account.toUpperCase();
    await window.bitcoin.signMessage("hello", "bip322-simple");
  }
  if (window.nostr) {
    const pubkey = await window.nostr.getPublicKey();
    const signed = await window.nostr.signEvent({
      kind: 1,
      created_at: 0,
      tags: [],
      content: "gm",
    });
    signed.sig.length;
    await window.nostr.nip44.encrypt(pubkey, "secret");
  }
}

window.addEventListener("rgb:ready", (e) => {
  e.detail.version.length;
});

function isUserRejected(err: unknown): boolean {
  return (err as ProviderError).code === "USER_REJECTED";
}

void useRgb;
void useOthers;
void isUserRejected;
