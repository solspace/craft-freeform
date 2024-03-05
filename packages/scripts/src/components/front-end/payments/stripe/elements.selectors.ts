export const isHidden = (element: HTMLElement): boolean => {
  if (element.getAttribute('data-hidden') !== null) {
    return true;
  }

  let parent = element.parentElement;
  while (parent) {
    if (parent.getAttribute('data-hidden') !== null) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
};

const fetchContainers = (form: HTMLFormElement, fetchHidden: boolean): HTMLDivElement[] => {
  const allContainers = form.querySelectorAll<HTMLDivElement>('[data-field-type="stripe"]');
  return Array.from(allContainers).filter((container) => {
    const isContainerHidden = isHidden(container);

    if (isContainerHidden && fetchHidden) {
      return true;
    }

    if (!isContainerHidden && !fetchHidden) {
      return true;
    }

    return false;
  });
};

export const selectVisibleContainers = (form: HTMLFormElement): HTMLDivElement[] => {
  return fetchContainers(form, false);
};

export const selectHiddenContainers = (form: HTMLFormElement): HTMLDivElement[] => {
  return fetchContainers(form, true);
};
