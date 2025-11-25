export const callbackOnInputs = (container: HTMLElement, callback: (element: HTMLElement) => void) => {
  let inputs: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  const handle = container.dataset.fieldContainer;
  const type = container.dataset.fieldType;
  switch (type) {
    case 'signature':
      const canvas = container.querySelector<HTMLCanvasElement>('canvas');
      callback(canvas);

      return;
    case 'table':
      inputs = container.querySelectorAll<HTMLInputElement>(`input, select, textarea`);
      inputs.forEach(callback);

      return;
    case 'checkboxes':
    case 'radios':
    case 'rating':
      inputs = container.querySelectorAll<HTMLInputElement>(`input[type="radio"], input[type="checkbox"]`);
      inputs.forEach(callback);

      return;

    default:
      const input = container.querySelector<HTMLInputElement>(`[name="${handle}"]`);
      callback(input);

      return;
  }
};
