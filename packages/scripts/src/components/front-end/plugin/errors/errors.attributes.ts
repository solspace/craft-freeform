import type { AttributeList, AttributeRecord, Attributes, AttributeSnapshot } from './errors.types';

const preservedAttributes = new WeakMap<HTMLElement, AttributeSnapshot>();

/**
 * The attribute manifest lists all attributes that have to be applied to fields in case of errors.
 * As well as the attributes for the success and error banners.
 *
 * @param form - The form element to get the attribute manifest for.
 * @returns AttributeList
 */
export const getAttributeManifest = (form: HTMLFormElement): AttributeList => {
  const manifestElement = form.querySelector<HTMLDivElement>('div[data-attributes-manifest]');
  const manifest = manifestElement?.dataset.attributesManifest;

  return JSON.parse(manifest || '{}');
};

/**
 * Attach all given attributes to an element.
 *
 * @param element - The element to attach attributes to.
 * @param attributes - The attributes to attach.
 * @returns void
 */
export const attachAttributes = (element: HTMLElement, attributes: Attributes): void => {
  if (!element) {
    return;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    const attr = document.createAttribute(name);
    attr.value = value;
    element.attributes.setNamedItem(attr);
  });
};

/**
 * Restore pre-error attributes for the given elements.
 *
 * @param elements - The elements to restore attributes for.
 */
export const restoreAttributes = (...elements: HTMLElement[]): void => {
  elements.forEach((element) => restoreElementAttributes(element));
};

export const getAttributeSnapshot = (element: HTMLElement): AttributeSnapshot | undefined => {
  return preservedAttributes.get(element);
};

/**
 * Restore attributes for a single element.
 *
 * @param element
 * @returns void
 */
export const restoreElementAttributes = (element: HTMLElement, snapshot?: AttributeSnapshot): void => {
  if (snapshot === undefined) {
    snapshot = preservedAttributes.get(element);
  }

  if (!snapshot) {
    return;
  }

  // Remove any attributes that were added after the snapshot was taken
  Array.from(element.attributes).forEach((attr) => {
    if (!snapshot.names.has(attr.name)) {
      element.removeAttribute(attr.name);
    }
  });

  // Restore original attributes
  snapshot.attrs.forEach((attr) => {
    const attribute = document.createAttribute(attr.name);
    attribute.value = attr.value;
    if (attr.ns) {
      element.setAttributeNS(attr.ns, attr.name, attr.value);
    } else {
      element.setAttributeNode(attribute);
    }
  });
};

/**
 * Store the current attributes of the given elements in a cache, so they can be restored later.
 *
 * @param elements - The elements to store attributes for.
 */
export const preserveAttributes = (...elements: HTMLElement[]): void => {
  elements.forEach((element) => {
    if (!element) {
      return;
    }

    const attrs: AttributeRecord[] = Array.from(element.attributes).map((attr) => ({
      name: attr.name,
      value: attr.value,
      ns: attr.namespaceURI,
    }));

    preservedAttributes.set(element, {
      attrs,
      names: new Set(attrs.map((a) => a.name)),
    });
  });
};
