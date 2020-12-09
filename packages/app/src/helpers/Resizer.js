export const fitInCraft = (element) => {
  const mainContent = document.getElementById('main-content');
  element.style.top = mainContent.getBoundingClientRect().top + 'px';
};
