import type { TinyMCE } from 'tinymce';

import { getSuggestions } from './html-body.plugin.suggestions';

const groupSuggestionsByCategory = () => {
  return {
    general: [
      { text: 'General Tag 1', value: 'general_tag_1' },
      { text: 'General Tag 2', value: 'general_tag_2' },
    ],
    test: [
      { text: 'Test Tag 1', value: 'test_tag_1' },
      { text: 'Test Tag 2', value: 'test_tag_2' },
    ],
  };
};

export const registerTest = (tinymce: TinyMCE): void => {
  console.log('Registering test plugin');

  tinymce.PluginManager.add('mergeTags', function (editor) {
    const store = editor.getParam('store');
    let customDropdown: HTMLElement | null = null;
    let currentFilter = '';

    // Function to insert a merge tag into the editor
    function insertMergeTag(value) {
      const suggestions = getSuggestions(store);
      const text =
        suggestions.find((item) => item.value === value)?.text || value;

      editor.insertContent(
        `<span contenteditable="false" data-freeform-token="${value}">${text}</span>&nbsp;`
      );
    }

    // Create custom dropdown
    function createDropdown() {
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
      return dropdown;
    }

    // Position dropdown near cursor or button
    function positionDropdown(dropdown: HTMLElement, rect: DOMRect) {
      const editorRect = editor
        .getContentAreaContainer()
        .getBoundingClientRect();

      // Position dropdown below the cursor or trigger point
      dropdown.style.left = `${Math.min(rect.left, editorRect.right - 250)}px`;
      dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    }

    // Populate dropdown with suggestions
    function populateDropdown(dropdown: HTMLElement, filter = '') {
      const groupedSuggestions = groupSuggestionsByCategory();
      dropdown.innerHTML = '';

      Object.entries(groupedSuggestions).forEach(([category, items]) => {
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
        categoryHeader.innerHTML = `<h4 class="merge-tag-category-title">${category.toUpperCase()}</h4>`;
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

            insertMergeTag(item.value);
            hideDropdown();
          });

          itemsList.appendChild(listItem);
        });

        dropdown.appendChild(itemsList);
      });
    }

    // Show dropdown
    function showDropdown(rect: DOMRect, filter = '') {
      hideDropdown(); // Close if already open

      customDropdown = createDropdown();
      positionDropdown(customDropdown, rect);
      populateDropdown(customDropdown, filter);
      currentFilter = filter;

      // Close dropdown when clicking outside
      document.addEventListener('click', handleOutsideClick);

      // Handle keyboard navigation
      editor.on('keydown', handleKeyboardNavigation);
    }

    // Hide dropdown
    function hideDropdown() {
      if (customDropdown) {
        document.body.removeChild(customDropdown);
        customDropdown = null;
        currentFilter = '';

        document.removeEventListener('click', handleOutsideClick);
        editor.off('keydown', handleKeyboardNavigation);
      }
    }

    // Outside click handler
    function handleOutsideClick(e: MouseEvent) {
      if (customDropdown && !customDropdown.contains(e.target as Node)) {
        hideDropdown();
      }
    }

    // Keyboard navigation handler
    function handleKeyboardNavigation(e: KeyboardEvent) {
      if (!customDropdown) return;

      const items = customDropdown.querySelectorAll('.merge-tag-item');
      const activeItem = customDropdown.querySelector('.merge-tag-item.active');

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
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
          e.preventDefault();
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
          e.preventDefault();
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

              insertMergeTag(value);
              hideDropdown();
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          hideDropdown();
          break;

        default:
          if (/^[a-z0-9]$/i.test(e.key)) {
            // Update filter when typing
            currentFilter += e.key;
            populateDropdown(customDropdown, currentFilter);
          } else if (e.key === 'Backspace' && currentFilter.length > 0) {
            currentFilter = currentFilter.slice(0, -1);
            populateDropdown(customDropdown, currentFilter);
          }
      }
    }

    // Register button for toolbar
    editor.ui.registry.addButton('mergeTags', {
      text: 'Merge Tags',
      onAction: () => {
        const button = editor.editorContainer.querySelector(
          '[aria-label="Merge Tags"]'
        );
        if (button) {
          const rect = button.getBoundingClientRect();
          showDropdown(rect);
        }
      },
    });

    // Listen for '@' key press
    editor.on('keydown', (e) => {
      if (e.key === '@') {
        setTimeout(() => {
          const selection = editor.selection;
          const range = selection.getRng();
          const rect = range.getBoundingClientRect();

          // Show dropdown at cursor position
          showDropdown(rect, '');
        }, 0);
      }
    });

    // Clean up when editor is removed
    editor.on('remove', () => {
      hideDropdown();
    });
  });
};
