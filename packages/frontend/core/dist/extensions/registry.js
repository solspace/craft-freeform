export function createExtensionRegistry() {
  const extensions = new Map();
  return {
    register(extension) {
      extensions.set(extension.name, extension);
    },
    get(name) {
      return extensions.get(name);
    },
    list() {
      return [...extensions.values()];
    },
    assertRequired(required) {
      for (const descriptor of required) {
        const installed = extensions.get(descriptor.name);
        if (!installed && descriptor.severity === "error") {
          throw new Error(
            `Required extension "${descriptor.name}" (${descriptor.package}) is not registered.`,
          );
        }
      }
    },
  };
}
