<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\PageButtons;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Form\Layout\Page\Buttons\Button\SaveButton;

class SaveButtonTransformer extends Transformer
{
    public function transform($value): SaveButton
    {
        return new SaveButton($value);
    }

    public function reverseTransform($value): array
    {
        if ($value instanceof SaveButton) {
            return [
                'notificationId' => $value->getNotificationId(),
                'emailFieldUid' => $value->getEmailFieldUid(),
                'redirectUrl' => $value->getRedirectUrl(),
                'label' => $value->getLabel(),
                'enabled' => $value->getEnabled(),
            ];
        }

        return [
            'notificationId' => '',
            'emailFieldUid' => '',
            'redirectUrl' => '',
            'label' => '',
            'enabled' => false,
        ];
    }
}
