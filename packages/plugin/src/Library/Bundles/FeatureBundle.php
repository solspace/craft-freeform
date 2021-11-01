<?php

namespace Solspace\Freeform\Library\Bundles;

abstract class FeatureBundle implements BundleInterface
{
    public static function getPriority(): int
    {
        return 1000;
    }
}
