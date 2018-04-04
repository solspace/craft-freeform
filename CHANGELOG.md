# Solspace Freeform Changelog

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
