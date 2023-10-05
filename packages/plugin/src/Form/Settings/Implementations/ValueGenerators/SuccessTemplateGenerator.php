<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\SettingsService;

class SuccessTemplateGenerator implements ValueGeneratorInterface
{
    public function __construct(private SettingsService $settingsService)
    {
    }

    public function generateValue(?object $referenceObject): ?string
    {
        $success = $this->settingsService->getSuccessTemplates();
        if (\count($success)) {
            return $success[0]->getFileName();
        }

        return null;
    }
}
