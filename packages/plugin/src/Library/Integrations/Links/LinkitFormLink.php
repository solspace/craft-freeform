<?php

namespace Solspace\Freeform\Library\Integrations\Links;

use craft\base\ElementInterface;
use presseddigital\linkit\base\Link;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Twig\Markup;

class LinkitFormLink extends Link implements FormLinkInterface
{
    public array|string $forms = '*';

    private ?string $formSite = null;

    public static function defaultLabel(): string
    {
        return Freeform::t('Freeform Form');
    }

    public function getSettingsHtml(): ?string
    {
        return \Craft::$app->getView()->renderTemplate('linkit/types/settings/_default', ['type' => $this])
            .$this->provider()->settingsHtml($this->forms);
    }

    public function getInputHtml(string $name, $field, ?Link $currentLink = null, ?ElementInterface $element = null): string
    {
        return $this->provider()->inputHtml($name.'[values]['.$this->getType().']', $currentLink?->value, $this->forms, $element?->getSite()->handle);
    }

    public function getForm(): ?Form
    {
        return $this->provider()->getForm($this->value, site: $this->formSite);
    }

    public function setOwner(?ElementInterface $owner = null): void
    {
        parent::setOwner($owner);
        $this->formSite = $owner?->getSite()->handle;
    }

    public function getUrl(): string
    {
        return '';
    }

    public function getText(): string
    {
        return $this->getCustomOrDefaultText() ?? $this->getForm()?->getName() ?? '';
    }

    public function isAvailable(): bool
    {
        return null !== $this->getForm();
    }

    public function getLink(array $attributes = [], bool $raw = true, bool $preview = false): Markup|string
    {
        return '';
    }

    public function rules(): array
    {
        return array_merge(parent::rules(), [[['value'], 'validateForm']]);
    }

    public function validateForm(string $attribute): void
    {
        if (null !== $this->{$attribute} && '' !== $this->{$attribute}
            && !$this->provider()->getForm($this->{$attribute}, $this->forms, $this->formSite)) {
            $this->addError($attribute, Freeform::t('Select an available Freeform form.'));
        }
    }

    protected function provider(): FormLinkProvider
    {
        return \Craft::$container->get(FormLinkProvider::class);
    }
}
