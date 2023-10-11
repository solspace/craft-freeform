export type Attributes = Record<string, string>;
export type AttributeCollection = Record<string, Attributes>;
export type AttributeEntry = [string, string];
export type EditableAttributeCollection = Record<string, AttributeEntry[]>;
