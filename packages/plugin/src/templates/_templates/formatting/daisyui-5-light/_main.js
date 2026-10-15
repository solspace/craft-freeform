document.querySelectorAll('[data-freeform-daisyui][data-theme="light"]').forEach((form) => {
    const showBanner = (kind, errors = []) => {
        form.querySelectorAll('[data-freeform-ajax-banner]').forEach((banner) => banner.remove());
        const template = form.querySelector(`[data-freeform-${kind}-template]`);
        const banner = template?.content.firstElementChild?.cloneNode(true);
        if (!banner) return false;

        if (kind === 'error') {
            const list = banner.querySelector('[data-freeform-banner-errors]');
            if (list) {
                list.replaceChildren(...errors.map((error) => {
                    const item = document.createElement('li');
                    item.textContent = error;
                    return item;
                }));
                list.hidden = errors.length === 0;
            }
        }
        banner.dataset.freeformAjaxBanner = kind;
        form.insertBefore(banner, form.firstChild);
        return true;
    };

    form.addEventListener('freeform-render-success', (event) => {
        if (showBanner('success')) event.preventDefault();
    });
    form.addEventListener('freeform-render-form-errors', (event) => {
        if (showBanner('error', Array.isArray(event.errors) ? event.errors : [])) event.preventDefault();
    });
});
