document.querySelectorAll('[data-freeform-daisyui]').forEach((form) => {
    form.addEventListener('freeform-stripe-appearance', (event) => {
        if (form.dataset.theme !== 'dark' || !event.elementOptions?.appearance) return;

        // Stripe renders in an iframe, so pass the resolved daisyUI colors through its Appearance API.
        const styles = getComputedStyle(form);
        const context = document.createElement('canvas').getContext('2d');
        const color = (name) => {
            const value = styles.getPropertyValue(name).trim();
            if (!context || !CSS.supports('color', value)) return undefined;
            context.fillStyle = value;
            context.fillRect(0, 0, 1, 1);
            const rgb = context.getImageData(0, 0, 1, 1).data;
            return `#${Array.from(rgb.slice(0, 3), (channel) => channel.toString(16).padStart(2, '0')).join('')}`;
        };
        const appearance = event.elementOptions.appearance;
        appearance.theme = 'night';
        const variables = { ...appearance.variables };
        for (const [stripeName, daisyName] of Object.entries({
            colorPrimary: '--color-primary',
            colorBackground: '--color-base-100',
            colorText: '--color-base-content',
            colorDanger: '--color-error',
        })) {
            const resolved = color(daisyName);
            if (resolved) variables[stripeName] = resolved;
        }
        variables.borderRadius = styles.getPropertyValue('--radius-field').trim() || '0.25rem';
        appearance.variables = variables;
    });

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
