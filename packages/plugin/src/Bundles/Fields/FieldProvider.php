<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Form\FieldsService;

class FieldProvider
{
    public function __construct(private FieldsService $service) {}

    public function getFieldByFormAndUid(Form $form, ?string $uid): ?FieldInterface
    {
        if (null === $uid) {
            return null;
        }

        return $this->service->getFieldByFormAndUid($form, $uid);
    }

    public function getFieldByUid(?string $uid): ?FieldInterface
    {
        if (null === $uid) {
            return null;
        }

        return $this->service->getFieldByUid($uid);
    }
}
