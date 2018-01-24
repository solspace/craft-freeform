<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

return [
    // Layout
    "This field is required"                                                    => "This field is required",
    "Composer has no properties"                                                => "Composer has no properties",
    "No composer data present"                                                  => "No composer data present",
    "No context specified"                                                      => "No context specified",
    "No properties available"                                                   => "No properties available",
    "No form settings specified"                                                => "No form settings specified",
    "Field with handle '{handle}' not found"                                    => "Field with handle '{handle}' not found",
    "Field with hash '{hash}' not found"                                        => "Field with hash '{hash}' not found",
    "Layout page {pageIndex} does not contain a row array"                      => "Layout page {pageIndex} does not contain a row array",
    "Layout page {pageIndex} row {rowIndex} does not contain its ID"            => "Layout page {pageIndex} row {rowIndex} does not contain its ID",
    "Layout page {pageIndex} row {rowIndex} does not contain a list of columns" => "Layout page {pageIndex} row {rowIndex} does not contain a list of columns",
    "Could not create a field of type {type}"                                   => "Could not create a field of type {type}",


    // API controller
    "Label is required"                                              => "Label is required",
    "Handle is required"                                             => "Handle is required",
    "Name is required"                                               => "Name is required",
    "Type {type} is not allowed. Allowed types are ({allowedTypes})" => "Type {type} is not allowed. Allowed types are ({allowedTypes})",


    // CRM controller
    "CRM"                                                                                   => "CRM",
    "New CRM Integration"                                                                   => "New CRM Integration",
    "Add a CRM integration"                                                                 => "Add a CRM integration",
    "CRM Integration saved"                                                                 => "CRM Integration saved",
    "CRM Integration not saved"                                                             => "CRM Integration not saved",
    "CRM integration with handle '{handle}' not found"                                      => "CRM integration with handle '{handle}' not found",
    "No CRM integrations exist yet"                                                         => "No CRM integrations exist yet",
    "Shop for CRM integrations on the {link_open}Solspace Freeform Marketplace{link_close}" => "Shop for CRM integrations on the {link_open}Solspace Freeform Marketplace{link_close}",
    "Are you sure you want to remove the “{name}” integration?"                             => "Are you sure you want to remove the “{name}” integration?",
    "What this integration will be called in the CP."                                       => "What this integration will be called in the CP.",
    "The unique name used to identify this integration."                                    => "The unique name used to identify this integration.",


    // Fields controller
    "Create Field"                 => "Create Field",
    "Fields"                       => "Fields",
    "Field saved"                  => "Field saved",
    "Field not saved"              => "Field not saved",
    "Field with ID {id} not found" => "Field with ID {id} not found",
    "Checked?"                     => "Checked?",
    "Selected?"                    => "Selected?",


    // Forms controller
    "Create a new form"                          => "Create a new form",
    "Editing: {title}"                           => "Editing: {title}",
    "Forms"                                      => "Forms",
    "Solspace Freeform: Forms - {title}"         => "Solspace Freeform: Forms - {title}",
    "No form ID specified"                       => "No form ID specified",
    'No forms found'                             => 'No forms found',
    "Form with ID {id} not found"                => "Form with ID {id} not found",
    "Are you sure you want to delete this form?" => "Are you sure you want to delete this form?",


    // Mailing Lists controller
    "Mailing Lists"                                                                                       => "Mailing Lists",
    "Service Provider"                                                                                    => "Service Provider",
    "Last Updated"                                                                                        => "Last Updated",
    "New Mailing List Integration"                                                                        => "New Mailing List Integration",
    "Add a Mailing List integration"                                                                      => "Add a Mailing List integration",
    "Mailing List Integration saved"                                                                      => "Mailing List Integration saved",
    "Mailing List Integration not saved"                                                                  => "Mailing List Integration not saved",
    "Mailing list with handle '{handle}' not found"                                                       => "Mailing list with handle '{handle}' not found",
    "No Mailing List integrations exist yet"                                                              => "No Mailing List integrations exist yet",
    "Shop for more Mailing List integrations on the {link_open}Solspace Freeform Marketplace{link_close}" => "Shop for more Mailing List integrations on the {link_open}Solspace Freeform Marketplace{link_close}",


    // Notifications Controller
    "Email notifications"                                                                              => "Email notifications",
    "Notifications"                                                                                    => "Notifications",
    "Notification saved"                                                                               => "Notification saved",
    "Notification not saved"                                                                           => "Notification not saved",
    "Notification with ID {id} not found"                                                              => "Notification with ID {id} not found",
    "Include Attachments?"                                                                             => "Include Attachments?",
    "Include uploaded files as attachments in email notification."                                     => "Include uploaded files as attachments in email notification.",
    "Create a new email notification template"                                                         => "Create a new email notification template",
    "What this field will be called in the CP."                                                        => "What this field will be called in the CP.",
    "How you’ll refer to this notification template in the templates."                                 => "How you’ll refer to this notification template in the templates.",
    "Description of this notification."                                                                => "Description of this notification.",
    "The subject line for the email notification."                                                     => "The subject line for the email notification.",
    "The email address that the email will appear from in your email notification."                    => "The email address that the email will appear from in your email notification.",
    "The name that the email will appear from in your email notification."                             => "The name that the email will appear from in your email notification.",
    "The reply-to email address for your email notification. Leave blank to use 'From Email' address." => "The reply-to email address for your email notification. Leave blank to use 'From Email' address.",
    "The content of the email notification. See documentation for availability of variables."          => "The content of the email notification. See documentation for availability of variables.",


    // Settings controller
    "Settings"                                                                          => "Settings",
    "Settings Saved"                                                                    => "Settings Saved",
    "Settings not saved"                                                                => "Settings not saved",
    "Template '{name}' already exists"                                                  => "Template '{name}' already exists",
    "No template name specified"                                                        => "No template name specified",
    "No custom template directory specified in settings"                                => "No custom template directory specified in settings",
    "Add a sample template"                                                             => "Add a sample template",
    "Solspace Freeform: Demo Templates"                                                 => "Solspace Freeform: Demo Templates",
    "Demo Templates"                                                                    => "Demo Templates",
    "No demo templates present"                                                         => "No demo templates present",
    "Successfully installed <b>{templates} templates</b> and <b>{assets} assets</b>"    => "Successfully installed <b>{templates} templates</b> and <b>{assets} assets</b>",
    "You can view the templates <a href='{link}'>here</a>"                              => "You can view the templates <a href='{link}'>here</a>",
    "Prefix"                                                                            => "Prefix",
    "Install"                                                                           => "Install",
    "Templates"                                                                         => "Templates",
    "Assets"                                                                            => "Assets",
    "Routes"                                                                            => "Routes",
    "Directory Path"                                                                    => "Directory Path",
    "Spam Protection"                                                                   => "Spam Protection",
    "Enable this to use Freeform's built in Javascript-based honeypot spam protection." => "Enable this to use Freeform's built in Javascript-based honeypot spam protection.",
    "Default View"                                                                      => "Default View",
    "Default Email Notification Creation Method" => "Default Email Notification Creation Method",
    "The default page to go to when clicking the Freeform nav item."                    => "The default page to go to when clicking the Freeform nav item.",
    "Provide a relative path to the Craft root folder where your email templates directory is. This allows you to use Twig template files for your email formatting, and helps Composer locate these files when setting up notifications." => "Provide a relative path to the Craft root folder where your email templates directory is. This allows you to use Twig template files for your email formatting, and helps Composer locate these files when setting up notifications.",
    "Which storage method to use when creating new email notifications with 'Add New Notification' option in Composer." => "Which storage method to use when creating new email notifications with 'Add New Notification' option in Composer.",
    "Display Order of Fields in Composer" => "Display Order of Fields in Composer",
    "The display order for the list of available fields in Composer."       => "The display order for the list of available fields in Composer.",
    "Show Composer Tutorial"                                                => "Show Composer Tutorial",
    "Enable this to show the interactive tutorial again in Composer. This setting disables again when the tutorial is completed or skipped." => "Enable this to show the interactive tutorial again in Composer. This setting disables again when the tutorial is completed or skipped.",


    // Statuses controller
    "Create a new status"                                             => "Create a new status",
    "The name of the status."                                         => "The name of the status.",
    "How you’ll refer to this status in the templates."               => "How you’ll refer to this status in the templates.",
    "The color of the status circle when viewing inside CP."          => "The color of the status circle when viewing inside CP.",
    "Set this status be selected by default when creating new forms?" => "Set this status be selected by default when creating new forms?",
    "Statuses"                                                        => "Statuses",
    "Status saved"                                                    => "Status saved",
    "Status not saved"                                                => "Status not saved",
    "Status with ID {id} not found"                                   => "Status with ID {id} not found",


    // Submissions controller
    "Submissions"                       => "Submissions",
    "Submission Date"                   => "Submission Date",
    "Submission updated"                => "Submission updated",
    "Submission could not be updated"   => "Submission could not be updated",
    "Submission with ID {id} not found" => "Submission with ID {id} not found",
    "Submissions deleted successfully." => "Submissions deleted successfully.",


    // Element type
    "Title"                                              => "Title",
    "Form"                                               => "Form",
    "All Submissions"                                    => "All Submissions",
    "Submission date"                                    => "Submission date",
    "Freeform Submissions"                               => "Freeform Submissions",
    "Submissions deleted"                                => "Submissions deleted",
    "Are you sure you want to delete these submissions?" => "Are you sure you want to delete these submissions?",


    // Properties
    "Properties for key '{key}' is not an array"                        => "Properties for key '{key}' is not an array",
    "Properties for key '{key}' do not contain TYPE"                    => "Properties for key '{key}' do not contain TYPE",
    "Could not find properties for key '{hash}'"                        => "Could not find properties for key '{hash}'",
    "Could not find properties for page '{index}'"                      => "Could not find properties for page '{index}'",
    "Could not find properties for field '{hash}'"                      => "Could not find properties for field '{hash}'",
    "Could not find properties for form"                                => "Could not find properties for form",
    "Could not find properties for integrations"                        => "Could not find properties for integrations",
    "Value for '{key}' should be '{valueType}' but is '{expectedType}'" => "Value for '{key}' should be '{valueType}' but is '{expectedType}'",


    // Form
    "Trying to post an invalid form"                                            => "Trying to post an invalid form",
    "The provided page index '{pageIndex}' does not exist in form '{formName}'" => "The provided page index '{pageIndex}' does not exist in form '{formName}'",


    // Integrations
    "{setting} setting not specified"                                  => "{setting} setting not specified",
    "Could not connect to API endpoint"                                => "Could not connect to API endpoint",
    "Could not add emails to lists"                                    => "Could not add emails to lists",
    "Could not fetch {serviceProvider} lists"                          => "Could not fetch {serviceProvider} lists",
    "Unknown integration type specified"                               => "Unknown integration type specified",
    "Could not find setting blueprints for {handle}"                   => "Could not find setting blueprints for {handle}",
    "No 'access_token' present in auth response for {serviceProvider}" => "No 'access_token' present in auth response for {serviceProvider}",
    "'{key}' key missing in Freeform's plugin configuration"           => "'{key}' key missing in Freeform's plugin configuration",


    // Settings model
    "Directory '{directory}' does not exist"                        => "Directory '{directory}' does not exist",
    "Could not get demo template content. Please contact Solspace." => "Could not get demo template content. Please contact Solspace.",


    // Submission record
    "{attribute} cannot be blank" => "{attribute} cannot be blank",


    // CRM service
    "CRM Integration with ID {id} not found"                     => "CRM Integration with ID {id} not found",
    "No field mapping specified for '{integration}' integration" => "No field mapping specified for '{integration}' integration",

    // Files service
    "Could not handle file upload" => "Could not handle file upload",


    // Form service
    "Can't use render() if no form template specified" => "Can't use render() if no form template specified",
    "Form template '{name}' not found"                 => "Form template '{name}' not found",


    // Mailer service
    "Email notification template with ID {id} not found" => "Email notification template with ID {id} not found",


    // MailingLists service
    "Mailing List integration with ID {id} not found" => "Mailing List integration with ID {id} not found",


    // Email field
    "{email} is not a valid email address"            => "{email} is not a valid email address",


    // File Upload field
    "'{extension}' is not an allowed file extension"  => "'{extension}' is not an allowed file extension",

    "You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB" => "You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB",
    "Could not upload file"                                                                 => "Could not upload file",

    // Fields
    "Create a new field"                                                                               => "Create a new field",
    "Default instructions / help text for this field."                                                 => "Default instructions / help text for this field.",
    "Set this field as required by default."                                                           => "Set this field as required by default.",
    "What type of field is this?"                                                                      => "What type of field is this?",
    "How you’ll refer to this field in the templates."                                                 => "How you’ll refer to this field in the templates.",
    "The default label for this field."                                                                => "The default label for this field.",
    "Options"                                                                                          => "Options",
    "Custom values"                                                                                    => "Custom values",
    "Define the default available options."                                                            => "Define the default available options.",
    "Enable this to check the checkbox by default."                                                    => "Enable this to check the checkbox by default.",
    "Enable this to specify custom values for each option label."                                      => "Enable this to specify custom values for each option label.",
    "Dynamic Recipients"                                                                               => "Dynamic Recipients",
    "Define the default available email address options."                                              => "Define the default available email address options.",
    "Placeholder"                                                                                      => "Placeholder",
    "The default text that will be shown if the field doesn’t have a value."                           => "The default text that will be shown if the field doesn’t have a value.",
    "Asset Source"                                                                                     => "Asset Source",
    "Select a default asset source for uploaded files."                                                => "Select a default asset source for uploaded files.",
    "Default Value"                                                                                    => "Default Value",
    "The default value for the field."                                                                 => "The default value for the field.",
    "Rows"                                                                                             => "Rows",
    "The default number of rows this textarea should have."                                            => "The default number of rows this textarea should have.",
    "Maximum File Size"                                                                                => "Maximum File Size",
    "Specify the default maximum file size, in KB."                                                    => "Specify the default maximum file size, in KB.",
    "Allowed File Types"                                                                               => "Allowed File Types",
    "Select the file types to be allowed by default. Leaving all unchecked will allow all file types." => "Select the file types to be allowed by default. Leaving all unchecked will allow all file types.",
];
