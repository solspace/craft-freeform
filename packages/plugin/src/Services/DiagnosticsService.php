<?php

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\helpers\App;
use craft\helpers\UrlHelper;
use craft\mail\transportadapters\Gmail;
use craft\mail\transportadapters\Sendmail;
use craft\mail\transportadapters\Smtp;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Library\DataObjects\Diagnostics\DiagnosticItem;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\NoticeValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\SuggestionValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\WarningValidator;
use Solspace\Freeform\Library\DataObjects\Summary\InstallSummary;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;

class DiagnosticsService extends BaseService
{
    public function __construct(
        $config,
        private IntegrationTypeProvider $integrationTypeProvider,
    ) {
        parent::__construct($config);
    }

    /**
     * @return DiagnosticItem[]
     */
    public function getServerChecks(): array
    {
        $trueOrFalse = function ($value) { return (bool) $value; };
        $system = $this->getSummary()->statistics->system;
        [$emailTransport, $emailIssues] = $this->getEmailSettings();

        return [
            new DiagnosticItem(
                'Freeform <b>{{ value.edition|title }} {{ value.version }}</b>',
                [
                    'edition' => Freeform::getInstance()->edition,
                    'version' => Freeform::getInstance()->getVersion(),
                ]
            ),
            new DiagnosticItem(
                'Craft <b>{{ value.edition|title }} {{ value.version }}</b>',
                [
                    'version' => $system->craftVersion,
                    'edition' => $system->craftEdition,
                ],
                [
                    new WarningValidator(
                        fn ($value) => version_compare($value['version'], '4.0.0', '>='),
                        'Craft compatibility issue',
                        'The current minimum Craft version Freeform supports is 4.0.0 or greater.'
                    ),
                    new SuggestionValidator(
                        fn ($value) => version_compare($value['version'], '5.2.0', '<'),
                        'Potential Craft Compatibility issue',
                        'This version of Freeform may not be fully compatible with this version of Craft and may encounter issues. Please check if there are any updates available.'
                    ),
                ]
            ),
            new DiagnosticItem(
                'PHP <b>{{ value }}</b>',
                $system->phpVersion,
                [
                    new WarningValidator(
                        fn ($value) => version_compare($value, '8.0.2', '>='),
                        'PHP Compatibility issue',
                        'The current minimum PHP version Freeform supports is 8.0.2 or greater.'
                    ),
                    new SuggestionValidator(
                        fn ($value) => version_compare($value, '8.4.0', '<='),
                        'Potential PHP Compatibility issue',
                        'This version of Freeform may not be fully compatible with this version of PHP and may encounter issues. Please check if there are any updates available.'
                    ),
                ]
            ),
            new DiagnosticItem(
                'Database Driver: <b>{{ value.driver == "pgsql" ? "PostgreSQL" : value.driver == "mysql" ? "MySQL" : "MariaDB" }} {{ value.version }}</b>',
                [
                    'driver' => $system->databaseDriver,
                    'version' => \Craft::$app->db->getServerVersion(),
                ],
                [
                    new WarningValidator(
                        function ($value) {
                            if ('mysql' !== $value['driver']) {
                                return true;
                            }

                            return version_compare($value['version'], '5.5', '>');
                        },
                        'MySQL Compatibility issue',
                        'The current minimum MySQL version Freeform supports is 5.5.x or greater.'
                    ),
                    new WarningValidator(
                        function ($value) {
                            if ('pgsql' !== $value['driver']) {
                                return true;
                            }

                            return version_compare($value['version'], '9.5', '>');
                        },
                        'PostgreSQL Compatibility issue',
                        'The current minimum PostgreSQL version Freeform supports is 9.5.x or greater.'
                    ),
                ]
            ),
            new DiagnosticItem(
                'OS: <b>{{ value }}</b>',
                sprintf('%s %s', \PHP_OS, php_uname('r')),
            ),
            new DiagnosticItem(
                'Dev Mode: <b>{{ value.devmode == 1 ? "On" : "Off" }}</b> / Allow Admin Changes: <b>{{ value.allowadmin == 1 ? "Yes" : "No" }}</b>',
                [
                    'devmode' => \Craft::$app->getConfig()->getGeneral()->devMode,
                    'allowadmin' => \Craft::$app->getConfig()->getGeneral()->allowAdminChanges,
                ],
            ),
            new DiagnosticItem(
                'Memory Limit: <b>{{ value }}</b>',
                \ini_get('memory_limit'),
                [
                    // Suggestion validator for memory limits between 256M and 511M
                    new SuggestionValidator(
                        function ($value) {
                            preg_match('/^(-?\d+)(\w)?/', $value, $matches);
                            $number = (int) ($matches[1] ?? -1);
                            $measurement = isset($matches[2]) ? strtolower($matches[2]) : null;

                            $multiplier = match ($measurement) {
                                'k' => 1024,
                                'm' => 1024 ** 2,
                                'g' => 1024 ** 3,
                                default => 1,
                            };

                            $bytes = $number * $multiplier;
                            $min256M = 256 * 1024 ** 2; // 256M in bytes
                            $max511M = 511 * 1024 ** 2; // 511M in bytes

                            // Trigger the suggestion if the memory limit is outside the range of 256M to 511M
                            return $bytes < $min256M || $bytes >= $max511M;
                        },
                        'Memory Limit suggestion',
                        'Freeform recommends a memory limit of 512M or greater. Please consider increasing the memory limit.'
                    ),
                    // Warning validator for memory limits below 256M
                    new WarningValidator(
                        function ($value) {
                            preg_match('/^(-?\d+)(\w)?/', $value, $matches);
                            $number = (int) ($matches[1] ?? -1);
                            $measurement = isset($matches[2]) ? strtolower($matches[2]) : null;

                            $multiplier = match ($measurement) {
                                'k' => 1024,
                                'm' => 1024 ** 2,
                                'g' => 1024 ** 3,
                                default => 1,
                            };

                            $bytes = $number * $multiplier;
                            $min = 256 * (1024 ** 2); // 256M in bytes

                            // Trigger the warning if the memory limit is less than 256M
                            return -1 === $bytes || $bytes >= $min;
                        },
                        'Memory Limit issue',
                        'Freeform requires a minimum memory limit of 256M but recommends using at least 512M. Please consider increasing the memory limit.'
                    ),
                ]
            ),
            new DiagnosticItem(
                'Craft Email configuration: <b>{{ value.transport }}</b>',
                ['transport' => $emailTransport, 'issues' => $emailIssues],
            ),
            new DiagnosticItem(
                'PHP Sessions: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                \PHP_SESSION_ACTIVE === session_status() && isset($_SESSION) && session_id(),
                [
                    new WarningValidator(
                        $trueOrFalse,
                        'Potential issue with PHP Sessions',
                        'Tested server environment for a valid PHP session and it failed.'
                    ),
                ]
            ),
            new DiagnosticItem(
                'BC Math extension: <b>{{ value ? "Enabled" : "Not Found" }}</b>',
                \extension_loaded('bcmath'),
                [
                    new WarningValidator(
                        $trueOrFalse,
                        'Missing BC Math PHP extension',
                        'Missing BC Math PHP extension'
                    ),
                ]
            ),
            new DiagnosticItem(
                'ImageMagick extension: <b>{{ value ? "Enabled" : "Not Found" }}</b>',
                \extension_loaded('imagick') || \extension_loaded('gd'),
                [
                    new WarningValidator(
                        $trueOrFalse,
                        'Missing GD extension or ImageMagick extension',
                        'Missing GD extension or ImageMagick extension'
                    ),
                ]
            ),
        ];
    }

