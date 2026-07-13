export type ExtensionSeverity = "error" | "warning";

export type ExtensionDescriptor = {
  name: string;
  package: string;
  version: string;
  severity: ExtensionSeverity;
  fallback?: string | null;
};

export type ExtensionModule = {
  name: string;
  version?: string;
  initialize?: (context: ExtensionContext) => void | Promise<void>;
};

export type ExtensionContext = {
  registerRenderer?: (fieldType: string, renderer: unknown) => void;
};

export type RequiredExtensionDescriptor = Omit<
  ExtensionDescriptor,
  "severity"
> & {
  severity: string;
};

export type ExtensionRegistry = {
  register: (extension: ExtensionModule) => void;
  get: (name: string) => ExtensionModule | undefined;
  list: () => ExtensionModule[];
  assertRequired: (required: RequiredExtensionDescriptor[]) => void;
};

export function createExtensionRegistry(): ExtensionRegistry {
  const extensions = new Map<string, ExtensionModule>();

  return {
    register(extension: ExtensionModule) {
      extensions.set(extension.name, extension);
    },

    get(name: string) {
      return extensions.get(name);
    },

    list() {
      return [...extensions.values()];
    },

    assertRequired(required: RequiredExtensionDescriptor[]) {
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
