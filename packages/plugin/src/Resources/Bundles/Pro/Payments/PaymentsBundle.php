<?php

namespace Solspace\Freeform\Resources\Bundles\Pro\Payments;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

class PaymentsBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/payments/index.css'];
    }
}
