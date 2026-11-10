import styled from "styled-components";

export const BoxShadow = styled.div`
  box-shadow: var(--pane-shadow);
`;

export const spacings = {
  xs: "var(--xs)", // 4px
  sm: "var(--s)", // 8px
  md: "var(--m)", // 14px
  lg: "var(--l)", // 18px
  xl: "var(--xl)", // 24px
};

export const borderRadius = {
  sm: "var(--small-border-radius)", // 3px
  md: "var(--medium-border-radius)", // 4px
  lg: "var(--large-border-radius)", // 5px
};

export const shadows = {
  panel: "var(--freeform-panel-shadow, 0 0 20px 10px rgb(205 216 228 / 50%))",
  box: "var(--freeform-box-shadow, 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%))",
  boxSubtle: "0 2px 8px rgba(0, 0, 0, 0.1)",
  bottom: "inset 0 -1px 0 0 rgb(154 165 177 / 25%)",
  top: "inset 0 1px 0 0 rgb(154 165 177 / 25%)",
  left: "inset 1px 0 0 0 rgb(154 165 177 / 25%)",
  right: "inset -1px 0 0 0 rgb(154 165 177 / 25%)",
  autosuggest: "0 1px 5px -1px rgba(31,41,51,.2)",
  container:
    "0 0 0 1px rgba(31, 41, 51, 0.1), 0 5px 20px rgba(31, 41, 51, 0.25)",
};

