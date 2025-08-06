<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth\Providers;

use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;

class OAuth2StateProvider extends FeatureBundle
{
    private const KEY_PREFIX = 'oauth2_auth_flow';

    public function encryptState(int $integrationId, string $token): string
    {
        $cacheKey = $this->createKey($integrationId, $token);
        \Craft::$app->cache->set($cacheKey, true, 60 * 5); // Cache for 5 minutes

        $encryptionKey = EncryptionHelper::getKey();
        $data = json_encode([
            'integrationId' => $integrationId,
            'token' => $token,
        ]);

        return EncryptionHelper::encryptByKey($encryptionKey, $data);
    }

    public function extractIntegrationIdFromState(string $state): ?int
    {
        $encryptionKey = EncryptionHelper::getKey();
        $json = EncryptionHelper::decryptByKey($encryptionKey, $state);
        if (!$json) {
            return null;
        }

        $data = json_decode($json, false);
        if (\JSON_ERROR_NONE !== json_last_error()) {
            return null;
        }

        $id = $data->integrationId ?? null;
        $token = $data->token ?? null;

        $cacheKey = $this->createKey($id, $token);
        if (\Craft::$app->cache->exists($cacheKey)) {
            \Craft::$app->cache->delete($cacheKey);

            return $id;
        }

        return null;
    }

    private function createKey(int $integrationId, string $token): string
    {
        return \sprintf('%s_%s_%s', self::KEY_PREFIX, $integrationId, $token);
    }
}
