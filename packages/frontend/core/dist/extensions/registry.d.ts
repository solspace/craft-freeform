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
export declare function createExtensionRegistry(): ExtensionRegistry;
//# sourceMappingURL=registry.d.ts.map
