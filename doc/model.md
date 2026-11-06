# Habitability Lab — model

This document describes the physics, data and simplifications behind each screen, for an
educator. Developer notes are in [implementation-notes.md](./implementation-notes.md).

The sim asks one question across five screens: **why can one planet keep liquid water on its
surface while another cannot?** It moves from a bare rock in sunlight (Energy Balance), to an
atmosphere that traps heat and sets the pressure (Greenhouse), to the edges of the habitable zone
as climate models draw them (Zone Edges), to how those edges move as a star ages (Aging Star), to
whether a planet can hold on to an atmosphere at all (Escape).

Audience: introductory astronomy, matching StellarWobble, TransitHunter and ExoplanetsDatabase.
Equations sit behind an optional "Show equations" panel; the default view shows behaviour.

Companion sims: StellarWobble and TransitHunter (how planets are found and weighed),
ExoplanetsDatabase (the archive this sim's real planets come from). HabitableZones (the NAAP
port) is left as it is; this sim reuses only its tabulated stellar tracks (see Aging Star).

## Units and constants

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Stellar luminosity | L | L☉ | 1 L☉ = 3.828 × 10²⁶ W (IAU 2015) |
| Stellar effective temperature | T★ | K | Sun 5772 K |
| Orbital distance | d | AU | |
| Starlight received | S | S⊕ (Earth = 1) | S = L / d²; 1 S⊕ = 1361 W m⁻² |
| Bond albedo | A | — | fraction of starlight reflected |
| Temperatures | T | K, °C shown alongside | |
| Surface pressure | P | bar | 1 bar = 10⁵ Pa |
| Escape speed | v_esc | km s⁻¹ | √(2GM/R) |

Stefan–Boltzmann σ = 5.670374 × 10⁻⁸ W m⁻² K⁻⁴; k_B = 1.380649 × 10⁻²³ J K⁻¹;
G = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻².

## 1. Energy Balance

A planet with no atmosphere absorbs starlight on its cross-section (πR²) and radiates infrared
from its whole surface (4πR²). It warms or cools until the two match:

```
absorbed = S (1 − A) / 4        emitted = σ T⁴
T_eq     = [ S (1 − A) / (4σ) ]^¼   ≈ 278.6 K × [ S/S⊕ · (1 − A) ]^¼
```

The factor 4 is the cross-section-to-surface ratio, and it assumes the planet spreads the heat
around (it spins, or its winds carry heat to the night side). A **"Heat spread"** choice offers
"whole planet" (factor 4) or "day side only" (factor 2, a slowly rotating or tidally locked planet
with no heat transport), which previews the red-dwarf discussion in later screens.

**Approach to equilibrium.** The temperature is not set instantly; the student watches it settle:

```
C dT/dt = S (1 − A) / f − σ T⁴         f = 4 or 2
```

with C = 4 × 10⁸ J m⁻² K⁻¹, the heat capacity of a 100 m ocean mixed layer. Near Earth's
equilibrium the relaxation time C / (4σT³) is about 3.4 years, so the clock shows **years** and
plays at about one year per second. The integration uses an exact-enough explicit step with
sub-stepping (the right-hand side is stiff only at very high T; dt is capped so that
dt < 0.2 C / (4σT³)).

**Controls.** Star luminosity (0.001–10 L☉, log), distance (0.1–5 AU, log; draggable planet),
albedo (0–0.95), heat spread. **Readouts.** S in S⊕ and W m⁻², absorbed and emitted power per
square metre (two bars that become equal), current and equilibrium temperature, and the measured
mean surface temperature when a solar-system preset is chosen.

**Presets** (albedo: NASA planetary fact sheets; measured mean surface temperature):

| Planet | d (AU) | A | T_eq (model) | Measured T_surface |
|---|---|---|---|---|
| Mercury | 0.387 | 0.088 | 437 K | ~440 K (day 700 K, night 100 K) |
| Venus | 0.723 | 0.76 | 229 K | 737 K |
| Earth | 1.000 | 0.30 | 255 K | 288 K |
| Mars | 1.524 | 0.25 | 210 K | ~210 K |

The gap for Venus and Earth, and its absence for airless Mercury and thin-aired Mars, is the hook
for the next screen. Mercury in "day side only" mode shows why its day side is so hot.

## 2. Greenhouse

### Grey atmosphere

