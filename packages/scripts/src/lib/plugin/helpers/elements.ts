type ClassList = string | string[];

export const getClassArray = (classList: ClassList): string[] => {
  if (typeof classList === 'string') {
    classList = classList.split(' ');
  }

  return classList;
};

export const addClass = (elem: HTMLElement, classList: ClassList): void => {
  getClassArray(classList).map((className) => elem.classList.add(className));
};

export const removeClass = (elem: HTMLElement, classList: ClassList): void => {
  getClassArray(classList).map((className) => elem.classList.remove(className));
};

export function removeElement(elem: undefined): void;
export function removeElement(elem: HTMLElement): void;
export function removeElement(elem: HTMLCollection): void;
export function removeElement(elem: NodeList): void;
export function removeElement(elem: HTMLElement | HTMLCollection | NodeList | undefined) {
  if (elem === undefined) {
    return;
  }

  if (elem instanceof HTMLElement) {
    elem.parentElement?.removeChild(elem);
  }

  if (elem instanceof HTMLCollection || elem instanceof NodeList) {
    Array.from(elem).forEach((element) => {
      element.parentElement?.removeChild(element);
    });
  }
}
