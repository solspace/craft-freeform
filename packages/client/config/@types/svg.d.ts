declare module "*.svg" {
  // biome-ignore lint/suspicious/noExplicitAny: we don't have a better type
  const content: any;
  export default content;
}
