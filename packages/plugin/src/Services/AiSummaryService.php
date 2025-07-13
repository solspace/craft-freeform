<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\AiSummaryField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Component;

class AiSummaryService extends Component
{
    private const CACHE_PREFIX = 'freeform_ai_summary_';
    private const CACHE_TTL = 3600; // 1 hour

    public function processAiSummaryField(Form $form, FieldInterface $aiSummaryField): ?string
    {
        if (!$aiSummaryField instanceof AiSummaryField) {
            return null;
        }

        $settings = Freeform::getInstance()->settings->getSettingsModel();

        // Check if AI is enabled globally and API key is configured
        if (!$settings->aiEnabled || empty($settings->aiApiKey)) {
            if (!$settings->aiEnabled) {
                Freeform::getInstance()->logger->getLogger('ai-summary')->warning(
                    'AI Summary field processing skipped - AI features are disabled globally',
                    [
                        'form' => $form->getHandle(),
                        'field' => $aiSummaryField->getHandle(),
                    ]
                );
            } else {
                Freeform::getInstance()->logger->getLogger('ai-summary')->warning(
                    'AI Summary field processing skipped - API key not configured',
                    [
                        'form' => $form->getHandle(),
                        'field' => $aiSummaryField->getHandle(),
                    ]
                );
            }

            return null;
        }

        // Check cache first
        $cacheKey = $this->generateCacheKey($form, $aiSummaryField);
        if ($aiSummaryField->isEnableCaching()) {
            $cachedResult = \Craft::$app->cache->get($cacheKey);
            if (false !== $cachedResult) {
                return $cachedResult;
            }
        }

        try {
            $result = $this->callAiApi($form, $aiSummaryField);

            // Cache the result
            if ($aiSummaryField->isEnableCaching()) {
                \Craft::$app->cache->set($cacheKey, $result, $settings->aiCacheTtl);
            }

            return $result;
        } catch (\Exception $e) {
            Freeform::getInstance()->logger->getLogger('ai-summary')->error(
                'AI Summary processing failed: '.$e->getMessage(),
                [
                    'form' => $form->getHandle(),
                    'field' => $aiSummaryField->getHandle(),
                    'exception' => $e,
                ]
            );

            return null;
        }
    }

    private function callAiApi(Form $form, AiSummaryField $aiSummaryField): string
    {
        $settings = Freeform::getInstance()->settings->getSettingsModel();
        $provider = $aiSummaryField->getAiProvider() ?: $settings->aiProvider;

        $content = $this->prepareContentForAnalysis($form, $aiSummaryField);
        $systemPrompt = $this->prepareSystemPrompt($aiSummaryField);

        switch ($provider) {
            case 'openai':
                return $this->callOpenAiApi($content, $systemPrompt, $aiSummaryField, $settings);

            case 'gemini':
                return $this->callGeminiApi($content, $systemPrompt, $aiSummaryField, $settings);

            default:
                throw new FreeformException("Unsupported AI provider: {$provider}");
        }
    }

    private function callOpenAiApi(string $content, string $systemPrompt, $aiSummaryField, $settings): string
    {
        $apiKey = $settings->aiApiKey;
        $model = $aiSummaryField->getAiModel();

        $data = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $content],
            ],
            'max_tokens' => $aiSummaryField->getMaxTokens() ?: $settings->aiMaxTokens,
            'temperature' => $aiSummaryField->getTemperature() ?: $settings->aiTemperature,
        ];

        $response = $this->makeHttpRequest(
            'https://api.openai.com/v1/chat/completions',
            $data,
            ['Authorization: Bearer '.$apiKey]
        );

        return $this->extractOpenAiResponse($response);
    }

    private function callGeminiApi(string $content, string $systemPrompt, $aiSummaryField, $settings): string
    {
        $apiKey = $settings->aiApiKey;
        $model = $aiSummaryField->getAiModel();

        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $systemPrompt."\n\n".$content],
                    ],
                ],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $aiSummaryField->getMaxTokens() ?: $settings->aiMaxTokens,
                'temperature' => $aiSummaryField->getTemperature() ?: $settings->aiTemperature,
            ],
        ];

        $response = $this->makeHttpRequest(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
            $data
        );

        return $this->extractGeminiResponse($response);
    }

    private function prepareContentForAnalysis(Form $form, $aiSummaryField): string
    {
        $fieldsToAnalyze = $aiSummaryField->getFieldsToAnalyze();
        $includeLabels = $aiSummaryField->isIncludeFieldLabels();

        $content = [];

        foreach ($fieldsToAnalyze as $fieldHandle) {
            $field = $form->get($fieldHandle);
            if (!$field) {
                continue;
            }

            $value = $field->getValue();
            if (empty($value)) {
                continue;
            }

            if ($includeLabels) {
                $content[] = $field->getLabel().': '.$value;
            } else {
                $content[] = $value;
            }
        }

        return implode("\n\n", $content);
    }

    private function prepareSystemPrompt($aiSummaryField): string
    {
        $systemPrompt = $aiSummaryField->getSystemPrompt();

        if (empty($systemPrompt)) {
            $systemPrompt = 'You are an AI assistant that analyzes form submissions. Provide a concise analysis of the provided content.';
        }

        return $systemPrompt;
    }

    private function makeHttpRequest(string $url, array $data, array $headers = []): array
    {
        $headers[] = 'Content-Type: application/json';

        $ch = curl_init();
        curl_setopt($ch, \CURLOPT_URL, $url);
        curl_setopt($ch, \CURLOPT_POST, true);
        curl_setopt($ch, \CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, \CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, \CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, \CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, \CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, \CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new FreeformException("cURL error: {$error}");
        }

        if (200 !== $httpCode) {
            throw new FreeformException("HTTP error {$httpCode}: {$response}");
        }

        $decoded = json_decode($response, true);
        if (\JSON_ERROR_NONE !== json_last_error()) {
            throw new FreeformException("Invalid JSON response: {$response}");
        }

        return $decoded;
    }

    private function extractOpenAiResponse(array $response): string
    {
        if (!isset($response['choices'][0]['message']['content'])) {
            throw new FreeformException('Invalid OpenAI response format');
        }

        return trim($response['choices'][0]['message']['content']);
    }

    private function extractGeminiResponse(array $response): string
    {
        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            throw new FreeformException('Invalid Gemini response format');
        }

        return trim($response['candidates'][0]['content']['parts'][0]['text']);
    }

    private function generateCacheKey(Form $form, $aiSummaryField): string
    {
        $fieldsToAnalyze = $aiSummaryField->getFieldsToAnalyze();
        $fieldValues = [];

        foreach ($fieldsToAnalyze as $fieldHandle) {
            $field = $form->get($fieldHandle);
            if ($field) {
                $fieldValues[$fieldHandle] = $field->getValue();
            }
        }

        $hash = md5(serialize($fieldValues));

        return self::CACHE_PREFIX.$form->getId().'_'.$aiSummaryField->getId().'_'.$hash;
    }
}
