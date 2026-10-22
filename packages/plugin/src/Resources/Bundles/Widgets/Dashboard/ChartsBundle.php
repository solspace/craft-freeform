<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\Dashboard;

class ChartsBundle extends DashboardBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/widgets/charts.js'];
    }
}
