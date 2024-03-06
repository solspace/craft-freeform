<?php

namespace Solspace\Freeform\Resources\Bundles;

use Solspace\Freeform\Library\Resources\CpAssetBundle;

abstract class AbstractFreeformAssetBundle extends CpAssetBundle
{
    protected function getSourcePath(): string
    {
        return '@Solspace/Freeform/Resources';
    }
}
