<?php

namespace Solspace\Freeform\Library\Export;

use Solspace\Freeform\Library\Composer\Components\Form;

interface ExportInterface
{
    /**
     * ExportInterface constructor.
     */
    public function __construct(Form $form, array $submissionData);

    public function getMimeType(): string;

    public function getFileExtension(): string;

    /**
     * @return mixed
     */
    public function export();
}
