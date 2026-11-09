<?php

namespace Solspace\Freeform\Tests\Library\Configuration;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\SettingsService;

/**
 * @coversNothing
 */
class SetupAccessTest extends TestCase
{
    #[TestWith([true, true, true])]
    #[TestWith([true, false, false])]
    #[TestWith([false, true, false])]
    #[TestWith([false, false, false])]
    public function testGuideRequiresBothAdministratorStatusAndAdminChanges(bool $admin, bool $allowChanges, bool $expected): void
    {
        $before = \Craft::$app;
        \Craft::$app = new class($admin) {
            public object $request;

            public function __construct(private bool $admin)
            {
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return false;
                    }
                };
            }

            public function getUser(): object
            {
                return new class($this->admin) {
                    public function __construct(private bool $admin) {}

                    public function getIsAdmin(): bool
                    {
                        return $this->admin;
                    }
                };
            }
        };

        try {
            $service = $this->getMockBuilder(SettingsService::class)->disableOriginalConstructor()->onlyMethods(['isAllowAdminEdit'])->getMock();
            $service->method('isAllowAdminEdit')->willReturn($allowChanges);
            self::assertSame($expected, $service->canUseSetupGuide());
        } finally {
            \Craft::$app = $before;
        }
    }
}