An atmosphere lets most starlight through but absorbs outgoing infrared. The simplest model that
spans Mars to Venus is a grey atmosphere of infrared optical depth τ (Eddington approximation, as
in planetary-science texts):

```
T_surface⁴ = T_eq⁴ (1 + ¾ τ)
```

τ = 0 is a bare rock. The values that reproduce the measured surface temperatures from the
Energy Balance T_eq are τ ≈ 0.85 (Earth), τ ≈ 140 (Venus) and τ ≈ 0 (Mars). The student sets τ
on a log slider (0, then 0.01–300). A cartoon atmosphere column darkens with τ, and an
infrared-arrow diagram shows outgoing radiation leaving from higher, colder layers as τ grows.

This is a teaching model: a real greenhouse depends on which gases absorb at which wavelengths,
and Venus's surface temperature also involves clouds and a deep convective atmosphere. The
readout says "greenhouse warming ΔT = T_surface − T_eq".

### Liquid water needs pressure too

The second panel is the **phase diagram of water**, log pressure against temperature, with the
planet's surface (T_surface, P_surface) as a dot. Surface pressure is its own slider
(0.0001–200 bar, log), since τ and pressure are independent in this model.

Phase boundaries (IAPWS):

- **Liquid–vapour** (boiling) curve, triple point to critical point (273.16–647.096 K):
  Wagner & Pruss (1993), `ln(p/p_c) = (T_c/T)(a₁ϑ + a₂ϑ^1.5 + a₃ϑ³ + a₄ϑ^3.5 + a₅ϑ⁴ + a₆ϑ^7.5)`,
  ϑ = 1 − T/T_c, p_c = 22.064 MPa, T_c = 647.096 K,
  a = (−7.85951783, 1.84408259, −11.7866497, 22.6807411, −15.9618719, 1.80122502).
  Check: 101 324 Pa at 373.124 K.
- **Solid–vapour** (sublimation) curve below 273.16 K: IAPWS (2011),
  `ln(p/p_t) = θ⁻¹ Σ aᵢ θ^bᵢ`, θ = T/273.16, p_t = 611.657 Pa,
  a = (−21.2144006, 27.3203819, −6.10598130), b = (0.00333333333, 1.20666667, 1.70333333).
- **Solid–liquid** (melting) line: IAPWS ice Ih melting curve; over 0.0001–200 bar it is within
  0.15 K of 273.16 K, so it draws as a near-vertical line.

The dot's region gives the verdict: **ice**, **liquid water possible**, or **vapour only**
(above the critical point, "supercritical"). The verdict assumes water is present; whether a
planet has water at all is outside the model.

**Presets:** Venus (τ 140, 92 bar), Earth (τ 0.85, 1.013 bar), Mars (τ 0, 0.006 bar), plus an
"Early Mars" scenario (thicker CO₂ atmosphere, ~1 bar, τ ≈ 1.5, still colder than freezing),
which links to the faint young Sun on the Aging Star screen. Mars sits almost exactly at the
triple-point pressure (611.657 Pa ≈ 0.006 bar): even when warm enough, liquid water boils away.

## 3. Zone Edges

### Habitable-zone limits

The edges come from the 1-D climate models of Kopparapu et al. (2013, ApJ 765, 131) with the
coefficients updated in Kopparapu et al. (2014, ApJL 787, L29). Each edge is a critical starlight
level S_eff that depends on the star's temperature:

```
S_eff(T★) = S_eff☉ + a t + b t² + c t³ + d t⁴      t = T★ − 5780 K,  2600 K ≤ T★ ≤ 7200 K
d_edge    = √( L / S_eff )  AU
```

| Edge | S_eff☉ | a | b | c | d |
|---|---|---|---|---|---|
| Recent Venus (optimistic inner) | 1.776 | 2.136e-4 | 2.533e-8 | −1.332e-11 | −3.097e-15 |
| Runaway greenhouse, 1 M⊕ (conservative inner) | 1.107 | 1.332e-4 | 1.580e-8 | −8.308e-12 | −1.931e-15 |
| Runaway greenhouse, 5 M⊕ | 1.188 | 1.433e-4 | 1.707e-8 | −8.968e-12 | −2.084e-15 |
| Runaway greenhouse, 0.1 M⊕ | 0.99 | 1.209e-4 | 1.404e-8 | −7.418e-12 | −1.713e-15 |
| Maximum greenhouse (conservative outer) | 0.356 | 6.171e-5 | 1.698e-9 | −3.198e-12 | −5.575e-16 |
| Early Mars (optimistic outer) | 0.320 | 5.547e-5 | 1.526e-9 | −2.874e-12 | −5.011e-16 |

