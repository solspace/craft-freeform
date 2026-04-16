# Overview

## Requirements

- Freeform Pro 5.11+
- Craft 4.x or 5.x

For Form Monitor to work, your site must:

- Have a **valid Freeform Pro edition license**. You must renew the license to continue using Form Monitor if it has expired.
- Be **publicly accessible**. Form Monitor cannot access local dev sites or sites using HTTP Authentication.

## Limitations

### Imposed Limitations

The following limitations have currently been set for sites. These limitations may change in the future.

- Form Monitor can be enabled for up to 3 forms per Craft site.
- Form Monitor will test each form 3 times per day (every 8 hours).
- **Timeout Constraints**:
  - Form processing: 3 minute maximum
  - Page loading: 90 second limit
  - Submission response: 5 second timeout

### Technical Limitations

Form Monitor will not work for every form and site setup. Please be aware that Form Monitor may not work for, but not limited to, the following:

- Setups that use complex site layouts, structures, or CSS/JS that may make it harder for Form Monitor to locate and interact with the form correctly.
- Forms placed inside of iframes, modals, or popups.
- Forms using Conditional Rules. Form Monitor is currently unable to work with conditional rules. Depending on the form setup, it may cause Form Monitor's tests to fail.
- If multiple instances of the same form exist on the same page, the first instance will be tested.
- Captcha and other Spam Protection measures will be bypassed. This means that if there are any configuration issues with those, Form Monitor will be unable to catch them.
- Integration services, including CRMs, email marketing, webhooks, POST forwarding, and payment forms, will be bypassed. Form Monitor cannot verify the successful submission of data to an integration (e.g., Salesforce, Mailchimp, etc.).
- Custom module behavior may impact Form Monitor's testing capabilities. This includes modules, extensions, custom javascript behaviors and client-side validations.
- Private or restricted sites. Any site that uses HTTP authentication, password-protected pages, IP-restricted access, or VPN-required access cannot be tested.

## Recommendations

- To ensure that you receive essential alerts from Form Monitor, we strongly recommend safelisting the email address that Form Monitor will use: `noreply@formmonitor.com`.

## Privacy

We take your privacy very seriously! Form Monitor collects the least amount of information possible. Form Monitor has absolutely no access to your Craft site control panel, Craft data, and Freeform submission data. Form Monitor does not have, and will never have, access to previous, current, or future submission history. It only has access to the fake testing data it uses to test the form if it's contained inside an email notification when testing that as well.

### What Form Monitor Has Access To

Form Monitor cannot work on your site or collect any of your data until you expressly enable the feature and opt-in to authorize it. Once this happens, Form Monitor collects the following information:

- The email address(es) you provide in the integration settings.
- Your Freeform plugin license key to validate your active license.
- Any website URL(s) you provide to Form Monitor so it can locate and test your form(s).
- The form name of the form(s) you opt into testing. This enables technical support to more easily assist if any issues arise.
- The form layout and configuration so that Form Monitor can provide correct testing data to accurately test the form.
- Your current Craft and Freeform versions to ensure compatibility with Form Monitor and alert you if you need to upgrade Freeform or Craft in the future.
- Your site's Timezone to provide weekly and monthly digest email notifications at the proper day and time.
- Screenshots of the page that contains each form. This is to show that the test was successful or where it may have failed.
  - Screenshots are stored on the server for up to 30 days.
- If testing email notifications, Form Monitor will receive an email notification of the form test (with its fake test data) from any notification(s) you have configured from your form. Form Monitor will see the types of notifications (e.g. Admin, Conditional, etc.) and any hard-coded elements in the email notification template(s) (e.g. "Thank you for your submission!", a PDF attachment, etc.).

### You Are In Control Of Your Data

You also have complete control over your data. From within the Freeform control panel, you can deactivate and/or remove any or all of Form Monitor's data for your site.

- You can remove all or any single test and screenshot from inside the Freeform form builder.
- You can deactivate or remove data from any form(s) being monitored.
- You can deactivate your entire site or entirely delete your site's data from Form Monitor's site via the Freeform control panel. 

# Setup Instructions

### 1. Enable The Form Monitor Integration

- Confirm or enter a different:
  - Default email address in the **Notification Email** setting.
  - Site/System Name in the **Site Name** setting.
- Click the **Save** button.
- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- If successful, the flag at the top will turn green and display _Authorized_.

### 2. Configure Your Forms
To use this integration on your form(s), you must configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Form Monitor** in the list of available integrations.
- On the right side of the page:
  - Enable the integration.
  - Adjust any settings as needed.
- Save the form.