<?php

namespace Solspace\Freeform\Library\Integrations\Links;

use craft\fields\data\LinkData;
use craft\helpers\Cp;
use craft\helpers\Html;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Services\FormsService;
use verbb\navigation\elements\Node;

class FormLinkProvider
{
    public const TYPE = 'freeform-form';

    public function getId(mixed $value): ?int
    {
        if (!\is_string($value) || !preg_match('/^freeform:([1-9][0-9]*)$/D', $value, $match)) {
            return null;
        }

        $id = filter_var($match[1], \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        return false === $id ? null : $id;
    }

    public function getForm(mixed $value, array|string $forms = '*', ?string $site = null): ?Form
    {
        $id = $this->getId($value);
        if (null === $id || ('*' !== $forms && !\in_array((string) $id, array_map('strval', (array) $forms), true))) {
            return null;
        }

        $form = $this->forms()->getFormById($id, $site ?? SitesHelper::getFrontendSiteHandle());

        return $form && null === $form->getDateArchived() ? $form : null;
    }

    public function fromLink(mixed $link): ?Form
    {
        if ($link instanceof Node) {
            $link = $link->nodeType();
        }

        if ($link instanceof FormLinkInterface) {
            return $link->getForm();
        }

        // Native LinkData is not extensible and its `value` property is the rendered URL.
        // Read the stored reference through its public serialization API instead.
        if ($link instanceof LinkData && self::TYPE === $link->getType()) {
            return $this->getForm($link->serialize()['value'] ?? null);
        }

        return null;
    }

    public function inputHtml(string $name, mixed $value, array|string $forms = '*', ?string $site = null): string
    {
        return Cp::selectHtml([
            'id' => Html::id($name),
            'name' => $name,
            'value' => $value,
            'options' => $this->getOptions($value, $forms, $site),
            'inputAttributes' => ['aria' => ['label' => Freeform::t('Freeform Form')]],
        ]);
    }

    public function getOptions(mixed $value = null, array|string $forms = '*', ?string $site = null): array
    {
        $options = [['label' => Freeform::t('Select a form'), 'value' => '']];
        $allowedIds = Freeform::getInstance()->settings->isFormFieldShowOnlyAllowedForms()
            ? $this->forms()->getAllowedFormIds()
            : null;
        $found = false;

        foreach ($this->forms()->getAllNonArchivedForms(true, $site ?? SitesHelper::getCurrentCpPageSiteHandle()) as $form) {
            $id = $form->getId();
            if (('*' !== $forms && !\in_array((string) $id, array_map('strval', (array) $forms), true))
                || (null !== $allowedIds && !\in_array($id, $allowedIds))) {
                continue;
            }

            $reference = 'freeform:'.$id;
            $options[] = ['label' => $form->getName(), 'value' => $reference];
            $found = $found || $reference === $value;
        }

        // Preserve an existing selection when its form is deleted, archived or unavailable
        // to this author. Do not silently clear it when another entry field is saved.
        if (!$found && null !== $this->getId($value)) {
            $options[] = ['label' => Freeform::t('Unavailable form'), 'value' => $value];
        }

        return $options;
    }

    public function getSettingsOptions(): array
    {
        $options = [];
        foreach ($this->forms()->getAllNonArchivedForms(true) as $form) {
            $options[] = ['label' => $form->getName(), 'value' => $form->getId()];
        }

        return $options;
    }

    public function settingsHtml(array|string $forms): string
    {
        return Cp::checkboxSelectFieldHtml([
            'label' => Freeform::t('Available Forms'),
            'instructions' => Freeform::t('Select the forms authors can choose. Form links are form references and do not generate a public URL.'),
            'name' => 'forms',
            'showAllOption' => true,
            'values' => $forms,
            'options' => $this->getSettingsOptions(),
        ]);
    }

    protected function forms(): FormsService
    {
        return Freeform::getInstance()->forms;
    }
}
