const padding = 20;

export const calculateTopOffset = (
  wrapper: HTMLDivElement,
  editor: HTMLDivElement
): number => {
  const wTop = wrapper?.getBoundingClientRect().top;

  const viewHeight = window.innerHeight;
  const editorHeight = editor?.offsetHeight;

  if (editorHeight === undefined) {
    return wTop;
  }

  if (wTop && editorHeight && viewHeight) {
    if (wTop + editorHeight > viewHeight - padding) {
      return wTop - (wTop + editorHeight - viewHeight + padding);
    }

    return wTop;
  }

  return 0;
};
