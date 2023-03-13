<?php

namespace Solspace\Freeform\Library\Export;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\ExportSettings;

interface ExportInterface
{
    public function __construct(Form $form, array $submissionData, ExportSettings $settings);

    public static function getLabel(): string;

    public function getMimeType(): string;

    public function getFileExtension(): string;

    /**
     * @return mixed
     */
    public function export();
}
