<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Interfaces;

use Solspace\Freeform\Bundles\Backup\DTO\Field;

interface FieldProcessorInterface
{
    /**
     * Check if this processor can handle the given field type.
     *
     * @param mixed $formField
     */
    public function canProcess($formField): bool;

    /**
     * Process the field and return a Freeform Field DTO.
     *
     * @param mixed $formField
     */
    public function process($formField, string $formUid, int $index): ?Field;

    /**
     * Get the Freeform field class that this processor maps to.
     */
    public function getFreeformFieldClass(): string;

    /**
     * Get field-specific metadata.
     *
     * @param mixed $formField
     */
    public function getFieldMetadata($formField): array;
}
