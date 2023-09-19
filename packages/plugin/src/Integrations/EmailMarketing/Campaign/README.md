# Setup Guide

This guide assumes you have the [Campaign plugin](https://putyourlightson.com/plugins/campaign) installed and set up already.

## Compatibility

Compatible with the `v2` version of the plugin.

### Endpoints
Maps data to the following endpoints:

- **Mailing Lists** (including all Sites)

### Fields
Maps data to the following field types:

- **Regular Text Fields**

## Setup Instructions
Freeform will detect if the _Campaign_ plugin is installed and then show it as an option to use. Because it's a Craft plugin, the setup is much simpler:

### 1. Setup Integration on your site

- Select *Campaign plugin (v2)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Click the **Save** button.

### 2. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Campaign** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Map Freeform fields to the Campaign fields as you wish.