For the Sun this gives 0.95–1.68 AU (conservative) and 0.75–1.77 AU (optimistic). Why the edges
tilt: a cooler star emits more of its light in the infrared, which water and CO₂ absorb and the
atmosphere scatters less, so a planet around a red dwarf warms with less total starlight.

**Inner edge:** the runaway greenhouse. Warm oceans put enough water vapour in the air that the
planet can no longer radiate away more heat; the oceans boil off, and water is lost to space.
**Outer edge:** the maximum greenhouse. Adding more CO₂ eventually scatters more starlight than
it traps, so no amount of CO₂ keeps the surface above freezing. The optimistic edges come from
the observation that Venus may have had liquid water until ~1 Gyr ago and Mars had it ~3.8 Gyr ago.

A **planet-mass** choice (0.1, 1, 5 M⊕) moves the runaway-greenhouse edge: a heavier planet has
a higher surface gravity and a thinner column of water vapour for the same surface pressure, so
it can sit closer in.

### Views

1. **Diagram:** starlight received (S⊕, increasing to the left, log) against star temperature,
   the standard plot in the literature. The conservative zone is a dark band, the optimistic one
   a lighter band. Solar-system planets sit on the T★ = 5772 K line. Real planets are points.
2. **System view:** a top view of the chosen star with its habitable zone drawn to scale
   (optimistic and conservative annuli, auto-zoomed), and the planets of a real system on their
   orbits. A star-temperature slider (2600–7200 K) picks a main-sequence star, or a preset picks
   a real host.

For the slider's main-sequence star, luminosity comes from a table of dwarf-star properties
interpolated in log L against T★ (Pecaut & Mamajek 2013, values approximate):

| Type | T★ (K) | L (L☉) | M (M☉) |
|---|---|---|---|
| M8 V | 2600 | 0.0005 | 0.09 |
| M5 V | 3060 | 0.0036 | 0.16 |
| M3 V | 3400 | 0.014 | 0.30 |
| M0 V | 3850 | 0.07 | 0.57 |
| K5 V | 4440 | 0.16 | 0.70 |
| K0 V | 5270 | 0.46 | 0.88 |
| G2 V | 5770 | 1.0 | 1.00 |
| F5 V | 6550 | 3.2 | 1.33 |
| F0 V | 7200 | 6.5 | 1.60 |

**Real planets** come from the ExoplanetsDatabase snapshot of the NASA Exoplanet Archive
(`pscomppars`, retrieved 2026-11-06), extracted by `scripts/extract-planets.ts` into
`src/common/model/data/planets.json`. The curated list (S from `pl_insol`, T★ from `st_teff`):

- Rocky candidates in or near the zone: TRAPPIST-1 b–h, Proxima Cen b, TOI-700 b–e,
  Teegarden's Star b–d, LHS 1140 b, Ross 128 b, Wolf 1069 b, Kepler-1649 c, Kepler-186 f,
  Kepler-442 b, Kepler-452 b, Kepler-62 e and f, GJ 667 C c, TOI-715 b, Gliese 12 b.
- Larger "sub-Neptune" for contrast: K2-18 b (2.4 R⊕, in the zone but probably not rocky).

An optional layer shows every archive planet smaller than 2 R⊕ with known S and T★ as faint dots,
so the curated planets can be seen against the whole population.

Each planet's info card gives radius, mass (and whether measured or estimated from radius),
S, T★, orbit, and "in conservative / optimistic zone / outside".

**Simplifications:** the edges assume an Earth-like planet with water and a CO₂–H₂O atmosphere,
and the fits are valid only for 2600–7200 K (the slider is clamped to that range). Being inside
the zone means only that liquid water is possible for a suitable atmosphere.

## 4. Aging Star

### Stellar tracks

