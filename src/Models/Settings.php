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

    /** @var bool */
    public $footerScripts;

    /** @var bool */
    public $formSubmitDisable;

    /** @var bool */
    public $freeformHoneypot;

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
        $this->defaultView            = Freeform::VIEW_FORMS;
        $this->fieldDisplayOrder      = Freeform::FIELD_DISPLAY_ORDER_NAME;
        $this->showTutorial           = true;
        $this->defaultTemplates       = true;
        $this->removeNewlines         = false;
        $this->footerScripts          = true;
        $this->formSubmitDisable      = true;

        $this->freeformHoneypot              = true;
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

        parent::__construct($config);
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            ['formTemplateDirectory', 'folderExists'],
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

        return file_get_contents($path);
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
        $templateDirectoryPath = $this->getAbsoluteFormTemplateDirectory();
        if (!file_exists($templateDirectoryPath)) {
            return [];
        }

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs->files()->in($templateDirectoryPath)->name('*.html')->name('*.twig');
        $files        = [];

        foreach ($fileIterator as $file) {
            $path         = $file->getRealPath();
            $files[$path] = pathinfo($path, PATHINFO_BASENAME);
        }

        return $files;
    }

    /**
     * @return array|bool
     */
    public function listTemplatesInEmailTemplateDirectory()
    {
        $templateDirectoryPath = $this->getAbsoluteEmailTemplateDirectory();
        if (!file_exists($templateDirectoryPath)) {
            return [];
        }

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs->files()->in($templateDirectoryPath)->name('*.html')->name('*.twig');
        $files        = [];

        foreach ($fileIterator as $file) {
            $path         = $file->getRealPath();
            $files[$path] = pathinfo($path, PATHINFO_BASENAME);
        }

        return $files;
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
}
