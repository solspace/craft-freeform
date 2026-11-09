<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SetupController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\SetupSettings;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

#[CoversNothing]
class SetupControllerTest extends TestCase
{
    public function testSavingRequiresAPostBeforeReadingSettings(): void
    {
        $controller = $this->getMockBuilder(SetupController::class)->disableOriginalConstructor()->onlyMethods(['requirePostRequest', 'getSettingsService'])->getMock();
        $controller->method('requirePostRequest')->willThrowException(new BadRequestHttpException());
        $controller->expects(self::never())->method('getSettingsService');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionSave();
    }

    public function testReadOnlySitesCannotSave(): void
    {
        $service = $this->createMock(SettingsService::class);
        $service->method('canUseSetupGuide')->willReturn(false);
        $service->expects(self::never())->method('getSettingsModel');
        $controller = $this->getMockBuilder(SetupController::class)->disableOriginalConstructor()->onlyMethods(['requirePostRequest', 'getSettingsService'])->getMock();
        $controller->method('getSettingsService')->willReturn($service);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionSave();
    }

    public function testFailedSavesPreserveUnrelatedStoredValuesAndRestoreTheSettingsModel(): void
    {
        $beforeApp = \Craft::$app;
        $beforeYii = \Yii::$app;
        $settings = $this->getMockBuilder(Settings::class)->disableOriginalConstructor()->onlyMethods(['toArray', 'setAttributes', 'getErrors'])->getMock();
        $before = ['emailTemplateMethod' => 'form', 'defaultFromEmail' => '{{ general.systemEmail }}'];
        $settings->method('toArray')->willReturn($before);
        $settings->expects(self::once())->method('setAttributes')->with($before, false);
        $settings->method('getErrors')->willReturn(['formTemplateDirectory' => ['Directory unavailable']]);
        $stored = ['emailTemplateMethod' => 'form', 'queuePingToken' => 'keep-this-token', 'defaults' => ['settings' => ['processing' => ['ajax' => true]]]];
        $plugins = new class {
            public array $pluginConfigs = [];
            public array $saved = [];

            public function savePluginSettings($plugin, array $data): bool
            {
                $this->saved = $data;

                return false;
            }
        };
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->getMock();
        \Craft::$app = new class($plugins, $stored, $plugin) {
            public array $loadedModules;

            public function __construct(private object $plugins, private array $stored, object $plugin)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getPlugins(): object
            {
                return $this->plugins;
            }

            public function getProjectConfig(): object
            {
                return new class($this->stored) {
                    public function __construct(private array $stored) {}

                    public function get(string $path): array
                    {
                        return $this->stored;
                    }
                };
            }

            public function getConfig(): object
            {
                return new class {
                    public function getConfigFromFile(string $file): array
                    {
                        return [];
                    }
                };
            }

            public function getI18n(): object
            {
                return new class {
                    public function translate($category, $message, $params = [], $language = null): string
                    {
                        return $message;
                    }
                };
            }
        };
        \Yii::$app = \Craft::$app;

        try {
            $request = $this->createStub(Request::class);
            $original = SetupSettings::values($settings);
            $request->method('getBodyParam')->willReturnCallback(static fn ($key, $default = null) => ['changes' => ['emailTemplateMethod' => 'all'], 'original' => $original][$key] ?? $default);
            $service = $this->createStub(SettingsService::class);
            $service->method('canUseSetupGuide')->willReturn(true);
            $service->method('getSettingsModel')->willReturn($settings);
            $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
            $controller = $this->getMockBuilder(SetupController::class)->disableOriginalConstructor()->onlyMethods(['requirePostRequest', 'getSettingsService', 'asJson'])->getMock();
            $controller->request = $request;
            $controller->response = $response;
            $controller->method('getSettingsService')->willReturn($service);
            $controller->method('asJson')->willReturnCallback(static function ($data) use ($response) {
                $response->data = $data;

                return $response;
            });
            self::assertSame($response, $controller->actionSave());
            self::assertSame(array_replace($stored, ['emailTemplateMethod' => 'all']), $plugins->saved);
            self::assertSame(422, $response->statusCode);
            self::assertArrayHasKey('formTemplateDirectory', $response->data['errors']);
        } finally {
            \Craft::$app = $beforeApp;
            \Yii::$app = $beforeYii;
        }
    }
}
