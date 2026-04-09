# Setup Guide

Freeform can automatically capture UTM and other URL tracking parameters (e.g., `utm_campaign`, `utm_source`, `utm_medium`) for every submission. Configure the expected parameter names just once globally, with the option to configure form-specific parameters in the builder, and Freeform handles the rest. Optional cookie storage ensures that even if tracking parameters are no longer present in the URL, they can still be captured with the submission.

## Setup Instructions

### 1. Enable URL Parameter Tracking

- If you'd like the Freeform URL Parameter Tracking integration to be enabled for all forms by default, toggle on the **Enabled by default** setting.
- Add any **URL tracking parameters** you'd like the integration to detect by default:
  - E.g. `utm_source`, `utm_medium`, `utm_campaign`, etc.
- **Store in Cookies**
  - Save tracked parameters in cookies so they can be reused by Freeform later.
- **Cookie Lifetime**
  - How long tracked parameters should be stored in cookies (in minutes).
- Click the **Save** button.

### 2. Configure the Form
To use this integration on your form(s), you'll need to configure each form individually. If you toggled on the **Enabled by default** setting in the Freeform Settings, it will automatically be ON for all forms. You can disable them for each form as necessary.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **URL Parameter Tracking** in the list of available integrations.
- On the right side of the page:
  - Enable (or disable) the integration.
  - Adjust any of the settings as needed.
- Save the form.

### 3. Example URL
An example URL might look something like this:

`https://mysite.net/contact?utm_source=facebook&utm_medium=social&utm_campaign=summer_sale&my_custom_param=test`

### 4. Configure Email Notifications

If you wish you include any URL parameters in email notifications or pass off to an integration, you can do so using `{{ url_parameters.param_name }}`.

For example:

```twig
{{ url_parameters.utm_source }}
{{ url_parameters.utm_medium }}
{{ url_parameters.utm_campaign }}
{{ url_parameters.my_custom_param }}
{{ url_parameters.some_test == "test" ? "this is a test" : "this is NOT a test" }}
```

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>