# Salvage pathway

**Current:** `conflict`

- [ ] **Owner conflicts** — `studio_owner_conflicts_get` → `.codectx/verify/owner-conflicts-latest.md`
- [ ] **Truth surface** — `verify_truth_surface_evaluate` → `.codectx/verify/truth-surface-latest.json`
- [ ] **Shell freshness** — `verify_shell_freshness_evaluate` → `.codectx/verify/shell-stamp.json`
- [ ] **Vertical slice** — `verify_vertical_slice_evaluate` → `.codectx/verify/vertical-slice-latest.json`
- [ ] **Freeze set** — `verify_freeze_set_propose` → `.codectx/verify/freeze-set-latest.json`
- [ ] **Salvage rollup** — `verify_salvage_preset_run` → `.codectx/verify/salvage-rollup-latest.md`

- [ ] **Prove** — `verify_operation_prove` (named truth surface only)

## Repair (CVE5)

**Subtractive (no subject patches):**
- `freeze` `(pending ownerConflicts + freeze-set)` — Run studio_owner_conflicts_get then verify_freeze_set_propose before repair scope (`verify_salvage_pathway`)

**Slice:** `R-AUTH` — Default repair validation slice (`verify_vertical_slice_evaluate`)
**Client replay:** `salvage-vibe-ruin` via `verify_scenario_pack_run`
**False-green:** RC0 / wiring-only / T0–T1 cannot close user-visible issues (CVE1/CVE5) (`verify_false_green_scan`)

_subjectPatches: false_

---
≤1 page · CLAR/RUST4/RCDP4/CVE5
