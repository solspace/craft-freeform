<?php

namespace Solspace\Freeform\Library\Export;

use Solspace\Freeform\Library\Composer\Components\Form;

interface ExportInterface
{
    /**
     * ExportInterface constructor.
     *
     * @param Form  $form
     * @param array $submissionData
     */
    public function __construct(Form $form, array $submissionData);

    /**
     * @return string
     */
    public function getMimeType(): string;

    /**
     * @return string
     */
    public function getFileExtension(): string;

    /**
     * @return mixed
     */
    public function export();
}
