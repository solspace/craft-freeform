<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\Dashboard;

class ActivityHealthBundle extends DashboardBundle
{
    public function getStylesheets(): array
    {
        return array_merge(parent::getStylesheets(), ['css/cp/widgets/activity-health.css']);
    }
}
