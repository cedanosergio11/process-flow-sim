# Stasis Dual Choke MPD bench (Process Flow Sim)

Interactive PFD training bench — `PFD-STA-RIG-01` / v1.4.4.0.

**Live:** https://cedanosergio11.github.io/process-flow-sim/

## Highlights

- Well-control circulating default: exclusive returns to **MGS** (D-6); D-4∧D-5 closed
- Presets: To flow line, Split returns (warn), meter bypass, rig manifold
- CK-M service SoT: E-4 ∧ E-5 ∧ M-1 ∧ M-2
- Bench physics: choke opening ↑ → WHP ↓; FM-01 ≈ pump Qin on meter path

## Dev

```bash
npm install
npm run dev
```

## GitHub Pages

```bash
npm run build:pages
```

Deploys from `main` via `.github/workflows/pages.yml` (SPA base `/process-flow-sim/`).
First time: repo **Settings → Pages → Source: GitHub Actions**.
