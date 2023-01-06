export const createPreview = (label: string): string => {
  let [width, height] = [200, 40];

  const canvas = document.createElement('canvas');
  if (!canvas.getContext) {
    return null;
  }

  const ctx = canvas.getContext('2d');

  const devicePixelRatio = window.devicePixelRatio || 1;
  const backingStoreRatio = 1;

  const ratio = devicePixelRatio / backingStoreRatio;

  width = width * ratio;
  height = height * ratio;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const lineDashWidth = Math.ceil(4 * ratio);
  const lineDashSpacing = Math.ceil(2 * ratio);

  ctx.setLineDash([lineDashWidth, lineDashSpacing]);
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineDashOffset = 0;
  ctx.lineWidth = 4 * ratio;
  ctx.strokeRect(0, 0, width, height);

  const fontSize = Math.ceil(14 * ratio);

  ctx.font = `normal ${fontSize}px system-ui,BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`;
  ctx.fillStyle = '#3f4d5a';
  ctx.fillText(label, Math.ceil(10 * ratio), Math.ceil(25 * ratio));

  return canvas.toDataURL();
};
