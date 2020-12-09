<?php

namespace Solspace\Freeform\Resources\Bundles;

class StatisticsWidgetBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/widgets/statistics.css'];
    }
}
