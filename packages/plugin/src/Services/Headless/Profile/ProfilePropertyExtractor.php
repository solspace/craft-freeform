<?php

namespace Solspace\Freeform\Services\Headless\Profile;

use yii\web\BadRequestHttpException;

/**
 * Extracts only allow-listed profile properties from the request.
 */
class ProfilePropertyExtractor
{
    /**
     * @param array<string, array{type: string, required?: bool, source?: string}> $propertyConfig
     *
     * @return array<string, mixed>
     */
    public function extract(array $propertyConfig): array
    {
        $request = \Craft::$app->getRequest();
        $raw = $request->getQueryParam('properties', []);
        if (!\is_array($raw)) {
            $raw = [];
        }

        $body = $request->getBodyParam('properties', []);
        if (\is_array($body)) {
            $raw = array_merge($raw, $body);
        }

        // Multipart submits nest the JSON payload under `_freeform`.
        $meta = $request->getBodyParam('_freeform');
        if (\is_string($meta) && '' !== $meta) {
            $decoded = json_decode($meta, true);
            if (\is_array($decoded) && isset($decoded['properties']) && \is_array($decoded['properties'])) {
                $raw = array_merge($raw, $decoded['properties']);
            }
        }

        $extracted = [];
        foreach ($propertyConfig as $key => $definition) {
            if (!\array_key_exists($key, $raw)) {
                if (!empty($definition['required'])) {
                    throw new BadRequestHttpException(\sprintf('Missing required property "%s".', $key));
                }

                continue;
            }

            $extracted[$key] = $this->castValue($raw[$key], (string) ($definition['type'] ?? 'string'), $key);
        }

        foreach (array_keys($raw) as $key) {
            if (!isset($propertyConfig[$key])) {
                throw new BadRequestHttpException(\sprintf('Property "%s" is not allowed for this profile.', $key));
            }
        }

        return $extracted;
    }

    private function castValue(mixed $value, string $type, string $key): mixed
    {
        return match ($type) {
            'integer', 'int' => $this->castInteger($value, $key),
            'string' => (string) $value,
            'boolean', 'bool' => filter_var($value, \FILTER_VALIDATE_BOOLEAN),
            default => throw new BadRequestHttpException(\sprintf('Unsupported property type "%s" for "%s".', $type, $key)),
        };
    }

    private function castInteger(mixed $value, string $key): int
    {
        if (!is_numeric($value)) {
            throw new BadRequestHttpException(\sprintf('Property "%s" must be an integer.', $key));
        }

        return (int) $value;
    }
}
