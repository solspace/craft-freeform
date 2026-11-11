<?php

namespace Solspace\Freeform\Library\Integrations\Links;

use craft\fields\Link;
use craft\fields\linktypes\BaseLinkType;
use Solspace\Freeform\Freeform;

class CraftFormLink extends BaseLinkType
{
    public array|string $forms = '*';

    public static function id(): string
    {
        return FormLinkProvider::TYPE;
    }

    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    public function supports(string $value): bool
    {
        return null !== $this->provider()->getId($value);
    }

    public function renderValue(string $value): string
    {
        return '';
    }

    public function linkLabel(string $value): string
    {
        return $this->provider()->getForm($value)?->getName() ?? '';
    }

    public function inputHtml(Link $field, ?string $value, string $containerId): string
    {
        return $this->provider()->inputHtml('value', $value, $this->forms, integration: 'craft-link');
    }

    public function getSettingsHtml(): ?string
    {
        return $this->provider()->settingsHtml($this->forms);
    }

    public function validateValue(string $value, ?string &$error = null): bool
    {
        if ('' === $value || $this->provider()->getForm($value, $this->forms)) {
            return true;
        }

        $error = Freeform::t('Select an available Freeform form.');

        return false;
    }

    protected function provider(): FormLinkProvider
    {
        return \Craft::$container->get(FormLinkProvider::class);
    }
}
