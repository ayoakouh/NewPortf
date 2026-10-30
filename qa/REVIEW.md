# Portfolio verification

## Automated checks

- TypeScript typecheck and Vite production build.
- Five engine tests: stride loading, same-shot fallback, scene lifecycle, blade/reverse endpoints, and non-overlapping project-copy dwells.
- 239 frames in each of two sizes: 478 WebP files, all checked for crop dimensions and an alpha channel.
- The public résumé matches the supplied PDF byte for byte.
- Chromium at 1600×900 and 390×844: 66 screenshots covering the preloader, introduction, three positions in every section, six blade midpoints, the Contact theme threshold, and cylinder endpoints.
- Full browser audit: no page errors, missing assets, horizontal overflow, or React commits during scrolling. Résumé delivery, Work navigation, and viewport resize passed.
- Focused follow-up reports refresh the changed Work, Toolkit, and Contact captures after visual corrections. The scripts use fresh browser contexts for each viewport.

See `report.json`, `report-work.json`, `report-skills.json`, `report-contact.json`, and `assets.json`. Individual screenshots are in `screenshots/`; overview sheets and red-background matte checks are in `contact-sheets/`.

## Visual corrections

- Removed gray floor-shadow remnants from the props matte; inspected native-resolution hair and shoes over bright red.
- Clipped the Work deck to its own viewport so departing cards cannot cover the heading or the character. The specified card opacity interpolation still applies within the deck during card changes. Each slot reserves 70% for reading; outgoing and incoming project copy fade in separate intervals to prevent title overlap.
- Restored Anton on achievement numbers after a label selector incorrectly overrode their font, and increased small label sizes.
- Used Fibonacci samples between the sphere poles so a skill chip is not permanently pinned across the character’s mouth.
- Raised the Work floor grid into the visible viewport.
- Kept a red Contact navigation surface behind the white text while the unrevealed side of the blade is still white.
- Reserved mobile footer space for the progress rail.

The contribution cylinder was checked at its start, middle, and end: it contains five front/back cards arranged as a ring. Scene captures were reviewed for lingering prior-section copy, title collisions, and mobile clipping. The diagonal frame split and offset poses during blade transitions follow the supplied rendering formula.

## Content boundaries

CGPA displays N/A. No certifications or graduation are claimed. NeetCode is linked without an unverified count. The HTTP server project uses the GitHub profile as its destination because no corresponding public repository was verified. Inception uses the populated `inception01` repository. The source performance contains the desk and laptop throughout all scenes.
