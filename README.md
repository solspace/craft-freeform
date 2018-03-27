# Solspace Freeform plugin for Craft CMS 3.x

Freeform is the most powerful form building plugin for Craft CMS. It gives you full control to create simple or complex multi-page forms, as well as connect your forms to many popular API integrations.

🚨 **IMPORTANT: Freeform has proven to be fairly stable now, but please take caution if using Freeform in production environments. Always backup your site before upgrading, etc. 🐛 Any issues during the beta should only be reported on [GitHub Issues](https://github.com/solspace/craft3-freeform/issues) please.** 🚨

![Screenshot](src/icon.svg)

## Requirements

This plugin requires Craft CMS 3.0.0-RC1 or later.

## Installation

To install the plugin(s), search for **Freeform** in the *Craft Plugin Store*, or install manually with the following instructions:

1. Open your terminal and go to your Craft project:

        cd /path/to/project

2. Then tell Composer to require the plugin:

        composer require solspace/craft3-freeform

And if you'd like the **Pro** edition of Freeform, you'll need to also install Freeform Pro (in addition to Freeform Lite). Tell Composer to also require the plugin:

        composer require solspace/craft3-freeform-pro

3. In the Control Panel, go to *Settings → Plugins* and click the “Install” button for **Freeform Lite** (and **Freeform Pro** if you're wanting Pro edition).

## Freeform Overview

Freeform centers itself around the idea of letting admins and/or clients enjoy the experience of building and managing simple or complex forms in an intuitive interface that lets you see a live preview of the forms you're building. We call this Composer, where almost everything is at your fingertips as it aims to stay out of your way and let you do as much as possible without having to move around to other areas in the control panel. At the same time, Freeform is very powerful and flexible, so there is also a wide variety of other features, settings and options.

Freeform uses its own set of fields and field types. Fields are global and available to all forms, but they can also be overwritten per form. This allows you to save time reusing existing fields when making other forms, but also gives you flexibility to make adjustments to them when needed. So to clarify, you can create fields with labels and options that are common to all forms, but also override those on each form. An advanced set of fields are available with purchase of Freeform Pro.

Email notifications are global and can be reused for multiple forms, saving you time when you are managing many forms. Freeform allows you to send email notifications upon submittal of a form 5 different ways, each with their own content/template. Email templates can be managed within Craft control panel (saved to database), or as HTML template files.

Freeform attempts to do all the heavy lifting when it comes to templating. Our looping templating approach allows you to automate all or almost all of your form formatting.

Freeform also allows for true multi-page forms, has its own built in spam protection service, and Freeform Pro supports several popular Mailing List and CRM (Customer Relationship Management) API integrations, including MailChimp, Constant Contact, Campaign Monitor, Salesforce and HubSpot.

Last but not least, included with Freeform is a set of Demo Templates that can be installed on your site, instantaneously giving you a real-world set of styled, working templates.


## Using Freeform

Full documentation for Freeform can be found on the [Solspace website](https://solspace.com/craft/freeform/docs).
