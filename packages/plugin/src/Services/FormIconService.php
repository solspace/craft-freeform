<?php

namespace Solspace\Freeform\Services;

use craft\helpers\Cp;
use craft\helpers\Template;
use Solspace\Freeform\Attributes\Property\Validators\IconName;
use Twig\Markup;

class FormIconService
{
    private array $icons = [];

    public function getMarkup(?string $name): ?Markup
    {
        $svg = $this->getSvg($name);

        return null !== $svg ? Template::raw($svg) : null;
    }

    public function getSvg(?string $name): ?string
    {
        if (null === $name || '' === $name || (new IconName())->validate($name)) {
            return null;
        }

        // Only resolve Craft system names, never SVG markup, paths, or URLs.
        if (!\array_key_exists($name, $this->icons)) {
            $this->icons[$name] = $this->renderIcon($name) ?: null;
        }

        return $this->icons[$name];
    }

    protected function renderIcon(string $name): ?string
    {
        return Cp::iconSvg($name);
    }
}
