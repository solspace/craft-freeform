# Setup Guide
This integration allows you to map Freeform submission data to [Craft User](https://craftcms.com/docs/4.x/users.html), essentially creating a powerful [User Registration form](https://docs.solspace.com/craft/freeform/v5/guides/guide/user-registration/).

<span class="note warning"><b>Important:</b> This feature requires a <b>Craft Pro</b> license in order to work, as Users are a Craft Pro feature.</span>

## Setup Instructions

### 1. Create the Integration

- Set the defaults for the next 3 settings (these can be changed when configuring in the form builder later):
    - Choose a user group from the **User Group** select dropdown.
    - Toggle whether the user account should be **Active** or not.
    - Toggle whether to **Send an Activation Email** to the user or not.
- Click the **Save** button.

### 2. Configure the Form

- Open up the form inside the form builder.
- Click on the **Integrations** tab.
- Click on your new **User** integration in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Confirm the user group in the **User Group** field, or change it as necessary.
      <span class="note danger"><b>CAUTION:</b> All user groups, including ones with access to control panel will show here. Use extreme caution if allowing users to self-register for accounts that can access the Craft control panel!</span>
    - Toggle whether the user account should be **Activated** or not.
        - If you'd like new users to not yet be activated and receive the Craft User Activation email, toggle the **Activate Users** setting ON. If you'd like to manually approve registrations and suppress the email notification to users, toggle the **Send Activation Email** setting OFF.
    - Toggle whether to **Send an Activation Email** to the user or not.
      <span class="note danger"><b>CAUTION:</b> When using a manual Admin approving approach, it's still possible for a <b>Pending</b> user to circumvent this process if a <a href="https://craftcms.com/knowledge-base/front-end-user-accounts#reset-password-forms">Forgot Password</a> form is available to them, as Craft currently does not have a concept of Admin approval only, and allows users to verify their account either through an email notification or using a <i>Forgot Password</i> form.</span>
    - The **Attribute Mapping** table allows you to map standard Craft User fields.
        - You will need to use the special [Password](https://docs.solspace.com/craft/freeform/v5/forms/fields/#password) field for mapping passwords to User passwords. The Freeform **Password** field will NOT save any password data in the Freeform database tables. It is designed specifically for this purpose.
    - The **Field Mapping** table is where you map Freeform fields to the Craft User fields as needed.

See [Mapping Guidelines](https://docs.solspace.com/craft/freeform/v5/integrations/elements/#mapping-guidelines) for more info.

### Craft 5 Addresses Fields

Native Craft 5 **Addresses** custom fields appear as individual components in **Field Mapping**, such as **Mailing Address — Address Line 1**, **Mailing Address — City / Locality**, and **Mailing Address — Country Code**. Map components to Freeform fields, fixed values, or Twig expressions. Use two-letter country codes such as `CA` or `US`, and the state/province codes expected by Craft for that country, such as `MB` or `NY`.

Each mapped Addresses field creates one address when empty, or updates its first address when editing an existing user. New addresses use the Craft field's name as their label unless **Label** is mapped. Additional addresses, unmapped components, and custom address fields are preserved. Mapped blank values clear existing components; an entirely blank optional address does not create an address. Element editing prefills mapped fields from the first address. Craft validates and saves addresses along with the user.

This supports Addresses custom fields attached to users. Craft's separate user address book is not a mapping target.

Freeform **Location** fields using **Include fields** expose their included components in the integration field picker. Select **Location — Country Code** and **Location — State / Province Code** for Craft's coded components, or map the street, city, and postal code individually. These choices work across integration mapping tables. Recognized names and codes resolve using Craft's address data; unknown names produce an empty code. **Location — Full Address** provides formatted text, and the original **Location** option retains its structured value. With **Map fields**, select the regular destination form fields instead.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
