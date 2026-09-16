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

const SHARE_META_KEYS = new Set([
  "og:title",
  "og:description",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:type",
  "og:url",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:image",
  "twitter:description",
  "x:game:image",
  "x:game:image:width",
  "x:game:image:height",
]);

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Inverse of escapeHtml. Decode &amp; last so a single pass undoes one encode. */
function unescapeHtml(value) {
  return String(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

/** 6-digit hex for the og.grok.me placeholder, or "" if site.color is missing/invalid. */
function placeholderCardColor(site = {}) {
  const raw = String(site.color ?? "").trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : "";
}

/**
 * "wild-race.grok.me" → "Wild Race". Only published app hosts encode the
 * display name in the first label. Preview / guest hosts are image origins
 * only — slugifying them produced internal names like "Hds Abc 3000 Xy".
 */
export function appNameFromHost(hostHeader) {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host.endsWith(".grok.me")) {
    ret