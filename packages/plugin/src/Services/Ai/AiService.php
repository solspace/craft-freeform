<?php

namespace Solspace\Freeform\Services\Ai;

use GuzzleHttp\Client;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Services\BaseService;

class AiService extends BaseService
{
    public function __construct(
        $config,
        private IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct($config);
    }

    public function processAiFieldsJob(
        int $formId,
        ?int $submissionId,
        array $postedData,
    ): void {
        $freeform = Freeform::getInstance();

        $form = $freeform->forms->getFormById($formId);
        if (!$form) {
            return;
        }

        $submission = $freeform->submissions->getSubmissionById($submissionId);
        if ($submission) {
            $form->setSubmission($submission);
        }

        $form->valuesFromArray($postedData);

        $fields = $form->getLayout()->getFields()->getList(AiField::class);
        foreach ($fields as $field) {
            $integration = $field->getIntegration();
            $result = $this->processAiField($form, $integration, $field, 6);

            if (null !== $result && '' !== $result) {
                $submission->setFormFieldValues([$field->getHandle() => $result], false);
                $form->setFieldValues([$field->getHandle() => $result]);

                \Craft::$app->elements->saveElement($submission, false, false, false);
            }
        }
    }

    public function processAiField(Form $form, AiIntegrationInterface $integration, AiField $field, ?int $timeout = null): ?string
    {
        if (!$integration->isEnabled()) {
            return null;
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);

        try {
            return $this->callAiApi($client, $form, $field, $timeout);
        } catch (\Exception $e) {
            Freeform::getInstance()->logger->getLogger('ai')->error(
                'AI processing failed: '.$e->getMessage(),
                [
                    'form' => $form->getHandle(),
                    'field' => $field->getHandle(),
                    'exception' => $e,
                ]
            );

            return null;
        }
    }

    private function callAiApi(
        Client $client,
        Form $form,
        AiField $field,
        ?int $timeout = null
    ): string {
        $integration = $field->getIntegration();
        $content = $this->prepareContentForAnalysis($form, $field);
        $systemPrompt = $this->prepareSystemPrompt($field);

        $options = [];
        if (!$integration instanceof BaseSolspaceAIIntegration) {
            $options['model'] = $integration->getModel();
            $options['max_tokens'] = $field->getMaxTokens();
        }

        $integrationTemperature = $integration->getTemperature();
        if (null !== $integrationTemperature) {
            $options['temperature'] = $integrationTemperature;
        }
        if (null !== $timeout) {
            $options['timeout'] = $timeout;
        }

        return $integration->processAiRequest(
            $client,
            $systemPrompt,
            $content,
            $options
        );
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
