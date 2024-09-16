export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', fileName);

  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};
