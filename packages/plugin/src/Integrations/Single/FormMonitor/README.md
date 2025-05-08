# Setup Guide

## Overview

### Requirements

- Freeform Pro 5.11+
- Craft 4.x or 5.x

In order for Form Monitor to work, your site must:

- Have a **valid Freeform Pro edition license**. If the license has expired, you must renew it in order to continue using Form Monitor.
- Be **publicly accessible**. Form Monitor will not be able to access local dev sites or sites using HTTP Authentication.

### Imposed Limitations

The following limitations have been set for sites during the beta testing period. This may change in the future:

- Form Monitor can be enabled for up to 3 forms per Craft site.
- Form Monitor will test each form 3 times per day (every 8 hours).

### Technical Limitations

Form Monitor will not work for every form and site setup. Please be aware that Form Monitor may not work for, but not limited to, setups that:

- Use complex site layouts, structure or other CSS/JS that may make it harder for Form Monitor to locate and interact with the form properly.
- Forms that are placed inside of modals or popups.
- If multiple instances of the same form exist on the same page, the first instance will be tested.

### Recommendations

- To ensure that you receive important alerts from Form Monitor, we strongly recommend that you whitelist the email Form Monitor will use: `noreply@formmonitor.com`.

### Privacy

- TBD


## Setup Instructions

### 1. Enable the Form Monitor integration

- Go to the **Single** integration page in the Freeform Settings area.
- Click on **Form Monitor**.
- Enable **Form Monitor** by toggling on the **Enabled** setting.
- Confirm or enter a different default email address in the **Default Error Notification Email** setting.
- Save the page.
- **Form Monitor** will validate its connection.

### 2. Configure your Forms
To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Form Monitor** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Adjust any of the settings as needed.
- Save the form.