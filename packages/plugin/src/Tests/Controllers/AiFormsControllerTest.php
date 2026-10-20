<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Services\FormGenerationService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;
use yii\web\UploadedFile;

#[CoversClass(FormsController::class)]
class AiFormsControllerTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private array $previousFiles;
    private ?string $temporary = null;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->previousFiles = $_FILES;
        $_FILES = [];
        UploadedFile::reset();
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
        $_FILES = $this->previousFiles;
        UploadedFile::reset();
        if ($this->temporary) {
            unlink($this->temporary);
        }
    }

    #[TestWith([Freeform::PERMISSION_FORMS_CREATE])]
    #[TestWith([Freeform::PERMISSION_INTEGRATIONS_ACCESS])]
    public function testGenerationRequiresBothPermissions(string $denied): void
    {
        [$controller] = $this->fixture(denied: strtolower($denied));
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionGenerateFromAi();
    }

    public function testOptionsRequireIntegrationAccess(): void
    {
        [$controller] = $this->fixture(denied: strtolower(Freeform::PERMISSION_INTEGRATIONS_ACCESS));
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionAiOptions();
    }

    public function testOptionsExposeOnlyEnabledAiCapabilitiesWithoutCredentials(): void
    {
        [$controller, , $integrations] = $this->fixture();
        $models = [];
        foreach ([['vision', true, true], ['text', false, true], ['disabled', true, false]] as $index => [$uid, $references, $enabled]) {
            $integration = $this->createMock($references ? ReferenceAiIntegrationInterface::class : AiIntegrationInterface::class);
            $integration->method('isEnabled')->willReturn($enabled);
            $integration->method('getModel')->willReturn('configured-model');
            if ($references) {
                $integration->method('getReferenceMimeTypes')->willReturn(['application/pdf']);
            }
            $model = $this->getMockBuilder(IntegrationModel::class)->disableOriginalConstructor()->onlyMethods(['getIntegrationObject'])->getMock();
            $model->class = $integration::class;
            $model->id = $index + 1;
            $model->uid = $model->handle = $model->name = $uid;
            $model->metadata = ['apiKey' => 'must-never-be-returned'];
            $model->method('getIntegrationObject')->willReturn($integration);
            $models[] = $model;
        }
        $integrations->method('getAllIntegrations')->willReturn($models);
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $response = $controller->actionAiOptions();
        self::assertSame(['vision', 'text'], array_column($response->data, 'uid'));
        self::assertSame(['application/pdf'], $response->data[0]['referenceMimeTypes']);
        self::assertSame([], $response->data[1]['referenceMimeTypes']);
        self::assertArrayNotHasKey('metadata', $response->data[0]);
        self::assertStringNotContainsString('must-never-be-returned', json_encode($response->data));
        self::assertSame('no-store, private', $response->getHeaders()->get('Cache-Control'));
    }

    public function testGenerationRequiresPost(): void
    {
        [$controller] = $this->fixture(post: false);
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Post request required');
        $controller->actionGenerateFromAi();
    }

    public function testGenerationRequiresControlPanelRequest(): void
    {
        [$controller] = $this->fixture(cp: false);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionGenerateFromAi();
    }

    public function testExpressCannotGenerate(): void
    {
        [$controller] = $this->fixture(edition: Freeform::EDITION_EXPRESS);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionGenerateFromAi();
    }

    #[TestWith(['1'])]
    #[TestWith([[]])]
    #[TestWith(['invalid'])]
    public function testDroppedOrMalformedUploadCountDoesNotGenerate(mixed $count): void
    {
        [$controller, $generator] = $this->fixture(['referenceFileCount' => $count]);
        $generator->expects(self::never())->method('generate');
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('server upload limits');
        $controller->actionGenerateFromAi();
    }

    public function testJsonTextOnlyRequestStillReachesGenerator(): void
    {
        [$controller, $generator] = $this->fixture();
        $generator->expects(self::once())->method('generate')->with('Contact form', 'Contact', 'vision', 120, [])->willThrowException(new \RuntimeException('Reached generator'));
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Reached generator');
        $controller->actionGenerateFromAi();
    }

    public function testMultipartFileOnlyRequestPassesValidatedReferences(): void
    {
        $this->temporary = tempnam(sys_get_temp_dir(), 'ff-ref-');
        file_put_contents($this->temporary, "%PDF-1.4\n%%EOF");
        $_FILES['references'] = ['name' => ['original.pdf'], 'tmp_name' => [$this->temporary], 'type' => ['application/pdf'], 'size' => [filesize($this->temporary)], 'error' => [\UPLOAD_ERR_OK]];
        [$controller, $generator] = $this->fixture(['prompt' => '', 'referenceFileCount' => '1']);
        $generator->expects(self::once())->method('generate')->willReturnCallback(static function ($prompt, $name, $uid, $timeout, $referenceFiles) {
            self::assertSame('', $prompt);
            self::assertSame('vision', $uid);
            self::assertCount(1, $referenceFiles);
            self::assertSame('application/pdf', $referenceFiles[0]->mimeType);

            throw new \RuntimeException('Validated upload');
        });
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Validated upload');
        $controller->actionGenerateFromAi();
    }

    private function fixture(array $params = [], ?string $denied = null, bool $post = true, bool $cp = true, string $edition = Freeform::EDITION_LITE): array
    {
        $generator = $this->createMock(FormGenerationService::class);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['edition'])->getMock();
        $plugin->method('edition')->willReturn(new EditionHelper($edition, [Freeform::EDITION_EXPRESS, Freeform::EDITION_LITE, Freeform::EDITION_PRO]));
        $plugin->set('formGeneration', $generator);
        $request = $this->createMock(Request::class);
        $request->method('getBodyParams')->willReturn(array_replace(['prompt' => 'Contact form', 'name' => 'Contact', 'integrationUid' => 'vision'], $params));
        $request->method('getIsPost')->willReturn($post);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $user = new class($denied) {
            public function __construct(private ?string $denied) {}

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($permission): bool
            {
                return $permission !== $this->denied;
            }
        };
        \Craft::$app = \Yii::$app = new class($plugin, $request, $user) {
            public array $loadedModules;

            public function __construct($plugin, public Request $request, private object $user)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getRequest(): Request
            {
                return $this->request;
            }
        };
        $integrations = $this->getMockBuilder(IntegrationsService::class)->disableOriginalConstructor()->onlyMethods(['getAllIntegrations'])->getMock();
        $controller = $this->getMockBuilder(FormsController::class)->disableOriginalConstructor()->onlyMethods(['getIntegrationsService'])->getMock();
        $controller->request = $request;
        $controller->method('getIntegrationsService')->willReturn($integrations);

        return [$controller, $generator, $integrations];
    }
}
