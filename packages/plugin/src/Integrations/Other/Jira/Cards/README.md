# Jira setup

Create Jira Cloud issues from Freeform submissions using OAuth and Jira REST API version 3. Each Freeform Jira integration connects to one site and project. Create another integration if you need to send data to another project.

## Connect your account

1. Copy **OAuth Callback URL** from Freeform.
2. Configure the Atlassian OAuth app used for this connection with that exact callback URL. See **OAuth app settings** below.
3. Copy the app's **Client ID** and **Secret** into Freeform's **Client ID** and **Client Secret** fields.
4. Enter your **Jira Site URL**, such as `https://your-team.atlassian.net`.
5. Enter the **Project Key**, such as `SUPPORT`.
6. Save the integration, then click **Authorize**. Sign in with the Atlassian account that should create the issues and approve the requested access.

When the connection succeeds, Freeform shows the integration as authorized. Existing credentials, authorization, and mappings are preserved.

<details>
<summary>OAuth app settings</summary>

Use an OAuth 2.0 app approved for your organization. Your Atlassian administrator or integration maintainer can provide its credentials and configure access.

In the [Atlassian developer console](https://developer.atlassian.com/console), the app needs Jira API access with these classic scopes:

- `write:jira-work`
- `read:jira-work`
- `read:jira-user`

Freeform also requests `offline_access` to keep the connection authorized.

In the app's OAuth 2.0 authorization settings, set the callback URL to Freeform's **OAuth Callback URL**. Find the **Client ID** and **Secret** in the app's settings.

See [Atlassian's OAuth app guide](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/) for current app setup, access, and distribution requirements.

</details>

<details>
<summary>Choose a site and project</summary>

**Jira Site URL** identifies the site to use when the Atlassian account can access more than one. If left blank, Freeform uses the first available site.

**Project Key** identifies the destination project. If left blank, Freeform selects the first available project when authorizing. Enter it explicitly when you have multiple projects so the destination is clear.

The authorizing user must have access to the site and project and permission to create issues there.

</details>

## Map your form

1. Open your form in Freeform and select **Integrations**, then **Jira**.
2. Enable the integration.
3. Map your fields to Jira issue fields. Supply **Issue Type** and **Summary**, along with any other fields required by your Jira project.
4. Save the form.

<details>
<summary>Troubleshoot authorization and mapping</summary>

- Check that the callback URL matches Freeform's displayed value exactly.
- Use the OAuth app's client ID and secret, rather than your Atlassian password or an API token.
- Check that the site URL and project key match the destination you want to use.
- Confirm that the app's scopes and the authorizing user's permissions allow access to the project and fields you need.
- If you move from development to production, update the app's callback URL and authorize the production connection.

</details>
