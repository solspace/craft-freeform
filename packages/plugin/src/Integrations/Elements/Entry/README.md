# Setup Guide

This integration allows you to map Freeform submission data to [Craft Entries](https://craftcms.com/docs/4.x/entries.html). In addition to most custom Craft fields, Freeform can also map to the *Post Date* and *Expiry Date*.

## Setup Instructions

### 1. Create the Integration

- Select *Entry* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration. e.g. `My Entry Integration`.
- Choose a section and entry type from the **Entry Type** select dropdown.
    - This will only be the default value when configuring the integration in the form builder later.
- Click the **Save** button.

### 2. Configure the Form

- Open up the form inside the form builder.
- Click on the **Integrations** tab.
- Click on your new **Entry** integration in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Confirm the section and entry type in the **Entry Type** field, or change it as necessary.
    - The **Attribute Mapping** table allows you to map standard Craft Entry fields.
    - The **Field Mapping** table is where you map Freeform fields to the Craft Entry fields as needed.

See [Mapping Guidelines](https://docs.solspace.com/craft/freeform/v5/integrations/elements/#mapping-guidelines) for more info.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>