# Solspace Freeform plugin for Craft CMS 3.x

Freeform is the most powerful form building plugin for Craft CMS. It gives you full control to create simple or complex multi-page forms, as well as connect your forms to many popular API integrations.

![Screenshot](src/icon.svg)

## Requirements

This plugin requires Craft CMS 3.0.0 or later.

## Installation

To install Freeform, simply:

1. Go to the **Plugin Store** area inside your Craft control panel and search for *Freeform*.
2. Choose to install *Freeform Lite* and/or *Freeform Pro* (*Pro* requires *Lite* to be installed) by clicking on them.
3. Click on the **Try** button to install a trial copy of Freeform.
4. Try things out and if Freeform is right for your site, and then purchase a copy of it through the Plugin Store when you're ready!

Freeform can also be installed manually through Composer:

1. Open your terminal and go to your Craft project: `cd /path/to/project`
2. Then tell Composer to require the plugin: `composer require solspace/craft3-freeform`
3. If you'd like Freeform Pro, also run: `composer require solspace/craft3-freeform-pro`
4. In the Craft control panel, go to *Settings → Plugins* and click the **Install** button for Freeform Lite (and Freeform Pro if you're using Pro edition).

## Freeform Overview

Freeform centers itself around the idea of letting admins and/or clients enjoy the experience of building and managing simple or complex forms in an intuitive interface that lets you see a live preview of the forms you're building. We call this Composer, where almost everything is at your fingertips as it aims to stay out of your way and let you do as much as possible without having to move around to other areas in the control panel. At the same time, Freeform is very powerful and flexible, so there is also a wide variety of other features, settings and options.

Freeform uses its own set of fields and field types. Fields are global and available to all forms, but they can also be overwritten per form. This allows you to save time reusing existing fields when making other forms, but also gives you flexibility to make adjustments to them when needed. So to clarify, you can create fields with labels and options that are common to all forms, but also override those on each form. An advanced set of fields are available with purchase of Freeform Pro.

Email notifications are global and can be reused for multiple forms, saving you time when you are managing many forms. Freeform allows you to send email notifications upon submittal of a form 5 different ways, each with their own content/template. Email templates can be managed within Craft control panel (saved to database), or as HTML template files.

Freeform attempts to do all the heavy lifting when it comes to templating. Our looping templating approach allows you to automate all or almost all of your form formatting.

Freeform also allows for true multi-page forms, has its own built in spam protection service, and Freeform Pro supports several popular Mailing List and CRM (Customer Relationship Management) API integrations, including MailChimp, Constant Contact, Campaign Monitor, Salesforce and HubSpot.
Freeform also allows for true multi-page forms, has its own built in spam protection service (including **reCAPTCHA** for *Pro* edition), allows you to map/connect your submission data to Craft Elements, and *Freeform Pro* supports several popular Mailing List and CRM (Customer Relationship Management) API integrations, including MailChimp, Constant Contact, Campaign Monitor, Salesforce, HubSpot and Pipedrive.

Freeform Pro edition also includes Conditional Rules logic that can be added to forms. This feature allows you to effortlessly set fields to show or hide based on the contents/selection of other fields, and even skip pages based on the contents/selection of fields on a previous page.

Also available for Freeform is the [Freeform Payments](https://solspace.com/craft/freeform/docs/payments) add-on plugin, which adds support for Stripe payments on forms. Works with both Lite and Pro editions.

Last but not least, included with Freeform is a set of Demo Templates that can be installed on your site, instantaneously giving you a real-world set of styled, working templates.


## Using Freeform

Full documentation for Freeform can be found on the [Solspace website](https://solspace.com/craft/freeform/docs).
