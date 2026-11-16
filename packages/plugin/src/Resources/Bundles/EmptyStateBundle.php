<?php

namespace Solspace\Freeform\Resources\Bundles;

/** Shared empty-state layout, matching the React EmptyState component. */
class EmptyStateBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/empty-state.css'];
    }
}
