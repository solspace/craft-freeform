<?php

namespace Solspace\Freeform\Tests\Bundles\Mcp;

use craft\db\Table;
use craft\services\Config;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Mcp\SecurityPolicy;
use yii\db\Connection;

#[CoversClass(SecurityPolicy::class)]
class SecurityPolicyTest extends TestCase
{
    public function testFreshCallsUseTheCurrentAppliedSecuritySettings(): void
    {
        $db = new Connection(['dsn' => 'sqlite::memory:', 'schemaCache' => null]);
        $db->createCommand()->createTable(Table::PROJECTCONFIG, ['path' => 'TEXT PRIMARY KEY', 'value' => 'TEXT'])->execute();
        $config = $this->createStub(Config::class);
        $config->method('getConfigFromFile')->with('freeform')->willReturn([]);

        $previousApp = \Craft::$app;
        \Craft::$app = new class($db, $config) {
            public function __construct(private Connection $db, private Config $config) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getConfig(): Config
            {
                return $this->config;
            }
        };

        try {
            self::assertTrue(SecurityPolicy::requiresDestructiveConfirmation());
            self::assertFalse(SecurityPolicy::allowsSubmissionValues());

            $confirmation = 'plugins.freeform.settings.requireMcpDestructiveConfirmation';
            $values = 'plugins.freeform.settings.allowMcpSubmissionValues';
            $db->createCommand()->batchInsert(Table::PROJECTCONFIG, ['path', 'value'], [
                [$confirmation, 'false'],
                [$values, 'true'],
            ])->execute();
            self::assertFalse(SecurityPolicy::requiresDestructiveConfirmation());
            self::assertTrue(SecurityPolicy::allowsSubmissionValues());

            $db->createCommand()->update(Table::PROJECTCONFIG, ['value' => 'true'], ['path' => $confirmation])->execute();
            $db->createCommand()->update(Table::PROJECTCONFIG, ['value' => 'false'], ['path' => $values])->execute();
            self::assertTrue(SecurityPolicy::requiresDestructiveConfirmation());
            self::assertFalse(SecurityPolicy::allowsSubmissionValues());
        } finally {
            \Craft::$app = $previousApp;
            $db->close();
        }
    }
}
