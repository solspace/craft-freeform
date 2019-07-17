<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class Settings extends Model
{
    const EMAIL_TEMPLATE_STORAGE_DB   = 'db';
    const EMAIL_TEMPLATE_STORAGE_FILE = 'template';

    const PROTECTION_SIMULATE_SUCCESS = 'simulate_success';
    const PROTECTION_DISPLAY_ERRORS   = 'display_errors';
    const PROTECTION_RELOAD_FORM      = 'reload_form';

    const DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE   = 'Invalid Email Address';
    const DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE = 'Invalid Entry Data';

    const THROTTLING_TIME_FRAME_MINUTES = 'm';
    const THROTTLING_TIME_FRAME_SECONDS = 's';

    const RECAPTCHA_TYPE_V2_CHECKBOX  = 'v2_checkbox';
    const RECAPTCHA_TYPE_V2_INVISIBLE = 'v2_invisible';
    const RECAPTCHA_TYPE_V3           = 'v3';

    const RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR = 'display_error';
    const RECAPTCHA_BEHAVIOUR_SPAM          = 'spam';

    const SCRIPT_INSERT_LOCATION_FOOTER = 'footer';
    const SCRIPT_INSERT_LOCATION_FORM   = 'form';
    const SCRIPT_INSERT_LOCATION_MANUAL = 'manual';

    const DEFAULT_AJAX                = false;
    const DEFAULT_FORMATTING_TEMPLATE = 'flexbox.html';

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

    /**
     * Settings constructor.
     *
     * @param array $config
     */
    public function __construct(array $config = [])
    {
        $this->pluginName             = null;
        $this->formTemplateDirectory  = null;
        $this->emailTemplateDirectory = null;
        $this->emailTemplateStorage   = self::EMAIL_TEMPLATE_STORAGE_DB;
        $this->defaultView            = Freeform::VIEW_DASHBOARD;
        $this->fieldDisplayOrder      = Freeform::FIELD_DISPLAY_ORDER_NAME;
        $this->showTutorial           = true;
        $this->defaultTemplates       = true;
        $this->removeNewlines         = false;
        $this->footerScripts          = false;
        $this->scriptInsertLocation   = self::SCRIPT_INSERT_LOCATION_FOOTER;
        $this->formSubmitDisable      = false;

        $this->freeformHoneypot              = true;
        $this->freeformHoneypotEnhancement   = false;
        $this->spamProtectionBehaviour       = self::PROTECTION_SIMULATE_SUCCESS;
        $this->blockedEmails                 = null;
        $this->blockedKeywords               = null;
        $this->blockedEmailsError            = self::DEFAULT_BLOCKED_EMAILS_ERROR_MESSAGE;
        $this->blockedKeywordsError          = self::DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE;
        $this->blockedIpAddresses            = null;
        $this->showErrorsForBlockedKeywords  = false;
        $this->showErrorsForBlockedEmails    = false;
        $this->spamFolderEnabled             = false;
        $this->submissionThrottlingCount     = null;
        $this->submissionThrottlingTimeFrame = null;
        $this->purgableSubmissionAgeInDays   = null;
        $this->purgableSpamAgeInDays         = null;
        $this->renderFormHtmlInCpViews       = true;
        $this->ajaxByDefault                 = self::DEFAULT_AJAX;
        $this->autoScrollToErrors            = true;
        $this->fillWithGet                   = false;
        $this->formattingTemplate            = self::DEFAULT_FORMATTING_TEMPLATE;

        $this->recaptchaEnabled   = false;
        $this->recaptchaKey       = null;
        $this->recaptchaSecret    = null;
        $this->recaptchaType      = self::RECAPTCHA_TYPE_V2_CHECKBOX;
        $this->recaptchaMinScore  = 0.5;
        $this->recaptchaBehaviour = self::RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR;

        parent::__construct($config);
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            ['formTemplateDirectory', 'folderExists'],
            [
                ['recaptchaKey', 'recaptchaSecret'],
                'required',
                'when' => function (Settings $model) {
                    return (bool) $model->recaptchaEnabled;
                },
            ],
        ];
    }

    /**
     * @param string $attribute
     */
    public function folderExists(string $attribute)
    {
        $path         = $this->{$attribute};
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
     * If a form template directory has been set and it exists - return its absolute path
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
     * If an email template directory has been set and it exists - return its absolute path
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
     * Gets the demo template content
     *
     * @param string $name
     *
     * @return string
     * @throws FreeformException
     */
    public function getDemoTemplateContent($name = 'flexbox'): string
    {
        $path = __DIR__ . "/../templates/_defaultFormTemplates/$name.html";
        if (!file_exists($path)) {
            throw new FreeformException(
                Freeform::t('Could not get demo template content. Please contact Solspace.')
            );
        }

        $contents = file_get_contents($path);

        if ($name === 'flexbox') {
            $css      = file_get_contents(__DIR__ . "/../Resources/css/form-formatting-templates/flexbox.css");
            $contents = str_replace('{% css formCss %}', "<style>$css</style>", $contents);
        }

        return $contents;
    }

    /**
     * Gets the default email template content
     *
     * @return string
     * @throws FreeformException
     */
    public function getEmailTemplateContent(): string
    {
        $path = __DIR__ . '/../templates/_emailTemplates/default.html';
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

    /**
     * @return array
     */
    public function getBlockedKeywords(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedKeywords);
    }

    /**
     * @return string
     */
    public function getBlockedKeywordsError(): string
    {
        return $this->blockedKeywordsError ?? self::DEFAULT_BLOCKED_KEYWORDS_ERROR_MESSAGE;
    }

    /**
     * @return array
     */
    public function getBlockedEmails(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedEmails);
    }

    /**
     * @return array
     */
    public function getBlockedIpAddresses(): array
    {
        return $this->getArrayFromDelimitedText($this->blockedIpAddresses);
    }

    /**
     * @return bool
     */
    public function isLimitByCookie(): bool
    {
        return $this->limitFormSubmissions === self::LIMIT_COOKIE;
    }

    /**
     * @return bool
     */
    public function isLimitByIpCookie(): bool
    {
        return $this->limitFormSubmissions === self::LIMIT_IP_COOKIE;
    }

    /**
     * @return string
     */
    public function getRecaptchaType(): string
    {
        $type = $this->recaptchaType;
        if (Freeform::getInstance()->isLite()) {
            $type = self::RECAPTCHA_TYPE_V2_CHECKBOX;
        }

        return $type;
    }

    /**
     * Takes a comma or newline (or both) separated string
     * and returns a cleaned up, unique value array
     *
     * @param string $value
     *
     * @return array
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
     *
     * @return string
     */
    private function getAbsolutePath($path): string
    {
        $isAbsolute = $this->isFolderAbsolute($path);

        return $isAbsolute ? $path : (\Craft::$app->path->getSiteTemplatesPath() . '/' . $path);
    }

    /**
     * @param string $path
     *
     * @return bool
     */
    private function isFolderAbsolute($path): bool
    {
        return preg_match('/^(?:\/|\\\\|\w\:\\\\).*$/', $path);
    }

    /**
     * @param string $templateDirectoryPath
     *
     * @return array
     */
    private function getTemplatesInDirectory(string $templateDirectoryPath = null): array
    {
        if ($templateDirectoryPath === '/' || !file_exists($templateDirectoryPath)) {
            return [];
        }

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs
            ->in($templateDirectoryPath)
            ->name('*.html')
            ->name('*.twig')
            ->files();

        $files = [];
        foreach ($fileIterator as $file) {
            $path         = $file->getRealPath();
            $files[$path] = pathinfo($path, PATHINFO_BASENAME);
        }

        return $files;
    }
}
