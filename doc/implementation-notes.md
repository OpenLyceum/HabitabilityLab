# Implementation notes — Habitability Lab

Developer-facing notes. The physics is in [model.md](./model.md).

## Architecture

```
main.ts
  ├─ EnergyBalanceScreen   EnergyBalanceModel  ─ EnergyBalanceScreenView
  ├─ GreenhouseScreen      GreenhouseModel     ─ GreenhouseScreenView
  ├─ ZoneEdgesScreen       ZoneEdgesModel      ─ ZoneEdgesScreenView
  ├─ AgingStarScreen       AgingStarModel      ─ AgingStarScreenView
  └─ EscapeScreen          EscapeModel         ─ EscapeScreenView

src/common/model/   pure physics (no scenery): climate, water, habitableZone, stellarTracks,
                    tidalLock, escape, planets (+ data/planets.json, data/shzStars.ts)
src/common/view/    ChartFrameNode, controls, formatters, fluxArrows, StarNode, zoneStatusView
src/preferences/    "Show equations" preference (query parameter ?showEquations)
```

The five screen models are independent; nothing is shared at run time except the preferences
singleton (`habitabilityLabPreferences`).

## Decisions

- **Presets mark themselves "custom".** Each preset-driven model sets its sliders inside an
  `applyingPreset` guard; any other change to those sliders switches the preset to `custom`
  (and, on Energy Balance, hides the measured temperature).
- **Energy Balance integrates in years.** `stepTemperature` sub-steps so each step is under a fifth
  of the local relaxation time C/(4σT³); dt is capped at 0.1 s of wall time so a background tab does
  not jump decades. The history keeps the last 30 years and is drawn against "years from now", so
  the axis never scrolls; the temperature axis steps through 300–1000 K.
- **One chart frame for everything.** `ChartFrameNode` maps with its own log/reversed axes
  instead of a bamboo `ChartTransform` (which cannot reverse or log). Callers draw with
  `polyline` and redraw on `axesChangedEmitter`. Log ticks label 1-2-5 when a decade is wider than
  140 px, otherwise only decades (every other decade below 22 px).
- **Zone Edges luminosity.** Real hosts get L = S·a² from their own planet's starlight and orbit,
  so the planets land exactly on the archive's insolation; the slider star uses the dwarf table.
  The planet radio group is rebuilt (and the old one disposed) when the star changes.
- **Aging Star history.** `computeHistory` runs once per (track, starting distance) over the table
  rows: zone status, engulfment age (R★ ≥ d), lock age (age ≥ t_lock(d, M)), cumulative time in the
  conservative zone. Readouts interpolate within it; the continuously habitable zone scans rows in
  the window. The top view eases its scale towards the outer edge or the planet (3 s⁻¹), but jumps
  when the track or distance changes. The timeline window is the whole life, or from 90 % of the
  main sequence when zoomed; playback crosses the window in 40 s.
- **Escape swarm.** 160 molecules, velocity-Verlet in r'' = −1/(2r²) with time scaled so a
  typical hop takes 1.6 s; molecules returning to the surface are relaunched with a fresh speed,
  escapers are counted at r = 3 R. Any change of gas, speed or temperature restarts the swarm.
  `log10FractionFasterThan` switches to the asymptotic form above λ = 600 to stay finite.
- **Strings bound to text.** Never set `.string` on a `Text`/`RichText` created from a localized
  `StringProperty`: it writes through to the shared property. Value labels start from `""`.

## Testing

- `tests/physics.test.ts` pins the numbers quoted in `model.md` (T_eq, τ for the planets, IAPWS
  check values, Kopparapu distances for the Sun, the Sun's track, lock times, Jeans escape, the
  shoreline classification of the Solar System).
- `tests/screenModels.test.ts` exercises each screen model (presets, settling, history, CHZ,
  playback, molecule escape).
- `tests/memory-leak.test.ts` and the Playwright fuzz smoke come from the template.
