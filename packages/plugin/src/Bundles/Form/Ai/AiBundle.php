<?php

namespace Solspace\Freeform\Bundles\Form\Ai;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\AiService;
use yii\base\Event;

class AiBundle extends FeatureBundle
{
    public function __construct(private AiService $aiService)
    {
        Event::on(
            Form::class,
            Form::EVENT_SUBMIT,
            [$this, 'processAiFieldsOnFormSubmit']
        );
    }

    public static function getPriority(): int
    {
        return 100;
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function processAiFieldsOnFormSubmit($event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();
        if (!$submission) {
            return;
        }
        $aiFields = $form->getLayout()->getFields()->getList(AiField::class);
        if (empty($aiFields)) {
            return;
        }
        $aiService = $this->aiService;
        foreach ($aiFields as $aiField) {
            $integration = $aiField->getIntegration();
            if ($integration instanceof AiIntegrationInterface && $integration->isEnabled()) {
                $result = $aiService->processAiField($form, $integration, $aiField, 6);
                if (null !== $result && '' !== $result) {
                    $submission->setFormFieldValues([$aiField->getHandle() => $result], false);
                    $form->setFieldValues([$aiField->getHandle() => $result]);
                }
            }
        }
    }
}
