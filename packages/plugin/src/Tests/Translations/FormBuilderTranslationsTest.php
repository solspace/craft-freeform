<?php

namespace Solspace\Freeform\Tests\Translations;

use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class FormBuilderTranslationsTest extends TestCase
{
    private const MESSAGES = [
        'AJAX submissions',
        'Active integrations',
        'All time',
        'Blocked attempts',
        'Cancel',
        'Chart period',
        'Configure at least one condition for this notification.',
        'Continue',
        'Copied',
        'Copy diagnostics',
        'Could not copy. Take a screenshot of this page instead.',
        'Could not load element usage.',
        'Could not load submission statistics.',
        'Counts reflect currently stored data. Drafts and deleted submissions are excluded.',
        'Craft CMS',
        'Create a new Form',
        'Currently stored',
        'Daily submissions and stored spam over the selected period',
        'Delete',
        'Diagnostics',
        'Disabled',
        'Disabled integrations',
        'Element',
        'Embed Form',
        'Enabled',
        'Expired',
        'Field types',
        'Fields',
        'Form ID',
        'Form activity, configuration, and element usage at a glance.',
        'Form configuration',
        'Form totals',
        'Freeform',
        'Handle',
        'Hide disabled',
        'Integrations',
        'Last 30 days',
        'Last 7 days',
        'Last 90 days',
        'Last 90 days (UTC)',
        'Last submission',
        'Last year',
        'Layout',
        'Leave the form builder?',
        'Live',
        'Loading element usage…',
        'Loading statistics…',
        'Maximum tokens for the response, including reasoning and the generated content. Large forms and higher reasoning levels may need a larger allowance.',
        'Model default leaves the reasoning level to OpenAI. Higher levels can take longer and use more tokens. Overrides require a model that supports the selected level.',
        'Monitoring',
        'No fields yet.',
        'No stored submissions or spam in this period.',
        'No submissions yet.',
        'None',
        'Notifications',
        'OpenAI could not complete form generation. Check the selected model, reasoning level, and account limits. No form was saved.',
        'OpenAI returned an invalid generation response. Check the Forms list before starting another request.',
        'PHP',
        'Pages',
        'Pending',
        'Preview',
        'Redirect to an entry',
        'Redirect to another URL',
        'Redo',
        'Reflects current builder settings and may include unsaved changes.',
        'Reload form with banner',
        'Replace with success message',
        'Requires Craft 5',
        'Retry',
        'Return URL',
        'Review spam',
        'Rules',
        'Save',
        'Save this form to view submission statistics and element usage.',
        'Saving',
        'Settings',
        'Show disabled',
        'Show fewer',
        'Show more',
        'Showing {count} of {total}',
        'Site',
        'Sites',
        'Snapshot',
        'Spam',
        'Spam storage is disabled. The chart only includes stored spam. Discarded spam has no daily history.',
        'Statistics unavailable.',
        'Statistics will appear after saving.',
        'Status',
        'Store submitted data',
        'Stored spam',
        'Submission activity',
        'Submissions',
        'Submit behavior',
        'The AI response was cut short by its output limit. Increase Max Tokens in the OpenAI integration or try a smaller section. No form was saved.',
        'The OpenAI generation is no longer available. Check the Forms list before starting another request.',
        'The saved OpenAI generation could not be resumed. Check the Forms list before starting another request.',
        'The selected integration no longer supports this background request.',
        'The selected model does not support this reasoning setting. Choose Model default or a supported reasoning level in the OpenAI integration.',
        'This form is currently not attached to any elements.',
        'Type',
        'Types: {types}',
        'Undo',
        'Unknown',
        'Unsaved',
        'Usage & Stats',
        'Usage in Elements',
        'View submissions',
        'You are about to leave the form builder. Any unsaved changes may be lost if you continue.',
        'enabled',
        'submissions',
        '{count} enabled',
    ];

    private const OBSOLETE_MESSAGES = [
        'Configuration reflects the current builder, including unsaved changes.',
        'Daily submissions and stored spam over the last 90 days',
        'Include this overview when contacting support.',
        '{enabled} enabled · {disabled} disabled',
        'Form layout',
        'Includes unsaved changes.',
        'Share this overview with support.',
    ];

    public function testBuilderMessagesExistInAllFiveLanguagesAndPreservePlaceholders(): void
    {
        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $catalog = require __DIR__.'/../../translations/'.$language.'/freeform.php';
            foreach (self::MESSAGES as $message) {
                $context = $language.': '.$message;
                self::assertArrayHasKey($message, $catalog, $context);
                self::assertIsString($catalog[$message], $context);
                self::assertNotSame('', trim($catalog[$message]), $context);
                preg_match_all('/\{[A-Za-z_]\w*\}/', $message, $expected);
                preg_match_all('/\{[A-Za-z_]\w*\}/', $catalog[$message], $actual);
                sort($expected[0]);
                sort($actual[0]);
                self::assertSame($expected[0], $actual[0], $context);
            }
        }
    }

    public function testSupersededUsageMessagesHaveBeenRemoved(): void
    {
        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $catalog = require __DIR__.'/../../translations/'.$language.'/freeform.php';
            foreach (self::OBSOLETE_MESSAGES as $message) {
                self::assertArrayNotHasKey($message, $catalog, $language.': '.$message);
            }
        }
    }
}
