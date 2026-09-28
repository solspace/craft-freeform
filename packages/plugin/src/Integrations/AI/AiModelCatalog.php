<?php

namespace Solspace\Freeform\Integrations\AI;

use craft\helpers\App;
use GuzzleHttp\Client;

/**
 * Fetches model choices for the AI integration editor. The credentials never leave the server
 * except in requests to the selected provider's fixed API host.
 */
class AiModelCatalog
{
    public const PROVIDERS = ['OpenAI', 'Gemini', 'Anthropic', 'xAI'];

    public function fetch(string $provider, string $apiKey): array
    {
        if (!\in_array($provider, self::PROVIDERS, true)) {
            throw new \InvalidArgumentException('Unknown AI provider');
        }

        $apiKey = App::parseEnv($apiKey);
        if (!\is_string($apiKey) || '' === trim($apiKey)) {
            return [];
        }

        $headers = match ($provider) {
            'OpenAI', 'xAI' => ['Authorization' => 'Bearer '.$apiKey],
            'Gemini' => ['x-goog-api-key' => $apiKey],
            'Anthropic' => [
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
            ],
        };

        $client = \Craft::createGuzzleClient([
            'headers' => $headers,
            'connect_timeout' => 5,
            'timeout' => 12,
        ]);

        return match ($provider) {
            'OpenAI' => $this->fetchOpenAI($client),
            'Gemini' => $this->fetchGemini($client),
            'Anthropic' => $this->fetchAnthropic($client),
            'xAI' => $this->fetchXAI($client),
        };
    }

    private function fetchOpenAI(Client $client): array
    {
        $data = $this->getJson($client, 'https://api.openai.com/v1/models');
        $models = [];
        foreach ($data['data'] ?? [] as $item) {
            $id = $item['id'] ?? '';
            // /models also returns image, audio, embedding, moderation, and fine-tuning IDs.
            if (!\is_string($id) || !preg_match('/^(gpt-|o[1-9])/', $id)
                || preg_match('/(?:image|audio|realtime|transcri|tts|search|embedding|moderation|codex|pro)(?:-|$)/i', $id)
            ) {
                continue;
            }

            $models[$id] = ['id' => $id, 'label' => $id];
        }

        return array_values($models);
    }

    private function fetchGemini(Client $client): array
    {
        $models = [];
        $pageToken = null;
        for ($page = 0; $page < 10; ++$page) {
            $query = ['pageSize' => 100];
            if ($pageToken) {
                $query['pageToken'] = $pageToken;
            }

            $data = $this->getJson($client, 'https://generativelanguage.googleapis.com/v1beta/models', $query);
            foreach ($data['models'] ?? [] as $item) {
                $name = $item['name'] ?? '';
                $methods = $item['supportedGenerationMethods'] ?? $item['supportedActions'] ?? [];
                if (!\is_string($name) || !str_starts_with($name, 'models/') || !\in_array('generateContent', $methods, true)) {
                    continue;
                }

                $id = substr($name, 7);
                $models[$id] = ['id' => $id, 'label' => ($item['displayName'] ?? $id).' ('.$id.')'];
            }

            $pageToken = $data['nextPageToken'] ?? null;
            if (!$pageToken) {
                break;
            }
        }

        // Google's moving aliases may not appear in the model listing. Only offer aliases
        // that the API confirms support the same generateContent method Freeform uses.
        foreach (['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-pro-latest'] as $alias) {
            if (isset($models[$alias])) {
                continue;
            }

            try {
                $model = $this->getJson(
                    $client,
                    'https://generativelanguage.googleapis.com/v1beta/models/'.$alias,
                    [],
                    3,
                );
                $methods = $model['supportedGenerationMethods'] ?? $model['supportedActions'] ?? [];
                if (\in_array('generateContent', $methods, true)) {
                    $models[$alias] = ['id' => $alias, 'label' => $alias.' (latest alias)'];
                }
            } catch (\Throwable) {
                // This alias is unavailable to the configured API key.
            }
        }

        return array_values($models);
    }

    private function fetchAnthropic(Client $client): array
    {
        $models = [];
        $afterId = null;
        for ($page = 0; $page < 10; ++$page) {
            $query = ['limit' => 100];
            if ($afterId) {
                $query['after_id'] = $afterId;
            }

            $data = $this->getJson($client, 'https://api.anthropic.com/v1/models', $query);
            foreach ($data['data'] ?? [] as $item) {
                $id = $item['id'] ?? '';
                if (!\is_string($id) || '' === $id) {
                    continue;
                }

                $models[$id] = ['id' => $id, 'label' => ($item['display_name'] ?? $id).' ('.$id.')'];
            }

            $afterId = $data['last_id'] ?? null;
            if (empty($data['has_more']) || !$afterId) {
                break;
            }
        }

        // Dated Claude model IDs may have a shorter alias. Confirm it through the provider
        // before showing it as a choice; not every dateless ID is a moving alias.
        $candidates = array_keys($models);
        usort($candidates, static fn ($a, $b) => (int) str_contains($b, 'haiku') <=> (int) str_contains($a, 'haiku'));
        $checked = 0;
        foreach ($candidates as $id) {
            if (!preg_match('/^(claude-.+)-\d{8}$/', $id, $matches) || isset($models[$matches[1]])) {
                continue;
            }
            if (++$checked > 5) {
                break;
            }

            $alias = $matches[1];

            try {
                $resolved = $this->getJson(
                    $client,
                    'https://api.anthropic.com/v1/models/'.rawurlencode($alias),
                    [],
                    3,
                );
                if (isset($resolved['id'], $models[$resolved['id']])) {
                    $models[$alias] = ['id' => $alias, 'label' => $alias.' (alias)'];
                }
            } catch (\Throwable) {
                // Older models may not have an alias.
            }
        }

        return array_values($models);
    }

    private function fetchXAI(Client $client): array
    {
        $data = $this->getJson($client, 'https://api.x.ai/v1/language-models');
        $models = [];
        foreach ($data['models'] ?? [] as $item) {
            if (isset($item['output_modalities']) && !\in_array('text', $item['output_modalities'], true)) {
                continue;
            }

            $id = $item['id'] ?? '';
            if (!\is_string($id) || '' === $id) {
                continue;
            }

            $models[$id] = ['id' => $id, 'label' => $id];
            foreach ($item['aliases'] ?? [] as $alias) {
                if (\is_string($alias) && '' !== $alias) {
                    $models[$alias] = ['id' => $alias, 'label' => $alias.' (alias for '.$id.')'];
                }
            }
        }

        return array_values($models);
    }

    private function getJson(Client $client, string $url, array $query = [], ?int $timeout = null): array
    {
        $options = $query ? ['query' => $query] : [];
        if ($timeout) {
            $options['timeout'] = $timeout;
            $options['connect_timeout'] = $timeout;
        }

        $response = $client->get($url, $options);
        $data = json_decode((string) $response->getBody(), true);

        if (!\is_array($data)) {
            throw new \UnexpectedValueException('Invalid model listing response');
        }

        return $data;
    }
}