    /**
     * @return DiagnosticItem[]
     */
    public function getFreeformStats(): array
    {
        $freeform = Freeform::getInstance();
        $statistics = $this->getSummary()->statistics;

        $formTemplates = $freeform->settings->getCustomFormTemplates();
        $successTemplates = $freeform->settings->getSuccessTemplates();
        $emailTemplates = $freeform->notifications->getAllNotifications();
        $formTypes = $freeform->formTypes->getTypes();
        $integrations = $freeform->integrations->getAllIntegrations();

        $diagnosticItems = [
            new DiagnosticItem(
                'Forms: <b>{{ value }}</b>',
                $statistics->totals->forms
            ),
            new DiagnosticItem(
                'Fields: <b>{{ value }}</b>',
                $statistics->totals->fields
            ),
            new DiagnosticItem(
                'Favorites Fields: <b>{{ value }}</b>',
                $statistics->totals->favoriteFields
            ),
            new DiagnosticItem(
                'Submissions: <b>{{ value }}</b>',
                $statistics->totals->submissions
            ),
            new DiagnosticItem(
                'Spam Submissions: <b>{{ value }}</b>',
                $statistics->totals->spam
            ),
            new DiagnosticItem(
                'Formatting templates: <b>{{ value }}</b>',
                \count($formTemplates)
            ),
            new DiagnosticItem(
                'Email Notification templates: <b>{{ value }}</b>',
                \count($emailTemplates)
            ),
            new DiagnosticItem(
                'Success templates: <b>{{ value }}</b>',
                \count($successTemplates)
            ),
            new DiagnosticItem(
                'Integrations: <b>{{ value }}</b>',
                \count($integrations)
            ),
        ];

        // Check if Freeform Pro is enabled, then add the Form types item
        if ($freeform->isPro()) {
            $diagnosticItems[] = new DiagnosticItem(
                'Form types: <b>{{ value|length }}</b>',
                \count($formTypes)
            );
        }

        return $diagnosticItems;
    }

