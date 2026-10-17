# Sense — material and light study

Reference homepages inspected visually on 2026-10-12. These are design observations, not claims about their implementation. No reference site's artwork, product render, logo or animation was copied into the prototype.

| Reference | Observed detail | Application to the existing Hero |
| --- | --- | --- |
| [Linear](https://linear.app/) | Restrained dark canvas; subtle tone separation between the app frame, toolbar and content; fine edge boundaries. | Keep the existing terminal as the focal object. Give the window bar and body coherent gray values, with no extra content competing for attention. |
| [Apple MacBook Pro](https://www.apple.com/macbook-pro/) | Large graphite product forms revealed by broad reflected light and a narrow illuminated edge. | Give the terminal a broad soft reflection and a thin bevel; moving the pointer changes the perceived lighting and orientation together. |
| [Vercel](https://vercel.com/) | Monochrome hero with a central dark form, a localized luminous halo and substantial negative space. | Concentrate ambient illumination around the existing right-hand terminal. Keep the intro and surrounding whitespace calm. |

## Local result

- Preserve the existing two-column grid, heading size, intro, links and terminal information.
- Dark: graphite body, soft silver reflection, dim warm-neutral edge. Light: satin silver body and a grounded shadow.
- Fine static texture is an original procedural SVG; text uses the previously sourced JetBrains Mono font under its OFL license.
- Pointer interaction: maximum 1.8° pitch and 2.4° yaw, smoothed reflection and inverse shadow movement. No click reaction, new icon rail, floating code or idle loop.
- Reduced motion and coarse pointers retain the static material and readable content.
- Production homepage is unchanged. No commit, push or deployment is part of this iteration.
