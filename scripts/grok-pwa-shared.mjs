/**
 * Single source of truth for platform head chrome (PWA, extensions.js, OG),
 * shared by the Vite plugin and Nitro middleware. Plain ESM so `node --test`
 * and the Nitro bundler can both consume it.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_APP_NAME = "Grok App";
export const OG_SERVICE_URL_DEFAULT = "https://og.grok.me";
export const OG_SITE_REL_PATH = "src/lib/og/site.json";
