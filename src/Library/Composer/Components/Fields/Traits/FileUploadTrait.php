<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
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
