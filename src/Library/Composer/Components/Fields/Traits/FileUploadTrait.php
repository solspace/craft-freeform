<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

trait FileUploadTrait
{
    /** @var int */
    protected $assetSourceId;

    /**
     * @return int|null
     */
    public function getAssetSourceId()
    {
        return $this->assetSourceId;
    }
}
