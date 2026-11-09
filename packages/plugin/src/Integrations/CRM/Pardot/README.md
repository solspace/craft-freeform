# Salesforce Account Engagement setup

Connect Freeform to **Salesforce Marketing Cloud Account Engagement**, formerly Pardot. Freeform uses Salesforce OAuth and version 4 of the Account Engagement API to create prospects with standard and custom field values.

Existing integrations keep their credentials, authorization, and field mappings. You may still see **Pardot** in Salesforce menus, OAuth permissions, and API URLs.

## Connect your account

1. Copy **OAuth Callback URL** from Freeform.
2. Configure a Salesforce OAuth app with that exact callback URL. See **Set up a Salesforce app** below.
3. Copy the app's consumer key into **Client ID** and its consumer secret into **Client Secret**.
4. Enter your **Business Unit ID**. In Salesforce Setup, search for **Business Unit Setup** and copy the 18-character ID beginning with `0Uv`. Your Salesforce administrator can provide it if you do not have access.
5. Leave **Salesforce login options** at their defaults unless your administrator specifies a different login server.
6. Save the integration, then click **Authorize**. Sign in with a Salesforce user who has Account Engagement access and approve the requested permissions.

When the connection succeeds, Freeform shows the integration as authorized.

<details>
<summary>Set up a Salesforce app</summary>

For new connections, use an **External Client App**, as described in [Salesforce's Account Engagement quick start](https://developer.salesforce.com/docs/marketing/pardot/guide/getting-started.html).

1. In Salesforce Setup, search for **External Client Apps** and open the app manager.
2. Create an app for Freeform and enable OAuth.
3. Paste Freeform's **OAuth Callback URL** into the app's callback URL field. Copy the generated value rather than typing an example URL.
4. Include these OAuth scopes, which Freeform requests during authorization:
   - `pardot_api` for Account Engagement access. Salesforce may label this **Manage Pardot services** or **Access Pardot services**.
   - `api` for Salesforce API access.
   - `refresh_token` for keeping the connection authorized. Salesforce may show this alongside `offline_access`.
5. Enable the authorization code / web server flow. Freeform uses PKCE and a client secret.
6. Save the app. In its OAuth settings, open the consumer key and secret details and copy them into Freeform.

Make sure the Salesforce user is permitted to use the app under your organization's access policies. A new app can take up to 15 minutes to become available.

See [Salesforce's OAuth settings guide](https://help.salesforce.com/s/articleView?id=sf.configure_external_client_app_oauth_settings.htm&language=en_US&type=5) for the available app policies.

</details>

<details>
<summary>Use an existing Connected App</summary>

Existing Salesforce **Connected Apps** can continue to work. You do not need to replace a working app for this Freeform update.

In Salesforce **App Manager**, open your Connected App. Check that OAuth is enabled, its callback URL matches Freeform's **OAuth Callback URL**, and it includes the scopes listed above. Copy its consumer key into **Client ID** and consumer secret into **Client Secret**.

Salesforce now recommends External Client Apps for new connections. See [Salesforce's Connected App guidance](https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm&language=en_US).

</details>

<details>
<summary>Choose a Salesforce login server</summary>

**Salesforce login options** affects where you sign in during OAuth authorization. Expanding or collapsing the panel does not change its settings.

- **Standard login:** leave both options disabled to use `https://login.salesforce.com`.
- **Use Salesforce sandbox login:** uses `https://test.salesforce.com` for authorization.
- **Use custom Salesforce login URL:** uses the full URL in **Salesforce login URL**, such as `https://mycompany.my.salesforce.com`. A custom URL takes priority over the sandbox login option.

These options only select the Salesforce login server. This integration's Account Engagement API requests currently use the production endpoint at `https://pi.pardot.com/api`.

</details>

## Map your form

1. Open your form in Freeform and select **Integrations**.
2. Choose **Salesforce Account Engagement (Pardot)**. Existing instances may still have a name you assigned earlier.
3. Enable the integration and turn on **Map to Prospect**.
4. Map the form's email field and any other prospect fields you need. Enable **Map to Custom** to include custom prospect fields.
5. Save the form.

<details>
<summary>Troubleshoot authorization</summary>

- Check that the callback URL in Salesforce matches the value displayed by Freeform exactly.
- Confirm that you used the app's consumer key and secret, rather than your Salesforce username and password.
- Confirm that the Business Unit ID belongs to the Account Engagement business unit you want to use.
- Check that the Salesforce user has Account Engagement access and can authorize the app.
- If you move from development to production, update the app's callback URL to match the production site and authorize the connection there.

For authentication requirements, see [Salesforce's Account Engagement authentication guide](https://developer.salesforce.com/docs/marketing/pardot/guide/authentication).

</details>
