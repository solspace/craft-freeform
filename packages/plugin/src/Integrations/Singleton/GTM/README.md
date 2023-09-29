# Setup Guide

This guide assumes you have a basic understanding of [Google Tag Manager](https://tagmanager.google.com/).

## Setup Instructions

### 1. Enable Google Tag Manager inside Freeform

- Enable GTM by toggling on the **Enabled** setting.
- If you'd like GTM to be enabled for all forms by default, toggle on the **Enabled by default** setting.
- If you wish to have Freeform insert its own scripts, enter your GTM ID (`GTM-XXXXXX`) in the **Container ID** setting and a custom event name (if applicable) in the **Event Name** setting.
- Save the form.

### 2. Configure the Form
To use this integration on your form(s), you'll need to configure each form individually. If you toggled on the **Enabled by default** setting in the Freeform Settings, it will automatically be ON for all forms. You can disable them for each form as necessary.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Google Tag Manager** in the list of available integrations.
- On the right side of the page:
    - Enable (or disable) the integration.
    - Adjust any of the settings as needed.
- Save the form.

### 3. Customizing
To customise what gets sent to the events, you can write your own JS and add an event listener in your template, like this:

``` js
window.addEventListener('freeform-gtm-data-layer-push', function (event) {
    event.payload.myCustomValue = 'something_here';
    event.payload.otherCustomValue = 'other_value';
});
```

This would then attach whatever you add to the payload to the event that is being pushed to GTM.

### 4. Submit a Test Submission

- Visit your form on your site.
- Fill out the form and submit it.
- The data should have been pushed to GTM using the specified event name.

<span class="note tip"><b>Important:</b> The success of this is not observable on your site, as this event goes to GTM via some sockets, so there's nothing in the network tab.</span>

### 5. Check Google Tag Manager
To see if your test worked correctly, visit the [Google Tag Manager](https://tagmanager.google.com/) website and open your project workspace. Then click on the **PREVIEW** button near the top right side of the page.

### 6. Troubleshooting
Google offers a [Tag Assistant](https://tagassistant.google.com/) tool along with a [Tag Assistant Companion](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm) Chrome extension. These help troubleshoot installation of `gtag.js` and **Google Tag Manager**. When the Chrome extension is present, it enables additional features for Tag Assistant including debugging iframes and debugging multiple windows from the same debug session.

<style type="text/css">ol{padding-left:20px!important}ol>li{font-weight:600}ol>li>ul>li{font-weight:400}.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}.tip {color:#1f5fea;display:block;padding:10px 15px;border:1px solid #1f5fea;border-radius:5px;}</style>