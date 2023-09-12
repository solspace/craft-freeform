<?php

return [
    'No Value set',
    'No Target Field',
    'No Template',
    'No Asset Source',
    'Hidden field',
    'Handle',
    'Handle is not set',
    'Handle is a reserved keyword',
    'Form Type',
    'Select the type of form this is. When additional form types are installed, you can choose a different form type that enables special behaviors.',
    'Success Behavior',
    'Set how you’d like the success return of this form to be handled. May also be overrided at template-level.',
    'Reload Form with Success Message',
    'Load Success Template',
    'Use Return URL',
    'Success Template',
    'Select the desired success template to be used.',
    'Enable AJAX',
    'Enable Captchas',
    '"${resourceName}" list for ${name}',
    'No mailing list for ${name}',
    'No email field',
    'Field type "${type}" not found',
    'Are you sure you want to remove this page and all fields on it?',
    'Add New Field',
    'Type',
    'Label',
    'Save',
    'Placeholder',
    'Field placeholder',
    'Rows',
    'Success Message',
    'The text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with `form.successMessage`.',
    'The text to be shown at the top of the form if there are any errors upon submit (AJAX), or load in your template with `form.errorMessage`.',
    'Field label used to describe the field.',
    'The value for this field.',
    'Instructions',
    'Field specific user instructions.',
    'If present, this will be the value pre-populated when the form is rendered.',
    'The text that will be shown if the field doesn’t have a value.',
    'Target Field',
    'The target Freeform field to be confirmed by re-entering its value.',
    'Date Time Type',
    'Choose between using date, time or both.',
    'Both',
    'Time',
    "You can use 'now', 'today', '5 days ago', '2017-01-01 20:00:00', etc, which will format the default value according to the chosen format.",
    'Use the Freeform datepicker for this field?',
    'Generate placeholder from your date format settings?',
    'Date Order',
    'Choose the order in which to show day, month and year.',
    'year month day',
    'month day year',
    'day month year',
    'Four digit year?',
    'Date leading zero',
    'If enabled, a leading zero will be used for days and months.',
    'Date Separator',
    'Used to separate date values.',
    'None',
    '24h Clock?',
    'Clock Separator',
    'Used to separate hours and minutes.',
    'Lowercase AM/PM?',
    'Separate AM/PM with a space?',
    'Email Template',
    'The notification template used to send an email to the email value entered into this field (optional). Leave empty to just store the email address without sending anything.',
    'Conditional Rules',
    'Show field handles?',
    'Enable this to also show the field handle for all fields for better clarity if you have several fields with the same label.',
    'Element Connections',
    'Add a connection',
    'Section',
    'Select a section',
    'Entry Type',
    'Select an entry type',
    'User Group',
    'Render as',
    'Select',
    'Radios',
    'Checkboxes',
    'Options for this checkbox group',
    'Asset Source',
    'Upload Location Subfolder',
    'The subfolder path that files should be uploaded to. May contain {{ form.handle }} or {{ form.id }} variables as well.',
    'Specify the maximum uploadable file count.',
    'Maximum File Size',
    'Specify the maximum file size, in KB.',
    'Leave everything unchecked to allow all file kinds.',
    'Select an asset source to be able to store user uploaded files.',
    'Select an Asset Source...',
    'File Count',
    'Specify the maximum uploadable file count',
    'Maximum filesize',
    'Specify the maximum filesize in KB',
    'Allowed File Kinds',
    'Leave everything unchecked to allow all file kinds',
    'Name',
    'Name or title of the form.',
    'How you’ll refer to this form in the templates.',
    'Submission Title',
    'What the auto-generated submission titles should look like.',
    'Return URL',
    'The URL the form will redirect to after successful submit.',
    'Default Status',
    'The default status to be assigned to new submissions.',
    'Formatting Template',
    'The formatting template to assign to this form when using Render method (optional).',
    'Collect IP Addresses',
    'Should this form collect the user\'s IP address?',
    'Store Submitted Data',
    'Should the submission data for this form be stored in the database?',
    'Opt-In Data Storage Checkbox',
    'Allow users to decide whether the submission data is saved to your site or not.',
    "Use Freeform's built-in automatic AJAX submit feature. This will prevent the value in the Return URL field from working unless a template-level override is set.",
    'Disabling this option removes the Captcha check for this specific form.',
    "Should this form collect the user's IP address?",
    'Enable Google Tag Manager to push successful form submission events to the Data Layer',
    'Form tag Attributes',
    'Add any tag attributes to the HTML element.',
    'Fields',
    'Attribute',
    'Value',
    'POST Forwarding',
    'If you need to have the POST data of this form submitted to an external API, provide that custom URL here.',
    'POST Forwarding Error Trigger',
    'Provide a keyword or phrase Freeform should check for in the output of the external POST URL to know if and when there’s an error to log, e.g. ‘error’ or ‘an error occurred’.',
    'Show Loading Indicator on Submit',
    'Show a loading indicator on the submit button upon submittal of the form.',
    'Show Loading Text',
    "Enabling this will change the submit button's label to the text of your choice.",
    'Loading Text',
    'Limit Form Submission Rate',
    'Limit the number of times a user can submit the form.',
    'Do not limit',
    'Logged in Users only (no limit)',
    'Once per Cookie only',
    'Once per IP/Cookie combo',
    'Once per logged in Users only',
    'Once per logged in User or Guest Cookie only',
    'Once per logged in User or Guest IP/Cookie combo',
    'Stop Submissions After',
    'Set a date after which the form will no longer accept submissions.',
    'Disabled',
    'Form Color',
    'Used for Widget Charts',
    'Description / Notes',
    'Description or notes for this form.',
    'Hash',
    'Used to access this field on the frontend.',
    'Field Mapping',
    'Map CRM fields to your Freeform fields.',
    'Email Marketing',
    'Map Email Marketing fields to your Freeform fields.',
    'Integration',
    'Choose an integration type',
    'Choose an integration...',
    'Refreshing...',
    'Refresh Integration',
    'Choose the opt-in mailing list that users will be added to.',
    'Select a list...',
    'Target Email Field',
    'The email field used to push to the mailing list.',
    'Select a field...',
    'Decimal Separator',
    'Used to separate decimals.',
    'Allow negative numbers?',
    'Min/Max Values',
    'The minimum and/or maximum numeric value this field is allowed to have (optional).',
    'Min/Max Length',
    'The minimum and/or maximum character length this field is allowed to have (optional).',
    'Step',
    'The step',
    'Decimal Count',
    'The number of decimal places allowed.',
    'Leave blank for no decimals.',
    'Thousands Separator',
    'Used to separate thousands.',
    'Label for this page tab.',
    'Validation',
    'Use JS validation',
    'Enable this to force JS to validate the input on this field based on the pattern.',
    'Pattern',
    "Custom phone pattern (e.g. '(000) 000-0000' or '+0 0000 000000'), where '0' stands for a digit between 0-9. If left blank, any number and dash, dot, space, parentheses and optional + at the beginning will be validated.",
    'Optional',
    'Maximum Number of Stars',
    'Set how many stars there should be for this rating.',
    'Unselected Color',
    'Hover Color',
    'Selected Color',
    'Enter any regex pattern here.',
    'e.g. /^[a-zA-Z0-9]*$/',
    'Error Message',
    'The message a user should receive if an incorrect value is given. It will replace any occurrences of \'{{pattern}}\' with the supplied regex pattern inside the message if any are found.',
    'Value is not valid',
    'Submit button Label',
    'The label of the submit button',
    'Disable the Previous button',
    'Previous button Label',
    'The label of the previous button',
    'Maximum Length',
    'The maximum number of characters for this field.',
    'The number of rows in height for this field.',
    'Quick save',
    'Saving...',
    'Cancel',
    'Save and finish',
    'Save as a new form',
    'Saved successfully',
    'Name must not be empty',
    'Label must not be empty',
    'Handle must not be empty',
    'Field type must not be empty',
    'Field added successfully',
    'Special Fields',
    'Craft Field',
    'Freeform Field',
    'Field mapping',
    'Activated by default',
    'The user will be activated upon creation if this is checked. Will be set to pending otherwise.',
    'CRM Field',
    'FF Field',
    'Use custom values',
    "Select the Email field that will contain the user's email address in order to send the email notification. Good practice would be to have the email field on the first page of the form.",
    'Select an email field...',
    'Save button Label',
    'The label of the Save & Continue Later button.',
    'The URL the user will be redirected to after saving. Can use {token} and {key}.',
    'Positioning',
    'Choose how the previous and submit buttons should be placed.',
    'Left',
    'Center',
    'Right',
    'Apart at Left and Right',
    'Together at Left',
    'Together at Center',
    'Together at Right',
    'Choose whether the submit button is positioned on the left, center or right side.',
    "Show 'Clear' button?",
    'Edit in Fullscreen mode',
    'Exit Fullscreen mode',
    'Allow Twig',
    'Used to enable Twig in HTML blocks',
    'Add new template',
    'Form Settings',
    'Admin Notifications',
    'CRM Integrations',
    'CRM Integration',
    'Payments',
    'Payment Gateway',
    'Choose a payment gateway.',
    'Choose a payment gateway...',
    'Refresh Payment Gateways',
    'Payment Field Mapping',
    'Amount',
    'Currency',
    'Fixed (see below)',
    'Fixed Amount',
    'Fixed payment amount.',
    'Fixed Currency',
    'Payment currency.',
    'Payment Description',
    'Enter a custom payment description',
    'Fixed Subscription Plan',
    'Select an existing subscription plan',
    'Choose a subscription plan...',
    'Refresh plans',
    'Add new plan',
    'Plan',
    'Fixed Interval',
    'Interval',
    'Daily',
    'Weekly',
    'Biweekly',
    'Monthly',
    'Annually',
    'The frequency with which a subscription should be billed.',
    'Payment Succeeded Email',
    'Payment Failed Email',
    'Subscription Created Email',
    'Subscription Ended Email',
    'Payment Type',
    'Select a payment template',
    'Choose payment type...',
    'Single payment',
    'Predefined subscription plan',
    'Customer defined subscription plan',
    'Customer Field Mapping',
    'Payment fields to your Freeform fields.',
    'Form Fields',
    'Craft Connections',
    'Width',
    'Height',
    'Border Color',
    'Background Color',
    'Pen Dot Size',
    'Pen Color',
    'Notification added successfully',
    'Template added successfully',
    'Template Name',
    'File Name',
    'Custom Options',
    'Entries',
    'Categories',
    'Tags',
    'Users',
    'Disable entries?',
    'The entry will be set to disabled upon creation if this is checked. Will be set to enabled otherwise.',
    'Predefined Options',
    'Source',
    'Empty Option Label (optional)',
    'Label (Optional)',
    'To show an empty option at the beginning of the Select field options, enter a value here. Leave blank if you don\'t want a first option.',
    'Target',
    'Option Label',
    'Option Value',
    'Options for this field',
    'Options for this field. Option values should be unique.',
    'Legends',
    'Legend',
    'Field',
    'Abbreviated',
    'Full',
    'Range Start',
    'Range End',
    'Order By',
    'Sort',
    'Sort Direction',
    'Ascending',
    'Descending',
    'Mailing Lists',
    'Map Mailing List fields to your Freeform fields.',
    'Default',
    'Hide field',
    'Hide the mailing list checkbox from the form and make it always trigger a subscription',
    'Single number',
    '2-digit number',
    'States',
    'States & Territories',
    'Provinces - English',
    'Provinces - French',
    'Provinces - Bilingual',
    'Countries',
    'Languages',
    'Numbers',
    'Years',
    'Months',
    'Days',
    'Days of Week',
    'The notification template used to send an email to the email value entered into this field (optional).',
    'Select a template...',
    'Admin Recipients',
    'Email address(es) to receive an email notification. Enter each on a new line.',
    'This field is required?',
    'Use built-in Table JS?',
    'Check this to enable built-in javascript for handling adding new rows.',
    'Table Layout',
    'Use semicolon ";" separated values for select options.',
    'Style',
    'Select style.',
    'Accent Color',
    'Select accent color',
    'Layout',
    'Field layout.',
    'Two rows',
    'Three rows',
    'Field label used to describe credit card number field.',
    'Configuration',
    'Options Editor',
    'Options',
    'Add an option',
    'Show all options on one line?',
    'Light',
    'Dark',
    'Attribute Editor',
    'Error',
    'Instruction',
    'Site',
    'Credit Card Number',
    'Expiry Date',
    'CVC/CVV',
    'Checked by default',
    "Adjust all settings including return URL and formatting template for your form here. To get back here at a later time, just click the 'Form Settings' button.",
    'Admin Email Notifications',
    'If you wish to send an email notification to admin(s) upon users successfully submitting this form, set that up here.',
    'Available Fields',
    'Fields are global throughout all forms, but are customizable for each form. Drag and drop any of these fields into position on the blank layout area in the center column of this page.',
    'Quickly create new fields as you need them. Then adjust their properties and options in the Property Editor in the column on the right. Note: fields created here will be available for all other forms as well.',
    'Drag and drop these when you need them. You can have as many HTML fields as you need, but should only have 1 submit button per page.',
    'Form Layout',
    'This is a live preview of what your form will look like. Drag and drop and fields from the left column into position here. New rows and columns will automatically be created as you position the fields.',
    'Editing Fields',
    'Fields can easily be moved around whenever you need. Clicking on any field will open up its properties in the Property Editor in the right column.',
    'Multi-page Forms',
    'To create multi-page forms, click the + button to add more pages. You can edit the names of the pages in the Property Editor in the right column.',
    'Property Editor',
    'This is where all your configuration will happen. Clicking on any field, page tab, etc in Composer layout area will load its configuration options here.',
    'Field Property Editor',
    'Page Property Editor',
    'Reset',
    'Reset to default values',
    'Default Value',
    'How you’ll refer to this field in the templates.',
    'Please select an element',
    'Database Templates',
    'File Templates',
    'Select a page to add rules to',
    'Add a new field rule',
    'Add a new goto rule',
    'Field rules',
    'Page rules',
    'Rules for {page}',
    'Go to {page} when',
    'of its criteria match',
    'any',
    'all',
    'Add...',
    'Add criteria...',
    'Show',
    'Hide',
    'this item when',
    'is',
    'is not',
    'Assets',
    'All Assets',
    'Filename',
    '<a href="{url}">Upgrade to Pro</a> to get access to popular API integrations.',
    'Activate users?',
    'Send activation email?',
    'The user will receive an email with activation details if this is checked.',
];
