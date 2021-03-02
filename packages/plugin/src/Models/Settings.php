<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Services\Pro\DigestService;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class Settings extends Model
{
    const EMAIL_TEMPLATE_STORAGE_DB = 'db';
    const EMAIL_TEMPLATE_STORAGE_FILE = 'template';

    const PROTECTION_SIMULATE_SUCCESS = 'simulate_success';
    const PROTECTION_DISPLAY_ERRORS = 'display_errors';
    const PROTECTION_RELOAD_FORM = 'reload_form';

    const DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE = 'Invalid Email Address';
    const DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE = 'Invalid Entry Data';

    const THROTTLING_TIME_FRAME_MINUTES = 'm';
    const THROTTLING_TIME_FRAME_SECONDS = 's';

    const RECAPTCHA_TYPE_V2_CHECKBOX = 'v2_checkbox';
    const RECAPTCHA_TYPE_V2_INVISIBLE = 'v2_invisible';
    const RECAPTCHA_TYPE_V3 = 'v3';

    const RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR = 'display_error';
    const RECAPTCHA_BEHAVIOUR_SPAM = 'spam';

    const RECAPTCHA_THEME = 'light';
    const RECAPTCHA_SIZE = 'normal';
    const RECAPTCHA_ERROR_MESSAGE = 'Please verify that you are not a robot.';

    const SCRIPT_INSERT_LOCATION_FOOTER = 'footer';
    const SCRIPT_INSERT_LOCATION_FORM = 'form';
    const SCRIPT_INSERT_LOCATION_MANUAL = 'manual';

    const DEFAULT_AJAX = true;
    const DEFAULT_FORMATTING_TEMPLATE = 'flexbox.html';

    const DEFAULT_ACTIVE_SESSION_ENTRIES = 50;
    const DEFAULT_SESSION_ENTRY_TTL = 10800; // 3 hours

    const DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES = 180;

    /** @var string */
    public $pluginName;

    /** @var string */
    public $formTemplateDirectory;

    /** @var string */
    public $emailTemplateDirectory;

    /** @var string */
    public $emailTemplateStorage;

    /** @var string */
    public $defaultView;

    /** @var string */
    public $fieldDisplayOrder;

    /** @var bool */
    public $showTutorial;

    /** @var bool */
    public $removeNewlines;

    /** @var bool */
    public $defaultTemplates;

    /** @deprecated use $scriptInsertLocation instead */
    public $footerScripts;

    /** @var string */
    public $scriptInsertLocation;

    /** @var bool */
    public $formSubmitDisable;

    /** @var bool */
    public $freeformHoneypot;

    /** @var bool */
    public $freeformHoneypotEnhancement;

    /** @var string */
    public $customHoneypotName;

    /** @var string */
    public $customErrorMessage;

    /** @var int */
    public $formSubmitExpiration;

    /** @var int */
    public $minimumSubmitTime;

    /** @var string */
    public $spamProtectionBehaviour;

    /** @var int */
    public $submissionThrottlingCount;

    /** @var string */
    public $submissionThrottlingTimeFrame;

    /** @var string */
    public $blockedEmails;

    /** @var string */
    public $blockedKeywords;

    /** @var string */
    public $blockedKeywordsError;

    /** @var string */
    public $blockedEmailsError;

    /** @var bool */
    public $showErrorsForBlockedEmails;

    /** @var bool */
    public $showErrorsForBlockedKeywords;

    /** @var string */
    public $blockedIpAddresses;

    /** @var int */
    public $purgableSubmissionAgeInDays;

    /** @var int */
    public $purgableSpamAgeInDays;

    /** @var int */
    public $purgableUnfinalizedAssetAgeInMinutes;

    /** @var string */
    public $salesforce_client_id;

    /** @var string */
    public $salesforce_client_secret;

    /** @var string */
    public $salesforce_username;

    /** @var string */
    public $salesforce_password;

    /** @var bool */
    public $spamFolderEnabled;

    /** @var bool */
    public $recaptchaEnabled;

    /** @var string */
    public $recaptchaKey;

    /** @var string */
    public $recaptchaSecret;

    /** @var string */
    public $recaptchaType;

    /** @var float */
    public $recaptchaMinScore;

    /** @var string */
    public $recaptchaBehaviour;

    /** @var string */
    public $recaptchaTheme;

    /** @var string */
    public $recaptchaSize;

    /** @var string */
    public $recaptchaErrorMessage;

    /** @var bool */
    public $renderFormHtmlInCpViews;

    /** @var bool */
    public $ajaxByDefault;

    /** @var bool */
    public $autoScrollToErrors;

    /** @var bool */
    public $fillWithGet;

    /** @var string */
    public $formattingTemplate;

    /** @var bool */
    public $hideBannerDemo = false;

    /** @var bool */
    public $hideBannerOldFreeform = false;

    /** @var int */
    public $sessionEntryMaxCount;

    /** @var int */
    public $sessionEntryTTL;

    /** @var string */
    public $alertNotificationRecipients;

    /** @var string */
    public $digestRecipients;

    /** @var string */
    public $digestFrequency;

    /** @var string */
    public $clientDigestRecipients;

    /** @var string */
    public $clientDigestFrequency;

    /** @var bool */
    public $digestOnlyOnProduction;

    /** @var array */
    public $displayFeed;

    /** @var array */
    public $feedInfo;

    /** @var string */
    public $badgeType;

    /** @var bool */
    public $twigInHtml;

    /** @var bool */
    public $twigInHtmlIsolatedMode;

    /** @var bool */
    public $updateSearchIndexes;

    /**
     * Settings constructor.
     */
    public function __construct(array $config = [])
    {
        $this->pluginName = null;
        $this->formTemplateDirectory = null;
        $this->emailTemplateDirectory = null;
        $this->emailTemplateStorage = self::EMAIL_TEMPLATE_STORAGE_DB;
        $this->defaultView = Freeform::VIEW_DASHBOARD;
        $this->fieldDisplayOrder = Freeform::FIELD_DISPLAY_ORDER_NAME;
        $this->showTutorial = true;
        $this->defaultTemplates = true;
        $this->removeNewlines = false;
        $this->footerScripts = false;
        $this->scriptInsertLocation = self::SCRIPT_INSERT_LOCATION_FOOTER;
        $this->formSubmitDisable = true;

        $this->freeformHoneypot = true;
        $this->customHoneypotName = null;
        $this->customErrorMessage = null;
        $this->freeformHoneypotEnhancement = false;
        $this->spamProtectionBehaviour = self::PROTECTION_SIMULATE_SUCCESS;
        $this->blockedEmails = null;
        $this->blockedKeywords = null;
        $this->blockedEmailsError = self::DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE;
        $this->blockedKeywordsError = self::DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE;
        $this->blockedIpAddresses = null;
        $this->showErrorsForBlockedKeywords = false;
        $this->showErrorsForBlockedEmails = false;
        $this->spamFolderEnabled = true;
        $this->submissionThrottlingCount = null;
        $this->submissionThrottlingTimeFrame = null;
        $this->purgableSubmissionAgeInDays = null;
        $this->purgableSpamAgeInDays = null;
        $this->purgableUnfinalizedAssetAgeInMinutes = self::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES;
        $this->renderFormHtmlInCpViews = true;
        $this->ajaxByDefault = self::DEFAULT_AJAX;
        $this->autoScrollToErrors = true;
        $this->fillWithGet = false;
        $this->formattingTemplate = self::DEFAULT_FORMATTING_TEMPLATE;
        $this->alertNotificationRecipients = null;
        $this->digestRecipients = null;
        $this->digestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;
        $this->clientDigestRecipients = null;
        $this->clientDigestFrequency = DigestService::FREQUENCY_WEEKLY_MONDAYS;
        $this->digestOnlyOnProduction = false;
        $this->displayFeed = true;
        $this->feedInfo = [];
        $this->badgeType = 'all';

        $this->recaptchaEnabled = false;
        $this->recaptchaKey = null;
        $this->recaptchaSecret = null;
        $this->recaptchaType = self::RECAPTCHA_TYPE_V2_CHECKBOX;
        $this->recaptchaMinScore = 0.5;
        $this->recaptchaBehaviour = self::RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR;
        $this->recaptchaTheme = self::RECAPTCHA_THEME;
        $this->recaptchaSize = self::RECAPTCHA_SIZE;
        $this->recaptchaErrorMessage = self::RECAPTCHA_ERROR_MESSAGE;

        $this->hideBannerDemo = false;
        $this->hideBannerOldFreeform = false;

        $this->sessionEntryMaxCount = self::DEFAULT_ACTIVE_SESSION_ENTRIES;
        $this->sessionEntryTTL = self::DEFAULT_SESSION_ENTRY_TTL;

        $this->twigInHtml = true;
        $this->twigInHtmlIsolatedMode = true;

        $this->updateSearchIndexes = true;

        parent::__construct($config);
    }

    public function rules(): array
    {
        return [
            ['formTemplateDirectory', 'folderExists'],
            [
                ['recaptchaKey', 'recaptchaSecret'],
                'required',
                'when' => function (self $model) {
                    return (bool) $model->recaptchaEnabled;
                },
            ],
        ];
    }

    public function folderExists(string $attribute)
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
     *
     * @return null|string
     */
    public function getAbsoluteFormTemplateDirectory()
    {
        if ($this->formTemplateDirectory) {
            $absolutePath = $this->getAbsolutePath($this->formTemplateDirectory);

            return file_exists($absolutePath) ? $absolutePath : null;
        }

        return null;
    }

    /**
     * If an email template directory has been set and it exists - return its absolute path.
     *
     * @return null|string
     */
    public function getAbsoluteEmailTemplateDirectory()
    {
        if ($this->emailTemplateDirectory) {
            $absolutePath = $this->getAbsolutePath($this->emailTemplateDirectory);

            return file_exists($absolutePath) ? $absolutePath : null;
        }

        return null;
    }

    /**
     * Gets the demo template content.
     *
     * @param string $name
     *
     * @throws FreeformException
     */
    public function getDemoTemplateContent($name = 'flexbox'): string
    {
        $path = __DIR__."/../templates/_defaultFormTemplates/{$name}.html";
        if (!file_exists($path)) {
            throw new FreeformException(
                Freeform::t('Could not get demo template content. Please contact Solspace.')
            );
        }

        $contents = file_get_contents($path);

        if ('flexbox' === $name) {
            $css = file_get_contents(__DIR__.'/../Resources/css/front-end/formatting-templates/flexbox.css');
            $contents = str_replace('{% css formCss %}', "<style>{$css}</style>", $contents);
        }

        return $contents;
    }

    /**
     * Gets the default email template content.
     *
     * @throws FreeformException
     */
    public function getEmailTemplateContent(): string
    {
        $path = __DIR__.'/../templates/_emailTemplates/default.html';
        if (!file_exists($path)) {
            throw new FreeformException(
                Freeform::t(
                    'Could not get email template content. Please contact Solspace.'
                )
            );
        }

        return file_get_contents($path);
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInFormTemplateDirectory()
    {
        return $this->getTemplatesInDirectory($this->getAbsoluteFormTemplateDirectory());
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInEmailTemplateDirectory()
    {
        return $this->getTemplatesInDirectory($this->getAbsoluteEmailTemplateDirectory());
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

    public function isLimitByCookie(): bool
    {
        return self::LIMIT_COOKIE === $this->limitFormSubmissions;
    }

    public function isLimitByIpCookie(): bool
    {
        return self::LIMIT_IP_COOKIE === $this->limitFormSubmissions;
    }

    public function getRecaptchaType(): string
    {
        $type = $this->recaptchaType;
        if (Freeform::getInstance()->isLite()) {
            $type = self::RECAPTCHA_TYPE_V2_CHECKBOX;
        }

        return $type;
    }

    public function getRecaptchaTheme(): string
    {
        return $this->recaptchaTheme;
    }

    public function getRecaptchaSize(): string
    {
        return $this->recaptchaSize;
    }

    public function isInvisibleRecaptchaSetUp(): bool
    {
        return $this->isRecaptchaInvisible($this->getRecaptchaType());
    }

    public function isRecaptchaInvisible(string $type): bool
    {
        return \in_array($type, [self::RECAPTCHA_TYPE_V2_INVISIBLE, self::RECAPTCHA_TYPE_V3], true);
    }

    /**
     * Takes a comma or newline (or both) separated string
     * and returns a cleaned up, unique value array.
     *
     * @param string $value
     */
    private function getArrayFromDelimitedText(string $value = null): array
    {
        if (empty($value)) {
            return [];
        }

        $array = preg_split('/[\ \n\,]+/', $value);
        $array = array_map('trim', $array);
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
        return preg_match('/^(?:\/|\\\\|\w\:\\\\).*$/', $path);
    }

    /**
     * @param string $templateDirectoryPath
     */
    private function getTemplatesInDirectory(string $templateDirectoryPath = null): array
    {
        if ('/' === $templateDirectoryPath || !file_exists($templateDirectoryPath)) {
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
        foreach ($fileIterator as $file) {
            $path = $file->getRealPath();
            $files[$path] = pathinfo($path, \PATHINFO_BASENAME);
        }

        return $files;
    }
}
