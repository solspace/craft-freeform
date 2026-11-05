<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\View;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SettingsController;
use Solspace\Freeform\Resources\Bundles\SettingsBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

#[CoversNothing]
class FormMonitorSettingsTest extends TestCase
{
    #[TestWith([true])]
    #[TestWith([false])]
    public function testConnectedSitesKeepTheirShortcutAndOtherSitesSeeTheIntroduction(bool $connected): void
    {
        $previous = \Craft::$app;
        \Craft::$app = $this->app();

        try {
            $response = $this->createStub(Response::class);
            $settings = $this->createStub(SettingsService::class);
            $settings->method('isFormMonitorEnabledAndAuthorized')->willReturn($connected);
            $view = $this->createMock(View::class);
            $view->expects($connected ? self::never() : self::once())->method('registerAssetBundle')->with(SettingsBundle::class);
            $controller = $this->getMockBuilder(SettingsController::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['getSettingsService', 'getView', 'renderTemplate', 'redirect'])
                ->getMock()
            ;
            $controller->method('getSettingsService')->willReturn($settings);
            $controller->method('getView')->willReturn($view);
            $controller->expects($connected ? self::once() : self::never())
                ->method('redirect')->with(self::stringContains('admin/freeform/integrations/single/FormMonitor'))->willReturn($response)
            ;
            $controller->expects($connected ? self::never() : self::once())
                ->method('renderTemplate')->with('freeform/settings/form-monitor', ['readOnly' => false])->willReturn($response)
            ;
            self::assertSame($response, $controller->actionFormMonitor());
        } finally {
            \Craft::$app = $previous;
        }
    }

    public function testSettingsPermissionIsRequiredBeforeCheckingIntegrationStatus(): void
    {
        $previous = \Craft::$app;
        \Craft::$app = $this->app(false);

        try {
            $controller = $this->getMockBuilder(SettingsController::class)->disableOriginalConstructor()->onlyMethods(['getSettingsService'])->getMock();
            $controller->expects(self::never())->method('getSettingsService');
            $this->expectException(ForbiddenHttpException::class);
            $controller->actionFormMonitor();
        } finally {
            \Craft::$app = $previous;
        }
    }

    private function app(bool $allowed = true): object
    {
        return new class($allowed) {
            public object $request;

            public function __construct(private bool $allowed)
            {
                $this->request = new class($allowed) {
                    public function __construct(private bool $console) {}

                    public function getIsConsoleRequest(): bool
                    {
                        return $this->console;
                    }

                    public function getScriptUrl(): string
                    {
                        return '/index.php';
                    }

                    public function getHostInfo(): string
                    {
                        return 'https://example.test';
                    }

                    public function getIsSecureConnection(): bool
                    {
                        return true;
                    }
                };
            }

            public function getRequest(): object
            {
                return $this->request;
            }

            public function getIsInitialized(): bool
            {
                return false;
            }

            public function getConfig(): object
            {
                return new class {
                    public function getGeneral(): object
                    {
                        return (object) ['cpTrigger' => 'admin', 'omitScriptNameInUrls' => true, 'baseCpUrl' => 'https://example.test', 'usePathInfo' => true, 'pathParam' => 'p'];
                    }
                };
            }

            public function getUser(): object
            {
                return new class($this->allowed) {
                    public function __construct(private bool $allowed) {}

                    public function getIsAdmin(): bool
                    {
                        return false;
                    }

                    public function checkPermission(string $permission): bool
                    {
                        return $this->allowed;
                    }
                };
            }
        };
    }
}
