# Blocked IP addresses

Block submissions from the visitor IP addresses or network ranges you specify. Keep a shared list here and add extra entries to individual forms.

## Set up the default list

1. Choose whether the integration is **Enabled by default**.
2. Enter one IP address or CIDR network range per line in **Default Blocked IP Addresses**.
3. Save the integration.

<details>
<summary>Address and network examples</summary>

```text
192.0.2.10
192.0.2.0/24
2001:db8::1
2001:db8::/32
```

A single address matches that visitor IP. CIDR notation matches a network range. IPv4 and IPv6 are supported.

</details>

<details>
<summary>DNS block list checks</summary>

In **Advanced settings**, enable **Check DNS Block Lists** to query external DNS block lists in addition to your own IP list.

Enter one DNS block list hostname per line in **Default DNS Block Lists**. Use hostnames, not website URLs. The list is shown when checking is enabled. Turning checking off does not delete the saved hostnames.

You can add extra DNS block lists for a particular form in the form builder. They are combined with the default DNS list.

</details>

## Use the list on a form

1. Open the form and select **Integrations**.
2. Enable this integration if it is not already enabled.
3. Add form-specific entries if needed. These are combined with the default list rather than replacing it.
4. Save the form.

Matches mark the submission as spam. Freeform's spam settings determine how the submission is handled.
