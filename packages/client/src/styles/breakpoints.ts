const size = {
  mobile: {
    sm: 320,
    md: 375,
    lg: 425,
  },
  tablet: 700,
  desktop: {
    sm: 1024,
    md: 1440,
    lg: 2560,
  },
};

export const breakpoints = {
  mobile: `@media only screen and (min-width: ${size.mobile.lg}px)`,
  tablet: `@media only screen and (min-width: ${size.tablet}px)`,
  laptop: `@media only screen and (min-width: ${size.desktop.sm}px)`,
  desktop: {
    sm: `@media only screen and (min-width: ${size.desktop.sm}px)`,
    md: `@media only screen and (min-width: ${size.desktop.md}px)`,
    lg: `@media only screen and (min-width: ${size.desktop.lg}px)`,
  },
};
