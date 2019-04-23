# Solspace Freeform Changelog

## 2.5.19 - 2019-04-23
### Added
- Added Insightly CRM Lead integration for Freeform Pro edition.

### Changed
- Updated Hidden fields to be in their original field position (instead of first in form) when viewing submissions in the CP.
- Updated Date field picker and format getters to be public.

### Fixed
- Fixed a bug where Form Color setting for forms was only visible in Pro edition.
- Fixed a bug where using `DD/MM/YYYY` formatting and Min/Max date setting on Date fields would result in an error upon submit when validating.
- Fixed a bug where the Resend Notifications feature errored when email notifications extended layouts.
- Fixed a bug where permanently deleting fields could cause an error if assigned to an integration field list.

## 2.5.18 - 2019-04-18
### Added
- Added Active Campaign mailing list API integration (Pro edition).
- Added `EVENT_AFTER_GENERATE_RETURN_URL` developer event, allowing modifying of the return URL of forms.

### Changed
- Updated the HubSpot integration to not create blank Deals if no Freeform data is mapped to Deal fields.
- Updated the HubSpot integration to include an IP Address mapping setting, allowing you to map IP addresses to a custom field in Contacts.

## 2.5.17 - 2019-04-08
### Added
- Added a `getTagAttributes()` function to the Form component.

### Fixed
- Fixed a bug where loading more than 1 form in a page with reCAPTCHA would trigger JS errors.
- Fixed a bug where Users element connection was not always displaying all available fields for mapping for some User groups.
- Fixed a bug where the `renderSingleInput()` method would not work with any directly applied custom attributes, etc.

## 2.5.16 - 2019-03-28
### Fixed
- Fixed a bug where multi-page tabs would not allow you to re-arrange them in CP.
- Fixed a bug where user/group permissions for Settings didn't give access to create/edit API integrations and statuses.
- Fixed a bug where trying to load mailing lists for API integration would error when using PostgreSQL.

## 2.5.15 - 2019-03-25
### Changed
- Updated Flash success message to return 'Form submitted successfully' instead of `true`.
- Updated Dutch NL translation.

### Fixed
- Fixed a bug where email notification values were not always being escaped.
- Fixed a bug where API integration values for multi-option fields were being sent as option labels instead of option values.
- Fixed a bug where underscores in email notification templates were not rendering correctly.
- Fixed a bug where filtering submissions in CP by status was not working and returning an error.
- Fixed a bug where the CP Submissions chart could error when using PostgreSQL.
- Fixed a bug where Freeform has unused class that caused the Craft Webhooks plugin to fail.

## 2.5.14 - 2019-03-13
### Fixed
- Fixed a bug where using the User element connection with the Password field on a page other than the last page of multi-page forms would have the mapping fail.
- Fixed a bug where updating a mailing list integration's handle would cause it to duplicate instead.

## 2.5.13 - 2019-02-26
### Changed
- Updated Salesforce integrations to send over field data as strings (instead of integer) when mapping to a Salesforce Phone field type.

### Fixed
- Fixed a bug where the Submissions CP index page would error for some customers.
- Fixed a bug where submissions were not able to be restored (from soft delete) in Craft 3.1+.

## 2.5.12 - 2019-02-21
### Added
- Added getters for all form field attributes.

### Fixed
- Fixed a bug where soft deletes were not correctly affecting visual counts and stats in Freeform CP in Craft 3.1+.
- Fixed a bug where a migration was not working correctly in Craft 3.1+.
- Fixed a bug where User Registration forms would error if an optional User Photo field was setup and mapped and the user submitted without a photo.
- Fixed a bug where saving email notifications in the control panel would error in PHP 7.3. Updated the Markdownify dependency.

## 2.5.11 - 2019-01-30
### Fixed
- Fixed a bug where manually specifying field options (such as `fieldName.label`) in email notification templates were not working.

## 2.5.10 - 2019-01-24
### Fixed
- Fixed a bug where using the Export as CSV option was not exporting file uploads as the filename/full path.
- Fixed a bug where assets for file upload fields in CP submission edit view were no longer linked to be downloadable.

## 2.5.9 - 2019-01-21
### Added
- Added two new methods for the `EVENT_BEFORE_PUSH` developer event: `setValues($values)` which will override all values, and `addValue($key, $value)` which allows for a quick and easy value addition to the existing values.

