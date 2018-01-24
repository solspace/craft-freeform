<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\FileUploads;

class FileUploadResponse
{
    /** @var int */
    private $assetId;

    /** @var array */
    private $errors;

    /**
     * FileUploadResponse constructor.
     *
     * @param null  $assetId
     * @param array $errors
     */
    public function __construct($assetId = null, $errors = [])
    {
        $this->assetId = $assetId;
        $this->errors  = $errors;
    }

    /**
     * @return int
     */
    public function getAssetId()
    {
        return $this->assetId;
    }

    /**
     * @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
