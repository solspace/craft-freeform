<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Solspace\Freeform\Records\FormTranslationRecord;
use Solspace\Freeform\Services\BaseService;

class TranslationsService extends BaseService
{
    public const TYPE_FIELDS = 'fields';
    public const TYPE_PAGES = 'pages';
    public const TYPE_FORM = 'form';

    private array $translationCache = [];
    private array $translationTableCache = [];
    private ?bool $sitesEnabled = null;

    public function isTranslationsEnabled(Form $form): bool
    {
        if (null === $this->sitesEnabled) {
            $this->sitesEnabled = $this->getSettingsService()->isSitesEnabled();
        }

        if (!$form->getSettings()->getGeneral()->translations) {
            return false;
        }

        return $this->sitesEnabled;
    }

    public function getTranslation(
        Form $form,
        string $type,
        string $namespace,
        string $handle,
        mixed $defaultValue
    ): mixed {
        $table = $this->getTranslationTable($form, $type, $namespace);

        return $table->get($handle, $defaultValue);
    }

    public function getTranslationTable(Form $form, string $type, string $namespace): TranslationTable
    {
        if (!isset($this->translationTableCache[$form->getId()][$type][$namespace])) {
            if (!$this->isTranslationsEnabled($form)) {
                $this->translationTableCache[$form->getId()][$type][$namespace] = new TranslationTable();
            } else {
                $siteId = $this->getCurrentSiteId();

                $translationTable = $this->getFormTranslations($form);
                $translations = $translationTable->{$siteId}->{$type}->{$namespace} ?? null;

                $this->translationTableCache[$form->getId()][$type][$namespace] = new TranslationTable($translations);
            }
        }

        return $this->translationTableCache[$form->getId()][$type][$namespace];
    }

    public function getFormTranslations(Form $form): ?\stdClass
    {
        if (!$this->isTranslationsEnabled($form)) {
            return null;
        }

        if (!isset($this->translationCache[$form->getId()])) {
            $find = FormTranslationRecord::find()
                ->where(['formId' => $form->getId()])
                ->all()
            ;

            $translations = new \stdClass();
            foreach ($find as $found) {
                $translations->{$found->siteId} = $this->decodeTranslations($found->translations);
            }

            $this->translationCache[$form->getId()] = $translations;
        }

        return $this->translationCache[$form->getId()];
    }

    public function setFormTranslations(Form $form, array $translations): void
    {
        $existingTranslations = FormTranslationRecord::find()
            ->where(['formId' => $form->getId()])
            ->all()
        ;

        foreach ($existingTranslations as $existingTranslation) {
            $existingTranslation->delete();
        }

        foreach ($translations as $siteId => $translation) {
            $record = new FormTranslationRecord();
            $record->formId = $form->getId();
            $record->siteId = $siteId;
            $record->translations = JsonHelper::encode($translation);
            $record->save();
        }
    }

    private function decodeTranslations(string $translations): object
    {
        $decoded = json_decode($translations);

        foreach ($decoded as $type => $typeTranslations) {
            if (empty((array) $typeTranslations)) {
                unset($decoded->{$type});

                continue;
            }

            foreach ($typeTranslations as $namespace => $namespaceTranslations) {
                if (empty((array) $namespaceTranslations)) {
                    unset($decoded->{$type}->{$namespace});
                }
            }
        }

        return $decoded;
    }

    private function getCurrentSiteId(): int
    {
        static $siteId;

        if (null === $siteId) {
            $request = \Craft::$app->getRequest();
            if ($request->getIsConsoleRequest()) {
                return \Craft::$app->getSites()->getPrimarySite()->id;
            }

            $currentSite = \Craft::$app->getSites()->getCurrentSite();

            $siteId = $request->get('siteId');
            $siteHandle = $request->get('siteHandle', $request->get('site'));

            if ($siteId) {
                $siteId = (int) $siteId;
            } elseif ($siteHandle) {
                $site = \Craft::$app->getSites()->getSiteByHandle($siteHandle);
                if ($site) {
                    $siteId = $site->id;
                }
            }

            if (!$siteId) {
                $siteId = $currentSite->id;
            }
        }

        return $siteId;
    }
}
