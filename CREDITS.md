# Credits — Habitability Lab

Habitability of exoplanets for introductory astronomy, written for the
[OpenLyceum](https://github.com/OpenLyceum) fleet with [SceneryStack](https://scenerystack.org/).

## License

GNU Affero General Public License v3.0 or later — see [org LICENSE](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Data

- **Exoplanets.** This research has made use of the NASA Exoplanet Archive, which is operated by the
  California Institute of Technology, under contract with the National Aeronautics and Space
  Administration under the Exoplanet Exploration Program. The planets come from the Planetary
  Systems Composite Parameters table (`pscomppars`) snapshot bundled with
  [ExoplanetsDatabase](https://github.com/OpenLyceum/ExoplanetsDatabase) (retrieved 2026-11-06),
  reduced by `scripts/extract-planets.ts` to `src/common/model/data/planets.json`.
- **Stellar evolution tracks.** The 17-star catalog of the NAAP Circumstellar Habitable Zone
  Simulator (University of Nebraska–Lincoln Astronomy Education), computed with the single-star
  evolution formulae of Hurley, Pols & Tout (2000), as transcribed in
  [HabitableZones](https://github.com/OpenLyceum/HabitableZones).
- **Solar System values.** NASA planetary fact sheets.

## Physics

- Habitable-zone edges: Kopparapu et al. 2013, ApJ 765, 131; Kopparapu et al. 2014, ApJL 787, L29.
- Main-sequence dwarf properties: Pecaut & Mamajek 2013, ApJS 208, 9 (approximate values).
- Water phase boundaries: Wagner & Pruss 1993; IAPWS R14-08 (2011).
- Tidal locking: Gladman et al. 1996, Icarus 122, 166.
- Cosmic shoreline: Zahnle & Catling 2017, ApJ 843, 122 (line normalised by eye, as in the paper).

The full model, with every simplification, is in [doc/model.md](doc/model.md).
