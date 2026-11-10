<?php

namespace Solspace\Freeform\Library\Integrations\Navigation;

use craft\helpers\Cp;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Links\FormLinkInterface;
use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;
use verbb\navigation\base\NodeType;

class FormNode extends NodeType implements FormLinkInterface
{
    public const DATA_KEY = 'freeformForm';

    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    public static function hasUrl(): bool
    {
        return false;
    }

    public static function getColor(): string
    {
        return '#0d7e8a';
    }

    public static function getAddNodeSchema(array $context): array
    {
        $site = isset($context['siteId']) ? \Craft::$app->getSites()->getSiteById($context['siteId'])?->handle : null;

        return [
            [
                '$field' => 'select',
                'name' => 'data.'.self::DATA_KEY,
                'label' => self::displayName(),
                'instructions' => self::instructions(),
                'validation' => 'required',
                'options' => self::provider()->getOptions(site: $site),
            ],
            [
                '$field' => 'text',
                'name' => 'title',
                'label' => Freeform::t('Title'),
                'instructions' => Freeform::t('Leave blank to use the form name.'),
            ],
        ];
    }

    public static function getAddNodeDefaultData(): array
    {
        return [self::DATA_KEY => ''];
    }

    // Navigation 4 slideout. The optional adapter stays outside Bundles so sites
    // without Navigation can still discover Freeform's feature bundles.
    public function getEditorHtml(): ?string
    {
        return \Craft::$app->getView()->namespaceInputs(fn () => $this->pickerHtml(), 'data');
    }

    // Navigation 3 slideout namespaces its node-type data inside the adapter.
    public function getModalHtml(): ?string
    {
        return $this->getEditorHtml();
    }

    // Navigation 3 quick-add already supplies the `data` namespace.
    public function getSettingsHtml(): ?string
    {
        return $this->pickerHtml();
    }

    public function getForm(): ?Form
    {
        return self::provider()->getForm($this->node?->data[self::DATA_KEY] ?? null, site: $this->site());
    }

    public function getDefaultTitle(): string
    {
        return $this->getForm()?->getName() ?? self::displayName();
    }

    public function getUrl(): ?string
    {
        return null;
    }

    public function validateForm(): void
    {
        if (null === $this->getForm()) {
            $this->node?->addError('data.'.self::DATA_KEY, Freeform::t('Select an available Freeform form.'));
        }
    }

    public function beforeSaveNode(bool $isNew): bool
    {
        // A suffix by itself must not turn this reference into a public URL.
        if ($this->node) {
            $this->node->urlSuffix = null;
        }

        return true;
    }

    private static function provider(): FormLinkProvider
    {
        return \Craft::$container->get(FormLinkProvider::class);
    }

    private static function instructions(): string
    {
        return Freeform::t('Choose a form to render in your navigation template. Forms do not have a public URL.');
    }

    private function site(): ?string
    {
        return $this->node?->siteId ? \Craft::$app->getSites()->getSiteById($this->node->siteId)?->handle : null;
    }

    private function pickerHtml(): string
    {
        $value = $this->node?->data[self::DATA_KEY] ?? '';

        return Cp::fieldHtml(self::provider()->inputHtml(self::DATA_KEY, $value, site: $this->site()), [
            'label' => self::displayName(),
            'instructions' => self::instructions(),
            'id' => self::DATA_KEY,
            'required' => true,
            'errors' => $this->node?->getErrors('data.'.self::DATA_KEY) ?? [],
        ]);
    }
}
