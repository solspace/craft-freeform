# Solspace Freeform Changelog

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
