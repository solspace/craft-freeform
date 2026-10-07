<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\db\Connection;
use craft\web\Request;
use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\DiagnosticsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Diagnostics\DiagnosticItem;
use Solspace\Freeform\Library\DataObjects\Diagnostics\NotificationItem;
use Solspace\Freeform\Services\DiagnosticsService;
use Twig\Markup;
use yii\db\mysql\Schema;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

#[CoversClass(DiagnosticsController::class)]
class DiagnosticsControllerTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testOverviewDoesNotRunDatabaseChecks(): void
    {
        [$controller, $diagnostics] = $this->fixture();
        $diagnostics->expects(self::never())->method('getDatabaseChecks');
        foreach (['getServerChecks', 'getSiteChecks', 'getFreeformStats', 'getFreeformConfigurations', 'getFreeformIntegrations', 'getFreeformFormType', 'getCraftModules'] as $method) {
            $diagnostics->method($method)->willReturn([]);
        }
        $controller->method('renderTemplate')->willReturnCallback(static function ($template, $variables) {
            self::assertArrayNotHasKey('database', $variables);
            self::assertStringNotContainsString('Database Checks', $variables['report']);
            $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
            $response->data = $variables;

            return $response;
        });

        $controller->actionIndex();
    }

    public function testManualCheckRefreshesMetadataAndReturnsHealthyResults(): void
    {
        [$controller, $diagnostics, $schema, $view] = $this->fixture();
        $schema->expects(self::once())->method('refresh');
        $items = [$this->item('Database Foreign Keys: All expected keys present'), $this->item('Database Structure: All expected tables, columns, and indexes present')];
        $diagnostics->expects(self::once())->method('getDatabaseChecks')->willReturn($items);
        $view->expects(self::once())->method('renderTemplate')->with('freeform/settings/_database-check', ['database' => $items])->willReturn('<ul>Both checks passed</ul>');

        $result = $controller->actionCheckDatabaseIntegrity()->data;
        self::assertFalse($result['needsAttention']);
        self::assertStringContainsString('Both checks passed', $result['html']);
        self::assertStringContainsString('All expected keys present', $result['report']);
        self::assertStringContainsString('All expected tables, columns, and indexes present', $result['report']);
    }

    public function testManualCheckPreservesWarningsAndRepairInstructions(): void
    {
        [$controller, $diagnostics, $schema, $view] = $this->fixture();
        $schema->expects(self::once())->method('refresh');
        $item = $this->item('Database Foreign Keys: Requires attention', true);
        $diagnostics->method('getDatabaseChecks')->willReturn([$item]);
        $view->method('renderTemplate')->willReturn('<ul>Missing key. Read the repair guide.</ul>');

        $result = $controller->actionCheckDatabaseIntegrity()->data;
        self::assertTrue($result['needsAttention']);
        self::assertStringContainsString('[Potential issue]', $result['report']);
        self::assertStringContainsString('Read the repair guide.', $result['report']);
    }

    public function testUsersWithoutSettingsAccessCannotRunDatabaseChecks(): void
    {
        [$controller, $diagnostics, $schema] = $this->fixture(allowed: false);
        $diagnostics->expects(self::never())->method('getDatabaseChecks');
        $schema->expects(self::never())->method('refresh');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionCheckDatabaseIntegrity();
    }

    public function testFrontendRequestsCannotRunDatabaseChecks(): void
    {
        [$controller, $diagnostics, $schema] = $this->fixture(cp: false);
        $diagnostics->expects(self::never())->method('getDatabaseChecks');
        $schema->expects(self::never())->method('refresh');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionCheckDatabaseIntegrity();
    }

    private function fixture(bool $allowed = true, bool $cp = true): array
    {
        $diagnostics = $this->createMock(DiagnosticsService::class);
        $plugin = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $plugin->set('diagnostics', $diagnostics);
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getAcceptsJson')->willReturn(true);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $schema = $this->createMock(Schema::class);
        $db = $this->createMock(Connection::class);
        $db->method('getSchema')->willReturn($schema);
        $view = $this->createMock(View::class);
        $view->method('registerAssetBundle')->willReturn(null);
        $user = new class($allowed) {
            public function __construct(private bool $allowed) {}

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($permission): bool
            {
                TestCase::assertSame(strtolower(Freeform::PERMISSION_SETTINGS_ACCESS), $permission);

                return $this->allowed;
            }
        };
        \Craft::$app = \Yii::$app = new class($plugin, $request, $db, $view, $user) {
            public array $loadedModules;

            public function __construct($plugin, public Request $request, private Connection $db, public View $view, private object $user)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getView(): View
            {
                return $this->view;
            }
        };
        $controller = $this->getMockBuilder(DiagnosticsController::class)->disableOriginalConstructor()->onlyMethods(['asJson', 'renderTemplate'])->getMock();
        $controller->request = $request;
        $controller->method('asJson')->willReturnCallback(static function ($data) {
            $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
            $response->data = $data;

            return $response;
        });

        return [$controller, $diagnostics, $schema, $view];
    }

    private function item(string $label, bool $warning = false): DiagnosticItem
    {
        $item = $this->createMock(DiagnosticItem::class);
        $item->method('getMarkup')->willReturn(new Markup($label, 'UTF-8'));
        $warnings = $warning ? [new NotificationItem(new Markup('Missing key', 'UTF-8'), new Markup('Read the repair guide.', 'UTF-8'), 'WarningValidator')] : [];
        $item->method('getWarnings')->willReturn($warnings);
        $item->method('getAllValidators')->willReturn($warnings);

        return $item;
    }
}
