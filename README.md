# Process Flow Sim

Stasis Dual Choke MPD bench — interactive PFD + HMI (`PFD-STA-RIG-01`).

## Run

```bash
npm install
npm run dev
```

App on http://localhost:8080

## Notes

- Sourced from Grok project Process Flow Sim.
- P0: dock no longer overlays trend strip; fit-to-view uses content bbox; trends seed from live WHP/FM-01.
- Cate owns UI chrome. MPGenie owns lineup/physics sign-off.
- Choke sets WHP; FM-01 tracks pump rate while the path is open.