    /**
     * @return DiagnosticItem[]
     */
    public function getFreeformIntegrations(): array
    {
        $integrations = $this->getIntegrationCount();
        $diagnosticItems = [];

        foreach ($integrations as $integration) {
            $name = $integration['name'];
            $version = $integration['version'];
            $count = $integration['count'];

            // Mapping versions to their display names
            $versionMap = [
                'checkbox' => 'Checkbox',
                'invisible' => 'Invisible',
                'v2-checkbox' => 'v2 Checkbox',
                'v2-invisible' => 'v2 Invisible',
            ];

            // Modify version text based on specific conditions or use defaults
            $version = $versionMap[strtolower($version)] ?? $version;

            $label = "{$name}".($version ? " ({$version}):" : ':')."<b>{$count}</b> ".(1 === $count ? 'form' : 'forms');

            $diagnosticItems[] = new DiagnosticItem($label, ['value' => $integration]);
        }

        return $diagnosticItems;
    }

    /**
     * @return DiagnosticItem[]
     */
    public function getFreeformFormType(): array
    {
        $freeform = Freeform::getInstance();
        $statistics = $this->getSummary()->statistics;

        if ($freeform->isPro()) {
            return [
                new DiagnosticItem(
                    'Regular: <b>{{ value }}</b> {{ value != 1 ? "forms" : "form" }}',
                    $statistics->totals->regularForm
                ),
                new DiagnosticItem(
                    'Payments: <b>{{ value }}</b> {{ value != 1 ? "forms" : "form" }}',
                    $this->getFormsWithPaymentIntegrations()
                ),
            ];
        }

        return []; // Or any other action for non-Pro users
    }

