<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261028_120000_AddActivityLog;

#[CoversNothing]
class ActivityUpgradeTest extends TestCase
{
    #[TestWith([null, 'minimal'])]
    #[TestWith(['custom', 'custom'])]
    #[TestWith(['standard', 'standard'])]
    #[TestWith(['detailed', 'detailed'])]
    public function testUpgradeDefaultsToMinimalWithoutReplacingAnExplicitChoice(?string $configured, string $expected): void
    {
        $config = new class($configured) {
            public function __construct(public ?string $mode) {}

            public function get(string $path): ?string
            {
                return $this->mode;
            }

            public function set(string $path, string $value, string $message): void
            {
                $this->mode = $value;
            }
        };
        $previous = \Craft::$app;
        \Craft::$app = new class($config) {
            public function __construct(private object $config) {}

            public function getProjectConfig(): object
            {
                return $this->config;
            }
        };

        try {
            $db = $this->createMock(Connection::class);
            $db->method('tableExists')->willReturn(true);
            $migration = (new \ReflectionClass(m261028_120000_AddActivityLog::class))->newInstanceWithoutConstructor();
            $migration->db = $db;
            self::assertTrue($migration->safeUp());
            self::assertSame($expected, $config->mode);
        } finally {
            \Craft::$app = $previous;
        }
    }
}
