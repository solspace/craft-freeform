<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\FileUploadField;

class FileUploadProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\FileUpload' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return FileUploadField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['maxFileSizeKB'] = $formField->maxFileSize ?? 0;
        $metadata['fileKinds'] = $formField->allowedKinds ?? ['image'];
        $metadata['fileCount'] = $formField->maxFiles ?? 1;

        return $metadata;
    }
}