    /**
     * @return DiagnosticItem[]
     */
    public function getFreeformConfigurations(): array
    {
        [$emailTransport, $emailIssues] = $this->getEmailSettings();

        return [
            'General Settings' => [
                new DiagnosticItem(
                    'Disable Submit Button on Form Submit: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    $this->getSummary()->statistics->settings->disableSubmit
                ),
                new DiagnosticItem(
                    'Automatically Scroll to Form on Errors and Multipage forms: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    $this->getSummary()->statistics->settings->autoScroll,
                ),
                new DiagnosticItem(
                    'Script Insert Location: <b>{{ value|capitalize }}</b>',
                    $this->getSummary()->statistics->settings->jsInsertLocation,
                    [
                        new NoticeValidator(
                            fn ($value) => Settings::SCRIPT_INSERT_LOCATION_MANUAL !== $value,
                            '',
                            'Please make sure you are adding Freeform’s scripts manually.'
                        ),
                    ]
                ),
                new DiagnosticItem(
                    'Script Insert Type: <b>{{ value }}</b>',
                    $this->getJsInsertType()
                ),
                new DiagnosticItem(
                    'Freeform Session Context: <b>{{ value }}</b>',
                    $this->getSettingsService()->getSettingsModel()->getSessionContextHumanReadable(),
                ),
                new DiagnosticItem(
                    'Enable Search Index Updating on New Submissions: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    $this->getSettingsService()->getSettingsModel()->updateSearchIndexes
                ),
                new DiagnosticItem(
                    'Automatically Purge Submission Data: <b>{{ value.enabled ? "Enabled, "~value.interval~" days" : "Disabled"  }}</b>',
                    [
                        'enabled' => $this->getSummary()->statistics->settings->purgeSubmissions,
                        'interval' => $this->getSummary()->statistics->settings->purgeInterval,
                    ],
                ),
            ],
            'Spam Controls' => [
                new DiagnosticItem(
                    'Spam Folder: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    $this->getSummary()->statistics->spam->spamFolder,
                    [
                        new SuggestionValidator(
                            fn ($value) => $value,
                            '',
                            'Most websites can benefit from using this feature because it helps detect false positives.'
                        ),
                    ]
                ),
                new DiagnosticItem(
                    'Spam Blocking: <b>{{ value|join(", ") }}</b>',
                    $this->getSpamBlockers()
                ),
                new DiagnosticItem(
                    'Spam Protection Behavior : <b>{{ value }}</b>',
                    $this->getSummary()->statistics->spam->spamProtectionBehavior
                ),
                new DiagnosticItem(
                    'Bypass All Spam Checks for Logged in Users: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    $this->getSummary()->statistics->spam->bypassSpamCheckOnLoggedInUsers
                ),
                new DiagnosticItem(
                    'Form Submission Throttling: <b>{{ value }} per minutes</b>',
                    $this->getSummary()->statistics->spam->submissionThrottlingCount
                ),
            ],

            'Template Directories' => [
                new DiagnosticItem(
                    'Formatting Templates Directory Path: <b>{{ value ? value : "Not set" }}</b>',
                    $this->getSettingsService()->getSettingsModel()->formTemplateDirectory,
                    [
                        new NoticeValidator(
                            function ($value) {
                                if ($value) {
                                    if ('/' !== substr($value, 0, 1)) {
                                        $value = \Craft::getAlias('@templates').\DIRECTORY_SEPARATOR.$value;
                                    }

                                    return file_exists($value) && is_dir($value);
                                }

                                return true;
                            },
                            '',
                            'Formatting Templates Directory Path: Not set correctly'
                        ),
                    ]
                ),
                new DiagnosticItem(
                    'Email Templates Directory Path: <b>{{ value ? value : "Not set" }}</b>',
                    $this->getSettingsService()->getSettingsModel()->emailTemplateDirectory,
                    [
                        new NoticeValidator(
                            function ($value) {
                                if ($value) {
                                    if ('/' !== substr($value, 0, 1)) {
                                        $value = \Craft::getAlias('@templates').\DIRECTORY_SEPARATOR.$value;
                                    }

                                    return file_exists($value) && is_dir($value);
                                }

                                return true;
                            },
                            '',
                            'Email Notification Templates Directory Path: Not set correctly'
                        ),
                    ]
                ),
                new DiagnosticItem(
                    'Email Template Storage Type: <b>{{ value }}</b>',
                    $this->getSettingsService()->getSettingsModel()->getEmailStorageTypeName()
                ),
                new DiagnosticItem(
                    'Success Templates Directory Path: <b>{{ value ? value : "Not set" }}</b>',
                    $this->getSettingsService()->getSettingsModel()->successTemplateDirectory,
                    [
                        new NoticeValidator(
                            function ($value) {
                                if ($value) {
                                    if ('/' !== substr($value, 0, 1)) {
                                        $value = \Craft::getAlias('@templates').\DIRECTORY_SEPARATOR.$value;
                                    }

                                    return file_exists($value) && is_dir($value);
                                }

                                return true;
                            },
                            '',
                            'Success Templates Directory Path: Not set correctly'
                        ),
                    ]
                ),
            ],

            'Reliability' => [
                new DiagnosticItem(
                    'Developer Digest Email: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    \count($this->getSettingsService()->getDigestRecipients()) > 0
                ),
                new DiagnosticItem(
                    'Update Warnings & Notices: <b>{{ value ? "Enabled" : "Disabled" }}</b>',
                    (bool) $this->getSettingsService()->getSettingsModel()->displayFeed
                ),
                new DiagnosticItem(
                    'Errors logged: <b>{{ value ? value~" errors found" : "None found" }}</b>',
                    Freeform::getInstance()->logger->getLogReader()->count(),
                    [
                        new WarningValidator(
                            function ($value) {
                                return !$value;
                            },
                            '{{ extra.count }} Errors logged in the Freeform Error Log',
                            'Please check the <a href="{{ extra.url }}">error log </a> to see if there are any serious issues.',
                            [
                                'url' => UrlHelper::cpUrl('freeform/settings/error-log'),
                                'count' => Freeform::getInstance()->logger->getLogReader()->count(),
                            ]
                        ),
                    ]
                ),
            ],
        ];
    }

