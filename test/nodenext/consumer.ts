// The same package, resolved the way Node and a `moduleResolution: NodeNext`
// project resolve it: through the "exports" map, by package name. This is what
// catches a subpath that only works for a bundler.
import { isProviderError, listProviders, requestProvider, supports } from "@kaleidorg/webrgb";
import type { RgbInfo, RgbProvider } from "@kaleidorg/webrgb";
import { createMockProvider, installMockProvider } from "@kaleidorg/webrgb/mock";
import { formatReport, runConformance } from "@kaleidorg/webrgb/conformance";

async function main(): Promise<void> {
  const rgb: RgbProvider = await requestProvider({ enable: true, timeoutMs: 1000 });
  const info: RgbInfo = await rgb.getInfo();
  if (supports(info, "makeLnInvoice")) {
    await rgb.makeLnInvoice({ assetId: "rgb:x", assetAmount: 1 });
  }

  for (const { info: wallet, provider } of await listProviders()) {
    console.log(wallet.rdns, provider.enabled);
  }

  const mock = createMockProvider({ protocol: "RGB_LN" });
  console.log(formatReport(await runConformance(mock)));

  try {
    installMockProvider().uninstall();
  } catch (err) {
    if (isProviderError(err)) console.log(err.code);
  }
}

void main;
