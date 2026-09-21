/**
 * A conformance suite any wallet can run against its own `window.rgb` to see
 * whether it matches `SPEC.md`.
 *
 * Every default check is read-only and, per the spec, must not raise a
 * confirmation: nothing here issues, sends, or creates an invoice.
 */

import type { RgbProvider } from "./index.js";

export interface ConformanceCheck {
  /** Stable id, e.g. `"getInfo-shape"`. */
  name: string;
  status: "pass" | "fail" | "skip";
  /** Why it failed, or why it could not run. */
  detail?: string;
}

export interface ConformanceReport {
  ok: boolean;
  passed: number;
  failed: number;
  skipped: number;
  checks: ConformanceCheck[];
}

export interface ConformanceOptions {
  /** Call `enable()` first. Default `true`; `false` expects an enabled provider. */
  enable?: boolean;
  /** An asset the wallet holds, for the balance checks. Defaults to the first listed. */
  assetId?: string;
}

export declare function runConformance(
  provider: RgbProvider,
  options?: ConformanceOptions,
): Promise<ConformanceReport>;

/** Render a report as plain text, one line per check. */
export declare function formatReport(report: ConformanceReport): string;
