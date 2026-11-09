<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\services\Path;
use craft\web\Request;
use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\CodepackController;
use Solspace\Freeform\Library\Codepack\CodePack;
use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;
use Solspace\Freeform\Services\SettingsService;
use Symfony\Component\Filesystem\Exception\IOException;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;

#[CoversClass(CodepackController::class)]
class CodepackControllerTest extends TestCase
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

    public function testJsonSuccessIsReturnedOnlyAfterInstallationFinishes(): void
    {
        [$controller, $codepack, $view] = $this->fixture();
        $installed = false;
        $codepack->expects(self::once())->method('install')->with('demo-test')->willReturnCallback(static function () use (&$installed): void {
            $installed = true;
        });
        $view->expects(self::once())->method('renderTemplate')->with('freeform/codepack/_success', ['codePack' => $codepack, 'prefix' => 'demo-test'])->willReturnCallback(static function () use (&$installed): string {
            self::assertTrue($installed);

            return '<h2>Ready</h2>';
        });
        $controller->expects(self::never())->method('redirectToPostedUrl');
        self::assertSame(['success' => true, 'html' => '<h2>Ready</h2>'], $controller->actionInstall()->data);
    }

    public function testHtmlSuccessKeepsTheRedirectAndSuccessFlash(): void
    {
        [$controller, $codepack, $view, $session] = $this->fixture(json: false);
        $codepack->expects(self::once())->method('install')->with('demo-test');
        $view->expects(self::never())->method('renderTemplate');
        $controller->expects(self::once())->method('redirectToPostedUrl')->willReturn($this->response([]));
        $controller->actionInstall();
        self::assertSame(['codepack_prefix' => 'demo-test'], $session->flashes);
    }

    #[TestWith([FileObjectException::class])]
    #[TestWith([IOException::class])]
    public function testFailedInstallationDoesNotRenderSuccess(string $exceptionClass): void
    {
        [$controller, $codepack, $view] = $this->fixture();
        $codepack->method('install')->willThrowException(new $exceptionClass('Folder is not writable.'));
        $view->expects(self::never())->method('renderTemplate');
        self::assertSame(['success' => false, 'message' => 'Folder is not writable.'], $controller->actionInstall()->data);
    }

    public function testHtmlFailureKeepsTheFormEditableAndPreservesTheFolder(): void
    {
        [$controller, $codepack] = $this->fixture(json: false);
        $codepack->method('install')->willThrowException(new FileObjectException('Not writable'));
        $controller->expects(self::once())->method('renderTemplate')->with('freeform/codepack', [
            'codePack' => $codepack,
            'prefix' => 'demo-test',
            'exceptionMessage' => 'Not writable',
            'readOnly' => false,
            'templatesExist' => false,
        ])->willReturn($this->response([]));
        $controller->actionInstall();
    }

    public function testReadOnlyEnvironmentsCannotInstall(): void
    {
        [$controller, $codepack] = $this->fixture(editable: false);
        $codepack->expects(self::never())->method('install');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionInstall();
    }

    public function testSettingsPermissionIsRequired(): void
    {
        [$controller, $codepack] = $this->fixture(allowed: false);
        $codepack->expects(self::never())->method('install');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionInstall();
    }

    #[TestWith([''])]
    #[TestWith(['../outside'])]
    #[TestWith(['folder/child'])]
    #[TestWith(['folder\child'])]
    #[TestWith(['.'])]
    #[TestWith(['..'])]
    #[TestWith([['invalid']])]
    public function testInvalidFolderNamesNeverInstall(mixed $prefix): void
    {
        [$controller, $codepack] = $this->fixture(prefix: $prefix);
        $codepack->expects(self::never())->method('install');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionInstall();
    }

    public function testDestinationCheckReturnsOnlyWhetherTheSelectedFolderExists(): void
    {
        $directory = sys_get_temp_dir().'/freeform-existing-folder-'.bin2hex(random_bytes(6));
        mkdir($directory.'/existing', 0777, true);
        file_put_contents($directory.'/occupied', 'A file is not a directory.');

        try {
            foreach (['existing' => true, 'new-folder' => false, 'occupied' => false] as $prefix => $expected) {
                [$controller, $codepack] = $this->fixture(prefix: $prefix, templatesPath: $directory);
                $codepack->expects(self::never())->method('install');
                self::assertSame(['templatesExist' => $expected], $controller->actionCheckDestination()->data);
            }
        } finally {
            unlink($directory.'/occupied');
            rmdir($directory.'/existing');
            rmdir($directory);
        }
    }

    #[TestWith(['../outside'])]
    #[TestWith(['folder/child'])]
    #[TestWith(['folder\child'])]
    #[TestWith([['invalid']])]
    public function testDestinationCheckRejectsUnscopedPaths(mixed $prefix): void
    {
        [$controller] = $this->fixture(prefix: $prefix);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionCheckDestination();
    }

    public function testDestinationCheckRequiresSettingsPermission(): void
    {
        [$controller] = $this->fixture(allowed: false);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionCheckDestination();
    }

    public function testDestinationCheckRequiresPost(): void
    {
        [$controller] = $this->fixture(post: false);
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Post request required');
        $controller->actionCheckDestination();
    }

    public function testInitialPageIncludesTheDefaultFolderCheck(): void
    {
        [$controller] = $this->fixture();
        $controller->expects(self::once())->method('renderTemplate')->with('freeform/codepack', self::callback(static fn (array $variables): bool => false === $variables['templatesExist'] && 'freeform-demo' === $variables['prefix']))->willReturn($this->response([]));
        $controller->actionListContents();
    }

    private function fixture(bool $json = true, bool $editable = true, bool $allowed = true, mixed $prefix = 'demo-test', string $templatesPath = '/freeform-codepack-nonexistent-test-path', bool $post = true): array
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getAcceptsJson')->willReturn($json);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('post')->with('prefix')->willReturn($prefix);
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isAllowAdminEdit')->willReturn($editable);
        $codepack = $this->createMock(CodePack::class);
        $view = $this->createMock(View::class);
        $user = new class($allowed) {
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
        $path = $this->createMock(Path::class);
        $path->method('getSiteTemplatesPath')->willReturn($templatesPath);
        $session = new class {
            public array $flashes = [];

            public function getFlash(string $key): ?string
            {
                return $this->flashes[$key] ?? null;
            }

            public function setFlash(string $key, string $value): void
            {
                $this->flashes[$key] = $value;
            }
        };
        \Craft::$app = \Yii::$app = new class($request, $view, $user, $session, $path) {
            public function __construct(public Request $request, public View $view, private object $user, public object $session, private Path $path) {}

            public function getPath(): Path
            {
                return $this->path;
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getView(): View
            {
                return $this->view;
            }
        };
        $controller = $this->getMockBuilder(CodepackController::class)->disableOriginalConstructor()->onlyMethods(['getCodepack', 'getSettingsService', 'asJson', 'renderTemplate', 'redirectToPostedUrl'])->getMock();
        $controller->request = $request;
        $controller->method('getCodepack')->willReturn($codepack);
        $controller->method('getSettingsService')->willReturn($settings);
        $controller->method('asJson')->willReturnCallback(fn ($data) => $this->response($data));

        return [$controller, $codepack, $view, $session];
    }

    private function response(array $data): Response
    {
        $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $response->data = $data;

        return $response;
    }
}
