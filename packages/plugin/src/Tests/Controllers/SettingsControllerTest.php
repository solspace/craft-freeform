<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SettingsController;
use Solspace\Freeform\Services\SettingsService;
use yii\web\ForbiddenHttpException;

#[CoversClass(SettingsController::class)]
class SettingsControllerTest extends TestCase
{
    #[TestWith(['requireMcpDestructiveConfirmation', ''])]
    #[TestWith(['allowMcpSubmissionValues', '1'])]
    public function testSettingsAccessAloneCannotWeakenMcpPolicy(string $setting, string $value): void
    {
        $request = $this->createStub(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsCpRequest')->willReturn(true);
        $request->method('post')->willReturn([$setting => $value]);
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isAllowAdminEdit')->willReturn(true);
        $settings->expects(self::never())->method('saveSettings');
        $controller = $this->getMockBuilder(SettingsController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getSettingsService'])
            ->getMock()
        ;
        $controller->request = $request;
        $controller->method('getSettingsService')->willReturn($settings);
        $previousApp = \Craft::$app;
        \Craft::$app = new class($request) {
            public function __construct(public Request $request) {}

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }

                    public function getIsGuest(): bool
                    {
                        return false;
                    }

                    public function checkPermission(string $permission): bool
                    {
                        return true;
                    }
                };
            }
        };

        try {
            $this->expectException(ForbiddenHttpException::class);
            $this->expectExceptionMessage('User is not permitted to perform this action.');
            $controller->actionSaveSettings();
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
