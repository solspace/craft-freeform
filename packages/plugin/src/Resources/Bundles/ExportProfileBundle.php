<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 06/09/2017
 * Time: 15:14.
 */

namespace Solspace\Freeform\Resources\Bundles;

class ExportProfileBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/export-profiles/export-profile.js'];
    }
}
