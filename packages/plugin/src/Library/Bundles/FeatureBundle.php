<?php

namespace Solspace\Freeform\Library\Bundles;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;

abstract class FeatureBundle implements BundleInterface
{
    public static function getPriority(): int
    {
        return 1000;
    }

    public static function isProOnly(): bool
    {
        return false;
    }

    protected function plugin(): Freeform
    {
        return Freeform::getInstance();
    }

    protected function edition(): EditionHelper
    {
        return $this->plugin()->edition();
    }

    protected function registerController(string $key, string $class): void
    {
        $this->plugin()->controllerMap[$key] = $class;
    }
}
