# Habitability Lab

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Why can one planet keep liquid water on its surface while another cannot? Students follow the
question from a bare rock warming in starlight, through the greenhouse effect and the pressure water
needs, to the edges of the habitable zone, the way those edges move as a star ages, and whether a
planet can hold on to an atmosphere at all. Real planets from the NASA Exoplanet Archive appear
throughout. For introductory astronomy; pairs with
[Stellar Wobble](https://github.com/OpenLyceum/StellarWobble),
[Transit Hunter](https://github.com/OpenLyceum/TransitHunter) and
[Exoplanets Database](https://github.com/OpenLyceum/ExoplanetsDatabase). Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Energy Balance.** Drag a planet towards or away from its star and change the star's brightness
  and the planet's albedo. Arrows for absorbed, reflected and emitted energy, bars that become
  equal at balance, and a thermometer show the planet warming or cooling, over years, to its
  equilibrium temperature. Mercury, Venus, Earth and Mars presets compare it with the measured
  surface temperature; a "day side only" option shows a planet that does not spread its heat.
- **Greenhouse.** A grey atmosphere of adjustable infrared optical depth warms the surface;
  arrows show the infrared sent back down. The water phase diagram (IAPWS curves) places the
  surface by temperature and pressure: ice, liquid, vapour or supercritical. Presets for Venus,
  Earth, Mars and early Mars.
- **Zone Edges.** The habitable zone of Kopparapu et al. (2013, 2014) on starlight against star
  temperature, with the Solar System, 28 well-known exoplanets (TRAPPIST-1, Proxima b, TOI-700,
  Kepler-452 b, …) and optionally every small planet in the archive. A to-scale top view and a
  planet card for each star; the inner edge for 0.1, 1 or 5 Earth masses; any main-sequence star
  by temperature.
- **Aging Star.** Seventeen stellar evolution tracks (0.3–30 solar masses). The zone moves as the
  star brightens, swells and dies; a continuously habitable zone, the tidal-lock distance and
  engulfment are drawn on a top view, with an HR diagram and a timeline of the planet's status.
- **Escape.** Molecules with Maxwell–Boltzmann speeds rise in a body's gravity; the fastest escape.
  Readouts give the Jeans parameter, the escaping share and which gases each body keeps. A second
  view shows the cosmic shoreline (Zahnle & Catling 2017) with the Solar System and 763 exoplanets.
- **Accessible:**
  - Every control works from the keyboard, including dragging the planet and the age cursor.
  - Each screen has a live screen summary and a keyboard-help dialog.
  - English, French and Spanish.
  - Default and projector colour profiles.
  - A preference (or `?showEquations`) shows the equations behind the readouts.
  - Installable PWA.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run extract-planets` | Rebuild the planet data from ExoplanetsDatabase's archive snapshot |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
Planet data from the NASA Exoplanet Archive and stellar tracks from the NAAP labs; see
[CREDITS.md](CREDITS.md).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
