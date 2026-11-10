<?php

namespace Solspace\Freeform\Library\Integrations\Links;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use verbb\hyper\base\Link;
use verbb\hyper\fieldlayoutelements\LinkField;
use verbb\hyper\fields\HyperField;
use verbb\hyper\models\LinkInstance;

class HyperFormLink extends Link implements FormLinkInterface
{
    public array|string $forms = '*';

    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    public static function getRequiredPlugins(): array
    {
        return ['freeform'];
    }

    public static function resolveUrlFromInstance(LinkInstance $instance): ?string
    {
        return null;
    }

    public function getSettingsConfig(): array
    {
        return array_merge(parent::getSettingsConfig(), ['forms' => $this->forms]);
    }

    public function getSettingsHtml(): ?string
    {
        return $this->provider()->settingsHtml($this->forms);
    }

    public function getInputHtml(LinkField $layoutField, HyperField $field): ?string
    {
        if ($this->getFieldLayout() && !$this->getFieldLayout()->isFieldIncluded('linkValue')) {
            return '';
        }

        return $this->provider()->inputHtml('linkValue', $this->linkValue, $this->forms, $this->siteHandle());
    }

    public function getForm(): ?Form
    {
        return $this->provider()->getForm($this->linkValue, site: $this->siteHandle());
    }

    public function getLinkUrl(): ?string
    {
        return null;
    }

    public function getUrl(): ?string
    {
        // Hyper 2 otherwise treats a suffix on its own as a destination.
        return null;
    }

    public function isEmpty(): bool
    {
        // Hyper filters empty links out of first()/all(). A form reference is
        // meaningful content even though it has no URL.
        return null === $this->getForm();
    }

    public function getLinkText(): ?string
    {
        return parent::getLinkText() ?: $this->getForm()?->getName();
    }

    public function validateForm(string $attribute): void
    {
        if (null !== $this->{$attribute} && '' !== $this->{$attribute}
            && !$this->provider()->getForm($this->{$attribute}, $this->forms, $this->siteHandle())) {
            $this->addError($attribute, Freeform::t('Select an available Freeform form.'));
        }
    }

    protected function defineRules(): array
    {
        return array_merge(parent::defineRules(), [[['linkValue'], 'validateForm']]);
    }

    protected function provider(): FormLinkProvider
    {
        return \Craft::$container->get(FormLinkProvider::class);
    }

    private function siteHandle(): ?string
    {
        return $this->siteId ? \Craft::$app->getSites()->getSiteById($this->siteId)?->handle : null;
    }
}
