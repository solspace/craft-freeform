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

use craft\base\Model;
use craft\helpers\App;
use craft\helpers\FileHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\Pro\DigestService;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class Settings extends Model
{
    public const PROTECTION_SIMULATE_SUCCESS = 'simulate_success';
    public const PROTECTION_DISPLAY_ERRORS = 'display_errors';
    public const PROTECTION_RELOAD_FORM = 'reload_form';

    public const DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE = 'Invalid Email Address';
    public const DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE = 'Invalid Entry Data';

    public const EMAIL_TEMPLATE_STORAGE_TYPE_FILES = 'files';
    public const EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE = 'database';
    public const EMAIL_TEMPLATE_STORAGE_TYPE_BOTH = 'files_database';

    public const EMAIL_TEMPLATE_METHOD_ALL = 'all';
    public const EMAIL_TEMPLATE_METHOD_FORM = 'form';
    public const EMAIL_TEMPLATE_METHOD_GLOBAL = 'global';

    public const THROTTLING_TIME_FRAME_MINUTES = 'm';
    public const THROTTLING_TIME_FRAME_SECONDS = 's';

    public const SCRIPT_INSERT_LOCATION_HEADER = 'header';
    public const SCRIPT_INSERT_LOCATION_FOOTER = 'footer';
    public const SCRIPT_INSERT_LOCATION_FORM = 'form';
    public const SCRIPT_INSERT_LOCATION_MANUAL = 'manual';

    /** @deprecated No longer used since Freeform v5.2.3. Use SCRIPT_INSERT_TYPE_FILES instead. */
    public const SCRIPT_INSERT_TYPE_POINTERS = 'pointers';
    public const SCRIPT_INSERT_TYPE_FILES = 'files';
    public const SCRIPT_INSERT_TYPE_INLINE = 'inline';

    public const CONTEXT_TYPE_PAYLOAD = 'payload';
    public const CONTEXT_TYPE_SESSION = 'session';
    public const CONTEXT_TYPE_DATABASE = 'database';

    public const CSRF_REFRESH_NONE = 'none';
    public const CSRF_REFRESH_ONCE = 'once';
    public const CSRF_REFRESH_ALWAYS = 'always';

    public const DEFAULT_AJAX = true;
    public const DEFAULT_FORMATTING_TEMPLATE = 'basic-light/index.twig';

    public const DEFAULT_ACTIVE_SESSION_ENTRIES = 50;
    public const DEFAULT_SESSION_ENTRY_TTL = 10800; // 3 hours

    public const DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES = 180;

    public const SAVE_FORM_TTL = 30;
    public const SAVE_FORM_SESSION_LIMIT = 10;

    public const LOGGING_LEVEL_ERROR = 'error';
    public const LOGGING_LEVEL_INFO = 'info';
    public const LOGGING_LEVEL_DEBUG = 'debug';

    public ?string $pluginName = null;
    public ?string $formTemplateDirectory = null;
    public bool $allowFileTemplateEdit = true;
    public ?string $emailTemplateDirectory = null;
    public string $emailTemplateStorageType = self::EMAIL_TEMPLATE_STORAGE_TYPE_BOTH;
    public string $emailTemplateMethod = self::EMAIL_TEMPLATE_METHOD_FORM;
    public string $emailTemplateDefault = self::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE;

    public bool $allowBuilderTemplateCreation = true;
    public ?string $successTemplateDirectory = null;

    public string $defaultView = Freeform::VIEW_FORMS;

    public string $removeNewlines = 'false';
    public string $exportLabels = 'false';
    public string $exportHandlesAsNames = 'false';
    public string $exportTrackedUrlParameters = 'false';

    /** @deprecated use $scriptInsertLocation instead */
    public bool $footerScripts = false;

    public string $scriptInsertLocation = self::SCRIPT_INSERT_LOCATION_FOOTER;
    public string $scriptInsertType = self::SCRIPT_INSERT_TYPE_FILES;

    public string $formSubmitDisable = 'true';
    public string $rememberPageSubmitOrder = 'true';

    public ?int $formSubmitExpiration = null;
    public ?int $minimumSubmitTime = null;

    public string $spamProtectionBehavior = self::PROTECTION_SIMULATE_SUCCESS;

    public ?int $submissionThrottlingCount = null;
    public ?string $submissionThrottlingTimeFrame = null;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public ?string $blockedEmails = null;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public ?string $blockedKeywords = null;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public string $blockedKeywordsError = self::DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public string $blockedEmailsError = self::DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public bool $showErrorsForBlockedEmails = false;

    /**
     * @deprecated No longer used in Freeform 5.4.1. This is achieved by creating spam block integrations.
     */
    public bool $showErrorsForBlockedKeywords = false;

    public ?string $blockedIpAddresses = null;
    public ?int $purgableSubmissionAgeInDays = null;
    public ?int $purgableSpamAgeInDays = null;
    public ?array $purgableFormIds = null;
    public int $purgableUnfinalizedAssetAgeInMinutes = self::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES;
    public bool $purgeAssets = true;

    public string $spamFolderEnabled = 'true';

    public bool $renderFormHtmlInCpViews = true;

    public string $autoScrollToErrors = 'true';
    public string $autoScroll = 'true';
    public string $fillWithGet = 'false';

    public string $formattingTemplate = self::DEFAULT_FORMATTING_TEMPLATE;

    public int $sessionEntryMaxCount = self::DEFAULT_ACTIVE_SESSION_ENTRIES;
    public int $sessionEntryTTL = self::DEFAULT_SESSION_ENTRY_TTL;

    public ?string $alertNotificationRecipients = null;
    public ?string $errorNotificationRecipients = null;

    public ?string $digestRecipients = null;
    public int $digestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;
    public ?string $clientDigestRecipients = null;
    public int $clientDigestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;

    public string $digestOnlyOnProduction = 'false';
    public string $displayFeed = 'true';
    public string $badgeType = 'all';
    public string $updateSearchIndexes = 'true';
    public string $formFieldShowOnlyAllowedForms = 'false';

    public string $sessionContext = self::CONTEXT_TYPE_PAYLOAD;
    public int $sessionContextTimeToLiveMinutes = 180;
    public int $sessionContextCount = 100;
    public string $sessionContextSecret = '';

    public int $saveFormTtl = self::SAVE_FORM_TTL;
    public int $saveFormSessionLimit = self::SAVE_FORM_SESSION_LIMIT;

    public string $bypassSpamCheckOnLoggedInUsers = 'false';

    public ?int $queuePriority = null;
    public array $hiddenFieldTypes = [];
    public array $surveys = [];
    public string $allowDashesInFieldHandles = 'false';
    public string $sitesEnabled = 'false';
    public string $abTests = 'true';
    public string $defaultFromEmail = '{{ general.systemEmail }}';
    public string $defaultFromName = '{{ general.systemName }}';
    public Defaults $defaults;
    public string $useQueueForEmailNotifications = 'false';
    public string $useQueueForIntegrations = 'false';
    public string $useQueueForAiFields = 'false';
    public string $loggingLevel = self::LOGGING_LEVEL_ERROR;
    public string $csrfRefresh = self::CSRF_REFRESH_ONCE;
    public string $useIdempotencyKey = 'false';

    public string $emailNotificationToolbarConfiguration = Defaults::DEFAULT_TOOLBAR_CONFIGURATION;

    // Queue ping & FM-managed pinger
    public bool $managedPingerEnabled = false;
    public ?string $queuePingToken = null;
    public int $queuePingMinIntervalSeconds = 600;

    public function __construct(array $config = [])
    {
        $this->defaults = new Defaults($config['defaults'] ?? []);
        unset($config['defaults']);

        parent::__construct($config);
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
        if (\array_key_exists('defaults', $values)) {
            $values['defaults'] = new Defaults($values['defaults']);
        }

        parent::setAttributes($values, $safeOnly);
    }

    public function rules(): array
    {
        return [
            ['formTemplateDirectory', 'folderExists'],
        ];
    }

    public function folderExists(string $attribute): void
    {
        $path = $this->{$attribute};
        $absolutePath = $this->getAbsolutePath($path);

        if (!file_exists($absolutePath)) {
            $this->addError(
                $attribute,
                Freeform::t(
                    'Directory "{directory}" does not exist',
                    ['directory' => $absolutePath]
                )
            );
        }
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
    public function getEmailTemplateContent(): string
    {
        $path = __DIR__.'/../templates/_templates/email/default.twig';
        if (!file_exists($path)) {
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
            file_get_contents($path)
        );
    }

    public function getSuccessTemplateContent(): string
    {
        $path = __DIR__.'/../templates/_templates/success/default.twig';
        if (!file_exists($path)) {
            throw new FreeformException(
                Freeform::t(
                    'Could not get success template content. Please contact Solspace.'
                )
            );
        }

        return file_get_contents($path);
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

    public function getBlockedKeywords(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedKeywords);
    }

    public function getBlockedKeywordsError(): string
    {
        return $this->blockedKeywordsError ?? self::DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE;
    }

    public function getBlockedEmails(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedEmails);
    }

    public function getBlockedIpAddresses(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedIpAddresses);
    }

    public function getSessionContextTimeToLiveMinutes(): int
    {
        return (int) App::parseEnv($this->sessionContextTimeToLiveMinutes);
    }

    public function getSessionContextCount(): int
    {
        return (int) App::parseEnv($this->sessionContextCount);
    }

    public function getSessionContextSecret(): string
    {
        return App::parseEnv($this->sessionContextSecret);
    }

    public function getSessionContextHumanReadable(): string
    {
        return match ($this->sessionContext) {
            self::CONTEXT_TYPE_SESSION => 'PHP Session',
            self::CONTEXT_TYPE_DATABASE => 'Database Table',
            default => 'Encrypted Payload',
        };
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