    private function getEmailSettings(): array
    {
        $from = App::mailSettings()->fromEmail;

        $issues = null;

        switch (App::mailSettings()->transportType) {
            case Smtp::class:
                $transport = 'SMTP';

                $notifications = Freeform::getInstance()->notifications->getAllNotifications();
                foreach ($notifications as $notification) {
                    if ($from !== $notification->getFromEmail()) {
                        $issues = 'misaligned_from';
                    }
                }

                break;

            case Gmail::class:
                $transport = 'Gmail';

                break;

            case Sendmail::class:
                $transport = 'Sendmail';

                break;

            default:
                $transport = 'None';
        }

        return [$transport, $issues];
    }

    private function getSpamBlockers(): array
    {
        $spam = $this->getSummary()->statistics->spam;

        $blockers = [];
        if ($spam->blockEmail) {
            $blockers[] = Freeform::t('Email');
        }

        if ($spam->blockKeywords) {
            $blockers[] = Freeform::t('Keywords');
        }

        if ($spam->blockIp) {
            $blockers[] = Freeform::t('IP addresses');
        }

        if ($spam->minSubmitTime) {
            $blockers[] = Freeform::t('Minimum Submit Time');
        }

        if ($spam->submitExpiration) {
            $blockers[] = Freeform::t('Submit Expiration');
        }

        if ($spam->submissionThrottling) {
            $blockers[] = Freeform::t('Submission Throttling');
        }

        if (empty($blockers)) {
            $blockers[] = Freeform::t('Disabled');
        }

        return $blockers;
    }

    private function getJsInsertType(): string
    {
        return match ($this->getSummary()->statistics->settings->jsInsertType) {
            Settings::SCRIPT_INSERT_TYPE_POINTERS => 'Static URLs',
            Settings::SCRIPT_INSERT_TYPE_FILES => 'Asset Bundles',
            Settings::SCRIPT_INSERT_TYPE_INLINE => 'Inline Scripts',
            default => '',
        };
    }

    private function getSummary(): InstallSummary
    {
        static $summary;
        if (null === $summary) {
            $summary = Freeform::getInstance()->summary->getSummary();
        }

        return $summary;
    }

    private function getIntegrationCount(): array
    {
        $integrations = (new Query())
            ->select(['fi.id', 'fi.integrationId', 'fi.formId', 'integrations.class', 'integrations.metadata'])
            ->from(FormIntegrationRecord::TABLE.' fi')
            ->innerJoin(IntegrationRecord::TABLE.' integrations', 'integrations.id = fi.integrationId')
            ->where(['fi.enabled' => true])
            ->all()
        ;

        $integrationsByForm = [];

        foreach ($integrations as $integration) {
            $id = $integration['integrationId'];

            if (!isset($integrationsByForm[$id])) {
                $type = $this->integrationTypeProvider->getTypeDefinition($integration['class']);

                // Check if the version exists in the type; otherwise, use metadata
                $version = $type->version ?? JsonHelper::decode($integration['metadata'], true)['version'] ?? null;

                $integrationsByForm[$id] = [
                    'name' => $type->name,
                    'version' => $version ?? '', // Provide a default value if version is not found
                    'count' => 0,
                ];
            }

            ++$integrationsByForm[$id]['count'];
        }

        return $integrationsByForm;
    }

    private function getFormsWithPaymentIntegrations(): int
    {
        return FormFieldRecord::find()
            ->select('formId')
            ->distinct()
            ->where(['type' => StripeField::class])
            ->count()
        ;
    }
}
