<?php

namespace Solspace\Freeform\Tests\Integrations\Other\Supabase;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Supabase\Controllers\SupabaseController;
use Solspace\Freeform\Integrations\Other\Supabase\Supabase;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\CrmService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

#[CoversClass(SupabaseController::class)]
class SupabaseControllerTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testPublicRequestsCannotReadRemoteMetadata(): void
    {
        $controller = $this->controller([], false, false);
        $controller->expects(self::never())->method('getIntegrationsService');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionFields();
    }

    public function testControlPanelUsersWithoutFormAccessCannotReadRemoteMetadata(): void
    {
        $controller = $this->controller(['formId' => 99, 'integrationId' => 1], true, false);
        $controller->expects(self::never())->method('getIntegrationsService');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionFields();
    }

    public function testMappingUsesSelectedTableInsteadOfPersistedFormValuesAndParsesRefresh(): void
    {
        $controller = $this->controller(['formId' => 99, 'integrationId' => 1, 'table' => 'new_table', 'refresh' => 'false'], true, true);
        $forms = $this->createMock(FormsService::class);
        $forms->expects(self::once())->method('getFormById')->with(99)->willReturn($this->createMock(Form::class));
        $controller->method('getFormsService')->willReturn($forms);

        $integration = $this->getMockBuilder(Supabase::class)->disableOriginalConstructor()->onlyMethods(['getSchema'])->getMock();
        $integration->method('getSchema')->willReturn('public');
        $integrations = $this->createMock(IntegrationsService::class);
        $integrations->expects(self::once())->method('getIntegrationObjectById')->with(1)->willReturn($integration);
        $controller->method('getIntegrationsService')->willReturn($integrations);
        $crm = $this->createMock(CrmService::class);
        $crm->expects(self::once())->method('getFields')->with($integration, 'public.new_table', false)
            ->willReturn([new FieldObject('email', 'Email', 'string', 'public.new_table', true)])
        ;
        $controller->method('getCrmService')->willReturn($crm);
        $controller->method('asSerializedJson')->willReturnCallback(static function ($payload) {
            $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
            $response->data = $payload;

            return $response;
        });
        $payload = $controller->actionFields()->data;
        self::assertSame('email', $payload[0]['id']);
        self::assertTrue($payload[0]['required']);
    }

    private function controller(array $params, bool $cp, bool $admin): SupabaseController
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('get')->willReturnCallback(static fn ($key, $default = null) => $params[$key] ?? $default);
        $user = new class($admin) {
            public function __construct(private bool $admin) {}

            public function getIsAdmin(): bool
            {
                return $this->admin;
            }

            public function checkPermission(string $permission): bool
            {
                return $this->admin;
            }
        };
        \Craft::$app = new class($request, $user) {
            public function __construct(public Request $request, private object $user) {}

            public function getUser(): object
            {
                return $this->user;
            }
        };
        $controller = $this->getMockBuilder(SupabaseController::class)->disableOriginalConstructor()
            ->onlyMethods(['getFormsService', 'getIntegrationsService', 'getCrmService', 'asSerializedJson'])->getMock()
        ;
        $controller->request = $request;

        return $controller;
    }
}
