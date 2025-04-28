import type { Editor } from 'tinymce';

import { insertToken } from './insert';
import { getDropdown, getFilter, setDropdown, setFilter } from './state';
import { getSuggestions } from './suggestions';

const create = (): HTMLElement => {
  const dropdown = document.createElement('div');
  dropdown.className = 'custom-merge-tags-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    z-index: 100000;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    max-height: 300px;
    overflow-y: auto;
    width: 250px;
  `;

  document.body.appendChild(dropdown);

  setDropdown(dropdown);

  return dropdown;
};

let keydownNav: (e: KeyboardEvent) => void = undefined;

export const show = (editor: Editor, rect: DOMRect, filter = ''): void => {
  hide(editor);

  const dropdown = create();
  position(editor, dropdown, rect);
  populate(editor, dropdown, filter);
  setFilter(filter);

  // Close dropdown when clicking outside
  document.addEventListener('click', handleOutsideClick(editor));

  keydownNav = handleKeyboardNavigation(editor);

  // Handle keyboard navigation
  editor.on('keydown', keydownNav);
};

export const hide = (editor: Editor): void => {
  const dropdown = getDropdown();
  if (dropdown) {
    document.body.removeChild(dropdown);
    setDropdown(undefined);
    setFilter('');

    document.removeEventListener('click', handleOutsideClick(editor));
    editor.off('keydown', keydownNav);
  }
};

const position = (
  editor: Editor,
  dropdown: HTMLElement,
  rect: DOMRect
): void => {
  const editorRect = editor.getContentAreaContainer().getBoundingClientRect();

  // Position dropdown below the cursor or trigger point
  dropdown.style.left = `${Math.min(rect.left, editorRect.right - 250)}px`;
  dropdown.style.top = `${rect.bottom + window.scrollY}px`;
};

// Populate dropdown with suggestions
const populate = (editor: Editor, dropdown: HTMLElement, filter = ''): void => {
  const store = editor.getParam('store');

  const suggestions = getSuggestions(store);
  dropdown.innerHTML = '';

  suggestions.forEach(({ name, items }) => {
    // Filter items if needed
    const filteredItems = filter
      ? items.filter((item) =>
          item.text.toLowerCase().includes(filter.toLowerCase())
        )
      : items;

    if (filteredItems.length === 0) return;

    // Create category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'merge-tag-category';
    categoryHeader.innerHTML = `<h4 class="merge-tag-category-title">${name.toUpperCase()}</h4>`;
    categoryHeader.style.cssText = `
          padding: 5px 10px;
          margin: 0;
          font-weight: bold;
          background: #f5f5f5;
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
        `;
    dropdown.appendChild(categoryHeader);

    // Create items list
    const itemsList = document.createElement('ul');
    itemsList.className = 'merge-tag-list';
    itemsList.style.cssText = `
          list-style: none;
          margin: 0;
          padding: 0;
        `;

    filteredItems.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'merge-tag-item';
      listItem.setAttribute('data-value', item.value);
      listItem.textContent = item.text;
      listItem.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
          `;

      // Highlight on hover
      listItem.addEventListener('mouseenter', () => {
        listItem.style.background = '#f0f0f0';
      });

      listItem.addEventListener('mouseleave', () => {
        listItem.style.background = 'transparent';
      });

      // Handle click
      listItem.addEventListener('click', () => {
        if (filter) {
          // If triggered by '@', delete the trigger character and any typed filter
          const rng = editor.selection.getRng();
          const startOffset = Math.max(
            0,
            rng.startOffset - (filter.length + 1)
          );
          rng.setStart(rng.startContainer, startOffset);
          editor.selection.setRng(rng);
          editor.execCommand('Delete');
        }

        insertToken(editor, item.value);
        hide(editor);
      });

      itemsList.appendChild(listItem);
    });

    dropdown.appendChild(itemsList);
  });
};

const handleOutsideClick = (editor: Editor) => (event: MouseEvent) => {
  const dropdown = getDropdown();
  if (dropdown && !dropdown.contains(event.target as Node)) {
    hide(editor);
  }
};

// Keyboard navigation handler
const handleKeyboardNavigation = (editor: Editor) => (event: KeyboardEvent) => {
  const dropdown = getDropdown();
  const currentFilter = getFilter();
  if (!dropdown) {
    return;
  }

  const items = dropdown.querySelectorAll('.merge-tag-item');
  const activeItem = dropdown.querySelector('.merge-tag-item.active');

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!activeItem) {
        (items[0] as HTMLElement).classList.add('active');
        (items[0] as HTMLElement).style.background = '#e0e0e0';
      } else {
        let index = Array.from(items).indexOf(activeItem);
        activeItem.classList.remove('active');
        (activeItem as HTMLElement).style.background = 'transparent';

        index = (index + 1) % items.length;
        (items[index] as HTMLElement).classList.add('active');
        (items[index] as HTMLElement).style.background = '#e0e0e0';
        (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (!activeItem) {
        const lastItem = items[items.length - 1] as HTMLElement;
        lastItem.classList.add('active');
        lastItem.style.background = '#e0e0e0';
      } else {
        let index = Array.from(items).indexOf(activeItem);
        activeItem.classList.remove('active');
        (activeItem as HTMLElement).style.background = 'transparent';

        index = (index - 1 + items.length) % items.length;
        (items[index] as HTMLElement).classList.add('active');
        (items[index] as HTMLElement).style.background = '#e0e0e0';
        (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (activeItem) {
        const value = activeItem.getAttribute('data-value');
        if (value) {
          if (currentFilter) {
            // Delete the trigger character and any typed filter
            const rng = editor.selection.getRng();
            const startOffset = Math.max(
              0,
              rng.startOffset - (currentFilter.length + 1)
            );
            rng.setStart(rng.startContainer, startOffset);
            editor.selection.setRng(rng);
            editor.execCommand('Delete');
          }

          insertToken(editor, value);
          hide(editor);
        }
      }
      break;

    case 'Escape':
      event.preventDefault();
      hide(editor);
      break;

    default:
      if (/^[a-z0-9]$/i.test(event.key)) {
        // Update filter when typing
        setFilter(currentFilter + event.key);
        populate(editor, dropdown, currentFilter);
      } else if (event.key === 'Backspace' && currentFilter.length > 0) {
        setFilter(currentFilter.slice(0, -1));
        populate(editor, dropdown, currentFilter);
      }
  }
};
