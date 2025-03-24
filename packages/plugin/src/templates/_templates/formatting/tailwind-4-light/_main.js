var forms = document.querySelectorAll("[data-freeform-tailwind]");
forms.forEach((function(e) {
  e.addEventListener("freeform-ready", (function(e) {
    var r = e.freeform;
    r.setOption("errorClassList", ["mt-1", "text-sm", "text-red-600"]),
    r.setOption("errorClassField", ["outline-1", "-outline-offset-1", "outline-red-600"])
  }));

  e.addEventListener('freeform-render-success', function (event) {
    // Prevent the default behavior
    event.preventDefault();
  
    // Create the outer success message container
    const successBlock = document.createElement('div');
    successBlock.classList.add('freeform-success-banner', 'rounded-md', 'bg-green-50', 'p-4', 'mb-10');
  
    // Create the flex container
    const flexContainer = document.createElement('div');
    flexContainer.classList.add('flex');
  
    // Create the icon container
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('shrink-0');
  
    // Create the SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'size-6 text-green-400');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
  
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z');
    path.setAttribute('clip-rule', 'evenodd');
  
    svg.appendChild(path);
    iconContainer.appendChild(svg);
  
    // Create the text container
    const textContainer = document.createElement('div');
    textContainer.classList.add('ml-2');
  
    // Create the success message title
    const title = document.createElement('h3');
    const successMessage = e.getAttribute('data-success-message') || 'Form submitted successfully!';
    title.classList.add('text-md', 'font-medium', 'text-green-800');
    title.textContent = successMessage;
  
    // Append elements
    textContainer.appendChild(title);
    flexContainer.appendChild(iconContainer);
    flexContainer.appendChild(textContainer);
    successBlock.appendChild(flexContainer);
  
    // Insert the success message before the form's first child
    e.insertBefore(successBlock, e.firstChild);
  });

  e.addEventListener('freeform-render-form-errors', function (event) {
    // Prevent the default behavior
    event.preventDefault();

    // Remove existing error banner if it exists
    const existingErrorBlock = e.querySelector('.freeform-error-banner');
    if (existingErrorBlock) {
      existingErrorBlock.remove();
    }
  
    // Create the main error container
    const errorBlock = document.createElement('div');
    errorBlock.classList.add('freeform-error-banner', 'rounded-md', 'bg-red-50', 'p-4', 'mb-10');
  
    // Create the inner flex container
    const flexContainer = document.createElement('div');
    flexContainer.classList.add('flex');
  
    // Create the icon container
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('shrink-0');
  
    // Create the SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('size-6', 'text-red-400');
  
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute(
      'd',
      'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z'
    );
    path.setAttribute('clip-rule', 'evenodd');
  
    svg.appendChild(path);
    iconContainer.appendChild(svg);
  
    // Create the text container
    const textContainer = document.createElement('div');
    textContainer.classList.add('ml-3');
  
    // Get the error message text
    const errorMessage = e.getAttribute('data-error-message') || 'There were errors in your submission';
    const title = document.createElement('h3');
    title.classList.add('text-md', 'font-medium', 'text-red-800');
    title.textContent = errorMessage;

    // Create the list of errors (only if there are errors)
    const errorsListContainer = document.createElement('div');
    errorsListContainer.classList.add('mt-2', 'text-sm', 'text-red-700');
  
    const errorsList = document.createElement('ul');
    errorsList.setAttribute('role', 'list');
    errorsList.classList.add('list-disc', 'space-y-1', 'pl-5');
  
    event.errors.forEach((message) => {
      const listItem = document.createElement('li');
      listItem.textContent = message;
      errorsList.appendChild(listItem);
    });
  
    // Append errorsListContainer only if there are errors
    if (errorsList.children.length > 0) {
      errorsListContainer.appendChild(errorsList);
      textContainer.appendChild(errorsListContainer);
    }
  
    textContainer.prepend(title);
    flexContainer.append(iconContainer, textContainer);
    errorBlock.appendChild(flexContainer);
  
    // Insert error block at the top of the form
    e.insertBefore(errorBlock, e.firstChild);
  });
  

  e.addEventListener("freeform-stripe-appearance", (function(e) {
    e.elementOptions.appearance = Object.assign(e.elementOptions.appearance, {
      variables: {
        colorPrimary: "#4c3aed",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
        fontSizeBase: "0.875rem",
        spacingUnit: "0.2em",
        tabSpacing: "0.825rem",
        gridColumnSpacing: "1.625rem",
        gridRowSpacing: "1.625rem",
        colorText: "#121827",
        colorTextPlaceholder: "#9ba1ae",
        colorBackground: "#ffffff",
        colorDanger: "#d42422",
        borderRadius: "5px",
      },
      rules: {
        ".Tab": {
          border: "0",
          outline: "1px solid #d2d5db",
          boxShadow: "none",
          padding: "1rem",
        },
        '.Tab--selected': {
          border: "0",
          outline: "2px solid #4c3aed",
          boxShadow: "none",
        },
        ".Input": {
          border: "0",
          outline: "1px solid #d2d5db",
          boxShadow: "none",
          padding: "0.625rem 0.75rem",
        },
        ".Tab:focus, .Input:focus": {
          border: "0",
          boxShadow: "none",
          outline: "2px solid #4c3aed",
        },
        ".Input--invalid": {
          border: "0",
          boxShadow: "none",
        },
        ".Label": {
          fontSize: "1rem",
          fontWeight: "500",
          marginBottom: "0.5rem",
        }
      },
    })
  })),
  e.addEventListener("freeform-on-submit", (function(e) {
    var r = e.form.getAttribute("data-id");
    forms.forEach((function(e) {
      var o = e.getAttribute("data-id");
      r !== o && (e.querySelectorAll("[data-field-errors]").forEach((e => e.remove())),
      e.querySelectorAll(".freeform-input").forEach((e => e.classList.remove("border-red-500"))))
    }))
  }))
}));


// Regular file upload fields display and handling
document.querySelectorAll('.freeform-file-upload-container').forEach(container => {
  const fileInput = container.querySelector('.freeform-file-upload-input');
  const fileDisplay = container.querySelector('.freeform-file-name-display');
  const uploadButton = container.querySelector('.freeform-upload-btn');

  uploadButton.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      const fileNames = Array.from(fileInput.files).map(file => file.name).join(', ');
      fileDisplay.textContent = `Selected files: ${fileNames}`;
    } else {
      fileDisplay.textContent = 'No files selected';
    }
  });
});