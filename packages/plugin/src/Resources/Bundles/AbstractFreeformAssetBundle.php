<?php

namespace Solspace\Freeform\Resources\Bundles;

use Solspace\Commons\Resources\CpAssetBundle;

abstract class AbstractFreeformAssetBundle extends CpAssetBundle
{
    /**
     * {@inheritDoc}
     */
    protected function getSourcePath(): string
    {
        return '@Solspace/Freeform/Resources';
    }
}
