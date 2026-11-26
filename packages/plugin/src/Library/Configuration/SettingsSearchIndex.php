<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Freeform;

class SettingsSearchIndex
{
    private const PAGE_ONLY = ['setup', 'limited-users', 'statuses', 'content-integrations', 'demo-templates', 'ai', 'form-monitor', 'diagnostics'];

    private const LABELS = [
        'setup' => ['Plugin Name', 'Formatting Templates', 'Default Formatting Template', 'Email Notifications', 'AJAX'],
        'general' => [
            'Control Panel',
            'Custom Plugin Name',
            'Default View',
            'Form Creation Options',
            'Allow Starting Points in Quick Setup',
            'Default AI Integration for Form Creation',
            'Plugin Badge',
            'Site-Aware Forms',
            'A/B Testing',
            'Queue Job Priority',
            'File Uploads',
            'Allowed Upload Volumes',
            'Restrict Form options in Form Field Type to User permissions',
            'Remove Newlines from Textareas for Exporting',
            'Use Option Labels when Exporting',
            'Use Field Handles for Headings when Exporting',
            'Include Tracked URL Parameters when Exporting',
            'Fill Form Values from the GET Query String',
            'Allow Dashes in Field Handles',
            'Enable Search Index Updating on New Submissions',
            'Automatically Purge Submission Data',
            'Days After Submission Date to Purge',
            'Apply to Forms',
            'Automatically Purge Unfinalized Assets',
            'Time to Wait Before Purging Assets',
        ],
        'form-behavior' => [
            'Submit Behavior',
            'Disable Submit Button on Form Submit',
            'Automatically Scroll to Form on Errors and Multipage forms',
            'Automatically Scroll to top of the Form on AJAX submit',
            'Remember the Page Order in Multi-page forms',
            'Prevent Duplicate Submissions (Idempotency Keys)',
            'Freeform Scripts',
            'Script Insert Location',
            'Script Insert Type',
            'Asset Bundles',
            'Form Sessions',
            'Save & Continue Later',
            'Number of Days to Keep Saved Form Data',
            'Maximum Number of Saved Forms Per Session',
        ],
        'queue-processing' => [
            'Use Queue for AI Processing',
            'Use Queue for Email Notifications',
            'Use Queue for Integrations',
        ],
        'form-builder' => [
            'Live Render HTML Markup',
            'Allow Twig to be enabled in HTML blocks',
            'Render HTML block Twig in Isolated Mode',
            'Rich Text Field Toolbar Configuration',
            'Email Notification Template Toolbar Configuration',
            "Include Freeform's Sample Formatting Templates",
        ],
        'limited-users' => ['User Groups', 'Limited Functionality', 'Fields', 'Layout', 'Notifications', 'Integrations', 'Rules'],
        'spam' => [
            'Spam Protection Behavior',
            'Simulate Success',
            'Display Errors',
            'Bypass All Spam Checks for Logged in Users',
            'Use Spam Folder',
            'Automatically Purge Spam Submissions',
            'Days After Submission Date to Purge',
            'Form Submission Throttling',
            'Minimum Submit Time',
            'Form Submit Expiration',
        ],
        'template-manager' => [
            'Formatting Templates',
            'Success Templates',
            'Directory Path',
            'Email Notification Templates',
            'Template Method',
            'Template Storage Type',
            'Allow New Templates to be created inside the Form Builder',
            'New Template Type for Form Builder',
            'Control Panel Management for File-based Email Templates',
            'File Directory Path',
            'Default From Email for New Templates',
            'Default From Name for New Templates',
            'Template Conversion Utility',
        ],
        'statuses' => ['Name', 'Handle', 'Default Status', 'Color'],
        'content-integrations' => ['Content tools', 'Integration Icon', 'Field Containers', 'Matrix', 'Neo', 'Content Block'],
        'demo-templates' => ['Sample Templates', 'Formatting Templates', 'Code Pack'],
        'ai' => ['Usage', 'Credits', 'Billing', 'Purchase History'],
        'surveys' => ['Highlight Highest Ranking Option', 'Default Chart Types'],
        'notices-and-alerts' => [
            'Control Panel Notices',
            'Display Update Warnings & Notices',
            'Send Email Alerts for Failed Notifications',
            'Critical System Error Report Recipients',
            'Developer Digest Email',
            'Developer Digest Email Frequency',
            'Stats Digest Email',
            'Stats Digest Email Frequency',
            'Send Notifications on Live Environment only',
        ],
        'form-monitor' => ['Form Monitoring', 'Submission Checks', 'Email Delivery', 'Alerts'],
        'diagnostics' => ['Health Checks', 'Database Integrity', 'Project Configuration', 'Craft Preflight', 'System Information'],
        'activity' => [
            'Logging Style',
            'Activity Logging',
            'Classic Logging',
            'Recording mode',
            'Recorded events',
            'Storage limits',
            'Keep events for',
            'Event storage limit',
            'Log Detail',
            'Debug',
        ],
    ];

