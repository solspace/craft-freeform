<?php

namespace Solspace\Freeform\Library\DataObjects\FormWizard;

use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Form\Types\Regular;
use Symfony\Component\PropertyAccess\PropertyAccessor;

/** An in-memory form: no records or submission tables are created for previews. */
class PreviewForm extends Regular
{
    private bool $previewSuccess = false;
    private bool $previewError = false;

    public function __construct(array $config, Settings $settings, TranslationProvider $translations)
    {
        $this->layout = new FormLayout();
        // Read-only rule providers key their caches by form ID. Zero cannot
        // refer to a saved form and avoids sharing any real form's rules.
        parent::__construct(['id' => 0] + $config, $settings, new PropertyAccessor(), $translations);
        $this->setPreview();
    }

    public function setPreviewSuccess(bool $success): void
    {
        $this->previewSuccess = $success;
        if ($success) {
            $this->previewError = false;
        }
    }

    public function setPreviewError(bool $error): void
    {
        $this->previewError = $error;
        if ($error) {
            $this->previewSuccess = false;
        }
    }

    public function hasErrors(): bool
    {
        return $this->previewError || parent::hasErrors();
    }

    public function isSubmittedSuccessfully(): bool
    {
        return $this->previewSuccess;
    }
}
