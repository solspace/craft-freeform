<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\helpers\App;
use craft\helpers\FileHelper;
use CraftCms\Cms\Plugin\PluginSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Codepack\MessageTemplateSamples;
use Solspace\Freeform\Library\Configuration\ErrorAlertRecipients;
use Solspace\Freeform\Library\Configuration\ExportFormatting;
use Solspace\Freeform\Library\Configuration\FormBehaviorUpgrade;
use Solspace\Freeform\Library\Configuration\PayloadContextUpgrade;
use Solspace\Freeform\Library\Configuration\QueueProcessingUpgrade;
use Solspace\Freeform\Library\Configuration\TwigAccessUpgrade;
use Solspace\Freeform\Library\Configuration\UploadRetentionUpgrade;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use Solspace\Freeform\Library\Templates\SampleTemplateUpgrade;
use Solspace\Freeform\Services\Pro\DigestService;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class Settings extends PluginSettings
{
    public const FORM_CREATION_OPTIONS = ['wizard', 'ai', 'blank'];

    public const PROTECTION_SIMULATE_SUCCESS = 'simulate_success';
    public const PROTECTION_DISPLAY_ERRORS = 'display_errors';
    public const PROTECTION_RELOAD_FORM = 'reload_form';

    public const EMAIL_TEMPLATE_STORAGE_TYPE_FILES = 'files';
    public const EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE = 'database';
    public const EMAIL_TEMPLATE_STORAGE_TYPE_BOTH = 'files_database';

    public const EMAIL_TEMPLATE_METHOD_ALL = 'all';
    public const EMAIL_TEMPLATE_METHOD_FORM = 'form';
    public const EMAIL_TEMPLATE_METHOD_GLOBAL = 'global';

    public const THROTTLING_TIME_FRAME_MINUTES = 'm';
    public const THROTTLING_TIME_FRAME_SECONDS = 's';

    public const SCRIPT_INSERT_LOCATION_FOOTER = 'footer';
    public const SCRIPT_INSERT_LOCATION_FORM = 'form';
    public const SCRIPT_INSERT_LOCATION_MANUAL = 'manual';

    public const CSRF_REFRESH_NONE = 'none';
    public const CSRF_REFRESH_ONCE = 'once';
    public const CSRF_REFRESH_ALWAYS = 'always';

    public const DEFAULT_AJAX = true;
    public const DEFAULT_FORMATTING_TEMPLATE = 'freeform-light/index.twig';

    public const DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES = 180;

    public const SAVE_FORM_TTL = 30;
    public const SAVE_FORM_SESSION_LIMIT = 10;

    public ?string $pluginName = null;

    /** Missing keys retain the default enabled state for optional integrations. */
    public array $externalIntegrations = [];

    /** Empty uses the Freeform logo; other values are Craft system icon names. */
    public string $externalIntegrationIcon = '';
    public ?string $formTemplateDirectory = null;
    public bool $allowFileTemplateEdit = true;
    public ?string $emailTemplateDirectory = null;
    public string $emailTemplateStorageType = self::EMAIL_TEMPLATE_STORAGE_TYPE_BOTH;
    public string $emailTemplateMethod = self::EMAIL_TEMPLATE_METHOD_FORM;
    public string $emailTemplateDefault = self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE;

    public bool $allowBuilderTemplateCreation = true;
    public ?string $successTemplateDirectory = null;

    public string $defaultView = Freeform::VIEW_FORMS;
    public array|string $formCreationOptions = self::FORM_CREATION_OPTIONS;
    public string $defaultAiIntegration = '';

    /** '*' allows all volumes, 'none' allows none, and arrays contain volume handles. */
    public array|string $allowedUploadVolumes = '*';

    public string $scriptInsertLocation = self::SCRIPT_INSERT_LOCATION_FOOTER;

    public ?int $formSubmitExpiration = null;
    public ?int $minimumSubmitTime = null;

    public string $spamProtectionBehavior = self::PROTECTION_SIMULATE_SUCCESS;

    public ?int $submissionThrottlingCount = null;
    public ?string $submissionThrottlingTimeFrame = null;

    public ?string $blockedIpAddresses = null;
    public ?int $purgableSubmissionAgeInDays = null;
    public ?int $purgableSpamAgeInDays = null;
    public ?array $purgableFormIds = null;
    public int $purgableUnfinalizedAssetAgeInMinutes = self::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES;

    public string $spamFolderEnabled = 'true';

    public bool $renderFormHtmlInCpViews = true;

    public string $autoScrollToErrors = 'true';
    public string $fillWithGet = 'false';

    public string $formattingTemplate = self::DEFAULT_FORMATTING_TEMPLATE;

    public ?string $errorNotificationRecipients = null;

    public ?string $digestRecipients = null;
    public int $digestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;
    public ?string $clientDigestRecipients = null;
    public int $clientDigestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;

    public string $digestOnlyOnProduction = 'false';
    public string $badgeType = 'errors';
    public string $updateSearchIndexes = 'true';
    public string $formFieldShowOnlyAllowedForms = 'false';

    public string $sessionContextSecret = '';

    public int $saveFormTtl = self::SAVE_FORM_TTL;
    public int $saveFormSessionLimit = self::SAVE_FORM_SESSION_LIMIT;

    public string $bypassSpamCheckOnLoggedInUsers = 'false';

    public ?int $queuePriority = null;
    public array $hiddenFieldTypes = [];
    public array $surveys = [];

    /** Config-only compatibility option; existing stored values remain supported. */
    public string $allowDashesInFieldHandles = 'false';
    public string $sitesEnabled = 'false';
    public string $abTests = 'true';
    public string $defaultFromEmail = '{{ general.systemEmail }}';
    public string $defaultFromName = '{{ general.systemName }}';
    public Defaults $defaults;

    /** A list preserves the OR of multiple migrated environment variables. */
    public array|string $useQueue = 'false';
    public string $loggingStyle = 'activity';

    /** Compatibility guard for earlier configurations; the CP uses loggingStyle. */
    public string $activityEnabled = 'true';
    public string $activityMode = 'standard';
    public array $activityEvents = [];
    public int $activityRetentionDays = 30;
    public int $activityMaxRows = 100000;
    public string $csrfRefresh = self::CSRF_REFRESH_ONCE;
    public string $useIdempotencyKey = 'false';

    public string $emailNotificationToolbarConfiguration = Defaults::DEFAULT_TOOLBAR_CONFIGURATION;

    // Queue ping & FM-managed pinger
    public bool $managedPingerEnabled = false;
    public ?string $queuePingToken = null;
    public int $queuePingMinIntervalSeconds = 600;

    public function __construct(array $config = [])
    {
        $config = self::normalizeLegacySettings($config);
        if (isset($config['allowedUploadVolumes']) && \in_array($config['allowedUploadVolumes'], ['', []], true)) {
            $config['allowedUploadVolumes'] = 'none';
        }
        $this->defaults = new Defaults($config['defaults'] ?? []);
        unset($config['defaults']);

        parent::__construct($config);

        $this->normalizeBooleanStrings();
    }

    public function prepareFolderStructure(): void
    {
        $templatesPath = \Craft::$app->path->getSiteTemplatesPath();

        if ($this->formTemplateDirectory) {
            $formattingPath = FileHelper::absolutePath($this->formTemplateDirectory, $templatesPath);
            if (!is_dir($formattingPath)) {
                FileHelper::createDirectory($formattingPath, 0777);
            }
        }

        if ($this->emailTemplateDirectory) {
            $emailTemplatesPath = FileHelper::absolutePath($this->emailTemplateDirectory, $templatesPath);
            if (!is_dir($emailTemplatesPath)) {
                FileHelper::createDirectory($emailTemplatesPath, 0777);
            }
        }

        if ($this->successTemplateDirectory) {
            $successTemplatesPath = FileHelper::absolutePath($this->successTemplateDirectory, $templatesPath);
            if (!is_dir($successTemplatesPath)) {
                FileHelper::createDirectory($successTemplatesPath, 0777);
            }
        }
    }

    public function setAttributes($values, $safeOnly = false): void
    {
        // A legacy PHP override can arrive after stored settings have been loaded.
        if (\array_key_exists('alertNotificationRecipients', $values) && !\array_key_exists('errorNotificationRecipients', $values)) {
            $values['errorNotificationRecipients'] = $this->errorNotificationRecipients;
        }
        $values = self::normalizeLegacySettings($values);
        // Project config removes empty arrays, so persist an explicit none value.
        if (isset($values['allowedUploadVolumes']) && \in_array($values['allowedUploadVolumes'], ['', []], true)) {
            $values['allowedUploadVolumes'] = 'none';
        }
        if (\array_key_exists('defaults', $values) && !$values['defaults'] instanceof Defaults) {
            $values['defaults']['twigAccess'] ??= $this->defaults->twigAccess;
            $values['defaults'] = new Defaults($values['defaults']);
        }

        parent::setAttributes($values);

        $this->normalizeBooleanStrings();
    }

    public function validationData(): array
    {
        $data = parent::validationData();
        $data['defaults'] = $this->defaults->jsonSerialize();

        return $data;
    }

    public function fields(): array
    {
        $fields = parent::fields();
        unset($fields['errors']);
        $fields['defaults'] = fn () => $this->defaults->jsonSerialize();

        return $fields;
    }

    public function getRules(): array
    {
        return [
            'externalIntegrations' => ['array', static function (string $attribute, mixed $value, \Closure $fail): void {
                foreach ($value as $id => $enabled) {
                    if (!isset(ExternalIntegrations::DEFINITIONS[$id]) || !\in_array($enabled, [true, false, 0, 1, '0', '1', '', 'true', 'false'], true)) {
                        $fail(Freeform::t('Choose valid external integration settings.'));

                        break;
                    }
                }
            }],
            'externalIntegrationIcon' => ['nullable', 'string', 'regex:/^[a-z0-9-]{1,100}$/D'],
            'formTemplateDirectory' => ['nullable', function (string $attribute, mixed $value, \Closure $fail): void {
                $absolutePath = $this->getAbsolutePath($value);

                if (!file_exists($absolutePath)) {
                    $fail(Freeform::t('Directory "{directory}" does not exist', ['directory' => $absolutePath]));
                }
            }],
            'formCreationOptions' => ['required', 'array', 'min:1', static function (string $attribute, mixed $value, \Closure $fail): void {
                if (!\is_array($value) || array_filter($value, static fn ($method) => !\in_array($method, self::FORM_CREATION_OPTIONS, true))) {
                    $fail(Freeform::t('Choose at least one available form creation option.'));
                }
            }],
            'defaultAiIntegration' => ['nullable', 'string', 'max:64'],
            'allowedUploadVolumes' => [static function (string $attribute, mixed $value, \Closure $fail): void {
                if (!\in_array($value, ['*', 'none'], true) && (!\is_array($value) || array_filter($value, static fn ($handle) => !\is_string($handle) || !preg_match('/^[a-zA-Z][a-zA-Z0-9_]*$/D', $handle)))) {
                    $fail(Freeform::t('Choose valid upload volumes.'));
                }
            }],
            'activityMode' => ['required', 'in:'.implode(',', ActivityPolicy::MODES)],
            'loggingStyle' => ['required', 'in:activity,none'],
            'scriptInsertLocation' => ['required', 'in:footer,form,manual'],
            'activityRetentionDays' => ['required', 'integer', 'min:1', 'max:365'],
            'activityMaxRows' => ['required', 'integer', 'min:1000', 'max:1000000'],
            'activityEvents' => ['array', static function (string $attribute, mixed $value, \Closure $fail): void {
                foreach ($value as $event => $enabled) {
                    if (!isset(ActivityPolicy::EVENTS[$event]) || !\in_array($enabled, [true, false, 0, 1, '0', '1', '', 'true', 'false'], true)) {
                        $fail(Freeform::t('Choose valid activity event settings.'));

                        break;
                    }
                }
            }],
        ];
    }

    public function getEffectiveLoggingStyle(): string
    {
        if ($this->isActivityLoggingEnabled()) {
            return 'activity';
        }

        return 'none';
    }

    public function validateExternalIntegrations(string $attribute): void
    {
        foreach ($this->{$attribute} as $id => $enabled) {
            if (!isset(ExternalIntegrations::DEFINITIONS[$id])
                || !\in_array($enabled, [true, false, 0, 1, '0', '1', '', 'true', 'false'], true)) {
                $this->addError($attribute, Freeform::t('Choose valid external integration settings.'));
            }
        }
    }

    public function isActivityLoggingEnabled(): bool
    {
        return 'activity' === $this->loggingStyle && BooleanHelper::normalize($this->activityEnabled);
    }

    /** Normalize stored settings and PHP overrides, including read-only deployments. */
    public static function normalizeLegacySettings(array $settings, bool $preserveExportFormatting = false): array
    {
        if (!$preserveExportFormatting) {
            $settings = ExportFormatting::removeLegacySettings($settings);
        }
        $settings = FormBehaviorUpgrade::settings($settings);
        $settings = SampleTemplateUpgrade::settings($settings);
        $settings = UploadRetentionUpgrade::settings($settings);
        $settings = PayloadContextUpgrade::settings($settings);
        $settings = TwigAccessUpgrade::settings($settings);
        $settings = QueueProcessingUpgrade::settings($settings);
        if (\array_key_exists('alertNotificationRecipients', $settings)) {
            $settings['errorNotificationRecipients'] = ErrorAlertRecipients::merge($settings['errorNotificationRecipients'] ?? null, $settings['alertNotificationRecipients']);
            unset($settings['alertNotificationRecipients']);
        }
        if ('classic' === ($settings['loggingStyle'] ?? null)) {
            $settings['loggingStyle'] = 'activity';
            $settings['activityEnabled'] = 'true';
        }
        if ('header' === ($settings['scriptInsertLocation'] ?? null)) {
            $settings['scriptInsertLocation'] = self::SCRIPT_INSERT_LOCATION_FOOTER;
        }
        if ('all' === ($settings['badgeType'] ?? null)) {
            $settings['badgeType'] = 'errors';
        } elseif ('notices' === ($settings['badgeType'] ?? null)) {
            $settings['badgeType'] = '';
        }
        unset($settings['footerScripts'], $settings['blockedEmails'], $settings['blockedKeywords'], $settings['blockedKeywordsError'], $settings['blockedEmailsError'], $settings['showErrorsForBlockedEmails'], $settings['showErrorsForBlockedKeywords'], $settings['displayFeed'], $settings['technicalFileLogging'], $settings['loggingLevel'], $settings['scriptInsertType'], $settings['autoScroll'], $settings['rememberPageSubmitOrder']);

        return $settings;
    }

    public function isQueueEnabled(): bool
    {
        foreach ((array) $this->useQueue as $value) {
            if (BooleanHelper::normalize($value)) {
                return true;
            }
        }

        return false;
    }

    public function getQueueControlValue(): string
    {
        return \is_array($this->useQueue) ? ($this->isQueueEnabled() ? 'true' : 'false') : $this->useQueue;
    }

    public function validateActivityEvents(string $attribute): void
    {
        foreach ($this->{$attribute} as $event => $enabled) {
            if (!isset(ActivityPolicy::EVENTS[$event]) || !\in_array($enabled, [true, false, 0, 1, '0', '1', '', 'true', 'false'], true)) {
                $this->addError($attribute, Freeform::t('Choose valid activity event settings.'));

                break;
            }
        }
    }

    public function validateAllowedUploadVolumes(string $attribute): void
    {
        $value = $this->{$attribute};
        if (!\in_array($value, ['*', 'none'], true) && (!\is_array($value) || array_filter($value, static fn ($handle) => !\is_string($handle) || !preg_match('/^[a-zA-Z][a-zA-Z0-9_]*$/D', $handle)))) {
            $this->addError($attribute, Freeform::t('Choose valid upload volumes.'));
        }
    }

    public function getEnabledFormCreationOptions(): array
    {
        $configured = \is_array($this->formCreationOptions) ? $this->formCreationOptions : [];

        return array_values(array_filter(self::FORM_CREATION_OPTIONS, static fn ($method) => \in_array($method, $configured, true)));
    }

    // Legacy Twig fields and controllers still use these Yii error accessors.
    public function getErrors(?string $attribute = null): array
    {
        return null === $attribute ? $this->errors()->getMessages() : $this->errors()->get($attribute);
    }

    public function addError(string $attribute, string $message): void
    {
        $this->errors()->add($attribute, $message);
    }

    /**
     * If a form template directory has been set and it exists - return its absolute path.
     */
    public function getAbsoluteFormTemplateDirectory(): ?string
    {
        if ($this->formTemplateDirectory) {
            $absolutePath = $this->getAbsolutePath($this->formTemplateDirectory);

            return file_exists($absolutePath) ? $absolutePath : null;
        }

        return null;
    }

    public function canManageEmailTemplates(): bool
    {
        $canEditTemplates = self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE === $this->emailTemplateStorageType
            || (self::EMAIL_TEMPLATE_STORAGE_TYPE_BOTH === $this->emailTemplateStorageType && self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE === $this->emailTemplateDefault)
            || ($this->getAbsoluteEmailTemplateDirectory() && $this->allowFileTemplateEdit);

        return PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE)
            && $canEditTemplates;
    }

    /**
     * If an email template directory has been set and it exists - return its absolute path.
     */
    public function getAbsoluteEmailTemplateDirectory(): ?string
    {
        if ($this->emailTemplateDirectory) {
            $absolutePath = $this->getAbsolutePath($this->emailTemplateDirectory);

            return file_exists($absolutePath) ? $absolutePath : null;
        }

        return null;
    }

    public function getEmailStorageTypeName(): string
    {
        return match ($this->emailTemplateStorageType) {
            self::EMAIL_TEMPLATE_STORAGE_TYPE_FILES => 'File',
            self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE => 'Database',
            self::EMAIL_TEMPLATE_STORAGE_TYPE_BOTH => 'File & Database',
            default => 'Not set',
        };
    }

    public function getEmailTemplateDefault(): string
    {
        return match ($this->emailTemplateStorageType) {
            self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE => self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE,
            self::EMAIL_TEMPLATE_STORAGE_TYPE_FILES => self::EMAIL_TEMPLATE_STORAGE_TYPE_FILES,
            default => $this->emailTemplateDefault,
        };
    }

    public function getAbsoluteSuccessTemplateDirectory(): ?string
    {
        if ($this->successTemplateDirectory) {
            $absolutePath = $this->getAbsolutePath($this->successTemplateDirectory);

            return file_exists($absolutePath) ? $absolutePath : null;
        }

        return null;
    }

    public function cloneDemoTemplateContent(string $name, string $destination): void
    {
        $source = __DIR__."/../templates/_templates/formatting/{$name}";
        if (!file_exists($source) || !is_dir($source)) {
            throw new FreeformException(
                Freeform::t('Could not get demo template content. Please contact Solspace.')
            );
        }

        FileHelper::copyDirectory($source, $destination);
    }

    /**
     * Gets the default email template content.
     *
     * @throws FreeformException
     */
    public function getEmailTemplateContent(?string $sampleId = null): string
    {
        $path = __DIR__.'/../templates/_templates/email/default.twig';
        $content = null === $sampleId ? (file_exists($path) ? file_get_contents($path) : false) : (MessageTemplateSamples::get('email', $sampleId)['content'] ?? false);
        if (false === $content) {
            throw new FreeformException(
                Freeform::t(
                    'Could not get email template content. Please contact Solspace.'
                )
            );
        }

        $email = $this->defaultFromEmail ?: '{{ general.systemEmail }}';
        $name = $this->defaultFromName ?: '{{ general.systemName }}';

        return str_replace(
            ['__placeholderFromEmail__', '__placeholderFromName__'],
            [$email, $name],
            $content
        );
    }

    public function getSuccessTemplateContent(?string $sampleId = null): string
    {
        $path = __DIR__.'/../templates/_templates/success/default.twig';
        $content = null === $sampleId ? (file_exists($path) ? file_get_contents($path) : false) : (MessageTemplateSamples::get('success', $sampleId)['content'] ?? false);
        if (false === $content) {
            throw new FreeformException(
                Freeform::t(
                    'Could not get success template content. Please contact Solspace.'
                )
            );
        }

        return $content;
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInFormTemplateDirectory(): array
    {
        return $this->getTemplatesInDirectory($this->getAbsoluteFormTemplateDirectory());
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInEmailTemplateDirectory(): array
    {
        return $this->getTemplatesInDirectory($this->getAbsoluteEmailTemplateDirectory());
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInSuccessTemplateDirectory(): array
    {
        return $this->getTemplatesInDirectory($this->getAbsoluteSuccessTemplateDirectory());
    }

    public function getBlockedIpAddresses(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedIpAddresses);
    }

    public function getSessionContextSecret(): string
    {
        return App::parseEnv($this->sessionContextSecret);
    }

    /**
     * Boolean settings are stored as strings so they can hold environment variables.
     * Craft's boolean menu only recognizes '1' and '0', so a literal 'true' or 'false'
     * renders with no selected option and the browser submits the first one ('1'),
     * silently enabling the setting on the next save. Store '1' / '0' instead.
     */
    private function normalizeBooleanStrings(): void
    {
        static $booleanProperties = null;

        if (null === $booleanProperties) {
            $booleanProperties = [];

            foreach ((new \ReflectionClass(self::class))->getProperties(\ReflectionProperty::IS_PUBLIC) as $property) {
                if ($property->hasDefaultValue() && \in_array($property->getDefaultValue(), ['true', 'false'], true)) {
                    $booleanProperties[] = $property->getName();
                }
            }
        }

        foreach ($booleanProperties as $property) {
            $value = $this->{$property};

            if (\is_string($value) && \in_array(strtolower($value), ['true', 'false'], true)) {
                $this->{$property} = 'true' === strtolower($value) ? '1' : '0';
            }
        }
    }

    /**
     * Takes a comma or newline (or both) separated string
     * and returns a cleaned up, unique value array.
     */
    private function getArrayFromDelimitedText(?string $value = null): array
    {
        if (empty($value)) {
            return [];
        }

        $array = preg_split('/\s+(?=([^"]*"[^"]*")*[^"]*$)|\n|,/', $value);
        $array = array_map('trim', $array);
        $array = array_map(
            static function ($value) {
                return trim($value, '"');
            },
            $array
        );
        $array = array_filter($array);
        $array = array_unique($array);

        return array_filter($array);
    }

    /**
     * @param string $path
     */
    private function getAbsolutePath($path): string
    {
        $isAbsolute = $this->isFolderAbsolute($path);

        return $isAbsolute ? $path : (\Craft::$app->path->getSiteTemplatesPath().'/'.$path);
    }

    /**
     * @param string $path
     */
    private function isFolderAbsolute($path): bool
    {
        return preg_match('/^(?:\/|\\\|\w\:\\\).*$/', $path);
    }

    private function getTemplatesInDirectory(?string $templateDirectoryPath = null): array
    {
        if ('/' === $templateDirectoryPath || !file_exists($templateDirectoryPath) || !is_dir($templateDirectoryPath)) {
            return [];
        }

        $fs = new Finder();

        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs
            ->in($templateDirectoryPath)
            ->name('*.html')
            ->name('*.twig')
            ->files()
        ;

        $files = [];

        try {
            foreach ($fileIterator as $file) {
                $path = $file->getRealPath();
                $files[$path] = pathinfo($path, \PATHINFO_BASENAME);
            }
        } catch (\RuntimeException $e) {
            return [];
        }

        return $files;
    }
}
