# AGENTS.md — Habitability Lab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Habitability of exoplanets for introductory astronomy: **why can one planet keep liquid water on
its surface while another cannot?** Original work, forked from `SceneryStackTemplate` on
6 Nov 2026; companion to `StellarWobble`, `TransitHunter` and `ExoplanetsDatabase` (finding and
weighing planets), and the successor to the NAAP port `HabitableZones` (left as it is; only its
stellar tracks are reused here, and its galactic habitable zone was deliberately dropped). Five
screens:

| Screen | Folder | Content |
|---|---|---|
| Energy Balance | `src/energy-balance/` | Draggable planet on a log distance axis, flux arrows, absorbed/emitted bars, thermometer, 30-year temperature history; Mercury–Mars presets with measured temperatures; whole-planet vs day-side heat spread |
| Greenhouse | `src/greenhouse/` | Grey atmosphere (T_s⁴ = T_eq⁴(1 + ¾τ)) with back-radiation arrows; water phase diagram (IAPWS) with the surface as a dot; Venus/Earth/Mars/early-Mars presets |
| Zone Edges | `src/zone-edges/` | Kopparapu 2013/14 bands on starlight vs T★ (log, reversed x), 28 curated archive planets (+ optional 1685 small ones), to-scale top view, planet card; planet mass for the runaway edge; any main-sequence star by T★ |
| Aging Star | `src/aging-star/` | 17 Hurley–Pols–Tout tracks; Kopparapu edges at each age; continuously habitable zone, tidal-lock distance, engulfment; HR diagram; luminosity timeline with zone-status strip, milestones, draggable age cursor; late-stage zoom |
| Escape | `src/escape/` | Molecules view (MB swarm in radial gravity on a stretched height scale, speed distribution, Jeans λ, escaping share, 6 v_rms verdict per gas) and cosmic-shoreline view (Solar System + 763 exoplanets, S = (v_esc/6.5 km/s)⁴) |

Physics and data: [`doc/model.md`](doc/model.md). Architecture and decisions:
[`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Planet data are extracted, not fetched.** `scripts/extract-planets.ts` (`npm run
  extract-planets`) reads `../ExoplanetsDatabase/src/common/model/data/pscomppars.json` and writes
  `src/common/model/data/planets.json` (curated planets, small-planet cloud, shoreline planets with a
  measured true mass and radius). Re-run it when ExoplanetsDatabase refreshes its snapshot.
- **`src/common/model/data/shzStars.ts` is vendored** from HabitableZones (480 KB on one line) and
  excluded from Biome in `biome.json`. Do not reformat it.
- **The shoreline normalisation is by eye** (6.5 km/s at Earth's starlight), approved by the user;
  it puts every Solar System body on the right side (Mars sits just below the line).
- **Kopparapu fits stop at 2600 K.** Temperatures are clamped for the edges (TRAPPIST-1 is 2566 K);
  the screens say so.
- **Engulfment ignores tidal drag**, so Earth and Venus survive the Sun's giant phases here; the
  explanation dialog says so.
- **Escape molecule animation** works in units of the body's radius and escape speed and maps height
  logarithmically with a scale height tied to the gas's typical hop; the escaping *share* readout is
  analytic (log₁₀, valid to hundreds of decades), never the sample count.
- **Node >=26** is required. Run `source ~/.nvm/nvm.sh && nvm use 26` before npm or a git commit
  (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `src/common/model/climate.ts` | Starlight, equilibrium temperature, relaxation stepping, grey greenhouse |
| `src/common/model/water.ts` | Wagner–Pruss boiling, IAPWS sublimation and melting curves, `waterPhase` |
| `src/common/model/habitableZone.ts` | Kopparapu edges (+ planet-mass variants), zone status, dwarf-star table |
| `src/common/model/stellarTracks.ts` | Track sampling, main-sequence end, remnant |
| `src/common/model/tidalLock.ts` | Gladman-style lock time and its inverse |
| `src/common/model/escape.ts` | MB speeds, Jeans λ, escaping fraction (and its log), retention rule, shoreline |
| `src/common/model/planets.ts` | Typed planet data and Solar System bodies |
| `src/common/view/ChartFrameNode.ts` | Chart frame with log and reversed axes, pixel-aware log ticks |
| `src/common/view/controls.ts` | Number controls (log option), radio groups, checkboxes, explanation dialogs, equations |
| `src/common/view/StarNode.ts` | Star disc coloured by temperature |
| `src/aging-star/model/AgingStarModel.ts` | `computeHistory` (status, engulf, lock, time in zone), `continuouslyHabitableZone` |
| `src/escape/model/EscapeModel.ts` | Gas, presets, molecule swarm integration |

## Accessibility

Standard fleet pattern:

- Per-screen a11y strings live under `a11y.<screenKey>` in each locale JSON; every screen summary
  has a live current-details paragraph.
- Every screen has a wrapper `Node` with `pdomOrder` (Reset All last) and a `*KeyboardHelpContent`.
- Custom keyboard interactions: the Energy Balance planet (left/right, Shift for smaller steps) and
  the Aging Star age cursor (same keys), both `KeyboardDragListener`s on focusable nodes.
- Zone status is shown in words as well as colour.

## Compliance carve-outs

- `src/common/view/StarNode.ts`: the table of star colours by effective temperature is physical
  data (apparent colour of a blackbody-like star), not theme colour, so it stays out of
  `HabitabilityLabColors.ts`.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

For screenshots, run the dev server with `npx vite --port <free port>` and load `?screens=n`.
Screen models are reachable from the console as `phet.joist.sim.screens[i].model`.
