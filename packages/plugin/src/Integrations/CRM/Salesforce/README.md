# Salesforce CRM setup

Send Freeform submissions to Salesforce **Leads**, **Accounts**, **Contacts**, and **Opportunities**. This integration uses Salesforce OAuth and REST API version 58. It is separate from **Salesforce Account Engagement (Pardot)**, which creates marketing prospects.

Your Salesforce organization must support API access, and the authorizing user needs permission to access the records and fields you map. Check [Salesforce's API access requirements](https://developer.salesforce.com/docs/platform/api-rest/guide/intro-rest-compatible-editions.html) if you are unsure.

## Connect your account

1. Copy **OAuth Callback URL** from Freeform.
2. Configure a Salesforce OAuth app with that exact callback URL. See **Set up a Salesforce app** below.
3. Copy the app's consumer key into **Client ID** and its consumer secret into **Client Secret**.
4. Leave **Salesforce login options** at their defaults unless you use a sandbox or your administrator specifies a custom login URL.
5. Save the integration, then click **Authorize**. Sign in with the Salesforce user you want Freeform to use and approve the requested permissions.

When the connection succeeds, Freeform shows the integration as authorized. Existing connections keep their authorization, credentials, and field mappings.

<details>
<summary>Set up a Salesforce app</summary>

For new connections, create an **External Client App** in Salesforce Setup. Search for **External Client Apps** and open the app manager.

1. Create an app for Freeform and enable OAuth.
2. Paste Freeform's **OAuth Callback URL** into the callback URL field. Copy the generated value rather than typing an example URL.
3. Add the `api` scope for Salesforce API access and the `refresh_token` scope so Freeform can keep the connection authorized. Salesforce may display the latter alongside `offline_access`.
4. Enable the authorization code / web server flow. Freeform uses a client secret and PKCE. Keep the corresponding secret and PKCE requirements enabled.
5. Save the app. In its OAuth settings, open the consumer key and secret details and copy them into Freeform.

The authorizing user must be allowed to use the app under your organization's access policies. See [Salesforce's OAuth settings guide](https://help.salesforce.com/s/articleView?id=sf.configure_external_client_app_oauth_settings.htm&language=en_US&type=5) for current settings and policy options.

</details>

<details>
<summary>Use an existing Connected App</summary>

Existing Salesforce **Connected Apps** can continue to work. You do not need to replace a working app for this Freeform update.

Open the app in Salesforce **App Manager**. Check that OAuth is enabled, its callback URL matches Freeform's **OAuth Callback URL**, and it includes `api` and `refresh_token`. Use the app's consumer key and secret as Freeform's **Client ID** and **Client Secret**.

Salesforce recommends External Client Apps for new connections. See [Salesforce's Connected App guidance](https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm&language=en_US).

</details>

<details>
<summary>Choose a Salesforce login server</summary>

Expand **Salesforce login options** if you need to change where OAuth authorization takes place. Opening or closing the panel does not change its settings.

- **Standard login:** leave both options disabled to use `https://login.salesforce.com`.
- **Use Salesforce sandbox login:** uses `https://test.salesforce.com` for authorization.
- **Use custom Salesforce login URL:** uses the full URL in **Salesforce login URL**, such as `https://mycompany.my.salesforce.com`. A custom URL takes priority over the sandbox login option.

After authorization, Freeform uses the Salesforce instance returned by OAuth for API requests.

</details>

## Map your form

1. Open your form in Freeform and select **Integrations**.
2. Choose **Salesforce CRM**. Existing instances may still have a name you assigned earlier.
3. Enable the integration and select the objects you want to send data to.
4. Map the form fields to the matching Salesforce fields and save the form.

Only enabled objects receive submission data. You can use more than one object on the same form.

<details>
<summary>Leads and follow-up tasks</summary>

**Map to Leads** creates a Lead from the mapped fields.

- **Update Duplicate Leads** looks for a matching email address and updates the existing Lead instead of creating another.
- **Assign Lead Owner** lets Salesforce apply its lead assignment rules.
- **Convert Leads to Contact Tasks for Returning Customers** checks for an existing Contact with the submitted email address. If found, Freeform creates a Task for that Contact instead of a Lead. Use **Task Subject** and **Task Due Date** to configure the task. The due date accepts a relative expression such as `2 days`.

</details>

<details>
<summary>Accounts, Contacts, and Opportunities</summary>

**Accounts** represent companies or organizations. By default, Freeform looks for an Account with the mapped name and updates it if found. If no Account name is mapped, Freeform uses the mapped Contact's first and last name.

**Contacts** represent people. Freeform first looks for a matching email address, then a matching name. It updates a match or creates a Contact. When Freeform has created or matched an Account for the submission, it links the Contact to that Account.

**Opportunities** represent potential deals. Freeform creates a new Opportunity for each submission sent to this object and links it to the matched or created Account when available. Set **Close Date** with a relative expression such as `7 days` and enter a **Stage Name** that exists in Salesforce.

</details>

<details>
<summary>Duplicate matching and checkbox values</summary>

By default, Account matching uses the Account name. Contact matching checks email first, then name.

The **Check Contact email address and Account website when checking for Duplicates** option changes Account matching to use the website. If no website is supplied, Freeform uses the domain from the mapped Contact's email address. Contact matching still checks email first, then name.

The **Append Checkboxes field values** options for Accounts and Contacts add new mapped checkbox selections to the existing values instead of replacing them.

These settings do not prevent new Opportunities from being created.

</details>

<details>
<summary>Uploaded files and field types</summary>

Enable **Attach Uploaded Files** for each object that should receive the submission's uploads. Freeform sends the files to Salesforce and links them to the corresponding record.

Supported mapping types include text, email, phone, URLs, picklists, multi-select picklists, numbers, currency, booleans, dates, and date/times. Reference fields expect Salesforce record IDs. Available fields depend on the authorizing user's permissions.

</details>

<details>
<summary>Troubleshoot authorization</summary>

- Check that the callback URL in Salesforce matches the value displayed by Freeform exactly.
- Confirm that you used the app's consumer key and secret, rather than your Salesforce username and password.
- Confirm that API access is available for your organization and that the user can access the objects and fields you map.
- Check that the app allows the authorizing user and includes the `api` and `refresh_token` scopes.
- If you move from development to production, update the app's callback URL to match the production site and authorize the connection there.

</details>
