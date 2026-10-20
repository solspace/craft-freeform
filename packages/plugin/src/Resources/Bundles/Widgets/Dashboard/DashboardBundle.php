<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\Dashboard;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

class DashboardBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/widgets/dashboard.css'];
    }
}
