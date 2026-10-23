# Google Places

Add address autocomplete to Freeform's **Location** field. Requires **Freeform Pro** and Google Places API (New).

## Google Cloud setup

Your existing Google Cloud account is enough; no separate Google Maps Platform account is needed.

1. Open the [Google Cloud console](https://console.cloud.google.com/) and select or create a project.
2. **Enable billing** for the project. Billing is required even when usage stays within Google's monthly free allowances. See [current pricing](https://developers.google.com/maps/billing-and-pricing/pricing).
3. In **APIs & Services → Library**, enable **Maps JavaScript API** and **Places API (New)** in that project.
4. Under **Google Maps Platform → Credentials**, create an API key and restrict it:
   - **Application restrictions:** Choose **Websites (HTTP referrers)** and add your production, staging, and development domains as needed.
   - **API restrictions:** Allow **Maps JavaScript API** and **Places API (New)**.

This key is used in the browser and will be visible in your site's HTML. Website and API restrictions protect it from unauthorized use. See Google's [API key setup](https://developers.google.com/maps/documentation/javascript/get-api-key) and [restriction guidance](https://developers.google.com/maps/api-security-best-practices).

## Connect Freeform

1. Install **Google Places** under **Freeform → Integrations → Other**.
2. Enter the key in **Browser API Key**, or use an environment variable containing it, and save.
3. Open your form's **Integrations** tab and enable **Google Places**.
4. Add a **Location** field, select the **Google Places Integration**, and choose **Include fields** or **Map fields**.

Suggestions appear after visitors type at least three characters. If search is unavailable, visitors can enter their address manually. Location also works without Google as a manual address group using **Manual entry only** + **Include fields**.

Google usage charges are separate from your Freeform license. Review [quotas, budgets, and alerts](https://developers.google.com/maps/billing-and-pricing/manage-costs) to manage usage; budget alerts do not automatically stop spending. If autocomplete does not work, check billing, both enabled APIs, and the key's restrictions, or consult Google's [API error guide](https://developers.google.com/maps/documentation/javascript/error-messages).
