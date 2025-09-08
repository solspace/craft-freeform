<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use yii\base\Component;

class AiService extends Component
{
    public function processAiField(Form $form, FieldInterface $aiField, ?int $timeout = null): ?string
    {
        if (!$aiField instanceof AiField) {
            return null;
        }

        $integration = $aiField->getIntegration();
        if (!$integration || !$integration instanceof AiIntegrationInterface) {
            return null;
        }

        if (!$integration->isEnabled()) {
            return null;
        }

        try {
            return $this->callAiApi($form, $aiField, $integration, $timeout);
        } catch (\Exception $e) {
            Freeform::getInstance()->logger->getLogger('ai')->error(
                'AI processing failed: '.$e->getMessage(),
                [
                    'form' => $form->getHandle(),
                    'field' => $aiField->getHandle(),
                    'exception' => $e,
                ]
            );

            return null;
        }
    }

    private function callAiApi(Form $form, AiField $aiField, AiIntegrationInterface $integration, ?int $timeout = null): string
    {
        $content = $this->prepareContentForAnalysis($form, $aiField);
        $systemPrompt = $this->prepareSystemPrompt($aiField);

        $options = [
            'model' => $integration->getModel(),
            'max_tokens' => $aiField->getMaxTokens(),
        ];
        if (null !== $timeout) {
            $options['timeout'] = $timeout;
        }

        return $integration->processAiRequest($systemPrompt, $content, $options);
    }

    private function prepareContentForAnalysis(Form $form, $aiField): string
    {
        $fieldsToAnalyze = $aiField->getFieldsToProcess();
        $includeLabels = $aiField->isIncludeFieldLabels();

        $content = [];

        // Handle @all syntax
        if (\in_array('@all', $fieldsToAnalyze)) {
            $fieldsToAnalyze = [];
            foreach ($form->getLayout()->getFields() as $field) {
                if (!$field instanceof AiField) {
                    $fieldsToAnalyze[] = $field->getHandle();
                }
            }
        }

        foreach ($fieldsToAnalyze as $fieldHandle) {
            $field = $form->get($fieldHandle);
            if (!$field) {
                continue;
            }

            $value = $field->getValue();
            if (empty($value)) {
                continue;
            }

            // Convert array values to string
            if (\is_array($value)) {
                $value = implode(', ', $value);
            }

            if ($includeLabels) {
                $content[] = $field->getLabel().': '.$value;
            } else {
                $content[] = $value;
            }
        }

        return implode("\n\n", $content);
    }

    private function prepareSystemPrompt($aiField): string
    {
        $systemPrompt = $aiField->getSystemPrompt();

        if (empty($systemPrompt)) {
            $systemPrompt = 'You are an AI assistant that processes form submissions. Provide a helpful response based on the provided content.';
        }

        return $systemPrompt;
    }
}
