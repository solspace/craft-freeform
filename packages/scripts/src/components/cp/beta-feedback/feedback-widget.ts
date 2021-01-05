interface FeedbackResponse {
  success: boolean;
  errors?: { [key: string]: string[] };
}

const freeform_api_base_url = `https://api.solspace.com`;

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('freeform-beta-feedback-widget');
  const toggler = widget.querySelector<HTMLAnchorElement>('a');
  const form = widget.querySelector<HTMLFormElement>('form');
  const cancelButton = widget.querySelector<HTMLButtonElement>('button[data-type="cancel"]');
  const ratingInput = widget.querySelector<HTMLInputElement>('input[name="rating"]');
  const buttons = widget.querySelectorAll<HTMLButtonElement>('button');

  widget.style.display = null;

  const toggleClass = () => {
    widget.classList.toggle('expanded');
  };

  toggler.addEventListener('click', toggleClass);
  cancelButton.addEventListener('click', toggleClass);

  const starWrapper = widget.querySelector<HTMLDivElement>('.stars');
  const stars = starWrapper.querySelectorAll<HTMLDivElement>('.star');
  stars.forEach((star) => {
    const value = star.dataset.value;
    star.addEventListener('mouseenter', () => {
      stars.forEach((item) => {
        if (item.dataset.value <= value) {
          item.classList.add('hover');
        } else {
          item.classList.add('unhover');
        }
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach((item) => {
        item.classList.remove('hover', 'unhover');
      });
    });

    star.addEventListener('click', () => {
      ratingInput.value = value;
      stars.forEach((item) => {
        if (item.dataset.value <= value) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
    });
  });

  form.addEventListener('submit', (event) => {
    const body = new FormData(form);

    buttons.forEach((button) => (button.disabled = true));

    fetch(`${freeform_api_base_url}/feedback`, {
      method: 'post',
      cache: 'no-cache',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body,
    })
      .then((response) => response.json())
      .then((data: FeedbackResponse) => {
        if (data.success) {
          widget.classList.remove('expanded');
          widget.classList.add('submitted');
        } else {
          alert('There was an error submitting the feedback.');
          console.error(data.errors);
        }

        buttons.forEach((button) => (button.disabled = false));
      });

    event.preventDefault();
    event.stopPropagation();
    return false;
  });
});
