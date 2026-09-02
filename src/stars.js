// Star catalogue and solar-map rendering.
// game knows about, and everything here that is not drawing works out where one of those bodies is: orbital shape, the positions the game loop advances, and the coordinates ships navigate by.
import { global, webWorker } from './vars.js';
import { clearElement } from './functions.js';
import { races, orbitLength } from './races.js';
import { actions } from './actions.js';
import { planetName } from './space.js';
import { unlockFeat } from './achieve.js';
import { createGLContext, webglSupported } from './glmap.js';
import { foeDetected, moveShips, moveTempCoordinates, resolveBody, shipPointAhead, shipRefStar, syndicate, tempCoord, tempOffset, tempParent, venusBlockade } from './truepath.js';
import { loc } from './locale.js';

// Every fixed figure the star table and the solar map are tuned by, gathered in one place. Values
// only — the caches and camera state the map keeps are mutable and live with the code using them.
const starConstants = {
    // --- The gas cow, moon spread and random points ---
    // The gas cow giant
    COW_ID: 'cow_planet',
    COW_GLYPHS: ['\u{1F404}', '\u{1F402}'],
    // Jupiter's size in this table, so it reads as a gas giant next to whatever else the system has.
    COW_SIZE: 0.634,
    AU_PER_LY: 63241.077,

    // --- Map rendering ---
    // Target animation-frame render rate.
    MAP_FPS: 30,
    // Frame-interval tolerance to avoid skipping an otherwise eligible refresh.
    MAP_FRAME_LEAD_MS: 4,
    // Maximum render lead beyond the last simulation step.
    MAP_AHEAD_MAX: 2,
    // Maximum render catch-up speed multiplier.
    MAP_CATCHUP: 3,
    // Re-sync rendering after a larger simulation gap.
    MAP_RESYNC_DAYS: 1,
    // Orbit: outside whatever the star already has, and never closer in than a gas giant belongs.
    COW_ORBIT_CLEAR: 1.8,
    COW_ORBIT_MIN: 2.5,
    // Period per AU^1.5 for a system with nothing else in it to copy. The M dwarfs in the table run
    // about this, which is a star of roughly half a solar mass.
    COW_PERIOD_K: 521,
    MOON_ORBIT_CLEARANCE: 1.4,
    // How far out of the plane a random point may stray by default, as a fraction of its distance from the target.
    RANDOM_COORD_SPREAD: 0.05,

    // --- Orbital shape, the kamikaze world and Kepler ---
    // How elliptical the home planet's orbit is under the `elliptical` planet trait.
    ELLIPTICAL_TRAIT_ECC: 0.2,
    // Two binaries whose components share a barycenter and a period.
    OPPOSITE_OF: {
        gliese570c: 'gliese570b',
        epsilonindibb: 'epsilonindiba',
    },
    // How far the kamikaze world is allowed to fall: the year length it stops shortening at, and the
    // closest approach its orbit may ever reach.
    KAMIKAZE_FLOOR_ORBIT: 100,
    KAMIKAZE_MIN_PERIHELION: 0.25,
    // Reduces chance of visual collision with Venus and Mercury, doesn't eliminate it but without doing something whacky this is as good as it gets.
    KAMIKAZE_INCLINE: -12,
    // Newton's method on Kepler's equation (see eccentricAnomaly): passes allowed, and the residual
    // it settles for.
    KEPLER_STEPS: 8,
    KEPLER_TOL: 1e-10,

    // --- The solar map ---
    // Which way the camera faces by default, as a yaw, for the star the view is settling on.
    SOL_DEFAULT_YAW: Math.PI,
    // Below this scale the map is showing planets as points and planet names give way to star
    // names; at or above it a system's own planets are made out individually.
    planetLabelMinScale: 4,
    // Below this scale the map is showing entire systems as points, with multiple systems potentially on screen and system
    // names becoming cluttered Label sizes stop having constant size, instead decreasing with zoom as the scale further decreases
    systemLabelMinScale: 0.0015,
    // Below this scale the labels' sizes become too small to legibly read; completely stop drawing 
    // them at this point. Instead start displaying star names on hover.
    systemLabelAbsMinScale: 0.0006,
    // Once a system's planets are legible, stars further than this from the point being looked at are skipped — about a
    // light year, so anything cut is at least a quarter of a million pixels off screen at that zoom.
    STAR_CULL_AU: 63000,
    // The player's own limit on how much of the star field is drawn, in light years out from the star being looked at.
    STAR_RANGE_MIN: 10,
    STAR_RANGE_MAX: 50,
    STAR_RANGE_STEP: 5,
    // One step past the maximum is no limit at all — every star in the table, which is how the map behaved before this
    // setting existed.
    STAR_RANGE_INF: -1,
    // Which orbits are drawn. Two flags underneath — planetOrbits and moonOrbits, which the drawing code reads separately —
    // Orbit visibility states for planets and moons.
    ORBIT_STATES: [
        { planets: true,  moons: true,  key: 'solar_map_orbits_all' },
        { planets: true,  moons: false, key: 'solar_map_orbits_planets' },
        { planets: false, moons: true,  key: 'solar_map_orbits_moons' },
        { planets: false, moons: false, key: 'solar_map_orbits_none' },
    ],
    // Which names are drawn, on the same pattern: two flags underneath, three positions on the button.
    NAME_STATES: [
        { planets: true,  stars: true,  key: 'solar_map_show_planet_names' },
        { planets: false, stars: true,  key: 'solar_map_hide_planet_names' },
        { planets: false, stars: false, key: 'solar_map_hide_star_names' },
    ],
    // Rough effective temperatures for the classes the table records — enough to tell a blue-white star from a red dwarf
    // when working out how bright one looks from a distance.
    STAR_TEMP: { O: 35000, B: 18000, A: 8500, F: 6600, G: 5700, K: 4600, KIII: 4100,
                        M: 3200, T: 1300, D: 12000 },
    SUN_TEMP: 5772,
    // Dot radius in screen pixels, faintest to brightest, and the range of apparent brightness those two ends stand for as a
    // base-10 log.
    SKY_MIN_PX: 0.6,
    SKY_MAX_PX: 2.6,
    SKY_LOG_FAINT: -4.5,
    SKY_LOG_BRIGHT: 0,
    // How much of the frame the visible half of the sky covers.
    SKY_RADIUS_FRAC: 0.5,
    // A moon's name is set beside it rather than above it, where its planet is not, and by a fixed
    // number of screen pixels so the gap holds at any zoom.
    MOON_LABEL_GAP_PX: 6,
    // The hover name is drawn in screen space instead, so it is this readable at any zoom.
    HOVER_LABEL_PX: 16,
    // Clearance above the cursor. The name goes above rather than below because the arrow hangs down and to the right of its
    // hotspot, so anything under the pointer ends up behind it.
    HOVER_LABEL_GAP_PX: 8,
    // Trace a body's orbit as a projected polyline. Sampling the same orbitPoint() the body itself is positioned by
    // Sample each orbit with `orbitPoint()` so rings match body positions.
    ORBIT_STEPS: 96,
    // Smallest orbit worth tracing, as a radius in screen pixels.
    ORBIT_MIN_PX: 3,
    // A body closer to its star than this on screen is inside the star's own dot — the star never draws smaller than a
    // one-pixel radius — so it lands on the same pixel and is not drawn at all.
    SYSTEM_MIN_PX: 1,
    // Had to limit ship trails or trips between stars would crash the browser, also in general they caused lag
    TRAIL_MAX_DASHES: 400,
    // Ship markers are drawn at a constant size on screen, in pixels.
    SHIP_DOT_PX: 3,
    SHIP_LABEL_PX: 5,
    // Unanswered distress signals, also sized in screen pixels: they are points in space with no radius
    // to draw, and the pulse is what tells a live signal apart from the scenery around it.
    BEACON_DOT_PX: 3,
    BEACON_HALO_PX: 11,
    BEACON_LABEL_PX: 6,
    BEACON_PULSE_MS: 1600,
    BEACON_COLOR: '0, 255, 102',
    // Bodies are drawn at symbolic sizes, nothing like true scale — 0.1 map units for an M dwarf is some twenty times the
    // real Sun's radius — so around a star with a genuinely close-in world, like Gliese 876 d at 0.021 AU, the disc swallows the orbit whole.
    STAR_ORBIT_CLEARANCE: 0.9,
    // Bodies are drawn at true relative size, which puts Earth at a fifth of a pixel on any zoom that also shows the Sun.
    BODY_SEPARATION_PX: 4,
    // Bisection steps used to pin down where an orbit passes its primary's depth.
    ORBIT_CROSS_STEPS: 12,
    PLANET_TEX: 128,
    // The Sol bodies get their own color and surface rather than the generic pool.
    SOL_BODY_COLOR: {
        spc_home:      '2f6fb5',   // Earth, ocean blue
        spc_moon:      '9d9a93',   // Luna, grey regolith
        spc_hell:      '8a8078',   // Mercury, dark grey-brown
        spc_venus:     'd9b878',   // Venus, pale sulphur cloud
        spc_red:       'b1512c',   // Mars, rust
        // Both are carbonaceous rock, and both are lifted well off their true albedo of about 0.07 —
        // at that they would be all but invisible against the black.
        spc_phobos:    '8b7f72',   // Phobos, dark grey-brown
        spc_deimos:    '96897b',   // Deimos, the same a shade paler
        spc_belt:      '766d64',   // asteroid rubble
        spc_gas:       'c8a172',   // Jupiter, tan
        spc_io:        'd9c15c',   // Io, sulphur yellow
        spc_europa:    'd8cbb4',   // Europa, cracked ice
        spc_gas_moon:  'b0a189',   // Ganymede, dusty ice
        spc_callisto:  '6f6257',   // Callisto, dark cratered rock
        spc_saturn:    'd7c391',   // Saturn, pale gold
        spc_titan:     'c8791f',   // Titan, orange haze
        spc_enceladus: 'e6f1f5',   // Enceladus, clean ice
        spc_uranus:    'a5d9de',   // Uranus, pale cyan
        spc_titania:   '8d8177',   // Titania, grey-brown ice
        spc_oberon:    '7d6f66',   // Oberon, darker and redder, the most cratered of the pair
        spc_neptune:   '3a5ec4',   // Neptune, deep blue
        spc_triton:    'd6c4c0',   // Triton, pink-grey ice
        spc_pluto:     'c8a582',   // Pluto, buff tan
        spc_haumea:    'e6e8ec',   // Haumea, bright water ice — one of the most reflective bodies known
        spc_makemake:  'c68a66',   // Makemake, red methane frost
        spc_eris:      'c6c6d0',   // Eris, dirty ice
    },
    // The Sol bodies the map draws purely as scenery.
    SOL_BODY_LABEL: {
        spc_venus:     'venus',
        spc_saturn:    'saturn',
        spc_uranus:    'uranus',
        spc_neptune:   'neptune',
        spc_io:        'io',
        spc_europa:    'europa',
        spc_callisto:  'callisto',
        spc_titania:   'titania',
        spc_oberon:    'oberon',
        spc_pluto:     'pluto',
        spc_haumea:    'haumea',
    },
    // Surface treatment per body. Anything not named here falls back to the generic pool below.
    SOL_BODY_STYLE: {
        spc_home: 'earth',      spc_moon: 'cratered',   spc_hell: 'cratered',
        spc_venus: 'venus',     spc_red: 'mars',        spc_gas: 'jupiter',
        spc_io: 'venus',        spc_europa: 'ice',      spc_callisto: 'cratered',
        spc_gas_moon: 'cratered', spc_saturn: 'saturn', spc_titan: 'haze',
        spc_enceladus: 'ice',   spc_uranus: 'icegiant', spc_neptune: 'neptune',
        spc_titania: 'cratered', spc_oberon: 'cratered',
        spc_phobos: 'moonlet',  spc_deimos: 'moonlet',
        spc_triton: 'ice',      spc_dwarf: 'cratered',  spc_eris: 'ice',
        spc_pluto: 'ice',       spc_haumea: 'ice',      spc_makemake: 'cratered',
    },
    // The homeworld biomes.
    BIOME_LOOK: {
        grassland: { color: '7fa650', style: 'bio_grassland' },   // open plains
        oceanic:   { color: '2f6fb5', style: 'bio_oceanic'   },   // the familiar blue marble
        forest:    { color: '3d7a3f', style: 'bio_forest'    },   // unbroken canopy
        desert:    { color: 'd4ae66', style: 'bio_desert'    },   // sand
        volcanic:  { color: '8c4632', style: 'bio_volcanic'  },   // basalt and vents
        tundra:    { color: 'b3c4cc', style: 'bio_tundra'    },   // frozen ground
        savanna:   { color: 'c6a651', style: 'bio_savanna'   },   // dry grass
        swamp:     { color: '5e6b3c', style: 'bio_swamp'     },   // murky wetland
        ashland:   { color: '8b8781', style: 'bio_ashland'   },   // grey ash
        taiga:     { color: '5d7a63', style: 'bio_taiga'     },   // boreal forest
        hellscape: { color: '7d2b1c', style: 'bio_hellscape' },   // burning crust
        eden:      { color: '4fae72', style: 'bio_eden'      },   // paradise
    },
    // Styles that describe one specific world rather than a class of them, so they get a single texture each instead of a
    // pool of random variants.
    NAMED_STYLES: ['earth','mars','venus','jupiter','saturn','icegiant','neptune','haze','ice','cratered'],
    // Sphere texture recipe fields used by the surface rasterizer.
    // replacing base — [degrees, r, g, b] with the color interpolated between banded stretches the noise along latitude, so it flows with the bands instead of mottling across mottle [amount, frequency, octaves, r,g,b] drift toward a color, driven by noise land [threshold, freq, octaves, r,g,b, sharpness] continents where the noise runs high craters [amount, frequency] cracks [amount, frequency, r,g,b] poles [from latitude, strength, r,g,b] clouds [amount, frequency, octaves] glow [amount, frequency, r,g,b] added after the shading, so it survives the night side spot an oval fixed at a latitude and longitude on the surface
    SPHERE_STYLES: {
        jupiter: { bands: [
            [-90,0x8a,0x77,0x66],[-75,0x9d,0x86,0x70],[-62,0xc4,0xa8,0x85],[-50,0xe6,0xd7,0xba],
            [-42,0xa9,0x6f,0x45],[-33,0xf1,0xe6,0xcf],
            // South Tropical Zone: pale, and the setting the Great Red Spot sits in. That contrast is
            // most of what makes the spot visible at all.
            [-26,0xf3,0xe8,0xd2],[-18,0xee,0xdf,0xc4],
            [-12,0x8c,0x4b,0x2e],[-7,0x7f,0x41,0x28],      // South Equatorial Belt
            [0,0xdc,0xb2,0x7c],[6,0xef,0xdb,0xb4],
            [13,0x87,0x49,0x2c],[19,0x8d,0x4e,0x31],       // North Equatorial Belt
            [26,0xd8,0xb4,0x86],[33,0xf2,0xe6,0xcc],[42,0xac,0x82,0x59],[54,0xdb,0xc7,0xa8],
            [68,0xb0,0x9b,0x82],[80,0x8b,0x79,0x66],[90,0x7c,0x6b,0x5a]],
            spot: { lat:-22, lon:270, halfLon:20, halfLat:12, r:0xc0, g:0x50, b:0x30 },
            mottle: [0.16, 9, 3, 0xff, 0xf0, 0xd8], banded: true },
        saturn: { bands: [
            [-90,0x9a,0x8a,0x70],[-70,0xbe,0xac,0x86],[-45,0xe4,0xd2,0xa8],[-25,0xd2,0xba,0x8c],
            [-8,0xf0,0xe2,0xbe],[8,0xe8,0xd6,0xac],[25,0xd6,0xc0,0x92],[45,0xe6,0xd6,0xae],
            [70,0xc2,0xae,0x8a],[90,0x9e,0x8e,0x74]],
            mottle: [0.10, 8, 3, 0xff, 0xf4, 0xdc], banded: true },
        icegiant: { bands: [
            [-90,0x9e,0xc9,0xd6],[-50,0xa9,0xd8,0xe4],[0,0xbd,0xe6,0xef],[50,0xa9,0xd8,0xe4],[90,0x9e,0xc9,0xd6]],
            mottle: [0.07, 6, 3, 0xff, 0xff, 0xff], banded: true },
        neptune: { bands: [
            [-90,0x2a,0x46,0x9c],[-45,0x36,0x58,0xba],[0,0x46,0x6e,0xd6],[45,0x36,0x58,0xba],[90,0x2a,0x46,0x9c]],
            spot: { lat:-28, lon:200, halfLon:26, halfLat:9, r:0x18, g:0x2c, b:0x74 },
            mottle: [0.12, 7, 3, 0xda, 0xe8, 0xff], banded: true },
        gas: { bands: [
            [-90,0xa8,0x92,0x74],[-45,0xc6,0xae,0x8a],[0,0xdc,0xc6,0x9e],[45,0xc6,0xae,0x8a],[90,0xa8,0x92,0x74]],
            mottle: [0.14, 8, 3, 0xff, 0xf0, 0xd4], banded: true },
        venus:  { base: [0xd9,0xb8,0x78], mottle: [0.16, 4, 4, 0xf4, 0xdc, 0xa8], banded: true },
        haze:   { base: [0xc8,0x79,0x1f], mottle: [0.13, 3, 3, 0xe8, 0xa0, 0x48], banded: true },
        mars:   { base: [0xb1,0x51,0x2c], mottle: [0.34, 3.2, 4, 0x6a, 0x33, 0x22],
                  craters: [0.16, 9], poles: [62, 0.85, 0xf2, 0xf2, 0xf6] },
        earth:  { base: [0x1c,0x4f,0x8f], land: [0.52, 2.6, 5, 0x3f, 0x7a, 0x3c, 7],
                  mottle: [0.10, 5, 3, 0x2f, 0x6f, 0xb5], poles: [66, 0.9, 0xf4, 0xf8, 0xfc],
                  clouds: [0.42, 3.4, 4] },
        cratered:{ base: [0x9d,0x9a,0x93], mottle: [0.26, 3.5, 4, 0x5e, 0x5a, 0x54], craters: [0.55, 7] },
        ice:    { base: [0xd8,0xcb,0xb4], mottle: [0.16, 4, 3, 0xa8, 0x9c, 0x8c],
                  cracks: [0.5, 6, 0x8a, 0x6a, 0x52], poles: [70, 0.5, 0xff, 0xff, 0xff] },
        rock:   { base: [0x8a,0x7e,0x70], mottle: [0.30, 4, 4, 0x54, 0x4a, 0x40], craters: [0.28, 8] },
        moonlet:{ base: [0x8b,0x7f,0x72], mottle: [0.34, 5, 4, 0x4a,0x42,0x3a],
                  craters: [0.55, 3.1,  0.40, 8,  0.26, 19] },
        belt:   { base: [0x76,0x6d,0x64], mottle: [0.40, 7, 4, 0x42, 0x3c, 0x36], craters: [0.45, 12] },
        bio_oceanic:  { base: [0x1b,0x4d,0x8c], land: [0.66, 2.4, 5, 0x3f,0x7a,0x3c, 7],
                        poles: [70, 0.85, 0xf4,0xf8,0xfc], clouds: [0.4, 3.4, 4] },
        bio_grassland:{ base: [0x7f,0xa6,0x50], mottle: [0.28, 3, 4, 0x4e,0x6e,0x33],
                        poles: [72, 0.6, 0xf0,0xf4,0xf8], clouds: [0.3, 3.4, 4] },
        bio_forest:   { base: [0x3d,0x7a,0x3f], mottle: [0.30, 3.4, 4, 0x1f,0x46,0x24],
                        poles: [74, 0.5, 0xf0,0xf4,0xf8], clouds: [0.32, 3.2, 4] },
        bio_desert:   { base: [0xd4,0xae,0x66], mottle: [0.30, 3.2, 4, 0x9a,0x74,0x3c],
                        clouds: [0.12, 3.4, 3] },
        bio_volcanic: { base: [0x8c,0x46,0x32], mottle: [0.34, 3.6, 4, 0x3a,0x24,0x20],
                        glow: [0.55, 5.5, 0xff,0x8a,0x30] },
        bio_tundra:   { base: [0xb3,0xc4,0xcc], mottle: [0.24, 3.4, 4, 0x76,0x86,0x92],
                        poles: [50, 0.85, 0xff,0xff,0xff], clouds: [0.3, 3.4, 4] },
        bio_savanna:  { base: [0xc6,0xa6,0x51], mottle: [0.28, 3, 4, 0x8a,0x6e,0x30],
                        poles: [76, 0.4, 0xf0,0xf4,0xf8], clouds: [0.22, 3.4, 3] },
        bio_swamp:    { base: [0x5e,0x6b,0x3c], mottle: [0.34, 3.2, 4, 0x33,0x40,0x26],
                        clouds: [0.36, 3.0, 4] },
        bio_ashland:  { base: [0x8b,0x87,0x81], mottle: [0.30, 3.6, 4, 0x4e,0x4a,0x46],
                        clouds: [0.26, 3.2, 3] },
        bio_taiga:    { base: [0x5d,0x7a,0x63], mottle: [0.28, 3.4, 4, 0x2e,0x44,0x36],
                        poles: [58, 0.8, 0xff,0xff,0xff], clouds: [0.3, 3.2, 4] },
        bio_hellscape:{ base: [0x7d,0x2b,0x1c], mottle: [0.36, 4, 4, 0x2a,0x14,0x10],
                        glow: [0.85, 6, 0xff,0x6a,0x1a] },
        bio_eden:     { base: [0x4f,0xae,0x72], land: [0.45, 2.6, 5, 0x2f,0x86,0x54, 6],
                        poles: [76, 0.5, 0xf6,0xfa,0xff], clouds: [0.34, 3.4, 4] },
    },
    // Axial tilt in degrees and rotation period in hours; a negative period turns the other way.
    SPIN_DATA: {
        spc_hell:   { tilt: 0.03,   hours: 1407.6 },
        spc_venus:  { tilt: 177.36, hours: -5832.5 },
        spc_home:   { tilt: 23.44,  hours: 23.934 },
        spc_moon:   { tilt: 6.68,   hours: 655.7 }, // tidally locked, so its day is its month
        spc_red:    { tilt: 25.19,  hours: 24.623 },
        spc_phobos: { tilt: 0,      hours: 7.654 }, // tidally locked, so its day is its orbit
        spc_deimos: { tilt: 0,      hours: 30.299 }, // tidally locked, so its day is its orbit
        spc_gas:    { tilt: 3.13,   hours: 9.925 },
        spc_io:     { tilt: 0,      hours: 42.5 },
        spc_europa: { tilt: 0.1,    hours: 85.2 },
        spc_gas_moon:{tilt: 0.33,   hours: 171.7 },
        spc_callisto:{tilt: 0,      hours: 400.5 },
        spc_saturn: { tilt: 26.73,  hours: 10.56 },
        spc_titan:  { tilt: 0,      hours: 382.7 },
        spc_enceladus:{tilt: 0,     hours: 32.9 },
        spc_uranus: { tilt: 97.77,  hours: -17.24 },
        spc_titania:{ tilt: 0,      hours: 208.9 },
        spc_oberon: { tilt: 0,      hours: 323.1 },
        spc_neptune:{ tilt: 28.32,  hours: 16.11 },
        spc_triton: { tilt: 0,      hours: -141.0 },
        spc_pluto:  { tilt: 122.53, hours: -153.3 },
        spc_haumea: { tilt: 0,      hours: 3.92 },       // the fastest large body in the solar system
        spc_makemake:{tilt: 0,      hours: 22.83 },
        spc_eris:   { tilt: 0,      hours: 379.1 },
        spc_dwarf:  { tilt: 4,      hours: 9.07 },       // Ceres
    },
    // Rotation runs at a tenth of true rate.
    SPIN_SCALE: 0.1,
    // Rendered at the size it will be drawn at, rounded up to one of these, so a small body costs a
    // fraction of a large one. Nothing above 128: past that the disc is being scaled up anyway.
    SPHERE_SIZES: [32, 64, 128],
    // Below this a disc is too small to tell a lit sphere from a stamp, and not worth the render.
    SPHERE_MIN_PX: 8,
    // Camera and rotation angles are quantised before they key the cache, so nudging the view — or a
    // slow rotation — does not throw the render away.
    SPHERE_ANGLE_STEP: 2 * Math.PI / 180,
    SPHERE_SPIN_STEP: 3,
    SPHERE_CACHE_MAX: 64,
    // A star at high detail.
    SPHERE_STAR_SIZES: [384, 512],
    // The flat texture's radial gradient as a curve: 1.55 at the centre, 1.12 at half way, 1.0 at 0.88,
    // 0.7 at the limb. Read through hexShade's rule, where above 1 lightens toward white rather than multiplying 
    STAR_STOPS: [[0, 1.55], [0.5, 1.12], [0.88, 1.0], [1, 0.7]],
    // The corona around that disc: 0.34 opaque at the limb, falling straight to 0.1 by a fifth of the way out and then away
    // as a power curve to nothing at the edge.
    CORONA_LIMB_ALPHA: 0.34,
    CORONA_KNEE: 0.22,
    CORONA_KNEE_ALPHA: 0.1,
    CORONA_FALL: 1.6,
    CORONA_STEPS: 8,
    // Surfaces are drawn from a small pool rather than one per body: a texture is a megabyte-scale canvas, and there are
    // well over a hundred bodies on the map.
    PLANET_VARIANTS: 8,
    STAR_TEX: 256,
    // Fraction of the texture's half-width taken up by the star's disc; the rest is corona.
    STAR_CORE: 0.5,
    // Glyphs engraved around the gate's ring. Constellation and planetary symbols, matching the astrological signs the game
    // already renders in the top bar — so this set is known to display here.
    GATE_GLYPHS: ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎','☉︎','☽︎','☿︎','♀︎','♂︎','♃︎','♄︎','♅︎','♆︎'],
    // The value is chosen for Saturn's real 26.7 degrees.
    RING_TILT: 26.7 * Math.PI / 180,
    // Points per half ring.
    RING_HALF_STEPS: 48,
    // How dark the ring goes where the planet's shadow falls on it.
    SHADOW_SHADE: 0.3,
    // The shadow's edge is not a hard line, and it should not be drawn as one.
    PEN_STEPS: 5,
    PEN_CORE: 0.86,
    PEN_EDGE: 1.10,
    RING_BANDS: [
        [1.11, 1.24, 0.10],   // D + inner C
        [1.24, 1.52, 0.22],   // C
        [1.52, 1.75, 0.62],   // B, the bright one
        [1.75, 1.95, 0.50],   // outer B
        // 1.95 - 2.03 Cassini division
        [2.03, 2.22, 0.38],   // A
        // 2.22 - 2.24 Encke gap
        [2.24, 2.27, 0.30],   // outer A
        [2.32, 2.34, 0.12],   // F, a thin thread
    ],
    // Radii are in planet radii and are the real ones. Built once, on first use, so the wiki bundle
    // never pays for it and Low never touches it.
    RING_HI_BANDS: 96,
    // A rock only pulls itself round if it is big enough for its own gravity to win, and Phobos and Deimos are nowhere near
    // it.
    LUMP_STEPS: 40,
    // Entries in the outline table the rasteriser reads. At 128 across, the widest a body is drawn, the
    // rim spans about 400 pixels, so this is finer than the thing it is cutting.
    LUMP_LUT: 512,
    // Harmonic, amplitude. A polar curve r = 1 + a*cos(k*theta) stays convex while its curvature, r^2 + 2r'^2 - r*r'', holds
    // non-negative; at the tightest point that comes out as a <= 1/(k^2 + 1).
    LUMP_HARMONICS: [[2, 0.115], [3, 0.022], [4, 0.003]],
    // The lit side is built from a few nested fills, each smaller, lighter and pushed a little further toward the sun.
    LUMP_SHADE_STEPS: 5,
    LUMP_LIT_OFFSET: 0.30,
    LUMP_LIT_SHADE: 1.4,
    LUMP_DARK_SHADE: 0.6,
    // Debris field left by a shattered world.
    DEBRIS_ALONG: 2.6,     // reach along the orbit, as a multiple of the world's old radius
    DEBRIS_ACROSS: 0.55,   // ...out across it, in the orbital plane
    DEBRIS_THICK: 0.30,    // ...and above and below that plane
    // Piece size, likewise. Cubing the roll gives a few big fragments among a great many small ones.
    DEBRIS_MIN: 0.06,
    DEBRIS_MAX: 0.34,
    // The field answers to the map's surface-detail setting, the same as every other body.
    DEBRIS_ROCKS_HIGH: 22,
    DEBRIS_ROCKS_LOW: 9,
    // Dust too fine to draw as rock.
    DEBRIS_DUST: 6,
    DEBRIS_DUST_ALPHA: 0.09,
    // Below this a piece is drawn as a plain dot rather than a shaped silhouette (see drawRocks).
    ROCK_DOT_PX: 2,
    // A dot is drawn lit rather than shaded. LUMP_DARK_SHADE is the *unlit* side of a
    // silhouette, which only makes sense while there is a lit side beside it to read against.
    ROCK_DOT_SHADE: 1.25,
    // Below this the whole field is a couple of pixels, where one mark reads better than twenty
    // sub-pixel ones — the same threshold the surface textures give up at.
    DEBRIS_MIN_PX: 2.5,
    // Asteroid-field settings: count, low-detail count, spread, and rock size.
    // the belt thins rather than moves width how far the ring spreads either side of the nominal orbit, as a fraction of its radius thick ...and above and below the orbital plane, likewise size piece radius, as a multiple of the radius the body standing for the belt is drawn at
    ASTEROID_FIELDS: {
        spc_belt: { rocks: 120, keep: 45, width: 0.17, thick: 0.05, size: [0.16, 0.85] },
        tau_roid: { rocks: 120, keep: 45, width: 0.17, thick: 0.05, size: [0.16, 0.85] }
    },
    // Every rock in a field carries a rasterised surface on the high setting.
    ROCK_FACES: 6,
    // The light is bucketed by where it lies on screen — this many steps around, this many across — rather than by its
    // components, which bounds the count however the field is laid out.
    ROCK_LIGHT_AZ: 8,
    ROCK_LIGHT_EL: 3,
    // Rubble is never the thing being examined, so it is not worth a full-sized render.
    ROCK_TEX_MAX: 64,
    // Faces are keyed on a fixed camera step, and keep their size while the camera moves, rather than following the two
    // things a planet's surface does to go easier on a drag.
    ROCK_ANGLE_STEP: 6 * Math.PI / 180,
    // Rock faces get a cache of their own, so a field cannot evict the planets' surfaces and the planets cannot evict the
    // field.
    ROCK_CACHE_MAX: 512,
    // New rock faces allowed per frame. A rock whose face is not rendered yet is drawn as a plain silhouette and another
    // frame is asked for, so arriving at a fresh view fills the faces in over the following second instead of stalling on the frame that got there.
    ROCK_TEX_BUDGET: 2,
    // The ring has to be this many pixels in radius before its rocks are worth drawing individually.
    FIELD_MIN_RING_PX: 60,
    // Asteroids are drawn at the same true relative scale as everything else, which puts them far under a pixel at any zoom
    // Keep asteroids visible at low zoom without exceeding texture limits.
    FIELD_MIN_ROCK_PX: 1.25,
    // Rate the beacons pulse at
    BEACON_FPS: 12,

    // Procedural Systems
    STAR_MASS: { O: 25, B: 8, A: 2.1, F: 1.3, G: 1.0, K: 0.75, KIII: 1.2, M: 0.35, D: 0.6, T: 0.05 },
    // Procedural-system rules: planet counts, odds, inner limits, and giant constraints.
    // any planets at all, before min/max is rolled weights [chance, count] pairs, used instead of min/max where the spread is not flat innerAU nothing closer in than this, whatever the habitable zone says giants 'outer' gas giants only beyond the snow line, which is the ordinary arrangement 'lone' at most one, and only as the outermost world 'grand' as 'outer', plus a guaranteed massive giant with a family of moons 'none' rocky worlds only
    SYSTEM_RULES: {
        // Red dwarfs: often barren, and a gas giant out at the edge is the exception rather than the rule.
        M:    { min: 0, max: 3, giants: 'lone', giantOdds: 0.2 },
        // The classes that make proper systems — rocky worlds close in, gas giants beyond the snow line.
        K:    { min: 3, max: 8, giants: 'outer' },
        G:    { min: 3, max: 8, giants: 'outer' },
        F:    { min: 3, max: 8, giants: 'outer' },
        // Bright, short-lived and massive: fewer worlds, but one of them is a giant with real moons.
        A:    { min: 2, max: 5, giants: 'grand' },
        B:    { min: 1, max: 3, giants: 'outer' },
        // Blue giants almost never keep a system; the few that do keep very little of one.
        O:    { weights: [[0.8, 0], [0.1, 1], [0.1, 2]], giants: 'outer' },
        // A red giant has swollen out over its own inner system and eaten it, so what is left orbits
        // well clear of the star.
        KIII: { min: 1, max: 4, giants: 'outer', innerAU: 2 },
        // A white dwarf is the exposed core of a star that already destroyed most of what it had, and
        // a brown dwarf barely managed a system in the first place. Either may have kept one survivor.
        D:    { odds: 0.3, min: 1, max: 1, giants: 'none' },
        T:    { odds: 0.3, min: 1, max: 1, giants: 'none' },
    },
    // Chance of an asteroid belt. Blue giants are excluded outright — see systemBelt.
    BELT_ODDS: 0.1,
    // A companion star bounds what its primary can hold on to: anything much beyond a third of the
    // separation is not a stable orbit. Applied against the nearest other star in the table.
    COMPANION_SAFE_FRACTION: 1 / 3,
    // Orbits are laid out as a geometric progression — each one this many times the last, jittered —
    // which is roughly how real systems space themselves.
    ORBIT_RATIO: [1.4, 2.1],
    // A body orbiting a catalogued star rides a stretched, off-centre circle rather than a true ellipse (see orbitPoint), so
    // how far it reads from its star runs between two fractions of its recorded distance.
    SYS_ORBIT_STRETCH: 1.2,
    SYS_ORBIT_SHIFT: 1 / 3,
    // Where the innermost world sits, as a fraction of the habitable zone's inner edge.
    INNER_EDGE: [0.25, 0.7],
    // Body radii, in the table's own units (0.191 is Earth, 0.376 Neptune, 0.634 Jupiter).
    SIZE_ROCKY: [0.10, 0.30],
    SIZE_GAS: [0.35, 0.70],
    SIZE_GRAND: [0.65, 0.80],
    SIZE_MOON: [0.03, 0.13],
    SIZE_BELT: [0.05, 0.09],
    // Moons: how many a world of each sort may keep. A rocky world rarely holds more than a capture
    // or two; a gas giant runs a system of its own.
    MOONS_ROCKY: [0, 2],
    MOONS_GAS: [0, 4],
    MOONS_GRAND: [3, 5],
    // Chance a rocky world has any moons at all. Gas giants always do.
    MOON_ODDS_ROCKY: 0.35,
    // Where a planet's moons sit, measured in that planet's own radii rather than in AU — a gas giant's family belongs much
    // further out in absolute terms than a rocky world's, and a fixed span in AU put moons inside the larger planets.
    MOON_FIRST_RADII: [4, 12],
    MOON_MAX_RADII: 60,
    MOON_GAP: [1.4, 2.2],
    // A world only holds on to what is well inside its Hill sphere — past about half of it a prograde moon is pulled off by
    // the star — so this is the real outer limit, and MOON_MAX_RADII only the cosmetic one.
    HILL_FRACTION: 0.4,
    // The closest in a moon may sit, and the least each orbit may be past the one inside it.
    MOON_MIN_RADII: 2.5,
    MOON_GAP_MIN: 1.25,
    // Moon orbits are drawn exaggerated so they clear their planet's disc (see moonSpread), and that exaggeration is what
    // has to be kept in bounds: what fits comfortably in reality can still be *drawn* across the orbit next door or straight through the star.
    MOON_ROOM_FRACTION: 0.75,
    // Earth's radius in AU, for turning a recorded size into a real one.
    EARTH_RADIUS_AU: 4.2635e-5,
    // A planet's axial tilt in degrees. Its moons ride its equator and so share it, and its rings sit in that same plane —
    // which is why Saturn's rings and its moons agree in the table.
    PLANET_TILT: [0, 35],
    // How far off the plane of its system a world orbits, in degrees, and how often.
    INC_FLAT: [0, 6],
    INC_MODERATE: [10, 30],
    INC_STEEP: [30, 50],
    INC_RETRO: [110, 160],
    ODDS_MODERATE: 0.10,
    ODDS_STEEP: 0.03,
    ODDS_RETRO: 0.008,
    // Retrograde moons are the less unusual of the two: Neptune has one, and it is the only large
    // moon in the solar system that does.
    MOON_ODDS_RETRO: 0.04,
    // An inclined orbit belongs to the outer system — something scattered is scattered outward — so the odds above are
    // scaled by where the orbit sits against the snow line, from a fraction of them close in to rather more than them far out.
    INC_INNER: 0.3,
    INC_OUTER: 1.7,
    // How far a moon may stray from its planet's equatorial plane.
    MOON_INC_SCATTER: 1.5,
    // Chance a ring system is wildly off its planet's equator instead of sitting in it — something
    // captured or knocked askew rather than formed in place.
    RING_OFF_AXIS_ODDS: 0.1,
    RING_OFF_AXIS: [40, 85],
    // Turning a body's recorded size into a mass, for the moon periods that follow from it.
    EARTH_SIZE: 0.191,
    EARTH_MASS_SOLAR: 3.0e-6,
    GIANT_RADII: 11.0,
    GIANT_MASSES: 318,
    GIANT_MASS_EXP: 2.4,
    // How much of what a system is made of varies from star to star. A multiplier on a solar
    // baseline, drawn per resource, and skewed by the star's own metallicity.
    ELEMENT_SPREAD: [0.35, 2.4],
    // What a system's composition is reported in. Nothing reads this yet.
    ELEMENTS: ['Iron','Copper','Aluminium','Titanium','Iridium','Uranium','Neutronium','Helium_3','Elerium','Adamantite','Orichalcum'],
};

// Read off entries above, so they are filled in once the table exists.
starConstants.COW_MIN_SOL = 10 * starConstants.AU_PER_LY;
starConstants.COW_MIN_TAU = 5 * starConstants.AU_PER_LY;
// How close and how far a body on a star-centred orbit reads from its star, per AU of recorded distance.
function sysOrbitExtreme(pick){
    let r = false;
    for (let i = 0; i < 720; i++){
        const rad = i * Math.PI / 360;
        const at = Math.hypot(Math.cos(rad) * starConstants.SYS_ORBIT_STRETCH + starConstants.SYS_ORBIT_SHIFT, Math.sin(rad));
        r = r === false ? at : pick(r, at);
    }
    return r;
}
starConstants.SYS_ORBIT_MIN = sysOrbitExtreme(Math.min);
starConstants.SYS_ORBIT_MAX = sysOrbitExtreme(Math.max);
// Every biome surface is a named style too: there is only ever one home world, so there is nothing
// for a pool of random variants to tell apart.
starConstants.NAMED_STYLES = starConstants.NAMED_STYLES.concat(Object.values(starConstants.BIOME_LOOK).map(b => b.style));

// Stars (entries with a `startype`) are placed by fixed x,y,z coordinates — in AU, measured from the Sun at the origin —
// rather than by a distance + orbital angle.
export const starData = {
    spc_sun: { hex: 'c3b', x: 0, y: 0, z: 0, dist: 0, orbit: 0, size: 2, startype: 'G', label: loc('star_sun'), zlabel: loc('star_sun') },
    // `gate` draws it on the solar map as an open ring rather than a world (see drawGate).
    // An artificial structure still has to obey Kepler: 60 days is the period of anything at 0.3 AU.
    spc_sun_gate: { dist: 0.3, orbit: 60, size: 0.1, belt: true, gate: true, inc: 0, ecc: 0 },
    spc_home: { dist: 1, orbit: -1, size: 0.191, hz: true, inc: 0, ecc: 0.0167 },
    spc_moon: { dist: 0.00257, orbit: 27.32, size: 0.1, moon: true, parent: 'spc_home', inc: 5.14 },
    spc_red: { dist: 1.524, orbit: 687, size: 0.14, hz: true, inc: 1.85, ecc: 0.0934 },
    // Mars's two captured rocks. We call them moons but really they are asteroids that got stuck in orbit.
    spc_phobos: { dist: 0.0000627, orbit: 0.31891, size: 0.008, moon: true, parent: 'spc_red', inc: 25.2, lumpy: true },
    spc_deimos: { dist: 0.00015684, orbit: 1.26244, size: 0.006, moon: true, parent: 'spc_red', inc: 25.2, lumpy: true },
    spc_hell: { dist: 0.387098, orbit: 88, size: 0.118, inc: 7, ecc: 0.2056 },
    spc_venus: { dist: 0.723332, orbit: 225, size: 0.187, inc: 3.4, ecc: 0.0068 },
    spc_gas: { dist: 5.203, orbit: 4330, size: 0.634, inc: 1.3, ecc: 0.0489 },
    // The Galilean moons, in order out from Jupiter.
    spc_io: { dist: 0.002819, orbit: 1.769, size: 0.102, moon: true, parent: 'spc_gas', inc: 1.35 },
    spc_europa: { dist: 0.004486, orbit: 3.551, size: 0.095, moon: true, parent: 'spc_gas', inc: 1.77 },
    spc_gas_moon: { dist: 0.007155, orbit: 7.155, size: 0.123, moon: true, parent: 'spc_gas', inc: 1.5 },
    spc_callisto: { dist: 0.012585, orbit: 16.689, size: 0.118, moon: true, parent: 'spc_gas', inc: 1.49 },
    // The belt stands for a population rather than a body, so its distance, period and eccentricity
    // are representative of the main belt rather than of any one rock.
    spc_belt: { dist: 2.7, orbit: 1620, size: 0.054, belt: true, inc: 10, ecc: 0.08 },
    spc_dwarf: { dist: 2.77, orbit: 1682, size: 0.052, inc: 10.6, ecc: 0.0785 },
    spc_saturn: { dist: 9.539, orbit: 10751, size: 0.579, inc: 2.5, rings: true, ecc: 0.0565 },
    // Saturn's moons ride its equatorial plane, which its axial tilt carries some 27 degrees off the reference plane — the same plane the rings sit in.
    spc_titan: { dist: 0.008168, orbit: 15.945, size: 0.122, moon: true, parent: 'spc_saturn', inc: 27 },
    spc_enceladus: { dist: 0.001591, orbit: 1.37, size: 0.038, moon: true, parent: 'spc_saturn', inc: 27 },
    spc_uranus: { dist: 19.2184, orbit: 30660, size: 0.382, inc: 0.77, ecc: 0.0457 },
    // Uranus's two largest moons. They ride its equatorial plane, and Uranus is tipped on its side 
    spc_titania: { dist: 0.0029139, orbit: 8.7062, size: 0.067, moon: true, parent: 'spc_uranus', inc: 97.8 },
    spc_oberon: { dist: 0.0039006, orbit: 13.4632, size: 0.066, moon: true, parent: 'spc_uranus', inc: 97.8 },
    spc_neptune: { dist: 30.08, orbit: 60152, size: 0.376, inc: 1.77, ecc: 0.0086 },
    // Triton is retrograde and steeply inclined — the one moon here whose orbit is nothing like its planet's plane.
    spc_triton: { dist: 0.002371, orbit: 5.877, size: 0.088, moon: true, parent: 'spc_neptune', inc: 130 },
    // The dwarf planets of the Kuiper belt.
    spc_pluto: { dist: 39.482, orbit: 90560, size: 0.083, inc: 17.16, ecc: 0.2488 },
    spc_haumea: { dist: 43.116, orbit: 103775, size: 0.067, inc: 28.21, ecc: 0.195 },
    spc_makemake: { dist: 45.43, orbit: 111843, size: 0.064, inc: 28.98, ecc: 0.161 },
    spc_eris: { dist: 68, orbit: 204060, size: 0.082, inc: 44, ecc: 0.436 },
    // Tau Ceti system. Planets orbit the tauceti star (star: 'tauceti') rather than the Sun,
    // Tau Ceti (G-type): 753,314.5 AU from the Sun (11.91 ly).
    tauceti: { hex: 'c53', x: -213157.815, y: 25792.379, z: -722067.292, dist: 753314.5, orbit: -2, size: 1.778, startype: 'G', label: loc('star_tauceti'), zlabel: loc('star_tauceti') },
    tau_home: { dist: 0.5, orbit: 129, size: 0.296, star: 'tauceti', unlock: 'tau_home', hz: true, inc: 0 },
    tau_red: { dist: 1.24, orbit: 504, size: 0.234, star: 'tauceti', unlock: 'tau_red', hz: true, inc: 2.2 },
    tau_gas: { dist: 5.6, orbit: 4839, size: 0.635, star: 'tauceti', unlock: 'tau_gas', inc: 1.5 },
    tau_gas2: { dist: 8.2, orbit: 8576, size: 0.574, star: 'tauceti', unlock: 'tau_gas2', inc: 2.8 },
    tau_roid: { dist: 15, orbit: 21217, size: 0.234, star: 'tauceti', belt: true, unlock: 'tau_roid', inc: 9 },
    // Epsilon Eridani (K-type): 664,133.6 AU from the Sun (10.50 ly).
    eridani: { hex: '191', x: -427082.379, y: -121211.607, z: -493945.105, dist: 664133.6, orbit: -2, size: 1.72, startype: 'K', label: loc('star_eridani'), zlabel: loc('star_eridani') },
    // Gliese 65 (M-type): 560,941.3 AU from the Sun (8.87 ly).
    // The map carried only BL Cet; UV Cet joins it below, so this is component A now.
    gliese65: { hex: 'd2e', x: -138124.928, y: 10901.934, z: -543560.337, dist: 560941.3, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese65'), zlabel: loc('star_gliese65') + ' A' },
    // YZ Ceti (M-type): 766,620.4 AU from the Sun (12.12 ly).
    yzceti: { hex: 'd43', x: -129026.649, y: 75381.207, z: -751915.278, dist: 766620.4, orbit: -2, size: 1.02, startype: 'M', label: loc('star_yzceti'), zlabel: loc('star_yzceti') },
    // Alpha Centauri A (G-type): 277,940 AU from the Sun (4.39 ly).
    alphacentauri: { hex: 'e1e', x: 199021.346, y: -193985.2, z: -3296.913, dist: 277940, orbit: -2, size: 2.209, startype: 'G', label: loc('star_alpha_centauri'), zlabel: loc('star_alpha_centauri') + ' A' },
    // Alpha Centauri B (K-type): companion, 22.2 AU from Alpha Centauri A.
    alphacentaurib: { hex: 'e4e', x: 199007.422, y: -193999.315, z: -3306.891, dist: 277940, orbit: -2, size: 1.855, startype: 'K', zlabel: loc('star_alpha_centauri') + ' B' },
    // Proxima Centauri (M-type): companion, 14,024.7 AU from Alpha Centauri A.
    proximacentauri: { hex: '1c9', x: 186242.736, y: -193265.541, z: -9031.026, dist: 268550.7, orbit: -2, size: 0.785, startype: 'M', zlabel: loc('star_proxima_centauri') },
    // Barnard's Star (M-type): 377,100.4 AU from the Sun (5.96 ly).
    barnardsstar: { hex: 'f35', x: 313522.226, y: 188447.979, z: 91628.876, dist: 377100.4, orbit: -2, size: 0.885, startype: 'M', label: loc('star_barnards_star'), zlabel: loc('star_barnards_star') },
    // Sirius A (A-type): 543,932.9 AU from the Sun (8.60 ly).
    sirius: { hex: '118', x: -364922.001, y: -394498.07, z: -84060.919, dist: 543932.9, orbit: -2, size: 2.615, startype: 'A', label: loc('star_sirius'), zlabel: loc('star_sirius') + ' A' },
    // Sirius B (D-type): companion, 16.3 AU from Sirius A.
    siriusb: { hex: 'b7f', x: -364913.661, y: -394507.91, z: -84050.947, dist: 543932.9, orbit: -2, size: 0.183, startype: 'D', zlabel: loc('star_sirius') + ' B' },
    // Procyon A (F-type): 724,855.2 AU from the Sun (11.46 ly).
    procyon: { hex: '315', x: -587528.977, y: -391866.327, z: 163296.042, dist: 724855.2, orbit: -2, size: 2.864, startype: 'F', label: loc('star_procyon'), zlabel: loc('star_procyon') + ' A' },
    // Procyon B (D-type): companion, 16.8 AU from Procyon A.
    procyonb: { hex: '374', x: -587529.648, y: -391871.902, z: 163280.248, dist: 724855.2, orbit: -2, size: 0.219, startype: 'D', zlabel: loc('star_procyon') + ' B' },
    // Wolf 359 (M-type): 496,808.9 AU from the Sun (7.86 ly).
    wolf359: { hex: '457', x: -121170.806, y: -249036.778, z: 412452.866, dist: 496808.9, orbit: -2, size: 0.759, startype: 'M', label: loc('star_wolf359'), zlabel: loc('star_wolf359') },
    // Ross 128 (M-type): 696,122.6 AU from the Sun (11.01 ly).
    ross128: { hex: '4e7', x: 905.425, y: -352688.658, z: 600163.744, dist: 696122.6, orbit: -2, size: 0.888, startype: 'M', label: loc('star_ross128'), zlabel: loc('star_ross128') },
    // 61 Cygni A (K-type): 721,218.5 AU from the Sun (11.40 ly).
    cygni: { hex: '27f', x: 95890.548, y: 711066.78, z: -73110.388, dist: 721218.5, orbit: -2, size: 1.631, startype: 'K', label: loc('star_61cygni'), zlabel: loc('star_61cygni') + ' A' },
    // 61 Cygni B (K-type): companion, 107.5 AU from 61 Cygni A.
    cygnib: { hex: '450', x: 95921.541, y: 711052.121, z: -73212.235, dist: 721218.5, orbit: -2, size: 1.543, startype: 'K', zlabel: loc('star_61cygni') + ' B' },
    // Sigma Draconis (K-type): 1,188,887.9 AU from the Sun (18.80 ly).
    sigmadraconis: { hex: '811', x: -216244.617, y: 1081871.754, z: 442996.974, dist: 1188887.9, orbit: -2, size: 1.766, startype: 'K', label: loc('star_sigma_draconis'), zlabel: loc('star_sigma_draconis') },
    // Altair (A-type): 1,058,039.5 AU from the Sun (16.73 ly).
    altair: { hex: '8a1', x: 702887.087, y: 773658.946, z: -163857.331, dist: 1058039.5, orbit: -2, size: 2.676, startype: 'A', label: loc('star_altair'), zlabel: loc('star_altair') },
    // Kapteyn's Star (M-type): 811,431.7 AU from the Sun (12.83 ly).
    kapteynsstar: { hex: 'a6e', x: -218783.221, y: -618913.395, z: -476971.217, dist: 811431.7, orbit: -2, size: 1.079, startype: 'M', label: loc('star_kapteyns_star'), zlabel: loc('star_kapteyns_star') },
    // Teegarden's Star (M-type): 790,321.7 AU from the Sun (12.50 ly).
    teegardensstar: { hex: 'b5a', x: -593895.814, y: 213075.04, z: -475915.162, dist: 790321.7, orbit: -2, size: 0.775, startype: 'M', label: loc('star_teegardens_star'), zlabel: loc('star_teegardens_star') },
    // TZ Arietis (M-type): 921,927.6 AU from the Sun (14.58 ly).
    tzarietis: { hex: '0a0', x: -536255.491, y: 339547.226, z: -668646.616, dist: 921927.6, orbit: -2, size: 1.02, startype: 'M', label: loc('star_tz_arietis'), zlabel: loc('star_tz_arietis') },
    // Eta Cassiopeiae A (G-type): 1,221,714.9 AU from the Sun (19.32 ly).
    etacassiopeiae: { hex: 'a0d', x: -656022.661, y: 1025003.755, z: -107651.061, dist: 1221714.9, orbit: -2, size: 2.04, startype: 'G', label: loc('star_eta_cassiopeiae'), zlabel: loc('star_eta_cassiopeiae') + ' A' },
    // Eta Cassiopeiae B (K-type): companion, 76.9 AU from Eta Cassiopeiae A.
    etacassiopeiaeb: { hex: '98f', x: -655981.85, y: 1025035.83, z: -107594.324, dist: 1221714.9, orbit: -2, size: 1.625, startype: 'K', zlabel: loc('star_eta_cassiopeiae') + ' B' },
    // 70 Ophiuchi A (K-type): 1,054,699.3 AU from the Sun (16.68 ly).
    ophiuchi: { hex: '0f6', x: 896439.745, y: 515338.608, z: 207876.371, dist: 1054699.3, orbit: -2, size: 1.822, startype: 'K', label: loc('star_70_ophiuchi'), zlabel: loc('star_70_ophiuchi') + ' A' },
    // 70 Ophiuchi B (K-type): companion, 27.5 AU from 70 Ophiuchi A.
    ophiuchib: { hex: '66f', x: 896450.012, y: 515330.517, z: 207852.148, dist: 1054699.3, orbit: -2, size: 1.637, startype: 'K', zlabel: loc('star_70_ophiuchi') + ' B' },
    // DX Cancri (M-type): 738,639.6 AU from the Sun (11.68 ly).
    dxcancri: { hex: 'cdb', x: -596219.327, y: -182448.568, z: 396009.416, dist: 738639.6, orbit: -2, size: 0.775, startype: 'M', label: loc('star_dx_cancri'), zlabel: loc('star_dx_cancri') },
    // AD Leonis (M-type): 1,024,122.4 AU from the Sun (16.19 ly).
    adleonis: { hex: 'f14', x: -477396.733, y: -352688.267, z: 834583.753, dist: 1024122.4, orbit: -2, size: 1.2, startype: 'M', label: loc('star_ad_leonis'), zlabel: loc('star_ad_leonis') },
    // EV Lacertae (M-type): 1,041,966.2 AU from the Sun (16.48 ly).
    evlacertae: { hex: '00f', x: -186823.196, y: 997634.01, z: -235620.328, dist: 1041966.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ev_lacertae'), zlabel: loc('star_ev_lacertae') },
    // Kruger 60 A (M-type): 827,068.7 AU from the Sun (13.08 ly).
    kruger60: { hex: '945', x: -209693.304, y: 800044.563, z: -54.443, dist: 827068.7, orbit: -2, size: 1.2, startype: 'M', label: loc('star_kruger_60'), zlabel: loc('star_kruger_60') + ' A' },
    // Kruger 60 B (M-type): companion, 31.7 AU from Kruger 60 A.
    kruger60b: { hex: '6e6', x: -209715.123, y: 800038.845, z: -32.203, dist: 827068.7, orbit: -2, size: 1.02, startype: 'M', zlabel: loc('star_kruger_60') + ' B' },
    // YZ Canis Minoris (M-type): 1,235,289.5 AU from the Sun (19.53 ly).
    yzcanisminoris: { hex: 'ecd', x: -973702.123, y: -703704.877, z: 287478.163, dist: 1235289.5, orbit: -2, size: 1.02, startype: 'M', label: loc('star_yz_canis_minoris'), zlabel: loc('star_yz_canis_minoris') },
    // Epsilon Indi A (K-type): 750,482 AU from the Sun (11.87 ly).
    epsilonindi: { hex: '71a', x: 459040.021, y: -202531.303, z: -558109.846, dist: 750482, orbit: -2, size: 1.709, startype: 'K', label: loc('star_epsilon_indi'), zlabel: loc('star_epsilon_indi') + ' A' },
    // Epsilon Indi Ba & Bb (T-type brown dwarf binary, 2.65 AU apart) orbit an invisible barycenter
    // (`hidden`, not drawn) at their midpoint. They are bodies of it (so they orbit it) but still
    // Epsilon Indi Ba/Bb (T-type): companion, 1,463.8 AU from Epsilon Indi A.
    epsilonindib: { hex: 'e04', x: 457885.928, y: -202710.048, z: -558992.292, dist: 750482, orbit: -2, size: 0.632, startype: 'T', hidden: true },
    epsilonindiba: { dist: 1.33, orbit: 4139, size: 0.632, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BA' },
    epsilonindibb: { dist: 1.33, orbit: 4139, size: 0.632, star: 'epsilonindib', bodystar: 'T', zlabel: loc('star_epsilon_indi') + ' BB' },
    // Gliese 570 A (K-type): 1,214,148.7 AU from the Sun (19.20 ly).
    gliese570: { hex: 'dcf', x: 949177.543, y: -378832.087, z: 655519.159, dist: 1214148.7, orbit: -2, size: 1.72, startype: 'K', label: loc('star_gliese_570'), zlabel: loc('star_gliese_570') + ' A' },
    // Gliese 570 B & C (M-type binary, 0.8 AU apart) orbit an invisible barycenter (`hidden`, not
    // drawn) at their midpoint. They are treated as bodies of it (so they orbit it) but still render
    // as stars via `bodystar` + label. Two circumbinary planets orbit the barycenter further out,
    // Gliese 570 B/C (G-type): companion, 146.6 AU from Gliese 570 A.
    gliese570bc: { hex: '5ac', x: 949089.095, y: -378855.488, z: 655633.69, dist: 1214148.7, orbit: -2, size: 1.4, startype: 'G', hidden: true },
    gliese570b: { dist: 0.4, orbit: 337, size: 1.4, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' B' },
    gliese570c: { dist: 0.4, orbit: 337, size: 1.4, star: 'gliese570bc', bodystar: 'M', zlabel: loc('star_gliese_570') + ' C' },
    // Gliese 570 D (T-type): companion, 1,540.6 AU from Gliese 570 A.
    gliese570d: { hex: '33b', x: 948312.726, y: -378790.836, z: 656793.425, dist: 1214148.7, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_gliese_570') + ' D' },
    // Wolf 1061 (M-type): 888,540.1 AU from the Sun (14.05 ly).
    wolf1061: { hex: '648', x: 812336.061, y: 47574.594, z: 356861.682, dist: 888540.1, orbit: -2, size: 1.2, startype: 'M', label: loc('star_wolf_1061'), zlabel: loc('star_wolf_1061') },
    // Groombridge 1618 (K-type): 1,004,627.1 AU from the Sun (15.89 ly).
    groombridge1618: { hex: '4f3', x: -597833.655, y: 150541.573, z: 793226.14, dist: 1004627.1, orbit: -2, size: 1.587, startype: 'K', label: loc('star_groombridge_1618'), zlabel: loc('star_groombridge_1618') },
    // 40 Eridani A (K-type): 1,033,349.4 AU from the Sun (16.34 ly). Triple: a K0 dwarf with a
    // white dwarf and a red dwarf orbiting each other some 400 AU out.
    eridani40: { hex: 'a8f', x: -760960.965, y: -288344.331, z: -636872.774, dist: 1033349.4, orbit: -2, size: 1.8, startype: 'K', label: loc('star_40_eridani'), zlabel: loc('star_40_eridani') + ' A' },
    // 40 Eridani B (D-type white dwarf): companion, 418.7 AU from 40 Eridani A.
    eridani40b: { hex: '499', x: -761042.474, y: -288672.923, z: -636626.477, dist: 1033349.4, orbit: -2, size: 0.233, startype: 'D', zlabel: loc('star_40_eridani') + ' B' },
    // 40 Eridani C (M-type): companion, 392 AU from 40 Eridani A and 46.8 AU from the white dwarf.
    eridani40c: { hex: '44e', x: -761061.01, y: -288630.021, z: -636623.769, dist: 1033349.4, orbit: -2, size: 1.114, startype: 'M', zlabel: loc('star_40_eridani') + ' C' },
    // 36 Ophiuchi A (K-type): 1,227,744 AU from the Sun (19.41 ly). A triple of K dwarfs.
    ophiuchi36: { hex: '788', x: 1218355.571, y: -36598.555, z: 147056.784, dist: 1227744, orbit: -2, size: 1.732, startype: 'K', label: loc('star_36_ophiuchi'), zlabel: loc('star_36_ophiuchi') + ' A' },
    // 36 Ophiuchi B (K-type): companion, 29 AU from 36 Ophiuchi A.
    ophiuchi36b: { hex: '6a0', x: 1218358.479, y: -36609.241, z: 147030.032, dist: 1227744, orbit: -2, size: 1.789, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' B' },
    // 36 Ophiuchi C (K-type): distant companion, 4,364 AU from 36 Ophiuchi A.
    ophiuchi36c: { hex: '07c', x: 1218779.549, y: -33227.176, z: 144318.453, dist: 1227744, orbit: -2, size: 1.637, startype: 'K', zlabel: loc('star_36_ophiuchi') + ' C' },
    // HR 7703 A (K-type): 1,240,114.7 AU from the Sun (19.61 ly).
    hr7703: { hex: 'e2b', x: 1059390.403, y: 97030.649, z: -637308.014, dist: 1240114.7, orbit: -2, size: 1.732, startype: 'K', label: loc('star_hr_7703'), zlabel: loc('star_hr_7703') + ' A' },
    // HR 7703 B (M-type): companion, 178.7 AU from HR 7703 A.
    hr7703b: { hex: '45a', x: 1059353.659, y: 96877.48, z: -637392.387, dist: 1240114.7, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_hr_7703') + ' B' },
    // 82 Eridani (G-type): 1,246,130.8 AU from the Sun (19.70 ly).
    eridani82: { hex: '2fe', x: -229324.232, y: -656542.819, z: -1034023.178, dist: 1246130.8, orbit: -2, size: 1.918, startype: 'G', label: loc('star_82_eridani'), zlabel: loc('star_82_eridani') },
    // Delta Pavonis (G-type): 1,258,062 AU from the Sun (19.89 ly). A G8 subgiant, so it is drawn
    // slightly larger than the G dwarfs and its habitable zone sits further out.
    deltapavonis: { hex: 'eb9', x: 917575.298, y: -534741.764, z: -674408.559, dist: 1258062, orbit: -2, size: 2.209, startype: 'G', label: loc('star_delta_pavonis'), zlabel: loc('star_delta_pavonis') },
    // Lalande 21185 (M-type): 525,177 AU from the Sun (8.30 ly).
    lalande21185: { hex: '7ab', x: -217487.254, y: -19480.634, z: 477630.322, dist: 525177, orbit: -2, size: 1.254, startype: 'M', label: loc('star_lalande21185'), zlabel: loc('star_lalande21185') },
    // Ross 154 (M-type): 613,834.8 AU from the Sun (9.71 ly).
    ross154: { hex: '2b1', x: 592249.371, y: 118420.349, z: -109592.027, dist: 613834.8, orbit: -2, size: 1.2, startype: 'M', label: loc('star_ross154'), zlabel: loc('star_ross154') },
    // Ross 248 (M-type): 651,744.3 AU from the Sun (10.31 ly).
    ross248: { hex: '5f3', x: -213144.088, y: 585898.378, z: -189903.322, dist: 651744.3, orbit: -2, size: 0.894, startype: 'M', label: loc('star_ross248'), zlabel: loc('star_ross248') },
    // Lacaille 9352 (M-type): 678,200.6 AU from the Sun (10.72 ly).
    lacaille9352: { hex: '151', x: 275218.805, y: 24566.519, z: -619360.258, dist: 678200.6, orbit: -2, size: 1.355, startype: 'M', label: loc('star_lacaille9352'), zlabel: loc('star_lacaille9352') },
    // EZ Aquarii (M-type): 702,536.8 AU from the Sun (11.11 ly).
    ezaquarii: { hex: 'd75', x: 260754.881, y: 280307.529, z: -589060.731, dist: 702536.8, orbit: -2, size: 0.894, startype: 'M', label: loc('star_ezaquarii'), zlabel: loc('star_ezaquarii') },
    // Struve 2398 (M-type): 726,693.7 AU from the Sun (11.49 ly).
    struve2398: { hex: '2d8', x: 8230.584, y: 662621.062, z: 298243.672, dist: 726693.7, orbit: -2, size: 1.2, startype: 'M', label: loc('star_struve2398'), zlabel: loc('star_struve2398') + ' A' },
    // Struve 2398 B (M-type): M3.5 dwarf companion, 45 AU from Struve 2398 A.
    struve2398b: { hex: '5b7', x: 8273.129, y: 662626.622, z: 298230.14, dist: 726693.7, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_struve2398') + ' B' },
    // Groombridge 34 (M-type): 734,805.2 AU from the Sun (11.62 ly).
    groombridge34: { hex: '312', x: -312946.227, y: 622849.542, z: -232511.796, dist: 734805.2, orbit: -2, size: 1.327, startype: 'M', label: loc('star_groombridge34'), zlabel: loc('star_groombridge34') + ' A' },
    // Groombridge 34 B (M-type): M3.5 dwarf companion, 125.7 AU from Groombridge 34 A.
    groombridge34b: { hex: 'e65', x: -313058.463, y: 622807.066, z: -232474.486, dist: 734805.2, orbit: -2, size: 1.2, startype: 'M', zlabel: loc('star_groombridge34') + ' B' },
    // Gliese 1061 (M-type): 757,876.5 AU from the Sun (11.98 ly).
    gliese1061: { hex: '2d5', x: -142241.102, y: -434411.095, z: -604509.111, dist: 757876.5, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1061'), zlabel: loc('star_gliese1061') },
    // Luyten's Star (M-type): 780,930.7 AU from the Sun (12.35 ly).
    luytensstar: { hex: '83b', x: -648982.214, y: -410976.247, z: 140617.84, dist: 780930.7, orbit: -2, size: 1.077, startype: 'M', label: loc('star_luytensstar'), zlabel: loc('star_luytensstar') },
    // Lacaille 8760 (M-type): 818,795.8 AU from the Sun (12.95 ly).
    lacaille8760: { hex: '53d', x: 585078.569, y: 39930.09, z: -571415.051, dist: 818795.8, orbit: -2, size: 1.428, startype: 'M', label: loc('star_lacaille8760'), zlabel: loc('star_lacaille8760') },
    // SCR 1845-6357 (M-type): 826,166 AU from the Sun (13.06 ly).
    scr1845: { hex: '5b0', x: 665907.921, y: -361272.051, z: -329544.131, dist: 826166, orbit: -2, size: 0.663, startype: 'M', label: loc('star_scr1845'), zlabel: loc('star_scr1845') + ' A' },
    // SCR 1845-6357 B (T-type): brown dwarf companion, 1.4 AU from SCR 1845-6357 A.
    scr1845b: { hex: '471', x: 665907.12, y: -361273.178, z: -329544.514, dist: 826166, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_scr1845') + ' B' },
    // DEN 1048-3956 (M-type): 834,351.9 AU from the Sun (13.19 ly).
    den1048: { hex: '52c', x: 120425.2, y: -788470.43, z: 244857.613, dist: 834351.9, orbit: -2, size: 0.663, startype: 'M', label: loc('star_den1048'), zlabel: loc('star_den1048') },
    // Ross 614 (M-type): 848,945.5 AU from the Sun (13.42 ly).
    ross614: { hex: 'b83', x: -708412.737, y: -458791.644, z: -91488.11, dist: 848945.5, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ross614'), zlabel: loc('star_ross614') },
    // Gliese 1 (M-type): 896,425.4 AU from the Sun (14.17 ly).
    gliese1: { hex: '81b', x: 209403.756, y: -61814.687, z: -869429.465, dist: 896425.4, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese1'), zlabel: loc('star_gliese1') },
    // Gliese 687 (M-type): 938,464 AU from the Sun (14.84 ly).
    gliese687: { hex: 'eb1', x: -119088.111, y: 787217.482, z: 496811.094, dist: 938464, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese687'), zlabel: loc('star_gliese687') },
    // Gliese 674 (M-type): 939,077.1 AU from the Sun (14.85 ly).
    gliese674: { hex: '8d4', x: 891786.742, y: -272579.855, z: -110825.959, dist: 939077.1, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese674'), zlabel: loc('star_gliese674') },
    // LHS 292 (M-type): 940,430.5 AU from the Sun (14.87 ly).
    lhs292: { hex: '531', x: -110597.972, y: -697913.901, z: 620559.241, dist: 940430.5, orbit: -2, size: 0.775, startype: 'M', label: loc('star_lhs292'), zlabel: loc('star_lhs292') },
    // Gliese 876 (M-type): 963,683.1 AU from the Sun (15.24 ly).
    gliese876: { hex: 'eb2', x: 299935.23, y: 383955.508, z: -831445.83, dist: 963683.1, orbit: -2, size: 1.226, startype: 'M', label: loc('star_gliese876'), zlabel: loc('star_gliese876') },
    // Gliese 1245 (M-type): 967,775.5 AU from the Sun (15.30 ly).
    gliese1245: { hex: '753', x: 184953.099, y: 939081.762, z: 143203.637, dist: 967775.5, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1245'), zlabel: loc('star_gliese1245') + ' A' },
    // Gliese 1245 B (M-type): M6 dwarf companion, 35.6 AU from Gliese 1245 A.
    gliese1245b: { hex: '91e', x: 184926.336, y: 939090.367, z: 143181.763, dist: 967775.5, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese1245') + ' B' },
    // LHS 288 (M-type): 996,593.7 AU from the Sun (15.76 ly).
    lhs288: { hex: '2c7', x: 311628.137, y: -945967.647, z: -35102.573, dist: 996593.7, orbit: -2, size: 0.894, startype: 'M', label: loc('star_lhs288'), zlabel: loc('star_lhs288') },
    // Gliese 1002 (M-type): 999,587.1 AU from the Sun (15.81 ly).
    gliese1002: { hex: 'b52', x: -16284.807, y: 378551.276, z: -924990.911, dist: 999587.1, orbit: -2, size: 0.894, startype: 'M', label: loc('star_gliese1002'), zlabel: loc('star_gliese1002') },
    // Gliese 412 (M-type): 1,011,659.4 AU from the Sun (16.00 ly).
    gliese412: { hex: '6e7', x: -448966.251, y: 91321.181, z: 901967.006, dist: 1011659.4, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese412'), zlabel: loc('star_gliese412') + ' A' },
    // Gliese 412 B (M-type): M6 dwarf companion, 153 AU from Gliese 412 A.
    gliese412b: { hex: '332', x: -448837.812, y: 91274.378, z: 902035.664, dist: 1011659.4, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese412') + ' B' },
    // Gliese 832 (M-type): 1,024,535.5 AU from the Sun (16.20 ly).
    gliese832: { hex: '862', x: 694603.235, y: -132841.054, z: -741318.088, dist: 1024535.5, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese832'), zlabel: loc('star_gliese832') },
    // Gliese 1005 (M-type): 1,028,598.2 AU from the Sun (16.26 ly).
    gliese1005: { hex: 'c3c', x: 25989.848, y: 243959.963, z: -998910.614, dist: 1028598.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese1005'), zlabel: loc('star_gliese1005') },
    // Gliese 682 (M-type): 1,032,902.3 AU from the Sun (16.33 ly).
    gliese682: { hex: '005', x: 995446.58, y: -248457.356, z: -119340.785, dist: 1032902.3, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese682'), zlabel: loc('star_gliese682') },
    // Gliese 316.1 (M-type): 1,062,430.4 AU from the Sun (16.80 ly).
    gliese3161: { hex: 'db6', x: -757530.872, y: -395194.328, z: 631448.157, dist: 1062430.4, orbit: -2, size: 0.663, startype: 'M', label: loc('star_gliese3161'), zlabel: loc('star_gliese3161') + ' A' },
    // Gliese 316.1 B (M-type): M7 dwarf companion, 13.6 AU from Gliese 316.1 A.
    gliese3161b: { hex: 'd10', x: -757524.185, y: -395206.107, z: 631448.807, dist: 1062430.4, orbit: -2, size: 0.693, startype: 'M', zlabel: loc('star_gliese3161') + ' B' },
    // Gliese 3379 (M-type): 1,074,220.3 AU from the Sun (16.99 ly).
    gliese3379: { hex: 'c86', x: -961744.94, y: -439556.081, z: -189173.069, dist: 1074220.3, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese3379'), zlabel: loc('star_gliese3379') },
    // Gliese 445 (M-type): 1,083,749.9 AU from the Sun (17.14 ly).
    gliese445: { hex: '09f', x: -512495.776, y: 683891.836, z: 666448.693, dist: 1083749.9, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese445'), zlabel: loc('star_gliese445') },
    // UCAC4 195-119117 (M-type): 1,098,737 AU from the Sun (17.37 ly).
    ucac4195: { hex: 'f5e', x: 930476.996, y: -580671.582, z: 65239.27, dist: 1098737, orbit: -2, size: 0.693, startype: 'M', label: loc('star_ucac4195'), zlabel: loc('star_ucac4195') },
    // Gliese 3323 (M-type): 1,108,672.8 AU from the Sun (17.53 ly).
    gliese3323: { hex: 'dd5', x: -880844.557, y: -437838.537, z: -511434.918, dist: 1108672.8, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese3323'), zlabel: loc('star_gliese3323') },
    // Gliese 526 (M-type): 1,121,027.5 AU from the Sun (17.73 ly).
    gliese526: { hex: 'e66', x: 335066.997, y: -49623.998, z: 1068630.103, dist: 1121027.5, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese526'), zlabel: loc('star_gliese526') },
    // Stein 2051 (M-type): 1,138,051.7 AU from the Sun (18.00 ly).
    stein2051: { hex: '6df', x: -958344.288, y: 596456.243, z: 144836.944, dist: 1138051.7, orbit: -2, size: 1.02, startype: 'M', label: loc('star_stein2051'), zlabel: loc('star_stein2051') + ' A' },
    // Stein 2051 B (D-type): white dwarf companion, 49.8 AU from Stein 2051 A.
    stein2051b: { hex: 'a9f', x: -958347.129, y: 596440.249, z: 144884.009, dist: 1138051.7, orbit: -2, size: 0.214, startype: 'D', zlabel: loc('star_stein2051') + ' B' },
    // Gliese 251 (M-type): 1,151,912.6 AU from the Sun (18.21 ly).
    gliese251: { hex: '92e', x: -1110494.37, y: -56961.286, z: 300766.1, dist: 1151912.6, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese251'), zlabel: loc('star_gliese251') },
    // Gliese 1224 (M-type): 1,159,239.1 AU from the Sun (18.33 ly).
    gliese1224: { hex: 'c44', x: 828810.56, y: 481669.937, z: -651845.416, dist: 1159239.1, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese1224'), zlabel: loc('star_gliese1224') },
    // LSR 1835+3259 (M-type): 1,173,339.1 AU from the Sun (18.55 ly).
    lsr1835: { hex: 'b1a', x: 531613.187, y: 985085.729, z: 351736.048, dist: 1173339.1, orbit: -2, size: 0.663, startype: 'M', label: loc('star_lsr1835'), zlabel: loc('star_lsr1835') },
    // Gliese 205 (M-type): 1,176,551 AU from the Sun (18.60 ly).
    gliese205: { hex: '877', x: -989078.348, y: -502540.926, z: -391725.589, dist: 1176551, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese205'), zlabel: loc('star_gliese205') },
    // Gliese 229 (M-type): 1,188,339.3 AU from the Sun (18.79 ly).
    gliese229: { hex: 'aac', x: -745335.438, y: -845782.332, z: -375869.169, dist: 1188339.3, orbit: -2, size: 1.661, startype: 'M', label: loc('star_gliese229'), zlabel: loc('star_gliese229') + ' A' },
    // Gliese 229 B (T-type): brown dwarf companion, 44.8 AU from Gliese 229 A.
    gliese229b: { hex: '587', x: -745301.32, y: -845811.323, z: -375871.586, dist: 1188339.3, orbit: -2, size: 0.632, startype: 'T', zlabel: loc('star_gliese229') + ' B' },
    // Ross 47 (M-type): 1,194,517.9 AU from the Sun (18.89 ly).
    ross47: { hex: 'ccb', x: -1145524.905, y: -279422.463, z: -191229.485, dist: 1194517.9, orbit: -2, size: 1.02, startype: 'M', label: loc('star_ross47'), zlabel: loc('star_ross47') },
    // Gliese 693 (M-type): 1,214,721.5 AU from the Sun (19.21 ly).
    gliese693: { hex: 'eb4', x: 1068695.749, y: -491444.967, z: -303182.245, dist: 1214721.5, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese693'), zlabel: loc('star_gliese693') },
    // Gliese 754 (M-type): 1,218,806.3 AU from the Sun (19.27 ly).
    gliese754: { hex: '5a5', x: 1104389.603, y: -148146.062, z: -493827.043, dist: 1218806.3, orbit: -2, size: 1.02, startype: 'M', label: loc('star_gliese754'), zlabel: loc('star_gliese754') },
    // Gliese 908 (M-type): 1,218,941.7 AU from the Sun (19.27 ly).
    gliese908: { hex: 'cce', x: -41398.594, y: 664742.204, z: -1020893.164, dist: 1218941.7, orbit: -2, size: 1.4, startype: 'M', label: loc('star_gliese908'), zlabel: loc('star_gliese908') },
    // Gliese 752 (M-type): 1,220,057.8 AU from the Sun (19.29 ly).
    gliese752: { hex: '3df', x: 926948.333, y: 790205.838, z: -69875.759, dist: 1220057.8, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese752'), zlabel: loc('star_gliese752') + ' A' },
    // Gliese 752 B (M-type): M8 dwarf companion, 444.7 AU from Gliese 752 A.
    gliese752b: { hex: '1af', x: 927095.567, y: 790000.638, z: -70241.737, dist: 1220057.8, orbit: -2, size: 0.663, startype: 'M', zlabel: loc('star_gliese752') + ' B' },
    // Gliese 588 (M-type): 1,220,527.1 AU from the Sun (19.30 ly).
    gliese588: { hex: '1e0', x: 1060129.542, y: -547762.98, z: 256451.649, dist: 1220527.1, orbit: -2, size: 1.327, startype: 'M', label: loc('star_gliese588'), zlabel: loc('star_gliese588') },
    // Gliese 661 (M-type): 1,232,977.5 AU from the Sun (19.50 ly).
    gliese661: { hex: 'd1f', x: 319345.938, y: 945459.439, z: 724125.777, dist: 1232977.5, orbit: -2, size: 1.2, startype: 'M', label: loc('star_gliese661'), zlabel: loc('star_gliese661') },
    // QY Aurigae (M-type): 1,248,465.2 AU from the Sun (19.74 ly).
    qyaurigae: { hex: 'e11', x: -1173685.128, y: 21423.911, z: 425052.508, dist: 1248465.2, orbit: -2, size: 1.02, startype: 'M', label: loc('star_qyaurigae'), zlabel: loc('star_qyaurigae') },
    // Gliese 65 B (M-type): M6 dwarf companion, 11 AU from Gliese 65 A.
    gliese65b: { hex: '9f3', x: -138135.223, y: 10899.179, z: -543557.776, dist: 560941.3, orbit: -2, size: 0.775, startype: 'M', zlabel: loc('star_gliese65') + ' B' },
    // Vega (A-type): 1,583,850.2 AU from the Sun (25.04 ly).
    vega: { hex: '621', x: 573518.038, y: 1381062.323, z: 521847.911, dist: 1583850.2, orbit: -2, size: 3.219, startype: 'A', label: loc('star_vega'), zlabel: loc('star_vega') },
    // Arcturus (K-type red giant): 2,322,017.4 AU from the Sun (36.72 ly).
    arcturus: { hex: 'a75', x: 799525.78, y: 214981.098, z: 2169402.332, dist: 2322017.4, orbit: -2, size: 10.08, startype: 'KIII', label: loc('star_arcturus'), zlabel: loc('star_arcturus') },
    // Pollux (K-type red giant): 2,136,573.5 AU from the Sun (33.78 ly). 8.8 solar radii.
    pollux: { hex: '33e', x: -1916263.438, y: -415335.98, z: 848750.137, dist: 2136573.5, orbit: -2, size: 5.933, startype: 'KIII', label: loc('star_pollux'), zlabel: loc('star_pollux') },
    // Fomalhaut (A-type): 1,588,974.7 AU from the Sun (25.13 ly). 1.842 solar radii.
    fomalhaut: { hex: 'bbc', x: 631179.495, y: 235839.405, z: -1439038.854, dist: 1588974.7, orbit: -2, size: 2.714, startype: 'A', label: loc('star_fomalhaut'), zlabel: loc('star_fomalhaut') },
    // Fomalhaut's companions.
    // K4Ve, 0.713 solar radii, 24.79 ly.
    fomalhautb: { hex: '7c2', x: 646278.719, y: 184548.866, z: -1416567.238, dist: 1567927.7, orbit: -2, size: 1.689, startype: 'K', zlabel: loc('star_fomalhaut') + ' B' },
    // M4.0Ve, 0.274 solar radii, 25.04 ly.
    fomalhautc: { hex: '23e', x: 629704.516, y: 387892.142, z: -1400009.279, dist: 1583355.3, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_fomalhaut') + ' C' },
    // Zeta Tucanae -- single.
    // F9.5V, 1.142 solar radii, 28.07 ly.
    zetatucanae: { hex: 'dff', x: 678907.894, y: -858968.23, z: -1397542.88, dist: 1775350.2, orbit: -2, size: 2.137, startype: 'F', label: loc('star_zeta_tucanae'), zlabel: loc('star_zeta_tucanae') },
    // Beta Hydri -- single.
    // G0V, 1.814 solar radii, 24.33 ly.
    betahydri: { hex: 'a7f', x: 674280.642, y: -971175.411, z: -984430.207, dist: 1538485.9, orbit: -2, size: 2.694, startype: 'G', label: loc('star_beta_hydri'), zlabel: loc('star_beta_hydri') },
    // Gliese 33 -- single.
    // K2.5V, 0.783 solar radii, 24.25 ly.
    gliese33: { hex: '21c', x: -429732.758, y: 700898.19, z: -1294635.896, dist: 1533626.6, orbit: -2, size: 1.77, startype: 'K', label: loc('star_gliese33'), zlabel: loc('star_gliese33') },
    // Mu Cassiopeiae -- single.
    // G5Vb, 0.79 solar radii, 25.03 ly.
    mucassiopeiae: { hex: '9c4', x: -907822.006, y: 1278746.047, z: -216823.076, dist: 1583143.9, orbit: -2, size: 1.778, startype: 'G', label: loc('star_mu_cassiopeiae'), zlabel: loc('star_mu_cassiopeiae') },
    // p Eridani -- 2 components.
    // K2V, 0.783 solar radii, 26.71 ly.
    peridani: { hex: '772', x: 286070.634, y: -803745.351, z: -1457914.775, dist: 1689188.7, orbit: -2, size: 1.77, startype: 'K', label: loc('star_p_eridani'), zlabel: loc('star_p_eridani') + ' A' },
    // K2V, 0.783 solar radii, 26.71 ly.
    peridanib: { hex: '65c', x: 286140.573, y: -803793.303, z: -1457874.613, dist: 1689188.7, orbit: -2, size: 1.77, startype: 'K', zlabel: loc('star_p_eridani') + ' B' },
    // 107 Piscium -- single.
    // K1V, 0.797 solar radii, 24.93 ly.
    piscium107: { hex: '9b9', x: -896122.772, y: 782399.763, z: -1034741.632, dist: 1576666, orbit: -2, size: 1.785, startype: 'K', label: loc('star_107_piscium'), zlabel: loc('star_107_piscium') },
    // Gliese 105 -- 3 components.
    // K3V, 0.755 solar radii, 23.58 ly.
    gliese105: { hex: '390', x: -963614.796, y: 287226.887, z: -1100920.23, dist: 1490999, orbit: -2, size: 1.738, startype: 'K', label: loc('star_gliese105'), zlabel: loc('star_gliese105') + ' A' },
    // M3.5V, 0.3 solar radii, 23.58 ly.
    gliese105b: { hex: '88d', x: -964172.016, y: 286206.988, z: -1100697.958, dist: 1490999, orbit: -2, size: 1.095, startype: 'M', zlabel: loc('star_gliese105') + ' B' },
    // M6V, 0.137 solar radii, 23.58 ly.
    gliese105c: { hex: '139', x: -963608.578, y: 287254.909, z: -1100918.361, dist: 1490999, orbit: -2, size: 0.74, startype: 'M', zlabel: loc('star_gliese105') + ' C' },
    // Delta Eridani -- single.
    // K0+IV, 2.33 solar radii, 29.64 ly.
    deltaeridani: { hex: '431', x: -1238018.752, y: -404341.67, z: -1348452.409, dist: 1874701.7, orbit: -2, size: 3.053, startype: 'K', label: loc('star_delta_eridani'), zlabel: loc('star_delta_eridani') },
    // Pi3 Orionis -- single.
    // F6V, 1.359 solar radii, 26.17 ly.
    pi3orionis: { hex: 'cf3', x: -1492525.898, y: -302356.552, z: -648442.458, dist: 1655152.8, orbit: -2, size: 2.332, startype: 'F', label: loc('star_pi3_orionis'), zlabel: loc('star_pi3_orionis') },
    // Gliese 183 -- single.
    // K3+V, 0.755 solar radii, 28.85 ly.
    gliese183: { hex: '9a6', x: -1469681.817, y: -688182.093, z: -833150.147, dist: 1824198, orbit: -2, size: 1.738, startype: 'K', label: loc('star_gliese183'), zlabel: loc('star_gliese183') },
    // Gliese 185 -- 2 components.
    // K7, 0.63 solar radii, 27.28 ly.
    gliese185: { hex: '97f', x: -1079497.261, y: -962578.557, z: -940084.14, dist: 1725001.5, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese185'), zlabel: loc('star_gliese185') + ' A' },
    // M2V, 0.446 solar radii, 27.28 ly.
    gliese185b: { hex: '0c2', x: -1079497.839, y: -962571.529, z: -940090.673, dist: 1725001.5, orbit: -2, size: 1.336, startype: 'M', zlabel: loc('star_gliese185') + ' B' },
    // Gamma Leporis -- 2 components.
    // F6V, 1.359 solar radii, 29.04 ly.
    gammaleporis: { hex: '6a2', x: -1146307.221, y: -1220512.055, z: -755081.714, dist: 1836795.7, orbit: -2, size: 2.332, startype: 'F', label: loc('star_gamma_leporis'), zlabel: loc('star_gamma_leporis') + ' A' },
    // K2.5V(k), 0.783 solar radii, 29.04 ly.
    gammaleporisb: { hex: '549', x: -1146971.4, y: -1219976.714, z: -754938.237, dist: 1836795.7, orbit: -2, size: 1.77, startype: 'K', zlabel: loc('star_gamma_leporis') + ' B' },
    // Chi1 Orionis -- single.
    // G0V, 1.1 solar radii, 28.26 ly.
    chi1orionis: { hex: '0f3', x: -1765480.957, y: -262531.251, z: -85187.654, dist: 1786925.5, orbit: -2, size: 2.098, startype: 'G', label: loc('star_chi1_orionis'), zlabel: loc('star_chi1_orionis') },
    // Gliese 250 -- 2 components.
    // K3.5V, 0.755 solar radii, 28.52 ly.
    gliese250: { hex: '669', x: -1427347.938, y: -1100667.761, z: -68147.21, dist: 1803728.3, orbit: -2, size: 1.738, startype: 'K', label: loc('star_gliese250'), zlabel: loc('star_gliese250') + ' A' },
    // M2.5V, 0.421 solar radii, 28.52 ly.
    gliese250b: { hex: 'cff', x: -1427062.134, y: -1101023.77, z: -68381.43, dist: 1803728.3, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_gliese250') + ' B' },
    // Gliese 338 -- 2 components.
    // K7V, 0.63 solar radii, 20.66 ly.
    gliese338: { hex: 'a3b', x: -927583.264, y: 249664.623, z: 885403.133, dist: 1306400.3, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese338'), zlabel: loc('star_gliese338') + ' A' },
    // M0V, 0.588 solar radii, 20.66 ly.
    gliese338b: { hex: '76d', x: -927508.039, y: 249659.854, z: 885483.28, dist: 1306400.3, orbit: -2, size: 1.534, startype: 'M', zlabel: loc('star_gliese338') + ' B' },
    // Xi Ursae Majoris -- 3 components.
    // F8.5:V, 1.221 solar radii, 28.49 ly.
    xiursaemajoris: { hex: 'dc6', x: -616358.645, y: -166389.761, z: 1684741.597, dist: 1801648.6, orbit: -2, size: 2.21, startype: 'F', label: loc('star_xi_ursae_majoris'), zlabel: loc('star_xi_ursae_majoris') + ' A' },
    // G2V, 1.012 solar radii, 28.49 ly.
    xiursaemajorisb: { hex: '47f', x: -616364.475, y: -166393.574, z: 1684739.087, dist: 1801648.6, orbit: -2, size: 2.012, startype: 'G', zlabel: loc('star_xi_ursae_majoris') + ' B' },
    // T8.5, 0.097 solar radii, 28.49 ly.
    xiursaemajorisc: { hex: '842', x: -612509.829, y: -168298.161, z: 1685955.284, dist: 1801648.6, orbit: -2, size: 0.623, startype: 'T', zlabel: loc('star_xi_ursae_majoris') + ' C' },
    // Groombridge 1830 -- single.
    // K1V_Fe-1.5, 0.68 solar radii, 29.91 ly.
    groombridge1830: { hex: 'a1f', x: -517937.384, y: 105083.795, z: 1816506.546, dist: 1891823.9, orbit: -2, size: 1.649, startype: 'K', label: loc('star_groombridge1830'), zlabel: loc('star_groombridge1830') },
    // Beta Canum Venaticorum -- single.
    // G0V, 1.1 solar radii, 27.63 ly.
    betacanumvenaticorum: { hex: 'd76', x: -319423.155, y: 307031.411, z: 1690518.065, dist: 1747612.9, orbit: -2, size: 2.098, startype: 'G', label: loc('star_beta_canum_venaticorum'), zlabel: loc('star_beta_canum_venaticorum') },
    // Beta Comae Berenices -- single.
    // F9.5V, 1.142 solar radii, 30.00 ly.
    betacomaeberenices: { hex: 'afd', x: 110183.857, y: 104571.578, z: 1891032.454, dist: 1897124, orbit: -2, size: 2.137, startype: 'F', label: loc('star_beta_comae_berenices'), zlabel: loc('star_beta_comae_berenices') },
    // 61 Virginis -- single.
    // G6.5V, 0.949 solar radii, 27.84 ly.
    virginis61: { hex: '9be', x: 843675.501, y: -941645.097, z: 1224887.289, dist: 1760350.2, orbit: -2, size: 1.948, startype: 'G', label: loc('star_61_virginis'), zlabel: loc('star_61_virginis') },
    // Xi Bootis -- 2 components.
    // G7Ve, 0.927 solar radii, 22.03 ly.
    xibootis: { hex: 'd48', x: 614288.588, y: 261836.966, z: 1222544.5, dist: 1393027, orbit: -2, size: 1.926, startype: 'G', label: loc('star_xi_bootis'), zlabel: loc('star_xi_bootis') + ' A' },
    // K5Ve, 0.701 solar radii, 22.03 ly.
    xibootisb: { hex: '288', x: 614245.035, y: 261840.92, z: 1222565.537, dist: 1393027, orbit: -2, size: 1.675, startype: 'K', zlabel: loc('star_xi_bootis') + ' B' },
    // 41 Arae -- 2 components.
    // G9V, 0.853 solar radii, 28.67 ly.
    arae41: { hex: '452', x: 1720150.209, y: -549006.908, z: -166487.158, dist: 1813296.3, orbit: -2, size: 1.847, startype: 'G', label: loc('star_41_arae'), zlabel: loc('star_41_arae') + ' A' },
    // M0VpCa-3Cr-1, 0.588 solar radii, 28.67 ly.
    arae41b: { hex: '9e7', x: 1720135.217, y: -549069.369, z: -166436.058, dist: 1813296.3, orbit: -2, size: 1.534, startype: 'M', zlabel: loc('star_41_arae') + ' B' },
    // Gliese 667 -- 3 components.
    // K3, 0.755 solar radii, 23.62 ly.
    gliese667: { hex: 'be8', x: 1478374.797, y: -211961.346, z: 37164.083, dist: 1493954.8, orbit: -2, size: 1.738, startype: 'K', label: loc('star_gliese667'), zlabel: loc('star_gliese667') + ' A' },
    // K4, 0.713 solar radii, 23.62 ly.
    gliese667b: { hex: 'd34', x: 1478373.455, y: -211968.378, z: 37177.364, dist: 1493954.8, orbit: -2, size: 1.689, startype: 'K', zlabel: loc('star_gliese667') + ' B' },
    // M1.5V, 0.482 solar radii, 23.62 ly.
    gliese667c: { hex: 'ed6', x: 1478377.275, y: -211993.73, z: 36879.733, dist: 1493954.8, orbit: -2, size: 1.389, startype: 'M', zlabel: loc('star_gliese667') + ' C' },
    // Gliese 673 -- single.
    // K7V, 0.63 solar radii, 25.16 ly.
    gliese673: { hex: 'd26', x: 1357835.789, y: 626190.165, z: 543510.953, dist: 1590986, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese673'), zlabel: loc('star_gliese673') },
    // Mu Herculis -- 3 components.
    // G5IV, 1.73 solar radii, 27.20 ly.
    muherculis: { hex: '6db', x: 945365.011, y: 1229296.237, z: 743873.615, dist: 1719951.2, orbit: -2, size: 2.631, startype: 'G', label: loc('star_mu_herculis'), zlabel: loc('star_mu_herculis') + ' A' },
    // M3.5V, 0.3 solar radii, 27.20 ly.
    muherculisb: { hex: 'af7', x: 945451.719, y: 1229112.224, z: 744067.459, dist: 1719951.2, orbit: -2, size: 1.095, startype: 'M', zlabel: loc('star_mu_herculis') + ' B' },
    // M4V, 0.274 solar radii, 27.20 ly.
    muherculisc: { hex: '1b1', x: 945463.919, y: 1229092.394, z: 744084.715, dist: 1719951.2, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_mu_herculis') + ' C' },
    // Chi Draconis -- single.
    // F7V, 1.324 solar radii, 26.28 ly.
    chidraconis: { hex: '34c', x: -341293.189, y: 1426375.556, z: 781699.855, dist: 1661951.5, orbit: -2, size: 2.301, startype: 'F', label: loc('star_chi_draconis'), zlabel: loc('star_chi_draconis') },
    // Gliese 785 -- single.
    // K2+V, 0.783 solar radii, 28.74 ly.
    gliese785: { hex: '38d', x: 1524970.779, y: 426483.448, z: -892154.996, dist: 1817516, orbit: -2, size: 1.77, startype: 'K', label: loc('star_gliese785'), zlabel: loc('star_gliese785') },
    // Gliese 884 -- single.
    // K7+Vk, 0.63 solar radii, 26.85 ly.
    gliese884: { hex: '2f1', x: 584586.289, y: 442737.806, z: -1531527.567, dist: 1698038.5, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese884'), zlabel: loc('star_gliese884') },
    // Gliese 892 -- single.
    // K3V, 0.755 solar radii, 21.34 ly.
    gliese892: { hex: '192', x: -458536.447, y: 1266799.865, z: -75289.049, dist: 1349335.4, orbit: -2, size: 1.738, startype: 'K', label: loc('star_gliese892'), zlabel: loc('star_gliese892') },
    // Gamma Pavonis -- single.
    // F9VFe-1.4CH-0.7, 1.167 solar radii, 30.20 ly.
    gammapavonis: { hex: 'd4a', x: 1237388.708, y: -768512.287, z: -1234962.253, dist: 1909679, orbit: -2, size: 2.161, startype: 'F', label: loc('star_gammapavonis'), zlabel: loc('star_gammapavonis') },
    // Kappa1 Ceti -- single.
    // G5V, 0.977 solar radii, 30.26 ly.
    kappa1ceti: { hex: 'ac2', x: -1397027.855, y: 43335.435, z: -1306670.848, dist: 1913361.8, orbit: -2, size: 1.977, startype: 'G', label: loc('star_kappa1ceti'), zlabel: loc('star_kappa1ceti') },
    // HD 102365 -- 2 components.
    // G2V, 1.012 solar radii, 30.40 ly.
    hd102365: { hex: '6e2', x: 609044.617, y: -1691772.253, z: 679790.792, dist: 1922275.8, orbit: -2, size: 2.012, startype: 'G', label: loc('star_hd102365'), zlabel: loc('star_hd102365') + ' A' },
    // M4V, 0.274 solar radii, 30.40 ly.
    hd102365b: { hex: '2cb', x: 609148.456, y: -1691671.48, z: 679948.516, dist: 1922275.8, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_hd102365') + ' B' },
    // 20 Crateris -- 2 components.
    // K0V, 0.813 solar radii, 31.18 ly.
    crateris20: { hex: 'ea4', x: 446836.147, y: -1693921.67, z: 904721.543, dist: 1971688.2, orbit: -2, size: 1.803, startype: 'K', label: loc('star_crateris20'), zlabel: loc('star_crateris20') + ' A' },
    // DC, 0.013 solar radii, 31.18 ly.
    crateris20b: { hex: '132', x: 446979.893, y: -1693906.074, z: 904679.736, dist: 1971688.2, orbit: -2, size: 0.224, startype: 'D', zlabel: loc('star_crateris20') + ' B' },
    // 61 Ursae Majoris -- single.
    // G8V, 0.914 solar radii, 31.23 ly.
    ursaemajoris61: { hex: '7b9', x: -565705.241, y: -35090.707, z: 1892172.903, dist: 1975239.8, orbit: -2, size: 1.912, startype: 'G', label: loc('star_ursaemajoris61'), zlabel: loc('star_ursaemajoris61') },
    // HD 151288 -- single.
    // K7.5Ve, 0.630 solar radii, 32.11 ly.
    hd151288: { hex: '3b3', x: 888136.262, y: 1282348.343, z: 1300574.381, dist: 2030935, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd151288'), zlabel: loc('star_hd151288') },
    // 12 Ophiuchi -- single.
    // K1V, 0.797 solar radii, 32.27 ly.
    ophiuchi12: { hex: '9a4', x: 1743705.476, y: 425877.347, z: 971017.091, dist: 2040773, orbit: -2, size: 1.785, startype: 'K', label: loc('star_ophiuchi12'), zlabel: loc('star_ophiuchi12') },
    // HD 10780 -- single.
    // K0V, 0.813 solar radii, 32.75 ly.
    hd10780: { hex: '583', x: -1305325.908, y: 1606905.519, z: 59845.559, dist: 2071135.6, orbit: -2, size: 1.803, startype: 'K', label: loc('star_hd10780'), zlabel: loc('star_hd10780') },
    // HD 122064 -- single.
    // K3V, 0.755 solar radii, 32.83 ly.
    hd122064: { hex: '3e8', x: -410768.197, y: 1152666.905, z: 1677652.261, dist: 2076508.8, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd122064'), zlabel: loc('star_hd122064') },
    // HD 103932 -- single.
    // K4+V, 0.713 solar radii, 33.18 ly.
    hd103932: { hex: '0fd', x: 559380.284, y: -1654119.631, z: 1163660.518, dist: 2098362.2, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd103932'), zlabel: loc('star_hd103932') },
    // Alpha Mensae -- 2 components.
    // G7V, 0.927 solar radii, 33.31 ly.
    alphamensae: { hex: '82c', x: 501321.965, y: -1776579.254, z: -1014892.745, dist: 2106552.8, orbit: -2, size: 1.926, startype: 'G', label: loc('star_alphamensae'), zlabel: loc('star_alphamensae') + ' A' },
    // M3.5, 0.300 solar radii, 33.31 ly.
    alphamensaeb: { hex: '78c', x: 501329.6, y: -1776563.027, z: -1014917.379, dist: 2106552.8, orbit: -2, size: 1.095, startype: 'M', zlabel: loc('star_alphamensae') + ' B' },
    // HD 17925 -- single.
    // K1V, 0.797 solar radii, 33.79 ly.
    hd17925: { hex: '4a2', x: -1099527.199, y: -235191.052, z: -1817295.642, dist: 2137016.2, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd17925'), zlabel: loc('star_hd17925') },
    // HD 154363 -- 2 components.
    // K4/5V, 0.713 solar radii, 34.13 ly.
    hd154363: { hex: '7df', x: 1944328.438, y: 534371.434, z: 769680.557, dist: 2158326.7, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd154363'), zlabel: loc('star_hd154363') + ' A' },
    // M1.5V, 0.482 solar radii, 34.13 ly.
    hd154363b: { hex: '9ce', x: 1945001.734, y: 534515.841, z: 767877.032, dist: 2158326.7, orbit: -2, size: 1.389, startype: 'M', zlabel: loc('star_hd154363') + ' B' },
    // Iota Persei -- single.
    // G0V, 1.100 solar radii, 34.50 ly.
    iotapersei: { hex: '605', x: -1763619.537, y: 1253442.283, z: -280250.842, dist: 2181745.2, orbit: -2, size: 2.098, startype: 'G', label: loc('star_iotapersei'), zlabel: loc('star_iotapersei') },
    // Gliese 635 -- 2 components.
    // G0IV, 2.640 solar radii, 34.95 ly.
    gliese635: { hex: '400', x: 1022531.181, y: 1340449.049, z: 1429347.385, dist: 2210295.8, orbit: -2, size: 3.25, startype: 'G', label: loc('star_gliese635'), zlabel: loc('star_gliese635') + ' A' },
    // K0V, 0.813 solar radii, 34.95 ly.
    gliese635b: { hex: 'da9', x: 1022532.99, y: 1340446.985, z: 1429348.027, dist: 2210295.8, orbit: -2, size: 1.803, startype: 'K', zlabel: loc('star_gliese635') + ' B' },
    // HD 13445 -- 2 components.
    // K1.5V, 0.797 solar radii, 35.10 ly.
    hd13445: { hex: 'fe6', x: 107732.803, y: -1037839.059, z: -1959158.546, dist: 2219688.8, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd13445'), zlabel: loc('star_hd13445') + ' A' },
    // DQ6, 0.013 solar radii, 35.10 ly.
    hd13445b: { hex: '80f', x: 107725.273, y: -1037857.573, z: -1959149.152, dist: 2219688.8, orbit: -2, size: 0.224, startype: 'D', zlabel: loc('star_hd13445') + ' B' },
    // HD 223778 -- 2 components.
    // K3V, 0.755 solar radii, 35.54 ly.
    hd223778: { hex: '97b', x: -1067602.349, y: 1911067.862, z: 509542.45, dist: 2247573.9, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd223778'), zlabel: loc('star_hd223778') + ' A' },
    // M2:, 0.446 solar radii, 35.54 ly.
    hd223778b: { hex: 'd29', x: -1067583.958, y: 1911077.8, z: 509543.709, dist: 2247573.9, orbit: -2, size: 1.336, startype: 'M', zlabel: loc('star_hd223778') + ' B' },
    // 8 Trianguli -- single.
    // G0.5VFe-0.5, 1.100 solar radii, 35.59 ly.
    trianguli8: { hex: '804', x: -1611895.127, y: 1239392.962, z: -964740.129, dist: 2250560.9, orbit: -2, size: 2.098, startype: 'G', label: loc('star_trianguli8'), zlabel: loc('star_trianguli8') },
    // Gliese 519 -- single.
    // K7.5V, 0.630 solar radii, 35.69 ly.
    gliese519: { hex: 'b60', x: 114512.978, y: 495827.617, z: 2198917.593, dist: 2257032.7, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese519'), zlabel: loc('star_gliese519') },
    // HD 115404 -- 2 components.
    // K2V, 0.783 solar radii, 35.83 ly.
    hd115404: { hex: '53e', x: 414251.343, y: -198465.751, z: 2219167.751, dist: 2266207.9, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd115404'), zlabel: loc('star_hd115404') + ' A' },
    // M0.5V, 0.544 solar radii, 35.83 ly.
    hd115404b: { hex: '997', x: 414327.268, y: -198436.904, z: 2219156.157, dist: 2266207.9, orbit: -2, size: 1.475, startype: 'M', zlabel: loc('star_hd115404') + ' B' },
    // Denebola -- single.
    // A3Va, 1.861 solar radii, 35.88 ly.
    denebola: { hex: 'cbd', x: -247354.251, y: -703979.927, z: 2142683.078, dist: 2268890.2, orbit: -2, size: 2.728, startype: 'A', label: loc('star_denebola'), zlabel: loc('star_denebola') },
    // HD 160346 -- single.
    // K3-V, 0.755 solar radii, 35.88 ly.
    hd160346: { hex: '0b0', x: 1912987.366, y: 1007298.94, z: 688252.002, dist: 2268890.2, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd160346'), zlabel: loc('star_hd160346') },
    // Zavijava -- single.
    // F9V, 1.167 solar radii, 35.88 ly.
    zavijava: { hex: '1eb', x: 10143.716, y: -1108566.373, z: 1980049.542, dist: 2269277.1, orbit: -2, size: 2.161, startype: 'F', label: loc('star_zavijava'), zlabel: loc('star_zavijava') },
    // HD 166620 -- single.
    // K2V, 0.783 solar radii, 36.19 ly.
    hd166620: { hex: '48e', x: 871162.345, y: 1896967.36, z: 938460.029, dist: 2288693.1, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd166620'), zlabel: loc('star_hd166620') },
    // 54 Piscium -- 2 components.
    // K0.5V, 0.813 solar radii, 36.23 ly.
    piscium54: { hex: 'f4f', x: -836027.489, y: 1497573.511, z: -1519186.709, dist: 2291199.8, orbit: -2, size: 1.803, startype: 'K', label: loc('star_piscium54'), zlabel: loc('star_piscium54') + ' A' },
    // T7.5, 0.095 solar radii, 36.23 ly.
    piscium54b: { hex: '029', x: -835706.901, y: 1497896.652, z: -1519044.514, dist: 2291199.8, orbit: -2, size: 0.616, startype: 'T', zlabel: loc('star_piscium54') + ' B' },
    // Theta Persei -- 2 components.
    // F8V, 1.221 solar radii, 36.37 ly.
    thetapersei: { hex: '21d', x: -1766377.234, y: 1421956.096, z: -383932.076, dist: 2299880.8, orbit: -2, size: 2.21, startype: 'F', label: loc('star_thetapersei'), zlabel: loc('star_thetapersei') + ' A' },
    // M1.5V, 0.482 solar radii, 36.37 ly.
    thetaperseib: { hex: 'c1a', x: -1766240.962, y: 1422135.137, z: -383895.856, dist: 2299880.8, orbit: -2, size: 1.389, startype: 'M', zlabel: loc('star_thetapersei') + ' B' },
    // 41 Serpentis -- single.
    // F6V, 1.359 solar radii, 36.42 ly.
    serpentis41: { hex: '0ee', x: 1423811.867, y: 748451.618, z: 1648105.03, dist: 2302969.9, orbit: -2, size: 2.332, startype: 'F', label: loc('star_serpentis41'), zlabel: loc('star_serpentis41') },
    // HD 74576 -- single.
    // K3V, 0.755 solar radii, 36.50 ly.
    hd74576: { hex: '404', x: -422114.112, y: -2267771.113, z: 89223.224, dist: 2308446.9, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd74576'), zlabel: loc('star_hd74576') },
    // 11 Leonis Minoris -- single.
    // G8Va, 0.914 solar radii, 36.64 ly.
    leonisminoris11: { hex: 'ae6', x: -1539466.513, y: -229963.956, z: 1716751.555, dist: 2317342.5, orbit: -2, size: 1.912, startype: 'G', label: loc('star_leonisminoris11'), zlabel: loc('star_leonisminoris11') },
    // HD 85512 -- single.
    // K6Vk:, 0.669 solar radii, 36.78 ly.
    hd85512: { hex: '3c9', x: 67340.343, y: -2301575.471, z: 330158.613, dist: 2326110.3, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd85512'), zlabel: loc('star_hd85512') },
    // HD 38 -- 2 components.
    // K6V, 0.669 solar radii, 37.58 ly.
    hd38: { hex: '234', x: -951170.83, y: 2072707.305, z: -667853.864, dist: 2376314.4, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd38'), zlabel: loc('star_hd38') + ' A' },
    // M0.5V, 0.544 solar radii, 37.58 ly.
    hd38b: { hex: '83d', x: -951148.645, y: 2072695.937, z: -667920.736, dist: 2376314.4, orbit: -2, size: 1.475, startype: 'M', zlabel: loc('star_hd38') + ' B' },
    // Muphrid -- single.
    // G0IV, 2.640 solar radii, 37.17 ly.
    muphrid: { hex: '089', x: 683137.552, y: 63234.665, z: 2248249.629, dist: 2350596.1, orbit: -2, size: 3.25, startype: 'G', label: loc('star_muphrid'), zlabel: loc('star_muphrid') },
    // HD 245409 -- 2 components.
    // K6V, 0.669 solar radii, 37.26 ly.
    hd245409: { hex: 'fa3', x: -2244507.079, y: -559896.5, z: -449281.241, dist: 2356512.2, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd245409'), zlabel: loc('star_hd245409') + ' A' },
    // M4.0Ve, 0.274 solar radii, 37.26 ly.
    hd245409b: { hex: '3fc', x: -2244164.404, y: -561602.045, z: -448864.149, dist: 2356512.2, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_hd245409') + ' B' },
    // HD 222237b -- single.
    // K3+V, 0.755 solar radii, 37.33 ly.
    hd222237b: { hex: '701', x: 1106728.528, y: -1311093.304, z: -1621526.805, dist: 2360754.7, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd222237b'), zlabel: loc('star_hd222237b') },
    // HD 16157 -- single.
    // K7V, 0.630 solar radii, 37.66 ly.
    hd16157: { hex: '299', x: -212834.772, y: -1044323.71, z: -2129668.347, dist: 2381469.7, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd16157'), zlabel: loc('star_hd16157') },
    // HD 131511 -- single.
    // K0.5V, 0.813 solar radii, 37.93 ly.
    hd131511: { hex: '917', x: 1068177.327, y: 465579.009, z: 2096568.611, dist: 2398617.6, orbit: -2, size: 1.803, startype: 'K', label: loc('star_hd131511'), zlabel: loc('star_hd131511') },
    // HD 99279 -- 2 components.
    // K5-V, 0.701 solar radii, 39.52 ly.
    hd99279: { hex: '7ad', x: 969429.685, y: -2303652.134, z: -21405.079, dist: 2499413, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd99279'), zlabel: loc('star_hd99279') + ' A' },
    // K7-V(k), 0.630 solar radii, 39.52 ly.
    hd99279b: { hex: 'bc1', x: 969371.406, y: -2303676.101, z: -21464.986, dist: 2499413, orbit: -2, size: 1.587, startype: 'K', zlabel: loc('star_hd99279') + ' B' },
    // Gliese 1075 -- single.
    // K7Vk, 0.630 solar radii, 38.13 ly.
    gliese1075: { hex: 'a2d', x: -130587.522, y: -1929917.404, z: -1440209.631, dist: 2411604.9, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese1075'), zlabel: loc('star_gliese1075') },
    // Zeta Doradus -- single.
    // F9VFe-0.5, 1.167 solar radii, 38.14 ly.
    zetadoradus: { hex: '368', x: -133728.932, y: -1928690.988, z: -1441884.388, dist: 2411796.6, orbit: -2, size: 2.161, startype: 'F', label: loc('star_zetadoradus'), zlabel: loc('star_zetadoradus') },
    // HD 125072 -- single.
    // K3IV, 1.812 solar radii, 38.55 ly.
    hd125072: { hex: 'fe8', x: 1689660.838, y: -1756229.007, z: 68695.919, dist: 2438034.7, orbit: -2, size: 2.692, startype: 'K', label: loc('star_hd125072'), zlabel: loc('star_hd125072') },
    // HD 97101 -- 2 components.
    // K7V, 0.630 solar radii, 38.75 ly.
    hd97101: { hex: '599', x: -878287.737, y: -291648.839, z: 2268903.352, dist: 2450381.8, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd97101'), zlabel: loc('star_hd97101') + ' A' },
    // M2V, 0.446 solar radii, 38.75 ly.
    hd97101b: { hex: 'bac', x: -878619.792, y: -291830.822, z: 2268751.385, dist: 2450381.8, orbit: -2, size: 1.336, startype: 'M', zlabel: loc('star_hd97101') + ' B' },
    // Iota Pegasi -- single.
    // F5V, 1.473 solar radii, 38.83 ly.
    iotapegasi: { hex: 'f7a', x: 301485.3, y: 2218174.326, z: -1008800.481, dist: 2455375.6, orbit: -2, size: 2.427, startype: 'F', label: loc('star_iotapegasi'), zlabel: loc('star_iotapegasi') },
    // Lambda Serpentis -- single.
    // G0-V, 1.100 solar radii, 38.86 ly.
    lambdaserpentis: { hex: '481', x: 1699122.795, y: 477496.42, z: 1710532.989, dist: 2457833.2, orbit: -2, size: 2.098, startype: 'G', label: loc('star_lambdaserpentis'), zlabel: loc('star_lambdaserpentis') },
    // HD 110380 -- 2 components.
    // F0mF2V, 1.728 solar radii, 41.54 ly.
    hd110380: { hex: 'fc1', x: 588495.414, y: -1114603.968, z: 2304646.634, dist: 2626797.5, orbit: -2, size: 2.629, startype: 'F', label: loc('star_hd110380'), zlabel: loc('star_hd110380') + ' A' },
    // F1-F2V, 1.679 solar radii, 41.54 ly.
    hd110380b: { hex: 'a61', x: 588509.342, y: -1114595.413, z: 2304647.214, dist: 2626797.5, orbit: -2, size: 2.592, startype: 'F', zlabel: loc('star_hd110380') + ' B' },
    // Zeta2 Reticuli -- single.
    // G1V, 1.060 solar radii, 39.27 ly.
    zeta2reticuli: { hex: 'f7d', x: 262982.872, y: -1666090.411, z: -1822576.922, dist: 2483305, orbit: -2, size: 2.059, startype: 'G', label: loc('star_zeta2reticuli'), zlabel: loc('star_zeta2reticuli') },
    // Zeta1 Reticuli -- single.
    // G2.5VHdel1, 1.012 solar radii, 39.28 ly.
    zeta1reticuli: { hex: '824', x: 266789.652, y: -1666332.93, z: -1823293.732, dist: 2484399.8, orbit: -2, size: 2.012, startype: 'G', label: loc('star_zeta1reticuli'), zlabel: loc('star_zeta1reticuli') },
    // Zeta Trianguli Australis -- single.
    // F9V, 1.167 solar radii, 39.36 ly.
    zetatrianguliaustralis: { hex: '11f', x: 1832608.941, y: -1563493.342, z: -626299.967, dist: 2489019.6, orbit: -2, size: 2.161, startype: 'F', label: loc('star_zetatrianguliaustralis'), zlabel: loc('star_zetatrianguliaustralis') },
    // HD 72673 -- single.
    // K1V, 0.797 solar radii, 39.67 ly.
    hd72673: { hex: '56e', x: -761182.971, y: -2380895.933, z: 217525.208, dist: 2509060, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd72673'), zlabel: loc('star_hd72673') },
    // HD 37394 -- 2 components.
    // K0V, 0.813 solar radii, 40.02 ly.
    hd37394: { hex: '483', x: -2301965.301, y: 912133.615, z: 523838.779, dist: 2530896.9, orbit: -2, size: 1.803, startype: 'K', label: loc('star_hd37394'), zlabel: loc('star_hd37394') + ' A' },
    // M1.0V, 0.501 solar radii, 40.02 ly.
    hd37394b: { hex: '4e3', x: -2301823.087, y: 911828.885, z: 524992.957, dist: 2530896.9, orbit: -2, size: 1.416, startype: 'M', zlabel: loc('star_hd37394') + ' B' },
    // HD 175224 -- 2 components.
    // K5Ve, 0.701 solar radii, 40.26 ly.
    hd175224: { hex: '7d5', x: 2206674.76, y: -788251.91, z: -995988.089, dist: 2546123.9, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd175224'), zlabel: loc('star_hd175224') + ' A' },
    // K7Ve, 0.630 solar radii, 40.26 ly.
    hd175224b: { hex: 'dfd', x: 2206692.151, y: -788225.207, z: -995970.693, dist: 2546123.9, orbit: -2, size: 1.587, startype: 'K', zlabel: loc('star_hd175224') + ' B' },
    // 85 Pegasi -- single.
    // G5VbFe-2, 0.977 solar radii, 40.18 ly.
    pegasi85: { hex: '4fa', x: -702549.587, y: 1972302.447, z: -1439596.285, dist: 2540864.1, orbit: -2, size: 1.977, startype: 'G', label: loc('star_pegasi85'), zlabel: loc('star_pegasi85') },
    // HD 196877 -- single.
    // K7V, 0.630 solar radii, 40.25 ly.
    hd196877: { hex: 'a1b', x: 1948039.403, y: -495586.933, z: -1561930.53, dist: 2545602.3, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd196877'), zlabel: loc('star_hd196877') },
    // Beta Trianguli Australis -- single.
    // F1V, 1.679 solar radii, 40.52 ly.
    betatrianguliaustralis: { hex: '9fb', x: 1997862.257, y: -1569614.51, z: -335556.558, dist: 2562760.5, orbit: -2, size: 2.592, startype: 'F', label: loc('star_betatrianguliaustralis'), zlabel: loc('star_betatrianguliaustralis') },
    // HD 21531 -- single.
    // K5V, 0.701 solar radii, 40.75 ly.
    hd21531: { hex: 'f9d', x: -1327603.512, y: -763643.601, z: -2072524.429, dist: 2577021.6, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd21531'), zlabel: loc('star_hd21531') },
    // HD 133640 -- 2 components.
    // F5V, 1.473 solar radii, 42.22 ly.
    hd133640: { hex: '8c0', x: 242859.045, y: 1431265.864, z: 2241124.926, dist: 2670232.8, orbit: -2, size: 2.427, startype: 'F', label: loc('star_hd133640'), zlabel: loc('star_hd133640') + ' A' },
    // G9:, 0.853 solar radii, 42.22 ly.
    hd133640b: { hex: 'fb4', x: 242861.031, y: 1431302.835, z: 2241101.099, dist: 2670232.8, orbit: -2, size: 1.847, startype: 'G', zlabel: loc('star_hd133640') + ' B' },
    // Lambda Aurigae -- single.
    // G1.5IV-VFe-1, 1.060 solar radii, 40.97 ly.
    lambdaaurigae: { hex: 'a99', x: -2530610.16, y: 552688.168, z: 69680.158, dist: 2591198, orbit: -2, size: 2.059, startype: 'G', label: loc('star_lambdaaurigae'), zlabel: loc('star_lambdaaurigae') },
    // HD 69830 -- single.
    // G8:V, 0.914 solar radii, 41.03 ly.
    hd69830: { hex: '350', x: -1466875.823, y: -2061305.361, z: 575895.806, dist: 2594679.3, orbit: -2, size: 1.912, startype: 'G', label: loc('star_hd69830'), zlabel: loc('star_hd69830') },
    // Copernicus -- 2 components.
    // K0IV-V, 0.813 solar radii, 41.05 ly.
    copernicus: { hex: 'e16', x: -1966599.37, y: -593550.823, z: 1587617.576, dist: 2596217.5, orbit: -2, size: 1.803, startype: 'K', label: loc('star_copernicus'), zlabel: loc('star_copernicus') + ' A' },
    // M4.5V, 0.217 solar radii, 41.05 ly.
    copernicusb: { hex: '539', x: -1965971.338, y: -594235.698, z: 1588139.119, dist: 2596217.5, orbit: -2, size: 0.932, startype: 'M', zlabel: loc('star_copernicus') + ' B' },
    // HD 190007 -- single.
    // K5V, 0.701 solar radii, 41.47 ly.
    hd190007: { hex: 'd2a', x: 1819497.789, y: 1775579.587, z: -644367.035, dist: 2622682.6, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd190007'), zlabel: loc('star_hd190007') },
    // HD 104304B -- single.
    // G8IV, 2.194 solar radii, 41.64 ly.
    hd104304b: { hex: '1aa', x: 380447.925, y: -1632391.231, z: 2030683.684, dist: 2633081.5, orbit: -2, size: 2.962, startype: 'G', label: loc('star_hd104304b'), zlabel: loc('star_hd104304b') },
    // HD 101581 -- single.
    // K4.5Vk:, 0.713 solar radii, 41.69 ly.
    hd101581: { hex: '5b1', x: 859746.494, y: -2375009.736, z: 756726.441, dist: 2636753.7, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd101581'), zlabel: loc('star_hd101581') },
    // HD 82106 -- single.
    // K3V, 0.755 solar radii, 41.71 ly.
    hd82106: { hex: '3a3', x: -1407955.163, y: -1545734.12, z: 1608285.861, dist: 2637842.9, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd82106'), zlabel: loc('star_hd82106') },
    // HD 158633 -- single.
    // K0, 0.813 solar radii, 41.72 ly.
    hd158633: { hex: 'e47', x: -290523.281, y: 2189365.625, z: 1443611.683, dist: 2638511, orbit: -2, size: 1.803, startype: 'K', label: loc('star_hd158633'), zlabel: loc('star_hd158633') },
    // HD 14412 -- single.
    // G8V, 0.914 solar radii, 41.86 ly.
    hd14412: { hex: 'fcc', x: -731901.249, y: -502166.709, z: -2494104.113, dist: 2647339.5, orbit: -2, size: 1.912, startype: 'G', label: loc('star_hd14412'), zlabel: loc('star_hd14412') },
    // HD 147513 -- single.
    // G5V, 0.977 solar radii, 42.05 ly.
    hd147513: { hex: '6fc', x: 2503619.632, y: -831830.909, z: 333872.638, dist: 2659233.9, orbit: -2, size: 1.977, startype: 'G', label: loc('star_hd147513'), zlabel: loc('star_hd147513') },
    // 36 Ursae Majoris -- 2 components.
    // F8V, 1.221 solar radii, 42.22 ly.
    ursaemajoris36: { hex: 'eb8', x: -1491006.605, y: 717835.504, z: 2095541.318, dist: 2670146.4, orbit: -2, size: 2.21, startype: 'F', label: loc('star_ursaemajoris36'), zlabel: loc('star_ursaemajoris36') + ' A' },
    // K7Ve, 0.630 solar radii, 42.22 ly.
    ursaemajoris36b: { hex: 'fa9', x: -1492143.065, y: 718349.482, z: 2094556.043, dist: 2670146.4, orbit: -2, size: 1.587, startype: 'K', zlabel: loc('star_ursaemajoris36') + ' B' },
    // HD 36003 -- single.
    // K5V, 0.701 solar radii, 42.17 ly.
    hd36003: { hex: '48c', x: -2244086.74, y: -1113805.964, z: -913516.384, dist: 2666646.1, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd36003'), zlabel: loc('star_hd36003') },
    // HD 40307 -- single.
    // K2.5V, 0.783 solar radii, 42.18 ly.
    hd40307: { hex: '238', x: -47639.378, y: -2301636.31, z: -1347434.607, dist: 2667466.8, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd40307'), zlabel: loc('star_hd40307') },
    // HD 172051 -- single.
    // G6V, 0.949 solar radii, 42.50 ly.
    hd172051: { hex: '204', x: 2603380.205, y: 587895.189, z: -318084.875, dist: 2687822, orbit: -2, size: 1.948, startype: 'G', label: loc('star_hd172051'), zlabel: loc('star_hd172051') },
    // HD 27274 -- single.
    // K4.5Vk:, 0.713 solar radii, 42.54 ly.
    hd27274: { hex: '3ab', x: -256684.119, y: -1905867.779, z: -1881656.539, dist: 2690511.1, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd27274'), zlabel: loc('star_hd27274') },
    // Capella -- single.
    // G3III:, 10.020 solar radii, 42.80 ly.
    capella: { hex: '67a', x: -2574659.232, y: 807418.34, z: 215508.411, dist: 2706887.2, orbit: -2, size: 6.331, startype: 'G', label: loc('star_capella'), zlabel: loc('star_capella') },
    // HD 98712 -- 2 components.
    // K7V, 0.630 solar radii, 44.76 ly.
    hd98712: { hex: 'd4d', x: 234227.173, y: -2228548.603, z: 1729823.622, dist: 2830826.9, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd98712'), zlabel: loc('star_hd98712') + ' A' },
    // M2.5Ve, 0.421 solar radii, 44.76 ly.
    hd98712b: { hex: 'aab', x: 234183.303, y: -2228522.306, z: 1729863.44, dist: 2830826.9, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_hd98712') + ' B' },
    // HD 211970 -- single.
    // K7Vk:, 0.630 solar radii, 42.83 ly.
    hd211970: { hex: '939', x: 1556489.092, y: -652854.58, z: -2118054.774, dist: 2708326.7, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd211970'), zlabel: loc('star_hd211970') },
    // HD 170657 -- single.
    // K2V, 0.783 solar radii, 43.00 ly.
    hd170657: { hex: '8cb', x: 2633316.542, y: 648610.797, z: -201076.184, dist: 2719463.8, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd170657'), zlabel: loc('star_hd170657') },
    // HD 29697 -- single.
    // K4V, 0.713 solar radii, 43.09 ly.
    hd29697: { hex: 'aa0', x: -2611349.799, y: 83324.021, z: -775120.085, dist: 2725234.3, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd29697'), zlabel: loc('star_hd29697') },
    // HD 128165 -- single.
    // K3, 0.755 solar radii, 43.16 ly.
    hd128165: { hex: 'd4b', x: -90119.92, y: 1443213.077, z: 2314983.385, dist: 2729493.3, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd128165'), zlabel: loc('star_hd128165') },
    // 58 Eridani -- single.
    // G2.5IV-V, 1.012 solar radii, 43.18 ly.
    eridani58: { hex: '43c', x: -1828636.221, y: -1297805.644, z: -1558787.025, dist: 2730938.8, orbit: -2, size: 2.012, startype: 'G', label: loc('star_eridani58'), zlabel: loc('star_eridani58') },
    // HD 214749 -- single.
    // K4.5Vk, 0.713 solar radii, 43.30 ly.
    hd214749: { hex: '67b', x: 1237680.117, y: 452127.968, z: -2400463.792, dist: 2738338.6, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd214749'), zlabel: loc('star_hd214749') },
    // HD 120476a -- 2 components.
    // K4V, 0.713 solar radii, 44.02 ly.
    hd120476a: { hex: '084', x: 502659.91, y: 359382.419, z: 2714392.643, dist: 2783837.3, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd120476a'), zlabel: loc('star_hd120476a') + ' A' },
    // K6V, 0.669 solar radii, 44.02 ly.
    hd120476ab: { hex: '80d', x: 502694.539, y: 359348.886, z: 2714390.67, dist: 2783837.3, orbit: -2, size: 1.636, startype: 'K', zlabel: loc('star_hd120476a') + ' B' },
    // Titawin -- 2 components.
    // F9V, 1.167 solar radii, 43.96 ly.
    titawin: { hex: 'ead', x: -1740561.615, y: 1933029.015, z: -981149.942, dist: 2780073.9, orbit: -2, size: 2.161, startype: 'F', label: loc('star_titawin'), zlabel: loc('star_titawin') + ' A' },
    // M4.5V, 0.217 solar radii, 43.96 ly.
    titawinb: { hex: '0fb', x: -1740802.957, y: 1932547.261, z: -981670.652, dist: 2780073.9, orbit: -2, size: 0.932, startype: 'M', zlabel: loc('star_titawin') + ' B' },
    // Gliese 215 -- single.
    // K7V, 0.630 solar radii, 44.00 ly.
    gliese215: { hex: '8fc', x: -2325950.542, y: 1303576.968, z: 796971.923, dist: 2782898.3, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese215'), zlabel: loc('star_gliese215') },
    // HD 10436 -- single.
    // K5Vbe, 0.701 solar radii, 44.09 ly.
    hd10436: { hex: '4e9', x: -1740991.809, y: 2176607.413, z: 74624.78, dist: 2788232.6, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd10436'), zlabel: loc('star_hd10436') },
    // Theta Ursae Majoris -- single.
    // F7V, 1.324 solar radii, 44.18 ly.
    thetaursaemajoris: { hex: '865', x: -1890480.137, y: 490237.884, z: 1997823.523, dist: 2793840.9, orbit: -2, size: 2.301, startype: 'F', label: loc('star_thetaursaemajoris'), zlabel: loc('star_thetaursaemajoris') },
    // HD 145417 -- single.
    // K3VFe-1.7, 0.755 solar radii, 44.35 ly.
    hd145417: { hex: 'ad3', x: 2357279.067, y: -1501873.298, z: -229666.629, dist: 2804484.8, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd145417'), zlabel: loc('star_hd145417') },
    // Alshain -- 2 components.
    // G8IV, 2.194 solar radii, 44.36 ly.
    alshain: { hex: '59a', x: 1908012.1, y: 1984480.213, z: -539859.778, dist: 2805373.5, orbit: -2, size: 2.962, startype: 'G', label: loc('star_alshain'), zlabel: loc('star_alshain') + ' A' },
    // M3, 0.361 solar radii, 44.36 ly.
    alshainb: { hex: '2d4', x: 1907908.259, y: 1984601.802, z: -539779.801, dist: 2805373.5, orbit: -2, size: 1.202, startype: 'M', zlabel: loc('star_alshain') + ' B' },
    // HD 22496 -- single.
    // K5V, 0.701 solar radii, 44.36 ly.
    hd22496: { hex: '775', x: -356637.525, y: -1691645.976, z: -2209600.541, dist: 2805564.3, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd22496'), zlabel: loc('star_hd22496') },
    // 17 Piscium -- single.
    // F7V, 1.324 solar radii, 44.53 ly.
    piscium17: { hex: '5de', x: -72924.147, y: 1694798.072, z: -2248212.555, dist: 2816401.6, orbit: -2, size: 2.301, startype: 'F', label: loc('star_piscium17'), zlabel: loc('star_piscium17') },
    // Gliese 400 -- 2 components.
    // K7/M0V, 0.630 solar radii, 45.22 ly.
    gliese400: { hex: '84f', x: -1370705.088, y: -35884.94, z: 2509888.276, dist: 2860010.4, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese400'), zlabel: loc('star_gliese400') + ' A' },
    // K7/M0V, 0.630 solar radii, 45.22 ly.
    gliese400b: { hex: '2ac', x: -1370725.174, y: -35862.511, z: 2509877.627, dist: 2860010.4, orbit: -2, size: 1.587, startype: 'K', zlabel: loc('star_gliese400') + ' B' },
    // HD 154577 -- single.
    // K2.5Vk:, 0.783 solar radii, 44.77 ly.
    hd154577: { hex: '561', x: 2391960.047, y: -1391087.924, z: -599318.439, dist: 2831215.5, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd154577'), zlabel: loc('star_hd154577') },
    // HD 166 -- single.
    // G8V, 0.914 solar radii, 44.90 ly.
    hd166: { hex: '403', x: -865265.427, y: 2223464.755, z: -1539524.068, dist: 2839474.3, orbit: -2, size: 1.912, startype: 'G', label: loc('star_hd166'), zlabel: loc('star_hd166') },
    // Errai -- single.
    // K1III-IVCN1, 7.970 solar radii, 44.98 ly.
    errai: { hex: 'c77', x: -1329683.988, y: 2399577.763, z: 751295.818, dist: 2844376.6, orbit: -2, size: 5.646, startype: 'KIII', label: loc('star_errai'), zlabel: loc('star_errai') },
    // Chalawan -- single.
    // G1-VFe-0.5, 1.060 solar radii, 45.30 ly.
    chalawan: { hex: '235', x: -1280516.535, y: 94429.932, z: 2560621.149, dist: 2864510.5, orbit: -2, size: 2.059, startype: 'G', label: loc('star_chalawan'), zlabel: loc('star_chalawan') },
    // 10 Tauri -- single.
    // F9IV-V, 1.167 solar radii, 45.40 ly.
    tauri10: { hex: '3ca', x: -2136340.813, y: -191585.271, z: -1908833.41, dist: 2871289.3, orbit: -2, size: 2.161, startype: 'F', label: loc('star_tauri10'), zlabel: loc('star_tauri10') },
    // HD 281621 -- single.
    // K7V, 0.630 solar radii, 45.41 ly.
    hd281621: { hex: '319', x: -2677596.412, y: 799667.375, z: -662368.889, dist: 2871884.9, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd281621'), zlabel: loc('star_hd281621') },
    // HD 23356 -- single.
    // K2V, 0.783 solar radii, 45.46 ly.
    hd23356: { hex: 'b6b', x: -1594482.004, y: -953643.207, z: -2193714.619, dist: 2874750.8, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd23356'), zlabel: loc('star_hd23356') },
    // HD 5133 -- single.
    // K2.5Vk:, 0.783 solar radii, 45.47 ly.
    hd5133: { hex: '165', x: 73697.937, y: -145268.089, z: -2871119.574, dist: 2875736.7, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd5133'), zlabel: loc('star_hd5133') },
    // HD 20010 -- 2 components.
    // G7V, 0.927 solar radii, 45.93 ly.
    hd20010: { hex: 'aa7', x: -1061903.095, y: -1051901.144, z: -2490698.246, dist: 2904774, orbit: -2, size: 1.926, startype: 'G', label: loc('star_hd20010'), zlabel: loc('star_hd20010') + ' A' },
    // F6V, 1.359 solar radii, 45.93 ly.
    hd20010b: { hex: 'be9', x: -1061910.461, y: -1051964.119, z: -2490668.508, dist: 2904774, orbit: -2, size: 2.332, startype: 'F', zlabel: loc('star_hd20010') + ' B' },
    // HD 211415 -- single.
    // G0V, 1.100 solar radii, 45.88 ly.
    hd211415: { hex: 'e60', x: 1690440.643, y: -648522.82, z: -2267024.479, dist: 2901305.1, orbit: -2, size: 2.098, startype: 'G', label: loc('star_hd211415'), zlabel: loc('star_hd211415') },
    // HD 120467 -- single.
    // K6Va, 0.669 solar radii, 45.89 ly.
    hd120467: { hex: '17d', x: 1741438.947, y: -1443888.606, z: 1817660.642, dist: 2901950.1, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd120467'), zlabel: loc('star_hd120467') },
    // HD 61606B -- single.
    // K7V, 0.630 solar radii, 45.94 ly.
    hd61606b: { hex: 'ca6', x: -2139551.22, y: -1911111.726, z: 460007.747, dist: 2905449.1, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd61606b'), zlabel: loc('star_hd61606b') },
    // HD 110315 -- single.
    // K4.5V, 0.713 solar radii, 46.02 ly.
    hd110315: { hex: 'e8a', x: 215394.883, y: -565098.066, z: 2846553.254, dist: 2910085.3, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd110315'), zlabel: loc('star_hd110315') },
    // 18 Scorpii -- single.
    // G2Va, 1.012 solar radii, 46.11 ly.
    scorpii18: { hex: 'c76', x: 2537905.615, y: 208440.12, z: 1420657.032, dist: 2915935.3, orbit: -2, size: 2.012, startype: 'G', label: loc('star_scorpii18'), zlabel: loc('star_scorpii18') },
    // HD 188088 -- 2 components.
    // K3VaCN1, 0.755 solar radii, 46.13 ly.
    hd188088: { hex: '05f', x: 2548103.433, y: 787448.533, z: -1182563.94, dist: 2917424.2, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd188088'), zlabel: loc('star_hd188088') + ' A' },
    // M5, 0.196 solar radii, 46.13 ly.
    hd188088b: { hex: '8f2', x: 2547867.148, y: 787404.456, z: -1183102.272, dist: 2917424.2, orbit: -2, size: 0.885, startype: 'M', zlabel: loc('star_hd188088') + ' B' },
    // HD 150689 -- single.
    // K3V, 0.755 solar radii, 46.38 ly.
    hd150689: { hex: '03d', x: 2817368.397, y: -783128.786, z: 229127.695, dist: 2933147.6, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd150689'), zlabel: loc('star_hd150689') },
    // HD 234078 -- single.
    // K7V, 0.630 solar radii, 46.49 ly.
    hd234078: { hex: 'cb6', x: -221555.501, y: 1251030.702, z: 2651721.72, dist: 2940372.9, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd234078'), zlabel: loc('star_hd234078') },
    // HD 173818 -- single.
    // K5V, 0.701 solar radii, 46.51 ly.
    hd173818: { hex: '59d', x: 2566089.479, y: 1436408.77, z: -39732.54, dist: 2941031.1, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd173818'), zlabel: loc('star_hd173818') },
    // 1 Eridani -- single.
    // F7V, 1.324 solar radii, 46.56 ly.
    eridani1: { hex: '071', x: -1269682.856, y: -483163.469, z: -2612617.608, dist: 2944709.2, orbit: -2, size: 2.301, startype: 'F', label: loc('star_eridani1'), zlabel: loc('star_eridani1') },
    // HD 144579 -- 2 components.
    // G8V, 0.914 solar radii, 46.83 ly.
    hd144579: { hex: 'e0d', x: 914262.892, y: 1746546.711, z: 2210488.887, dist: 2961851.3, orbit: -2, size: 1.912, startype: 'G', label: loc('star_hd144579'), zlabel: loc('star_hd144579') + ' A' },
    // M4.0V, 0.274 solar radii, 46.83 ly.
    hd144579b: { hex: '179', x: 913736.869, y: 1745991.753, z: 2211144.704, dist: 2961851.3, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_hd144579') + ' B' },
    // Eta Cephei -- single.
    // K0IV, 1.951 solar radii, 46.86 ly.
    etacephei: { hex: '433', x: -397368.439, y: 2875363.206, z: 598135.51, dist: 2963677, orbit: -2, size: 2.794, startype: 'K', label: loc('star_etacephei'), zlabel: loc('star_etacephei') },
    // 26 Draconis -- single.
    // G0V, 1.100 solar radii, 47.08 ly.
    draconis26: { hex: '223', x: -43442.311, y: 2506323.055, z: 1606155.617, dist: 2977125.9, orbit: -2, size: 2.098, startype: 'G', label: loc('star_draconis26'), zlabel: loc('star_draconis26') },
    // 3 Ursae Majoris -- single.
    // G0.5V, 1.100 solar radii, 47.09 ly.
    ursaemajoris3: { hex: 'b4f', x: -2105978.176, y: 1188997.13, z: 1738094.836, dist: 2978226.3, orbit: -2, size: 2.098, startype: 'G', label: loc('star_ursaemajoris3'), zlabel: loc('star_ursaemajoris3') },
    // HD 97584 -- 2 components.
    // K4V, 0.713 solar radii, 47.18 ly.
    hd97584: { hex: '019', x: -1482164.058, y: 1651906.521, z: 1993828.566, dist: 2983447.3, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd97584'), zlabel: loc('star_hd97584') + ' A' },
    // M2.5V, 0.421 solar radii, 47.18 ly.
    hd97584b: { hex: '25a', x: -1482215.653, y: 1651944.862, z: 1993758.444, dist: 2983447.3, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_hd97584') + ' B' },
    // Theta Bootis -- 2 components.
    // F7V, 1.324 solar radii, 47.22 ly.
    thetabootis: { hex: '083', x: -100840.293, y: 1505468.449, z: 2577176.227, dist: 2986376, orbit: -2, size: 2.301, startype: 'F', label: loc('star_thetabootis'), zlabel: loc('star_thetabootis') + ' A' },
    // M2.5V, 0.421 solar radii, 47.22 ly.
    thetabootisb: { hex: '322', x: -100114.098, y: 1504877.788, z: 2577549.482, dist: 2986376, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_thetabootis') + ' B' },
    // HD 120036 -- 2 components.
    // K7V, 0.630 solar radii, 47.56 ly.
    hd120036: { hex: '0ab', x: 1908708.2, y: -1811714.592, z: 1456011.331, dist: 3007564.8, orbit: -2, size: 1.587, startype: 'K', label: loc('star_hd120036'), zlabel: loc('star_hd120036') + ' A' },
    // K6V, 0.669 solar radii, 47.56 ly.
    hd120036b: { hex: '4c8', x: 1908605.728, y: -1811771.429, z: 1456074.935, dist: 3007564.8, orbit: -2, size: 1.636, startype: 'K', zlabel: loc('star_hd120036') + ' B' },
    // Gliese 334 -- 2 components.
    // K7V, 0.630 solar radii, 47.29 ly.
    gliese334: { hex: 'cfe', x: -1431020.747, y: -2306172.967, z: 1255427.158, dist: 2990376.5, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese334'), zlabel: loc('star_gliese334') + ' A' },
    // M6Ve, 0.137 solar radii, 47.29 ly.
    gliese334b: { hex: '7ae', x: -1431094.15, y: -2306179.737, z: 1255331.044, dist: 2990376.5, orbit: -2, size: 0.74, startype: 'M', zlabel: loc('star_gliese334') + ' B' },
    // HD 110833 -- single.
    // K3, 0.755 solar radii, 47.30 ly.
    hd110833: { hex: 'a62', x: -726798.034, y: 1015171.885, z: 2718441.472, dist: 2991443.4, orbit: -2, size: 1.738, startype: 'K', label: loc('star_hd110833'), zlabel: loc('star_hd110833') },
    // Gliese 331.0 -- 2 components.
    // A7V(n), 1.750 solar radii, 47.96 ly.
    gliese3310: { hex: '773', x: -2269779.05, y: 338718.748, z: 1983443.262, dist: 3033261.4, orbit: -2, size: 2.646, startype: 'A', label: loc('star_gliese3310'), zlabel: loc('star_gliese3310') + ' A' },
    // M1V, 0.501 solar radii, 47.96 ly.
    gliese3310b: { hex: 'e55', x: -2269769.038, y: 338768.693, z: 1983446.19, dist: 3033261.4, orbit: -2, size: 1.416, startype: 'M', zlabel: loc('star_gliese3310') + ' B' },
    // Gliese 546 -- single.
    // K6V, 0.669 solar radii, 47.37 ly.
    gliese546: { hex: '448', x: 720182.311, y: 731167.881, z: 2814558.259, dist: 2995831.6, orbit: -2, size: 1.636, startype: 'K', label: loc('star_gliese546'), zlabel: loc('star_gliese546') },
    // 111 Tauri -- 2 components.
    // F8V, 1.221 solar radii, 47.55 ly.
    tauri111: { hex: '392', x: -2935523.633, y: -370882.151, z: -536909.976, dist: 3007178.9, orbit: -2, size: 2.21, startype: 'F', label: loc('star_tauri111'), zlabel: loc('star_tauri111') + ' A' },
    // K4V, 0.713 solar radii, 47.55 ly.
    tauri111b: { hex: 'b89', x: -2934084.909, y: -367962.782, z: -546693.727, dist: 3007178.9, orbit: -2, size: 1.689, startype: 'K', zlabel: loc('star_tauri111') + ' B' },
    // HD 221503 -- single.
    // K6V, 0.669 solar radii, 47.45 ly.
    hd221503: { hex: 'c54', x: 561028.495, y: 910698.993, z: -2803736.522, dist: 3000843.9, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd221503'), zlabel: loc('star_hd221503') },
    // 72 Herculis -- single.
    // G0V, 1.100 solar radii, 47.57 ly.
    herculis72: { hex: 'c82', x: 1426868.538, y: 2104767.623, z: 1608076.919, dist: 3008639.6, orbit: -2, size: 2.098, startype: 'G', label: loc('star_herculis72'), zlabel: loc('star_herculis72') },
    // HD 57095 -- 2 components.
    // K1V, 0.797 solar radii, 47.60 ly.
    hd57095: { hex: 'c83', x: -590068.972, y: -2842484.482, z: -796192.938, dist: 3010286.1, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd57095'), zlabel: loc('star_hd57095') + ' A' },
    // K4V, 0.713 solar radii, 47.60 ly.
    hd57095b: { hex: 'a2a', x: -590061.756, y: -2842483.156, z: -796203.018, dist: 3010286.1, orbit: -2, size: 1.689, startype: 'K', zlabel: loc('star_hd57095') + ' B' },
    // AG+10 687 -- single.
    // F0, 1.728 solar radii, 47.64 ly.
    ag10687: { hex: 'a80', x: -2851707.588, y: -937601.762, z: -257643.841, dist: 3012924.4, orbit: -2, size: 2.629, startype: 'F', label: loc('star_ag10687'), zlabel: loc('star_ag10687') },
    // HD 45088 -- single.
    // K2Ve, 0.783 solar radii, 47.67 ly.
    hd45088: { hex: 'e1b', x: -2928478.14, y: -698195.609, z: 162513.089, dist: 3014941.4, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd45088'), zlabel: loc('star_hd45088') },
    // Psi Capricorni -- single.
    // F5V, 1.473 solar radii, 47.73 ly.
    psicapricorni: { hex: 'd62', x: 2309019.606, y: 840582.036, z: -1752789.577, dist: 3018347.4, orbit: -2, size: 2.427, startype: 'F', label: loc('star_psicapricorni'), zlabel: loc('star_psicapricorni') },
    // HD 196761 -- single.
    // G7.5IV-V, 0.927 solar radii, 47.85 ly.
    hd196761: { hex: '73b', x: 2344261.08, y: 912279.656, z: -1682599.266, dist: 3026376.5, orbit: -2, size: 1.926, startype: 'G', label: loc('star_hd196761'), zlabel: loc('star_hd196761') },
    // Gliese 14 -- single.
    // K7V, 0.630 solar radii, 47.90 ly.
    gliese14: { hex: '4cd', x: -1234905.278, y: 2534703.252, z: -1108323.972, dist: 3029536.9, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese14'), zlabel: loc('star_gliese14') },
    // HD 10307 -- single.
    // G1V, 1.060 solar radii, 47.95 ly.
    hd10307: { hex: '3fd', x: -1941330.32, y: 2102666.16, z: -1002186.231, dist: 3032217.9, orbit: -2, size: 2.059, startype: 'G', label: loc('star_hd10307'), zlabel: loc('star_hd10307') },
    // Nu2 Lupi -- single.
    // G2-V, 1.012 solar radii, 48.07 ly.
    nu2lupi: { hex: 'ca2', x: 2530792.638, y: -1638669.628, z: 390412.265, dist: 3040159.7, orbit: -2, size: 2.012, startype: 'G', label: loc('star_nu2lupi'), zlabel: loc('star_nu2lupi') },
    // HD 142709 -- single.
    // K4V, 0.713 solar radii, 48.07 ly.
    hd142709: { hex: 'e41', x: 2740802.714, y: -1243561.515, z: 430177.773, dist: 3040312.1, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd142709'), zlabel: loc('star_hd142709') },
    // HD 52698 -- single.
    // K1V, 0.797 solar radii, 48.11 ly.
    hd52698: { hex: '45e', x: -1620846.111, y: -2524865.792, z: -503018.431, dist: 3042222.4, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd52698'), zlabel: loc('star_hd52698') },
    // HD 176051 -- 2 components.
    // F9V, 1.167 solar radii, 48.58 ly.
    hd176051: { hex: 'f17', x: 1341267.616, y: 2672430.717, z: 704942.154, dist: 3072104.8, orbit: -2, size: 2.161, startype: 'F', label: loc('star_hd176051'), zlabel: loc('star_hd176051') + ' A' },
    // K1V, 0.797 solar radii, 48.58 ly.
    hd176051b: { hex: 'c60', x: 1341269.251, y: 2672425.046, z: 704960.543, dist: 3072104.8, orbit: -2, size: 1.785, startype: 'K', zlabel: loc('star_hd176051') + ' B' },
    // Gliese 116 -- single.
    // K5V, 0.701 solar radii, 48.20 ly.
    gliese116: { hex: 'd41', x: -2432902.412, y: 1430933.861, z: -1150276.577, dist: 3047904.5, orbit: -2, size: 1.675, startype: 'K', label: loc('star_gliese116'), zlabel: loc('star_gliese116') },
    // Psi Serpentis -- single.
    // G2.5V, 1.012 solar radii, 48.25 ly.
    psiserpentis: { hex: '7b1', x: 2236232.193, y: 382185.019, z: 2040382.701, dist: 3051222.9, orbit: -2, size: 2.012, startype: 'G', label: loc('star_psiserpentis'), zlabel: loc('star_psiserpentis') },
    // HD 205390 -- single.
    // K1V, 0.797 solar radii, 48.32 ly.
    hd205390: { hex: 'b02', x: 2047116.712, y: -494669.326, z: -2214118.414, dist: 3055765.8, orbit: -2, size: 1.785, startype: 'K', label: loc('star_hd205390'), zlabel: loc('star_hd205390') },
    // HD 144628 -- single.
    // K2V, 0.783 solar radii, 48.36 ly.
    hd144628: { hex: 'c6b', x: 2584767.434, y: -1623787.289, z: -186443.496, dist: 3058180.7, orbit: -2, size: 1.77, startype: 'K', label: loc('star_hd144628'), zlabel: loc('star_hd144628') },
    // HD 218511 -- single.
    // K6V, 0.669 solar radii, 48.39 ly.
    hd218511: { hex: 'd23', x: 1528848.704, y: -1444039.114, z: -2223523.577, dist: 3060503.9, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd218511'), zlabel: loc('star_hd218511') },
    // HD 36705 -- 2 components.
    // K0V, 0.813 solar radii, 48.44 ly.
    hd36705: { hex: '4b8', x: 237226.298, y: -2556831.109, z: -1670463.232, dist: 3063349.3, orbit: -2, size: 1.803, startype: 'K', label: loc('star_hd36705'), zlabel: loc('star_hd36705') + ' A' },
    // M5+M5-6, 0.196 solar radii, 48.44 ly.
    hd36705b: { hex: '65f', x: 237093.208, y: -2556815.387, z: -1670506.19, dist: 3063349.3, orbit: -2, size: 0.885, startype: 'M', zlabel: loc('star_hd36705') + ' B' },
    // Rasalhague -- single.
    // A5IVnn, 4.284 solar radii, 48.59 ly.
    rasalhague: { hex: '307', x: 2298536.731, y: 1663480.832, z: 1179210.795, dist: 3072617.4, orbit: -2, size: 4.14, startype: 'A', label: loc('star_rasalhague'), zlabel: loc('star_rasalhague') },
    // 31 Aquilae -- single.
    // G7IVHdel1, 2.225 solar radii, 48.67 ly.
    aquilae31: { hex: 'b5f', x: 2083346.983, y: 2263390.934, z: -100247.541, dist: 3077876.3, orbit: -2, size: 2.983, startype: 'G', label: loc('star_aquilae31'), zlabel: loc('star_aquilae31') },
    // 20 Leonis Minoris -- 2 components.
    // G3VaHdel1, 1.002 solar radii, 48.68 ly.
    leonisminoris20: { hex: 'b1c', x: -1795660.652, y: -481666.961, z: 2454065.6, dist: 3078772.2, orbit: -2, size: 2.002, startype: 'G', label: loc('star_leonisminoris20'), zlabel: loc('star_leonisminoris20') + ' A' },
    // M6.0V, 0.137 solar radii, 48.68 ly.
    leonisminoris20b: { hex: 'c3d', x: -1797279.183, y: -481654.428, z: 2452882.948, dist: 3078772.2, orbit: -2, size: 0.74, startype: 'M', zlabel: loc('star_leonisminoris20') + ' B' },
    // HD 84117 -- single.
    // F9V, 1.167 solar radii, 48.77 ly.
    hd84117: { hex: 'a45', x: -660101.268, y: -2791941.97, z: 1131481.1, dist: 3083978.5, orbit: -2, size: 2.161, startype: 'F', label: loc('star_hd84117'), zlabel: loc('star_hd84117') },
    // Eta Leporis -- single.
    // F2V, 1.622 solar radii, 48.78 ly.
    etaleporis: { hex: 'c90', x: -2249619.652, y: -1871339.586, z: -977471.603, dist: 3085150.1, orbit: -2, size: 2.547, startype: 'F', label: loc('star_etaleporis'), zlabel: loc('star_etaleporis') },
    // Alchiba -- single.
    // F1V, 1.679 solar radii, 48.85 ly.
    alchiba: { hex: '020', x: 869079.25, y: -2305001.47, z: 1864092.463, dist: 3089202.4, orbit: -2, size: 2.592, startype: 'F', label: loc('star_alchiba'), zlabel: loc('star_alchiba') },
    // Alderamin -- single.
    // A8Vn, 1.747 solar radii, 49.05 ly.
    alderamin: { hex: '9c6', x: -584216.381, y: 3005820.883, z: 494407.46, dist: 3101726.4, orbit: -2, size: 2.643, startype: 'A', label: loc('star_alderamin'), zlabel: loc('star_alderamin') },
    // HD 200779 -- single.
    // K6V, 0.669 solar radii, 49.07 ly.
    hd200779: { hex: '90d', x: 1550381.586, y: 2332072.254, z: -1337644.669, dist: 3103471.8, orbit: -2, size: 1.636, startype: 'K', label: loc('star_hd200779'), zlabel: loc('star_hd200779') },
    // HD 4391 -- single.
    // G3V, 1.002 solar radii, 49.08 ly.
    hd4391: { hex: 'a0e', x: 632579.802, y: -881162.994, z: -2908319.762, dist: 3104018.2, orbit: -2, size: 2.002, startype: 'G', label: loc('star_hd4391'), zlabel: loc('star_hd4391') },
    // Gliese 52 -- single.
    // K7V, 0.630 solar radii, 49.14 ly.
    gliese52: { hex: 'cca', x: -1766962.954, y: 2556082.775, z: 60864.487, dist: 3107961, orbit: -2, size: 1.587, startype: 'K', label: loc('star_gliese52'), zlabel: loc('star_gliese52') },
    // HD 118926 -- single.
    // K5V, 0.701 solar radii, 49.27 ly.
    hd118926: { hex: '5ca', x: 1412869.979, y: -976282.553, z: 2599707.391, dist: 3115735.5, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd118926'), zlabel: loc('star_hd118926') },
    // HD 122742 -- single.
    // G6V, 0.949 solar radii, 49.31 ly.
    hd122742: { hex: 'd80', x: 1235260.761, y: -163552.828, z: 2858509.247, dist: 3118283.8, orbit: -2, size: 1.948, startype: 'G', label: loc('star_hd122742'), zlabel: loc('star_hd122742') },
    // HD 224953 -- 2 components.
    // K5V, 0.701 solar radii, 49.56 ly.
    hd224953: { hex: '2c9', x: 1335708.762, y: -1606820.479, z: -2336241.188, dist: 3134328.1, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd224953'), zlabel: loc('star_hd224953') + ' A' },
    // K5/M0V, 0.701 solar radii, 49.56 ly.
    hd224953b: { hex: '68f', x: 1335672.07, y: -1606872.593, z: -2336226.322, dist: 3134328.1, orbit: -2, size: 1.675, startype: 'K', zlabel: loc('star_hd224953') + ' B' },
    // HD 38858 -- single.
    // G2V, 1.012 solar radii, 49.61 ly.
    hd38858: { hex: 'a10', x: -2630067.403, y: -1480642.855, z: -856446.871, dist: 3137365, orbit: -2, size: 2.012, startype: 'G', label: loc('star_hd38858'), zlabel: loc('star_hd38858') },
    // HD 140901 -- 2 components.
    // G7IV, 2.225 solar radii, 49.73 ly.
    hd140901: { hex: 'd2d', x: 2824145.681, y: -1189310.812, z: 706815.333, dist: 3144812.7, orbit: -2, size: 2.983, startype: 'G', label: loc('star_hd140901'), zlabel: loc('star_hd140901') + ' A' },
    // DA4.8, 0.013 solar radii, 49.73 ly.
    hd140901b: { hex: 'b61', x: 2824204.476, y: -1189298.615, z: 706600.896, dist: 3144812.7, orbit: -2, size: 0.224, startype: 'D', zlabel: loc('star_hd140901') + ' B' },
    // HD 238090 -- 2 components.
    // K5V, 0.701 solar radii, 49.73 ly.
    hd238090: { hex: '292', x: -1052641.02, y: 1054683.732, z: 2769902.876, dist: 3145277.9, orbit: -2, size: 1.675, startype: 'K', label: loc('star_hd238090'), zlabel: loc('star_hd238090') + ' A' },
    // dM4.0, 0.274 solar radii, 49.73 ly.
    hd238090b: { hex: 'ce2', x: -1052688.541, y: 1054881.486, z: 2769809.509, dist: 3145277.9, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_hd238090') + ' B' },
    // Nu Phoenicis -- single.
    // F9VFe+0.4, 1.167 solar radii, 49.77 ly.
    nuphoenicis: { hex: 'a4a', x: 351760.744, y: -962608.434, z: -2976271.16, dist: 3147783.4, orbit: -2, size: 2.161, startype: 'F', label: loc('star_nuphoenicis'), zlabel: loc('star_nuphoenicis') },
    // 171 Puppis -- single.
    // F9V, 1.167 solar radii, 49.83 ly.
    puppis171: { hex: 'fb5', x: -1119814.437, y: -2933743.483, z: -264004.017, dist: 3151274.9, orbit: -2, size: 2.161, startype: 'F', label: loc('star_puppis171'), zlabel: loc('star_puppis171') },
    // HD 24916 -- 2 components.
    // K4V, 0.713 solar radii, 49.85 ly.
    hd24916: { hex: '3c1', x: -2426193.311, y: -460611.567, z: -1959724.135, dist: 3152633.1, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd24916'), zlabel: loc('star_hd24916') + ' A' },
    // M2.5V, 0.421 solar radii, 49.85 ly.
    hd24916b: { hex: '099', x: -2426292.706, y: -460521.619, z: -1959622.215, dist: 3152633.1, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_hd24916') + ' B' },
    // 19 Draconis -- single.
    // F8V, 1.221 solar radii, 49.95 ly.
    draconis19: { hex: '763', x: -251388.715, y: 2528293.698, z: 1877503.337, dist: 3159190.4, orbit: -2, size: 2.21, startype: 'F', label: loc('star_draconis19'), zlabel: loc('star_draconis19') },
    // HD 21197 -- single.
    // K4V, 0.713 solar radii, 49.98 ly.
    hd21197: { hex: 'd2c', x: -2108634.715, y: -339103.979, z: -2329858.039, dist: 3160628.2, orbit: -2, size: 1.689, startype: 'K', label: loc('star_hd21197'), zlabel: loc('star_hd21197') },
    // --- M dwarfs, 20 to 30 light years ------------------------------------------------------
    // M0V, 0.588 solar radii, 20.11 ly.
    hd191849: { hex: '269', x: 1062325.788, y: -96553.943, z: -692057.697, dist: 1271535.5, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd191849'), zlabel: loc('star_hd191849') },
    // G 202-48.
    // M1.5V, 0.482 solar radii, 21.13 ly.
    g20248: { hex: '5df', x: 115928.513, y: 973870.836, z: 907714.943, dist: 1336342.1, orbit: -2, size: 1.389, startype: 'M', label: loc('star_g20248'), zlabel: loc('star_g20248') },
    // HD 216899.
    // M1.5V, 0.482 solar radii, 22.40 ly.
    hd216899: { hex: '5eb', x: 57063.345, y: 1111790.528, z: -875744.775, dist: 1416426.2, orbit: -2, size: 1.389, startype: 'M', label: loc('star_hd216899'), zlabel: loc('star_hd216899') },
    // HD 199305.
    // M1.0V, 0.501 solar radii, 22.96 ly.
    hd199305: { hex: '93e', x: -215837.269, y: 1408452.44, z: 279320.811, dist: 1452013.8, orbit: -2, size: 1.416, startype: 'M', label: loc('star_hd199305'), zlabel: loc('star_hd199305') },
    // BD+11 2576.
    // M1.0V, 0.501 solar radii, 24.88 ly.
    bd112576: { hex: '045', x: 458605.055, y: -231347.387, z: 1487113.923, dist: 1573323.9, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd112576'), zlabel: loc('star_bd112576') },
    // HD 165222.
    // M0V, 0.588 solar radii, 25.24 ly.
    hd165222: { hex: '911', x: 1430809.775, y: 663449.258, z: 246233.478, dist: 1596249.5, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd165222'), zlabel: loc('star_hd165222') },
    // BD+18 3421.
    // M1.5V, 0.482 solar radii, 26.61 ly.
    bd183421: { hex: '24d', x: 1135649.899, y: 1031196.906, z: 692509.894, dist: 1683044.2, orbit: -2, size: 1.389, startype: 'M', label: loc('star_bd183421'), zlabel: loc('star_bd183421') },
    // BD+36 2219.
    // M1.5V, 0.482 solar radii, 28.59 ly.
    bd362219: { hex: 'bd7', x: -474130.991, y: 25653.847, z: 1744521.441, dist: 1807986, orbit: -2, size: 1.389, startype: 'M', label: loc('star_bd362219'), zlabel: loc('star_bd362219') },
    // FL Aquarii -- 2 components.
    // M3.5V, 0.3 solar radii, 28.87 ly.
    flaquarii: { hex: 'c03', x: 741097.016, y: 575498.648, z: -1565973.141, dist: 1825567.1, orbit: -2, size: 1.095, startype: 'M', label: loc('star_flaquarii'), zlabel: loc('star_flaquarii') + ' A' },
    // M0Vep, 0.588 solar radii, 28.87 ly.
    flaquariib: { hex: 'bc2', x: 741144.721, y: 575292.728, z: -1566026.225, dist: 1825567.1, orbit: -2, size: 1.534, startype: 'M', zlabel: loc('star_flaquarii') + ' B' },
    // --- M dwarfs, 30 to 50 light years ------------------------------------------------------
    // CD-45 5378.
    // M1V, 0.501 solar radii, 30.72 ly.
    cd455378: { hex: 'bb6', x: 75666.288, y: -1931769.381, z: 191672.815, dist: 1942729.2, orbit: -2, size: 1.416, startype: 'M', label: loc('star_cd455378'), zlabel: loc('star_cd455378') },
    // CD-48 11837 -- 2 components.
    // M1.5V, 0.482 solar radii, 31.57 ly.
    cd4811837: { hex: '419', x: 1878027.133, y: -607416.805, z: -300773.687, dist: 1996598.6, orbit: -2, size: 1.389, startype: 'M', label: loc('star_cd4811837'), zlabel: loc('star_cd4811837') + ' A' },
    // M3V, 0.361 solar radii, 31.57 ly.
    cd4811837b: { hex: '5b5', x: 1878036.251, y: -607403.108, z: -300744.417, dist: 1996598.6, orbit: -2, size: 1.202, startype: 'M', zlabel: loc('star_cd4811837') + ' B' },
    // AU Microscopii.
    // M1VeBa1, 0.501 solar radii, 31.68 ly.
    aumicroscopii: { hex: 'd39', x: 1565381.606, y: 351471.045, z: -1200318.93, dist: 2003675.9, orbit: -2, size: 1.416, startype: 'M', label: loc('star_aumicroscopii'), zlabel: loc('star_aumicroscopii') },
    // BD+61 195 -- 2 components.
    // M1.5V, 0.482 solar radii, 32.16 ly.
    bd61195: { hex: '329', x: -1144009.926, y: 1681318.803, z: -17690.086, dist: 2033692.3, orbit: -2, size: 1.389, startype: 'M', label: loc('star_bd61195'), zlabel: loc('star_bd61195') + ' A' },
    // M5V, 0.196 solar radii, 32.16 ly.
    bd61195b: { hex: '3c8', x: -1146307.862, y: 1679761.684, z: -16838.516, dist: 2033692.3, orbit: -2, size: 0.885, startype: 'M', zlabel: loc('star_bd61195') + ' B' },
    // HD 232979.
    // M0.5V, 0.544 solar radii, 32.32 ly.
    hd232979: { hex: 'b90', x: -1820765.944, y: 918281.883, z: 138541.515, dist: 2043923.7, orbit: -2, size: 1.475, startype: 'M', label: loc('star_hd232979'), zlabel: loc('star_hd232979') },
    // HD 260655.
    // M0.0V, 0.588 solar radii, 32.61 ly.
    hd260655: { hex: '33c', x: -1978330.492, y: -555095.644, z: 174988.287, dist: 2062169.6, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd260655'), zlabel: loc('star_hd260655') },
    // BD+05 3409.
    // M1.0V, 0.501 solar radii, 33.00 ly.
    bd053409: { hex: '7a2', x: 1716062.26, y: 934647.502, z: 732247.87, dist: 2086773.2, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd053409'), zlabel: loc('star_bd053409') },
    // HD 122303.
    // M0V, 0.588 solar radii, 33.99 ly.
    hd122303: { hex: '5e5', x: 1095137.617, y: -509380.141, z: 1778128.816, dist: 2149543.3, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd122303'), zlabel: loc('star_hd122303') },
    // HD 304636.
    // M0V, 0.588 solar radii, 34.08 ly.
    hd304636: { hex: '487', x: 356070.2, y: -2108015.667, z: -274032.366, dist: 2155367.7, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd304636'), zlabel: loc('star_hd304636') },
    // BD+02 348.
    // M1V, 0.501 solar radii, 34.27 ly.
    bd02348: { hex: 'faf', x: -1196396.203, y: 471215.778, z: -1744946.89, dist: 2167544.2, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd02348'), zlabel: loc('star_bd02348') },
    // BD+63 869.
    // M0.5V, 0.544 solar radii, 34.32 ly.
    bd63869: { hex: '7a5', x: -1333018.501, y: 794066.977, z: 1517212.959, dist: 2170118.9, orbit: -2, size: 1.475, startype: 'M', label: loc('star_bd63869'), zlabel: loc('star_bd63869') },
    // HD 209290.
    // M0.5V, 0.544 solar radii, 34.49 ly.
    hd209290: { hex: 'd69', x: 806648.619, y: 1454981.382, z: -1410707.011, dist: 2181226.1, orbit: -2, size: 1.475, startype: 'M', label: loc('star_hd209290'), zlabel: loc('star_hd209290') },
    // HD 111631.
    // M0V, 0.588 solar radii, 34.75 ly.
    hd111631: { hex: '323', x: 553268.04, y: -866732.752, z: 1942310.388, dist: 2197703.5, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd111631'), zlabel: loc('star_hd111631') },
    // HD 147379 -- 2 components.
    // M1-Ve, 0.501 solar radii, 35.12 ly.
    hd147379: { hex: '30a', x: -294763.042, y: 1688867.809, z: 1411738.593, dist: 2220847.9, orbit: -2, size: 1.416, startype: 'M', label: loc('star_hd147379'), zlabel: loc('star_hd147379') + ' A' },
    // M3.0V, 0.361 solar radii, 35.12 ly.
    hd147379b: { hex: '6dd', x: -295340.137, y: 1689049.869, z: 1411400.129, dist: 2220847.9, orbit: -2, size: 1.202, startype: 'M', zlabel: loc('star_hd147379') + ' B' },
    // CD-51 5974.
    // M0V, 0.588 solar radii, 35.95 ly.
    cd515974: { hex: '8bf', x: 852567.861, y: -2072798.55, z: 380189.641, dist: 2273303.8, orbit: -2, size: 1.534, startype: 'M', label: loc('star_cd515974'), zlabel: loc('star_cd515974') },
    // HD 11507.
    // M0V, 0.588 solar radii, 36.07 ly.
    hd11507: { hex: 'e17', x: -551192.042, y: -175463.377, z: -2206703.808, dist: 2281258.8, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd11507'), zlabel: loc('star_hd11507') },
    // HD 176029.
    // M1.0V, 0.501 solar radii, 36.23 ly.
    hd176029: { hex: '4c5', x: 1781827.494, y: 1439674.124, z: 49454.134, dist: 2291291.5, orbit: -2, size: 1.416, startype: 'M', label: loc('star_hd176029'), zlabel: loc('star_hd176029') },
    // BD-11 916.
    // M1V, 0.501 solar radii, 36.57 ly.
    bd11916: { hex: '61e', x: -1685638.609, y: -881904.237, z: -1315001.974, dist: 2312652.8, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd11916'), zlabel: loc('star_bd11916') },
    // HD 28343.
    // M0.5V, 0.544 solar radii, 36.62 ly.
    hd28343: { hex: '290', x: -2194724.629, y: 175070.491, z: -719122.149, dist: 2316161.2, orbit: -2, size: 1.475, startype: 'M', label: loc('star_hd28343'), zlabel: loc('star_hd28343') },
    // OT Serpentis.
    // M1.0V, 0.501 solar radii, 37.35 ly.
    otserpentis: { hex: 'd50', x: 1153674.843, y: 694757.665, z: 1940502.022, dist: 2362033.4, orbit: -2, size: 1.416, startype: 'M', label: loc('star_otserpentis'), zlabel: loc('star_otserpentis') },
    // DT Virginis -- 2 components.
    // M0V, 0.588 solar radii, 37.53 ly.
    dtvirginis: { hex: 'b5b', x: 407370.238, y: -455218.392, z: 2293603.391, dist: 2373560.8, orbit: -2, size: 1.534, startype: 'M', label: loc('star_dtvirginis'), zlabel: loc('star_dtvirginis') + ' A' },
    // T8.5p, 0.097 solar radii, 37.53 ly.
    dtvirginisb: { hex: 'e4f', x: 407222.424, y: -456363.161, z: 2293402.14, dist: 2373560.8, orbit: -2, size: 0.623, startype: 'T', zlabel: loc('star_dtvirginis') + ' B' },
    // HD 75632 -- 2 components.
    // M1V, 0.501 solar radii, 37.77 ly.
    hd75632: { hex: 'c13', x: -1556394.567, y: 1163899.072, z: 1388646.321, dist: 2388590.3, orbit: -2, size: 1.416, startype: 'M', label: loc('star_hd75632'), zlabel: loc('star_hd75632') + ' A' },
    // M1V, 0.501 solar radii, 37.77 ly.
    hd75632b: { hex: '3e2', x: -1556396.18, y: 1163884.936, z: 1388656.362, dist: 2388590.3, orbit: -2, size: 1.416, startype: 'M', zlabel: loc('star_hd75632') + ' B' },
    // BD+45 2247.
    // M0V, 0.588 solar radii, 38.19 ly.
    bd452247: { hex: '622', x: 284164.214, y: 1230506.092, z: 2058409.952, dist: 2414942.3, orbit: -2, size: 1.534, startype: 'M', label: loc('star_bd452247'), zlabel: loc('star_bd452247') },
    // G 234-5.
    // M0V, 0.588 solar radii, 38.51 ly.
    g2345: { hex: '609', x: -1911494.545, y: 949188.953, z: 1172862.96, dist: 2435236.9, orbit: -2, size: 1.534, startype: 'M', label: loc('star_g2345'), zlabel: loc('star_g2345') },
    // Wolf 918.
    // M1V, 0.501 solar radii, 38.63 ly.
    wolf918: { hex: '24a', x: 1583515.726, y: 1160504.995, z: -1453494.861, dist: 2442732.3, orbit: -2, size: 1.416, startype: 'M', label: loc('star_wolf918'), zlabel: loc('star_wolf918') },
    // DS Leonis.
    // M1.0Ve, 0.501 solar radii, 38.94 ly.
    dsleonis: { hex: '2fd', x: -818298.017, y: -656753.414, z: 2227712.466, dist: 2462445.8, orbit: -2, size: 1.416, startype: 'M', label: loc('star_dsleonis'), zlabel: loc('star_dsleonis') },
    // BD+47 612.
    // M0V, 0.588 solar radii, 38.99 ly.
    bd47612: { hex: '6c9', x: -1798591.468, y: 1602938.049, z: -523760.272, dist: 2465495.2, orbit: -2, size: 1.534, startype: 'M', label: loc('star_bd47612'), zlabel: loc('star_bd47612') },
    // G 85-52.
    // M0V, 0.588 solar radii, 39.63 ly.
    g8552: { hex: '9ad', x: -2451944.339, y: -158555.997, z: -492500.831, dist: 2505938.6, orbit: -2, size: 1.534, startype: 'M', label: loc('star_g8552'), zlabel: loc('star_g8552') },
    // L 89-27.
    // M1.5V, 0.482 solar radii, 40.13 ly.
    l8927: { hex: '799', x: 614515.884, y: -1552660.063, z: -1910975.18, dist: 2537756.7, orbit: -2, size: 1.389, startype: 'M', label: loc('star_l8927'), zlabel: loc('star_l8927') },
    // CD-52 7989.
    // M1V, 0.501 solar radii, 41.67 ly.
    cd527989: { hex: '472', x: 2399516.319, y: -1033217.477, z: -347825.933, dist: 2635564.4, orbit: -2, size: 1.416, startype: 'M', label: loc('star_cd527989'), zlabel: loc('star_cd527989') },
    // BD-09 3070.
    // M1V, 0.501 solar radii, 41.72 ly.
    bd093070: { hex: '76b', x: -554609.438, y: -1989091.843, z: 1642461.606, dist: 2638514.4, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd093070'), zlabel: loc('star_bd093070') },
    // BD+18 2776.
    // M1V, 0.501 solar radii, 42.12 ly.
    bd182776: { hex: 'c47', x: 711662.871, y: -16641.73, z: 2566613.127, dist: 2663502.2, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd182776'), zlabel: loc('star_bd182776') },
    // BD+08 4887.
    // M0V, 0.588 solar radii, 42.34 ly.
    bd084887: { hex: 'a46', x: 508931.807, y: 1973665.499, z: -1736365.001, dist: 2677560.6, orbit: -2, size: 1.534, startype: 'M', label: loc('star_bd084887'), zlabel: loc('star_bd084887') },
    // BD-11 2741.
    // dM0.5, 0.544 solar radii, 42.82 ly.
    bd112741: { hex: 'ba0', x: -829087.566, y: -2165354.459, z: 1399265.355, dist: 2708152.4, orbit: -2, size: 1.475, startype: 'M', label: loc('star_bd112741'), zlabel: loc('star_bd112741') },
    // CD-55 1514.
    // M0Vk:, 0.588 solar radii, 42.94 ly.
    cd551514: { hex: '61f', x: -221036.021, y: -2476684.328, z: -1092247.584, dist: 2715847.4, orbit: -2, size: 1.534, startype: 'M', label: loc('star_cd551514'), zlabel: loc('star_cd551514') },
    // CD-53 570.
    // M1.5V, 0.482 solar radii, 43.07 ly.
    cd53570: { hex: '8cf', x: 23445.477, y: -1524578.841, z: -2257295.41, dist: 2724017.8, orbit: -2, size: 1.389, startype: 'M', label: loc('star_cd53570'), zlabel: loc('star_cd53570') },
    // HD 166348.
    // M0V, 0.588 solar radii, 43.08 ly.
    hd166348: { hex: '8d8', x: 2625681.677, y: -468151.493, z: -555507.531, dist: 2724327.2, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd166348'), zlabel: loc('star_hd166348') },
    // BD+57 2735.
    // M1.5V, 0.482 solar radii, 43.16 ly.
    bd572735: { hex: 'c85', x: -1001212.32, y: 2534851.856, z: -146844.359, dist: 2729370.5, orbit: -2, size: 1.389, startype: 'M', label: loc('star_bd572735'), zlabel: loc('star_bd572735') },
    // BD-07 4156.
    // M1V, 0.501 solar radii, 43.32 ly.
    bd074156: { hex: 'a3c', x: 2314857.208, y: 80020.577, z: 1462753.24, dist: 2739455.1, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd074156'), zlabel: loc('star_bd074156') },
    // BD+27 4120.
    // M1V, 0.501 solar radii, 43.44 ly.
    bd274120: { hex: '334', x: 506340.175, y: 2560780.579, z: -855270.882, dist: 2746901.1, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd274120'), zlabel: loc('star_bd274120') },
    // BD+46 1889.
    // M1.0V, 0.501 solar radii, 43.60 ly.
    bd461889: { hex: 'cfb', x: -166940.211, y: 987323.461, z: 2569380.315, dist: 2757606.2, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd461889'), zlabel: loc('star_bd461889') },
    // EG Camelopardalis -- 2 components.
    // M0.0V, 0.588 solar radii, 43.99 ly.
    egcamelopardalis: { hex: '6c3', x: -2415296.502, y: 1129953.691, z: 793526.248, dist: 2782110.1, orbit: -2, size: 1.534, startype: 'M', label: loc('star_egcamelopardalis'), zlabel: loc('star_egcamelopardalis') + ' A' },
    // M4.2V, 0.274 solar radii, 43.99 ly.
    egcamelopardalisb: { hex: '210', x: -2415724.075, y: 1128192.852, z: 794729.216, dist: 2782110.1, orbit: -2, size: 1.047, startype: 'M', zlabel: loc('star_egcamelopardalis') + ' B' },
    // BD+35 2436 -- 2 components.
    // M1V, 0.501 solar radii, 44.70 ly.
    bd352436: { hex: '6b1', x: 19851.028, y: 489946.162, z: 2783722.006, dist: 2826579.1, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd352436'), zlabel: loc('star_bd352436') + ' A' },
    // M3V, 0.361 solar radii, 44.70 ly.
    bd352436b: { hex: 'b0b', x: 20093.887, y: 489930.837, z: 2783722.961, dist: 2826579.1, orbit: -2, size: 1.202, startype: 'M', zlabel: loc('star_bd352436') + ' B' },
    // BD+36 1970.
    // M1V, 0.501 solar radii, 44.26 ly.
    bd361970: { hex: '9e4', x: -1889085.762, y: -255311.469, z: 2049359.62, dist: 2798875.5, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd361970'), zlabel: loc('star_bd361970') },
    // BD+09 2636.
    // M0V, 0.588 solar radii, 44.74 ly.
    bd092636: { hex: '496', x: 274459.033, y: -875929.709, z: 2676665.363, dist: 2829685.2, orbit: -2, size: 1.534, startype: 'M', label: loc('star_bd092636'), zlabel: loc('star_bd092636') },
    // G 125-30.
    // M1.5V, 0.482 solar radii, 44.86 ly.
    g12530: { hex: '829', x: 1079608.779, y: 2616762.772, z: 191650.425, dist: 2837205, orbit: -2, size: 1.389, startype: 'M', label: loc('star_g12530'), zlabel: loc('star_g12530') },
    // BD+52 911.
    // M0.5V, 0.544 solar radii, 45.19 ly.
    bd52911: { hex: '1d7', x: -2581516.242, y: 1175293.819, z: 349408.176, dist: 2857906.2, orbit: -2, size: 1.475, startype: 'M', label: loc('star_bd52911'), zlabel: loc('star_bd52911') },
    // HD 331161 -- 2 components.
    // M0.5V, 0.544 solar radii, 45.48 ly.
    hd331161: { hex: '5c0', x: 1106871.762, y: 2648540.586, z: 179800.449, dist: 2876153.8, orbit: -2, size: 1.475, startype: 'M', label: loc('star_hd331161'), zlabel: loc('star_hd331161') + ' A' },
    // M2.5V, 0.421 solar radii, 45.48 ly.
    hd331161b: { hex: 'bb2', x: 1106890.017, y: 2648537.731, z: 179730.109, dist: 2876153.8, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_hd331161') + ' B' },
    // Ross 987.
    // M0V, 0.588 solar radii, 45.73 ly.
    ross987: { hex: '36c', x: -2687559.091, y: 59122.999, z: 1066376.447, dist: 2891993.8, orbit: -2, size: 1.534, startype: 'M', label: loc('star_ross987'), zlabel: loc('star_ross987') },
    // HD 318327 -- 2 components.
    // M1.5, 0.482 solar radii, 46.15 ly.
    hd318327: { hex: '2c5', x: 2913861.55, y: -134259.178, z: -89444.612, dist: 2918324, orbit: -2, size: 1.389, startype: 'M', label: loc('star_hd318327'), zlabel: loc('star_hd318327') + ' A' },
    // M2.5, 0.421 solar radii, 46.15 ly.
    hd318327b: { hex: 'a0b', x: 2913861.44, y: -134093.963, z: -89695.687, dist: 2918324, orbit: -2, size: 1.298, startype: 'M', zlabel: loc('star_hd318327') + ' B' },
    // BD+67 552.
    // M0.5V, 0.544 solar radii, 46.19 ly.
    bd67552: { hex: '713', x: -2028751.795, y: 1272183.251, z: 1672344.609, dist: 2920791.1, orbit: -2, size: 1.475, startype: 'M', label: loc('star_bd67552'), zlabel: loc('star_bd67552') },
    // BD-02 2198.
    // M1.0V, 0.501 solar radii, 46.41 ly.
    bd022198: { hex: 'd61', x: -2195457.342, y: -1899383.62, z: 432666.199, dist: 2935113.5, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd022198'), zlabel: loc('star_bd022198') },
    // G 226-66.
    // M1V, 0.501 solar radii, 46.67 ly.
    g22666: { hex: 'db8', x: -32994.481, y: 2486291.347, z: 1589586.11, dist: 2951189.1, orbit: -2, size: 1.416, startype: 'M', label: loc('star_g22666'), zlabel: loc('star_g22666') },
    // CPD-58 7400.
    // M1V, 0.501 solar radii, 46.89 ly.
    cpd587400: { hex: 'eef', x: 2559186.407, y: -1095173.114, z: -1021646.776, dist: 2965232.1, orbit: -2, size: 1.416, startype: 'M', label: loc('star_cpd587400'), zlabel: loc('star_cpd587400') },
    // HD 23453.
    // M1V, 0.501 solar radii, 46.92 ly.
    hd23453: { hex: '2b2', x: -2655392.537, y: 715095.063, z: -1114438.861, dist: 2967228.4, orbit: -2, size: 1.416, startype: 'M', label: loc('star_hd23453'), zlabel: loc('star_hd23453') },
    // CD-38 1058.
    // M1.5V, 0.482 solar radii, 47.01 ly.
    cd381058: { hex: 'a04', x: -720047.571, y: -1373050.184, z: -2536319.646, dist: 2972650.8, orbit: -2, size: 1.389, startype: 'M', label: loc('star_cd381058'), zlabel: loc('star_cd381058') },
    // HD 184489.
    // M0V, 0.588 solar radii, 47.09 ly.
    hd184489: { hex: 'e91', x: 2194424.082, y: 1976084.839, z: -386884.625, dist: 2978269.3, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd184489'), zlabel: loc('star_hd184489') },
    // CD-36 2458.
    // M1.5V, 0.482 solar radii, 47.29 ly.
    cd362458: { hex: '353', x: -1251262.844, y: -2329622.595, z: -1396755.427, dist: 2990606.3, orbit: -2, size: 1.389, startype: 'M', label: loc('star_cd362458'), zlabel: loc('star_cd362458') },
    // HD 216133.
    // M0.5V, 0.544 solar radii, 47.32 ly.
    hd216133: { hex: '70a', x: 799657.675, y: 1519494.357, z: -2450703.815, dist: 2992367.7, orbit: -2, size: 1.475, startype: 'M', label: loc('star_hd216133'), zlabel: loc('star_hd216133') },
    // Wolf 1421.
    // M1.5V, 0.482 solar radii, 47.94 ly.
    wolf1421: { hex: 'b8d', x: -2650186.995, y: -976665.126, z: 1102065.022, dist: 3031816.8, orbit: -2, size: 1.389, startype: 'M', label: loc('star_wolf1421'), zlabel: loc('star_wolf1421') },
    // HD 19305.
    // M0V, 0.588 solar radii, 48.01 ly.
    hd19305: { hex: 'e80', x: -2090868.078, y: 126819.842, z: -2197988.835, dist: 3036275.3, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd19305'), zlabel: loc('star_hd19305') },
    // HD 150848.
    // M0V, 0.588 solar radii, 48.51 ly.
    hd150848: { hex: 'a52', x: 2950401.455, y: -807179.335, z: 236173.074, dist: 3067928.4, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd150848'), zlabel: loc('star_hd150848') },
    // BD+48 1829.
    // M1V, 0.501 solar radii, 48.79 ly.
    bd481829: { hex: '8ba', x: -1896559.588, y: 377881.143, z: 2404574.569, dist: 3085727, orbit: -2, size: 1.416, startype: 'M', label: loc('star_bd481829'), zlabel: loc('star_bd481829') },
    // BD+02 1729.
    // M0.0V, 0.588 solar radii, 49.17 ly.
    bd021729: { hex: 'c33', x: -2448320.563, y: -1810766.125, z: 628314.974, dist: 3109329.1, orbit: -2, size: 1.534, startype: 'M', label: loc('star_bd021729'), zlabel: loc('star_bd021729') },
    // YY Geminorum.
    // M0.5VeFe-2, 0.544 solar radii, 49.19 ly.
    yygeminorum: { hex: '4d1', x: -2849894.148, y: -373282.104, z: 1189281.572, dist: 3110567, orbit: -2, size: 1.475, startype: 'M', label: loc('star_yygeminorum'), zlabel: loc('star_yygeminorum') },
    // HD 229793.
    // M0V, 0.588 solar radii, 49.60 ly.
    hd229793: { hex: 'acc', x: 2088663.87, y: 2305108.972, z: 403366.455, dist: 3136678, orbit: -2, size: 1.534, startype: 'M', label: loc('star_hd229793'), zlabel: loc('star_hd229793') },
    // LP 905-56.
    // M1.5V, 0.482 solar radii, 49.97 ly.
    lp90556: { hex: '94e', x: 164877.747, y: -2866383.723, z: 1320882.318, dist: 3160390.9, orbit: -2, size: 1.389, startype: 'M', label: loc('star_lp90556'), zlabel: loc('star_lp90556') },
    // --- the stars of the twelve zodiac constellations ----------------------------------------
    // Deneb Algedi — Capricornus.
    // A5mF2 (IV), V 2.85, 1.44 solar radii, 38.7 ly.
    denebalgedi: { hex: '82e', x: 1346798.67, y: 1037219.997, z: -1761072.518, dist: 2447665.9, orbit: -2, size: 2.399, startype: 'A', label: loc('star_denebalgedi'), zlabel: loc('star_denebalgedi') },
    // Castor — Gemini.
    // A2Vm, V 1.58, 2.97 solar radii, 50.9 ly.
    castor: { hex: 'cf5', x: -2947390.694, y: -384933.192, z: 1229990.644, dist: 3216856, orbit: -2, size: 3.446, startype: 'A', label: loc('star_castor'), zlabel: loc('star_castor') },
    // Zosma — Leo.
    // A4V, V 2.56, 2.42 solar radii, 58.4 ly.
    zosma: { hex: '3f7', x: -1041949.993, y: -1014223.215, z: 3397061.667, dist: 3695177.5, orbit: -2, size: 3.108, startype: 'A', label: loc('star_zosma'), zlabel: loc('star_zosma') },
    // Sheratan — Aries.
    // A5V..., V 2.64, 2.40 solar radii, 58.7 ly.
    sheratan: { hex: 'b67', x: -2257315.881, y: 1748146.232, z: -2368779.418, dist: 3709798.7, orbit: -2, size: 3.1, startype: 'A', label: loc('star_sheratan'), zlabel: loc('star_sheratan') },
    // Alzirr — Gemini.
    // F5IV, V 3.35, 2.68 solar radii, 58.7 ly.
    alzirr: { hex: 'e0f', x: -3461197.74, y: -1310575.384, z: 291431.357, dist: 3712469.5, orbit: -2, size: 3.271, startype: 'F', label: loc('star_alzirr'), zlabel: loc('star_alzirr') },
    // Chi Cancri — Cancer.
    // F6V, V 5.13, 1.28 solar radii, 59.6 ly.
    chicancri: { hex: '604', x: -3125910.251, y: -883545.266, z: 1910932.618, dist: 3768770.4, orbit: -2, size: 2.262, startype: 'F', label: loc('star_chicancri'), zlabel: loc('star_chicancri') },
    // Mu Virginis — Virgo.
    // F2III, V 3.87, 1.96 solar radii, 59.6 ly.
    muvirginis: { hex: 'cf0', x: 2474554.834, y: -591742.084, z: 2780296.798, dist: 3768770.4, orbit: -2, size: 2.799, startype: 'F', label: loc('star_muvirginis'), zlabel: loc('star_muvirginis') },
    // Wasat — Gemini.
    // F0IV..., V 3.5, 2.09 solar radii, 60.5 ly.
    wasat: { hex: '4e5', x: -3535728.862, y: -1012845.775, z: 1046657.613, dist: 3823967.5, orbit: -2, size: 2.89, startype: 'F', label: loc('star_wasat'), zlabel: loc('star_wasat') },
    // Larawag — Scorpius.
    // K2IIIb, V 2.29, 8.72 solar radii, 63.7 ly.
    larawag: { hex: 'd36', x: 3926946.854, y: -776665.14, z: 460343.008, dist: 4029396.5, orbit: -2, size: 5.905, startype: 'KIII', label: loc('star_larawag'), zlabel: loc('star_larawag') },
    // Hamal — Aries.
    // K2III, V 2.01, 10.24 solar radii, 65.8 ly.
    hamal: { hex: '61d', x: -2736666.313, y: 1946449.882, z: -2458368.761, dist: 4161921, orbit: -2, size: 6.401, startype: 'KIII', label: loc('star_hamal'), zlabel: loc('star_hamal') },
    // Aldebaran — Taurus.
    // K5III, V 0.87, 27.43 solar radii, 66.6 ly.
    aldebaran: { hex: '44b', x: -3953624.047, y: -67037.968, z: -1458632.581, dist: 4214646.6, orbit: -2, size: 10.475, startype: 'KIII', label: loc('star_aldebaran'), zlabel: loc('star_aldebaran') },
    // Syrma — Virgo.
    // F7V, V 4.07, 2.60 solar radii, 72.5 ly.
    syrma: { hex: '8c1', x: 2667656.084, y: -1091831.83, z: 3567844.753, dist: 4586720.2, orbit: -2, size: 3.224, startype: 'F', label: loc('star_syrma'), zlabel: loc('star_syrma') },
    // Eta Scorpii — Scorpius.
    // F3p, V 3.32, 3.18 solar radii, 73.5 ly.
    etascorpii: { hex: 'e37', x: 4471100.421, y: -1251297.394, z: -186747.688, dist: 4646650.3, orbit: -2, size: 3.568, startype: 'F', label: loc('star_etascorpii'), zlabel: loc('star_etascorpii') },
    // Heze — Virgo.
    // A3V, V 3.38, 1.95 solar radii, 74.1 ly.
    heze: { hex: 'a6a', x: 1901875.662, y: -1319517.94, z: 4072789.711, dist: 4684642.4, orbit: -2, size: 2.792, startype: 'A', label: loc('star_heze'), zlabel: loc('star_heze') },
    // Zubenelgenubi — Libra.
    // A3IV, V 2.75, 2.67 solar radii, 75.8 ly.
    zubenelgenubi: { hex: 'c3e', x: 3556432.491, y: -1271555.798, z: 2951726.217, dist: 4793511.6, orbit: -2, size: 3.266, startype: 'A', label: loc('star_zubenelgenubi'), zlabel: loc('star_zubenelgenubi') },
    // Kaus Borealis — Sagittarius.
    // K1IIIb, V 2.82, 8.04 solar radii, 78.2 ly.
    kausborealis: { hex: '176', x: 4868193.15, y: 654809.254, z: -561536.432, dist: 4944027, orbit: -2, size: 5.671, startype: 'KIII', label: loc('star_kausborealis'), zlabel: loc('star_kausborealis') },
    // Regulus — Leo.
    // B7V, V 1.36, 3.18 solar radii, 79.3 ly.
    regulus: { hex: '606', x: -2270732.666, y: -2386821.34, z: 3781079.107, dist: 5014947.9, orbit: -2, size: 3.566, startype: 'B', label: loc('star_regulus'), zlabel: loc('star_regulus') },
    // Ascella — Sagittarius.
    // A3IV, V 2.6, 3.32 solar radii, 88.2 ly.
    ascella: { hex: '9b1', x: 5340386.27, y: 640612.689, z: -1476843.79, dist: 5577739.5, orbit: -2, size: 3.646, startype: 'A', label: loc('star_ascella'), zlabel: loc('star_ascella') },
    // Zeta1 Aquarii — Aquarius.
    // F3III-IV, V 3.65, 3.42 solar radii, 91.9 ly.
    zeta1aquarii: { hex: '15e', x: 1673033.688, y: 3646468.087, z: -4202801.278, dist: 5810276.2, orbit: -2, size: 3.698, startype: 'F', label: loc('star_zeta1aquarii'), zlabel: loc('star_zeta1aquarii') },
    // Alnasl — Sagittarius.
    // K0III, V 2.98, 8.77 solar radii, 96.9 ly.
    alnasl: { hex: '38b', x: 6106080.938, y: 97950.9, z: -484691.066, dist: 6126070.9, orbit: -2, size: 5.921, startype: 'KIII', label: loc('star_alnasl'), zlabel: loc('star_alnasl') },
    // Lambda Geminorum — Gemini.
    // A3V..., V 3.58, 2.42 solar radii, 100.9 ly.
    lambdageminorum: { hex: '73f', x: -5801429.318, y: -2217289.956, z: 1459865.978, dist: 6379981.6, orbit: -2, size: 3.112, startype: 'A', label: loc('star_lambdageminorum'), zlabel: loc('star_lambdageminorum') },
    // Omega Piscium — Pisces.
    // F4IV, V 4.03, 3.35 solar radii, 104.3 ly.
    omegapiscium: { hex: 'b8b', x: -723791.429, y: 3834734.551, z: -5320650.537, dist: 6598362.3, orbit: -2, size: 3.658, startype: 'F', label: loc('star_omegapiscium'), zlabel: loc('star_omegapiscium') },
    // Algedi — Capricornus.
    // G6/G8III, V 3.58, 6.20 solar radii, 105.8 ly.
    algedi: { hex: 'fc5', x: 5201896.594, y: 3137586.905, z: -2808242.506, dist: 6692563.5, orbit: -2, size: 4.98, startype: 'G', label: loc('star_algedi'), zlabel: loc('star_algedi') },
    // Lambda Piscium — Pisces.
    // A7V, V 4.49, 2.02 solar radii, 106.6 ly.
    lambdapiscium: { hex: '89e', x: -9437.473, y: 3710985.368, z: -5629829.155, dist: 6742883.5, orbit: -2, size: 2.843, startype: 'A', label: loc('star_lambdapiscium'), zlabel: loc('star_lambdapiscium') },
    // Alhena — Gemini.
    // A0IV, V 1.93, 4.77 solar radii, 109.3 ly.
    alhena: { hex: '6f8', x: -6598286.392, y: -1988805.849, z: 536638.763, dist: 6912359.5, orbit: -2, size: 4.367, startype: 'A', label: loc('star_alhena'), zlabel: loc('star_alhena') },
    // Vindemiatrix — Virgo.
    // G8IIIvar, V 2.85, 9.49 solar radii, 109.6 ly.
    vindemiatrix: { hex: 'd35', x: 1314998.937, y: -1443781.722, z: 6650129.032, dist: 6930941.1, orbit: -2, size: 6.163, startype: 'G', label: loc('star_vindemiatrix'), zlabel: loc('star_vindemiatrix') },
    // Iota Geminorum — Gemini.
    // G9III+..., V 3.78, 7.11 solar radii, 120.4 ly.
    iotageminorum: { hex: '3d1', x: -7056507.09, y: -1352000.114, z: 2511750.622, dist: 7611247.5, orbit: -2, size: 5.334, startype: 'G', label: loc('star_iotageminorum'), zlabel: loc('star_iotageminorum') },
    // Tau Sagittarii — Sagittarius.
    // K1/K2III, V 3.32, 9.94 solar radii, 121.6 ly.
    tausagittarii: { hex: 'd77', x: 7317503.924, y: 1202820.018, z: -2038224.684, dist: 7690708.7, orbit: -2, size: 6.304, startype: 'KIII', label: loc('star_tausagittarii'), zlabel: loc('star_tausagittarii') },
    // Rasalas — Leo.
    // K0III, V 3.88, 7.42 solar radii, 124.1 ly.
    rasalas: { hex: '253', x: -4583636.848, y: -2045095.342, z: 6034113.802, dist: 7848736.9, orbit: -2, size: 5.448, startype: 'KIII', label: loc('star_rasalas'), zlabel: loc('star_rasalas') },
    // Rho1 Sagittarii — Sagittarius.
    // F0III/IV, V 3.92, 3.61 solar radii, 127.0 ly.
    rho1sagittarii: { hex: 'a58', x: 7300209.655, y: 2665376.8, z: -2016784.319, dist: 8028992.1, orbit: -2, size: 3.801, startype: 'F', label: loc('star_rho1sagittarii'), zlabel: loc('star_rho1sagittarii') },
    // Algieba — Leo.
    // K0III, V 2.01, 18.40 solar radii, 130.1 ly.
    algieba: { hex: '128', x: -3823863.162, y: -2834739.446, z: 6710811.089, dist: 8227555.1, orbit: -2, size: 8.58, startype: 'KIII', label: loc('star_algieba'), zlabel: loc('star_algieba') },
    // Asellus Australis — Cancer.
    // K0III, V 3.94, 7.59 solar radii, 130.6 ly.
    asellusaustralis: { hex: '205', x: -6120022.803, y: -3257544.815, z: 4484979.538, dist: 8257198, orbit: -2, size: 5.511, startype: 'KIII', label: loc('star_asellusaustralis'), zlabel: loc('star_asellusaustralis') },
    // Elnath — Taurus.
    // B7III, V 1.65, 4.70 solar radii, 133.9 ly.
    elnath: { hex: '2e6', x: -8444095.577, y: 295757.441, z: -553086.502, dist: 8467356.6, orbit: -2, size: 4.334, startype: 'B', label: loc('star_elnath'), zlabel: loc('star_elnath') },
    // Arkab Posterior — Sagittarius.
    // F2III, V 4.27, 3.67 solar radii, 134.2 ly.
    arkabposterior: { hex: '25d', x: 7691052.775, y: -905814.88, z: -3466779.714, dist: 8484771.9, orbit: -2, size: 3.83, startype: 'F', label: loc('star_arkabposterior'), zlabel: loc('star_arkabposterior') },
    // 109 Virginis — Virgo.
    // A0V, V 3.73, 2.56 solar radii, 134.5 ly.
    virginis109: { hex: '7e9', x: 5139258.294, y: -424248.988, z: 6764323.954, dist: 8505765.2, orbit: -2, size: 3.201, startype: 'A', label: loc('star_virginis109'), zlabel: loc('star_virginis109') },
    // Gamma Piscium — Pisces.
    // G7III, V 3.7, 7.82 solar radii, 138.0 ly.
    gammapiscium: { hex: '596', x: 702603.301, y: 5322464.261, z: -6878054.491, dist: 8725245.6, orbit: -2, size: 5.594, startype: 'G', label: loc('star_gammapiscium'), zlabel: loc('star_gammapiscium') },
    // Kappa Geminorum — Gemini.
    // G8III, V 3.57, 8.79 solar radii, 141.4 ly.
    kappageminorum: { hex: '979', x: -7976249.482, y: -2264252.738, z: 3345285.441, dist: 8940823.8, orbit: -2, size: 5.93, startype: 'G', label: loc('star_kappageminorum'), zlabel: loc('star_kappageminorum') },
    // Omicron Sagittarii — Sagittarius.
    // K0III, V 3.76, 8.98 solar radii, 142.1 ly.
    omicronsagittarii: { hex: '575', x: 8482667.694, y: 2227627.471, z: -1946317.047, dist: 8983658.8, orbit: -2, size: 5.992, startype: 'KIII', label: loc('star_omicronsagittarii'), zlabel: loc('star_omicronsagittarii') },
    // Kaus Australis — Sagittarius.
    // B9.5III, V 1.79, 6.21 solar radii, 143.3 ly.
    kausaustralis: { hex: '676', x: 8929272.536, y: -125597.538, z: -1543716.259, dist: 9062601.3, orbit: -2, size: 4.986, startype: 'B', label: loc('star_kausaustralis'), zlabel: loc('star_kausaustralis') },
    // Eta Sagittarii — Sagittarius.
    // M2III, V 3.1, 52.78 solar radii, 145.9 ly.
    etasagittarii: { hex: '5a9', x: 9079908.211, y: -565928.243, z: -1551345.047, dist: 9228850.4, orbit: -2, size: 14.53, startype: 'M', label: loc('star_etasagittarii'), zlabel: loc('star_etasagittarii') },
    // Ain — Taurus.
    // K0III, V 3.53, 10.30 solar radii, 146.7 ly.
    ain: { hex: 'a27', x: -8711713.976, y: 365719.545, z: -3160471.065, dist: 9274496.7, orbit: -2, size: 6.419, startype: 'KIII', label: loc('star_ain'), zlabel: loc('star_ain') },
    // Delta3 Tauri — Taurus.
    // A2IV, V 4.3, 2.48 solar radii, 148.5 ly.
    delta3tauri: { hex: 'e50', x: -8746724.009, y: 287486.421, z: -3411148.915, dist: 9392750.7, orbit: -2, size: 3.148, startype: 'A', label: loc('star_delta3tauri'), zlabel: loc('star_delta3tauri') },
    // Theta Piscium — Pisces.
    // K1III, V 4.27, 7.84 solar radii, 148.5 ly.
    thetapiscium: { hex: '88e', x: 123605.253, y: 5925323.025, z: -7286908.469, dist: 9392750.7, orbit: -2, size: 5.598, startype: 'KIII', label: loc('star_thetapiscium'), zlabel: loc('star_thetapiscium') },
    // Psi1 Aquarii — Aquarius.
    // K0III, V 4.24, 7.59 solar radii, 149.8 ly.
    psi1aquarii: { hex: '4ab', x: 1783288.541, y: 4215660.949, z: -8295693.809, dist: 9474727, orbit: -2, size: 5.51, startype: 'KIII', label: loc('star_psi1aquarii'), zlabel: loc('star_psi1aquarii') },
    // Chamukuy — Taurus.
    // A7III, V 3.4, 4.71 solar radii, 150.4 ly.
    chamukuy: { hex: '1db', x: -8816394.396, y: -53444.442, z: -3564016.402, dist: 9509672.9, orbit: -2, size: 4.339, startype: 'A', label: loc('star_chamukuy'), zlabel: loc('star_chamukuy') },
    // Alrescha — Pisces.
    // A2, V 3.82, 3.13 solar radii, 150.6 ly.
    alrescha: { hex: '522', x: -4889900.221, y: 2243843.037, z: -7857391.836, dist: 9522844.2, orbit: -2, size: 3.54, startype: 'A', label: loc('star_alrescha'), zlabel: loc('star_alrescha') },
    // Kappa Piscium — Pisces.
    // A0p, V 4.95, 1.67 solar radii, 153.5 ly.
    kappapiscium: { hex: '15d', x: 588826.609, y: 5524736.394, z: -7959161.322, dist: 9706579.1, orbit: -2, size: 2.582, startype: 'A', label: loc('star_kappapiscium'), zlabel: loc('star_kappapiscium') },
    // 1 Geminorum — Gemini.
    // G7III, V 4.16, 7.12 solar radii, 155.1 ly.
    geminorum1: { hex: '991', x: -9734413.546, y: -1193925.722, z: 122440.912, dist: 9808122, orbit: -2, size: 5.335, startype: 'G', label: loc('star_geminorum1'), zlabel: loc('star_geminorum1') },
    // Secunda Hyadum — Taurus.
    // G8III, V 3.77, 8.82 solar radii, 155.6 ly.
    secundahyadum: { hex: 'c87', x: -9118266.319, y: 316001.613, z: -3687851.007, dist: 9840878.1, orbit: -2, size: 5.941, startype: 'G', label: loc('star_secundahyadum'), zlabel: loc('star_secundahyadum') },
    // Nashira — Capricornus.
    // A7III:mp..., V 3.69, 4.30 solar radii, 157.0 ly.
    nashira: { hex: 'e9e', x: 5713596.483, y: 4150864.604, z: -6981971.463, dist: 9930900.6, orbit: -2, size: 4.147, startype: 'A', label: loc('star_nashira'), zlabel: loc('star_nashira') },
    // Skat — Aquarius.
    // A3V, V 3.27, 4.45 solar radii, 160.6 ly.
    skat: { hex: 'bf6', x: 3225757.957, y: 3787464.056, z: -8853834.385, dist: 10155825, orbit: -2, size: 4.217, startype: 'A', label: loc('star_skat'), zlabel: loc('star_skat') },
    // Prima Hyadum — Taurus.
    // G8III, V 3.65, 9.68 solar radii, 161.5 ly.
    primahyadum: { hex: 'bfa', x: -9345075.139, y: 149487.647, z: -4125250.448, dist: 10216186.5, orbit: -2, size: 6.223, startype: 'G', label: loc('star_primahyadum'), zlabel: loc('star_primahyadum') },
    // Theta Capricorni — Capricornus.
    // A1V, V 4.08, 2.77 solar radii, 162.2 ly.
    thetacapricorni: { hex: '853', x: 6971710.602, y: 4240992.292, z: -6213835.458, dist: 10256827.7, orbit: -2, size: 3.328, startype: 'A', label: loc('star_thetacapricorni'), zlabel: loc('star_thetacapricorni') },
    // Zubenelhakrabi — Libra.
    // K0III, V 3.91, 9.62 solar radii, 163.2 ly.
    zubenelhakrabi: { hex: 'b53', x: 8636186.63, y: -1288368.657, z: 5497795.462, dist: 10318399.5, orbit: -2, size: 6.204, startype: 'KIII', label: loc('star_zubenelhakrabi'), zlabel: loc('star_zubenelhakrabi') },
    // 98 Aquarii — Aquarius.
    // K0III, V 3.96, 9.42 solar radii, 163.4 ly.
    aquarii98: { hex: '2b8', x: 2556220.435, y: 2774222.232, z: -9620763.226, dist: 10333908.1, orbit: -2, size: 6.137, startype: 'KIII', label: loc('star_aquarii98'), zlabel: loc('star_aquarii98') },
    // Sadachbia — Aquarius.
    // A0V, V 3.86, 2.94 solar radii, 163.7 ly.
    sadachbia: { hex: '308', x: 3366575.536, y: 6379680.459, z: -7428647.796, dist: 10354658.9, orbit: -2, size: 3.427, startype: 'A', label: loc('star_sadachbia'), zlabel: loc('star_sadachbia') },
    // Mesarthim — Aries.
    // A1p Si, V 3.88, 3.07 solar radii, 164.1 ly.
    mesarthim: { hex: 'b1f', x: -6197354.593, y: 4747201.822, z: -6834305.473, dist: 10375493.3, orbit: -2, size: 3.505, startype: 'A', label: loc('star_mesarthim'), zlabel: loc('star_mesarthim') },
    // Chertan — Leo.
    // A2V, V 3.33, 4.30 solar radii, 165.1 ly.
    chertan: { hex: '87e', x: -2545672.417, y: -3686307.341, z: 9428309.551, dist: 10438502.3, orbit: -2, size: 4.149, startype: 'A', label: loc('star_chertan'), zlabel: loc('star_chertan') },
    // Bharani — Aries.
    // B8Vn, V 3.61, 2.63 solar radii, 165.6 ly.
    bharani: { hex: '07d', x: -8192838.874, y: 4178532.07, z: -5015547.208, dist: 10475612.3, orbit: -2, size: 3.246, startype: 'B', label: loc('star_bharani'), zlabel: loc('star_bharani') },
    // Eta Aquarii — Aquarius.
    // B9IV-Vn, V 4.04, 2.51 solar radii, 167.9 ly.
    etaaquarii: { hex: '5d9', x: 2814448.214, y: 6580087.744, z: -7840684.329, dist: 10615790.3, orbit: -2, size: 3.168, startype: 'B', label: loc('star_etaaquarii'), zlabel: loc('star_etaaquarii') },
    // Theta Librae — Libra.
    // K0III, V 4.13, 8.98 solar radii, 168.5 ly.
    thetalibrae: { hex: 'e96', x: 9371828.344, y: -1060304.541, z: 4955401.951, dist: 10654173.9, orbit: -2, size: 5.992, startype: 'KIII', label: loc('star_thetalibrae'), zlabel: loc('star_thetalibrae') },
    // Iota Aquarii — Aquarius.
    // B8V, V 4.29, 2.04 solar radii, 175.2 ly.
    iotaaquarii: { hex: '478', x: 5232049.242, y: 4965958.025, z: -8407021.902, dist: 11077594.3, orbit: -2, size: 2.854, startype: 'B', label: loc('star_iotaaquarii'), zlabel: loc('star_iotaaquarii') },
    // Xi Piscium — Pisces.
    // K0III SB, V 4.61, 7.65 solar radii, 179.1 ly.
    xipiscium: { hex: '0eb', x: -5547299.293, y: 2994652.413, z: -9410665.528, dist: 11327007.5, orbit: -2, size: 5.532, startype: 'KIII', label: loc('star_xipiscium'), zlabel: loc('star_xipiscium') },
    // Asellus Borealis — Cancer.
    // A1IV, V 4.66, 2.37 solar radii, 181.2 ly.
    asellusborealis: { hex: '866', x: -8695293.932, y: -3901518.563, z: 6362567.88, dist: 11459155.9, orbit: -2, size: 3.078, startype: 'A', label: loc('star_asellusborealis'), zlabel: loc('star_asellusborealis') },
    // Epsilon Piscium — Pisces.
    // K0III, V 4.27, 9.08 solar radii, 181.8 ly.
    epsilonpiscium: { hex: '370', x: -4062928.384, y: 5221355.458, z: -9403303.965, dist: 11497480.8, orbit: -2, size: 6.027, startype: 'KIII', label: loc('star_epsilonpiscium'), zlabel: loc('star_epsilonpiscium') },
    // Polis — Sagittarius.
    // B2III:, V 3.84, 4.06 solar radii, 181.8 ly.
    polis: { hex: '79a', x: 11318276.841, y: 1996383.542, z: -321134.594, dist: 11497480.8, orbit: -2, size: 4.03, startype: 'B', label: loc('star_polis'), zlabel: loc('star_polis') },
    // Rukbat — Sagittarius.
    // B8V, V 3.96, 2.46 solar radii, 181.8 ly.
    rukbat: { hex: '449', x: 10568026.412, y: -422317.178, z: -4508939.042, dist: 11497480.8, orbit: -2, size: 3.137, startype: 'B', label: loc('star_rukbat'), zlabel: loc('star_rukbat') },
    // Iota Sagittarii — Sagittarius.
    // K0III, V 4.12, 9.73 solar radii, 181.8 ly.
    iotasagittarii: { hex: 'c0b', x: 10038667.503, y: -356015.539, z: -5593788.79, dist: 11497480.8, orbit: -2, size: 6.239, startype: 'KIII', label: loc('star_iotasagittarii'), zlabel: loc('star_iotasagittarii') },
    // Zubeneschamali — Libra.
    // B8V, V 2.61, 4.66 solar radii, 185.1 ly.
    zubeneschamali: { hex: 'ed0', x: 8979565.339, y: -1258419.893, z: 7404119.1, dist: 11706288.6, orbit: -2, size: 4.32, startype: 'B', label: loc('star_zubeneschamali'), zlabel: loc('star_zubeneschamali') },
    // Ancha — Aquarius.
    // G8III-IV, V 4.17, 8.84 solar radii, 187.4 ly.
    ancha: { hex: '458', x: 4659965.663, y: 6299267.881, z: -8895411.941, dist: 11854299.2, orbit: -2, size: 5.947, startype: 'G', label: loc('star_ancha'), zlabel: loc('star_ancha') },
    // Acubens — Cancer.
    // A5m, V 4.26, 3.66 solar radii, 188.3 ly.
    acubens: { hex: 'b99', x: -7980358.345, y: -5907258.444, z: 6575996.714, dist: 11909053.5, orbit: -2, size: 3.825, startype: 'A', label: loc('star_acubens'), zlabel: loc('star_acubens') },
    // Theta Geminorum — Gemini.
    // A3III, V 3.6, 4.50 solar radii, 189.1 ly.
    thetageminorum: { hex: 'efa', x: -11541312.786, y: -424230.266, z: 3097913.122, dist: 11957380.1, orbit: -2, size: 4.241, startype: 'A', label: loc('star_thetageminorum'), zlabel: loc('star_thetageminorum') },
    // Iota Capricorni — Capricornus.
    // G8III, V 4.28, 8.82 solar radii, 196.7 ly.
    iotacapricorni: { hex: 'd89', x: 7845403.486, y: 5217399.295, z: -8123817.075, dist: 12440579.4, orbit: -2, size: 5.94, startype: 'G', label: loc('star_iotacapricorni'), zlabel: loc('star_iotacapricorni') },
    // Minelauva — Virgo.
    // M3III, V 3.39, 78.01 solar radii, 198.4 ly.
    minelauva: { hex: 'b55', x: 2935701.294, y: -4113195.187, z: 11483835.319, dist: 12546521, orbit: -2, size: 17.665, startype: 'M', label: loc('star_minelauva'), zlabel: loc('star_minelauva') },
    // Albali — Aquarius.
    // A1V, V 3.78, 4.07 solar radii, 207.7 ly.
    albali: { hex: '488', x: 8995154.976, y: 6947404.663, z: -6589749.383, dist: 13137885.7, orbit: -2, size: 4.036, startype: 'A', label: loc('star_albali'), zlabel: loc('star_albali') },
    // Tau Virginis — Virgo.
    // A3V, V 4.23, 4.00 solar radii, 224.9 ly.
    tauvirginis: { hex: '5c8', x: 6774687.931, y: -2571073.56, z: 12241255.399, dist: 14225159, orbit: -2, size: 4.001, startype: 'A', label: loc('star_tauvirginis'), zlabel: loc('star_tauvirginis') },
    // Nunki — Sagittarius.
    // B2.5V, V 2.05, 5.30 solar radii, 227.8 ly.
    nunki: { hex: 'f18', x: 13870875.508, y: 2335132.069, z: -3101650.095, dist: 14403966.9, orbit: -2, size: 4.605, startype: 'B', label: loc('star_nunki'), zlabel: loc('star_nunki') },
    // Tejat — Gemini.
    // M3IIIvar, V 2.87, 115.73 solar radii, 231.6 ly.
    tejat: { hex: '52d', x: -14400709.83, y: -2468356.598, z: 1065036.093, dist: 14649489.1, orbit: -2, size: 21.516, startype: 'M', label: loc('star_tejat'), zlabel: loc('star_tejat') },
    // Phi Sagittarii — Sagittarius.
    // B8.5III, V 3.17, 4.66 solar radii, 239.3 ly.
    phisagittarii: { hex: '5e8', x: 14721824.71, y: 2068029.698, z: -2829009.723, dist: 15133147.9, orbit: -2, size: 4.317, startype: 'B', label: loc('star_phisagittarii'), zlabel: loc('star_phisagittarii') },
    // Epsilon Leonis — Leo.
    // G0II, V 2.97, 16.68 solar radii, 246.7 ly.
    epsilonleonis: { hex: '46c', x: -9280293.922, y: -4691251.048, z: 11632099.494, dist: 15602481.5, orbit: -2, size: 8.169, startype: 'G', label: loc('star_epsilonleonis'), zlabel: loc('star_epsilonleonis') },
    // Spica — Virgo.
    // B1V, V 0.98, 6.99 solar radii, 249.7 ly.
    spica: { hex: '5cc', x: 7187210.625, y: -6913382.166, z: 12246954.507, dist: 15793629.9, orbit: -2, size: 5.289, startype: 'B', label: loc('star_spica'), zlabel: loc('star_spica') },
    // Kang — Virgo.
    // K3III, V 4.18, 17.16 solar radii, 254.8 ly.
    kang: { hex: '453', x: 9706663.321, y: -4836296.8, z: 11919145.585, dist: 16114438, orbit: -2, size: 8.285, startype: 'KIII', label: loc('star_kang'), zlabel: loc('star_kang') },
    // Zaniah — Virgo.
    // A2IV, V 3.89, 5.35 solar radii, 265.4 ly.
    zaniah: { hex: 'e6e', x: 2283518.337, y: -7759176.361, z: 14705596.095, dist: 16783141.3, orbit: -2, size: 4.625, startype: 'A', label: loc('star_zaniah'), zlabel: loc('star_zaniah') },
    // 88 Aquarii — Aquarius.
    // K1III, V 3.68, 18.74 solar radii, 270.7 ly.
    aquarii88: { hex: 'a3f', x: 5187009.081, y: 4631239.521, z: -15641365.875, dist: 17117411.3, orbit: -2, size: 8.657, startype: 'KIII', label: loc('star_aquarii88'), zlabel: loc('star_aquarii88') },
    // Upsilon Geminorum — Gemini.
    // K5III, V 4.06, 25.66 solar radii, 270.9 ly.
    upsilongeminorum: { hex: '505', x: -15601808.548, y: -3488891.342, z: 6156614.253, dist: 17131628.4, orbit: -2, size: 10.131, startype: 'KIII', label: loc('star_upsilongeminorum'), zlabel: loc('star_upsilongeminorum') },
    // Adhafera — Leo.
    // F0III, V 3.43, 9.77 solar radii, 274.1 ly.
    adhafera: { hex: '3fa', x: -8599764.347, y: -5010751.41, z: 14190681.715, dist: 17333177, orbit: -2, size: 6.252, startype: 'F', label: loc('star_adhafera'), zlabel: loc('star_adhafera') },
    // Torcular — Pisces.
    // K0III, V 4.26, 14.03 solar radii, 279.5 ly.
    torcular: { hex: '93b', x: -8983468.861, y: 6382483.209, z: -13818806.647, dist: 17674790.6, orbit: -2, size: 7.49, startype: 'KIII', label: loc('star_torcular'), zlabel: loc('star_torcular') },
    // Brachium — Libra.
    // M3/M4III, V 3.25, 120.95 solar radii, 288.4 ly.
    brachium: { hex: 'a37', x: 14760936.914, y: -6198065.302, z: 8735037.516, dist: 18237383.4, orbit: -2, size: 21.995, startype: 'M', label: loc('star_brachium'), zlabel: loc('star_brachium') },
    // Sigma Aquarii — Aquarius.
    // A0IVs, V 4.82, 3.34 solar radii, 289.7 ly.
    sigmaaquarii: { hex: '21b', x: 6704383.552, y: 8735114.554, z: -14639383.989, dist: 18318366.4, orbit: -2, size: 3.654, startype: 'A', label: loc('star_sigmaaquarii'), zlabel: loc('star_sigmaaquarii') },
    // Omicron Tauri — Taurus.
    // G8III, V 3.61, 17.76 solar radii, 291.0 ly.
    omicrontauri: { hex: 'f47', x: -14392322.701, y: 1482779.966, z: -11367719.946, dist: 18400071.9, orbit: -2, size: 8.429, startype: 'G', label: loc('star_omicrontauri'), zlabel: loc('star_omicrontauri') },
    // Nu Virginis — Virgo.
    // M0III, V 4.04, 47.47 solar radii, 293.8 ly.
    nuvirginis: { hex: 'f2e', x: -1005551.716, y: -8032683.929, z: 16726356.453, dist: 18582415, orbit: -2, size: 13.78, startype: 'M', label: loc('star_nuvirginis'), zlabel: loc('star_nuvirginis') },
    // 51 Sagittarii — Sagittarius.
    // A1m..., V 5.64, 2.45 solar radii, 294.4 ly.
    sagittarii51: { hex: 'b54', x: 16881246.558, y: 4455880.574, z: -6459296.106, dist: 18615957.2, orbit: -2, size: 3.13, startype: 'A', label: loc('star_sagittarii51'), zlabel: loc('star_sagittarii51') },
    // Sargas — Scorpius.
    // F1II, V 1.86, 23.40 solar radii, 300.3 ly.
    sargas: { hex: '5b8', x: 18415972.216, y: -4204657.929, z: -1977310.605, dist: 18993076.1, orbit: -2, size: 9.674, startype: 'F', label: loc('star_sargas'), zlabel: loc('star_sargas') },
    // Tarf — Cancer.
    // K4III, V 3.53, 32.49 solar radii, 303.4 ly.
    tarf: { hex: '3bc', x: -14593617.89, y: -9937599.009, z: 7511835.689, dist: 19187423.8, orbit: -2, size: 11.4, startype: 'KIII', label: loc('star_tarf'), zlabel: loc('star_tarf') },
    // Mu Piscium — Pisces.
    // K4III, V 4.84, 17.80 solar radii, 304.0 ly.
    mupiscium: { hex: 'e2c', x: -8364819.035, y: 6999093.214, z: -15829511.967, dist: 19223187.9, orbit: -2, size: 8.439, startype: 'KIII', label: loc('star_mupiscium'), zlabel: loc('star_mupiscium') },
    // Upsilon Piscium — Pisces.
    // A3V, V 4.74, 4.33 solar radii, 308.0 ly.
    upsilonpiscium: { hex: '143', x: -10349522.466, y: 12093289.403, z: -11225225.318, dist: 19477318.8, orbit: -2, size: 4.163, startype: 'A', label: loc('star_upsilonpiscium'), zlabel: loc('star_upsilonpiscium') },
    // Tau2 Aquarii — Aquarius.
    // K5III, V 4.05, 30.22 solar radii, 317.6 ly.
    tau2aquarii: { hex: '39b', x: 6418919.606, y: 8294417.207, z: -17128207.306, dist: 20084207, orbit: -2, size: 10.995, startype: 'KIII', label: loc('star_tau2aquarii'), zlabel: loc('star_tau2aquarii') },
    // Tau Geminorum — Gemini.
    // K2III, V 4.41, 16.54 solar radii, 321.0 ly.
    taugeminorum: { hex: '357', x: -19240111.436, y: -2436919.735, z: 6003057.115, dist: 20301654.1, orbit: -2, size: 8.135, startype: 'KIII', label: loc('star_taugeminorum'), zlabel: loc('star_taugeminorum') },
    // Dabih — Capricornus.
    // A5:n, V 3.05, 11.08 solar radii, 326.8 ly.
    dabih: { hex: '703', x: 16172018.549, y: 9019592.672, z: -9179945.092, dist: 20667816.2, orbit: -2, size: 6.657, startype: 'A', label: loc('star_dabih'), zlabel: loc('star_dabih') },
    // Iota Cancri — Cancer.
    // G8Iab:, V 4.03, 16.66 solar radii, 331.1 ly.
    iotacancri: { hex: '4b9', x: -16181444.177, y: -4604266.938, z: 12468756.012, dist: 20940589.4, orbit: -2, size: 8.163, startype: 'G', label: loc('star_iotacancri'), zlabel: loc('star_iotacancri') },
    // Kaus Media — Sagittarius.
    // K3III, V 2.72, 45.87 solar radii, 347.7 ly.
    kausmedia: { hex: '03c', x: 21788717.919, y: 1142246.449, z: -2738723.878, dist: 21989851.4, orbit: -2, size: 13.546, startype: 'KIII', label: loc('star_kausmedia'), zlabel: loc('star_kausmedia') },
    // Alpherg — Pisces.
    // G8III, V 3.62, 21.24 solar radii, 349.6 ly.
    alpherg: { hex: 'fdf', x: -11145927.278, y: 10390529.931, z: -16017347.667, dist: 22107696.2, orbit: -2, size: 9.218, startype: 'G', label: loc('star_alpherg'), zlabel: loc('star_alpherg') },
    // Nu Piscium — Pisces.
    // K3III, V 4.45, 21.60 solar radii, 363.2 ly.
    nupiscium: { hex: 'e0e', x: -10749305.24, y: 7493862.323, z: -18864933.706, dist: 22969354.8, orbit: -2, size: 9.295, startype: 'KIII', label: loc('star_nupiscium'), zlabel: loc('star_nupiscium') },
    // Xi2 Sagittarii — Sagittarius.
    // G8/K0II/III, V 3.52, 23.24 solar radii, 365.2 ly.
    xi2sagittarii: { hex: 'eb3', x: 21956857.356, y: 5723394.453, z: -4319148.894, dist: 23097962.6, orbit: -2, size: 9.642, startype: 'G', label: loc('star_xi2sagittarii'), zlabel: loc('star_xi2sagittarii') },
    // Atlas — Taurus.
    // B8III, V 3.62, 6.05 solar radii, 382.4 ly.
    atlas: { hex: '69d', x: -21651669.452, y: 4993287.79, z: -9539287.95, dist: 24181102.7, orbit: -2, size: 4.92, startype: 'B', label: loc('star_atlas'), zlabel: loc('star_atlas') },
    // Propus — Gemini.
    // M3III, V 3.31, 156.92 solar radii, 384.6 ly.
    propus: { hex: 'b36', x: -24010662.689, y: -3739914.473, z: 1068888.876, dist: 24323680, orbit: -2, size: 25.053, startype: 'M', label: loc('star_propus'), zlabel: loc('star_propus') },
    // Lambda Aquarii — Aquarius.
    // M2IIIvar, V 3.73, 104.20 solar radii, 385.1 ly.
    lambdaaquarii: { hex: '9c0', x: 6396763.271, y: 12128235.877, z: -20125272.008, dist: 24352397.4, orbit: -2, size: 20.416, startype: 'M', label: loc('star_lambdaaquarii'), zlabel: loc('star_lambdaaquarii') },
    // Zeta Capricorni — Capricornus.
    // G4Ibp..., V 3.77, 19.98 solar radii, 385.5 ly.
    zetacapricorni: { hex: '217', x: 15737763.846, y: 8011251.315, z: -16810256.197, dist: 24381182.7, orbit: -2, size: 8.94, startype: 'G', label: loc('star_zetacapricorni'), zlabel: loc('star_zetacapricorni') },
    // Tau Tauri — Taurus.
    // B3V, V 4.27, 3.55 solar radii, 398.2 ly.
    tautauri: { hex: '014', x: -24276930.737, y: 1423394.074, z: -6548793.218, dist: 25184958, orbit: -2, size: 3.769, startype: 'B', label: loc('star_tautauri'), zlabel: loc('star_tautauri') },
    // Acrab — Scorpius.
    // B0.5V, V 2.56, 4.93 solar radii, 404.2 ly.
    acrab: { hex: '268', x: 23256690.079, y: -2776106.691, z: 10232563.921, dist: 25559455.5, orbit: -2, size: 4.441, startype: 'B', label: loc('star_acrab'), zlabel: loc('star_acrab') },
    // 41 Piscium — Pisces.
    // K3III, V 5.38, 15.80 solar radii, 407.7 ly.
    piscium41: { hex: 'c91', x: -5172568.98, y: 14283668.83, z: -20832417.507, dist: 25783100.8, orbit: -2, size: 7.95, startype: 'KIII', label: loc('star_piscium41'), zlabel: loc('star_piscium41') },
    // 7 Piscium — Pisces.
    // K2III, V 5.05, 16.60 solar radii, 432.6 ly.
    piscium7: { hex: '3ee', x: 1382257.045, y: 17258769.723, z: -21179685.459, dist: 27356075.1, orbit: -2, size: 8.149, startype: 'KIII', label: loc('star_piscium7'), zlabel: loc('star_piscium7') },
    // Sigma Piscium — Pisces.
    // B9.5V, V 5.5, 3.41 solar radii, 433.7 ly.
    sigmapiscium: { hex: '887', x: -13736558.582, y: 19079302.931, z: -14128973.964, dist: 27428830.6, orbit: -2, size: 3.692, startype: 'B', label: loc('star_sigmapiscium'), zlabel: loc('star_sigmapiscium') },
    // Tianguan — Taurus.
    // B4IIIp, V 2.97, 7.58 solar radii, 445.0 ly.
    tianguan: { hex: '189', x: -27865977.817, y: -2774680.409, z: -2763571.199, dist: 28139809.8, orbit: -2, size: 5.508, startype: 'B', label: loc('star_tianguan'), zlabel: loc('star_tianguan') },
    // Phi Piscium — Pisces.
    // K0III..., V 4.67, 18.54 solar radii, 446.2 ly.
    phipiscium: { hex: '0b7', x: -14103452.31, y: 17186490.9, z: -17375412.233, dist: 28216799.7, orbit: -2, size: 8.612, startype: 'KIII', label: loc('star_phipiscium'), zlabel: loc('star_phipiscium') },
    // 62 Sagittarii — Sagittarius.
    // M4III, V 4.43, 162.97 solar radii, 448.6 ly.
    sagittarii62: { hex: 'dca', x: 24551546.781, y: 6085881.492, z: -12851336.033, dist: 28372050.3, orbit: -2, size: 25.532, startype: 'M', label: loc('star_sagittarii62'), zlabel: loc('star_sagittarii62') },
    // Paikauhale — Scorpius.
    // B0V, V 2.82, 4.71 solar radii, 474.1 ly.
    paikauhale: { hex: '3e9', x: 28915879.503, y: -4303542.714, z: 6646262.211, dist: 29980349.7, orbit: -2, size: 4.341, startype: 'B', label: loc('star_paikauhale'), zlabel: loc('star_paikauhale') },
    // 43 Sagittarii — Sagittarius.
    // K0III, V 4.88, 18.17 solar radii, 481.8 ly.
    sagittarii43: { hex: '6e8', x: 28000776.363, y: 9429247.413, z: -7437261.015, dist: 30467475, orbit: -2, size: 8.526, startype: 'KIII', label: loc('star_sagittarii43'), zlabel: loc('star_sagittarii43') },
    // Kappa Scorpii — Scorpius.
    // B1.5III, V 2.39, 7.46 solar radii, 483.2 ly.
    kappascorpii: { hex: '30c', x: 30082845.929, y: -4741081.748, z: -2514070.578, dist: 30557749, orbit: -2, size: 5.464, startype: 'B', label: loc('star_kappascorpii'), zlabel: loc('star_kappascorpii') },
    // Lambda Tauri — Taurus.
    // B3V + A, V 3.41, 6.41 solar radii, 483.9 ly.
    lambdatauri: { hex: '7ee', x: -26657455.256, y: 757767.013, z: -15011821.972, dist: 30603086.9, orbit: -2, size: 5.065, startype: 'B', label: loc('star_lambdatauri'), zlabel: loc('star_lambdatauri') },
    // Dschubba — Scorpius.
    // B0.2IV, V 2.29, 6.23 solar radii, 491.2 ly.
    dschubba: { hex: 'd2b', x: 28273708.643, y: -4936073.937, z: 11882896.479, dist: 31063976.8, orbit: -2, size: 4.993, startype: 'B', label: loc('star_dschubba'), zlabel: loc('star_dschubba') },
    // Xamidimura — Scorpius.
    // B1.5IV + B, V 3, 5.84 solar radii, 501.0 ly.
    xamidimura: { hex: '355', x: 30686760.02, y: -7585536.253, z: 2162727.969, dist: 31684302, orbit: -2, size: 4.835, startype: 'B', label: loc('star_xamidimura'), zlabel: loc('star_xamidimura') },
    // Theta1 Sagittarii — Sagittarius.
    // B2.5IV, V 4.37, 4.15 solar radii, 518.5 ly.
    theta1sagittarii: { hex: '55f', x: 28693497.972, y: 2774108.749, z: -15631230.052, dist: 32792497, orbit: -2, size: 4.072, startype: 'B', label: loc('star_theta1sagittarii'), zlabel: loc('star_theta1sagittarii') },
    // Sadalmelik — Aquarius.
    // G2Ib, V 2.95, 38.09 solar radii, 523.5 ly.
    sadalmelik: { hex: 'c4c', x: 12315842.833, y: 21270521.992, z: -22182097.948, dist: 33108315.6, orbit: -2, size: 12.343, startype: 'G', label: loc('star_sadalmelik'), zlabel: loc('star_sadalmelik') },
    // Sadalsuud — Aquarius.
    // G0Ib, V 2.9, 37.53 solar radii, 537.3 ly.
    sadalsuud: { hex: '6ce', x: 17939158.052, y: 19939427.31, z: -20864221.304, dist: 33981022.4, orbit: -2, size: 12.252, startype: 'G', label: loc('star_sadalsuud'), zlabel: loc('star_sadalsuud') },
    // Nu Geminorum — Gemini.
    // B6III, V 4.13, 5.90 solar radii, 544.5 ly.
    nugeminorum: { hex: '949', x: -33532225.819, y: -7385233.893, z: 2609151.794, dist: 34434859.1, orbit: -2, size: 4.856, startype: 'B', label: loc('star_nugeminorum'), zlabel: loc('star_nugeminorum') },
    // Antares — Scorpius.
    // M1Ib + B2.5V, V 1.06, 442.16 solar radii, 553.7 ly.
    antares: { hex: '3a1', x: 33482585.13, y: -4737142.167, z: 9101690.761, dist: 35019491.7, orbit: -2, size: 42.055, startype: 'M', label: loc('star_antares'), zlabel: loc('star_antares') },
    // Shaula — Scorpius.
    // B1.5IV+..., V 1.62, 12.58 solar radii, 571.2 ly.
    shaula: { hex: 'f3c', x: 35722407.488, y: -5183047.957, z: -1395734.217, dist: 36123433.6, orbit: -2, size: 7.094, startype: 'B', label: loc('star_shaula'), zlabel: loc('star_shaula') },
    // 62 Piscium — Pisces.
    // G8III, V 5.92, 12.21 solar radii, 579.3 ly.
    piscium62: { hex: '812', x: -10840781.668, y: 17655228.405, z: -30216230.033, dist: 36636732.9, orbit: -2, size: 6.987, startype: 'G', label: loc('star_piscium62'), zlabel: loc('star_piscium62') },
    // Fang — Scorpius.
    // B1V + B2V, V 2.89, 6.81 solar radii, 585.6 ly.
    fang: { hex: '8cc', x: 33885395.245, y: -7689344.176, z: 12805363.638, dist: 37031383.5, orbit: -2, size: 5.217, startype: 'B', label: loc('star_fang'), zlabel: loc('star_fang') },
    // Omega Capricorni — Capricornus.
    // K4III, V 4.12, 68.77 solar radii, 842.8 ly.
    omegacapricorni: { hex: '830', x: 40277341.051, y: 13448387.213, z: -32211738.027, dist: 53298399.5, orbit: -2, size: 16.586, startype: 'KIII', label: loc('star_omegacapricorni'), zlabel: loc('star_omegacapricorni') },
    // Mebsuta — Gemini.
    // A3mA6-A9, V 3.06, 25.77 solar radii, 845.0 ly.
    mebsuta: { hex: '442', x: -51955626.419, y: -8727957.408, z: 8938280.004, dist: 53436478.2, orbit: -2, size: 10.152, startype: 'A', label: loc('star_mebsuta'), zlabel: loc('star_mebsuta') },
    // 19 Piscium — Pisces.
    // C5II, V 4.95, 372.65 solar radii, 898.5 ly.
    piscium19: { hex: 'fea', x: -1839360.24, y: 32053680.142, z: -46882274.301, dist: 56822260.6, orbit: -2, size: 38.608, startype: 'M', label: loc('star_piscium19'), zlabel: loc('star_piscium19') },
    // 3 Sagittarii — Sagittarius.
    // F7II, V 4.53, 28.57 solar radii, 985.4 ly.
    sagittarii3: { hex: '6c1', x: 62302325.391, y: 1268400.941, z: 227627.415, dist: 62315651.4, orbit: -2, size: 10.69, startype: 'F', label: loc('star_sagittarii3'), zlabel: loc('star_sagittarii3') },
    // Eta Leonis — Leo.
    // A0Ib, V 3.48, 27.11 solar radii, 1269.1 ly.
    etaleonis: { hex: '5d0', x: -39166159.355, y: -32320617.862, z: 62151791.911, dist: 80258679.4, orbit: -2, size: 10.414, startype: 'A', label: loc('star_etaleonis'), zlabel: loc('star_etaleonis') },
    // Mekbuda — Gemini.
    // G3Ibv SB, V 4.01, 62.82 solar radii, 1376.2 ly.
    mekbuda: { hex: 'd17', x: -81964289.677, y: -23110887.542, z: 17950910.201, dist: 87031563.7, orbit: -2, size: 15.852, startype: 'G', label: loc('star_mekbuda'), zlabel: loc('star_mekbuda') },
    // Iota1 Scorpii — Scorpius.
    // F3Ia, V 2.99, 97.31 solar radii, 1929.9 ly.
    iota1scorpii: { hex: '418', x: 119726554.996, y: -19802471.211, z: -13025392.918, dist: 122050181.1, orbit: -2, size: 19.729, startype: 'F', label: loc('star_iota1scorpii'), zlabel: loc('star_iota1scorpii') },
    // Zeta1 Scorpii — Scorpius.
    // B1Iae, V 4.7, 12.97 solar radii, 2568.2 ly.
    zeta1scorpii: { hex: '576', x: 155321448.814, y: -47404899.636, z: 2466030.299, dist: 162413233.1, orbit: -2, size: 7.202, startype: 'B', label: loc('star_zeta1scorpii'), zlabel: loc('star_zeta1scorpii') },
    // --- the stars of ten more constellations ---------------------------------------------------
    // Orion, Ursa Major, Ursa Minor, Cygnus, Pegasus, Cassiopeia, Canis Major, Centaurus, Crux and Carina
    // Xi Pegasi — Pegasus.
    // F7V, V 4.2, 1.79 solar radii, 53.2 ly.
    xipegasi: { hex: 'b74', x: 388322.108, y: 2530416.09, z: -2178584.286, dist: 3361551.6, orbit: -2, size: 2.679, startype: 'F', label: loc('star_xipegasi'), zlabel: loc('star_xipegasi') },
    // Caph — Cassiopeia.
    // F2III-IV, V 2.28, 3.74 solar radii, 54.7 ly.
    caph: { hex: '965', x: -1597388.839, y: 3065043.217, z: -197911.252, dist: 3461980.6, orbit: -2, size: 3.868, startype: 'F', label: loc('star_caph'), zlabel: loc('star_caph') },
    // Iota Centauri — Centaurus.
    // A2V, V 2.75, 2.00 solar radii, 58.8 ly.
    iotacentauri: { hex: '663', x: 2125231.027, y: -2585494.567, z: 1617354.469, dist: 3717152.7, orbit: -2, size: 2.83, startype: 'A', label: loc('star_iotacentauri'), zlabel: loc('star_iotacentauri') },
    // Menkent — Centaurus.
    // K0IIIb, V 2.06, 8.13 solar radii, 58.8 ly.
    menkent: { hex: 'abb', x: 2580773.92, y: -2207672.781, z: 1517548.446, dist: 3719834.2, orbit: -2, size: 5.703, startype: 'KIII', label: loc('star_menkent'), zlabel: loc('star_menkent') },
    // Nu2 Canis Majoris — Canis Major.
    // K1III+..., V 3.95, 3.94 solar radii, 64.4 ly.
    nu2canismajoris: { hex: 'da6', x: -2632658.744, y: -2995440.905, z: -832841.999, dist: 4073964.2, orbit: -2, size: 3.969, startype: 'KIII', label: loc('star_nu2canismajoris'), zlabel: loc('star_nu2canismajoris') },
    // Mu1 Cygni — Cygnus.
    // F6V, V 4.49, 2.09 solar radii, 72.5 ly.
    mu1cygni: { hex: '855', x: 712210.407, y: 4295098.784, z: -1443220.247, dist: 4586720.2, orbit: -2, size: 2.891, startype: 'F', label: loc('star_mu1cygni'), zlabel: loc('star_mu1cygni') },
    // Aljanah — Cygnus.
    // K0III, V 2.48, 8.28 solar radii, 72.7 ly.
    aljanah: { hex: '67c', x: 1110678.943, y: 4438246.858, z: -457885.312, dist: 4597967.1, orbit: -2, size: 5.756, startype: 'KIII', label: loc('star_aljanah'), zlabel: loc('star_aljanah') },
    // 23 Ursae Majoris — Ursa Major.
    // F0IV, V 3.65, 2.50 solar radii, 77.7 ly.
    ursaemajoris23: { hex: 'bbd', x: -3194427.807, y: 1797034.523, z: 3270529.66, dist: 4912236.4, orbit: -2, size: 3.164, startype: 'F', label: loc('star_ursaemajoris23'), zlabel: loc('star_ursaemajoris23') },
    // Merak — Ursa Major.
    // A1V, V 2.34, 3.03 solar radii, 79.7 ly.
    merak: { hex: 'e67', x: -2495906.749, y: 1489840.932, z: 4121186.512, dist: 5043149.3, orbit: -2, size: 3.483, startype: 'A', label: loc('star_merak'), zlabel: loc('star_merak') },
    // Megrez — Ursa Major.
    // A3Vvar, V 3.32, 2.18 solar radii, 80.5 ly.
    megrez: { hex: 'e07', x: -1752417.081, y: 1907936.896, z: 4383403.913, dist: 5091701, orbit: -2, size: 2.952, startype: 'A', label: loc('star_megrez'), zlabel: loc('star_megrez') },
    // Alioth — Ursa Major.
    // A0p, V 1.76, 3.89 solar radii, 82.6 ly.
    alioth: { hex: 'a2e', x: -1340982.908, y: 2131044.621, z: 4573268.78, dist: 5220572.2, orbit: -2, size: 3.947, startype: 'A', label: loc('star_alioth'), zlabel: loc('star_alioth') },
    // Phecda — Ursa Major.
    // A0V SB, V 2.41, 2.91 solar radii, 83.2 ly.
    phecda: { hex: '47b', x: -1953512.136, y: 1590952.163, z: 4617973.913, dist: 5260515.3, orbit: -2, size: 3.411, startype: 'A', label: loc('star_phecda'), zlabel: loc('star_phecda') },
    // Mizar — Ursa Major.
    // A2V, V 2.23, 3.71 solar radii, 85.8 ly.
    mizar: { hex: '84b', x: -1013774.247, y: 2375482.625, z: 4772552.503, dist: 5426593.2, orbit: -2, size: 3.854, startype: 'A', label: loc('star_mizar'), zlabel: loc('star_mizar') },
    // Gacrux — Crux.
    // M4III, V 1.59, 118.97 solar radii, 88.6 ly.
    gacrux: { hex: '47c', x: 2800853.844, y: -4818326.995, z: 551410.577, dist: 5600456.3, orbit: -2, size: 21.815, startype: 'M', label: loc('star_gacrux'), zlabel: loc('star_gacrux') },
    // Biham — Pegasus.
    // A2V, V 3.52, 2.21 solar radii, 92.3 ly.
    biham: { hex: '3d4', x: 1748880.563, y: 4204791.28, z: -3650593.91, dist: 5836581.9, orbit: -2, size: 2.97, startype: 'A', label: loc('star_biham'), zlabel: loc('star_biham') },
    // HD 94510 — Carina.
    // K0III-IV..., V 3.78, 5.95 solar radii, 95.0 ly.
    hd94510: { hex: 'd6a', x: 1874689.725, y: -5707995.799, z: 62807.089, dist: 6008296.1, orbit: -2, size: 4.878, startype: 'KIII', label: loc('star_hd94510'), zlabel: loc('star_hd94510') },
    // Eta Ursae Minoris — Ursa Minor.
    // F5V, V 4.95, 2.12 solar radii, 97.0 ly.
    etaursaeminoris: { hex: '2fa', x: -1651863.284, y: 4723481.425, z: 3546567.733, dist: 6133357.3, orbit: -2, size: 2.909, startype: 'F', label: loc('star_etaursaeminoris'), zlabel: loc('star_etaursaeminoris') },
    // Alpheratz — Pegasus.
    // B9p, V 2.07, 3.59 solar radii, 97.0 ly.
    alpheratz: { hex: 'aa9', x: -1908542.073, y: 4788187.153, z: -3327338.941, dist: 6135181.6, orbit: -2, size: 3.79, startype: 'B', label: loc('star_alpheratz'), zlabel: loc('star_alpheratz') },
    // Ruchbah — Cassiopeia.
    // A5Vv SB, V 2.66, 4.03 solar radii, 99.4 ly.
    ruchbah: { hex: '836', x: -3796767.919, y: 5003988.015, z: -257985.201, dist: 6286644.5, orbit: -2, size: 4.017, startype: 'A', label: loc('star_ruchbah'), zlabel: loc('star_ruchbah') },
    // Alkaid — Ursa Major.
    // B3V SB, V 1.85, 2.83 solar radii, 103.9 ly.
    alkaid: { hex: '102', x: -509303.732, y: 2696700.258, z: 5972809.206, dist: 6573129.6, orbit: -2, size: 3.362, startype: 'B', label: loc('star_alkaid'), zlabel: loc('star_alkaid') },
    // Sadalbari — Pegasus.
    // M2III, V 3.51, 31.77 solar radii, 106.1 ly.
    sadalbari: { hex: '39e', x: -68503.843, y: 5777669.272, z: -3411405.236, dist: 6709980.7, orbit: -2, size: 11.273, startype: 'M', label: loc('star_sadalbari'), zlabel: loc('star_sadalbari') },
    // Kappa Pegasi — Pegasus.
    // F5IV, V 4.14, 3.54 solar radii, 111.6 ly.
    kappapegasi: { hex: 'f08', x: 1326934.205, y: 6470150.308, z: -2491240.796, dist: 7059028.3, orbit: -2, size: 3.761, startype: 'F', label: loc('star_kappapegasi'), zlabel: loc('star_kappapegasi') },
    // Miaplacidus — Carina.
    // A2IV, V 1.67, 6.34 solar radii, 113.2 ly.
    miaplacidus: { hex: '2a0', x: 1908240.302, y: -6664101.035, z: -1780746.508, dist: 7157002.3, orbit: -2, size: 5.035, startype: 'A', label: loc('star_miaplacidus'), zlabel: loc('star_miaplacidus') },
    // Upsilon Ursae Majoris — Ursa Major.
    // F0IV, V 3.78, 3.53 solar radii, 116.2 ly.
    upsilonursaemajoris: { hex: 'a6b', x: -4636961.479, y: 2230650.082, z: 5249548.609, dist: 7350848.4, orbit: -2, size: 3.756, startype: 'F', label: loc('star_upsilonursaemajoris'), zlabel: loc('star_upsilonursaemajoris') },
    // Pi1 Orionis — Orion.
    // A0V, V 4.64, 1.46 solar radii, 116.3 ly.
    pi1orionis: { hex: '5f9', x: -6809676.887, y: -1120697.771, z: -2546452.342, dist: 7356091.5, orbit: -2, size: 2.414, startype: 'A', label: loc('star_pi1orionis'), zlabel: loc('star_pi1orionis') },
    // Iota2 Cygni — Cygnus.
    // A5Vn, V 3.76, 2.97 solar radii, 121.3 ly.
    iota2cygni: { hex: '7a8', x: 822970.652, y: 7350364.539, z: 2044041.484, dist: 7673541.9, orbit: -2, size: 3.445, startype: 'A', label: loc('star_iota2cygni'), zlabel: loc('star_iota2cygni') },
    // Dubhe — Ursa Major.
    // F7V comp, V 1.81, 12.47 solar radii, 122.9 ly.
    dubhe: { hex: '8d7', x: -3897568.04, y: 2953245.404, z: 6040604.515, dist: 7771846.5, orbit: -2, size: 7.062, startype: 'F', label: loc('star_dubhe'), zlabel: loc('star_dubhe') },
    // Kappa Cygni — Cygnus.
    // K0III, V 3.8, 7.70 solar radii, 124.2 ly.
    kappacygni: { hex: 'b21', x: 729113.762, y: 7437973.183, z: 2407182.524, dist: 7851724.6, orbit: -2, size: 5.55, startype: 'KIII', label: loc('star_kappacygni'), zlabel: loc('star_kappacygni') },
    // Gamma Centauri — Centaurus.
    // A1IV, V 2.2, 5.28 solar radii, 130.2 ly.
    gammacentauri: { hex: 'c23', x: 4145892.393, y: -6830805.337, z: 1974429.703, dist: 8230838.2, orbit: -2, size: 4.596, startype: 'A', label: loc('star_gammacentauri'), zlabel: loc('star_gammacentauri') },
    // Kochab — Ursa Minor.
    // K4IIIvar, V 2.07, 27.46 solar radii, 130.9 ly.
    kochab: { hex: 'ff1', x: -2424386.399, y: 5810745.275, z: 5377977.502, dist: 8280401.7, orbit: -2, size: 10.481, startype: 'KIII', label: loc('star_kochab'), zlabel: loc('star_kochab') },
    // Markab — Pegasus.
    // B9.5III, V 2.49, 4.19 solar radii, 133.3 ly.
    markab: { hex: '61c', x: 192842.759, y: 6420780.345, z: -5463285.221, dist: 8432739.4, orbit: -2, size: 4.093, startype: 'B', label: loc('star_markab'), zlabel: loc('star_markab') },
    // Eta Cygni — Cygnus.
    // K0IIIvar, V 3.89, 8.03 solar radii, 134.9 ly.
    etacygni: { hex: 'ed8', x: 2771397.842, y: 8055821.853, z: 500849.582, dist: 8533918.3, orbit: -2, size: 5.668, startype: 'KIII', label: loc('star_etacygni'), zlabel: loc('star_etacygni') },
    // Tania Borealis — Ursa Major.
    // A2IV, V 3.45, 3.39 solar radii, 137.5 ly.
    taniaborealis: { hex: 'b80', x: -4964422.816, y: 358377.918, z: 7130450.497, dist: 8695818.1, orbit: -2, size: 3.684, startype: 'A', label: loc('star_taniaborealis'), zlabel: loc('star_taniaborealis') },
    // Zeta Cygni — Cygnus.
    // G8II SB, V 3.21, 10.50 solar radii, 143.1 ly.
    zetacygni: { hex: '479', x: 2025030.913, y: 8602638.267, z: -1951543.3, dist: 9050671.6, orbit: -2, size: 6.482, startype: 'G', label: loc('star_zetacygni'), zlabel: loc('star_zetacygni') },
    // Psi Ursae Majoris — Ursa Major.
    // K1III, V 3, 13.68 solar radii, 144.5 ly.
    psiursaemajoris: { hex: 'f22', x: -3990465.091, y: 1009489.1, z: 8159441.04, dist: 9138892.6, orbit: -2, size: 7.398, startype: 'KIII', label: loc('star_psiursaemajoris'), zlabel: loc('star_psiursaemajoris') },
    // Mu Orionis — Orion.
    // Am..., V 4.12, 3.21 solar radii, 154.9 ly.
    muorionis: { hex: '024', x: -9226147.55, y: -3119921.144, z: -1077421.149, dist: 9798803.1, orbit: -2, size: 3.583, startype: 'A', label: loc('star_muorionis'), zlabel: loc('star_muorionis') },
    // Fawaris — Cygnus.
    // B9.5III, V 2.86, 4.37 solar radii, 165.0 ly.
    fawaris: { hex: '09a', x: 2010116.764, y: 10068241.748, z: 1855280.961, dist: 10433222.4, orbit: -2, size: 4.181, startype: 'B', label: loc('star_fawaris'), zlabel: loc('star_fawaris') },
    // Yildun — Ursa Minor.
    // A1Vn, V 4.35, 2.59 solar radii, 172.1 ly.
    yildun: { hex: '382', x: -4690806.432, y: 8363699.479, z: 5149879.863, dist: 10884686.3, orbit: -2, size: 3.222, startype: 'A', label: loc('star_yildun'), zlabel: loc('star_yildun') },
    // Muscida — Ursa Major.
    // G4II-III, V 3.35, 11.26 solar radii, 179.1 ly.
    muscida: { hex: '225', x: -8430317.042, y: 3757645.525, z: 6565893.151, dist: 11327007.5, orbit: -2, size: 6.712, startype: 'G', label: loc('star_muscida'), zlabel: loc('star_muscida') },
    // Taiyangshou — Ursa Major.
    // K0III, V 3.69, 11.98 solar radii, 183.6 ly.
    taiyangshou: { hex: '946', x: -4148533.198, y: 2364443.91, z: 10586986.843, dist: 11614009.3, orbit: -2, size: 6.923, startype: 'KIII', label: loc('star_taiyangshou'), zlabel: loc('star_taiyangshou') },
    // Scheat — Pegasus.
    // M2II-IIIvar, V 2.44, 96.07 solar radii, 196.0 ly.
    scheat: { hex: '3a5', x: -1085327.233, y: 10782332.385, z: -6018079.843, dist: 12395721.5, orbit: -2, size: 19.603, startype: 'M', label: loc('star_scheat'), zlabel: loc('star_scheat') },
    // Homam — Pegasus.
    // B8.5V, V 3.41, 3.56 solar radii, 204.4 ly.
    homam: { hex: '654', x: 1894368.951, y: 9618842.436, z: -8421127.859, dist: 12923860, orbit: -2, size: 3.775, startype: 'B', label: loc('star_homam'), zlabel: loc('star_homam') },
    // Matar — Pegasus.
    // G2II-III.., V 2.93, 15.74 solar radii, 214.3 ly.
    matar: { hex: 'df2', x: -535054.542, y: 12275482.759, z: -5717424.065, dist: 13552221.2, orbit: -2, size: 7.934, startype: 'G', label: loc('star_matar'), zlabel: loc('star_matar') },
    // Pi2 Orionis — Orion.
    // A1Vn, V 4.35, 3.38 solar radii, 224.5 ly.
    pi2orionis: { hex: '3b0', x: -12984782.93, y: -2248142.968, z: -5278415.938, dist: 14195788.4, orbit: -2, size: 3.679, startype: 'A', label: loc('star_pi2orionis'), zlabel: loc('star_pi2orionis') },
    // Schedar — Cassiopeia.
    // K0II-IIIvar, V 2.24, 29.04 solar radii, 228.2 ly.
    schedar: { hex: 'd8f', x: -7478391.462, y: 12243750.322, z: -1584470.448, dist: 14434206.2, orbit: -2, size: 10.778, startype: 'KIII', label: loc('star_schedar'), zlabel: loc('star_schedar') },
    // Tania Australis — Ursa Major.
    // M0III SB, V 3.06, 58.43 solar radii, 230.3 ly.
    taniaaustralis: { hex: '57f', x: -8064057.407, y: 295234.775, z: 12127376.082, dist: 14566723.6, orbit: -2, size: 15.288, startype: 'M', label: loc('star_taniaaustralis'), zlabel: loc('star_taniaaustralis') },
    // Bellatrix — Orion.
    // B2III, V 1.64, 6.45 solar radii, 252.4 ly.
    bellatrix: { hex: '86b', x: -14684835.494, y: -4469384.491, z: -4387941.952, dist: 15964768.3, orbit: -2, size: 5.08, startype: 'B', label: loc('star_bellatrix'), zlabel: loc('star_bellatrix') },
    // Theta Canis Majoris — Canis Major.
    // K4III, V 4.08, 21.67 solar radii, 260.7 ly.
    thetacanismajoris: { hex: 'c45', x: -11821442.162, y: -11408749.001, z: -1395672.022, dist: 16487994.1, orbit: -2, size: 9.31, startype: 'KIII', label: loc('star_thetacanismajoris'), zlabel: loc('star_thetacanismajoris') },
    // Mimosa — Crux.
    // B0.5III, V 1.25, 6.21 solar radii, 278.5 ly.
    mimosa: { hex: '664', x: 9439901.452, y: -14839182.798, z: 977010.415, dist: 17614415.5, orbit: -2, size: 4.985, startype: 'B', label: loc('star_mimosa'), zlabel: loc('star_mimosa') },
    // Pi1 Pegasi — Pegasus.
    // G6III:, V 5.58, 6.73 solar radii, 288.6 ly.
    pi1pegasi: { hex: '4db', x: 627118.443, y: 17303674.989, z: -5777598.432, dist: 18253522.7, orbit: -2, size: 5.19, startype: 'G', label: loc('star_pi1pegasi'), zlabel: loc('star_pi1pegasi') },
    // Epsilon Ursae Minoris — Ursa Minor.
    // G5IIIvar, V 4.21, 12.98 solar radii, 304.0 ly.
    epsilonursaeminoris: { hex: 'e13', x: -6959143.505, y: 14926560.532, z: 9914588.484, dist: 19223187.9, orbit: -2, size: 7.207, startype: 'G', label: loc('star_epsilonursaeminoris'), zlabel: loc('star_epsilonursaeminoris') },
    // Eta Centauri — Centaurus.
    // B1Vn + A, V 2.33, 4.60 solar radii, 305.7 ly.
    etacentauri: { hex: 'f4a', x: 14745817.442, y: -11203189.348, z: 5545085.95, dist: 19331284.5, orbit: -2, size: 4.288, startype: 'B', label: loc('star_etacentauri'), zlabel: loc('star_etacentauri') },
    // Canopus — Carina.
    // F0Ib, V -0.62, 71.17 solar radii, 309.2 ly.
    canopus: { hex: '0b3', x: -2700626.482, y: -17469482.404, z: -8352958.19, dist: 19551166.4, orbit: -2, size: 16.873, startype: 'F', label: loc('star_canopus'), zlabel: loc('star_canopus') },
    // Acrux — Crux.
    // B0.5IV, V 0.77, 8.96 solar radii, 322.0 ly.
    acrux: { hex: 'bb7', x: 10219639.256, y: -17610915.484, z: -128887.404, dist: 20361777.5, orbit: -2, size: 5.986, startype: 'B', label: loc('star_acrux'), zlabel: loc('star_acrux') },
    // Omega Carinae — Carina.
    // B8III, V 3.29, 6.30 solar radii, 341.9 ly.
    omegacarinae: { hex: '4f0', x: 7311492.488, y: -19910779.12, z: -4191981.117, dist: 21621048.8, orbit: -2, size: 5.02, startype: 'B', label: loc('star_omegacarinae'), zlabel: loc('star_omegacarinae') },
    // Imai — Crux.
    // B2IV, V 2.79, 5.19 solar radii, 345.1 ly.
    imai: { hex: '8b0', x: 10301503.549, y: -19188867.817, z: 1443161.961, dist: 21826963.6, orbit: -2, size: 4.558, startype: 'B', label: loc('star_imai'), zlabel: loc('star_imai') },
    // Alkaphrah — Ursa Major.
    // A1Vn, V 3.57, 7.74 solar radii, 358.4 ly.
    alkaphrah: { hex: 'a94', x: -16801136.362, y: 2173958.278, z: 15058692.869, dist: 22666462.2, orbit: -2, size: 5.564, startype: 'A', label: loc('star_alkaphrah'), zlabel: loc('star_alkaphrah') },
    // Furud — Canis Major.
    // B2.5V, V 3.02, 5.40 solar radii, 362.4 ly.
    furud: { hex: '6a7', x: -11605446.042, y: -18232338.68, z: -7625251.68, dist: 22918311.8, orbit: -2, size: 4.646, startype: 'B', label: loc('star_furud'), zlabel: loc('star_furud') },
    // Lambda Pegasi — Pegasus.
    // G8II-III, V 3.97, 18.89 solar radii, 365.2 ly.
    lambdapegasi: { hex: '344', x: 256380.597, y: 19793850.784, z: -11901832.477, dist: 23097962.6, orbit: -2, size: 8.693, startype: 'G', label: loc('star_lambdapegasi'), zlabel: loc('star_lambdapegasi') },
    // Zeta Ursae Minoris — Ursa Minor.
    // A3Vn, V 4.29, 6.39 solar radii, 369.0 ly.
    zetaursaeminoris: { hex: 'd6f', x: -7310179.346, y: 17492464.049, z: 13601823.458, dist: 23333122.9, orbit: -2, size: 5.054, startype: 'A', label: loc('star_zetaursaeminoris'), zlabel: loc('star_zetaursaeminoris') },
    // Nu Puppis — Carina.
    // B8III SB, V 3.17, 7.23 solar radii, 371.5 ly.
    nupuppis: { hex: 'cd8', x: -6821841.122, y: -20915081.402, z: -8241536.29, dist: 23492574.7, orbit: -2, size: 5.379, startype: 'B', label: loc('star_nupuppis'), zlabel: loc('star_nupuppis') },
    // Zeta Centauri — Centaurus.
    // B2.5IV, V 2.55, 7.06 solar radii, 381.9 ly.
    zetacentauri: { hex: 'ba9', x: 16286069.774, y: -16824182.11, z: 5921822.007, dist: 24152787.6, orbit: -2, size: 5.314, startype: 'B', label: loc('star_zetacentauri'), zlabel: loc('star_zetacentauri') },
    // Kappa Centauri — Centaurus.
    // B2IV, V 3.13, 4.93 solar radii, 383.3 ly.
    kappacentauri: { hex: '293', x: 19628867.278, y: -12809548.888, z: 6172552.224, dist: 24237932.5, orbit: -2, size: 4.441, startype: 'B', label: loc('star_kappacentauri'), zlabel: loc('star_kappacentauri') },
    // Algenib — Pegasus.
    // B2IV, V 2.83, 5.78 solar radii, 391.5 ly.
    algenib: { hex: '661', x: -5651839.014, y: 16019098.21, z: -18016272.469, dist: 24761681.4, orbit: -2, size: 4.81, startype: 'B', label: loc('star_algenib'), zlabel: loc('star_algenib') },
    // Hadar — Centaurus.
    // B1III, V 0.61, 13.02 solar radii, 392.0 ly.
    hadar: { hex: '2f4', x: 16509733.379, y: -18486517.49, z: 541315.333, dist: 24791443, orbit: -2, size: 7.216, startype: 'B', label: loc('star_hadar'), zlabel: loc('star_hadar') },
    // Adhara — Canis Major.
    // B2II, V 1.5, 11.04 solar radii, 405.2 ly.
    adhara: { hex: '30e', x: -12625918.932, y: -21720572.411, z: -5033770.394, dist: 25622957.3, orbit: -2, size: 6.646, startype: 'B', label: loc('star_adhara'), zlabel: loc('star_adhara') },
    // Segin — Cassiopeia.
    // B2pvar, V 3.35, 4.79 solar radii, 411.8 ly.
    segin: { hex: 'b56', x: -16679539.336, y: 19987463.898, z: 748349.943, dist: 26043536.1, orbit: -2, size: 4.376, startype: 'B', label: loc('star_segin'), zlabel: loc('star_segin') },
    // Sigma Centauri — Centaurus.
    // B3V, V 3.91, 4.34 solar radii, 411.8 ly.
    sigmacentauri: { hex: 'f85', x: 12368582.251, y: -22218776.751, z: 5622268.755, dist: 26043536.1, orbit: -2, size: 4.164, startype: 'B', label: loc('star_sigmacentauri'), zlabel: loc('star_sigmacentauri') },
    // Delta Centauri — Centaurus.
    // B2IVne, V 2.58, 6.88 solar radii, 415.0 ly.
    deltacentauri: { hex: 'cde', x: 11268771.449, y: -23108027.63, z: 5262542.023, dist: 26242341.7, orbit: -2, size: 5.245, startype: 'B', label: loc('star_deltacentauri'), zlabel: loc('star_deltacentauri') },
    // Lambda Centauri — Centaurus.
    // B9II:, V 3.11, 9.63 solar radii, 419.8 ly.
    lambdacentauri: { hex: '569', x: 10993833.896, y: -24154150.413, z: -647343.485, dist: 26546307.1, orbit: -2, size: 6.205, startype: 'B', label: loc('star_lambdacentauri'), zlabel: loc('star_lambdacentauri') },
    // HD 100673 — Centaurus.
    // B9V, V 4.62, 4.88 solar radii, 426.3 ly.
    hd100673: { hex: 'e35', x: 9936580.273, y: -24852280.299, z: 3258341.928, dist: 26962719.7, orbit: -2, size: 4.417, startype: 'B', label: loc('star_hd100673'), zlabel: loc('star_hd100673') },
    // Epsilon Centauri — Centaurus.
    // B1III, V 2.29, 6.55 solar radii, 427.5 ly.
    epsiloncentauri: { hex: '372', x: 17244308.245, y: -20411693.441, z: 4098910.158, dist: 27033395.3, orbit: -2, size: 5.118, startype: 'B', label: loc('star_epsiloncentauri'), zlabel: loc('star_epsiloncentauri') },
    // Upsilon1 Centauri — Centaurus.
    // B2IV-V, V 3.87, 3.91 solar radii, 427.5 ly.
    upsilon1centauri: { hex: 'b24', x: 18424478.184, y: -18241315.756, z: 7654898.015, dist: 27033395.3, orbit: -2, size: 3.956, startype: 'B', label: loc('star_upsilon1centauri'), zlabel: loc('star_upsilon1centauri') },
    // Polaris — Ursa Minor.
    // F7:Ib-IIv SB, V 1.97, 40.77 solar radii, 432.6 ly.
    polaris: { hex: 'aba', x: -13438636.487, y: 20473611.57, z: 12189713.765, dist: 27356075.1, orbit: -2, size: 12.771, startype: 'F', label: loc('star_polaris'), zlabel: loc('star_polaris') },
    // Albireo — Cygnus.
    // K3II+..., V 3.05, 49.22 solar radii, 434.3 ly.
    albireo: { hex: 'c5e', x: 12806894.185, y: 24197873.193, z: 2189074.24, dist: 27465353.7, orbit: -2, size: 14.031, startype: 'KIII', label: loc('star_albireo'), zlabel: loc('star_albireo') },
    // Nu Centauri — Centaurus.
    // B2IV, V 3.41, 4.94 solar radii, 436.6 ly.
    nucentauri: { hex: '67d', x: 18171935.985, y: -18547552.056, z: 9392284.333, dist: 27612423.8, orbit: -2, size: 4.445, startype: 'B', label: loc('star_nucentauri'), zlabel: loc('star_nucentauri') },
    // Xi2 Canis Majoris — Canis Major.
    // A0III, V 4.54, 5.79 solar radii, 441.3 ly.
    xi2canismajoris: { hex: '20d', x: -16700693.702, y: -21367756.717, z: -6599146.086, dist: 27911340.5, orbit: -2, size: 4.811, startype: 'A', label: loc('star_xi2canismajoris'), zlabel: loc('star_xi2canismajoris') },
    // HD 50896 — Canis Major.
    // WN5 (SB1), V 6.65, 13.43 solar radii, 441.9 ly.
    hd50896: { hex: 'c71', x: -15878917.76, y: -22473789.608, z: -4893294.953, dist: 27949160.7, orbit: -2, size: 7.329, startype: 'O', label: loc('star_hd50896'), zlabel: loc('star_hd50896') },
    // Omicron2 Canis Majoris — Canis Major.
    // B3Ia, V 3.02, 3.61 solar radii, 441.9 ly.
    omicron2canismajoris: { hex: '1ed', x: -15645880.846, y: -22811466.286, z: -3999875.314, dist: 27949160.7, orbit: -2, size: 3.8, startype: 'B', label: loc('star_omicron2canismajoris'), zlabel: loc('star_omicron2canismajoris') },
    // Muliphein — Canis Major.
    // B8II, V 4.11, 5.58 solar radii, 441.9 ly.
    muliphein: { hex: '608', x: -18555164.952, y: -20790642.19, z: -2147238.926, dist: 27949160.7, orbit: -2, size: 4.725, startype: 'B', label: loc('star_muliphein'), zlabel: loc('star_muliphein') },
    // Aludra — Canis Major.
    // B5Ia, V 2.45, 3.36 solar radii, 441.9 ly.
    aludra: { hex: '41c', x: -12772761.56, y: -24658577.128, z: -3157011.283, dist: 27949160.7, orbit: -2, size: 3.666, startype: 'B', label: loc('star_aludra'), zlabel: loc('star_aludra') },
    // HD 79351 — Carina.
    // B2IV, V 3.43, 5.01 solar radii, 446.8 ly.
    hd79351: { hex: 'b4a', x: 3750036.345, y: -27769793.505, z: -3625798.309, dist: 28255452.9, orbit: -2, size: 4.475, startype: 'B', label: loc('star_hd79351'), zlabel: loc('star_hd79351') },
    // Theta Carinae — Carina.
    // B0Vp, V 2.74, 4.70 solar radii, 455.5 ly.
    thetacarinae: { hex: '407', x: 9627306.882, y: -27039837.187, z: -2461547.653, dist: 28807933.8, orbit: -2, size: 4.335, startype: 'B', label: loc('star_thetacarinae'), zlabel: loc('star_thetacarinae') },
    // Pherkad — Ursa Minor.
    // A3II-III, V 3, 15.26 solar radii, 486.8 ly.
    pherkad: { hex: '72b', x: -7376405.112, y: 22092733.559, z: 20131188.661, dist: 30785791.9, orbit: -2, size: 7.813, startype: 'A', label: loc('star_pherkad'), zlabel: loc('star_pherkad') },
    // Mirzam — Canis Major.
    // B1II/III, V 1.98, 8.71 solar radii, 492.7 ly.
    mirzam: { hex: 'db7', x: -20953698.445, y: -21743594.587, z: -7679109.129, dist: 31157825.7, orbit: -2, size: 5.901, startype: 'B', label: loc('star_mirzam'), zlabel: loc('star_mirzam') },
    // Betelgeuse — Orion.
    // M2Ib, V 0.45, 610.26 solar radii, 497.9 ly.
    betelgeuse: { hex: 'dc7', x: -29269998.704, y: -10530474.629, z: -4903814.762, dist: 31490810.1, orbit: -2, size: 49.407, startype: 'M', label: loc('star_betelgeuse'), zlabel: loc('star_betelgeuse') },
    // Mu Centauri — Centaurus.
    // B2IV-Ve, V 3.47, 5.56 solar radii, 505.7 ly.
    mucentauri: { hex: 'a9a', x: 21079402.839, y: -21647850.535, z: 10473219.309, dist: 31979039.7, orbit: -2, size: 4.717, startype: 'B', label: loc('star_mucentauri'), zlabel: loc('star_mucentauri') },
    // Phi Ursae Majoris — Ursa Major.
    // A3IV, V 4.55, 7.81 solar radii, 508.8 ly.
    phiursaemajoris: { hex: 'b68', x: -20461269.325, y: 7098139.643, z: 23799474.12, dist: 32178596.9, orbit: -2, size: 5.59, startype: 'A', label: loc('star_phiursaemajoris'), zlabel: loc('star_phiursaemajoris') },
    // Nu Orionis — Orion.
    // B3IV, V 4.42, 4.30 solar radii, 516.1 ly.
    nuorionis: { hex: '966', x: -31517546.067, y: -8331056.601, z: -1549475.883, dist: 32636836.4, orbit: -2, size: 4.145, startype: 'B', label: loc('star_nuorionis'), zlabel: loc('star_nuorionis') },
    // 69 Orionis — Orion.
    // B5Vn, V 4.95, 3.69 solar radii, 528.6 ly.
    orionis69: { hex: '5f4', x: -32412025.156, y: -8162020.609, z: -652251.22, dist: 33430276.5, orbit: -2, size: 3.84, startype: 'B', label: loc('star_orionis69'), zlabel: loc('star_orionis69') },
    // Gamma Cassiopeiae — Cassiopeia.
    // B0IV:evar, V 2.15, 7.43 solar radii, 549.1 ly.
    gammacassiopeiae: { hex: '640', x: -19191155.748, y: 28910392.445, z: -1301755.998, dist: 34724714.8, orbit: -2, size: 5.452, startype: 'B', label: loc('star_gammacassiopeiae'), zlabel: loc('star_gammacassiopeiae') },
    // 5 Orionis — Orion.
    // M1III, V 5.33, 66.03 solar radii, 590.9 ly.
    orionis5: { hex: '6e1', x: -32616714.753, y: -9401010.37, z: -15622087.334, dist: 37366812.7, orbit: -2, size: 16.252, startype: 'M', label: loc('star_orionis5'), zlabel: loc('star_orionis5') },
    // Avior — Carina.
    // K3III+B2V, V 1.86, 118.62 solar radii, 605.1 ly.
    avior: { hex: '2b3', x: 2790803.408, y: -37241875.997, z: -8348531.229, dist: 38268053.1, orbit: -2, size: 21.783, startype: 'KIII', label: loc('star_avior'), zlabel: loc('star_avior') },
    // HD 96918 — Carina.
    // G0Ia0, V 3.93, 1.10 solar radii, 605.1 ly.
    hd96918: { hex: 'c39', x: 13089775.61, y: -35949376.768, z: 862536.72, dist: 38268053.1, orbit: -2, size: 2.098, startype: 'G', label: loc('star_hd96918'), zlabel: loc('star_hd96918') },
    // Alnilam — Orion.
    // B0Ia, V 1.69, 7.16 solar radii, 607.4 ly.
    alnilam: { hex: '752', x: -33189849.287, y: -15626493.212, z: -11385040.497, dist: 38410578.4, orbit: -2, size: 5.352, startype: 'B', label: loc('star_alnilam'), zlabel: loc('star_alnilam') },
    // Xi Orionis — Orion.
    // B3IV, V 4.45, 4.99 solar radii, 607.4 ly.
    xiorionis: { hex: '397', x: -36933999.567, y: -10456424.383, z: -1383979.036, dist: 38410578.4, orbit: -2, size: 4.466, startype: 'B', label: loc('star_xiorionis'), zlabel: loc('star_xiorionis') },
    // Saiph — Orion.
    // B0.5Iavar, V 2.07, 9.90 solar radii, 647.1 ly.
    saiph: { hex: '37e', x: -31980052.256, y: -21991060.137, z: -12983478.992, dist: 40925556.7, orbit: -2, size: 6.291, startype: 'B', label: loc('star_saiph'), zlabel: loc('star_saiph') },
    // HD 89388 — Carina.
    // K3II, V 3.39, 63.72 solar radii, 657.6 ly.
    hd89388: { hex: '0c4', x: 11075907.605, y: -39988424.831, z: -2759734.474, dist: 41585646.4, orbit: -2, size: 15.965, startype: 'KIII', label: loc('star_hd89388'), zlabel: loc('star_hd89388') },
    // Kappa Canis Majoris — Canis Major.
    // B1.5IVne, V 3.5, 6.11 solar radii, 658.9 ly.
    kappacanismajoris: { hex: 'd95', x: -18718869.7, y: -35737839.507, z: -10429339.57, dist: 41669657.8, orbit: -2, size: 4.942, startype: 'B', label: loc('star_kappacanismajoris'), zlabel: loc('star_kappacanismajoris') },
    // Enif — Pegasus.
    // K2Ibvar, V 2.38, 90.50 solar radii, 689.5 ly.
    enif: { hex: 'cb0', x: 15384111.931, y: 33868393.483, z: -22757408.052, dist: 43607781.4, orbit: -2, size: 19.026, startype: 'KIII', label: loc('star_enif'), zlabel: loc('star_enif') },
    // Mintaka — Orion.
    // O9.5II, V 2.25, 8.75 solar radii, 692.5 ly.
    mintaka: { hex: '262', x: -38147085.827, y: -16869357.775, z: -13343436.39, dist: 43792952.4, orbit: -2, size: 5.916, startype: 'O', label: loc('star_mintaka'), zlabel: loc('star_mintaka') },
    // Alnitak — Orion.
    // O9.5Ib SB, V 1.74, 11.77 solar radii, 736.2 ly.
    alnitak: { hex: '389', x: -39951981.423, y: -19877706.7, z: -13290363.613, dist: 46560904.3, orbit: -2, size: 6.861, startype: 'O', label: loc('star_alnitak'), zlabel: loc('star_alnitak') },
    // Aspidiske — Carina.
    // A8Ib, V 2.21, 43.13 solar radii, 765.6 ly.
    aspidiske: { hex: '960', x: 7069428.086, y: -47534094.22, z: -5910125.902, dist: 48418968.5, orbit: -2, size: 13.134, startype: 'A', label: loc('star_aspidiske'), zlabel: loc('star_aspidiske') },
    // Rigel — Orion.
    // B8Ia, V 0.18, 66.58 solar radii, 862.8 ly.
    rigel: { hex: 'a4d', x: -43066329.648, y: -24109594.482, z: -23272748.633, dist: 54567409, orbit: -2, size: 16.319, startype: 'B', label: loc('star_rigel'), zlabel: loc('star_rigel') },
    // HD 117440 — Centaurus.
    // G8II/III, V 3.9, 48.39 solar radii, 906.0 ly.
    hd117440: { hex: '20e', x: 34798490.429, y: -39721835.853, z: 22227171.715, dist: 57295779.4, orbit: -2, size: 13.913, startype: 'G', label: loc('star_hd117440'), zlabel: loc('star_hd117440') },
    // Omega Canis Majoris — Canis Major.
    // B2IV/Ve, V 4.01, 7.82 solar radii, 911.1 ly.
    omegacanismajoris: { hex: 'a68', x: -29094459.523, y: -49210188.929, z: -7173418.273, dist: 57615867.6, orbit: -2, size: 5.592, startype: 'B', label: loc('star_omegacanismajoris'), zlabel: loc('star_omegacanismajoris') },
    // Pi6 Orionis — Orion.
    // K2IIvar, V 4.47, 47.39 solar radii, 945.4 ly.
    pi6orionis: { hex: 'ec0', x: -52065640.302, y: -16474450.783, z: -24335879.223, dist: 59786900.3, orbit: -2, size: 13.768, startype: 'KIII', label: loc('star_pi6orionis'), zlabel: loc('star_pi6orionis') },
    // Pi4 Orionis — Orion.
    // B2III SB, V 3.68, 10.51 solar radii, 1052.1 ly.
    pi4orionis: { hex: '259', x: -59470672.616, y: -13610013.875, z: -26555292.132, dist: 66537034.2, orbit: -2, size: 6.483, startype: 'B', label: loc('star_pi4orionis'), zlabel: loc('star_pi4orionis') },
    // Naos — Carina.
    // O5IAf, V 2.21, 11.70 solar radii, 1083.6 ly.
    naos: { hex: 'cbe', x: -16549998.877, y: -66259921.65, z: -5621689.171, dist: 68526513.6, orbit: -2, size: 6.84, startype: 'O', label: loc('star_naos'), zlabel: loc('star_naos') },
    // Meissa — Orion.
    // O..., V 3.39, 6.88 solar radii, 1098.2 ly.
    meissa: { hex: 'bd3', x: -65602326.456, y: -17641780.231, z: -14433489.868, dist: 69449429.6, orbit: -2, size: 5.248, startype: 'O', label: loc('star_meissa'), zlabel: loc('star_meissa') },
    // Nganurganity — Canis Major.
    // K4III, V 3.49, 122.25 solar radii, 1120.8 ly.
    nganurganity: { hex: '317', x: -35744934.347, y: -59888673.893, z: -12641833.773, dist: 70881376.6, orbit: -2, size: 22.113, startype: 'KIII', label: loc('star_nganurganity'), zlabel: loc('star_nganurganity') },
    // HD 93070 — Carina.
    // K3Ib, V 4.58, 63.88 solar radii, 1140.4 ly.
    hd93070: { hex: 'e6b', x: 22091148.29, y: -68628013.666, z: -1884755.697, dist: 72120561.5, orbit: -2, size: 15.985, startype: 'KIII', label: loc('star_hd93070'), zlabel: loc('star_hd93070') },
    // Pi5 Orionis — Orion.
    // B2III SB, V 3.71, 13.22 solar radii, 1342.2 ly.
    pi5orionis: { hex: '49b', x: -74110884.114, y: -21625127.567, z: -35284453.293, dist: 84882636.2, orbit: -2, size: 7.273, startype: 'B', label: loc('star_pi5orionis'), zlabel: loc('star_pi5orionis') },
    // HD 90853 — Carina.
    // F2II, V 3.81, 45.34 solar radii, 1342.2 ly.
    hd90853: { hex: '59b', x: 22279691.145, y: -81895781.139, z: -1326018.382, dist: 84882636.2, orbit: -2, size: 13.467, startype: 'F', label: loc('star_hd90853'), zlabel: loc('star_hd90853') },
    // Deneb — Cygnus.
    // A2Ia, V 1.25, 95.96 solar radii, 1411.9 ly.
    deneb: { hex: 'a4b', x: 8886756.74, y: 88794266.231, z: 3112428.886, dist: 89292123.8, orbit: -2, size: 19.591, startype: 'A', label: loc('star_deneb'), zlabel: loc('star_deneb') },
    // HD 74375 — Carina.
    // B1.5III, V 4.31, 9.21 solar radii, 1443.2 ly.
    hd74375: { hex: 'b12', x: 9092489.336, y: -89170753.264, z: -17195366.609, dist: 91267613.3, orbit: -2, size: 6.069, startype: 'B', label: loc('star_hd74375'), zlabel: loc('star_hd74375') },
    // Wezen — Canis Major.
    // F8Ia, V 1.83, 167.18 solar radii, 1606.7 ly.
    wezen: { hex: '9a7', x: -52662003.246, y: -85659385.305, z: -14609087.84, dist: 101608278.8, orbit: -2, size: 25.859, startype: 'F', label: loc('star_wezen'), zlabel: loc('star_wezen') },
    // Chi2 Orionis — Orion.
    // B2Iavar, V 4.64, 11.57 solar radii, 1802.0 ly.
    chi2orionis: { hex: 'd92', x: -112319343.731, y: -19182444.928, z: -1711316.712, dist: 113958456.4, orbit: -2, size: 6.802, startype: 'B', label: loc('star_chi2orionis'), zlabel: loc('star_chi2orionis') },
    // Sadr — Cygnus.
    // F8Ib, V 2.23, 158.58 solar radii, 1832.3 ly.
    sadr: { hex: '213', x: 23785965.7, y: 113348755.913, z: 3775477.084, dist: 115879104.5, orbit: -2, size: 25.186, startype: 'F', label: loc('star_sadr'), zlabel: loc('star_sadr') },
    // Iota Canis Majoris — Canis Major.
    // B3Ib/II, V 4.36, 21.47 solar radii, 2508.9 ly.
    iotacanismajoris: { hex: '6f1', x: -104002677.583, y: -118396301.586, z: -18450358.971, dist: 158665235.4, orbit: -2, size: 9.267, startype: 'B', label: loc('star_iotacanismajoris'), zlabel: loc('star_iotacanismajoris') },
};

// --- The cow -------------------------------------------------------------------------------------

// Which M-type stars are far enough out to hide a cow behind.
function cowCandidates(){
    let sol = { x: 0, y: 0, z: 0 };
    let tau = starData.tauceti;
    return Object.keys(starData).filter(function(id){
        let s = starData[id];
        if (s.startype !== 'M' || s.hidden){ return false; }
        let at = { x: s.x, y: s.y, z: s.z };
        return dist3(at, sol) > starConstants.COW_MIN_SOL && dist3(at, tau) > starConstants.COW_MIN_TAU;
    });
}

// Where the cow sits around its star. The system has to have been dealt before the worlds it must
// keep clear of can be read off, so ask for it here rather than relying on the map having drawn it.
function cowOrbit(star){
    starSystem(star);
    let outer = 0, k = 0;
    for (let body of Object.values(starData)){
        if (body.star !== star || body.startype || body.bodystar || !body.dist){ continue; }
        outer = Math.max(outer, body.dist);
        if (body.orbit > 0){ k = body.orbit / Math.pow(body.dist, 1.5); }
    }
    let dist = +Math.max(outer * starConstants.COW_ORBIT_CLEAR, starConstants.COW_ORBIT_MIN).toFixed(2);
    return { d: dist, o: Math.round((k || starConstants.COW_PERIOD_K) * Math.pow(dist, 1.5)) };
}

export function cowPlanet(){
    if (!global.race['truepath']){
        if (starData[starConstants.COW_ID]){ starDataChanged(); }
        delete starData[starConstants.COW_ID];
        delete global.race['cow'];
        return false;
    }
    // Re-rolled if the star it was hiding behind is no longer in the table.
    if (!global.race['cow'] || !starData[global.race.cow.s]){
        let stars = cowCandidates();
        if (stars.length === 0){ return false; }
        let star = stars[Math.floor(Math.random() * stars.length)];
        let orbit = cowOrbit(star);
        global.race['cow'] = { s: star, e: starConstants.COW_GLYPHS[Math.floor(Math.random() * starConstants.COW_GLYPHS.length)], d: orbit.d, o: orbit.o };
    }
    let cow = global.race.cow;
    if (!starData[starConstants.COW_ID] || starData[starConstants.COW_ID].star !== cow.s){
        starData[starConstants.COW_ID] = { dist: cow.d, orbit: cow.o, size: starConstants.COW_SIZE, star: cow.s };
        starDataChanged();
    }
    return starConstants.COW_ID;
}

// The glyph to draw a body with, or false for anything that is not the cow.
function cowGlyph(id){
    return id === starConstants.COW_ID && global.race['cow'] ? global.race.cow.e : false;
}

// The Star Seed
function starSeed(){
    return typeof global['starseed'] === 'number' ? global['starseed'] : 0;
}

// A 32-bit hash of a key, folded with the run's star seed — FNV-1a mixing with a splitmix32 finaliser.
function starHash(key){
    let h = (2166136261 ^ starSeed()) >>> 0;
    for (let i = 0; i < key.length; i++){
        h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
}

// A number in [min,max) for a key. The same key always gives the same answer, in any order.
export function starRandom(key, min = 0, max = 1){
    return min + (starHash(key) / 4294967296) * (max - min);
}

// The three-hex-character code a system is keyed by. Stored on the star's own entry rather than worked out from the
// table, so what a system contains depends on its code and the run seed alone — adding a star to the catalogue, or dropping one, leaves every other system exactly as it was.
function starHex(id){
    let star = starData[id];
    return star && star.hex ? star.hex : id;
}

// The star a body draws its numbers from. A moon keys off its planet, so it belongs to the same
// system its primary does.
function bodySystem(id){
    let body = starData[id];
    if (!body){ return 'spc_sun'; }
    if (body.star){ return body.star; }
    if (body.parent){ return bodySystem(body.parent); }
    return 'spc_sun';
}

// Where a body sits on its orbit on day zero of the run, in degrees.
const startAngleCache = {};
function startAngle(id){
    if (startAngleCache[id] === undefined){
        let twin = starConstants.OPPOSITE_OF[id];
        startAngleCache[id] = twin ? (startAngle(twin) + 180) % 360
                                   : starRandom(`orbit:${starHex(bodySystem(id))}:${id}`, 0, 360);
    }
    return startAngleCache[id];
}

// Per-frame render offset from the last simulated map day.
var renderAhead = 0;
var drawAhead = 0;

// Days the run has lasted, stored at map resolution.
export const starInfo = { days: 0, sys: {} };
let orbitsSynced = false;
function runDays(){
    if (!orbitsSynced){
        orbitsSynced = true;
        starInfo.days = global.stats && typeof global.stats.days === 'number' ? global.stats.days : 0;
    }
    return starInfo.days;
}

// Move the whole sky on by `days`. One addition, however many bodies are out there: the positions
// themselves are worked out from this when something asks for one.
export function advanceOrbits(days){
    starInfo.days = runDays() + days;
}

// The period an angle is wound at. A kamikaze home world's year shortens as it falls, and winding thousands of days by a
// period that keeps changing would jump the planet several degrees every time the year did.
function anglePeriod(id){
    if (id === 'spc_home' && kamikazeRun()){ return kamikazeOrbit() || orbitPeriod(id); }
    return orbitPeriod(id);
}

// Where a body is on its orbit right now, in degrees — its day-zero angle wound on by the days
// since. `ahead` looks that many days into the future without moving anything.
export function orbitAngle(id, ahead = 0){
    let period = anglePeriod(id);
    if (!(period > 0)){ return 0; }
    let deg = startAngle(id) + 360 * (runDays() + drawAhead + ahead) / period;
    return ((deg % 360) + 360) % 360;
}

export function setOrbits(){
    // Which star the cow hides behind is a decision rather than a position, so it is still rolled
    // once and recorded. Everything else works out where it is from the seed and the clock.
    cowPlanet();
}

// Procedural Systems

// Bumped whenever a body is added to or removed from starData, a system being built, or other event.
let starDataVersion = 0;
function starDataChanged(){ starDataVersion++; }

// Systems that are hand-authored and must never be generated over.
function handAuthored(starId){
    return starId === 'spc_sun' || starId === 'tauceti';
}

// A hidden barycenter stands in for a close pair; the components themselves are the `bodystar`
// entries orbiting it, and dealing it planets on top of those would put worlds through the stars.
function generatable(starId){
    let star = starData[starId];
    return !!star && !!star.startype && !star.hidden && !handAuthored(starId);
}

// The system's own random stream. Keyed by the star's code so the answer depends on this system and
// the run seed alone — adding or removing stars elsewhere in the catalogue changes nothing here.
function sysRandom(starId, key, min = 0, max = 1){
    return starRandom(`sys:${starHex(starId)}:${key}`, min, max);
}
function sysInt(starId, key, min, max){
    return Math.floor(sysRandom(starId, key, min, max + 1));
}
function sysPick(starId, key, list){
    return list[Math.min(list.length - 1, Math.floor(sysRandom(starId, key, 0, list.length)))];
}
// A [chance, value] table, walked until the roll is used up.
function sysWeighted(starId, key, weights){
    let roll = sysRandom(starId, key);
    for (const [chance, value] of weights){
        if (roll < chance){ return value; }
        roll -= chance;
    }
    return weights[weights.length - 1][1];
}

// A star's luminosity relative to the Sun, from its recorded size and its class temperature. The
// table stores 2*sqrt(R), so the radius comes back out of the size the same way skyFlux takes it.
function starLuminosity(star){
    const R = Math.pow((star.size || 1) / 2, 2);
    const T = starConstants.STAR_TEMP[star.startype] || starConstants.SUN_TEMP;
    return R * R * Math.pow(T / starConstants.SUN_TEMP, 4);
}

// The conservative habitable zone, in AU — the runaway-greenhouse and maximum-greenhouse limits the rest of the
// catalogue was built against, so a generated world in the zone sits where a hand-placed one would have.
function habitableZone(star){
    const rt = Math.sqrt(starLuminosity(star));
    return { inner: 0.95 * rt, outer: 1.37 * rt };
}

// Beyond this, water is ice and a world can gather enough of it to become a giant.
function snowLine(star){
    return 2.7 * Math.sqrt(starLuminosity(star));
}

// How far out this star can hold anything. A companion a few tens of AU away bounds its primary's system: past about a
// third of the separation an orbit is not stable, which is the rule the hand-built systems were laid out under.
const systemReachCache = {};
function systemReach(starId){
    if (systemReachCache[starId] === undefined){
        const here = starData[starId];
        let best = Infinity;
        for (const id of starIndex()){
            if (id === starId){ continue; }
            const other = starData[id];
            const d = Math.hypot(here.x - other.x, here.y - other.y, here.z - other.z);
            if (d > 0 && d < best){ best = d; }
        }
        systemReachCache[starId] = best === Infinity ? Infinity : best * starConstants.COMPANION_SAFE_FRACTION;
    }
    return systemReachCache[starId];
}

// Orbital period in days, from Kepler's third law on the primary's mass in solar masses.
function keplerPeriod(au, mass){
    return Math.max(Math.round(365.25 * Math.sqrt((au * au * au) / (mass || 1))), 1);
}

// A planet's mass in solar masses, worked back out of the radius the table records.
function planetMass(size){
    const re = Math.pow(size / starConstants.EARTH_SIZE, 2);        // radii, in Earth radii
    const me = size >= 0.35
        ? starConstants.GIANT_MASSES * Math.pow(re / starConstants.GIANT_RADII, starConstants.GIANT_MASS_EXP)
        : re * re * re;
    return me * starConstants.EARTH_MASS_SOLAR;
}

// A moon's period, which is short enough that whole days are too coarse a unit — the innermost of a
// gas giant's family comes round in well under one.
function moonPeriod(au, planetSize){
    return Math.max(+(365.25 * Math.sqrt((au * au * au) / planetMass(planetSize))).toFixed(4), 0.05);
}

// A planet's radius in AU, back out of the recorded size the same way planetMass reads it.
function planetRadiusAU(size){
    return starConstants.EARTH_RADIUS_AU * Math.pow(size / starConstants.EARTH_SIZE, 2);
}

// Inclinations are wrapped into a single turn, so the table never carries a negative angle or one past 360 — adding a
// tilt to a lean and then flipping it for a retrograde orbit can produce both.
function normInc(deg){
    const a = deg % 360;
    return +(a < 0 ? a + 360 : a).toFixed(2);
}

// A moon's orbital plane.
function moonIncline(starId, planetIndex, moonIndex, tilt){
    const key = `${planetIndex}_${moonIndex}`;
    const roll = sysRandom(starId, `moonband${key}`);
    let range;
    if (roll < starConstants.ODDS_STEEP){ range = starConstants.INC_STEEP; }
    else if (roll < starConstants.ODDS_STEEP + starConstants.ODDS_MODERATE){ range = starConstants.INC_MODERATE; }
    else { range = [0, starConstants.MOON_INC_SCATTER]; }
    const away = sysRandom(starId, `mooninc${key}`, ...range);
    const sign = sysRandom(starId, `moonside${key}`) < 0.5 ? -1 : 1;
    const off = tilt + away * sign;
    const back = sysRandom(starId, `moonretro${key}`) < starConstants.MOON_ODDS_RETRO;
    return normInc(back ? off + 180 : off);
}

// How far off its system's plane a body orbits, in degrees.
function orbitTilt(starId, key, au, snow){
    const lean = starConstants.INC_INNER
        + (starConstants.INC_OUTER - starConstants.INC_INNER) * Math.min(1, snow > 0 ? au / snow : 1);
    const roll = sysRandom(starId, `inc:${key}`);
    const band = (odds, range, edge) => roll < edge + odds * lean ? range : false;
    let edge = 0;
    let range = band(starConstants.ODDS_RETRO, starConstants.INC_RETRO, edge);
    edge += starConstants.ODDS_RETRO * lean;
    if (!range){ range = band(starConstants.ODDS_STEEP, starConstants.INC_STEEP, edge); }
    edge += starConstants.ODDS_STEEP * lean;
    if (!range){ range = band(starConstants.ODDS_MODERATE, starConstants.INC_MODERATE, edge); }
    if (!range){ range = starConstants.INC_FLAT; }
    return normInc(sysRandom(starId, `incv:${key}`, ...range));
}

// Scientific exoplanet naming: the star is `a`, and its planets take lowercase letters outward from
// `b`. Moons follow the convention the solar system's own use — the body's name and a Roman numeral.
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
function planetLetter(n){
    return String.fromCharCode(98 + n);   // 0 -> 'b'
}
function starLabel(starId){
    const star = starData[starId];
    return (star && (star.zlabel || star.label)) || '';
}

// Everything one star holds. Pure: called twice for the same star it deals the same system.
function dealSystem(starId){
    const star = starData[starId];
    const rules = starConstants.SYSTEM_RULES[star.startype] || starConstants.SYSTEM_RULES.M;
    const mass = starConstants.STAR_MASS[star.startype] || 1;
    const hz = habitableZone(star);
    const snow = snowLine(star);
    const reach = systemReach(starId);
    const name = starLabel(starId);
    const sys = { planets: [], moons: [], belt: false, elements: {} };

    // How many worlds, before anything is placed.
    let count;
    if (rules.weights){ count = sysWeighted(starId, 'count', rules.weights); }
    else if (rules.odds !== undefined && sysRandom(starId, 'any') >= rules.odds){ count = 0; }
    else { count = sysInt(starId, 'count', rules.min, rules.max); }

    // A guaranteed giant needs somewhere beyond the snow line to sit, so the system has to be long
    // enough to reach it; a short one simply does not get its grand giant.
    const wantsGrand = rules.giants === 'grand';

    // Lay the orbits out as a jittered geometric progression from an inner edge set by the star's own habitable zone, then
    // stop at whatever a companion leaves room for.
    let au = Math.max(hz.inner * sysRandom(starId, 'edge', ...starConstants.INNER_EDGE), rules.innerAU || 0.02);
    let grandIndex = wantsGrand && count > 0 ? sysInt(starId, 'grand', Math.max(0, count - 3), count - 1) : -1;
    const ladder = [];
    for (let i = 0; i < count; i++){
        // Tested on the rounded figure the body will actually carry, not on the running one — a
        // rounding of a ten-thousandth is enough to put a world outside a tight pair's limit.
        const dist = +au.toFixed(4);
        if (dist > reach){ break; }
        ladder.push({ au, dist });
        au *= sysRandom(starId, `gap${i}`, ...starConstants.ORBIT_RATIO);
    }

    // Where the belt would go, rolled here rather than after the worlds because the outermost of them fits its moons against
    // it the same way the others fit theirs against the orbit outside.
    const beltAu = star.startype !== 'O' && sysRandom(starId, 'belt') < starConstants.BELT_ODDS
        ? +Math.min(au, reach).toFixed(4) : 0;

    // What the map will shrink this system's bodies down by, so a moon's orbit can be sized against the discs that will
    // really be drawn rather than their nominal ones.
    const drawScale = ladder.length
        ? scaleForClearance(star.size, ladder[0].dist * starConstants.SYS_ORBIT_MIN) : 1;
    const starDrawn = star.size / 10 * drawScale;

    for (let i = 0; i < ladder.length; i++){
        const { au, dist } = ladder[i];
        const id = `${starId}_p${i + 1}`;
        const grand = i === grandIndex;
        // What kind of world this is. Giants form beyond the snow line, where there is ice to gather.
        let giant = false;
        if (grand){ giant = true; }
        else if (rules.giants === 'none'){ giant = false; }
        else if (rules.giants === 'lone'){
            // A red dwarf's one possible giant is the outermost world and nothing else.
            giant = i === count - 1 && sysRandom(starId, `giant${i}`) < (rules.giantOdds || 0);
        }
        else { giant = au > snow && sysRandom(starId, `giant${i}`) < 0.65; }

        const sizeRange = grand ? starConstants.SIZE_GRAND : giant ? starConstants.SIZE_GAS : starConstants.SIZE_ROCKY;
        const size = +sysRandom(starId, `size${i}`, ...sizeRange).toFixed(3);

        // The planet's axial tilt. Its moons ride its equator and its rings sit in the same plane, so this is what keeps the two
        // agreeing instead of leaving a ringed giant with moons crossing its rings at right angles.
        const tilt = +sysRandom(starId, `tilt${i}`, ...starConstants.PLANET_TILT).toFixed(2);

        // No gas/rocky flag on the body: bodyKind already reads that off the size, which is the
        // convention the hand-authored entries follow, and two sources for it would drift apart.
        const body = {
            dist, orbit: keplerPeriod(au, mass), size, star: starId, tilt,
            inc: orbitTilt(starId, `p${i}`, au, snow),
            name: name ? `${name} ${planetLetter(i)}` : '',
        };
        // The habitable-zone marker the map tints worlds by.
        if (!giant && au >= hz.inner && au <= hz.outer){ body.hz = true; }
        starData[id] = body;
        sys.planets.push(id);

        // Moons. A giant runs a system of its own; a rocky world rarely holds more than a capture.
        const moonRange = grand ? starConstants.MOONS_GRAND : giant ? starConstants.MOONS_GAS : starConstants.MOONS_ROCKY;
        let moons = sysInt(starId, `moons${i}`, ...moonRange);
        if (!giant && sysRandom(starId, `hasmoons${i}`) >= starConstants.MOON_ODDS_ROCKY){ moons = 0; }
        // The room the map has to draw a family of moons in: how near this world comes to the star and to the orbits either side
        // of it, at its closest approach to each.
        const inward = i > 0 ? (dist - ladder[i - 1].dist) * starConstants.SYS_ORBIT_MIN / 2 : Infinity;
        const outward = i + 1 < ladder.length ? (ladder[i + 1].dist - dist) * starConstants.SYS_ORBIT_MIN / 2
                      : (beltAu > dist ? (beltAu - dist) * starConstants.SYS_ORBIT_MIN / 2 : Infinity);
        const toStar = dist * starConstants.SYS_ORBIT_MIN - starDrawn;
        const room = Math.min(inward, outward, toStar) * starConstants.MOON_ROOM_FRACTION;

        // Moons run outward from an inner edge, each orbit a jittered multiple of the one inside it, all of it measured in the
        // planet's own radii.
        const pr = planetRadiusAU(size);
        const hill = dist * Math.pow(planetMass(size) / (3 * mass), 1 / 3) * starConstants.HILL_FRACTION;
        const outerR = Math.min(starConstants.MOON_MAX_RADII, hill / pr);
        const planetDrawn = size / 10 * drawScale;
        let mR = Math.min(sysRandom(starId, `moon0${i}`, ...starConstants.MOON_FIRST_RADII), outerR);
        if (mR < starConstants.MOON_MIN_RADII){ moons = 0; }
        else if (moons > 1){
            // However many still fit between that first orbit and the outer limit without landing on top of one another.
            moons = Math.min(moons, 1 + Math.floor(Math.log(outerR / mR) / Math.log(starConstants.MOON_GAP_MIN)));
        }
        let gap = 1;   // unused below a second moon, but never left as a number that could travel
        if (moons > 1){
            // The widest drawn span that still fits the room, taken against the largest moon the roll
            // below can produce so the cap does not depend on rolls not yet made.
            const fat = starConstants.SIZE_MOON[1] / 10 * drawScale;
            const span = Math.max(room / ((planetDrawn + fat) * starConstants.MOON_ORBIT_CLEARANCE), 1);
            gap = Math.min(Math.pow(outerR / mR, 1 / (moons - 1)), Math.pow(span, 1 / (moons - 1)));
            gap = Math.max(Math.min(sysRandom(starId, `moongap${i}`, ...starConstants.MOON_GAP), gap), starConstants.MOON_GAP_MIN);
        }
        let mAu = pr * mR;
        // Dealt into a list first, because how many of them the world keeps is not settled until the
        // exaggerated family has been measured against the room around it.
        const family = [];
        for (let m = 0; m < moons; m++){
            // Rounded once, here, and used for everything after: the spread below is what moonSpread would work out from the stored
            // figure, so it has to be that same figure.
            family.push({
                dist: +mAu.toFixed(9),
                size: +sysRandom(starId, `moonsize${i}_${m}`, ...starConstants.SIZE_MOON).toFixed(3),
            });
            mAu *= gap;
        }

        // How far the family has to be exaggerated to keep every ring clear of the planet's disc and of the rings either side of
        // it, and how far out that puts the outermost.
        let spreadWanted = 1;
        while (family.length){
            spreadWanted = 1;
            for (let m = 0; m < family.length; m++){
                const mDrawn = family[m].size / 10 * drawScale;
                spreadWanted = Math.max(spreadWanted,
                    (planetDrawn + mDrawn) * starConstants.MOON_ORBIT_CLEARANCE / family[m].dist);
                if (m + 1 < family.length){
                    const nDrawn = family[m + 1].size / 10 * drawScale;
                    spreadWanted = Math.max(spreadWanted,
                        (mDrawn + nDrawn) * starConstants.MOON_ORBIT_CLEARANCE / (family[m + 1].dist - family[m].dist));
                }
            }
            if (family[family.length - 1].dist * spreadWanted <= room){ break; }
            family.pop();
        }

        for (let m = 0; m < family.length; m++){
            const mid = `${id}_m${m + 1}`;
            // `star` as well as `parent`: orbitPoint takes the parent branch either way, and the star is what puts the moon in its
            // system's body list so the map draws it at all.
            starData[mid] = {
                dist: family[m].dist,
                orbit: moonPeriod(family[m].dist, size),
                size: family[m].size,
                moon: true, parent: id, star: starId,
                // The planet's equator, give or take — unless this is the rare moon going round the wrong way, which is the same plane
                // approached from the other side.
                inc: moonIncline(starId, i, m, tilt),
                name: body.name ? `${body.name} ${ROMAN[m] || (m + 1)}` : '',
            };
            sys.moons.push(mid);
        }
        if (family.length){ moonSpreadCache[id] = spreadWanted; }
    }

    // One belt, out past the worlds, at the distance rolled for it above.
    if (beltAu > 0 && beltAu <= reach){
        const id = `${starId}_belt`;
        starData[id] = {
            dist: beltAu, orbit: keplerPeriod(beltAu, mass),
            size: +sysRandom(starId, 'beltsize', ...starConstants.SIZE_BELT).toFixed(3),
            star: starId, belt: true,
            // A belt sits out past the worlds, where inclined orbits are the norm — Sol's own is
            // 10 degrees off — so it rolls on the same table everything else does.
            inc: orbitTilt(starId, 'belt', beltAu, snow),
            name: name ? loc('star_belt', [name]) : '',
        };
        sys.belt = id;
    }

    // What the system is made of, as multipliers on a solar baseline. Skewed by a per-star
    // metallicity so a metal-poor system is poor in everything at once rather than at random.
    const metal = sysRandom(starId, 'metallicity', 0.5, 1.6);
    for (const res of starConstants.ELEMENTS){
        sys.elements[res] = +(metal * sysRandom(starId, `el:${res}`, ...starConstants.ELEMENT_SPREAD)).toFixed(3);
    }
    return sys;
}

// The system around a star, dealt on first ask and kept for the session. Returns false for the
// hand-authored systems and for anything that is not a star we generate for.
export function starSystem(starId){
    if (!generatable(starId)){ return false; }
    if (!starInfo.sys[starId]){
        starInfo.sys[starId] = dealSystem(starId);
        starDataChanged();
    }
    return starInfo.sys[starId];
}

// A generated body id names the system it belongs to: `<star>_p3`, `<star>_p3_m1`, `<star>_belt`.
// Reading it back is what lets a body be resolved before its system has been dealt.
function systemOfBody(id){
    const m = /^(.*)_(?:p\d+(?:_m\d+)?|belt)$/.exec(id);
    return m && starData[m[1]] && starData[m[1]].startype ? m[1] : false;
}

// Make sure a body exists before something reads it. Cheap for anything already in the table, which
// is every hand-authored body and every system already dealt.
function ensureBody(id){
    if (starData[id]){ return true; }
    const star = systemOfBody(id);
    if (star){ starSystem(star); }
    return !!starData[id];
}

// Distance between two points in AU. 
export function dist3(a,b){
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

// A body's orbital inclination in degrees.
function orbitIncline(id){
    let body = starData[id];
    if (id === 'spc_home' && kamikazeRun()){ return starConstants.KAMIKAZE_INCLINE; }
    return body.hasOwnProperty('inc') ? body.inc : (texSeed(id) % 600) / 100;
}

const moonSpreadCache = {};
function moonSpread(parent){
    if (moonSpreadCache[parent] === undefined){
        let planet = starData[parent].size / 10;
        let want = 1;   // a planet with no moons, or moons already clear, is left alone
        for (let body of Object.values(starData)){
            if (body.parent !== parent){ continue; }
            want = Math.max(want, (planet + body.size / 10) * starConstants.MOON_ORBIT_CLEARANCE / body.dist);
        }
        moonSpreadCache[parent] = want;
    }
    return moonSpreadCache[parent];
}

// The radius a body's orbit is drawn at, moon exaggeration included.
function orbitRadius(id){
    let body = starData[id];
    return body.parent ? body.dist * moonSpread(body.parent) : orbitDist(id);
}

// Where a body sits at a given angle along its orbit, in AU from the Sun.
export function orbitPoint(planet, deg){
    let body = starData[planet];
    let rad = deg * (Math.PI / 180);
    let inc = orbitIncline(planet) * (Math.PI / 180);
    let u, v, origin;
    if (body.parent){
        // A moon: a circle centred on wherever its planet is right now.
        origin = genXYZcoord(body.parent);
        let r = body.dist * moonSpread(body.parent);
        u = Math.cos(rad) * r;
        // Flipping the sine sends the moon round the other way as its angle advances: same circle,
        // same period, travelled backwards. See orbitDirection.
        v = Math.sin(rad) * r * orbitDirection(planet);
    }
    else if (body.star){
        // Bodies with a `star` (the Tau Ceti system) ride a clean circular orbit centered on that
        // star — no eccentricity or per-orbit x-shift — so the system reads as concentric rings.
        origin = genXYZcoord(body.star);
        u = Math.cos(rad) * body.dist * starConstants.SYS_ORBIT_STRETCH + body.dist * starConstants.SYS_ORBIT_SHIFT;
        v = Math.sin(rad) * body.dist;
    }
    else {
        // A true ellipse with the Sun at a focus.
        origin = { x: 0, y: 0, z: 0 };
        let ecc = orbitEcc(planet);
        let E = eccentricAnomaly(rad, ecc);
        let semi = orbitDist(planet);
        u = semi * (Math.cos(E) - ecc);
        v = semi * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
    }
    // Tilt about the line of nodes (the x axis). The orbit keeps its size and every point on it
    // keeps its distance from the primary; only its height above the reference plane changes.
    return { x: origin.x + u, y: origin.y + v * Math.cos(inc), z: origin.z + v * Math.sin(inc) };
}

// A random point lying between minAU and maxAU from a target, kept near that target's plane.
export function randomCoord(target, minAU, maxAU, spreadAU){
    let origin = typeof target === 'string' ? genXYZcoord(target) : target;
    let min = Math.min(minAU, maxAU);
    let max = Math.max(minAU, maxAU);
    let dist = Math.sqrt(Math.random() * (max * max - min * min) + min * min);
    let bearing = Math.random() * Math.PI * 2;
    let spread = spreadAU === undefined ? dist * starConstants.RANDOM_COORD_SPREAD : Math.abs(spreadAU);
    return {
        x: origin.x + Math.cos(bearing) * dist,
        y: origin.y + Math.sin(bearing) * dist,
        z: origin.z + (Math.random() * 2 - 1) * spread
    };
}

// Per-frame body-position cache used while drawing the map.
var posMemo = false;
export function genXYZcoord(planet){
    if (!posMemo || typeof planet !== 'string'){ return solveXYZcoord(planet); }
    let at = posMemo[planet];
    if (!at){ at = posMemo[planet] = solveXYZcoord(planet); }
    // Return a copy so callers cannot mutate the frame cache.
    return { x: at.x, y: at.y, z: at.z };
}

function solveXYZcoord(planet){
    // Stars first, and by identity rather than by working anything out.
    const fixed = starData[planet];
    if (fixed && fixed.startype){ return { x: fixed.x, y: fixed.y, z: fixed.z }; }

    let temp = tempCoord(planet);
    if (temp){
        let parent = tempParent(temp);
        if (!parent){ return { x: temp.x, y: temp.y, z: temp.z }; }
        let base = genXYZcoord(parent), off = tempOffset(temp, drawAhead);
        return { x: base.x + off.x, y: base.y + off.y, z: base.z + off.z };
    }
    // spc_survey is whichever moon the survey turned up, so it orbits as that body does.
    planet = resolveBody(planet);
    // A generated body may be asked for before its system has been dealt — anything holding an id
    // from a previous session, say. Dealing it here costs nothing once it is done.
    ensureBody(planet);
    // Invalid location. Fall back to the origin rather than throwing, which would take
    // the map and the tick loop down with it.
    if (!starData[planet]){ return { x: 0, y: 0, z: 0 }; }
    // Stars have fixed coordinates and are not positioned by distance/angle from the Sun.
    if (starData[planet].startype){
        return { x: starData[planet].x, y: starData[planet].y, z: starData[planet].z };
    }
    return orbitPoint(planet, orbitAngle(planet));
}

// The star nearest a point.
export function nearestStar(pt){
    let best = 'spc_sun';
    let bestDist = Infinity;
    for (const id of starIndex()){
        const body = starData[id];
        const dx = pt.x - body.x, dy = pt.y - body.y, dz = pt.z - body.z;
        const d = dx*dx + dy*dy + dz*dz;
        if (d < bestDist){ bestDist = d; best = id; }
    }
    return best;
}

// --- Orbital shape ------------------------------------------------------------------------------
// Heliocentric orbits are real ellipses with the Sun at a focus, built from each body's own eccentricity (the `ecc` field). 

// Whether the world this run started on carries a given planet trait. Guarded because the wiki
// imports this module and renders map pieces without a city to read the traits off.
function homeTrait(trait){
    return global.city && global.city.ptrait ? global.city.ptrait.includes(trait) : false;
}

export function orbitEcc(id){
    let body = starData[id];
    // Stars are placed by fixed coordinates, not by an orbit.
    if (!body || body.orbit === -2){ return 0; }
    if (id === 'spc_home' && homeTrait('elliptical')){ return starConstants.ELLIPTICAL_TRAIT_ECC; }
    return body.hasOwnProperty('ecc') ? body.ecc : 0;
}

// Which way round a body travels: 1 the usual way, -1 backwards.
function orbitDirection(id){
    return id === 'spc_moon' && homeTrait('retrograde') ? -1 : 1;
}

// How long a body takes to come round, in days.
export function orbitPeriod(id){
    let body = starData[id];
    if (!body){ return 0; }
    let orbit = body.orbit === -1 ? orbitLength() : body.orbit;
    if (id === 'spc_moon' && homeTrait('dense')){ orbit /= 2; }
    return orbit;
}

// The Kamikaze Home World
function kamikazeRun(){
    return global.race['truepath'] && homeTrait('kamikaze') ? true : false;
}

// Set Kamakaze data
export function kamikazeOrbit(){
    if (!kamikazeRun()){ return 0; }
    if (!global.city.calendar['kamikaze']){
        global.city.calendar['kamikaze'] = orbitLength();
    }
    return global.city.calendar.kamikaze;
}

// The radius a body's orbit is drawn at, in AU. Only a falling home world is ever anything other than its table distance.
export function orbitDist(id){
    let body = starData[id];
    if (!body){ return 0; }
    if (id !== 'spc_home' || !kamikazeRun()){ return body.dist; }
    let start = kamikazeOrbit();
    if (!(start > 0)){ return body.dist; }
    let now = Math.min(Math.max(orbitLength(), starConstants.KAMIKAZE_FLOOR_ORBIT), start);
    let floor = starConstants.KAMIKAZE_MIN_PERIHELION / Math.max(1 - orbitEcc(id), 0.01);
    return Math.max(body.dist * (now / start), floor);
}

// Solve Kepler's equation, M = E - e·sin(E), for the eccentric anomaly.
function eccentricAnomaly(M, ecc){
    if (!(ecc > 0)){ return M; }
    // M near pi is where the plain guess converges slowest, so start from pi for the eccentric
    // orbits where it matters.
    let E = ecc < 0.8 ? M : Math.PI;
    for (let i = 0; i < starConstants.KEPLER_STEPS; i++){
        let d = (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
        E -= d;
        if (Math.abs(d) < starConstants.KEPLER_TOL){ break; }
    }
    return E;
}

var mapScale, mapShift;
// starData key of the star the pointer is resting on, or false.
var mapHover = false;
// Where the pointer was when it picked that star, in canvas-local pixels — the same frame mapShift is
// in. The hover name is placed off this rather than off the star, so it clears the cursor.
var mapHoverAt = { x: 0, y: 0 };

// Solar Map Camera
var mapYaw = 0, mapPitch = 0;
function mapDefaultYaw(target){
    return target === 'spc_sun' ? starConstants.SOL_DEFAULT_YAW : 0;
}
// What the map draws, as opposed to where it is looking.
function mapView(){
    return global.settings.mapView;
}
// The world point at the centre of the viewport (see recenterOn/refocus in buildSolarMap). Also what
// distant-star culling measures from.
var mapFocus = { x: 0, y: 0, z: 0 };
// Whether the map should be locked onto a star when zooming. Set when clicking a star, reset when panning away.
// Zooming with scroll follows cursor when unlocked, and center of screen (where the locked star is) when locked.
var starLockOn = false;
// Whether the map's settings panel is showing.
var mapSettingsOpen = false;
// Whether the map's star search is showing, and what was last typed into it.
var mapSearchOpen = false;
var mapSearchQuery = '';
// Redraw only once per displayed frame 
var mapDrawPending = false;
function requestDraw(){
    if (mapDrawPending){ return; }
    mapDrawPending = true;
    requestAnimationFrame(function(){ mapDrawPending = false; drawMap(); });
}
// True while the camera is being turned.
var mapCameraMoving = false;
// Every body drawn big enough to make out, recorded in screen pixels as drawMap lays it down: { id, x, y, r }.
var mapPickable = [];
// The radius, in AU, each star was last drawn at — recorded for the same reason and skimmed off the same figure.
var starDrawnAt = {};
// Which bodies drawMap actually put a name on this frame, as a set of ids.
var mapLabelled = {};

// Read defensively and snapped to the step: the settings block in vars.js has not necessarily run on
// a save from before this setting existed, and a hand-edited save could hold anything.
function starRange(){
    const raw = mapView().starRange;
    // The sentinel, or nothing usable at all — a save from before this setting existed, or a zero
    // that would otherwise mean "hide everything". Both fall back to the default, which is no limit.
    if (raw === starConstants.STAR_RANGE_INF || !raw){ return starConstants.STAR_RANGE_INF; }
    let ly = Math.round(raw / starConstants.STAR_RANGE_STEP) * starConstants.STAR_RANGE_STEP;
    return Math.min(starConstants.STAR_RANGE_MAX, Math.max(starConstants.STAR_RANGE_MIN, ly));
}
// Where the two flags currently sit in that cycle. A save from before this button existed has any
// combination of them, and all four are positions on the cycle, so nothing needs migrating.
function orbitStateIndex(){
    const p = !!mapView().planetOrbits, m = !!mapView().moonOrbits;
    return starConstants.ORBIT_STATES.findIndex(s => s.planets === p && s.moons === m);
}
function orbitLabel(){
    return loc(starConstants.ORBIT_STATES[orbitStateIndex()].key);
}
function cycleOrbits(){
    const next = starConstants.ORBIT_STATES[(orbitStateIndex() + 1) % starConstants.ORBIT_STATES.length];
    mapView().planetOrbits = next.planets;
    mapView().moonOrbits = next.moons;
}

// Read defensively. starNames is newer than planetNames, so a save that predates it has no such key
// — and the map has always drawn star names, which is what its absence has to mean.
function namesShown(){
    const v = mapView();
    return { planets: !!v.planetNames, stars: v.starNames === undefined ? true : !!v.starNames };
}
// Total rather than a lookup: the button only ever sets the three combinations above, but a save can
// hold the fourth, and star names off is what decides the position whatever the planet flag says.
function nameStateIndex(){
    const n = namesShown();
    return !n.stars ? 2 : n.planets ? 0 : 1;
}
function nameLabel(){
    return loc(starConstants.NAME_STATES[nameStateIndex()].key);
}
function cycleNames(){
    const next = starConstants.NAME_STATES[(nameStateIndex() + 1) % starConstants.NAME_STATES.length];
    mapView().planetNames = next.planets;
    mapView().starNames = next.stars;
}
// Whether a star is going unnamed on the map — the zoom has shrunk the labels away, or the player has turned them off.
function starLabelsOff(){
    return starNamesHidden() || !namesShown().stars;
}

// Which loop drives the map. Read defensively, as starRange is: the vars.js block has not necessarily run on an older
// save, and anything unrecognised means the setting it has always had.
function mapRefreshRate(){
    const r = mapView().refresh;
    return r === 'fast' || r === 'slow' ? r : 'normal';
}
function mapRefreshLabel(){
    return loc(`solar_map_refresh_${mapRefreshRate()}`);
}
// Surface detail, read the same defensive way: anything unrecognised is the flat textures the map
// has always drawn.
function mapTextureDetail(){
    return mapView().texture === 'high' ? 'high' : 'low';
}
function mapTextureLabel(){
    return loc(`solar_map_texture_${mapTextureDetail()}`);
}
// What the button reads, which is a distance for every setting but the last one.
function starRangeLabel(){
    return starRange() === starConstants.STAR_RANGE_INF ? loc('solar_map_star_range_all')
                                          : loc('solar_map_star_range', [starRange()]);
}
// The star the range is measured from.
var mapAnchor = { x: 0, y: 0, z: 0 };
// The table, indexed the ways the draw actually uses it.
var mapStarIds = [], mapDrawnAsStar = [], mapBodiesOf = {};
// Cached ids for bodies drawn in the Sun's reference frame.
var mapHomeIds = [], mapHomeOrbitIds = [];
// The table only changes when a system is dealt or the cow moves, which is rare, but the index used to be rebuilt on
// every frame regardless.
let indexedVersion = -1;
function indexBodies(){
    if (indexedVersion === starDataVersion && mapStarIds.length){ return; }
    indexedVersion = starDataVersion;
    mapStarIds = [];
    mapDrawnAsStar = [];
    mapBodiesOf = {};
    mapHomeIds = [];
    mapHomeOrbitIds = [];
    // for-in over the plain object, rather than Object.entries, so nothing is allocated to walk it.
    for (const id in starData){
        const b = starData[id];
        if (b.startype){ mapStarIds.push(id); }
        if (b.startype || b.bodystar){ mapDrawnAsStar.push(id); }
        if (b.star){ (mapBodiesOf[b.star] || (mapBodiesOf[b.star] = [])).push(id); }
        else {
            mapHomeIds.push(id);
            // Only Sun-orbiting bodies define the home-system bounds.
            if (!b.startype && !b.moon){ mapHomeOrbitIds.push(id); }
        }
    }
}
// The index is built by drawMap, which always runs before any pointer or camera event can fire.
function starIndex(){
    if (!mapStarIds.length){ indexBodies(); }
    return mapStarIds;
}
function drawnAsStarIndex(){
    if (!mapDrawnAsStar.length){ indexBodies(); }
    return mapDrawnAsStar;
}
// A true distance through space, which needs mapFocus to be at the right depth — see refocus().
function starCulled(pos, range = starRange()){
    if (range !== starConstants.STAR_RANGE_INF && dist3(pos, mapAnchor) > range * starConstants.AU_PER_LY){ return true; }
    return mapScale >= starConstants.planetLabelMinScale && dist3(pos, mapFocus) > starConstants.STAR_CULL_AU;
}
// The color the map paints a star of a given class. Shared by the discs drawn in the scene and by the backdrop sky,
// which has to agree with them — a star should be the same color whichever of the two is showing it.
function starTint(type){
    switch (type){
        case 'O':    return '5a86ff';   // Blue — the hottest there is
        case 'B':    return '8fb8ff';   // Blue-white
        case 'A':    return 'ffffff';   // White
        case 'F':    return 'fdffb8';   // Yellow-White
        case 'G':    return 'f8ff2b';   // Yellow dwarf
        case 'K':    return 'ff802b';   // Orange dwarf
        case 'KIII': return 'ff5a28';   // Red giant — cooler than a K dwarf, so redder, but nowhere near an M
        case 'M':    return 'ff1414';   // Red dwarf
        case 'T':    return '9420b1';   // Brown dwarf
        case 'D':    return 'e4e4e4';   // White dwarf
        default:     return 'f8ff2b';
    }
}

// The Backdrop Sky

// How bright a star of this size and class looks from `ly` light years away, relative to the Sun seen from one light
// year.
function skyFlux(star, ly){
    const R = Math.pow((star.size || 1) / 2, 2);
    const T = starConstants.STAR_TEMP[star.startype] || starConstants.SUN_TEMP;
    const L = R * R * Math.pow(T / starConstants.SUN_TEMP, 4);
    return L / Math.max(ly * ly, 1e-6);
}

// Zoomed out this far the star names would be too small to read, which is the point at which naming whatever
// the pointer is over stops being redundant and starts being the only way to tell what you are seeing.
function starNamesHidden(){
    return mapScale < starConstants.systemLabelAbsMinScale;
}
// Whether what holds the home world's orbit is a debris field rather than a planet.
function homeDebris(id){
    if (id !== 'spc_home'){ return false; }
    if (!global.race['orbit_decayed'] && !global.race['tidal_decay']){ return false; }
    return !global.tech['resettle'] || global.tech.resettle < 8;
}

// The name to show for a home-system body, or false if it has none.
function bodyName(id){
    let planet = starData[id];
    if (!planet || planet.startype){ return false; }
    // A generated world carries the scientific name it was dealt; a moon carries its planet's.
    if (planet.name){ return planet.name; }
    // Tau Ceti's bodies are named by their own action definitions, handled where they are drawn.
    if (planet.star){ return false; }
    if (homeDebris(id)){ return loc('space_home_debris',[races[global.race.species].home]); }
    if (actions.space[id] && actions.space[id].info){
        let nameRef = actions.space[id].info.name;
        return typeof nameRef === 'function' ? nameRef() : nameRef;
    }
    return starConstants.SOL_BODY_LABEL[id] ? planetName()[starConstants.SOL_BODY_LABEL[id]] : false;
}

// The name to float beside the cursor for whatever it is resting on, or false for nothing to say.
function hoverName(id){
    let body = starData[id];
    if (!body){ return false; }
    if (body.startype){ return starLabelsOff() ? (body.zlabel || body.label) : false; }
    return mapView().planetNames && !mapLabelled[id] ? bodyName(id) : false;
}

let camCY = 1, camSY = 0, camCP = 1, camSP = 0;
function camUpdate(){
    camCY = Math.cos(mapYaw); camSY = Math.sin(mapYaw);
    camCP = Math.cos(mapPitch); camSP = Math.sin(mapPitch);
}
// Fold an angle back into (-pi, pi] so a long drag can't wind the camera up indefinitely.
function wrapAngle(a){
    a = (a + Math.PI) % (Math.PI * 2);
    return (a < 0 ? a + Math.PI * 2 : a) - Math.PI;
}
function pX(p){ return p.x * camCY - p.y * camSY; }
function pY(p){ return (p.x * camSY + p.y * camCY) * camCP - (p.z) * camSP; }
// Depth for painter's-algorithm ordering. This axis completes a right-handed frame with screen-right and screen-down,
// and the canvas y axis points down, so it runs INTO the screen: larger = further away.
function pD(p){ return (p.x * camSY + p.y * camCY) * camSP + (p.z) * camCP; }
// A world point expressed relative to a frame origin, ready to project.
export function rel(p, o){ return { x: p.x - o.x, y: p.y - o.y, z: (p.z) - (o.z) }; }

// 0 at the trough of the swell, 1 at its peak. A cosine so the pulse has no corners in it.
function beaconPulse(){
    return (1 - Math.cos(Date.now() / starConstants.BEACON_PULSE_MS * Math.PI * 2)) / 2;
}
// Signals still waiting on an answer. A beacon a ship has reached keeps its coordinates — a ship
// parked on one still has to resolve — but stops advertising itself, so it stops pulsing as well.
function liveBeacons(){
    let temps = global.race['tempCoordinates'];
    if (!temps){ return []; }
    return Object.keys(temps).filter(k => temps[k] && temps[k].a).map(k => temps[k]);
}

// How close an orbit comes to its primary, sampled from the same orbitPoint the body travels so the
// eccentricity and off-centre focus are taken into account rather than assumed.
function orbitMinRadius(id, origin){
    let min = Infinity;
    for (let i = 0; i < 24; i++){
        let q = rel(orbitPoint(id, i * 15), origin);
        min = Math.min(min, Math.hypot(q.x, q.y, q.z));
    }
    return min;
}

function visibleRadius(r, offsetPx){
    return offsetPx >= starConstants.BODY_SEPARATION_PX ? Math.max(r, 1 / mapScale) : r;
}
// The factor a system's bodies are drawn down by, given how close anything orbiting the star comes to it.
function scaleForClearance(starSize, clear){
    let want = starSize / 10;
    if (!(clear > 0) || clear === Infinity || want <= clear * starConstants.STAR_ORBIT_CLEARANCE){ return 1; }
    return clear * starConstants.STAR_ORBIT_CLEARANCE / want;
}
function systemScale(starSize, ids, origin){
    let want = starSize / 10;
    if (want <= 1 / mapScale){ return 1; }     // zoomed out: orbits are sub-pixel, nothing to clear
    let clear = Infinity;
    for (let id of ids){
        // Only what goes round the star itself. A moon is held by its planet, and its ring is centred on a body that moves, so
        // Measure clearance against the primary to avoid pulsing stellar radii.
        if (starData[id].parent){ continue; }
        clear = Math.min(clear, orbitMinRadius(id, origin));
    }
    return scaleForClearance(starSize, clear);
}

function strokeOrbit(ctx, id, origin){
    ctx.beginPath();
    for (let i = 0; i <= starConstants.ORBIT_STEPS; i++){
        let q = rel(orbitPoint(id, i * 360 / starConstants.ORBIT_STEPS), origin);
        let sx = pX(q), sy = pY(q);
        if (i === 0){ ctx.moveTo(sx, sy); } else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
}

// One side of an orbit: the arc that passes in front of the body it circles, or the arc behind it.
function strokeOrbitSide(ctx, id, origin, primary, near){
    let step = 360 / starConstants.ORBIT_STEPS;
    // Sampled once and reused. orbitPoint on a moon resolves its planet's position too, so this is
    // the costly part of tracing a ring and it should not be repeated per lookup.
    let pts = [], on = [];
    for (let i = 0; i <= starConstants.ORBIT_STEPS; i++){
        let p = orbitPoint(id, i * step);
        pts.push(p);
        on.push((pD(rel(p, primary)) < 0) === near);
    }
    let crossing = (a, b, sideA) => {
        for (let i = 0; i < starConstants.ORBIT_CROSS_STEPS; i++){
            let m = (a + b) / 2;
            if (((pD(rel(orbitPoint(id, m), primary)) < 0) === near) === sideA){ a = m; } else { b = m; }
        }
        return orbitPoint(id, (a + b) / 2);
    };
    let plot = (p, move) => {
        let q = rel(p, origin);
        if (move){ ctx.moveTo(pX(q), pY(q)); } else { ctx.lineTo(pX(q), pY(q)); }
    };
    let drawing = false;
    ctx.beginPath();
    for (let i = 0; i <= starConstants.ORBIT_STEPS; i++){
        if (on[i]){
            if (!drawing){
                plot(i > 0 ? crossing((i - 1) * step, i * step, on[i - 1]) : pts[i], true);
                drawing = true;
                if (i > 0){ plot(pts[i], false); }
            }
            else { plot(pts[i], false); }
        }
        else if (drawing){
            plot(crossing((i - 1) * step, i * step, on[i - 1]), false);
            drawing = false;
        }
    }
    ctx.stroke();
}

// One side of every orbit sharing a primary, in the map's orbit style.
function strokeOrbitGroup(ctx, ids, origin, primary, near){
    if (!ids || !ids.length){ return; }
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 1 / mapScale;
    for (let id of ids){
        let planet = starData[id];
        ctx.setLineDash(planet.belt || homeDebris(id) ? [0.01, 0.01] : []);
        strokeOrbitSide(ctx, id, origin, primary, near);
    }
    ctx.setLineDash([]);
}

// --- Solar map body textures --------------------------------------------------------------------
const bodyTexCache = {};

// Deterministic per-body PRNG (mulberry32), so a planet's surface is identical on every redraw but
// differs from its neighbours'.
function texRand(seed){
    let a = seed >>> 0;
    return function(){
        a = (a + 0x6D2B79F5) >>> 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// FNV-1a over the body id, so each body gets a stable seed without storing one in the table.
function texSeed(str){
    let h = 2166136261;
    for (let i=0; i<str.length; i++){
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function hexRGBA(hex, a){
    let n = parseInt(hex, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// The arithmetic behind both of the shade helpers, unrounded, for callers that want to go on and
// blend between two shades rather than take one straight to a string.
function shadeRGB(hex, f){
    let n = parseInt(hex, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f >= 1){
        let t = f - 1;
        r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t;
    }
    else {
        r *= f; g *= f; b *= f;
    }
    return [r, g, b];
}
function rgba(c, a){ return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`; }

// As hexShade, but keeps an alpha channel — for things drawn over the body they belong to.
function hexShadeRGBA(hex, f, a){
    return rgba(shadeRGB(hex, f), a);
}

// f > 1 lightens toward white, f < 1 darkens. Lightening a near-white star just leaves it white.
function hexShade(hex, f){
    let c = shadeRGB(hex, f);
    return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
}

// The biome the home world is currently wearing, or false. Guarded because the wiki imports this
// module and draws map pieces with no city to read a biome off.
function homeBiome(){
    let biome = global.city && global.city.biome ? global.city.biome : false;
    return biome && starConstants.BIOME_LOOK[biome] ? biome : false;
}

// A Sol body's color, with the home world answering for its biome first.
function solBodyColor(id){
    if (id === 'spc_home'){
        let biome = homeBiome();
        if (biome){ return starConstants.BIOME_LOOK[biome].color; }
    }
    return starConstants.SOL_BODY_COLOR[id];
}


// Whether a body is drawn with an irregular outline rather than as a disc.
function bodyLumpy(planet, id){
    return !!planet.lumpy || (!!planet.belt && !planet.gate);
}

// Which surface a body gets. Nothing in the table marks gas giants, but the big non-moon bodies are
// exactly the gas giants (Jupiter/Saturn/Tau Ceti's gas worlds and the large outer-system planets).
function bodyKind(planet, id){
    if (id === 'spc_home'){
        let biome = homeBiome();
        if (biome){ return starConstants.BIOME_LOOK[biome].style; }
    }
    if (id && starConstants.SOL_BODY_STYLE[id]){ return starConstants.SOL_BODY_STYLE[id]; }
    if (planet.belt){ return 'belt'; }
    // Sizes are real radii on a square-root scale, so this is where the gas and ice giants start:
    // Neptune lands on 0.376 and the largest terrestrials well below it.
    if (planet.size >= 0.35 && !planet.moon){ return 'gas'; }
    return 'rock';
}

// Camera-Aware Surfaces

// Noise is evaluated on the 3D normal rather than on (latitude, longitude), so there is no seam down
// the date line and no crowding at the poles — the two things that give a wrapped 2D texture away.
function sphHash(cx, cy, cz, s){
    let n = (cx|0)*374761393 + (cy|0)*668265263 + (cz|0)*1442695040 + (s|0)*1013904223;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n ^ (n >>> 16)) >>> 0;
}
function sphNoise(x, y, z, s){
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x-xi, yf = y-yi, zf = z-zi;
    const u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf), w = zf*zf*(3-2*zf);
    const H = (i,j,k) => sphHash(i,j,k,s) / 4294967296;
    const c = (a,b,t) => a + (b-a)*t;
    return c(c(c(H(xi,yi,zi),   H(xi+1,yi,zi),   u), c(H(xi,yi+1,zi),   H(xi+1,yi+1,zi),   u), v),
             c(c(H(xi,yi,zi+1), H(xi+1,yi,zi+1), u), c(H(xi,yi+1,zi+1), H(xi+1,yi+1,zi+1), u), v), w);
}
function sphFbm(x, y, z, oct, s){
    let a = 0, amp = 1, tot = 0, f = 1;
    for (let i = 0; i < oct; i++){ a += sphNoise(x*f, y*f, z*f, s+i) * amp; tot += amp; amp *= 0.5; f *= 2.03; }
    return a / tot;
}
// Distance to the nearest of a scattered field of points: craters come off f1, fracture lines off the gap between the
// nearest two.
function sphWorley(x, y, z, s){
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let f1 = 99, f2 = 99;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++){
        const cx = xi+i, cy = yi+j, cz = zi+k;
        const n = sphHash(cx, cy, cz, s);
        const dx = x - (cx + (n & 1023)/1024);
        const dy = y - (cy + ((n >>> 10) & 1023)/1024);
        const dz = z - (cz + ((n >>> 20) & 1023)/1024);
        const d = dx*dx + dy*dy + dz*dz;
        if (d < f1){ f2 = f1; f1 = d; } else if (d < f2){ f2 = d; }
    }
    return { f1: Math.sqrt(f1), f2: Math.sqrt(f2) };
}
const sphMix = (a, b, t) => a + (b - a) * t;
function sphereBandcolor(bands, lat){
    for (let i = 1; i < bands.length; i++){
        if (lat <= bands[i][0]){
            const a = bands[i-1], b = bands[i];
            const t = (lat - a[0]) / (b[0] - a[0]), s = t*t*(3-2*t);
            return [sphMix(a[1],b[1],s), sphMix(a[2],b[2],s), sphMix(a[3],b[3],s)];
        }
    }
    const l = bands[bands.length-1];
    return [l[1], l[2], l[3]];
}

// Game days the map has been running, for axial rotation only.
var mapDays = 0;
// Advanced from the map's own simulation step in main.js, so rotation keeps pace with everything
// else on the map however often that step runs.
export function advanceMapDays(days){ mapDays += days; }

// A body with no entry gets a tilt and a period off its own id, so a system full of anonymous rocks
// does not turn in lockstep.
function spinOf(id){
    const known = starConstants.SPIN_DATA[id];
    if (known){ return known; }
    const h = texSeed(id || 'x');
    return { tilt: (h % 2600) / 100, hours: 8 + ((h >>> 8) % 4000) / 100 };
}

const sphereCache = new Map();

// Whether a camera-aware surface should be used for this body right now, and at what size.
function sphereSize(kind, r, minPx, steady){
    if (!starConstants.SPHERE_STYLES[kind]){ return 0; }
    if (mapView().texture !== 'high'){ return 0; }
    const px = r * mapScale;
    if (px < (minPx || starConstants.SPHERE_MIN_PX)){ return 0; }
    const drop = mapCameraMoving && !steady;
    for (let i = 0; i < starConstants.SPHERE_SIZES.length; i++){
        if (px * 2 <= starConstants.SPHERE_SIZES[i]){
            // One size down while the camera is turning. A moving disc does not hold still long
            // enough to read the difference, and this is a quarter of the pixels.
            return drop && i > 0 ? starConstants.SPHERE_SIZES[i-1] : starConstants.SPHERE_SIZES[i];
        }
    }
    const last = starConstants.SPHERE_SIZES.length - 1;
    return drop && last > 0 ? starConstants.SPHERE_SIZES[last-1] : starConstants.SPHERE_SIZES[last];
}
// How finely the camera angle is quantised before it keys the cache.
function sphereAngleStep(){
    return mapCameraMoving ? starConstants.SPHERE_ANGLE_STEP * 3 : starConstants.SPHERE_ANGLE_STEP;
}

// `lumpy` says the subject is not round, and is passed rather than looked up: this renders what it is told to, and a
// body's own entry in the table is the caller's business.
function sphereTexture(kind, S, id, sun, lumpy, opts){
    opts = opts || {};
    const cache = opts.cache || sphereCache;
    const spin = spinOf(id);
    // A still subject is rendered facing one way and left there.
    const turn = !opts.still && spin.hours ? ((mapDays + drawAhead) * 24 / spin.hours) * 360 * starConstants.SPIN_SCALE : 0;
    const step = opts.step || sphereAngleStep();
    const qy = Math.round(mapYaw / step), qp = Math.round(mapPitch / step);
    const qs = Math.round((((turn % 360) + 360) % 360) / starConstants.SPHERE_SPIN_STEP);
    const seed = texSeed(id || kind);
    // The light, in camera space. Quantised into the key like everything else: a body creeping along
    // its orbit changes it slowly, and a fraction of a degree is not worth a re-render.
    let Lx = -0.5/1.0106, Ly = -0.5/1.0106, Lz = -0.72/1.0106, lk = 'flat';
    if (sun){
        Lx = pX(sun); Ly = pY(sun); Lz = pD(sun);
        if (opts.roll){
            // The caller is going to turn this image by `roll` on the way down, which would carry the lit side round with it.
            const c = Math.cos(opts.roll), s = Math.sin(opts.roll);
            const rx = Lx*c + Ly*s, ry = -Lx*s + Ly*c;
            Lx = rx; Ly = ry;
        }
        if (opts.lightAz){
            // Bucketed by where the light lies on the screen — round it, and across it.
            const m0 = Math.hypot(Lx, Ly, Lz) || 1;
            const el = Math.round(Math.asin(Math.max(-1, Math.min(1, Lz/m0))) / (Math.PI/2) * opts.lightEl);
            // Folded back into 0..az-1, or the two halves of the wrap would be two keys for one
            // direction and the same render would be built twice.
            const raw = Math.round(Math.atan2(Ly, Lx) / (Math.PI*2) * opts.lightAz);
            const az = ((raw % opts.lightAz) + opts.lightAz) % opts.lightAz;
            lk = `${az}/${el}`;
            const ea = el / opts.lightEl * (Math.PI/2), aa = az / opts.lightAz * (Math.PI*2);
            Lx = Math.cos(ea)*Math.cos(aa); Ly = Math.cos(ea)*Math.sin(aa); Lz = Math.sin(ea);
        }
        else {
            lk = `${Math.round(Lx*24)},${Math.round(Ly*24)},${Math.round(Lz*24)}`;
            // Snapped back to the quantised direction, so the render matches the key exactly.
            const m = Math.hypot(Math.round(Lx*24), Math.round(Ly*24), Math.round(Lz*24)) || 1;
            Lx = Math.round(Lx*24)/m; Ly = Math.round(Ly*24)/m; Lz = Math.round(Lz*24)/m;
        }
    }
    const key = `${kind}:${S}:${qy}:${qp}:${qs}:${seed}:${step.toFixed(4)}:${lk}:${lumpy ? 'L' : 'o'}`;
    if (cache.has(key)){ return cache.get(key); }
    // Over the frame's allowance. Ask for another frame — nothing else would come back to finish the job, since the view has
    // stopped changing by the time it matters — and let the caller draw the cheap version of this one meanwhile.
    if (opts.budget){
        if (sphereBudget >= opts.budget){ requestDraw(); return false; }
        sphereBudget++;
    }

    const st = starConstants.SPHERE_STYLES[kind];
    const yaw = qy * step, pitch = qp * step;
    const spinDeg = qs * starConstants.SPHERE_SPIN_STEP;
    // The camera's own basis, straight off pX/pY/pD: screen right, screen down, and into the screen.
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const Xx = cy,    Xy = -sy,   Xz = 0;
    const Yx = sy*cp, Yy = cy*cp, Yz = -sp;
    const Dx = sy*sp, Dy = cy*sp, Dz = cp;
    // The spin axis, leaned out of the reference plane by the obliquity, and two vectors across it to
    // measure longitude from.
    const T = spin.tilt * Math.PI / 180, cT = Math.cos(T), sT = Math.sin(T);
    const Ax = 0, Ay = -sT, Az = cT;
    const E1x = 1, E1y = 0, E1z = 0;
    const E2x = 0, E2y = cT, E2z = sT;
    const rad = spinDeg * Math.PI / 180, cs = Math.cos(-rad), ss = Math.sin(-rad);

    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S);
    const px = img.data;
    const R = S / 2;

    let lut = false;
    if (lumpy){
        // Turned by the quantised yaw rather than the live one, so the outline in the render is the outline the key was written
        // for — the same render is handed back for every yaw in the step.
        const norm = lumpNorm(seed), roll = yaw + spinDeg * Math.PI / 180;
        lut = new Float32Array(starConstants.LUMP_LUT);
        for (let i = 0; i < starConstants.LUMP_LUT; i++){
            lut[i] = norm * lumpFactor(seed, i / starConstants.LUMP_LUT * Math.PI * 2 + roll);
        }
    }
    const TAU = Math.PI * 2;

    for (let iy = 0; iy < S; iy++){
        for (let ix = 0; ix < S; ix++){
            const u = (ix + 0.5 - R) / R, v = (iy + 0.5 - R) / R;
            const q = u*u + v*v;
            const o = (iy*S + ix) * 4;
            // How far the body reaches in this direction: 1 for a sphere, the outline for a rock.
            let Lr = 1;
            if (lut){
                let a = Math.atan2(v, u);
                if (a < 0){ a += TAU; }
                Lr = lut[(a / TAU * starConstants.LUMP_LUT) | 0];
            }
            if (q > Lr*Lr){ continue; }                  // outside the body
            // Height toward the viewer, then everything divided through by the local radius so the
            // surface normal is a unit vector again and every line below is the sphere's own.
            const wRaw = Math.sqrt(Lr*Lr - q);
            const inv = Lr === 1 ? 1 : 1 / Lr;
            const uu = u * inv, vv = v * inv, w = wRaw * inv;
            const nx = uu*Xx + vv*Yx - w*Dx;
            const ny = uu*Xy + vv*Yy - w*Dy;
            const nz = uu*Xz + vv*Yz - w*Dz;
            const dotA = nx*Ax + ny*Ay + nz*Az;
            const lat = Math.asin(dotA < -1 ? -1 : dotA > 1 ? 1 : dotA) * 180 / Math.PI;
            const e1 = nx*E1x + ny*E1y + nz*E1z, e2 = nx*E2x + ny*E2y + nz*E2z;
            // Turned back by the rotation, so surface features stay put on the body while it spins
            // under the camera rather than sliding across it.
            const p1 = e1*cs - e2*ss, p2 = e1*ss + e2*cs;
            const sx = p1*E1x + p2*E2x + dotA*Ax;
            const sy2 = p1*E1y + p2*E2y + dotA*Ay;
            const sz = p1*E1z + p2*E2z + dotA*Az;

            let r, g, b;
            if (st.bands){ const col = sphereBandcolor(st.bands, lat); r = col[0]; g = col[1]; b = col[2]; }
            else { r = st.base[0]; g = st.base[1]; b = st.base[2]; }

            if (st.mottle){
                const amp = st.mottle[0], f = st.mottle[1], oct = st.mottle[2];
                // A banded world gets its noise stretched along latitude, so it runs with the flow.
                const n = st.banded ? sphFbm(sx*f, sy2*f*3.2, sz*f, oct, seed)
                                    : sphFbm(sx*f, sy2*f, sz*f, oct, seed);
                const k = (n - 0.5) * 2 * amp;
                if (k > 0){ r = sphMix(r, st.mottle[3], k); g = sphMix(g, st.mottle[4], k); b = sphMix(b, st.mottle[5], k); }
                else { r *= 1+k*0.7; g *= 1+k*0.7; b *= 1+k*0.7; }
            }
            if (st.land){
                const th = st.land[0], f = st.land[1], oct = st.land[2], sharp = st.land[6];
                const n = sphFbm(sx*f, sy2*f, sz*f, oct, seed+31);
                const k = 1/(1+Math.exp(-(n-th)*sharp*6));
                r = sphMix(r, st.land[3], k); g = sphMix(g, st.land[4], k); b = sphMix(b, st.land[5], k);
            }
            if (st.craters){
                // Amplitude and frequency in pairs, coarsest first..
                for (let ci = 0; ci + 1 < st.craters.length; ci += 2){
                    const amp = st.craters[ci], f = st.craters[ci+1];
                    const cw = sphWorley(sx*f, sy2*f, sz*f, seed + 53 + ci*17);
                    // A dark floor with a bright rim just outside it — what makes a body read as airless.
                    const floor = Math.max(0, 1 - cw.f1*3.2), rim = Math.max(0, 1 - Math.abs(cw.f1-0.34)*7);
                    const k = (rim*0.5 - floor*0.6) * amp;
                    r = Math.max(0, r*(1+k)); g = Math.max(0, g*(1+k)); b = Math.max(0, b*(1+k));
                }
            }
            if (st.cracks){
                const amp = st.cracks[0], f = st.cracks[1];
                const cw = sphWorley(sx*f, sy2*f, sz*f, seed+71);
                const edge = Math.max(0, 1 - (cw.f2-cw.f1)*9);
                r = sphMix(r, st.cracks[2], edge*amp); g = sphMix(g, st.cracks[3], edge*amp); b = sphMix(b, st.cracks[4], edge*amp);
            }
            if (st.poles){
                const k = Math.max(0, (Math.abs(lat)-st.poles[0])/(90-st.poles[0])) * st.poles[1];
                r = sphMix(r, st.poles[2], k); g = sphMix(g, st.poles[3], k); b = sphMix(b, st.poles[4], k);
            }
            if (st.clouds){
                const n = sphFbm(sx*st.clouds[1]+11, sy2*st.clouds[1]+11, sz*st.clouds[1]+11, st.clouds[2], seed+97);
                const k = Math.max(0, (n-0.55)*2.6) * st.clouds[0];
                r = sphMix(r,255,k); g = sphMix(g,255,k); b = sphMix(b,255,k);
            }

            const diff = uu*Lx + vv*Ly + (-w)*Lz;
            // Ambient enough that the unlit limb still reads as the body rather than as a hole.
            const shade = 0.30 + 0.85*(diff > 0 ? diff : 0);
            const limb = 0.55 + 0.45*Math.pow(w, 0.45);
            const k = shade * limb;
            r *= k; g *= k; b *= k;

            if (st.glow){
                // Added after the shading, so vents and lava still show on the night side.
                const n = sphFbm(sx*st.glow[1], sy2*st.glow[1], sz*st.glow[1], 4, seed+131);
                const e = Math.max(0, (n-0.62)*3.4) * st.glow[0];
                r = sphMix(r, st.glow[2], e); g = sphMix(g, st.glow[3], e); b = sphMix(b, st.glow[4], e);
            }
            if (st.spot){
                let dLon = ((Math.atan2(e2, e1) * 180/Math.PI) - spinDeg - st.spot.lon) % 360;
                if (dLon > 180){ dLon -= 360; } else if (dLon < -180){ dLon += 360; }
                const dLat = lat - st.spot.lat;
                const e = (dLon/st.spot.halfLon)*(dLon/st.spot.halfLon) + (dLat/st.spot.halfLat)*(dLat/st.spot.halfLat);
                if (e < 2.1){
                    // A darker collar first: the zone is dragged down around the oval.
                    const cc = Math.max(0, 1 - Math.abs(e - 1.35) / 0.75) * 0.45;
                    r = sphMix(r, 0x9a*k, cc); g = sphMix(g, 0x6a*k, cc); b = sphMix(b, 0x4c*k, cc);
                }
                if (e < 1){
                    const kk = Math.pow(1 - e, 0.4) * 0.9;
                    const core = 1 - 0.28*Math.pow(Math.max(0, 1 - e*2.4), 2);
                    r = sphMix(r, st.spot.r*core*k, kk); g = sphMix(g, st.spot.g*core*k, kk); b = sphMix(b, st.spot.b*core*k, kk);
                }
            }

            px[o]   = r < 0 ? 0 : r > 255 ? 255 : r;
            px[o+1] = g < 0 ? 0 : g > 255 ? 255 : g;
            px[o+2] = b < 0 ? 0 : b > 255 ? 255 : b;
            // Feathered edge, so the outline is not left aliased against the black. Measured from
            // the body's own reach in this direction, which is the disc for everything round.
            const a = 255 * Math.min(1, (Lr - Math.sqrt(q)) * R * 0.9);
            px[o+3] = a < 0 ? 0 : a > 255 ? 255 : a;
        }
    }
    x.putImageData(img, 0, 0);

    // Oldest out first. A drag walks the camera through a run of angles and would otherwise keep
    // every one of them.
    const max = opts.max || starConstants.SPHERE_CACHE_MAX;
    if (cache.size >= max){ cache.delete(cache.keys().next().value); }
    cache.set(key, c);
    return c;
}

// Rock Faces
const rockCache = new Map();
// Fresh sphere renders already paid for this frame, against whatever budget the caller set. Reset by
// drawMap at the top of every frame.
var sphereBudget = 0;

// Which face a rock wears. Off its own index, so it keeps the same one from frame to frame and two
// rocks side by side are unlikely to match.
function rockFace(field, i){
    return sphHash(texSeed(field || 'rock'), i, 0, 3) % starConstants.ROCK_FACES;
}
// A face's identity, which is what everything about it is derived from: its seed, its outline, and the
// key it is cached under. Deliberately not the rock's — that is the whole point.
function rockFaceId(face){
    return `rock#${face}`;
}
// A rock's own identity, which is what it keeps for itself: the rate it turns at.
function rockId(field, i){
    return `${field}#${i}`;
}
// How far round this rock has turned, in radians. The camera's own yaw is left out — the face is
// rendered with it already in — so this is the rock's tumble and nothing else.
function rockRoll(field, i){
    const spin = spinOf(rockId(field, i));
    if (!spin.hours){ return 0; }
    return ((mapDays + drawAhead) * 24 / spin.hours) * 360 * starConstants.SPIN_SCALE * Math.PI / 180;
}
// The rasterised surface for one face, lit so that turning it by `roll` on the way down puts the light back where the
// star is.
function rockTexture(S, face, sun, roll){
    return sphereTexture('belt', S, rockFaceId(face), sun, true, {
        cache: rockCache,
        max: starConstants.ROCK_CACHE_MAX,
        still: true,
        roll: roll,
        step: starConstants.ROCK_ANGLE_STEP,
        lightAz: starConstants.ROCK_LIGHT_AZ,
        lightEl: starConstants.ROCK_LIGHT_EL,
        budget: starConstants.ROCK_TEX_BUDGET
    });
}

function sphereStarSize(r){
    if (mapView().texture !== 'high'){ return 0; }
    // The image is drawn at 4r across, of which the disc is the middle 2r. Below the flat texture's
    // own 256 there is nothing to gain -- it is not being scaled up yet.
    const want = r * mapScale * 4;
    if (want <= starConstants.STAR_TEX){ return 0; }
    for (const s of starConstants.SPHERE_STAR_SIZES){ if (want <= s){ return s; } }
    return starConstants.SPHERE_STAR_SIZES[starConstants.SPHERE_STAR_SIZES.length - 1];
}
// A star's disc and corona, kept in their own cache rather than the shared sphere one.
const starSphereCache = new Map();
function sphereStarTexture(color, S){
    const key = `star:${color}:${S}`;
    if (starSphereCache.has(key)){ return starSphereCache.get(key); }

    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const R = S / 2, disc = R * starConstants.STAR_CORE;

    // Corona first, so the disc paints over its inner edge and leaves no hairline.
    const r0 = disc * 0.97;
    const cor = x.createRadialGradient(R, R, r0, R, R, R);
    const at = t => (disc + t * (R - disc) - r0) / (R - r0);
    const knee = starConstants.CORONA_KNEE, kneeA = starConstants.CORONA_KNEE_ALPHA;
    cor.addColorStop(0, hexRGBA(color, starConstants.CORONA_LIMB_ALPHA));
    cor.addColorStop(at(knee), hexRGBA(color, kneeA));
    for (let i = 1; i <= starConstants.CORONA_STEPS; i++){
        const t = knee + (1 - knee) * (i / starConstants.CORONA_STEPS);
        const a = kneeA * Math.pow(1 - (t - knee) / (1 - knee), starConstants.CORONA_FALL);
        cor.addColorStop(Math.min(1, at(t)), hexRGBA(color, a));
    }
    x.fillStyle = cor;
    x.fillRect(0, 0, S, S);

    // The disc, on the same STAR_STOPS the flat texture is built from. Both the stop table and a
    // gradient interpolate linearly, so this is the curve itself and not an approximation of it.
    const body = x.createRadialGradient(R, R, 0, R, R, disc);
    for (const [at_, f] of starConstants.STAR_STOPS){ body.addColorStop(at_, hexShade(color, f)); }
    x.fillStyle = body;
    x.beginPath();
    x.arc(R, R, disc, 0, Math.PI * 2);
    x.fill();

    starSphereCache.set(key, c);
    return c;
}

// Color-free overlay for a planet, moon or belt body: surface detail, then the light and shade that turn a flat disc
// into a lit ball.
function texBlobs(x, rnd, S, count, minR, maxR, darkBias, strength){
    for (let i = 0; i < count; i++){
        let bx = rnd() * S, by = rnd() * S;
        let br = S * (minR + rnd() * (maxR - minR));
        let g = x.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rnd() < darkBias
            ? `rgba(0,0,0,${(strength * (0.5 + rnd())).toFixed(3)})`
            : `rgba(255,255,255,${(strength * 0.6 * (0.5 + rnd())).toFixed(3)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.beginPath();
        x.arc(bx, by, br, 0, Math.PI * 2);
        x.fill();
    }
}

// Horizontal cloud belts. `contrast` sets how hard the banding reads — Jupiter is stark, Uranus is
// almost smooth — and bands are drawn as soft-edged strips so they blend rather than stripe.
function texBands(x, rnd, S, contrast, minH, maxH){
    for (let y = 0; y < S; ){
        let h = S * (minH + rnd() * (maxH - minH));
        let dark = rnd() < 0.5;
        let a = contrast * (0.4 + rnd() * 0.6);
        let g = x.createLinearGradient(0, y, 0, y + h);
        let col = dark ? '0,0,0' : '255,255,255';
        g.addColorStop(0, `rgba(${col},0)`);
        g.addColorStop(0.5, `rgba(${col},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = g;
        x.fillRect(0, y, S, h);
        y += h;
    }
}

// Impact craters: a dark floor, a bright rim catching the light from the upper left, and a shadow
// opposite it. What makes a body read as airless rather than merely rough.
function texCraters(x, rnd, S, count){
    for (let i = 0; i < count; i++){
        let cx = rnd() * S, cy = rnd() * S;
        let cr = S * (0.02 + rnd() * 0.075);
        x.beginPath();
        x.arc(cx, cy, cr, 0, Math.PI * 2);
        x.fillStyle = `rgba(0,0,0,${(0.10 + rnd() * 0.14).toFixed(3)})`;
        x.fill();
        x.beginPath();
        x.arc(cx - cr * 0.12, cy - cr * 0.12, cr, Math.PI * 0.9, Math.PI * 1.9);
        x.strokeStyle = `rgba(255,255,255,${(0.12 + rnd() * 0.16).toFixed(3)})`;
        x.lineWidth = Math.max(1, cr * 0.22);
        x.stroke();
        x.beginPath();
        x.arc(cx, cy, cr * 0.92, Math.PI * 1.9, Math.PI * 2.9);
        x.strokeStyle = `rgba(0,0,0,${(0.10 + rnd() * 0.12).toFixed(3)})`;
        x.lineWidth = Math.max(1, cr * 0.2);
        x.stroke();
    }
}

// Bright polar caps, sized as a fraction of the disc.
function texPoles(x, S, size, alpha){
    for (let s of [-1, 1]){
        let cy = s < 0 ? 0 : S;
        let g = x.createRadialGradient(S / 2, cy, 0, S / 2, cy, S * size);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.65, `rgba(255,255,255,${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, S, S);
    }
}

// An oval storm, as on Jupiter and Neptune.
function texSpot(x, S, cx, cy, rx, ry, dark, alpha){
    x.save();
    x.translate(S * cx, S * cy);
    x.scale(1, ry / rx);
    let g = x.createRadialGradient(0, 0, 0, 0, 0, S * rx);
    let col = dark ? '0,0,0' : '255,255,255';
    g.addColorStop(0, `rgba(${col},${alpha})`);
    g.addColorStop(0.7, `rgba(${col},${alpha * 0.45})`);
    g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, S * rx, 0, Math.PI * 2);
    x.fill();
    x.restore();
}

function planetTexture(kind, seed){
    // A style that describes one particular world only needs one texture; the generic classes keep
    // their pool so neighbouring anonymous rocks don't all share a face.
    let variant = starConstants.NAMED_STYLES.includes(kind) ? 0 : (seed >>> 0) % starConstants.PLANET_VARIANTS;
    let key = `p:${kind}:${variant}`;
    if (bodyTexCache[key]){ return bodyTexCache[key]; }

    const S = starConstants.PLANET_TEX, R = S / 2;
    let c = document.createElement('canvas');
    c.width = c.height = S;
    let x = c.getContext('2d');
    let rnd = texRand(texSeed(key));

    x.save();
    x.beginPath();
    x.arc(R, R, R, 0, Math.PI * 2);
    x.clip();

    switch (kind){
        case 'earth':
            // Continents as heavy mottling, then a thin bright veil of cloud over the top and caps.
            texBlobs(x, rnd, S, 16, 0.09, 0.2, 0.72, 0.34);
            texBlobs(x, rnd, S, 10, 0.05, 0.12, 0.0, 0.13);
            texPoles(x, S, 0.2, 0.5);
            break;

        // --- home world biomes (see starConstants.BIOME_LOOK) ---------------------------------------------------
        case 'bio_grassland':
            // Open plains: broad soft patches at low contrast under a thin veil, modest caps.
            texBlobs(x, rnd, S, 14, 0.10, 0.22, 0.55, 0.22);
            texBlobs(x, rnd, S, 8, 0.05, 0.12, 0.0, 0.10);
            texPoles(x, S, 0.16, 0.42);
            break;
        case 'bio_oceanic':
            // Nearly all water: a scattering of small islands and a great deal of weather.
            texBlobs(x, rnd, S, 7, 0.05, 0.13, 0.85, 0.30);
            texBlobs(x, rnd, S, 16, 0.06, 0.16, 0.0, 0.16);
            texPoles(x, S, 0.18, 0.5);
            break;
        case 'bio_forest':
            // Unbroken canopy: heavy dark mottling with cloud caught above it.
            texBlobs(x, rnd, S, 20, 0.08, 0.20, 0.85, 0.34);
            texBlobs(x, rnd, S, 7, 0.05, 0.11, 0.0, 0.10);
            texPoles(x, S, 0.14, 0.35);
            break;
        case 'bio_desert':
            // Dune fields run in belts, and there is little water to cloud over.
            texBands(x, rnd, S, 0.10, 0.05, 0.12);
            texBlobs(x, rnd, S, 12, 0.07, 0.18, 0.4, 0.16);
            break;
        case 'bio_volcanic':
            // Dark basalt with a handful of vents burning through it.
            texBlobs(x, rnd, S, 16, 0.07, 0.19, 0.8, 0.34);
            texSpot(x, S, 0.35, 0.42, 0.07, 0.05, false, 0.50);
            texSpot(x, S, 0.66, 0.62, 0.05, 0.04, false, 0.42);
            texSpot(x, S, 0.50, 0.78, 0.04, 0.03, false, 0.36);
            break;
        case 'bio_tundra':
            // Frozen ground throughout, with caps reaching most of the way to the equator.
            texBlobs(x, rnd, S, 10, 0.09, 0.20, 0.3, 0.16);
            texPoles(x, S, 0.42, 0.6);
            break;
        case 'bio_savanna':
            // Dry grass in belts, broken by scattered scrub.
            texBands(x, rnd, S, 0.08, 0.07, 0.15);
            texBlobs(x, rnd, S, 13, 0.05, 0.14, 0.7, 0.20);
            texPoles(x, S, 0.12, 0.30);
            break;
        case 'bio_swamp':
            // Standing water broken by countless small islands, under a permanent haze.
            texBlobs(x, rnd, S, 26, 0.04, 0.11, 0.7, 0.26);
            texBands(x, rnd, S, 0.05, 0.12, 0.24);
            texBlobs(x, rnd, S, 10, 0.06, 0.14, 0.0, 0.14);
            break;
        case 'bio_ashland':
            // Ash laid down in drifts over a dead surface; nothing left to freeze at the poles.
            texBands(x, rnd, S, 0.07, 0.06, 0.14);
            texBlobs(x, rnd, S, 18, 0.05, 0.15, 0.6, 0.20);
            break;
        case 'bio_taiga':
            // Conifer belts between long winters: dark forest, deep caps.
            texBlobs(x, rnd, S, 16, 0.07, 0.17, 0.78, 0.28);
            texPoles(x, S, 0.30, 0.55);
            break;
        case 'bio_hellscape':
            // Cracked and burning: dark crust with fire showing through all over it.
            texBlobs(x, rnd, S, 18, 0.06, 0.18, 0.85, 0.40);
            for (let i = 0; i < 9; i++){
                texSpot(x, S, rnd(), rnd(), 0.03 + rnd() * 0.04, 0.02 + rnd() * 0.03, false, 0.35 + rnd() * 0.25);
            }
            break;
        case 'bio_eden':
            // Everything in balance: soft varied ground, a bright veil of cloud, clean caps.
            texBlobs(x, rnd, S, 15, 0.08, 0.20, 0.45, 0.20);
            texBlobs(x, rnd, S, 12, 0.05, 0.13, 0.0, 0.16);
            texPoles(x, S, 0.18, 0.55);
            break;
        case 'mars':
            // Dark maria and bright dust, with the caps that make it unmistakable.
            texBlobs(x, rnd, S, 14, 0.08, 0.22, 0.7, 0.26);
            texPoles(x, S, 0.17, 0.62);
            break;
        case 'venus':
            // Total cloud cover: no surface, just slow swirls at very low contrast.
            texBands(x, rnd, S, 0.07, 0.1, 0.2);
            texBlobs(x, rnd, S, 9, 0.12, 0.26, 0.45, 0.09);
            break;
        case 'jupiter':
            texBands(x, rnd, S, 0.16, 0.045, 0.09);
            texSpot(x, S, 0.34, 0.63, 0.11, 0.062, true, 0.3);
            break;
        case 'saturn':
            // Softer and finer than Jupiter — Saturn's banding is famously muted.
            texBands(x, rnd, S, 0.085, 0.035, 0.07);
            break;
        case 'icegiant':
            // Nearly featureless, just a hint of banding.
            texBands(x, rnd, S, 0.045, 0.09, 0.18);
            break;
        case 'neptune':
            texBands(x, rnd, S, 0.07, 0.07, 0.15);
            texSpot(x, S, 0.62, 0.4, 0.1, 0.06, true, 0.26);
            break;
        case 'haze':
            // Titan: a thick smog with no visible surface at all.
            texBands(x, rnd, S, 0.05, 0.14, 0.26);
            break;
        case 'ice':
            // Clean ice with fracture lines rather than craters.
            texBlobs(x, rnd, S, 10, 0.06, 0.16, 0.35, 0.14);
            for (let i = 0; i < 7; i++){
                x.beginPath();
                x.moveTo(rnd() * S, rnd() * S);
                x.lineTo(rnd() * S, rnd() * S);
                x.strokeStyle = `rgba(0,0,0,${(0.06 + rnd() * 0.08).toFixed(3)})`;
                x.lineWidth = Math.max(1, S * 0.008);
                x.stroke();
            }
            break;
        case 'cratered':
            texBlobs(x, rnd, S, 10, 0.08, 0.2, 0.6, 0.16);
            texCraters(x, rnd, S, 22);
            break;
        case 'gas':
            texBands(x, rnd, S, 0.12, 0.05, 0.15);
            break;
        default:
            // Rocky: soft mottled patches. Belts get more, smaller ones so they read as rubble.
            if (kind === 'belt'){
                texBlobs(x, rnd, S, 26, 0.03, 0.08, 0.6, 0.28);
            }
            else {
                texBlobs(x, rnd, S, 14, 0.07, 0.21, 0.6, 0.28);
            }
            break;
    }

    // Highlight (upper left), terminator (lower right), then limb darkening all round.
    let hi = x.createRadialGradient(R * 0.62, R * 0.6, 0, R * 0.62, R * 0.6, R * 1.15);
    hi.addColorStop(0, 'rgba(255,255,255,0.38)');
    hi.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = hi;
    x.fillRect(0, 0, S, S);

    let sh = x.createRadialGradient(R * 1.35, R * 1.4, R * 0.1, R * 1.2, R * 1.3, R * 1.7);
    sh.addColorStop(0, 'rgba(0,0,0,0.6)');
    sh.addColorStop(0.6, 'rgba(0,0,0,0.22)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sh;
    x.fillRect(0, 0, S, S);

    let limb = x.createRadialGradient(R, R, R * 0.72, R, R, R);
    limb.addColorStop(0, 'rgba(0,0,0,0)');
    limb.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = limb;
    x.fillRect(0, 0, S, S);

    x.restore();
    bodyTexCache[key] = c;
    return c;
}

function starTexture(color){
    let key = `s:${color}`;
    if (bodyTexCache[key]){ return bodyTexCache[key]; }

    const S = starConstants.STAR_TEX, R = S / 2, disc = R * starConstants.STAR_CORE;
    let c = document.createElement('canvas');
    c.width = c.height = S;
    let x = c.getContext('2d');
    let rnd = texRand(texSeed(color));

    // Corona first so the disc paints over its inner edge. It starts essentially at the limb and
    // falls away fast, which keeps the edge of the disc readable instead of blurring it into a blob.
    let cor = x.createRadialGradient(R, R, disc * 0.97, R, R, R);
    cor.addColorStop(0, hexRGBA(color, 0.34));
    cor.addColorStop(0.22, hexRGBA(color, 0.1));
    cor.addColorStop(1, hexRGBA(color, 0));
    x.fillStyle = cor;
    x.fillRect(0, 0, S, S);

    // The disc brightens toward the middle and darkens at the limb, but never washes out to pure white — zoomed out a star
    // is only a pixel or two across, and that pixel has to stay the color of its spectral class.
    let body = x.createRadialGradient(R, R, 0, R, R, disc);
    body.addColorStop(0, hexShade(color, 1.55));
    body.addColorStop(0.5, hexShade(color, 1.12));
    body.addColorStop(0.88, hexShade(color, 1));
    body.addColorStop(1, hexShade(color, 0.7));
    x.fillStyle = body;
    x.beginPath();
    x.arc(R, R, disc, 0, Math.PI * 2);
    x.fill();

    // Granulation: low-contrast convection cells over the disc, so a star closed in on reads as a
    // surface rather than a plain gradient. Kept faint enough not to shift the star's color.
    x.save();
    x.beginPath();
    x.arc(R, R, disc, 0, Math.PI * 2);
    x.clip();
    for (let i = 0; i < 45; i++){
        let a = rnd() * Math.PI * 2;
        let d = Math.sqrt(rnd()) * disc;
        let bx = R + Math.cos(a) * d, by = R + Math.sin(a) * d;
        let br = disc * (0.06 + rnd() * 0.14);
        let g = x.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rnd() < 0.5
            ? `rgba(255,255,255,${(0.05 + rnd() * 0.07).toFixed(3)})`
            : `rgba(0,0,0,${(0.04 + rnd() * 0.06).toFixed(3)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.beginPath();
        x.arc(bx, by, br, 0, Math.PI * 2);
        x.fill();
    }
    x.restore();

    bodyTexCache[key] = c;
    return c;
}

const gateGlyphCache = {};

// Nine distinct glyphs drawn from the pool. Seeded off the body, not Math.random: the map redraws on every drag and
// zoom, and glyphs reshuffling each frame would strobe.
function gateGlyphs(seed){
    if (gateGlyphCache[seed]){ return gateGlyphCache[seed]; }
    let pool = starConstants.GATE_GLYPHS.slice();
    let rnd = texRand(seed);
    let out = [];
    for (let i = 0; i < 9; i++){
        out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }
    gateGlyphCache[seed] = out;
    return out;
}

// Whether Tau Ceti's jump gate should appear beside the home planet on the map.
function tauJumpGate(){
    return global.tech['tauceti'] && global.tech.tauceti >= 3
        && actions.tauceti?.tau_home?.jump_gate?.condition?.() ? true : false;
}

// The sun gate is a stargate, not a world, so it is drawn as an open ring with space showing through the middle.
function drawGate(ctx, x, y, r, color, seed){
    let lw = r * 0.42;              // ring thickness
    let mid = r - lw / 2;           // centreline the stroke is laid along

    ctx.save();
    // Halo, so a gate is picked out at a glance from the rocks sharing its orbit.
    ctx.strokeStyle = hexRGBA(color, 0.25);
    ctx.lineWidth = lw * 2.4;
    ctx.beginPath();
    ctx.arc(x, y, mid, 0, Math.PI * 2, true);
    ctx.stroke();

    // The ring, lit across the diagonal like every other body on the map.
    let sheen = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    sheen.addColorStop(0, hexShade(color, 1.5));
    sheen.addColorStop(0.5, hexShade(color, 1));
    sheen.addColorStop(1, hexShade(color, 0.55));
    ctx.strokeStyle = sheen;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, mid, 0, Math.PI * 2, true);
    ctx.stroke();

    // Nine chevrons around the ring, as on the gate itself — only legible, and only worth the
    // strokes, once the gate is more than a few pixels across.
    if (r * mapScale >= 6){
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = Math.max(lw * 0.22, 0.4 / mapScale);
        for (let i = 0; i < 9; i++){
            let a = (i / 9) * Math.PI * 2 - Math.PI / 2;
            let ca = Math.cos(a), sa = Math.sin(a);
            ctx.beginPath();
            ctx.moveTo(x + ca * (mid - lw / 2), y + sa * (mid - lw / 2));
            ctx.lineTo(x + ca * (mid + lw / 2), y + sa * (mid + lw / 2));
            ctx.stroke();
        }

        // A glyph in each of the nine segments the notches divide the ring into — offset half a segment so they sit between the
        // notches rather than on top of them, and turned to stand upright on the ring.
        if (r * mapScale >= 18){
            let glyphs = gateGlyphs(seed);
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Sized and drawn in screen pixels, undoing the map scale for the text only.
            ctx.font = `${lw * mapScale * 0.78}px serif`;
            for (let i = 0; i < 9; i++){
                let a = ((i + 0.5) / 9) * Math.PI * 2 - Math.PI / 2;
                ctx.save();
                ctx.translate(x + Math.cos(a) * mid, y + Math.sin(a) * mid);
                ctx.rotate(a + Math.PI / 2);
                ctx.scale(1 / mapScale, 1 / mapScale);
                ctx.fillText(glyphs[i], 0, 0);
                ctx.restore();
            }
        }
    }
    ctx.restore();
}

let ringHiTable = false;
// Opacity of the ring at a given radius. Not a step function: the real rings shade into one another
// almost everywhere, and only the two gaps in the A ring have hard edges.
function ringDensityAt(x){
    if (x < 1.110 || x > 2.330){ return 0; }
    if (x < 1.236){ return 0.05 + 0.03 * (x - 1.110) / 0.126; }        // D, barely there
    if (x < 1.525){                                                    // C, with its plateaus
        const t = (x - 1.236) / 0.289;
        return 0.16 + 0.10 * t + 0.05 * Math.sin(t * 17);
    }
    if (x < 1.950){                                                    // B, the bright one
        const t = (x - 1.525) / 0.425;
        // Brightest around the middle and falling toward the Cassini edge, as it really does.
        return 0.74 - 0.20 * t * t + 0.06 * Math.sin(t * 23);
    }
    if (x < 2.025){                                                    // Cassini division
        // Not empty — it holds several faint ringlets, which is why it reads as grey rather than black.
        const t = (x - 1.950) / 0.075;
        return 0.05 + 0.05 * Math.max(0, Math.sin(t * 9));
    }
    if (x < 2.214){                                                    // A, inner
        const t = (x - 2.025) / 0.189;
        return 0.44 - 0.06 * t + 0.04 * Math.sin(t * 19);
    }
    if (x < 2.224){ return 0.02; }                                     // Encke gap
    if (x < 2.263){ return 0.36; }                                     // A, outer
    if (x < 2.268){ return 0.03; }                                     // Keeler gap
    if (x < 2.270){ return 0.30; }                                     // the last of A
    if (x < 2.320){ return 0.0; }                                      // the Roche division
    return 0.10;                                                       // F, a thin thread
}
// How warm the ring is at a given radius, 0 grey to 1 fully tinted. The B ring is the ruddiest, the
// C ring nearly colorless — the same contrast that shows in a photograph.
function ringWarmthAt(x){
    if (x < 1.525){ return 0.15; }
    if (x < 1.950){ return 1.0; }
    if (x < 2.025){ return 0.3; }
    return 0.65;
}
function ringHiBands(){
    if (ringHiTable){ return ringHiTable; }
    const inner = 1.110, outer = 2.330, step = (outer - inner) / starConstants.RING_HI_BANDS;
    ringHiTable = [];
    for (let i = 0; i < starConstants.RING_HI_BANDS; i++){
        const a = inner + i * step, b = a + step, mid = (a + b) / 2;
        let alpha = ringDensityAt(mid);
        if (alpha <= 0.005){ continue; }                                // a gap draws as nothing
        // Ringlet banding: fine structure on top of the broad shape, deterministic so a given band
        // is the same every frame.
        alpha *= 0.82 + 0.36 * (sphHash(i, 0, 0, 1) / 4294967296);
        ringHiTable.push([a, b, Math.min(0.95, alpha), ringWarmthAt(mid)]);
    }
    return ringHiTable;
}
// How far open the rings are to the camera: 1 face-on, 0 edge-on. The ring's normal against the view
// direction, taken through the same projection as everything else.
function ringOpening(ct, st){
    return Math.abs(-st * camCY * camSP + ct * camCP);
}

// The unit vector from a body toward the star it orbits, in world coordinates. Used to
// light the object from the direction of its star.
function sunDirection(offset){
    const d = Math.hypot(offset.x, offset.y, offset.z);
    if (!(d > 0)){ return false; }
    // Toward the star, which is at the origin of the frame these offsets are measured in.
    return { x: -offset.x / d, y: -offset.y / d, z: -offset.z / d };
}

function drawRings(ctx, x, y, r, color, near, tilt, sun){
    let lean = tilt || starConstants.RING_TILT;
    let ct = Math.cos(lean), st = Math.sin(lean);

    let A = camSY * camSP;
    let B = ct * camCY * camSP + st * camCP;
    let cross = Math.atan2(-A, B);
    // Which of the two arcs is the near one, judged from the middle of the first.
    let mid = cross + Math.PI / 2;
    let nearFirst = (A * Math.cos(mid) + B * Math.sin(mid)) < 0;
    let start = (nearFirst === near) ? cross : cross + Math.PI;

    // The fine table where the player has asked for detail and the rings are wide enough on screen
    // to show it, otherwise the seven broad bands. 
    const hi = mapView().texture === 'high' && !mapCameraMoving && r * mapScale >= 15;
    const bands = hi ? ringHiBands() : starConstants.RING_BANDS;
    // How much of the ring's thickness the line of sight passes through.
    const open = hi ? Math.max(0.12, ringOpening(ct, st)) : 1;

    // The planet's shadow, as a cylinder cast away from its star: a point on the ring is in it when it lies on the far side
    // of the planet from the sun AND within a planet's radius of the axis joining the two.
    const shade = hi && sun ? sun : false;
    // The sun resolved in the ring's own plane: sunP along the ring's x axis, sunQ along the in-plane
    // axis the lean tips. The shadow is centred half a turn round from where the sun lies.
    let sunP = 0, sunQ = 0, sunR = 0, shadowMid = 0;
    if (shade){
        sunP = shade.x;
        sunQ = ct * shade.y + st * shade.z;
        sunR = Math.hypot(sunP, sunQ);
        shadowMid = Math.atan2(sunQ, sunP) + Math.PI;
    }
    // The far end of the ramp. The near end is the band's own lit color, which varies with warmth.
    const darkRGB = shadeRGB(color, starConstants.SHADOW_SHADE);

    for (let band of bands){
        let inner = band[0], outer = band[1], alpha = band[2];
        if (hi){
            // Beer-Lambert through a longer path: an already-dense band saturates, a faint one gains
            // the most, which is what actually happens.
            alpha = 1 - Math.pow(1 - alpha, 1 / open);
        }
        let rad = r * (inner + outer) / 2;
        // Warmth: the B ring is the ruddiest of them, the C ring nearly colorless.
        const litShade = hi ? 1.15 + 0.5 * band[3] : 1.5;
        const litRGB = shadeRGB(color, litShade);
        const lit = rgba(litRGB, alpha);
        ctx.lineWidth = Math.max(r * (outer - inner), 0.4 / mapScale);

        // The shadow's edge on this band, as half-widths in ring longitude either side of shadowMid, darkest core first.
        let edge = false;
        if (shade && sunR > 1e-6){
            edge = [];
            for (let j = 0; j <= starConstants.PEN_STEPS; j++){
                const rho = r * (starConstants.PEN_CORE + (starConstants.PEN_EDGE - starConstants.PEN_CORE) * j / starConstants.PEN_STEPS);
                const k = Math.sqrt(Math.max(0, rad * rad - rho * rho)) / (rad * sunR);
                edge.push(k >= 1 ? 0 : Math.acos(k));
            }
            // A band the shadow never reaches — the sun too far out of the ring plane, or the band
            // too wide for the cylinder to cover any of it.
            if (edge[starConstants.PEN_STEPS] <= 0){ edge = false; }
        }
        // How deep in shadow a longitude is, as a step from 0 (lit) to starConstants.PEN_STEPS + 1 (fully dark).
        const shadowAt = (t) => {
            if (!edge){ return 0; }
            const dt = Math.abs(wrapAngle(t - shadowMid));
            if (dt >= edge[starConstants.PEN_STEPS]){ return 0; }
            if (dt <= edge[0]){ return starConstants.PEN_STEPS + 1; }
            for (let j = 1; j <= starConstants.PEN_STEPS; j++){
                if (dt < edge[j]){ return starConstants.PEN_STEPS + 1 - j; }
            }
            return 0;
        };
        // In shadow the ring keeps its own color, heavily darkened rather than blacked out.
        const tones = new Array(starConstants.PEN_STEPS + 2);
        const toneFor = (lv) => {
            if (!tones[lv]){
                const f = lv / (starConstants.PEN_STEPS + 1);
                tones[lv] = lv === 0 ? lit : rgba([0, 1, 2].map(i => litRGB[i] + (darkRGB[i] - litRGB[i]) * f), alpha);
            }
            return tones[lv];
        };

        // The sample angles, with the exact shadow edges spliced in, so the boundary lands where the
        // geometry puts it rather than on whichever sample happened to be nearest.
        let angles = [];
        for (let i = 0; i <= starConstants.RING_HALF_STEPS; i++){
            angles.push(start + (i / starConstants.RING_HALF_STEPS) * Math.PI);
        }
        if (edge){
            for (let j = 0; j <= starConstants.PEN_STEPS; j++){
                for (const cut of [shadowMid - edge[j], shadowMid + edge[j]]){
                    // Only the crossings that fall inside the half being drawn.
                    let u = ((cut - start) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                    if (u > 0 && u < Math.PI){ angles.push(start + u); }
                }
            }
            angles.sort((a, b) => a - b);
        }
        // The circle, tipped out of the orbital plane by the body's lean.
        const pts = angles.map(t => {
            let ox = rad * Math.cos(t);
            let oy = rad * Math.sin(t) * ct;
            let oz = rad * Math.sin(t) * st;
            return [x + (ox * camCY - oy * camSY), y + (ox * camSY + oy * camCY) * camCP - oz * camSP];
        });

        // Walked in runs of one shade rather than as one path, since a stroke cannot change color
        // along its length. Consecutive runs share their end point, so there is no seam.
        let run = [], runLevel = -1;
        const flush = () => {
            if (run.length < 2){ run = []; return; }
            ctx.strokeStyle = toneFor(runLevel);
            ctx.beginPath();
            ctx.moveTo(run[0][0], run[0][1]);
            for (let k = 1; k < run.length; k++){ ctx.lineTo(run[k][0], run[k][1]); }
            ctx.stroke();
            run = [];
        };
        for (let i = 1; i < angles.length; i++){
            // The shade of the span, read at its middle — which is unambiguous, because every angle
            // the shade changes at is one of the endpoints.
            let lv = shadowAt((angles[i - 1] + angles[i]) / 2);
            if (lv !== runLevel){
                flush();
                run.push(pts[i - 1]);
                runLevel = lv;
            }
            run.push(pts[i]);
        }
        flush();
    }
}

// Saturn is flagged in the table. Past Sol, roughly a quarter of the gas giants carry rings too, and which ones is
// Choose this effect deterministically from the body id.
function hasRings(planet, id){
    if (planet.rings){ return true; }
    if (!id || !planet.star || planet.startype || planet.bodystar){ return false; }
    if (cowGlyph(id)){ return false; }   // a cow is drawn as a glyph; there is nothing to hang rings on
    return bodyKind(planet, id) === 'gas' && texSeed(id + 'ring') % 4 === 0;
}

// Lean of a ringed world's ring plane, in radians. Saturn takes the tuned value.
function ringTilt(planet, id){
    if (planet.rings || !id){ return starConstants.RING_TILT; }
    if (planet.tilt !== undefined){
        const askew = ((texSeed(id + 'askew') % 1000) / 1000) < starConstants.RING_OFF_AXIS_ODDS;
        const deg = askew
            ? starConstants.RING_OFF_AXIS[0] + (texSeed(id + 'tilt') % 1000) / 1000
                * (starConstants.RING_OFF_AXIS[1] - starConstants.RING_OFF_AXIS[0])
            : planet.tilt;
        return deg * Math.PI / 180;
    }
    return (55 + (texSeed(id + 'tilt') % 1000) / 1000 * 30) * Math.PI / 180;
}

// A body drawn as a glyph rather than a lit sphere. Text is laid out in pixels, so the map's scale is undone and the
// glyph placed in screen space, sized from the projected radius — which leaves it tracking zoom exactly as a drawn disc of the same size would.
function drawGlyph(ctx, x, y, r, glyph){
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.scale(1 / mapScale, 1 / mapScale);
    ctx.font = `${r * mapScale * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, x * mapScale, y * mapScale);
    ctx.restore();
}

// Danger warning at location
function dangerAt(id){
    return id === 'spc_venus' && venusBlockade() > 0;
}

// The warning mark itself, struck straight across the world it belongs to. Sized off the body so it overhangs at any zoom.
function drawDanger(ctx, x, y, r){
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.scale(1 / mapScale, 1 / mapScale);
    let size = Math.max(r * mapScale, 0);
    ctx.font = `bold ${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff2b2b';
    ctx.fillText('⚠️', x * mapScale, y * mapScale);
    ctx.restore();
}

// --- irregular bodies ---------------------------------------------------------------------------

// The radius of the outline at an angle, as a multiple of the body's nominal radius.
function lumpFactor(seed, theta){
    let f = 1;
    for (let i = 0; i < starConstants.LUMP_HARMONICS.length; i++){
        const [k, amp] = starConstants.LUMP_HARMONICS[i];
        const phase = (sphHash(seed, k, i, 7) / 4294967296) * Math.PI * 2;
        f += amp * Math.cos(k * theta + phase);
    }
    return f;
}
// Scale that brings the widest point of the outline onto the body's nominal radius, so a lumpy body
// occupies the same circle a round one of the same size would.
const lumpNormCache = {};
function lumpNorm(seed){
    if (lumpNormCache[seed] === undefined){
        let max = 0;
        for (let i = 0; i < 720; i++){
            const f = lumpFactor(seed, i * Math.PI / 360);
            if (f > max){ max = f; }
        }
        lumpNormCache[seed] = 1 / max;
    }
    return lumpNormCache[seed];
}
// Which way the outline is turned. Both the camera swinging round and the body's own rotation change which profile is
// Rotate the surface texture and silhouette together.
function lumpSpin(id){
    const spin = spinOf(id);
    const turn = spin.hours ? ((mapDays + drawAhead) * 24 / spin.hours) * 360 * starConstants.SPIN_SCALE : 0;
    return mapYaw + turn * Math.PI / 180;
}
// Lay the outline down as a path. `spin` turns it, which is what makes it read as a solid object
// being looked at from a new angle rather than a shape painted on the screen.
function lumpPath(ctx, x, y, r, seed, spin, scale){
    const norm = r * lumpNorm(seed) * (scale || 1);
    ctx.beginPath();
    for (let i = 0; i <= starConstants.LUMP_STEPS; i++){
        const t = i / starConstants.LUMP_STEPS * Math.PI * 2;
        const rr = norm * lumpFactor(seed, t + spin);
        const px = x + Math.cos(t) * rr, py = y + Math.sin(t) * rr;
        if (i === 0){ ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
    }
    ctx.closePath();
}
function drawLumpy(ctx, x, y, r, color, opts){
    const seed = opts.seed || 1;
    // Pitch is left out of the turn: it tips the view rather than spinning it, and rolling the
    // outline for it would look like the rock turning when the camera merely leaned.
    const spin = lumpSpin(opts.id);
    ctx.fillStyle = hexShade(color, starConstants.LUMP_DARK_SHADE);
    lumpPath(ctx, x, y, r, seed, spin);
    ctx.fill();
    // Below a few pixels there is nothing to shade — the silhouette is the whole of what reads.
    if (r * mapScale < 2.5){ return; }
    // Which way the sun is, in screen terms. Falling back to the upper left is the same flat light
    // everything else on the map uses when it has no star to measure from.
    let lx = -0.7071, ly = -0.7071;
    if (opts.sun){
        const sx = pX(opts.sun), sy = pY(opts.sun), n = Math.hypot(sx, sy);
        if (n > 1e-6){ lx = sx / n; ly = sy / n; }
    }
    for (let i = 1; i <= starConstants.LUMP_SHADE_STEPS; i++){
        const t = i / starConstants.LUMP_SHADE_STEPS;
        const off = starConstants.LUMP_LIT_OFFSET * t;
        ctx.fillStyle = hexShade(color, starConstants.LUMP_DARK_SHADE + (starConstants.LUMP_LIT_SHADE - starConstants.LUMP_DARK_SHADE) * t);
        lumpPath(ctx, x + lx * r * off, y + ly * r * off, r, seed, spin, 1 - 0.5 * t);
        ctx.fill();
    }
}

function drawDebris(ctx, x, y, r, color, opts){
    const seed = opts.seed || 1;
    const rnd = (i, k) => sphHash(seed, i, k, 11) / 4294967296;

    if (r * mapScale < starConstants.DEBRIS_MIN_PX){
        ctx.fillStyle = hexShade(color, starConstants.LUMP_DARK_SHADE);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        return;
    }

    // The wreck lies in the orbital plane, so it is built in world coordinates and projected like any other body.
    let rx = 1, ry = 0, rz = 0;
    if (opts.sun){
        // sunDirection() points at the star, so the outward radial is its opposite.
        const n = Math.hypot(opts.sun.x, opts.sun.y, opts.sun.z);
        if (n > 1e-6){ rx = -opts.sun.x / n; ry = -opts.sun.y / n; rz = -opts.sun.z / n; }
    }
    // orbitPoint() tilts about the x axis, so the plane is spanned by x and (0, cos i, sin i) and the
    // normal is their cross product.
    const inc = orbitIncline(opts.id) * Math.PI / 180;
    const nx = 0, ny = -Math.sin(inc), nz = Math.cos(inc);
    let tx = ny * rz - nz * ry, ty = nz * rx - nx * rz, tz = nx * ry - ny * rx;
    const tn = Math.hypot(tx, ty, tz);
    if (tn > 1e-6){ tx /= tn; ty /= tn; tz /= tn; }
    else { tx = 0; ty = 1; tz = 0; }

    const place = (u, v, w) => {
        const o = { x: tx*u + rx*v + nx*w, y: ty*u + ry*v + ny*w, z: tz*u + rz*v + nz*w };
        return { x: x + pX(o), y: y + pY(o), d: pD(o) };
    };
    const spot = (i, ka, kd, scale) => {
        const a = rnd(i, ka) * Math.PI * 2;
        const d = Math.sqrt(rnd(i, kd)) * scale;
        return {
            u: Math.cos(a) * d * r * starConstants.DEBRIS_ALONG,
            v: Math.sin(a) * d * r * starConstants.DEBRIS_ACROSS,
            w: (rnd(i, ka + 20) * 2 - 1) * r * starConstants.DEBRIS_THICK * scale
        };
    };

    if (mapView().texture === 'high'){
        for (let i = 0; i < starConstants.DEBRIS_DUST; i++){
            const s = spot(i, 5, 6, 0.8);
            const p = place(s.u, s.v, s.w);
            ctx.fillStyle = hexRGBA(color, starConstants.DEBRIS_DUST_ALPHA);
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * (0.45 + 0.55 * rnd(i, 7)), 0, Math.PI * 2, true);
            ctx.fill();
        }
    }

    // Every candidate piece is worked out whatever the setting, and drawRocks then drops the smallest,
    // so the low-detail field is the same wreck rather than a different one.
    let rocks = [];
    for (let i = 0; i < starConstants.DEBRIS_ROCKS_HIGH; i++){
        const s = spot(i, 1, 2, 1);
        const p = place(s.u, s.v, s.w);
        const g = rnd(i, 3);
        rocks.push({
            i: i,
            d: p.d,
            x: p.x,
            y: p.y,
            r: r * (starConstants.DEBRIS_MIN + (starConstants.DEBRIS_MAX - starConstants.DEBRIS_MIN) * g * g * g)
        });
    }
    drawRocks(ctx, rocks, color, { id: opts.id, sun: opts.sun, keepLow: starConstants.DEBRIS_ROCKS_LOW });
}

// Draw a population of rock — the pieces of a wrecked world, or the asteroids of a belt.
function drawRocks(ctx, rocks, color, opts){
    const hi = mapView().texture === 'high';
    // Biggest first, which on the low setting is which pieces survive at all.
    rocks.sort((p,q) => q.r - p.r);
    if (!hi && opts.keepLow){ rocks = rocks.slice(0, opts.keepLow); }

    // Then furthest from the camera first, on the same projected depth and the same descending order the bodies themselves
    // are painted in, so a piece in front covers one behind it however the view is turned.
    rocks.sort((p,q) => q.d - p.d);
    for (let rock of rocks){
        // The rock face
        const face = rockFace(opts.id, rock.i);
        const sun = rock.sun || opts.sun;
        const roll = rockRoll(opts.id, rock.i);
        // sphereSize() is the same gate the round bodies use: it comes back 0 on the low setting, and on the high one for
        // Use simple dots for bodies too small to render with surface detail.
        const sph = Math.min(sphereSize('belt', rock.r, starConstants.ROCK_DOT_PX, true), starConstants.ROCK_TEX_MAX);
        // False when the frame has spent its render budget; the silhouette below stands in until a
        // later frame has built the face (see ROCK_TEX_BUDGET).
        const tex = sph ? rockTexture(sph, face, sun, roll) : false;
        if (tex){
            // Turned about its own centre. The surface was lit for exactly this turn, so the light
            // comes out of it pointing back at the star (see ROCK_FACES).
            ctx.save();
            ctx.translate(rock.x, rock.y);
            ctx.rotate(roll);
            ctx.drawImage(tex, -rock.r, -rock.r, rock.r * 2, rock.r * 2);
            ctx.restore();
        }
        else if (rock.r * mapScale < starConstants.ROCK_DOT_PX){
            // A couple of pixels across there is no outline to read, and a belt is a great many of them: one arc rather than a
            // forty-segment silhouette that would rasterise to the same speck.
            ctx.fillStyle = hexShade(color, starConstants.ROCK_DOT_SHADE);
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2, true);
            ctx.fill();
        }
        else {
            drawLumpy(ctx, rock.x, rock.y, rock.r, color, {
                id: rockId(opts.id, rock.i), seed: texSeed(rockFaceId(face)), sun: sun
            });
        }
    }
}

// --- Asteroid fields ------------------------------------------------------------------------------

// Where a field's rocks sit, as offsets from the star they ring.
function fieldProfile(id){
    const cfg = starConstants.ASTEROID_FIELDS[id];
    if (cfg){ return cfg; }
    const body = starData[id];
    return body && body.belt && !body.gate ? starConstants.ASTEROID_FIELDS.spc_belt : false;
}

const asteroidFieldCache = {};
function asteroidField(id){
    if (asteroidFieldCache[id]){ return asteroidFieldCache[id]; }
    const cfg = fieldProfile(id);
    const seed = texSeed(`${id}#field`);
    const rnd = (i, k) => sphHash(seed, i, k, 23) / 4294967296;
    // The orbit's own plane, so the spread out of it leans with the orbit. orbitPoint() tilts about
    // the x axis, so the plane is spanned by x and (0, cos i, sin i) and the normal is their cross.
    const inc = orbitIncline(id) * Math.PI / 180;
    const nx = 0, ny = -Math.sin(inc), nz = Math.cos(inc);
    const body = starData[id];
    // The star the ring is centred on. drawMap's own ORIGIN is local to it, and this runs from the
    // module, so the Sun's is written out here.
    const primary = body.star ? genXYZcoord(body.star) : { x: 0, y: 0, z: 0 };
    const radius = orbitRadius(id);
    let list = [];
    for (let i = 0; i < cfg.rocks; i++){
        // Anywhere on the ring, then in or out of it, then up or down out of its plane.
        const q = rel(orbitPoint(id, rnd(i, 1) * 360), primary);
        const spread = 1 + (rnd(i, 2) * 2 - 1) * cfg.width;
        const w = (rnd(i, 3) * 2 - 1) * radius * cfg.thick;
        const g = rnd(i, 4);
        list.push({
            i: i,
            o: { x: q.x*spread + nx*w, y: q.y*spread + ny*w, z: q.z*spread + nz*w },
            // Cubed, so the ring is mostly gravel with a few proper rocks in it.
            rs: cfg.size[0] + (cfg.size[1] - cfg.size[0]) * g * g * g
        });
    }
    asteroidFieldCache[id] = list;
    return list;
}

// Draw the asteroids of `id`'s belt, in the frame centred on `origin` (the Sun, or a star drawn in its
// own translated frame), at the `scale` that frame's bodies are shrunk by. Returns whether it drew.
function drawAsteroidField(ctx, id, origin, scale, color){
    const profile = fieldProfile(id);
    if (!profile || !starData[id]){ return false; }
    const body = starData[id];
    if (body.unlock && !global.tech[body.unlock]){ return false; }
    // Zoomed out the whole ring is a smudge, and a hundred sub-pixel specks would only dirty it.
    if (orbitRadius(id) * mapScale < starConstants.FIELD_MIN_RING_PX){ return false; }

    const drawn = body.size / 10 * (scale || 1);
    const floor = starConstants.FIELD_MIN_ROCK_PX / mapScale;
    const field = asteroidField(id);
    let rocks = [];
    for (const rock of field){
        const r = Math.max(drawn * rock.rs, floor);
        rocks.push({
            i: rock.i,
            x: pX(rock.o),
            y: pY(rock.o),
            d: pD(rock.o),
            r: r,
            // Each rock is lit from the star it rings, which is the frame's own origin — so on the far
            // side of the belt they are lit from the other side, as they should be.
            sun: sunDirection(rock.o)
        });
    }
    if (!rocks.length){ return false; }
    drawRocks(ctx, rocks, color, { id: id, keepLow: profile.keep });
    return true;
}

function drawBody(ctx, x, y, r, color, opts){
    opts = opts || {};
    if (opts.glyph){
        drawGlyph(ctx, x, y, r, opts.glyph);
        return;
    }
    if (opts.debris){
        drawDebris(ctx, x, y, r, color, opts);
        return;
    }
    if (opts.gate){
        drawGate(ctx, x, y, r, color, opts.seed);
        return;
    }
    ctx.fillStyle = "#" + color;
    if (opts.star){
        // The flat disc goes down first even though the texture's own disc is opaque. Zoomed out a
        // star is a pixel or two across.
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        let half = r / starConstants.STAR_CORE;
        // The same star, rasterised at the drawn size where it has outgrown the flat texture and the
        // player has asked for detail.
        const sst = sphereStarSize(r);
        ctx.drawImage(sst ? sphereStarTexture(color, sst) : starTexture(color),
                      x - half, y - half, half * 2, half * 2);
        return;
    }
    // Rings straddle the body, so the far half goes down first and the near half last — that ordering is what reads as the
    // planet sitting inside them rather than on top.
    let rings = opts.rings && r * mapScale >= 2.5;
    if (rings){ drawRings(ctx, x, y, r, color, false, opts.ringTilt, opts.sun); }
    // For small bodies that are not round.
    if (opts.lumpy){
        const sph = sphereSize(opts.kind, r);
        if (sph){
            ctx.drawImage(sphereTexture(opts.kind, sph, opts.id, opts.sun, true), x - r, y - r, r * 2, r * 2);
        }
        else {
            drawLumpy(ctx, x, y, r, color, opts);
        }
        if (rings){ drawRings(ctx, x, y, r, color, true, opts.ringTilt, opts.sun); }
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    if (r * mapScale >= 2.5){
        // A camera-aware sphere where one is offered and the player has asked for it, otherwise the flat texture this has always
        // used.
        const sph = sphereSize(opts.kind, r);
        ctx.drawImage(sph ? sphereTexture(opts.kind, sph, opts.id, opts.sun) : planetTexture(opts.kind, opts.seed),
                      x - r, y - r, r * 2, r * 2);
    }
    if (rings){ drawRings(ctx, x, y, r, color, true, opts.ringTilt, opts.sun); }
}

// Record a body the pointer can address, converting from the projected space drawBody works in to the screen pixels a
// mouse event arrives in.
function addPickable(id, bx, by, size, sep){
    // Anything drawn as a star also records the radius it was drawn at, for starAt — see starDrawnAt.
    // Every star the map lays down comes through here, so this is the one place that knows.
    const drawn = starData[id];
    if (drawn && (drawn.startype || drawn.bodystar)){ starDrawnAt[id] = size; }
    mapPickable.push({
        id: id,
        x: mapShift.x + bx * mapScale,
        y: mapShift.y + by * mapScale,
        r: size * mapScale,
        // Recorded for naming only — see above.
        nameOnly: mapScale < starConstants.planetLabelMinScale,
        // A body that has not pulled far enough off whatever it circles to read as a dot of its own — the same test
        // visibleRadius uses to decide whether to keep it visible at all.
        merged: sep !== undefined && sep < starConstants.BODY_SEPARATION_PX
    });
}

// The map's drawing context, whichever backend is in use.
var mapCtx = false;
var mapCtxFor = false;
var mapCtxGL = false;
function mapRenderer(){
    return webglSupported() && mapView().webgl ? 'webgl' : 'canvas';
}
function mapContext(canvas){
    let want = mapRenderer();
    if (mapCtxFor === canvas && mapCtx && mapCtxGL === (want === 'webgl')){ return mapCtx; }
    // Closing the map and opening it again arrives here with a new canvas. Hand the old context
    // back at that point rather than leaving it to be collected — see GLContext.destroy.
    if (mapCtx && mapCtx.destroy && mapCtxFor !== canvas){ mapCtx.destroy(); }
    mapCtx = want === 'webgl' ? createGLContext(canvas, drawMap) : false;
    // A browser that reports WebGL but refuses the real context falls back rather than failing.
    mapCtxGL = !!mapCtx;
    if (!mapCtx){ mapCtx = canvas.getContext("2d"); }
    mapCtxFor = canvas;
    return mapCtx;
}

// --- Map simulation and rendering ----------------------------------------------------------------
// Simulation advances on game loops; render loops only draw its current state.

// Return whether a loop owns the current map refresh rate.
export function mapPaintsOn(loop){
    if (webWorker.offline){ return loop === 'longLoop'; }
    if (!document.getElementById('mapCanvas')){ return false; }
    const rate = mapRefreshRate();
    return loop === (rate === 'fast' ? 'frame' : rate === 'slow' ? 'midLoop' : 'fastLoop');
}

// Wall-clock time of the last simulation step.
var mapSimAt = 0;
// Rendered map day and its previous wall-clock update.
var mapDrawnDays = 0;
var mapDrawnAt = 0;
// Last animation-frame render time.
var mapLastFrame = 0;
// Pending animation-frame request, or false when inactive.
var mapFrameReq = false;

// Advance map movement and orbital time for one simulation step.
export function advanceSolarMap(ticks){
    if (!global.race['truepath']){ return; }
    // Match offline day scaling used by longLoop.
    let days = ticks / webWorker.longRatio;
    if (webWorker.offline){ days *= webWorker.offlineScale; }

    advanceOrbits(days);
    moveTempCoordinates(days);
    moveShips(days);
    // Advance surface rotation.
    advanceMapDays(days);

    const now = Date.now();
    // Keep render interpolation aligned with simulation time; re-anchor after long gaps.
    mapSimAt += ticks * webWorker.mt;
    if (mapSimAt > now || now - mapSimAt > starConstants.MAP_AHEAD_MAX * webWorker.mt){ mapSimAt = now; }
}

// Unsimulated wall-clock time, capped for render interpolation.
export function mapAhead(){
    if (!mapSimAt || !webWorker.s || webWorker.offline){ return 0; }
    const ahead = (Date.now() - mapSimAt) / webWorker.mt;
    return ahead > 0 ? Math.min(ahead, starConstants.MAP_AHEAD_MAX) : 0;
}

// Render the current map state without advancing simulation.
export function paintSolarMap(){
    if (!global.race['truepath']){ return; }
    if (!document.getElementById('mapCanvas')){ return; }
    const now = Date.now();
    const target = starInfo.days + mapAhead() / webWorker.longRatio;
    const elapsed = mapDrawnAt ? Math.min(now - mapDrawnAt, 1000) : 0;
    mapDrawnAt = now;
    const gap = target - mapDrawnDays;
    if (!mapDrawnDays || Math.abs(gap) > starConstants.MAP_RESYNC_DAYS){
        mapDrawnDays = target;
    }
    else if (gap > 0){
        // Do not render ahead of the current simulation target.
        mapDrawnDays = Math.min(target, mapDrawnDays + elapsed * starConstants.MAP_CATCHUP / (webWorker.mt * webWorker.longRatio));
    }
    // Hold the rendered clock until the simulation catches up.
    renderAhead = mapDrawnDays - starInfo.days;
    drawMap();
}

// Start or stop animation-frame map rendering for the active refresh setting.
export function syncMapFrames(){
    const want = mapPaintsOn('frame');
    if (want === (mapFrameReq !== false)){ return; }
    if (!want){
        cancelAnimationFrame(mapFrameReq);
        mapFrameReq = false;
        mapLastFrame = 0;
        return;
    }
    mapLastFrame = 0;
    const frame = function(){
        // Stop when the map closes or frame rendering is no longer selected.
        if (!mapPaintsOn('frame')){ mapFrameReq = false; mapLastFrame = 0; return; }
        mapFrameReq = requestAnimationFrame(frame);
        const now = Date.now();
        // Limit rendering to the configured map frame rate.
        if (now - mapLastFrame < 1000 / starConstants.MAP_FPS - starConstants.MAP_FRAME_LEAD_MS){ return; }
        mapLastFrame = now;
        paintSolarMap();
    };
    mapFrameReq = requestAnimationFrame(frame);
}

export function drawMap() {
    // Cache body positions for this draw only.
    posMemo = Object.create(null);
    // Use one render offset for every body in this frame.
    drawAhead = isFinite(renderAhead) ? renderAhead : 0;
    try { drawMapFrame(); }
    finally { posMemo = false; drawAhead = 0; }
}

function drawMapFrame() {
    let canvas = document.getElementById("mapCanvas");
    if (!canvas){ return; }
    let ctx = mapContext(canvas);
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    // Sizing the canvas resets the 2D context's state for free; WebGL needs the viewport and the
    // frame's batch set up explicitly. No-op on the 2D path.
    if (ctx.beginFrame){ ctx.beginFrame(); }

    if (starLockOn) {
        // Move camera onto locked on body, keeping its position in the center
        const pos = genXYZcoord(starLockOn);
        const bounds = document.getElementById("mapCanvas").getBoundingClientRect();
        mapShift.x = bounds.width / 2 - pX(pos) * mapScale;
        mapShift.y = bounds.height / 2 - pY(pos) * mapScale;
    }

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(mapShift.x, mapShift.y);
    ctx.scale(mapScale, mapScale);
    camUpdate();
    mapPickable = [];
    mapLabelled = {};
    // What this frame may spend on new rock faces, before it falls back to silhouettes and asks for
    // another frame to finish in (see ROCK_TEX_BUDGET).
    sphereBudget = 0;
    const ORIGIN = { x: 0, y: 0, z: 0 };
    // Where the range limit measures from, settled before anything asks to be culled — including the
    // home system on the very next line.
    indexBodies();
    mapAnchor = genXYZcoord(nearestStar(mapFocus));
    // The sky behind the system, painted before anything in it.
    drawSkyStars();
    // The home system hangs off the Sun at the origin, so one test covers its orbits, bodies and
    // labels alike.
    const homeCulled = starCulled(ORIGIN);

    // Positions of the home system's bodies. Only these are read from here — everything orbiting another star is positioned
    // inside that star's own block below, and only for stars that survive culling.
    let planetLocation = {};
    if (!homeCulled){
        for (const id of mapHomeIds){
            planetLocation[id] = genXYZcoord(id);
        }
    }

    // Orbits, gathered by the body each one circles rather than drawn here.
    let orbitsBy = {};
    // Other star systems are drawn in their own reference frames.
    for (const id of mapHomeIds) {
        if (homeCulled){ break; }
        const planet = starData[id];
        if (planet.startype){ continue; }
        if (planet.parent ? !mapView().moonOrbits : !mapView().planetOrbits){ continue; }
        // Uses the parent-relative distance for a moon, so its ring only appears once you are zoomed
        // in far enough for it to be more than a few pixels across.
        if (orbitRadius(id) * mapScale < starConstants.ORBIT_MIN_PX){ continue; }
        if (actions.space[id] && actions.space[id].info.showDest && !actions.space[id].info.showDest().r){ continue; }
        let primary = planet.parent || 'spc_sun';
        if (!orbitsBy[primary]){ orbitsBy[primary] = []; }
        orbitsBy[primary].push(id);
    }

    // Ships under way, collapsed into what actually gets drawn.
    let shipMarks = [];
    if (mapView().ships) {
        let fleets = {};
        for (let ship of global.space.shipyard.ships) {
            if (!ship.inTransit){ continue; }
            if (global.tech['syard_fleet'] && ship.fid){
                // Keyed on the fleet itself, so two fleets crossing to the same place on the same
                // schedule stay two marks rather than collapsing into one.
                let key = `${ship.fid}`;
                if (fleets[key]){
                    fleets[key].count++;
                    if (ship.class === 'freighter'){ fleets[key].cargo = true; }
                    // The flagship is the one worth labelling the group with.
                    if (ship.flag){ fleets[key].ship = ship; }
                    continue;
                }
                fleets[key] = { ship, count: 1, cargo: ship.class === 'freighter' };
                shipMarks.push(fleets[key]);
            }
            else {
                shipMarks.push({ ship, count: 1 });
            }
        }
        // Infested hulls inbound from Earth. They never fleet up, and they are drawn in red so a raid
        // reads as a threat at a glance rather than as one more ship of yours.
        if (global.race['zfleet'] && global.race.zfleet.s){
            // Raiders that lifted as one sortie carry its id and fly identical trips, so they are collapsed the same way a fleet of
            // yours is rather than stacking dot, trail and name on the one pixel.
            let raids = {};
            for (let ship of global.race.zfleet.s){
                if (!ship.inTransit){ continue; }
                // Nothing of yours can see it, so nothing of yours plots it.
                if (!foeDetected(ship)){ continue; }
                if (!ship.zf){
                    shipMarks.push({ ship, count: 1, foe: true });
                    continue;
                }
                if (raids[ship.zf]){ 
                    raids[ship.zf].count++; 
                }
                else {
                    raids[ship.zf] = { ship, count: 1, foe: true };
                    shipMarks.push(raids[ship.zf]);
                }
            }
        }
    }

    // Ship trail. The width is set here rather than inherited: the canvas is scaled by mapScale, so the default of one unit
    // is a bar mapScale pixels across, and this pass used to be relying on whatever the orbits happened to leave behind.
    ctx.lineWidth = 1 / mapScale;
    for (let { ship, foe } of shipMarks) {
        ctx.fillStyle = foe ? "#ff0000" : "#0000ff";
        ctx.strokeStyle = foe ? "#ff0000" : "#0000ff";
        // Draw in the ship's reference-star frame (see shipRefStar): a pure translation of every
        // point, so the trail geometry is unchanged but the coordinates near the ship stay small.
        let ref = shipRefStar(ship);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.beginPath();
        let here = rel(shipPointAhead(ship, drawAhead), ref);

        let span = 0;
        let prev = here;
        for (let i=0; i<ship.path.length; i++){
            let q = rel(ship.path[i].destination.position, ref);
            span += Math.sqrt((q.x-prev.x)**2 + (q.y-prev.y)**2 + (q.z-prev.z)**2);
            prev = q;
        }
        let cycle = Math.max(0.5, span / starConstants.TRAIL_MAX_DASHES);
        ctx.setLineDash([cycle * 0.2, cycle * 0.8]);

        ctx.moveTo(pX(here), pY(here));
        // Draw the full remaining flight path through each waypoint still ahead of the ship.
        for (let i=0; i<ship.path.length; i++){
            let q = rel(ship.path[i].destination.position, ref);
            ctx.lineTo(pX(q), pY(q));
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawSkyStars(){
        if (!mapView().skyStars){ return; }
        // Only worth drawing once the real stars have left the frame; below that they are on screen
        // in their true places and a second copy of them on the rim would be nonsense.
        if (mapScale < starConstants.planetLabelMinScale){ return; }
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const radius = Math.hypot(canvas.width, canvas.height) * starConstants.SKY_RADIUS_FRAC;
        // Read once rather than per star: it comes through the `global` reactive proxy, and the sky
        // walks the whole catalogue.
        const range = starRange();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (const id of starIndex()){
            const star = starData[id];
            if (star.hidden){ continue; }
            const pos = genXYZcoord(id);
            const dx = pos.x - mapAnchor.x, dy = pos.y - mapAnchor.y, dz = pos.z - mapAnchor.z;
            const au = Math.hypot(dx, dy, dz);
            // The star the sky is being seen from is not in it, and neither is anything close enough
            // to still be drawn in the scene proper.
            if (au <= starConstants.STAR_CULL_AU){ continue; }
            // The player's range limit thins the sky exactly as it thins the map.
            if (range !== starConstants.STAR_RANGE_INF && au > range * starConstants.AU_PER_LY){ continue; }
            const u = { x: dx / au, y: dy / au, z: dz / au };
            // Only the half of the sky behind the system. The other half is between the camera and
            // what it is looking at, and painting it would drop stars in front of the planets.
            if (pD(u) <= 0){ continue; }
            const sx = cx + pX(u) * radius, sy = cy + pY(u) * radius;
            if (sx < -2 || sy < -2 || sx > canvas.width + 2 || sy > canvas.height + 2){ continue; }
            const lg = Math.log10(Math.max(skyFlux(star, au / starConstants.AU_PER_LY), 1e-12));
            const t = Math.min(1, Math.max(0, (lg - starConstants.SKY_LOG_FAINT) / (starConstants.SKY_LOG_BRIGHT - starConstants.SKY_LOG_FAINT)));
            ctx.fillStyle = hexShadeRGBA(starTint(star.startype), 1, 0.35 + 0.65 * t);
            ctx.beginPath();
            ctx.arc(sx, sy, starConstants.SKY_MIN_PX + (starConstants.SKY_MAX_PX - starConstants.SKY_MIN_PX) * t, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    let setColor = function(id){
        let color = '558888';
        if (actions.space[id] && actions.space[id].info.syndicate() && global.settings.space[id.substring(4)]){
            let shift = syndicate(id);
            color = ((Math.round(255*(1-shift)) << 16) + (Math.round(255*shift) << 8)).toString(16).padStart(6, 0);
        }
        if (starData[id].startype || starData[id].bodystar){
            color = starTint(starData[id].startype || starData[id].bodystar);
        }
        else if (id === 'spc_dwarf' || id === 'tau_gas2'){
            color = '7132a8';
        }
        else if (id === 'spc_sun_gate' || id === 'tau_home'){
            color = '31a557';
        }
        else if (homeDebris(id)){
            color = starConstants.SOL_BODY_COLOR.spc_belt;   // rubble, not the ocean blue of the world it was
        }
        else if (solBodyColor(id)){
            // The named Sol bodies get their real color; the home world gets its biome's.
            color = solBodyColor(id);
        }
        else if (starData[id].hz){
            color = '3fa34d';   // habitable-zone planet (greenish)
        }
        return color;
    }

    // Planets and moons, drawn back to front so a body in front of another covers it once the map is tilted.
    {
        // Home-system bodies that actually orbit the Sun, for sizing the system against them. Its
        // orbits are roomy enough that this comes back 1 and nothing here changes.
        let homeScale = homeCulled ? 1 : systemScale(starData.spc_sun.size, mapHomeOrbitIds, ORIGIN);
        let bodies = [];
        for (const id of mapHomeIds) {
            if (homeCulled){ break; }
            const planet = starData[id];
            // Stars other than the Sun (which sits at the origin) are drawn in their own translated
            // frame below; neither belongs in this index.
            if (planet.startype && id !== 'spc_sun'){ continue; }
            if ((global.race['orbit_decayed'] || global.race['tidal_decay']) && id === 'spc_moon'){ continue; }
            if (actions.space[id] && actions.space[id].info.showDest && !actions.space[id].info.showDest().r){ continue; }
            let p = planetLocation[id];
            let bx = pX(p), by = pY(p);
            let size = planet.size / 10 * homeScale;
            // How far this body reads from whatever it circles, on screen.
            let sep;
            if (planet.moon) {
                let q = rel(p, planetLocation[planet.parent]);
                sep = Math.hypot(pX(q), pY(q)) * mapScale;
                size = visibleRadius(size, sep);
            }
            else if (planet.startype) {
                // The Sun keeps a minimum on-screen radius so it stays visible when zoomed out.
                size = Math.max(size, 1 / mapScale);
            }
            else {
                sep = Math.hypot(pX(p), pY(p)) * mapScale;
                size = visibleRadius(size, sep);
            }
            bodies.push({ id, planet, bx, by, size, sep, d: pD(p) });
        }
        bodies.sort((a,b) => b.d - a.d);   // furthest first, so nearer bodies paint over them

        // Every far half goes down before any body does. A body on the far side of its orbit is further out than its primary and
        // so is drawn before it — laying that half down just ahead of the primary would put the ring line over the very world riding on it.
        for (let primary of Object.keys(orbitsBy)){
            if ((global.race['orbit_decayed'] || global.race['tidal_decay']) && ['spc_home'].includes(primary)){ continue; }
            strokeOrbitGroup(ctx, orbitsBy[primary], ORIGIN, planetLocation[primary], false);
        }
        // The asteroids go down between the orbit rings and the bodies
        for (let id of Object.keys(starConstants.ASTEROID_FIELDS)){
            if (starData[id] && !starData[id].star){
                drawAsteroidField(ctx, id, ORIGIN, homeScale, setColor(id));
            }
        }
        for (let b of bodies){
            if ((global.race['orbit_decayed'] || global.race['tidal_decay']) && ['spc_moon'].includes(b.id)){ continue; }
            drawBody(ctx, b.bx, b.by, b.size, setColor(b.id), { id: b.id, sun: sunDirection(planetLocation[b.id]), star: !!b.planet.startype, gate: !!b.planet.gate, kind: bodyKind(b.planet, b.id), seed: texSeed(b.id), rings: hasRings(b.planet, b.id), ringTilt: ringTilt(b.planet, b.id), glyph: cowGlyph(b.id), lumpy: bodyLumpy(b.planet, b.id), debris: homeDebris(b.id) });

            if (orbitsBy[b.id] && !((global.race['orbit_decayed'] || global.race['tidal_decay']) && b.id === 'spc_home')){
                strokeOrbitGroup(ctx, orbitsBy[b.id], ORIGIN, planetLocation[b.id], true);
            }
            if (dangerAt(b.id)){ drawDanger(ctx, b.bx, b.by, b.size); }
            addPickable(b.id, b.bx, b.by, b.size, b.sep);
        }
    }

    // Distress signals. Drawn in their own star's frame for the same precision reasons as the ships,
    // and ahead of the ship markers so a ship that has flown out to one reads as sitting on top of it.
    {
        let pulse = beaconPulse();
        for (let beacon of liveBeacons()){
            let ref = genXYZcoord(beacon.s || 'spc_sun');
            if (starCulled(ref)){ continue; }
            let here = rel({ x: beacon.x, y: beacon.y, z: beacon.z }, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            let bx = pX(here), by = pY(here);
            // A ring that swells outward and fades as it goes, so the mark reads as flaring rather
            // than merely changing size.
            ctx.beginPath();
            ctx.fillStyle = `rgba(${starConstants.BEACON_COLOR}, ${0.3 * (1 - pulse)})`;
            ctx.arc(bx, by, (starConstants.BEACON_DOT_PX + (starConstants.BEACON_HALO_PX - starConstants.BEACON_DOT_PX) * pulse) / mapScale, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = `rgba(${starConstants.BEACON_COLOR}, ${0.55 + 0.45 * pulse})`;
            ctx.arc(bx, by, starConstants.BEACON_DOT_PX / mapScale, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        }
    }

    // Ships
    for (let { ship, foe } of shipMarks) {
        ctx.fillStyle = foe ? "#ff0000" : "#0000ff";
        ctx.strokeStyle = foe ? "#ff0000" : "#0000ff";
        let ref = shipRefStar(ship);
        let here = rel(shipPointAhead(ship, drawAhead), ref);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.beginPath();
        // A marker, not a body: sized in screen pixels rather than AU.
        ctx.arc(pX(here), pY(here), starConstants.SHIP_DOT_PX / mapScale, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    }

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.font = `20px serif`;
    // Ship names — a fleet is labelled by its size rather than by whichever member happens to be first.
    for (let mark of shipMarks) {
        if (mapScale < starConstants.planetLabelMinScale){ continue; }   // zoomed out: show only star labels

        ctx.fillStyle = mark.foe ? "#ff5555" : "#009aff";
        let ship = mark.ship;
        let ref = shipRefStar(ship);
        let here = rel(shipPointAhead(ship, drawAhead), ref);
        ctx.save();
        ctx.translate(pX(ref), pY(ref));
        ctx.scale(1 / mapScale, 1 / mapScale);
        // Offset in screen pixels too, so the name sits by the dot at every zoom instead of
        // drifting further out the further you zoom in.
        let label = mark.count > 1 ? loc(mark.cargo ? 'outer_shipyard_cargo_fleet_map' : 'outer_shipyard_fleet_map',[mark.count]) : ship.name;
        ctx.fillText(label, pX(here) * mapScale + starConstants.SHIP_LABEL_PX, pY(here) * mapScale - starConstants.SHIP_LABEL_PX);
        ctx.restore();
    }

    // Signal names, in the same green as their dots and offset the same way the ship names are.
    {
        ctx.fillStyle = `rgb(${starConstants.BEACON_COLOR})`;
        for (let beacon of liveBeacons()){
            let ref = genXYZcoord(beacon.s || 'spc_sun');
            if (starCulled(ref)){ continue; }
            let here = rel({ x: beacon.x, y: beacon.y, z: beacon.z }, ref);
            ctx.save();
            ctx.translate(pX(ref), pY(ref));
            ctx.scale(1 / mapScale, 1 / mapScale);
            ctx.fillText(beacon.n, pX(here) * mapScale + starConstants.BEACON_LABEL_PX, pY(here) * mapScale - starConstants.BEACON_LABEL_PX);
            ctx.restore();
        }
    }

    ctx.fillStyle = "#ffa500";
    ctx.font = `25px serif`;
    ctx.textAlign = 'center';   // labels are centered horizontally above the item they label
    // Planet labels clutter once zoomed out past labelMinScale, so they are hidden below it; star labels are kept (stars
    // stay visible at any zoom).

    // If we're zoomed out too much then there's no point in drawing names - none will be legible anyway
    if (!starNamesHidden()) {
        // Scale the text to normal to prevent rendering bugs with font sizes below 0.01px. 
        // Cap the scale to starConstants.systemLabelMinScale to prevent text being cluttered with multiple systems on screen
        ctx.save();
        if (mapScale > starConstants.systemLabelMinScale)
            ctx.scale(1 / mapScale, 1 / mapScale);
        else
            ctx.scale(1 / starConstants.systemLabelMinScale, 1 / starConstants.systemLabelMinScale);
        for (const id of mapHomeIds) {
            if (homeCulled){ break; }
            if (!mapView().planetNames){ break; }
            const planet = starData[id];
            if (planet.startype){ continue; }   // all star labels handled separately (below)
            if (mapScale < starConstants.planetLabelMinScale){ continue; }   // zoomed out: planet names give way to star labels
            if (actions.space[id] && (actions.space[id].info.showDest ? actions.space[id].info.showDest().l : global.settings.space[id.substring(4)]) ){
                // bodyName() rather than the action's own name, so the wreck of the home world is
                // labelled as the debris field it is drawn as instead of as the planet it was.
                let nameText = bodyName(id);
                if (!nameText){ continue; }
                let lx = pX(planetLocation[id]), ly = pY(planetLocation[id]);
                mapLabelled[id] = true;   // so the hover label knows not to repeat this one
                if (planet.moon) {
                    // Sit clear of the moon by a screen-constant gap rather than the old fixed map offset, which drifted further from the
                    // body the further you zoomed in and, at the zoom where a moon separates from its planet, put the name off-screen.
                    ctx.fillText(nameText, lx * mapScale + starConstants.MOON_LABEL_GAP_PX, ly * mapScale);
                } else {
                    ctx.fillText(nameText, lx * mapScale, (ly - (0.2 * planet.size)) * mapScale);
                }
            }
        }
        // The Sun's label (home frame, at the origin): the cluster name (label) when zoomed out, and the
        // per-star name (zlabel) when zoomed in — opposite zoom ranges, so exactly one shows.
        {
            let sunText = mapScale < starConstants.planetLabelMinScale ? starData.spc_sun.label : starData.spc_sun.zlabel;
            if (sunText && !homeCulled && namesShown().stars){
                // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label
                // stays close to the star at any zoom.
                ctx.fillText(sunText, pX(planetLocation.spc_sun) * mapScale, (pY(planetLocation.spc_sun) - Math.max(starData.spc_sun.size * mapScale / 10, 1) + 2));
            }
        }
        // Undo text scaling
        ctx.restore();
    }

    
// Star Systems
    let starOrder = [];
    const cullRange = starRange();   // read once for the whole catalogue, not once per star
    for (const starId of mapStarIds){
        if (starId === 'spc_sun'){ continue; }
        const pos = genXYZcoord(starId);
        if (starCulled(pos, cullRange)){ continue; }
        // Draw the system only for stars near what is being looked at, not for every star still on screen.
        if (dist3(pos, mapFocus) <= starConstants.STAR_CULL_AU){ starSystem(starId); }
        starOrder.push({ id: starId, star: starData[starId], pos, d: pD(pos) });
    }
    starOrder.sort((a,b) => b.d - a.d);
    // Read once for the whole pass. `global` is a Vue reactive proxy, so each of these is a trap
    // call, and inside the per-star loops they were being paid tens of thousands of times a frame.
    const showPlanetOrbits = mapView().planetOrbits, showMoonOrbits = mapView().moonOrbits;
    const showPlanetNames = mapView().planetNames;
    const showStarNames = namesShown().stars;
    const namesHidden = starNamesHidden();
    for (let { id: starId, star, pos: sc } of starOrder) {
        ctx.save();
        ctx.translate(pX(sc), pY(sc));
        ctx.shadowColor = 'transparent';

        // Orbits of bodies around this star. Traced through orbitPoint in the star's own frame, so the eccentricity, off-centre
        // focus and inclination all come from the one place that positions the bodies themselves.
        const bodies = mapBodiesOf[starId] || [];
        // How far a body reads from whatever it circles, which for a moon is the exaggerated radius its orbit is actually drawn
        // Use the drawn orbit radius so moon rings and bodies appear at the same scale.
        const spread = (id, planet) => planet.parent ? orbitRadius(id) : planet.dist;
        // Split by what each ring is centred on, exactly as the home system does it.
        let starOrbits = [], moonOrbits = {}, moonPrimary = {};
        for (const id of bodies){
            const planet = starData[id];
            if (planet.parent ? !showMoonOrbits : !showPlanetOrbits){ continue; }
            if (planet.unlock && !global.tech[planet.unlock]){ continue; }
            if (spread(id, planet) * mapScale < starConstants.ORBIT_MIN_PX){ continue; }
            if (planet.parent){
                (moonOrbits[planet.parent] || (moonOrbits[planet.parent] = [])).push(id);
                if (!moonPrimary[planet.parent]){ moonPrimary[planet.parent] = genXYZcoord(planet.parent); }
            }
            else { starOrbits.push(id); }
        }
        if (star.hidden){
            ctx.lineWidth = 1 / mapScale;
            ctx.strokeStyle = "#c0c0c0";
            for (let id of starOrbits){
                ctx.setLineDash(starData[id].belt ? [0.01, 0.01] : []);
                strokeOrbit(ctx, id, sc);
            }
            ctx.setLineDash([]);
        }

        // The star and everything orbiting it, drawn back to front.
        let orbiting = [];
        for (const id of bodies){
            const planet = starData[id];
            if (planet.unlock && !global.tech[planet.unlock]){ continue; }
            if (!planet.bodystar && spread(id, planet) * mapScale < starConstants.SYSTEM_MIN_PX){ continue; }
            orbiting.push(id);
        }
        let scale = star.hidden ? 1 : systemScale(star.size, orbiting, sc);
        let members = [];
        for (let id of orbiting) {
            let planet = starData[id];
            let q = rel(genXYZcoord(id), sc);
            let pr = planet.size / 10 * scale;
            let sep = Math.hypot(pX(q), pY(q)) * mapScale;   // how far it reads from its star
            pr = planet.bodystar ? Math.max(pr, 1 / mapScale)
                                 : visibleRadius(pr, sep);
            members.push({ id, planet, q, pr, sep });
        }
        if (!star.hidden){
            members.push({ id: starId, planet: star, q: { x: 0, y: 0, z: 0 }, isStar: true,
                pr: Math.max(star.size / 10 * scale, 1 / mapScale) });
        }
        members.sort((a,b) => pD(b.q) - pD(a.q));   // furthest first
        // Every far half goes down before any body does, the same order the home system uses: a body on the far side of its
        // orbit is drawn before its primary, so laying that half down later would run the line over the world riding on it.
        if (starOrbits.length){ strokeOrbitGroup(ctx, starOrbits, sc, sc, false); }
        for (const parent of Object.keys(moonOrbits)){
            strokeOrbitGroup(ctx, moonOrbits[parent], sc, moonPrimary[parent], false);
        }
        // Any belt around this star, drawn in the star's own frame — same table, same code (see the
        // matching pass in the Sun's frame above).
        for (const id of bodies){
            drawAsteroidField(ctx, id, sc, scale, setColor(id));
        }
        for (let m of members){
            let px = pX(m.q), py = pY(m.q);
            drawBody(ctx, px, py, m.pr, setColor(m.id), { id: m.id, sun: sunDirection(m.q), star: m.isStar || !!m.planet.bodystar, kind: bodyKind(m.planet, m.id), seed: texSeed(m.id), rings: hasRings(m.planet, m.id), ringTilt: ringTilt(m.planet, m.id), glyph: cowGlyph(m.id), lumpy: bodyLumpy(m.planet, m.id) });
            if (m.isStar && starOrbits.length){ strokeOrbitGroup(ctx, starOrbits, sc, sc, true); }
            // The near half of each moon ring, drawn first so it doesn't disappear behind it.
            if (moonOrbits[m.id]){ strokeOrbitGroup(ctx, moonOrbits[m.id], sc, moonPrimary[m.id], true); }
            // Drawn in the star's own translated frame, so shift back to map coordinates to record it.
            addPickable(m.id, pX(sc) + px, pY(sc) + py, m.pr, m.sep);
            // Tau Ceti's jump gate rides alongside the home planet like a moon.
            if (m.id === 'tau_home' && tauJumpGate()){
                drawBody(ctx, px + m.pr * 0.9, py + m.pr * 0.9, m.pr * 0.35, '31a557', { gate: true, seed: texSeed('tau_home_jump_gate') });
            }
        }

        // Names
        // If we're zoomed out too much then there's no point in drawing names - none will be legible anyway
        if (!namesHidden) {
            ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 2; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillStyle = "#ffa500";
            ctx.font = `25px serif`;
            if (mapScale > starConstants.systemLabelMinScale)
                ctx.scale(1 / mapScale, 1 / mapScale);
            else
                ctx.scale(1 / starConstants.systemLabelMinScale, 1 / starConstants.systemLabelMinScale);
            // Cluster name (label) when zoomed out; per-star name (zlabel, which distinguishes companions
            // like "Sirius A" / "Sirius B") when zoomed in. Opposite zoom ranges, so at most one shows.
            {
                let starText = mapScale < starConstants.planetLabelMinScale ? star.label : star.zlabel;
                // Sit just above the drawn dot (its radius + a small screen-constant gap) so the label stays close to the star at any
                // zoom.
                if (starText && showStarNames){ ctx.fillText(starText, 0, -(Math.max(star.size / 10 * scale * mapScale, 1) + 2)); }
            }
            // Labels for bodies that are themselves stars (e.g. a binary orbiting an invisible barycenter):
            // label when zoomed out, zlabel when zoomed in — drawn just above the body at its orbit position.
            for (const id of bodies) {
                const planet = starData[id];
                if (!planet.bodystar || !showStarNames){ continue; }
                let bt = mapScale < starConstants.planetLabelMinScale ? planet.label : planet.zlabel;
                if (!bt){ continue; }
                let q = rel(genXYZcoord(id), sc);
                ctx.fillText(bt, pX(q) * mapScale, pY(q) * mapScale - (Math.max(planet.size / 10 * scale * mapScale, 1) + 2));
            }
            // Tau Ceti's worlds are named on the map because they are places the player builds on.
            if (showPlanetNames && mapScale >= starConstants.planetLabelMinScale){
                for (const id of bodies) {
                    const planet = starData[id];
                    if (planet.unlock && !global.tech[planet.unlock]){ continue; }
                    if (!actions.tauceti[id] || !actions.tauceti[id].info){ continue; }
                    mapLabelled[id] = true;   // so the hover label knows not to repeat this one
                    let q = rel(genXYZcoord(id), sc);
                    ctx.fillText(actions.tauceti[id].info.name(), pX(q) * mapScale, (pY(q) - (0.2 * planet.size)) * mapScale);
                }
            }
        }

        ctx.restore();
    }

    // Whatever the pointer is resting on, named beside the cursor.
    if (mapHover && starData[mapHover]){
        let name = hoverName(mapHover);
        let p = genXYZcoord(mapHover);
        if (name && !starCulled(p)){
            ctx.save();
            ctx.setTransform(1,0,0,1,0,0);
            ctx.font = `${starConstants.HOVER_LABEL_PX}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = "#ffffff";
            ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.fillText(name, mapHoverAt.x, mapHoverAt.y - starConstants.HOVER_LABEL_GAP_PX);
            ctx.restore();
        }
    }

    ctx.restore();
    // Hand the frame's batched geometry to the GPU. No-op on the 2D path, which has already drawn.
    if (ctx.endFrame){ ctx.endFrame(); }
}

var beaconTimer = false;
function beaconAnimate(){
    if (beaconTimer){
        clearInterval(beaconTimer);
        beaconTimer = false;
    }
    if (liveBeacons().length === 0){ return; }
    beaconTimer = setInterval(function(){
        if (!document.getElementById('mapCanvas') || liveBeacons().length === 0){
            clearInterval(beaconTimer);
            beaconTimer = false;
            return;
        }
        // On Fast the map runs a timer of its own at more than twice this rate, so painting here as well would put a second
        // frame over the top of every one of its own for nothing.
        if (mapRefreshRate() === 'fast' && !webWorker.offline){ return; }
        drawMap();
    }, Math.round(1000 / starConstants.BEACON_FPS));
}

// Where the map was built, so switching renderers can rebuild it in place.
var mapHost = false;

// Rebuild the map with the other renderer, holding the view exactly where the player left it. Only
// the backend changes; what gets drawn, and the code that draws it, are the same either way.
function rebuildSolarMap(){
    if (!mapHost || !mapHost.length){ return; }
    let keep = {
        scale: mapScale, shift: { x: mapShift.x, y: mapShift.y },
        yaw: mapYaw, pitch: mapPitch, focus: mapFocus, lock: starLockOn
    };
    if (mapCtx && mapCtx.destroy){ mapCtx.destroy(); }
    mapCtx = false;
    mapCtxFor = false;
    buildSolarMap(mapHost, keep);
}

export function buildSolarMap(parentNode, keep, openAt) {
    // A rebuild replaces the previous map wholesale rather than stacking a second one under it.
    parentNode.find('.solarMapHost').remove();
    let currentNode = $(`<div class="solarMapHost" style="margin-top: 10px; margin-bottom: 10px;"></div>`).appendTo(parentNode);
    mapHost = parentNode;
    let canvasOffset = {};
    let dragOffset = {};
    let spin = {};
    let drag = false;       // false | 'pan' | 'rotate'
    let press = false;      // the in-flight left press, for telling a click from a pan
    const CLICK_SLOP_PX = 3;
    mapShift = {};
    mapScale = 20.0;
    mapHover = false;
    // The map always opens level, however it was left last time. Which way it faces is settled
    // below, once the star it is opening on is known (see mapDefaultYaw).
    mapYaw = 0;
    mapPitch = 0;
    camUpdate();

    // Radians of camera rotation per pixel dragged. A full turn takes a little under a screen width,
    // which is fast enough to be exploratory without overshooting on a small nudge.
    const ROTATE_RATE = 0.008;

    // The camera orbits a focus point rather than the origin.

    // Inverse of pX/pY/pD: a projected point at a given depth, back in world space. The camera basis
    // is orthonormal, so this is just the transpose applied to (px, py, depth).
    function unproject(px, py, depth){
        return {
            x: px * camCY + py * camSY * camCP + depth * camSY * camSP,
            y: py * camCY * camCP + depth * camCY * camSP - px * camSY,
            z: depth * camCP - py * camSP
        };
    }
    // Re-read the focus after a pan. Sideways it simply follows the viewport centre, but the depth along the view axis is
    // unconstrained under an orthographic camera, so it is taken from the star nearest the new centre.
    function refocus(){
        let px = (canvasOffset.x - mapShift.x) / mapScale;
        let py = (canvasOffset.y - mapShift.y) / mapScale;
        let depth = pD(mapFocus), best = Infinity;
        // Off the star index rather than the whole table: this runs on every pan and zoom.
        for (const id of starIndex()){
            if (starData[id].hidden){ continue; }
            let p = genXYZcoord(id);
            let off = Math.hypot(pX(p) - px, pY(p) - py);
            if (off < best){ best = off; depth = pD(p); }
        }
        mapFocus = unproject(px, py, depth);
    }
    function recenterOn(pt){
        mapFocus = pt;
        mapShift.x = canvasOffset.x - pX(pt) * mapScale;
        mapShift.y = canvasOffset.y - pY(pt) * mapScale;
    }

    // The id of the star under the pointer, or false.
    const CLICK_GRAB_PX = 10;
    function starAt(e){
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        let best = false, bestD = Infinity;
        for (const id of drawnAsStarIndex()){
            const body = starData[id];
            if (body.hidden){ continue; }
            let p = genXYZcoord(id);
            if (starCulled(p)){ continue; }
            let d = Math.hypot(mapShift.x + pX(p) * mapScale - cx, mapShift.y + pY(p) * mapScale - cy);
            // The radius it was really drawn at, not the one its table entry implies. The fallback is
            // only for a star the last frame never laid down, which starCulled has already skipped.
            let r = starDrawnAt[id] === undefined ? body.size / 10 : starDrawnAt[id];
            if (d <= Math.max(CLICK_GRAB_PX, r * mapScale) && d < bestD){
                bestD = d;
                best = id;
            }
        }
        return best;
    }

    // The body under the pointer, or false. Unlike starAt this picks planets and moons as well, from
    // whatever drawMap last laid down. Nearest centre wins.
    function bodyAt(e, naming){
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        let best = false, bestD = Infinity;
        for (let body of mapPickable){
            if (body.nameOnly && !naming){ continue; }
            let d = Math.hypot(body.x - cx, body.y - cy);
            // Eligibility is about detail, but the grab is about aim: a world you can see is worth
            // hitting from the same distance a star is, or a small one takes several tries.
            if (d <= Math.max(body.r, CLICK_GRAB_PX) && d < bestD){
                bestD = d;
                best = body.id;
            }
        }
        return best;
    }

    // The body the pointer should be naming.
    function nameTarget(e){
        let id = bodyAt(e, true);
        if (!id){ return false; }
        for (let step = 0; step < 4; step++){
            let hit = mapPickable.find(p => p.id === id);
            let body = starData[id];
            if (!hit || !hit.merged || !body || body.startype){ break; }
            let up = body.parent || body.star || 'spc_sun';
            if (up === id){ break; }
            id = up;
        }
        return id;
    }

    // Track what the pointer is over so drawMap can name it, repainting only when the answer changes —
    // a mousemove that is still over the same star costs nothing.
    function trackHover(e){
        let over = starLabelsOff() ? starAt(e) : false;
        // Failing a star, any body the map has drawn but left unnamed.
        if (!over){
            let body = nameTarget(e);
            if (body && hoverName(body)){ over = body; }
        }
        let rect = document.getElementById("mapCanvas").getBoundingClientRect();
        let at = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // Repaint when the star changes and, while one is hovered, as the pointer moves — the label has
        // to follow the cursor to stay above it.
        let shifted = over && (at.x !== mapHoverAt.x || at.y !== mapHoverAt.y);
        mapHoverAt = at;
        if (over !== mapHover || shifted){
            mapHover = over;
            drawMap();
        }
    }
    function clearHover(){
        if (mapHover){
            mapHover = false;
            drawMap();
        }
    }

    // Touch Input
    function touchMap(){ return global.settings['touch'] ? true : false; }
    // Below this a pinch is finger jitter rather than an attempt to zoom; without it a two-finger
    // slide zooms slightly the whole way.
    const PINCH_SLOP_PX = 4;
    let touching = false;       // false | 'pan' | 'camera'
    let tap = false;            // the opening finger, for telling a tap from a drag
    let gesture = {};
    function touchMid(t){ return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }
    function touchGap(t){ return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
    // Zoom about the middle of the viewport, which is where the camera's focus already sits — the
    // same arithmetic the wheel uses when locked onto a star.
    function zoomCentre(factor){
        mapScale *= factor;
        mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * factor;
        mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * factor;
    }

    currentNode.append(
      $(`<canvas id="mapCanvas" style="width: 100%; height: 75vh;${global.settings['touch'] ? ' touch-action: none;' : ''}"></canvas>`)
        // A left press that ends without the pointer really moving is a click, not a pan: if it landed on a body, centre the
        // view on it.
        .on("mouseup", (e) => {
            if (drag === 'pan' && press && !press.moved){
                let hit = starAt(e) || bodyAt(e);
                if (hit){
                    // Lock on so zooming pulls in on it rather than following the cursor away.
                    // Draw after to immediately recenter on clicked body
                    starLockOn = hit;
                    recenterOn(genXYZcoord(hit));
                    drawMap();
                    if (cowGlyph(hit)){
                        unlockFeat('secret_cow', global.race.universe === 'micro' ? true : false);
                    }
                }
            }
            drag = false;
            press = false;
            // Letting the camera go settles it back to full detail, in a single draw.
            if (mapCameraMoving){ mapCameraMoving = false; drawMap(); }
        })
        .on("mouseover mouseout", () => { drag = false; press = false; clearHover();
            if (mapCameraMoving){ mapCameraMoving = false; drawMap(); } })
        // Right-drag (or shift-drag, for anyone on a trackpad without a right button) orbits the
        // camera; plain left-drag still pans, exactly as it did before the map had a third axis.
        .on("contextmenu", () => false)
        .on("mousedown", (e) => {
            if (e.which === 3 || e.shiftKey){
                drag = 'rotate';
                spin.x = e.clientX; spin.y = e.clientY;
                spin.yaw = mapYaw; spin.pitch = mapPitch;
                return false;
            }
            drag = 'pan';
            press = { x: e.clientX, y: e.clientY, moved: false };
            dragOffset.x = e.clientX - mapShift.x;
            dragOffset.y = e.clientY - mapShift.y;
        })
        .on("mousemove", (e) => {
            if (drag === 'pan') {
                if (press && (Math.abs(e.clientX - press.x) > CLICK_SLOP_PX || Math.abs(e.clientY - press.y) > CLICK_SLOP_PX)){
                    press.moved = true;
                    starLockOn = false; // Unlock from a star if one is locked into, making scroll zooming follow cursor again
                }
                mapShift.x = e.clientX - dragOffset.x;
                mapShift.y = e.clientY - dragOffset.y;
                refocus();
                requestDraw();
            }
            else if (drag === 'rotate') {
                mapYaw = wrapAngle(spin.yaw + (e.clientX - spin.x) * ROTATE_RATE);
                mapPitch = wrapAngle(spin.pitch + (e.clientY - spin.y) * ROTATE_RATE);
                mapCameraMoving = true;
                camUpdate();
                recenterOn(mapFocus);
                requestDraw();
            }
            else {
                trackHover(e);
            }
        })
        .on("wheel", (e) => {
            if(e.originalEvent.deltaY < 0) {
                mapScale /= 0.8;

                if (starLockOn) {
                    // Zoom wrt center of screen, keeping locked star in the center
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;
                }
                else {
                    // Zoom wrt cursor position, moving center of screen as needed
                    let rect = document.getElementById("mapCanvas").getBoundingClientRect();
                    let cx = e.originalEvent.clientX - rect.left, cy = e.originalEvent.clientY - rect.top;

                    //temporarily shift to cursor location
                    mapShift.x += (canvasOffset.x - cx);
                    mapShift.y += (canvasOffset.y - cy);
                    
                    //zoom, centered on cursor location
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;

                    //shift back to original location
                    mapShift.x -= (canvasOffset.x - cx);
                    mapShift.y -= (canvasOffset.y - cy);
                    refocus();
                }
                drawMap();
            }
            else {
                mapScale *= 0.8;

                if (starLockOn) {
                    // Zoom wrt center of screen, keeping locked star in the center
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;
                }
                else {
                    // Zoom wrt cursor position, moving center of screen as needed
                    let rect = document.getElementById("mapCanvas").getBoundingClientRect();
                    let cx = e.originalEvent.clientX - rect.left, cy = e.originalEvent.clientY - rect.top;

                    //temporarily shift to cursor location
                    mapShift.x += (canvasOffset.x - cx);
                    mapShift.y += (canvasOffset.y - cy);
                    
                    //zoom, centered on cursor location
                    mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
                    mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;

                    //shift back to original location
                    mapShift.x -= (canvasOffset.x - cx);
                    mapShift.y -= (canvasOffset.y - cy);
                    refocus();
                }
                drawMap();
            }
            return false;
        })
        .on("touchstart", (e) => {
            if (!touchMap()){ return; }
            let t = e.originalEvent.touches;
            if (t.length === 1){
                touching = 'pan';
                tap = { x: t[0].clientX, y: t[0].clientY, moved: false };
                dragOffset.x = t[0].clientX - mapShift.x;
                dragOffset.y = t[0].clientY - mapShift.y;
            }
            else if (t.length === 2){
                // A second finger down ends any tap in progress: this is a camera gesture now.
                touching = 'camera';
                tap = false;
                let mid = touchMid(t);
                gesture = { gap: touchGap(t), x: mid.x, y: mid.y, yaw: mapYaw, pitch: mapPitch };
            }
            return false;
        })
        .on("touchmove", (e) => {
            if (!touchMap()){ return; }
            let t = e.originalEvent.touches;
            if (touching === 'pan' && t.length === 1){
                if (tap && (Math.abs(t[0].clientX - tap.x) > CLICK_SLOP_PX || Math.abs(t[0].clientY - tap.y) > CLICK_SLOP_PX)){
                    tap.moved = true;
                    starLockOn = false;
                }
                mapShift.x = t[0].clientX - dragOffset.x;
                mapShift.y = t[0].clientY - dragOffset.y;
                refocus();
                drawMap();
            }
            else if (touching === 'camera' && t.length === 2){
                // The two are independent components of the same two-finger move, so both are read every frame: the gap between the
                // fingers zooms, and where the pair as a whole has travelled orbits, exactly as dragging with the right button does.
                let gap = touchGap(t);
                let mid = touchMid(t);
                if (gesture.gap > 0 && Math.abs(gap - gesture.gap) > PINCH_SLOP_PX){
                    zoomCentre(gap / gesture.gap);
                    gesture.gap = gap;
                }
                mapYaw = wrapAngle(gesture.yaw + (mid.x - gesture.x) * ROTATE_RATE);
                mapPitch = wrapAngle(gesture.pitch + (mid.y - gesture.y) * ROTATE_RATE);
                mapCameraMoving = true;
                camUpdate();
                recenterOn(mapFocus);
                drawMap();
            }
            return false;
        })
        // A finger that lifts without having really moved is a tap, and does what a click does.
        .on("touchend touchcancel", (e) => {
            if (!touchMap()){ return; }
            let lifted = e.originalEvent.changedTouches;
            if (touching === 'pan' && tap && !tap.moved && lifted && lifted.length){
                let hit = starAt(lifted[0]) || bodyAt(lifted[0]);
                if (hit){
                    recenterOn(genXYZcoord(hit));
                    drawMap();
                    starLockOn = hit;
                    if (cowGlyph(hit)){
                        unlockFeat('secret_cow', global.race.universe === 'micro' ? true : false);
                    }
                }
            }
            // Lifting one of two fingers leaves the other one panning rather than stranding the map
            // mid-gesture, so the pan is re-seated from where that finger actually is.
            let left = e.originalEvent.touches;
            if (left && left.length === 1){
                touching = 'pan';
                tap = false;
                dragOffset.x = left[0].clientX - mapShift.x;
                dragOffset.y = left[0].clientY - mapShift.y;
            }
            else if (!left || left.length === 0){
                touching = false;
                tap = false;
                // Letting the camera go settles it back to full detail, in a single draw.
                if (mapCameraMoving){ mapCameraMoving = false; drawMap(); }
            }
            return false;
        }),
      $(`<input type="button" value="+" style="position: absolute; width: 30px; height: 30px; bottom: 34px; right: 2px;">`)
        .on("click", () => {
            mapScale /= 0.8;
            mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) / 0.8;
            mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) / 0.8;
            drawMap();
        }),
      $(`<input type="button" value="-" style="position: absolute; width: 30px; height: 30px; bottom: 2px; right: 2px;">`)
        .on("click", () => {
            mapScale *= 0.8;
            mapShift.x = canvasOffset.x + (mapShift.x - canvasOffset.x) * 0.8;
            mapShift.y = canvasOffset.y + (mapShift.y - canvasOffset.y) * 0.8;
            drawMap();
        }),
    );

    // Keep system shortcuts together so translated labels do not need fixed offsets.
    const systemNav = $('<div class="mapSystemNav" style="position: absolute; top: 2px; left: 2px; display: flex; gap: 4px;"></div>').appendTo(currentNode);
    $(`<input type="button" value="${loc('space_sun_info_name')}" style="height: 30px;">`)
        .on("click", () => {
            mapScale = 20.0;
            mapYaw = mapDefaultYaw('spc_sun');
            starLockOn = 'spc_sun';
            camUpdate();
            recenterOn(genXYZcoord('spc_sun'));
            drawMap();
        })
        .appendTo(systemNav);

    // Center on Tau Ceti once its system is unlocked.
    if (global.tech['tau_home'] && global.tech.tau_home >= 2){
        $(`<input type="button" value="${loc('tab_tauceti')}" style="height: 30px;">`)
            .on("click", () => {
                mapScale = 20.0;
                mapYaw = mapDefaultYaw('tauceti');
                starLockOn = 'tauceti';
                camUpdate();
                recenterOn(genXYZcoord('tauceti'));
                drawMap();
            })
            .appendTo(systemNav);
    }

    // --- Find a star ------------------------------------------------------------------------------
    const SEARCH_RESULTS_MAX = 8;

    // Everything drawn as a star, which takes in the components that orbit an invisible barycenter
    // (Gliese 570 B and C, the Epsilon Indi brown dwarfs).
    function searchableStars(){
        let out = [];
        for (const id of drawnAsStarIndex()){
            const body = starData[id];
            if (body.hidden){ continue; }
            // zlabel names the component ("Sirius A"), label the system ("Sirius").
            const name = body.zlabel || body.label;
            if (!name){ continue; }
            out.push({ id, name, alt: body.label && body.label !== name ? body.label : '' });
        }
        return out;
    }

    function searchMatches(query){
        const q = String(query || '').trim().toLowerCase();
        if (!q){ return []; }
        let hits = [];
        for (const s of searchableStars()){
            let at = s.name.toLowerCase().indexOf(q);
            if (at < 0 && s.alt){ at = s.alt.toLowerCase().indexOf(q); }
            if (at < 0){ continue; }
            // Distance is measured from the coordinates rather than read off `dist`: for a component that orbits a barycenter `dist`
            // is the radius of that little orbit, not how far away the thing is, and reporting 0.4 ly for Gliese 570 B would be nonsense.
            const pos = genXYZcoord(s.id);
            hits.push({ id: s.id, name: s.name, pre: at === 0 ? 0 : 1,
                        ly: Math.hypot(pos.x, pos.y, pos.z) / starConstants.AU_PER_LY });
        }
        // Names that BEGIN with what was typed come first, and everything after that is ordered by
        // distance from the sun.
        hits.sort((a,b) => (a.pre - b.pre) || (a.ly - b.ly) || a.name.localeCompare(b.name));
        return hits.slice(0, SEARCH_RESULTS_MAX);
    }

    let searchHits = [], searchSel = 0, searchRows = [];
    const SEARCH_SEL_BG = 'rgba(255,165,0,0.25)';
    let searchPanel = $(`<div class="mapSearch" style="position: absolute; top: 2px; right: 36px; display: ${mapSearchOpen ? 'block' : 'none'}; padding: 6px; background: rgba(0,0,0,0.75); border: 1px solid #999; width: 15em; max-width: calc(100% - 40px);"></div>`);
    let searchInput = $(`<input type="text" class="mapSearchInput" aria-label="${loc('solar_map_search')}" placeholder="${loc('solar_map_search_hint')}" style="width: 100%; height: 26px; box-sizing: border-box;">`);
    let searchList = $(`<div class="mapSearchResults" style="margin-top: 4px; max-height: 13em; overflow-y: auto;"></div>`);
    searchPanel.append(searchInput, searchList);
    searchInput.val(mapSearchQuery);

    // Moving the highlight only restyles the rows that are already there.
    function highlightSearch(){
        searchRows.forEach(function(row, i){
            row.css('background', i === searchSel ? SEARCH_SEL_BG : 'transparent');
        });
        // Keep the selection visible when the arrow keys walk it past the edge of the scroll box.
        let row = searchRows[searchSel];
        if (!row || !row[0] || !row[0].scrollIntoView){ return; }
        let box = searchList[0], top = row[0].offsetTop, bottom = top + row[0].offsetHeight;
        if (top < box.scrollTop){ box.scrollTop = top; }
        else if (bottom > box.scrollTop + box.clientHeight){ box.scrollTop = bottom - box.clientHeight; }
    }

    function renderSearch(){
        clearElement(searchList);
        searchRows = [];
        if (!searchHits.length){
            // Only say there is nothing once something has actually been asked for; an empty box has
            // simply not been used yet.
            if (searchInput.val().trim()){
                $(`<div style="padding: 2px 4px; opacity: 0.7;">${loc('solar_map_search_none')}</div>`).appendTo(searchList);
            }
            return;
        }
        searchHits.forEach(function(hit, i){
            searchRows.push(
                $(`<div class="mapSearchHit" style="padding: 2px 4px; cursor: pointer; display: flex; justify-content: space-between; gap: 8px;"><span>${hit.name}</span><span style="opacity: 0.7; white-space: nowrap;">${loc('solar_map_search_ly',[hit.ly < 10 ? hit.ly.toFixed(1) : Math.round(hit.ly)])}</span></div>`)
                    .on('mouseenter', function(){ searchSel = i; highlightSearch(); })
                    .on('click', function(){ snapToStar(hit.id); })
                    .appendTo(searchList)
            );
        });
        highlightSearch();
    }

    // Centre on a star and lock the camera to it, exactly as clicking one on the map does — so the
    // next zoom pulls in on it rather than drifting off toward the pointer.
    function snapToStar(id){
        starLockOn = id;
        recenterOn(genXYZcoord(id));
        setSearchOpen(false);
        drawMap();
    }

    function setSearchOpen(open){
        mapSearchOpen = open;
        searchPanel.css('display', open ? 'block' : 'none');
        if (!open){ return; }
        // Re-run the query on the way in: the bodies have moved along their orbits since it was last
        // answered, so the distances would otherwise be stale.
        searchHits = searchMatches(searchInput.val());
        searchSel = 0;
        renderSearch();
        searchInput.trigger('focus').trigger('select');
    }

    searchInput.on('input', function(){
        mapSearchQuery = $(this).val();
        searchHits = searchMatches(mapSearchQuery);
        searchSel = 0;
        renderSearch();
    });
    searchInput.on('keydown', function(e){
        // Anything acted on here is stopped from travelling on. The game's own key handling already stands aside while an input
        // has focus, but the modal around the map does not, and Escape reaching it would shut the whole map instead of the search.
        if (e.key === 'Escape'){
            setSearchOpen(false);
            e.stopPropagation();
            e.preventDefault();
        }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
            if (!searchHits.length){ return; }
            searchSel = (searchSel + (e.key === 'ArrowDown' ? 1 : searchHits.length - 1)) % searchHits.length;
            highlightSearch();
            e.stopPropagation();
            e.preventDefault();
        }
        else if (e.key === 'Enter'){
            if (searchHits[searchSel]){ snapToStar(searchHits[searchSel].id); }
            e.stopPropagation();
            e.preventDefault();
        }
    });
    // Keep the pointer to itself. The camera's own handlers hang off the canvas element rather than this container, so they
    // Stop clicks from reaching the modal backdrop.
    searchPanel.on('mousedown mouseup click wheel touchstart', function(e){ e.stopPropagation(); });
    searchPanel.appendTo(currentNode);
    // Left open from last time — a renderer switch, or simply how the map was closed.
    if (mapSearchOpen){
        searchHits = searchMatches(mapSearchQuery);
        renderSearch();
    }

    $(`<input type="button" value="🔍" title="${loc('solar_map_search')}" aria-label="${loc('solar_map_search')}" style="position: absolute; width: 30px; height: 30px; top: 2px; right: 2px; padding: 0; font-size: 15px; line-height: 1;">`)
        .on("click", function(){ setSearchOpen(!mapSearchOpen); })
        .appendTo(currentNode);

    // Settings for the Star Map.
    let mapSettings = $(`<div class="mapSettings" style="position: absolute; bottom: 36px; left: 2px; display: ${mapSettingsOpen ? 'flex' : 'none'}; flex-direction: column; align-items: stretch; gap: 4px; padding: 6px; background: rgba(0,0,0,0.75); border: 1px solid #999; max-width: 15em;"></div>`);
    // Orbits: one button, four positions. See starConstants.ORBIT_STATES.
    $(`<input type="button" value="${orbitLabel()}" style="height: 30px;">`)
        .on("click", function(){
            cycleOrbits();
            $(this).val(orbitLabel());
            drawMap();
        })
        .appendTo(mapSettings);

    // Names: one button, three positions. See starConstants.NAME_STATES.
    $(`<input type="button" value="${nameLabel()}" style="height: 30px;">`)
        .on("click", function(){
            cycleNames();
            $(this).val(nameLabel());
            drawMap();
        })
        .appendTo(mapSettings);

    [
        // A busy campaign puts enough dots, trails and names over the inner system to hide the worlds
        // underneath them.
        ['ships', 'solar_map_show_ships', 'solar_map_hide_ships'],
        // The sky behind the system, once the real stars are off screen. See drawSkyStars.
        ['skyStars', 'solar_map_show_sky', 'solar_map_hide_sky'],
    ].forEach(function([key, shownKey, hiddenKey]){
        $(`<input type="button" value="${loc(mapView()[key] ? shownKey : hiddenKey)}" style="height: 30px;">`)
            .on("click", function(){
                mapView()[key] = !mapView()[key];
                $(this).val(loc(mapView()[key] ? shownKey : hiddenKey));
                drawMap();
            })
            .appendTo(mapSettings);
    });
    // How much of the star field to draw, alongside the other view settings.
    $(`<input type="button" value="${starRangeLabel()}" style="height: 30px;">`)
        .on("click", function(){
            // 10 through 50, then no limit, then back to 10.
            let cur = starRange();
            mapView().starRange = cur === starConstants.STAR_RANGE_INF ? starConstants.STAR_RANGE_MIN
                                : cur + starConstants.STAR_RANGE_STEP > starConstants.STAR_RANGE_MAX ? starConstants.STAR_RANGE_INF
                                : cur + starConstants.STAR_RANGE_STEP;
            $(this).val(starRangeLabel());
            drawMap();
        })
        .appendTo(mapSettings);

    // Surface detail. High draws the bodies that offer one as a lit sphere whose banding and features follow the camera,
    // instead of stamping a flat image on the disc.
    $(`<input type="button" value="${mapTextureLabel()}" style="height: 30px;">`)
        .on("click", function(){
            mapView().texture = mapTextureDetail() === 'high' ? 'low' : 'high';
            $(this).val(mapTextureLabel());
            drawMap();
        })
        .appendTo(mapSettings);

    // Which loop the map's simulation and redraw run on.
    $(`<input type="button" value="${mapRefreshLabel()}" style="height: 30px;">`)
        .on("click", function(){
            const order = ['normal','fast','slow'];
            const at = order.indexOf(mapRefreshRate());
            mapView().refresh = order[(at + 1) % order.length];
            $(this).val(mapRefreshLabel());
            drawMap();
        })
        .appendTo(mapSettings);

    // Which backend paints the map. WebGL (GPU) or Canvad (CPU)
    if (webglSupported()){
        $(`<input type="button" value="${loc(mapRenderer() === 'webgl' ? 'solar_map_renderer_webgl' : 'solar_map_renderer_canvas')}" style="height: 30px;">`)
            .on("click", function(){
                mapView().webgl = !mapView().webgl;
                // The canvas has to be replaced to change context type, so the whole map is rebuilt
                // around the player's current view rather than merely repainted.
                rebuildSolarMap();
            })
            .appendTo(mapSettings);
    }
    mapSettings.appendTo(currentNode);

    $(`<input type="button" value="⚙︎" title="${loc('solar_map_settings')}" aria-label="${loc('solar_map_settings')}" style="position: absolute; bottom: 2px; left: 2px; width: 30px; height: 30px; padding: 0; font-size: 20px; line-height: 1;">`)
        .on("click", function(){
            mapSettingsOpen = !mapSettingsOpen;
            mapSettings.css('display', mapSettingsOpen ? 'flex' : 'none');
        })
        .appendTo(currentNode);

    // Put the camera back to its default angle without disturbing where the player has panned and zoomed to.
    $(`<input type="button" value="${loc('solar_map_reset_view')}" style="position: absolute; height: 30px; bottom: 2px; left: 36px;">`)
        .on("click", () => {
            mapYaw = mapDefaultYaw(nearestStar(mapFocus));
            mapPitch = 0;
            camUpdate();
            recenterOn(mapFocus);
            drawMap();
        })
        .appendTo(currentNode);

    let bounds = document.getElementById("mapCanvas").getBoundingClientRect();
    canvasOffset.x = bounds.width / 2;
    canvasOffset.y = bounds.height / 2;
    // The map open location depends on game state. Locked on as well as centred, so the first zoom pulls in on that star
    // instead of drifting off toward wherever the pointer happened to be resting.
    if (keep){
        // A renderer switch is not a fresh open: the camera, including the rotation an ordinary open deliberately levels, is put
        // back exactly as it was so the two can be compared frame for frame.
        mapScale = keep.scale;
        mapShift.x = keep.shift.x;
        mapShift.y = keep.shift.y;
        mapYaw = keep.yaw;
        mapPitch = keep.pitch;
        mapFocus = keep.focus;
        starLockOn = keep.lock;
        camUpdate();
    }
    else {
        const openOn = openAt ? nearestStar(openAt) : (global.tech['resettle'] && global.tech.resettle < 9 ? 'tauceti' : 'spc_sun');
        // Orient the map to the local star before centering on the ship.
        mapYaw = mapDefaultYaw(openOn);
        camUpdate();
        recenterOn(openAt || genXYZcoord(openOn));
        starLockOn = openAt ? false : openOn;
    }

    drawMap();
    beaconAnimate();
}