Stars brighten as they age. The screen uses the 17 tabulated evolutionary tracks (0.3–30 M☉)
from the NAAP Circumstellar Habitable Zone Simulator, as transcribed in HabitableZones
(`shzStars.ts`; Hurley, Pols & Tout 2000 single-star evolution, solar metallicity). Each track
lists mass, log L, log R and log T★ against time since the zero-age main sequence (ZAMS).
Values between samples are interpolated linearly. The Sun's track gives L = 0.74 L☉ at ZAMS,
1.0 L☉ at 4.6 Gyr, and 2.2 L☉ at the end of the main sequence (10.6 Gyr).

### Moving edges

At each age the Kopparapu edges (screen 3) are recomputed from the star's current L and T★.
This replaces HabitableZones' fixed √L scaling with edges that also depend on temperature. When
T★ leaves 2600–7200 K (giants and hot stars), it is clamped to the nearest bound and a note says
the edges are extrapolated.

**Continuously habitable zone (CHZ).** The distances that stayed inside the conservative zone
for the whole of the last Δt (choices 1, 2, 4 Gyr), ending at the current age:

```
CHZ(t, Δt) = [ max over [t−Δt, t] of d_inner ,  min over [t−Δt, t] of d_outer ]
```

drawn as a hatched ring when it is not empty. On the main sequence L only rises, so the CHZ runs
from today's inner edge to the outer edge at t − Δt.

### The planet

