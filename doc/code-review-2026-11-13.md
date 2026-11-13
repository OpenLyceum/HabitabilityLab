# Code review — 2026-11-13

Reviewed commit `1755859` with a clean starting working tree. Scope: the five screen models,
shared physics and chart/control helpers, dynamic view lifecycles, generated planet-data pipeline,
test coverage, local compliance, and browser behavior. The findings below describe the reviewed
commit; all three have since been corrected as recorded in the resolution below.

## Findings

### C1 — P2: time in the conservative zone continues accumulating after the planet leaves

Locations: `src/aging-star/model/AgingStarModel.ts:178–180` and `:314–320`.

`computeHistory` assigns an entire interval between stellar-track rows to the previous row's
zone status. The live cumulative readout uses that same previous status, although the current
star and planet status use the interpolated track. These two calculations disagree between
samples at a zone crossing.

Reproduction with the default Sun/Earth preset:

```typescript
model.setAge(5600);
// statusProperty: "optimisticInner"; timeInZoneProperty: 5600 Myr
model.setAge(5700);
// statusProperty: "optimisticInner"; timeInZoneProperty: 5700 Myr
```

The planet is outside the conservative zone at both ages, yet another 100 Myr is credited to
its time inside. Integrating the current interpolated-track status with a 0.1 Myr sampling interval
gives about 5561.4 Myr of conservative-zone residence by age 10000 Myr; the model reports
5739.96 Myr. The timeline's status strip also uses the tabulated statuses, so it shows the
transition later than the live status readout.

Resolve zone-boundary crossings inside each track interval and use those event times for the
cumulative history, live partial intervals, and timeline strip. Add a regression that cumulative
time stays constant across an interval known to be outside the conservative zone.

### C2 — P2: timeline redraws leak milestone text nodes

Location: `src/aging-star/view/TimelineNode.ts:114–117`.

Each milestone is a plain `Node` wrapping a `Path` and a localized `Text`. Redraw calls only
`child.dispose()` on that wrapper. Scenery's `Node.dispose()` detaches children; it does not
dispose them. The old text therefore remains subscribed to the long-lived string property.
Changing star mass, orbital distance, or late-stage zoom repeatedly retains more labels and
their subscriptions.

A probe constructing a real `TimelineNode`, then toggling `zoomLateProperty` 20 times, increases
`msEndStringProperty.getListenerCount()` from 2 to 22. The current disposal tests exercise
`TimeModel`, a planet radio group, and `StarNode`, so they do not detect this leak.

Dispose the complete dynamically created milestone subtree, or explicitly dispose its owned
children before the wrapper. Add a redraw regression asserting that external listener counts
remain stable after repeated zoom/track changes.

### C3 — P2: supported temperatures exceed the history chart's maximum

Location: `src/energy-balance/view/TemperatureHistoryNode.ts:63–75`.

The axis choices stop at 1000 K. If the highest temperature exceeds every choice, the fallback
still selects 1000 K and the equilibrium reference line is clamped to the chart top. The actual
temperature curve is clipped away above that limit.

Reproduction using supported controls: luminosity 10 L☉, distance 0.1 AU, albedo 0, whole-planet
heat spread, then **Jump to equilibrium**. Both numeric temperature readouts correctly show
1565 K, while the equilibrium chart line sits at 1000 K and the current-temperature point is
outside the plot. Day-side heat spread permits an even higher temperature. The thermometer
also saturates because `TEMPERATURE_DISPLAY_RANGE` ends at 800 K.

Extend chart scaling to cover the full supported temperature range, or compute a suitable
rounded upper bound from the current/history temperatures. Keep reference lines at their true
values. Verify extreme allowed inputs as well as the Solar System presets.

## Code organization and coverage

The screen-specific model/view split is clear. Shared physics functions and centralized control
and chart helpers make the implementation approachable. The earlier tidal-locking, archive-limit,
and late-zoom fixes have permanent regression coverage. The main remaining coverage gaps exposed
by this review are transitions between track samples, repeated dynamic-view redraws, and display
ranges at the supported control extremes.

## Validation and limits

- Node `v26.13.0`; lint, application/scripts/tests type checks, all 48 existing tests, and
  production build passed. Installed Biome is 2.6.4 while the manifest/schema request 2.6.5;
  lint reports this as informational.
- Ten-second pointer fuzz and ten-second keyboard fuzz passed with assertions enabled.
- Independent temporary probes reproduced C1 and C2. A production Chromium probe with
  `?ea&listenerOrder=random` reproduced C1 and C3. Probe files were removed after review.
- All five production screens initialized and accepted keyboard activation of Reset All at
  1280×800 and 390×844, with assertions and randomized listener order enabled; no browser
  exceptions were observed. Screenshots were captured for visual inspection.
- Local repository compliance passed with warnings. Live GitHub security checks were skipped
  because `gh` is unavailable. Hardcoded-color warnings include the documented stellar-color
  data exception and the transparent label backing in `EnergySpaceNode`.
- Template-drift audit reports three differences: `biome.json`, Biome `^2.6.5` versus template
  `^2.6.6`, and Vitest `^5.0.5` versus template `^5.1.0`.
- This review does not constitute independent verification of every scientific coefficient,
  a screen-reader assessment, or a long-duration heap/performance audit. The reported leak is
  demonstrated by retained property subscriptions rather than a heap snapshot.

## Resolution — 2026-11-13

C1–C3 are corrected:

- Stellar-track history now includes resolved crossings of all four zone edges. The timeline strip
  and cumulative residence share these event rows; Earth's residence stays at about 5.5614 Gyr
  between ages 5.6 and 5.7 Gyr. Regressions cover seeking/reset and two visits to the conservative
  zone within a synthetic two-sample track, checked against independent midpoint quadrature.
- Rebuilt milestone wrappers dispose their complete owned subtrees. A regression keeps the
  timeline, model and localized strings alive while forcing garbage collection of replaced labels.
- The temperature-history axis grows beyond 1000 K as needed, preserves hot history samples,
  and places reference lines at their actual temperatures. The thermometer covers 0–2000 K.
  A real-view regression exercises both whole-planet and day-side extremes and return/reset to Earth.

Node 26 lint, type checks, 52 unit tests and the production build pass. Pointer and keyboard fuzz
both pass. Production Chromium checks with assertions and randomized listener order confirm the
timeline strip ends its first conservative segment at 5561.3958078 Myr and the day-side extreme
(1861.2474 K) fits inside a 2500 K chart. All five screens accept keyboard Reset All at desktop
and phone viewport sizes without browser exceptions. Local compliance passes with the existing
warnings. The installed-Biome schema mismatch remains informational; dependency/template
maintenance is outside these fixes.
