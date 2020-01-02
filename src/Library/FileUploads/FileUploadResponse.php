<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\FileUploads;

class FileUploadResponse
{
    /** @var array */
    private $assetIds;

    /** @var array */
    private $errors;

    /**
     * FileUploadResponse constructor.
     *
     * @param array $assetIds
     * @param array $errors
     */
    public function __construct(array $assetIds = null, array $errors = [])
    {
        $this->assetIds = $assetIds ?? [];
        $this->errors   = $errors;
    }

    /**
     * @return array
     */
    public function getAssetIds(): array
    {
        return $this->assetIds;
    }

    /**
     * @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
