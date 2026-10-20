# GLOW scroll interaction

Direction: scrolling is the interaction. No additional ambient-light switch. The hero has a moving warm aura, a fine orbital highlight and a bounded 36px depth movement. The comparison photograph crossfades from day to night as it moves up the viewport; reverse scrolling reverses the transition. No scroll interception, pinning or autoplay loop. Optional manual comparison stays in a disclosure; changing it takes precedence over scroll. AI image labels remain unchanged.

Research references:
- https://www.awwwards.com/inspiration/scroll-portfolio — scroll-led visual presentation reference.
- https://motion.dev/docs/react-scroll-animations — target-relative scroll values and transforms.
- https://webkit.org/blog/7551/responsive-design-for-motion/ — reduced-motion alternative.

Validation: 360/390/760/1280 viewport widths without horizontal overflow; scroll changes hero rotation and comparison opacity (0.04 / 0.52 / 1 at sampled mobile positions); reduced-motion initial preference gives stationary imagery and accessible manual range; production build passes. Browser emulation, not a physical-device performance certification.
