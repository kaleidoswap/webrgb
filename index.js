/**
 * Runtime half of @kaleidorg/webrgb. Types live in index.d.ts.
 */

class ProviderError extends Error {
  /**
   * @param {string} message
   * @param {import("./index.d.ts").ProviderErrorCode} code
   */
  constructor(message, code) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
  }
}

/**
 * Resolve `window.rgb`, waiting for `rgb:ready` if the page ran before the
 * wallet installed the provider.
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<import("./index.d.ts").RgbProvider>}
 */
export function requestProvider(options = {}) {
  const timeoutMs = options.timeoutMs ?? 3000;
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new ProviderError("window.rgb needs a browser page", "METHOD_NOT_SUPPORTED"));
      return;
    }
    if (window.rgb) {
      resolve(window.rgb);
      return;
    }
    const timer = setTimeout(() => {
      window.removeEventListener("rgb:ready", onReady);
      reject(
        new ProviderError(
          "No RGB provider found — is a WebRGB wallet such as the KaleidoSwap extension installed?",
          "METHOD_NOT_SUPPORTED",
        ),
      );
    }, timeoutMs);
    const onReady = () => {
      clearTimeout(timer);
      if (window.rgb) resolve(window.rgb);
      else reject(new ProviderError("rgb:ready fired without window.rgb", "INTERNAL_ERROR"));
    };
    window.addEventListener("rgb:ready", onReady, { once: true });
  });
}
