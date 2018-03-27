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

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Models\Settings;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use yii\base\Component;

class SettingsService extends Component
{
    /** @var Settings */
    private static $settingsModel;

    /**
     * @return string|null
     */
    public function getPluginName()
    {
        return $this->getSettingsModel()->pluginName;
    }

    /**
     * @return bool
     */
    public function isSpamProtectionEnabled(): bool
    {
        return (bool) $this->getSettingsModel()->spamProtectionEnabled;
    }

    /**
     * @return bool
     */
    public function isSpamBlockLikeSuccessfulPost(): bool
    {
        return (bool) $this->getSettingsModel()->spamBlockLikeSuccessfulPost;
    }

    /**
     * @return string
     */
    public function getFieldDisplayOrder(): string
    {
        return $this->getSettingsModel()->fieldDisplayOrder;
    }

    /**
     * @return string
     */
    public function getFormTemplateDirectory(): string
    {
        return $this->getSettingsModel()->formTemplateDirectory;
    }

    /**
     * @return string
     */
    public function getSolspaceFormTemplateDirectory(): string
    {
        return __DIR__ . '/../templates/_defaultFormTemplates';
    }

    /**
     * Mark the tutorial as finished
     */
    public function finishTutorial(): bool
    {
        $plugin = Freeform::getInstance();
        if (\Craft::$app->plugins->savePluginSettings($plugin, ['showTutorial' => false])) {
            return true;
        }

        return false;
    }

    /**
     * @return FormTemplate[]
     * @throws \InvalidArgumentException
     */
    public function getSolspaceFormTemplates(): array
    {
        $templateDirectoryPath = $this->getSolspaceFormTemplateDirectory();

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs->files()->in($templateDirectoryPath)->name('*.html');
        $templates    = [];

        foreach ($fileIterator as $file) {
            $templates[] = new FormTemplate($file->getRealPath());
        }

        return $templates;
    }

    /**
     * @return FormTemplate[]
     */
    public function getCustomFormTemplates(): array
    {
        $templates = [];
        foreach ($this->getSettingsModel()->listTemplatesInFormTemplateDirectory() as $path => $name) {
            $templates[] = new FormTemplate($path);
        }

        return $templates;
    }

    /**
     * @return bool
     */
    public function isDbEmailTemplateStorage(): bool
    {
        $settings = $this->getSettingsModel();

        return !$settings->emailTemplateDirectory ||
            $settings->emailTemplateStorage === Settings::EMAIL_TEMPLATE_STORAGE_DB;
    }

    /**
     * @return bool
     */
    public function isFooterScripts(): bool
    {
        return (bool) $this->getSettingsModel()->footerScripts;
    }

    /**
     * @return bool
     */
    public function isFormSubmitDisable(): bool
    {
        return (bool) $this->getSettingsModel()->formSubmitDisable;
    }

    /**
     * @return bool
     */
    public function isRemoveNewlines(): bool
    {
        return (bool) $this->getSettingsModel()->removeNewlines;
    }

    /**
     * @return Settings
     */
    public function getSettingsModel(): Settings
    {
        if (null === self::$settingsModel) {
            $plugin              = Freeform::getInstance();
            self::$settingsModel = $plugin->getSettings();
        }

        return self::$settingsModel;
    }
}
