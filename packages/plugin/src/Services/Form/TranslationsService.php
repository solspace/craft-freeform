<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FormTranslationRecord;
use Solspace\Freeform\Services\BaseService;

class TranslationsService extends BaseService
{
    private array $translationCache = [];
    private ?bool $sitesEnabled = null;

    public function __construct(
        $config = [],
        private ?PropertyProvider $propertyProvider = null,
    ) {
        parent::__construct($config);
    }

    public function isTranslationsEnabled(Form $form): bool
    {
        if (null === $this->sitesEnabled) {
            $this->sitesEnabled = $this->getSettingsService()->getSettingsModel()->sitesEnabled;
        }

        return $this->sitesEnabled;
    }

    public function getFieldTranslation(FieldInterface $field, string $handle, string $defaultValue)
    {
        $form = $field->getForm();
        if (!$this->isTranslationsEnabled($form)) {
            return $defaultValue;
        }

        $siteId = \Craft::$app->sites->getCurrentSite()->id;
        $translationTable = $this->getFormTranslations($form);

        $translation = $translationTable[$siteId]['fields'][$field->getUid()][$handle] ?? null;
        if (null === $translation) {
            return Freeform::t($defaultValue);
        }

        if (empty($translation)) {
            return $defaultValue;
        }

        return $translation;
    }

    public function getFormTranslations(Form $form): ?array
    {
        if (!$this->isTranslationsEnabled($form)) {
            return null;
        }

        if (!isset($this->translationCache[$form->getId()])) {
            $find = FormTranslationRecord::find()
                ->where(['formId' => $form->getId()])
                ->all()
            ;

            $translations = [];
            foreach ($find as $found) {
                $translations[$found->siteId] = json_decode($found->translations, true);
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
}