export const beziers = {
  easeOut: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  easeIn: "cubic-bezier(0.42, 0, 1, 1)",
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  bounce: {
    easeOut: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
};

// Craft 6 semantic roles follow the native control panel appearance.
// Keep literal white/black for
// content colors, logos, signature canvases, and text on solid accent fills.
export const colors = {
  surface: "var(--pane-bg, var(--white))",
  secondarySurface: "var(--secondary-pane-bg, var(--gray-050))",
  mutedSurface:
    "color-mix(in srgb, var(--text-color, var(--gray-700)) 3.5%, var(--pane-bg, var(--white)))",
  canvas: "var(--body-bg, var(--gray-100))",
  overlay: "var(--modal-bg, var(--white))",
  text: "var(--text-color, var(--gray-700))",
  muted: "var(--light-text-color, var(--gray-550))",
  border: "var(--hairline-color, var(--gray-200))",
  inputBackground: "var(--input-bg, var(--white))",
  hairline:
    "light-dark(rgba(51,64,77,.1), var(--hairline-color, rgba(51,64,77,.1)))",
  hr: "light-dark(rgb(from var(--gray-800) r g b/10%), var(--hairline-color, rgb(from var(--gray-800) r g b/10%)))",
  inputBorder:
    "light-dark(rgba(96,125,159,0.25), var(--input-border-color, rgba(96,125,159,0.25)))",
  selectBackground:
    "color-mix(in srgb, var(--text-color, #3f4d5a) 5%, var(--input-bg, var(--white)))",
  barelyVisible:
    "light-dark(rgb(154 165 177 / 75%), var(--light-text-color, rgb(154 165 177 / 75%)))",
  link: "light-dark(#1f5fea, var(--link-color, #1f5fea))",

  elements: {
    dropdown: "light-dark(#dfe5ec, var(--ui-control-bg-color, #dfe5ec))",
  },

  error: "light-dark(#cf1124, var(--fg-error, var(--error-color, #cf1124)))",
  warning: "var(--warning-color)",
  success: "var(--success-color)",
  notice: "var(--notice-color)",
  enabled: "var(--enabled-color)",
  pending: "var(--pending-color)",
  disabled: "var(--disabled-color)",

  white: "var(--white)", //#fff
  black: "var(--black)", //#000

  gray050: "var(--gray-050)", //#f3f7fc
  gray100: "var(--gray-100)", //#e4edf6
  gray200: "var(--gray-200)", //#cdd8e4
  gray250: "#b4c3d3", //#b4c3d3
  gray300: "var(--gray-300)", //#9aa5b1
  gray350: "var(--gray-350)", //#8b96a2
  gray400: "var(--gray-400)", //#7b8793
  gray500: "var(--gray-500)", //#606d7b
  gray550: "var(--gray-550)", //#596673
  gray600: "var(--gray-600)", //#515f6c
  gray700: "var(--gray-700)", //#3f4d5a
  gray800: "var(--gray-800)", //#33404d
  gray900: "var(--gray-900)", //#1f2933
  gray1000: "var(--gray-1000)", //#131920
  blue050: "var(--blue-050)", //#e3f8ff
  blue100: "var(--blue-100)", //#b3ecff
  blue200: "var(--blue-200)", //#81defd
  blue300: "var(--blue-300)", //#5ed0fa
  blue400: "var(--blue-400)", //#40c3f7
  blue500: "var(--blue-500)", //#2bb0ed
  blue600: "var(--blue-600)", //#1992d4
  blue700: "var(--blue-700)", //#127fbf
  blue800: "var(--blue-800)", //#0b69a3
  blue900: "var(--blue-900)", //#035388
  cyan050: "var(--cyan-050)", //#e0fcff
  cyan100: "var(--cyan-100)", //#bef8fd
  cyan200: "var(--cyan-200)", //#87eaf2
  cyan300: "var(--cyan-300)", //#54d1db
  cyan400: "var(--cyan-400)", //#38bec9
  cyan500: "var(--cyan-500)", //#2cb1bc
  cyan600: "var(--cyan-600)", //#14919b
  cyan700: "var(--cyan-700)", //#0e7c86
  cyan800: "var(--cyan-800)", //#0a6c74
  cyan900: "var(--cyan-900)", //#044e54
  pink050: "var(--pink-050)", //#ffe3ec
  pink100: "var(--pink-100)", //#ffb8d2
  pink200: "var(--pink-200)", //#ff8cba
  pink300: "var(--pink-300)", //#f364a2
  pink400: "var(--pink-400)", //#e8368f
  pink500: "var(--pink-500)", //#da127d
  pink600: "var(--pink-600)", //#bc0a6f
  pink700: "var(--pink-700)", //#a30664
  pink800: "var(--pink-800)", //#870557
  pink900: "var(--pink-900)", //#620042
  red050: "var(--red-050)", //#ffe3e3
  red100: "var(--red-100)", //#ffbdbd
  red200: "var(--red-200)", //#ff9b9b
  red300: "var(--red-300)", //#f86a6a
  red400: "var(--red-400)", //#ef4e4e
  red500: "var(--red-500)", //#e12d39
  red600: "var(--red-600)", //#cf1124
  red700: "var(--red-700)", //#ab091e
  red800: "var(--red-800)", //#8a041a
  red900: "var(--red-900)", //#610316
  yellow050: "var(--yellow-050)", //#fffbea
  yellow100: "var(--yellow-100)", //#fff3c4
  yellow200: "var(--yellow-200)", //#fce588
  yellow300: "var(--yellow-300)", //#fadb5f
  yellow400: "var(--yellow-400)", //#f7c948
  yellow500: "var(--yellow-500)", //#f0b429
  yellow600: "var(--yellow-600)", //#de911d
  yellow700: "var(--yellow-700)", //#cb6e17
  yellow800: "var(--yellow-800)", //#b44d12
  yellow900: "var(--yellow-900)", //#8d2b0b
  teal050: "var(--teal-050)", //#effcf6
  teal100: "var(--teal-100)", //#c6f7e2
  teal200: "var(--teal-200)", //#8eedc7
  teal300: "var(--teal-300)", //#65d6ad
  teal400: "var(--teal-400)", //#3ebd93
  teal500: "var(--teal-500)", //#27ab83
  teal550: "var(--teal-550)", //#20a07b
  teal600: "var(--teal-600)", //#199473
  teal700: "var(--teal-700)", //#147d64
  teal800: "var(--teal-800)", //#0c6b58
  teal900: "var(--teal-900)", //#014d40
  green600: "var(--green-600)", //#16a34a
};
