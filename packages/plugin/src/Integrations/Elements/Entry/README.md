# Setup Guide

This integration allows you to map Freeform submission data to [Craft Entries](https://craftcms.com/docs/4.x/entries.html). In addition to most custom Craft fields, Freeform can also map to the *Post Date* and *Expiry Date*.

## Setup Instructions

### 1. Create the Integration

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

### Craft 5 Addresses Fields

Native Craft 5 **Addresses** fields appear as individual components in **Field Mapping**, such as **Mailing Address — Address Line 1**, **Mailing Address — City / Locality**, and **Mailing Address — Country Code**. Map each component to a Freeform field, a fixed value, or a Twig expression. Country codes must use two letters, such as `CA` or `US`; state/province values must use the subdivision codes expected by Craft for that country, such as `MB` or `NY`.

Each mapped Addresses field creates one address when empty, or updates its first address when editing an existing entry. New addresses use the Craft field's name as their label unless **Label** is mapped. Additional addresses, unmapped components, and custom address fields are preserved. Mapped blank values clear existing components, while an entirely blank optional address does not create a new address. Craft validates the address and saves it with the entry. Element editing prefills mapped Freeform fields from that first address.

This maps to an Addresses custom field on the entry, rather than creating a standalone address element. Multiple address fields on the same entry can each be mapped independently.

When a Freeform **Location** field uses **Include fields**, its included components are available directly in every integration's field picker. For example, map **Location — Address Line 1** to the Craft address's **Address Line 1**, **Location — City** to **City / Locality**, **Location — Country Code** to **Country Code**, and **Location — State / Province Code** to **State / Province**. Code choices resolve recognized stored names or codes using Craft's address data; unknown names produce an empty code. **Location — Full Address** provides a formatted text value, while the original **Location** option retains the whole structured value. With **Map fields**, select the regular destination form fields instead.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
