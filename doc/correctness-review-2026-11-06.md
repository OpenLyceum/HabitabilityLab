# Correctness review — 2026-11-06

Reviewed local commit `8565918`. Scope: climate and water equations, Kopparapu coefficients,
stellar-track sampling, planet history and controls, escape calculations, and archive-derived
planet data. The findings below were corrected in the follow-up on 2026-11-06; see the resolution at the end.

## Findings

### H1 — P1: tidal-locking calculation swaps the stellar and planetary mass factors

`src/common/model/tidalLock.ts:19–29` uses a denominator proportional to
`M_star * M_earth²`. The simplified despinning relation instead needs
`M_earth * M_star²`: the perturbing star supplies the squared mass dependence.
The inverse lock-distance function inherits the error. With the existing prefactor and
Earth-like parameters at 0.1 AU around 0.3 solar masses, the implementation gives
6,040,515,950 years; the corrected expression gives 60,456 years, a factor of 99,916.
This affects the lock circle, lock milestone, and locked/unlocked conclusions.

Evidence: [Thirouin et al., equation 7](https://arxiv.org/pdf/1407.1214), which states the
Gladman despinning equation with the perturbing body's mass squared. The existing unit test
and `doc/model.md` reproduce the incorrect expression, so passing them does not validate it.

Recommended correction: fix the mass factors and inverse, update the explanatory numbers,
and replace the existing fixtures with independent despinning calculations.

### H2 — P1: upper mass limits become measured masses and definite escape speeds

`scripts/extract-planets.ts:96–116` treats literature provenance `Mass` as a measured true
mass, but its upstream ExoplanetsDatabase snapshot omits the archive's limit flags.
Kepler-62 e/f are consequently labelled as measured 36/35 Earth masses. Both appear as
ordinary shoreline points, with escape speeds 52.89/55.73 km/s. These are upper bounds,
not measured speeds. Their published mass constraints are explicitly upper limits in
[Borucki et al., Table 1 and discussion](https://faculty.washington.edu/agol/587.full.pdf).

Recommended correction: preserve limit flags in the upstream snapshot, propagate them to
curated cards, and exclude limits from the measured-mass shoreline sample or draw them as
bounds. Regenerate the committed planet data after correcting the extraction pipeline.

### H3 — P2: changing stellar mass during late zoom puts age outside the timeline

In `src/aging-star/model/AgingStarModel.ts:333–347`, the window listener first constrains
the age, then the mass listener overwrites it with zero. Reproduce with a fresh model:
set `zoomLateProperty.value = true`, then `trackMassProperty.value = 0.3`. The age becomes
0 Myr while the displayed window is 359,384.958–466,602.9375 Myr. The star and numeric
readouts show ZAMS while the cursor is clamped to the late-stage chart's left edge;
playback advances from the wrong age.

Recommended correction: reset age to the current window minimum or reset late zoom when
changing tracks, and verify that the result is independent of listener ordering.

## Validation

- Node `v26.13.0`; lint, app/scripts/tests type checks, and production build passed.
- Existing tests: 45 passed in four files, including disposal tests.
- Pointer and keyboard fuzz: 10 seconds each, assertions enabled; both passed.
- Built application: all five screens initialized and Reset All worked at 1280×800 and
  390×844, with assertions and randomized listener order; no browser errors observed.
- Local compliance passed with warnings; live security settings were skipped because `gh`
  was unavailable. Template-drift check reports the pre-existing Vitest declaration
  `^5.1.0` versus template `^5.0.5`.
- Three independent review probes failed as described above. Their source is included below;
  temporary probe files were removed from `tests/` after the review.

The Kopparapu coefficients match the
[author's coefficient table](https://personal.ems.psu.edu/~jfk4/ruk15/planets/HZ_coefficients.dat).
Climate, grey-greenhouse, water-phase, and Maxwell–Boltzmann expressions were reviewed within
their documented approximations. This was not an educator, performance, or screen-reader sign-off.
NASA TAP live queries timed out; the upper-limit finding uses bundled data and the original paper.

## Historical reproduction probes

The following code records the original probes against the reviewed commit, before correction.
Some APIs have since changed; use the permanent regression tests named below for the corrected code.
The original command was
`npm test -- tests/review-probes.test.ts`. These assertions describe corrected behavior and
are expected to fail on the reviewed commit.

```typescript
import { expect, it } from "vitest";
import { AgingStarModel } from "../src/aging-star/model/AgingStarModel.js";
import { tidalLockYears } from "../src/common/model/tidalLock.js";
import { CURATED_PLANETS, SHORELINE_PLANETS } from "../src/common/model/planets.js";
import { AU_M, EARTH_MASS_KG, EARTH_RADIUS_M, ROCK_RIGIDITY, SUN_MASS_KG, TIDAL_LOCK_PREFACTOR_YEARS } from "../src/HabitabilityLabConstants.js";

it("review: locking uses stellar mass squared and planet mass to the first power", () => {
  const distance = 0.1;
  const starMass = 0.3;
  const expected = TIDAL_LOCK_PREFACTOR_YEARS * (distance * AU_M) ** 6 * EARTH_RADIUS_M * ROCK_RIGIDITY / ((starMass * SUN_MASS_KG) ** 2 * EARTH_MASS_KG);
  const actual = tidalLockYears(distance, starMass);
  console.log("TIDAL", { actual, expected, ratio: actual / expected });
  expect(actual / expected).toBeCloseTo(1, 3);
});

it("review: switching mass during late zoom keeps age inside the displayed window", () => {
  const model = new AgingStarModel();
  model.zoomLateProperty.value = true;
  model.trackMassProperty.value = 0.3;
  console.log("LATE_ZOOM", { age: model.ageProperty.value, window: model.windowProperty.value });
  expect(model.windowProperty.value.contains(model.ageProperty.value)).toBe(true);
});

it("review: published upper limits are not measured masses or shoreline point estimates", () => {
  console.log("LIMIT_DATA", { planet: CURATED_PLANETS.find(p => p.name === "Kepler-62 f"), shoreline: SHORELINE_PLANETS.find(p => p.name === "Kepler-62 f") });
  expect(CURATED_PLANETS.find(p => p.name === "Kepler-62 f")?.massMeasured).toBe(false);
  expect(SHORELINE_PLANETS.some(p => p.name === "Kepler-62 f")).toBe(false);
});
```

## Resolution — 2026-11-06

H1–H3 are corrected. Tidal locking now uses the full Gladman equation with the documented
Earth-like moment of inertia, initial spin, Q and Love number. The review's 60,456-year example
corrected only the swapped masses in the old small-k₂ approximation; the full expression gives
815,080 years at 0.1 AU around 0.3 M☉. The 0.16 AU red-dwarf preset locks at about 13.7 Myr,
resolved between the sparse stellar-track samples and shown in a localized readout.

The snapshot now carries verified limit flags; generated cards identify mass bounds and
611 shoreline points remain after excluding bounds. Late zoom remains consistent when the
star changes. Permanent regressions are in `tests/physics.test.ts` and `tests/screenModels.test.ts`.
Model documentation, three locales, student questions, instructor answers, screenshots and Word
handouts were updated. Lint, all type checks, 48 tests and build passed on Node 26. Browser smoke and targeted production checks passed.
The extractor emits Biome-formatted JSON so regeneration and lint stay consistent.
