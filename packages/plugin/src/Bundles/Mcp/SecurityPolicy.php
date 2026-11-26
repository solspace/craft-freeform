<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\db\Query;
use craft\db\Table;
use craft\services\ProjectConfig;
use yii\db\Exception;

final class SecurityPolicy
{
    public static function requiresDestructiveConfirmation(): bool
    {
        return self::read('requireMcpDestructiveConfirmation', true);
    }

    public static function allowsSubmissionValues(): bool
    {
        return self::read('allowMcpSubmissionValues', false);
    }

    private static function read(string $setting, bool $default): bool
    {
        $config = \Craft::$app->getConfig()->getConfigFromFile('freeform');
        if (\is_array($config) && \array_key_exists($setting, $config)) {
            return \is_bool($config[$setting]) ? $config[$setting] : $default;
        }

        // Craft caches the plugin model and applied project config in long-running MCP servers.
        // Read the applied setting from the primary database so changes take effect between calls.
        try {
            $value = \Craft::$app->getDb()->useMaster(static fn ($db) => (new Query())
                ->select('value')
                ->from(Table::PROJECTCONFIG)
                ->where(['path' => ProjectConfig::PATH_PLUGINS.'.freeform.settings.'.$setting])
                ->noCache()
                ->scalar($db));
        } catch (Exception) {
            \Craft::warning('Could not read the saved Freeform MCP security setting. Using the restricted default.', __METHOD__);

            return $default;
        }

        return match ($value) {
            'true' => true,
            'false' => false,
            default => $default,
        };
    }
}