    private const DESCRIPTIONS = [
        'Custom Plugin Name' => 'Change the name shown for Freeform in the control panel.',
        'Default View' => 'Choose the page that opens when you enter Freeform.',
        'Form Creation Options' => 'Choose which options users see when creating a form.',
        'Queue Job Priority' => 'Set the priority of Freeform’s background jobs. Lower numbers run first.',
        'Allowed Upload Volumes' => 'Choose which asset volumes can store files uploaded through forms.',
        'Enable Search Index Updating on New Submissions' => 'Update the search index when a new submission is saved.',
        'Automatically Purge Submission Data' => 'Delete saved submissions after a specified number of days.',
        'Automatically Purge Unfinalized Assets' => 'Remove uploads that were never attached to a completed submission.',
        'Disable Submit Button on Form Submit' => 'Disable the submit button while a form is submitting.',
        'Prevent Duplicate Submissions (Idempotency Keys)' => 'Process repeated submissions from the same form instance only once.',
        'CSRF Token Refresh Method' => 'Choose when Freeform refreshes the form’s CSRF token.',
        'Script Insert Location' => 'Choose where Freeform’s scripts and styles are inserted.',
        'Script Insert Type' => 'Choose whether to load scripts and styles as files or inline.',
        'Freeform Session Context' => 'Choose how form context is stored between submissions.',
        'Session Length' => 'Set how long a form session lasts.',
        'Use Queue for AI Processing' => 'Process AI fields in the background using Craft’s queue.',
        'Use Queue for Email Notifications' => 'Send notification emails through Craft’s queue.',
        'Use Queue for Integrations' => 'Process integrations in the background using Craft’s queue.',
        'Use Queue Pinging Service' => 'Have Form Monitor trigger the queue on a schedule.',
        'Pinging Interval' => 'Set how often Form Monitor triggers the queue.',
        'Live Render HTML Markup' => 'Preview rendered HTML in the form builder.',
        'Allow Twig to be enabled in HTML blocks' => 'Allow HTML blocks to opt in to Twig rendering.',
        'Spam Protection Behavior' => 'Choose how Freeform responds when it detects spam.',
        'Automatically Purge Spam Submissions' => 'Remove spam submissions after a specified number of days.',
        'Form Submission Throttling' => 'Limit how frequently a user can submit a form.',
        'Template Storage Type' => 'Choose whether email templates are stored as files, in Craft, or both.',
        'Default From Email for New Templates' => 'Set the sender email address for new notification templates.',
        'Default From Name for New Templates' => 'Set the sender name for new notification templates.',
        'Default Chart Types' => 'Choose the default chart for each survey field type.',
        'Send Email Alerts for Failed Notifications' => 'Email selected recipients when a notification fails to send.',
        'Developer Digest Email Frequency' => 'Choose how often the developer digest is sent.',
        'Stats Digest Email Frequency' => 'Choose how often the submission stats digest is sent.',
        'Logging Style' => 'Choose how Freeform records new logs.',
        'Recorded events' => 'Choose the events Freeform records in the Activity Log.',
        'Keep events for' => 'Set how many days to keep recorded events.',
        'Event storage limit' => 'Set the maximum number of activity events to retain.',
    ];

    public static function forPage(string $handle, array $additionalLabels = []): array
    {
        $labels = [...(self::LABELS[$handle] ?? []), ...$additionalLabels];
        if ('form-behavior' === $handle && (\Craft::$app->getConfig()->getGeneral()->asyncCsrfInputs ?? false)) {
            $labels[] = 'CSRF Token Refresh Method';
        }

        $direct = !\in_array($handle, self::PAGE_ONLY, true);

        return array_map(
            static fn (string $label): array => [
                'source' => $label,
                'label' => Freeform::t($label),
                'description' => isset(self::DESCRIPTIONS[$label]) ? Freeform::t(self::DESCRIPTIONS[$label]) : null,
                'direct' => $direct,
            ],
            $labels
        );
    }
}