### Changed
- Updated Freeform API to be accessible via console.
- Updated Salesforce Lead and Opportunity integrations to clear out all empty values before submitting to Salesforce.

### Fixed
- Fixed a bug where existing HTML block fields in Conditional Rules tab did not include their hash (for identifying which was which when more than one existed).
- Fixed a bug where an error could be triggered when Email Address spam blocking was enabled and shown below email fields.
- Fixed a potential XSS vulnerability on Email field types.
- Fixed a bug where the 'Add criteria' button in Conditional Rules feature was not working in Firefox.

## 2.5.8 - 2019-01-11
### Added
- Added 'Automatically Scroll to Form on Errors and Multipage forms?' setting to allow the ability to disable this feature.

### Changed
- Updated Freeform's developer events for compatibility with the Craft Webhooks plugin's [updated approach](https://github.com/craftcms/webhooks/blob/develop/CHANGELOG.md#112---2018-12-21) (v1.1.2).
- Updated Freeform to reset `siteId` for submissions in `elements_sites` database table to whichever site is the primary site (to prevent CP viewing issues if the primary site is switched along the way).

### Fixed
- Fixed a bug where adding a new File Upload field to a form that had defaults of no file kinds checked (implying allow ALL file types) would not save correctly to the form layout and error when submitting the form.
- Fixed a bug where fields shown/hidden with Conditional Rules feature that were dependent on checkboxes were not being correctly included in email notifications or showing in the submission detail view in control panel.
- Fixed a bug where attempting to change the status of a submission in the control panel was not working.
- Fixed a bug where the "Manage All Submissions" user/group permission was not allowing users to view or whitelist spam submissions.

## 2.5.7 - 2018-12-20
### Changed
- Updated Freeform's developer events for compatibility with the Craft Webhooks plugin.
- Improved file cleanup and submission/spam purge. File cleanup no longer triggers on every request and does not clear DB cache to check for table existence.
- Optimized the Submission element.
- Disabled automatic emoji conversion support for now to allow for significant performance improvements.

### Fixed
- Fixed a bug where updating submissions inside control panel would detach uploaded files.

## 2.5.6 - 2018-12-18
### Added
- Added `EVENT_AFTER_RESPONSE` developer event for all API integrations.

### Changed
- Updated Demo Templates installer to be compatible with Craft 3.1.
- Updated File Upload fields in Freeform CP Submissions list to use Craft element viewer/editor.

### Fixed
- Fixed a bug where the `overrideValues` parameter was not working for pre-selecting options for multi-option field types.
- Fixed a bug where Freeform Payments was logging credit card decline/fail errors to the Freeform error log.

## 2.5.5 - 2018-12-11
### Fixed
- Fixed a bug where Conditional Rules feature settings inside Composer stopped working correctly after 2.5.4 update.
- Fixed a bug where Freeform would error when attempting to install on Craft 3.1.
- Fixed a bug where the 2.5.4 update migration would error for PostgreSQL users.
- Updated `freeform.submissions` to check if a Form object is passed to submission query form variable, and extract the form handle from that.
- Fixed a bug where Freeform Payments subscription transactions that failed would not contain any (failed) Payment information attached to the submission.

## 2.5.4 - 2018-12-07
### Changed
- Updated Salesforce Lead and Opportunities integrations to work with Date/Time fields and more reliably with numeric data.

### Fixed
- Fixed a bug where File Upload fields would hold the form back from submitting if required and also hidden due to Conditional Rules logic.
- Fixed a bug where loading the same form twice in the same template (even with `fieldIdPrefix` parameter) would have issues with JS-related features and fields.
- Fixed a potential issue where multi-page forms could be submitted more than once, causing the form to fail/lose its place.
- Fixed a bug where `status` filtering on Submissions in front end was not correctly working with pagination.
- Fixed a bug where the Min Date and Max Date feature for Date & Time fields were not accounting for all formatting variations.
- Fixed a bug where users and user groups with the 'Manage all Submissions' permission (only) were not able to export submissions as CSV.
- Fixed a bug where payments for Freeform Payments were not going through correctly when using with Built-in AJAX feature.
- Fixed a bug where the US States predefined options list contained more than official states. Also added a States & Territories list that contains official states and territories.
- Fixed a bug where the 'Spam Automatic Purge enabled' line in settings overview on Dashboard would always show 1 day.

## 2.5.3 - 2018-11-28
### Fixed
- Fixed a bug where the Recent Submissions widget was causing an error in the Craft Dashboard page.
- Fixed a bug where `rand()` and other native SQL functions did not work for `orderBy` parameter in `freeform.submissions`.

## 2.5.2 - 2018-11-27
### Added
- Added Freeform Submissions Element Fieldtype.

### Changed
- Updated Conditional Rules feature to now include Submit buttons and HTML blocks.

### Fixed
- Fixed a bug where Conditional Rules feature was not working with File Upload fields.
- Fixed a bug where setting a `class` attribute in Composer for field labels would sometimes not render correctly.
- Fixed a bug where the Built-in AJAX feature was still attempting to redirect after successful submit.
- Fixed a bug where Conditional Rules feature was not excluding fields hidden from logic in email notifications.
- Fixed a bug where ordering Submissions in front end was not working correctly.

## 2.5.1 - 2018-11-20
### Changed
- Updated the way reCAPTCHA handles loading in templates. When loading an entire form via AJAX, you'll need to manually load the reCAPTCHA JS yourself now. AJAX demo templates are updated to reflect this.

### Fixed
- Fixed a bug where restricted users/user groups were able to see form submissions they didn't have access to when clicking on 'All Submissions' filter in control panel.
- Fixed a bug where the 'Export to CSV' feature would error for some users/user groups.
- Fixed a bug where the 'Freeform Javascript Insertion Location' setting was not defaulting to 'Inside Form' (which offers better support for AJAX and other convenience features, etc) for fresh installs.

## 2.5.0 - 2018-11-14
### Added
- Added ability to 1-click enable built-in AJAX (anywhere) for forms via Composer.
- Added ability to set attributes for labels, inputs, errors and instructions directly inside Composer property editor for fields.
- Added ability to resend email notifications from the control panel for submissions.
- Added ability to set static and relative date restrictions to the Date fieldtype.
- Added Composer setting for Radio fieldtype to display options on a single line (instead of list).
- Added Salesforce Opportunities API integration (Pro edition).
- Added Assets element data feeder option for populating multi-option fieldtypes.
- Added Quick Form Craft Dashboard Widget. Allows you to set up support forms for clients, etc.
- Added setting to disable rendering of HTML inside Composer & Submissions views.
- Added `status` parameter to `freeform.form` function so that statuses can be set at template level.

### Changed
- Updated Salesforce Lead integration to optionally accept credentials to be entered via the Freeform control panel and saved to database.
- Updated the Craft User Element connection to respect Craft's `autoLoginAfterAccountActivation` config setting and allow new user registrations to automatically be logged in.
- Updated CRM integrations to allow for Freeform Payments data to be mapped to CRM fields.
- Updated CRM integrations with more than 1 object mapped to have separate field mapping tables (cleaner interface).

### Fixed
- Fixed a bug where Phone fieldtype would have a JS map file error in front end.
- Fixed a bug where some update migrations could error for PostgreSQL users.
- Fixed a bug where default formatting templates and demo templates had incorrect order of Twig filters that prevented HTML from being rendered in field option labels.
- Fixed a bug where File uploads were not being mapped to User Photo field correctly (in User Element Connection).
- Fixed some visual bugs in Composer for required asterisks.

## 2.4.3 - 2018-11-09
### Fixed
- Fixed a bug where CSV exports could sometimes error on multi-option field types.
- Fixed a bug where Widgets and the Freeform Dashboard could error in PostgreSQL and some versions of MySQL.

## 2.4.2 - 2018-11-06
### Added
- Added dotmailer mailing list integration for Freeform Pro edition.

### Fixed
- Fixed a bug where Exports were not showing the correct localized dates.
- Fixed a bug where Payments would sometimes error when using dynamic subscription-based payments.
- Fixed a bug where viewing the Submissions and Spam Folder pages would error when a form contained a dash in its handle.
- Fixed a bug where Rating fields were not displaying the stars CSS in rendered forms and CP submissions view.
- Fixed a bug where there were a couple different JS warnings in CP submissions view and inside rendered forms, when using certain special fields.
- Fixed a bug where submitting a form would error if an invalid/removed email notification template was assigned to that form.
- Fixed a bug where the 'Reset' spam button would incorrectly show in CP Forms list page when using with Spam Folder.

## 2.4.1 - 2018-10-12
### Changed
- Updated Spam Counts for forms to correctly reflect the number of submissions in spam folder when Spam Folder is enabled.
- Updated Element Feeder feature to include Site selector to allow specifying of alternate site content.

### Fixed
- Fixed a bug where all API integrations were always forcing a refresh on each form edit page.
- Fixed a bug where the Email field type and some others were not correctly mapping to Craft Entries in Element Connections feature.
- Fixed a bug where the Phone field type JS validation was causing issues in IE11.
- Fixed a bug where uploaded files were no longer displaying in CP submission detail view.

## 2.4.0 - 2018-10-05
### Added
- Added Conditional Rules logic for fields and pages!
- Added Dashboard that gives you convenient insights and an overview of your forms, submissions, settings and logged errors.
- Added an Error Log page inside Freeform control panel area to conveniently check for Freeform-related errors.

### Changed
- Improved Composer's Property Editor heading to have tabs and larger titles instead of buttons.
- Consolidated Freeform's many error log file writing into a unified `freeform.log` error log file.
- Updated Dashboard widget charts to start at `0` and no longer display negative numbers when there's no data.
- Updated column breakpoint for Bootstrap formatting templates to be `sm` instead of `lg`.

### Fixed
- Fixed a bug where File Upload fields weren't respecting `extraAllowedFileExtensions` config override setting.
- Fixed a bug where the Freeform 2.3 migration would not work correctly with PostgreSQL.
- Fixed a bug where `Submission::__isset()` check was sometimes returning `null` instead of `false`.

## 2.3.4 - 2018-09-24
### Changed
- Updated page changes (forward and backward) in multipage forms to auto-scroll to form (helpful if your form is lower down on page).

### Fixed
- Fixed a bug where Salesforce API connections were still holding their connection.
- Fixed a bug where the SharpSpring API integration was not connecting to SharpSpring.
- Fixed a bug where forms would error on front end if Spam Blocking keywords contained regex-specific symbols.

## 2.3.3 - 2018-09-17
### Fixed
- Fixed a bug where Payments were not working correctly in Flexbox and Grid formatting templates and demo templates.

## 2.3.2 - 2018-09-14
### Fixed
- Various bug fixes for Freeform Payments feature.
- Bug fixes and improvements to demo and sample templates to better accommodate Freeform Payments.

## 2.3.1 - 2018-09-13
### Changed
- Updated reCAPTCHA field to only be allowed once per form (disappears from Special fields list when in use).
- Various tweaks and improvements for Freeform Payments compatibility.

## 2.3.0 - 2018-09-12
### Added
- Added ability to set Mailing List fields as hidden fields (automatically opting in users).

### Changed
- Updated for compatibility with future Freeform Payments add-on plugin.
- Number fieldtype is no longer Pro only, and part of Lite edition (in consideration for Freeform Payments plugin).
- Updated CP single submission view to include a note for Mailing List fields that mentions data is not stored for this field type.
- Updated new field creation to error if maximum number of fields are reached.
- Updated Freeform's automatically inserted JS to no longer include `type="text/javascript"`.
- Updated reCAPTCHA settings to be stored in Freeform Lite rather than Pro.
- Updated Element Connections feature to only attempt to fire when it's properly set up (to eliminate form errors if accidentally partially added).
- Improved AJAX script in Demo Templates to better handle script loading and IE11 compatibility.

### Fixed
- Fixed a bug where Salesforce API connections were not holding for more than a day or so.
- Fixed a bug where the Freeform 1.x to 2.x (Craft 2.x to 3.x) migration path could error in some cases.
- Fixed a bug where deleting forms and fields were not returning proper AJAX return statuses.
- Fixed a bug where the Constant Contact integration was not correctly working.
- Fixed a bug where the Dynamic Recipients field as Checkbox OR Radio would default to the first option being checked IF none were selected and form reloaded after an error was triggered.
- Fixed a bug where required asterisks were out of position in CP submission view.
- Fixed a bug where permissions for Manage Export Profiles was not working correctly.

## 2.2.2 - 2018-08-02
### Changed
- Updated Element Connections feature to allow mapping Freeform File Upload fields to the User Photo field.
- Updated SharpSpring integration to work with all custom field types.

### Fixed
- Fixed a bug where the Element Connections feature would display an error for customers using Solo edition.

## 2.2.1 - 2018-07-19
### Changed
- Updated HubSpot integration to load custom fields from Contacts, Companies and Deals endpoints now, not just Deals.
- Updated Composer to display an error if any fields are using the same handle.

### Fixed
- Fixed a bug where some users were getting a 'fieldlayout' table doesn't exist error in Composer.
- Fixed a bug where JS validation for the Phone fieldtype was not working.
- Fixed a bug where admin notification recipients were not being collected when using Windows newlines.

## 2.2.0 - 2018-07-18

> {tip} There are updates in this release that affect the Phone fieldtype and Confirmation fieldtype. Please review change log below for more info.

### Added
- Added ability to map submission data to Craft Entries and Users!
- Added Password fieldtype, meant typically for using with Users connection for registration forms.
- Added Bootstrap 4 example formatting template (to choose inside Composer).
- Added support for mapping to website, URL, dropdown, radio, date and zip fields in MailChimp integration.
- Added `fieldIdPrefix` parameter to `freeform.form` function to set a prefix value on field output. Helpful if you have more than 1 form on the same template and are sharing fields.

### Changed
- Updated Phone fieldtype (Pro) to now optionally use JS validation for generating the correct format. Breaking change for existing users: change `x` to `0` going forward.
- Updated Confirmation fieldtype to now be a Special field instead, and available for Lite as well. Legacy Confirmation fields will still work, but you should consider switching them out (removing and replacing) with the special field instead.
- Updated Composer interface to now be translatable.
- Updated the default English language file to include all language strings and removed obsolete ones.
- Updated the autogeneration of form handles to only happen for the first naming of the form. After that, it will not change by itself when updating a form name.
- Updated Submission object and submission view in control panel to use LitEmoji to render emojis.

### Fixed
- Fixed several issues with browser compatibility in AJAX demo templates.
- Fixed a bug where CSV exporting from Export Profiles section were not including email field data.
- Fixed a bug where form names weren't showing in Submissions breadcrumbs.
- Fixed a bug where the Composer Tutorial was not lining up properly in Craft 3.0.12+.
- Fixed a bug where the 'Reset' button was showing in property editor on some fields that shouldn't have had it.
- Fixed a bug where the Formatting Template select menu options were not displaying cleaned up version of names in Composer.
- Fixed a bug where some headings in the Property Editor were incorrect.

## 2.1.1 - 2018-07-03
### Fixed
- Fixed a bug where longer form layouts would not scroll vertically in Composer with Craft 3.0.13+.
- Fixed a bug where submitting forms with emojis would result in an error and not correctly store submission.

## 2.1.0 - 2018-06-27
### Added
- Added the ability to move fields from one page to another in multipage forms in Composer.
- Added ability to rearrange pages in multipage forms in Composer.
- Added ability to render Dynamic Recipients as checkboxes, and now allows submitter to select more than 1 option.
- Added ability to easily duplicate forms (from Forms list) and duplicate fields.
- Added 'Reset' button inside Property editor for fields to reset/update them to the defaults set for the 'main' field (Freeform -> Fields area).

### Changed
- Updated Composer UI to match the Craft 3.0.12 UI changes.
- Updated and improved the Forms list control panel page.
- Updated File Upload field exporting to load the full URL path to file fields, or file name only if the Asset preference does not have a public URL.
- Updated Date & Time field date picker to have several more translation options available.
- Updated Demo Templates to no longer install duplicate template routes.
- Updated Demo Templates routes to be extension agnostic.
- Updated the 'Disable submit button on form submit?' setting to be disabled by default.
- Updated plugin icon to be a little more spicy.
- Renamed the 'Save and continue editing' button in Composer to just 'Quick Save'.
- Renamed the 'Include Freeform scripts in the page's footer?' setting to 'Freeform Javascript Insertion Location' with a dropdown for choices.

### Fixed
- Fixed a bug where the Composer Save button was off position if there was a Craft notice at top of page.
- Fixed a bug where the Date & Time fieldtype would incorrectly display time picker when the field was set to Date only.
- Fixed a bug where the Dynamic Recipients field would not show the selected options in Submission object and single submission view in control panel.
- Fixed a bug where the Dynamic Recipients field would not render as Radios in single submission view in control panel if it was set to render that way.
- Fixed a bug where form field options were not being escaped.
- Fixed a bug where some reCAPTCHA files were not correctly named for case sensitivity.
- Fixed a bug where Demo Templates installer was stripping `-` from URI paths.
- Fixed a bug where the "Manage all Submissions" permission was not allowing valid users to delete submissions.

## 2.0.4 - 2018-05-31
### Added
- Added a variety of thorough AJAX examples to demo templates!
- Added `EVENT_BEFORE_RENDER` event for developers.

### Changed
- Updated Field editor and Composer to error if field handles are using a reserved word such as `title` or `id`.

### Fixed
- Fixed a bug where the Craft automated tasks feature would error on because of the Freeform fieldtype being used inside Matrix fields under certain circumstances.
- Fixed a bug where the Salesforce fetch token URL regex restriction was not allowing all types of URLs to pass through.
- Fixed some issues Freeform when using with AJAX.

## 2.0.3 - 2018-05-25
### Changed
- Updated Symfony dependencies to avoid conflicting with other plugins.

## 2.0.2 - 2018-05-24
### Changed
- Updated `hashids` dependency to `^2.0` so Freeform doesn't conflict with other plugins.
- Updated form validation to no longer allow a single space as a valid value for required fields.

### Fixed
- Fixed a bug where the reCAPTCHA feature would error when trying to add to forms for some users.
- Fixed a bug where Categories and Tags Feeders could break due to a JS error when setting the source.
- Fixed a bug where setting the `maxlength` option for text and textarea fields to a value, and then changing back to nothing would result in Freeform not having the field accept no values.

## 2.0.1 - 2018-05-17
### Added
- Added automated Submission Purge feature.
- Added automated Spam Folder Purge feature.
- Added `beforePush` and `afterPush` developer hooks for API integrations.

### Changed
- Updated Composer UI to closer match Craft 3 styling.
- Updated and rearranged options in Form Settings property editor area in Composer.

### Fixed
- Fixed a bug where Craft Campaign mailing list option would show as available to create if you didn't have the plugin installed.

## 2.0.0 - 2018-05-14
### Added
- Added mailing list integration support for the Craft Campaign plugin, available on Lite and Pro editions.

### Fixed
- Fixed a bug where 'Display error messages' option for Spam Protection Behavior setting would trip on submitting a form if it initially errored.
- Fixed a bug where submitting a form with a mailing list would error in some cases.
- Fixed a bug where the Salesforce fetch token URL regex restriction was not allowing for less common URLs to pass through.
- Fixed a bug where saving field mapping for HubSpot was not always saving fields correctly.

## 2.0.0-beta.20 - 2018-05-09
### Added
- Added Form Submission Throttling setting to help prevent against spam or attacks.

### Fixed
- Fixed a bug where the 'Empty Option Label' input would not show when using Element Feeder (but did for Predefined Feeder) for Select fields.
- Fixed a bug where having an option with a value of `0` with Feeders, and an 'Empty Option Label' set, it would select the option with the value of `0` by default, not the Empty Option.

## 2.0.0-beta.19 - 2018-05-07
### Added
- Added optional 'Empty Option Label' input for Select fields that use the Data Feeders feature, so the first option can be `Please Select` or whatever you like.
- Added 'Collect IP Addresses' setting inside Composer form setting area to disable IP address collecting per form.
- Added ability to include collected IP addresses when exporting.

### Changed
- Changed Freeform to store all numeric submission data as strings instead of integers to be more reliable.

### Fixed
- Fixed a bug where the hidden Spam honeypot field label was missing the 'for' attribute.
- Fixed a bug where the Status indicators were incorrect for the Recent Submissions widget.

## 2.0.0-beta.18 - 2018-05-02
### Changed
- Updated Composer to no longer have a default Form Name, and also auto-generate a Form Handle based on the Form Name.

### Fixed
- Fixed a bug where clicking the Settings link from the Plugins list was not rerouted correctly.
- Fixed a bug where the Spam Folder API queue migration did not account for prefixed database tables.
- Fixed a bug where updates could error if you updated Pro before Lite.
- Fixed a bug where fields with numeric options were not always using the correct values.

## 2.0.0-beta.17 - 2018-05-01
### Added
- Added field option Element and Data Feeders for Checkbox group, Radio group, Select and Multi-select fieldtypes. You can now populate these fields with Entries, Categories, Tags, Users, or one of our many predefined options: States, Provinces, Countries, Languages, Number ranges, Year ranges, Months, Days and Days of the Week. Freeform Data Feeders also offer flexible control over formatting and/or which data fills option labels and option values.
- Added Multi-select fieldtype.
- Added Spam Folder feature. Never miss a valid lead again! You can optionally enable this to have submissions flagged as spam (from failed honeypot or blocked keywords/emails/IP addresses) be saved to the database an placed into Freeform's Spam Folder. Submissions can then be reviewed (and optionally edited) and whitelisted, retroactively generating missed email notifications and passing along of data to API integrations.
- Added Spam Protection options to ban email addresses, keywords and IP addresses. Wildcards are permitted on email addresses and keywords.
- Added reCAPTCHA spam protection integration for Freeform Pro edition.

### Changed
- Updated the Spam Protection Behavior setting to allow one of three options: Simulate Success, Display errors (good for debugging), and Reload form.
- Updated form submissions to collect the IP address of submitters.
- Improved the appearance of the Property Editor in Composer by having instructions for each setting displayed in a tooltip instead.
- Increased the size of image thumbnails when viewing submissions in control panel.
- Updated Forms list in CP to have submission counts link to Submissions area.
- Updated Hidden fields to allow up to 250 characters.

### Fixed
- Fixed an XSS security vulnerability with submitting forms.
- Fixed a bug where searching into Submissions in the CP would return an error.
- Fixed a bug where submitting a form with a single File Upload field without `[]` would error.
- Fixed a bug where the Date & Time fieldtype datepicker path was incorrect.
- Fixed a bug where 'max length' error messages for text and textarea fields were not translatable.
- Fixed a bug where creating and editing statuses would not correctly update the status handle.
- Fixed a bug where Freeform 1 to 2 migration would not correctly update the Form Fieldtype for Craft 3.
- Fixed a bug where exporting odd checkbox data could result in an error.

## 2.0.0-beta.16 - 2018-04-11
### Fixed
- Fixed a bug where Radio group and Checkbox group options were rendering without unique values for the ID attribute by default.
- Fixed a bug where hidden system files would display in Formatting and Email Notification templates lists.
- Fixed a bug where a "Handle Missing" error would display incorrectly for Mailing List fields in Composer layout.
- Fixed a bug where file uploads could sometimes error when viewing submissions.

## 2.0.0-beta.15 - 2018-04-05
### Added
- Added new setting for Salesforce CRM integration for assignment rules in Salesforce.
- Added warnings in Composer to show if a field has a blank handle.

### Changed
- Updated Pipedrive API integration to have USER ID and STAGE ID settings.
- Updated various translations in Composer interface.

### Fixed
- Fixed a bug where email notification templates were not able to be deleted.

## 2.0.0-beta.14 - 2018-04-04
### Fixed
- Fixed a bug where Freeform would error about `Client` constant in Craft 3.0.0 GA release, as the Client edition was removed.

## 2.0.0-beta.13 - 2018-03-27
### Added
- Added a setting for spam protection that allows you to control the behavior of submit return (to simulate a successful submit).
- Added form, field values, submission and notification properties to `SendEmailEvent` object.
- Added improved error logging.

### Fixed
- Fixed a bug where Freeform Lite would show Pro field types in Field editor area.
- Fixed a bug where the 'Save' button in Composer was not in correct position after Craft 3 RC16 update.
- Fixed a bug where new CRM integrations could not be edited or created due to a code error.
- Fixed a bug where Freeform was not fully compatible with PostgreSQL.
- Fixed a bug where Freeform 1 to 2 migration would error on `fileCount`.
- Updated Return URL for forms to default to empty and redirect the user back to where the form was rendered (when left empty).

## 2.0.0-beta.12 - 2018-03-21
### Added
- Added Pipedrive CRM integration for Freeform Pro edition.
- Added new setting for Salesforce CRM integration for accounts using custom URLs in Salesforce.

### Fixed
- Fixed a bug where HTML blocks, submit buttons, and file uploads were being included in the `allFields` array in email notifications.
- Fixed a bug where non-existent Freeform controllers were showing in console command help list.
- Improved the Mailing List integration code in Composer.
- Fixed a bug where translations were not being loaded correctly in control panel (aside from Composer which is unavailable currently).
- Fixed a bug where reinstalling Demo Templates would generate extra duplicate routes.
- Fixed a bug where Freeform 1.x to 2.x migration might not work correctly and error about foreign key drop statements.
- Fixed a bug where the "Manage All Submissions" permission was not granting users and user groups access to Quick Export feature.

## 2.0.0-beta.11 - 2018-03-09
### Changed
- Updated multi-page limit in Composer to 100 pages.

### Fixed
- Fixed a bug where the single submission view page in CP would error for submissions with file uploads from before multiple upload capabilities.
- Fixed a bug where formatting templates were not correctly handling Dynamic Recipients fields as radio options.
- Fixed a bug where `field.label` would only ever render as 'Submit', regardless of any customized value specified in Composer.
- Fixed a bug where the Maximum Length setting for text inputs was not correctly being applied.

## 2.0.0-beta.10 - 2018-03-01
### Added
- Added unique token to all form submissions. Useful if you want to more securely display a users submission data in the front end after they submit the form (with token in the URI). Available as `token` property in Submission object and `token` parameter in `freeform.submissions` function for filtering.
- Added `deleteSubmissionByToken()` function to allow users to delete their own submissions (see demo template example).
- Added *Opt-In Data Storage Checkbox* option for form settings in Composer to allow users to decide whether the submission data is saved to your site or not (but still sends email notifications). To use it, add a checkbox field to your form and pair the setting with that field. The checkbox will have to be checked to have data stored in Freeform.

### Changed
- Updated File Upload fields to have the ability to accept multiple files.
- Updated Checkbox fieldtype to show a warning in Composer when no value is set.

### Fixed
- Fixed a bug where using Dynamic Recipients fieldtype as Radio display would not send email notifications (reinstall or adjust demo templates).
- Fixed a bug where default value and placeholder attributes were not being saved for Text and Confirmation field types.
- Fixed a bug where a migration was not running correctly.

## 2.0.0-beta.9 - 2018-02-16
### Changed
- Updated Dynamic Recipients fields to allow multiple email addresses per option (separated by commas).

### Fixed
- Fixed a bug where radio fields would not display errors if left empty.
- Fixed a bug where the demo templates errored on submission views after Craft 3 RC 10 update.

## 2.0.0-beta.8 - 2018-02-14
### Fixed
- Fixed a bug where the CP Submissions list page broke after Craft 3 RC 10 update.

## 2.0.0-beta.7 - 2018-02-13
### Added
- Added Dutch translations.

### Changed
- Updated the install and uninstall process to be smarter (Lite vs Pro order, etc).

### Fixed
- Fixed a bug where Export CSV feature for Lite was not respecting the Remove Newlines setting.
- Fixed a bug with user / user group permissions.
- Fixed a bug where dashboard widgets' titles could not be overwritten.
- Fixed a bug where an error on install could sometimes occur.

## 2.0.0-beta.6 - 2018-02-02
### Added
- Added a 'Use Double Opt-in?' setting for MailChimp integrations.
- Added `onBeforeSubmit` and `onAfterSubmit` events.
- Added an optional `renderSingleInput` method to render single Checkbox fields' input without an additional hidden input.

### Changed
- Changed Mailing List fieldtype `renderInput` to now only output the input field (without a label).

### Fixed
- Fixed a bug where the chart on Submissions list page inside CP was sometimes not displaying new submissions based on timezone.
- Fixed a bug where permissions weren't allowing Admins to change status of submission(s).

## 2.0.0-beta.5 - 2018-01-31
### Fixed
- Fixed a bug where the Freeform 1.x to 2.x (Craft 2.x to 3.x) migration path could error in some cases.
- Fixed a bug where an error could be triggered from the cleanup of unfinalized files.

## 2.0.0-beta.4 - 2018-01-30
### Fixed
- Fixed a bug where Freeform would trigger permission related errors when trying to edit users or user groups.
- Fixed a bug where Freeform would not hide pages from navigation that a user did not have permission access to.
- Fixed various permission issues throughout Freeform.

## 2.0.0-beta.3 - 2018-01-29
### Added
- Added Freeform 1.x to 2.x (Craft 2.x to 3.x) migration path.

### Fixed
- Fixed a bug where Email Notification templates would not update correctly.
- Fixed a bug in Export Profiles view.
- Fixed a bug for sites with databases table prefixes.
- Fixed a bug for some sites with issues installing Freeform.

## 2.0.0-beta.2 - 2018-01-25
### Fixed
- Fixed a bug where Submissions list in control panel would not display any results.
- Fixed a bug where some users encountered install errors/issues.
- Fixed a bug where the Freeform Form element field type would display an error.
- Fixed a bug where the Save button in Composer was sometimes out of position.

## 2.0.0-beta.1 - 2018-01-24
### Added
- Added compatibility for Craft 3.x.
