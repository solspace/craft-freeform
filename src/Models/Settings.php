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
use craft\helpers\FileHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class Settings extends Model
{
    const EMAIL_TEMPLATE_STORAGE_DB   = 'db';
    const EMAIL_TEMPLATE_STORAGE_FILE = 'template';

    /** @var string */
    public $pluginName;

    /** @var string */
    public $formTemplateDirectory;

    /** @var string */
    public $emailTemplateDirectory;

    /** @var string */
    public $emailTemplateStorage;

    /** @var bool */
    public $spamProtectionEnabled;

    /** @var bool */
    public $spamBlockLikeSuccessfulPost;

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

    /** @var string */
    public $salesforce_client_id;

    /** @var string */
    public $salesforce_client_secret;

    /** @var string */
    public $salesforce_username;

    /** @var string */
    public $salesforce_password;

    /**
     * Settings constructor.
     *
     * @param array $config
     */
    public function __construct(array $config = [])
    {
        $this->pluginName                  = null;
        $this->formTemplateDirectory       = null;
        $this->emailTemplateDirectory      = null;
        $this->emailTemplateStorage        = self::EMAIL_TEMPLATE_STORAGE_DB;
        $this->spamProtectionEnabled       = true;
        $this->spamBlockLikeSuccessfulPost = false;
        $this->defaultView                 = Freeform::VIEW_FORMS;
        $this->fieldDisplayOrder           = Freeform::FIELD_DISPLAY_ORDER_NAME;
        $this->showTutorial                = true;
        $this->defaultTemplates            = true;
        $this->removeNewlines              = false;
        $this->footerScripts               = true;
        $this->formSubmitDisable           = true;

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
        $files = [];

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
        $files = [];

        foreach ($fileIterator as $file) {
            $path         = $file->getRealPath();
            $files[$path] = pathinfo($path, PATHINFO_BASENAME);
        }

        return $files;
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
