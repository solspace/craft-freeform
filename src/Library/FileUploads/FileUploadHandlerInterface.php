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

use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;

interface FileUploadHandlerInterface
{
    /**
     * Uploads a file and flags it as "unfinalized"
     * It will be finalized only after the form has been submitted fully
     *
     * All unfinalized files will be deleted after a certain amount of time
     *
     * @param FileUploadField $field
     *
     * @return FileUploadResponse
     */
    public function uploadFile(FileUploadField $field);

    /**
     * Stores the unfinalized assetId in the database
     * So that it can be deleted later if the form hasn't been finalized
     *
     * @param int $assetId
     */
    public function markAssetUnfinalized($assetId);

    /**
     * Remove all unfinalized assets which are older than the TTL
     * specified in settings
     */
    public function cleanUpUnfinalizedAssets();

    /**
     * Returns an array of all file kinds
     * [type => [ext, ext, ..]
     * I.e. ["images" => ["gif", "png", "jpg", "jpeg", ..]
     *
     * @return array
     */
    public function getFileKinds();
}