The planet starts at distance d₀. As the star loses mass in its late stages the orbit widens
(slow mass loss conserves the planet's orbital angular momentum, so a·M is constant):

```
d(t) = d₀ · M₀ / M(t)
```

Readouts: S(t) = L(t)/d(t)², bare-rock T_eq(t) with the planet's albedo (default 0.3),
zone status, time spent in the conservative zone so far.

**Engulfment.** The planet is destroyed when the star's radius reaches its orbit, R(t) ≥ d(t).
Tidal drag, which pulls planets in before the star reaches them (e.g. Schröder & Smith 2008), is
ignored, so the screen is generous: in this model Earth and Venus survive the Sun's giant phases.
The doc and an info note say so.

**Tidal locking.** Order of magnitude only, for an Earth-like planet (Gladman et al. 1996, with
initial spin 12 h, Q = 100, rigidity μ = 3 × 10¹⁰ N m⁻²):

```
t_lock ≈ 6 × 10¹⁰ yr × (a/m)⁶ (R/m) μ / [ (M★/kg) (m_p/kg)² ]
```

which gives ≈ 13 Myr for TRAPPIST-1 e, ≈ 200 Myr for Proxima b and ≈ 6 Gyr at 0.1 AU from a
0.3 M☉ star. The system view draws the **lock distance** (inside it, an Earth-like planet would
already be locked at the current age) as a dashed circle; the status says "tidally locked" when
age ≥ t_lock(d). The uncertainty is at least a factor of 10.

### Views

- **System view:** star (true radius, so giants visibly swell), optimistic and conservative
  annuli, CHZ, lock circle, planet and orbit; log or linear distance scale.
- **HR diagram** with the full track and the current point.
- **Timeline:** luminosity against age, a strip coloured by the planet's zone status, marks for
  end of main sequence, engulfment, tidal lock, today's Sun (4.6 Gyr) and the age of the
  universe (13.8 Gyr). The time axis is linear with a "zoom to late stages" toggle.
- Playback (play/pause/step, speed) and a draggable age cursor.

**Presets:** Sun with Venus, Earth and Mars (d₀ 0.723, 1.0, 1.524 AU); a 0.3 M☉ red dwarf with a
planet at 0.12 AU; Kepler-442 (0.6 M☉ track, 0.41 AU); Kepler-452 (1.0 M☉ track, 1.05 AU);
a 2 M☉ A star with a planet at 5 AU. Stars snap to the nearest catalog mass.

**Teaching points:** the faint young Sun (Earth's bare-rock T_eq at ZAMS is 236 K, yet geology
shows liquid water); Earth leaves the conservative zone about 1 Gyr from now; a 0.3 M☉ star stays
on the main sequence ~400 Gyr, far longer than the universe's age; a 2 M☉ star lives ~1 Gyr, too
short for complex life as on Earth.

**Simplifications:** solar metallicity; no pre-main-sequence phase (young red dwarfs are much
brighter for hundreds of Myr, which can dry out planets now in their zones; Luger & Barnes
2015); the planet does not change the star; tidal drag on the orbit is ignored.

## 5. Escape

### Molecules versus escape speed

At temperature T, gas molecules of mass m have the Maxwell–Boltzmann speed distribution. The
fastest ones exceed the escape speed and leave. With the most probable speed v_p = √(2kT/m), the
Jeans parameter and the escaping fraction of the distribution are

```
λ = (v_esc / v_p)²
fraction faster than v_esc = erfc(√λ) + 2 √(λ/π) e^(−λ)
```

The screen plots the distribution for the chosen gas and temperature with v_esc marked and the
tail shaded (log scale inset for the tiny tails). The rule of thumb shown is the textbook one: a
gas stays for billions of years if v_esc > 6 v_rms (v_rms = √(3kT/m)), equivalently λ > 54.

**Animation:** molecules leave the surface with speeds drawn from the 3-D Maxwell–Boltzmann
distribution and move radially in the planet's gravity, in units of the planet's radius and
escape speed (r'' = −v_esc²R / (2r²)). Slow ones arc back, those with v ≥ v_esc leave the frame
and are counted. Speeds are exaggerated by a single display factor so typical molecules rise a
visible height; the escaping fraction shown is the analytic one, not the sample count.

**Controls:** gas (H₂, He, H₂O, N₂, O₂, CO₂), temperature (50–3000 K, log), body preset or custom
v_esc (0.5–60 km s⁻¹, log).

**Body presets** use the temperature of the upper atmosphere (exosphere), where escape happens,
when it is known, since it is much hotter than the surface for Earth:

| Body | v_esc (km/s) | T used | Note |
|---|---|---|---|
| Moon | 2.38 | 250 K | surface |
| Mercury | 4.25 | 700 K | day side surface |
| Mars | 5.03 | 250 K | exosphere |
| Venus | 10.36 | 300 K | exosphere (cold) |
| Earth | 11.19 | 1000 K | exosphere |
| Titan | 2.64 | 150 K | exosphere |
| Jupiter | 59.5 | 1000 K | thermosphere |

With these, Earth keeps N₂, O₂ and H₂O but loses H₂ and He (both true), and the Moon loses
everything lighter than CO₂.

Jeans escape is only one route. Mars's thermal escape is too slow to explain its lost air; most of
it went by non-thermal processes (solar-wind stripping, photochemical escape), which is why the
second view uses an empirical line instead.

### The cosmic shoreline

Zahnle & Catling (2017, ApJ 843, 122) noticed that, among solar-system bodies, those with
atmospheres and those without are separated on a plot of escape speed against starlight received
by a line along which S ∝ v_esc⁴. The screen draws it as

```
S_shoreline = (v_esc / 6.5 km s⁻¹)⁴   S⊕
```

a normalisation chosen so that the line passes between Titan (atmosphere) and Ganymede and
Callisto (none) and just above Mars; the published line is drawn by eye in the same way. Bodies
plotted: the eight planets, the Moon, Io, Europa, Ganymede, Callisto, Titan, Triton, Pluto (filled
if they have a substantial atmosphere), plus exoplanets from the snapshot with a **measured** mass
(not estimated from radius) and radius below 4 R⊕, coloured by host star type. The rocky planets
of red dwarfs that JWST has observed (TRAPPIST-1 b and c, LHS 3844 b, GJ 1132 b, GJ 486 b) sit
near or below the line.

**Simplification:** the line uses total starlight. Red dwarfs give their planets a larger share of
high-energy (XUV) radiation, and for much longer, which drives escape; an info note says the line
probably lies higher (worse) for planets of red dwarfs.

## Data and sources

- Planet values: NASA Exoplanet Archive `pscomppars` via ExoplanetsDatabase's frozen snapshot
  (retrieved 2026-11-06); solar-system values: NASA planetary fact sheets.
- Kopparapu et al. 2013, ApJ 765, 131; Kopparapu et al. 2014, ApJL 787, L29.
- Pecaut & Mamajek 2013, ApJS 208, 9 (dwarf-star table, approximate values).
- Hurley, Pols & Tout 2000, MNRAS 315, 543 (tracks, via the NAAP simulator).
- Wagner & Pruss 1993; IAPWS 2011 (water phase boundaries).
- Gladman et al. 1996, Icarus 122, 166 (tidal locking).
- Zahnle & Catling 2017, ApJ 843, 122 (cosmic shoreline).
- Luger & Barnes 2015, Astrobiology 15, 119 (pre-main-sequence water loss).
