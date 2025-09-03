<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\TextField;

class PaymentProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Payment' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['fieldType'] = 'payment';
        $metadata['paymentType'] = $formField->paymentType ?? 'stripe';
        $metadata['amount'] = $formField->amount ?? '';

        return $metadata;
    }
}
