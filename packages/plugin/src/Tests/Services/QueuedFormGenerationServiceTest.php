<?php

namespace Solspace\Freeform\Tests\Services;

use craft\console\User as UserComponent;
use craft\elements\User;
use craft\queue\LegacyJobWrapper;
use CraftCms\Cms\Config\GeneralConfig;
use Illuminate\Contracts\Bus\Dispatcher;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Jobs\GenerateFormJob;
use Solspace\Freeform\Library\AI\FormGenerationStore;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\FormGenerationService;
use Solspace\Freeform\Services\QueuedFormGenerationService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\base\Security;
use yii\di\Container;

#[CoversClass(QueuedFormGenerationService::class)]
#[CoversClass(GenerateFormJob::class)]
#[CoversClass(PermissionHelper::class)]
class QueuedFormGenerationServiceTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private mixed $previousYiiApp;
    private mixed $previousContainer;
    private string $directory;
    private QueuedFormGenerationService $service;
    private FormGenerationService $generator;
    private object $queue;
    private User $user;
    private UserComponent $component;
    private User $previousIdentity;
    private bool $permitted = true;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->previousContainer = \Craft::$container;
        $this->directory = sys_get_temp_dir().'/ff-ai-queue-'.bin2hex(random_bytes(8));
        $store = new FormGenerationStore($this->directory, 'queue-test-key', new Security());
        $this->service = $this->getMockBuilder(QueuedFormGenerationService::class)->onlyMethods(['store', 'permissionsForUser'])->getMock();
        $this->service->method('store')->willReturn($store);
        $this->service->method('permissionsForUser')->willReturnCallback(fn () => $this->permitted ? array_map('strtolower', [Freeform::PERMISSION_FORMS_CREATE, Freeform::PERMISSION_INTEGRATIONS_ACCESS, 'editSite:allowed', 'editSite:new']) : []);
        $this->generator = $this->createMock(FormGenerationService::class);
        $this->generator->method('validateRequest')->willReturn($this->createMock(AiIntegrationInterface::class));
        $this->user = $this->createMock(User::class);
        $this->user->id = 7;
        $this->user->active = true;
        $this->user->admin = false;
        $this->user->method('can')->willReturnCallback(fn () => $this->permitted);
        $this->previousIdentity = $this->createMock(User::class);
        $this->previousIdentity->admin = true;
        $identity = $this->previousIdentity;
        $this->component = $this->createMock(UserComponent::class);
        $this->component->method('getIdentity')->willReturnCallback(static function () use (&$identity) { return $identity; });
        $this->component->method('setIdentity')->willReturnCallback(static function ($user) use (&$identity) { $identity = $user; });
        $this->component->method('getIsAdmin')->willReturnCallback(static function () use (&$identity) { return $identity?->admin ?? false; });
        $this->component->method('checkPermission')->willReturnCallback(static function ($permission) use (&$identity) { return $identity?->can($permission) ?? false; });
        $this->queue = new class {
            public array $jobs = [];

            public function priority($priority): self
            {
                return $this;
            }

            public function delay($delay): self
            {
                return $this;
            }

            public function ttr($ttr): self
            {
                return $this;
            }

            public function push($job): string
            {
                $this->jobs[] = $job;

                return '1';
            }
        };
        app()->instance(GeneralConfig::class, new GeneralConfig());
        $bus = $this->createMock(Dispatcher::class);
        $bus->method('dispatch')->willReturnCallback(function ($job) {
            self::assertInstanceOf(LegacyJobWrapper::class, $job);
            self::assertSame(240, $job->timeout);

            return $this->queue->push($job->getLegacyJob());
        });
        app()->instance(Dispatcher::class, $bus);
        \Craft::$app = new class($this->component, $this->user, $this->queue) {
            public object $request;
            public object $sites;

            public function __construct(private UserComponent $component, private User $user, private object $queue)
            {
                $this->sites = new class {
                    public function getEditableSites(): array
                    {
                        return [(object) ['id' => 1], (object) ['id' => 2]];
                    }

                    public function getAllSites($disabled): array
                    {
                        return [(object) ['id' => 1, 'uid' => 'allowed'], (object) ['id' => 2, 'uid' => 'denied'], (object) ['id' => 3, 'uid' => 'new']];
                    }
                };
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
            }

            public function getSites(): object
            {
                return $this->sites;
            }

            public function getIsMultiSite(): bool
            {
                return true;
            }

            public function getUser(): UserComponent
            {
                return $this->component;
            }

            public function getUsers(): object
            {
                return new class($this->user) {
                    public function __construct(private User $user) {}

                    public function getUserById($id): User
                    {
                        return $this->user;
                    }
                };
            }

            public function getQueue(): object
            {
                return $this->queue;
            }
        };
        $plugin = $this->createMock(Freeform::class);
        app()->instance(Freeform::class, $plugin);
        $plugin->method('edition')->willReturn(new EditionHelper(Freeform::EDITION_PRO, Freeform::editions()));
        $plugin->method('__get')->with('formGeneration')->willReturn($this->generator);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        \Craft::$container = new Container();
        \Craft::$container->set(QueuedFormGenerationService::class, $this->service);
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
        \Craft::$container = $this->previousContainer;
        foreach (glob($this->directory.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->directory);
    }

    public function testStartReturnsBeforeProviderWorkAndWorkerRestoresInitiatingUserWithoutCliAdminPrivileges(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(42);
        $this->generator->expects(self::once())->method('generate')->willReturnCallback(function ($prompt, $name, $integrationUid, $timeout = 120, $files = [], $siteIds = null) use ($form) {
            self::assertSame($this->user, $this->component->getIdentity());
            self::assertFalse(PermissionHelper::isAdmin());
            self::assertSame('private prompt', $prompt);
            self::assertCount(1, $files);
            self::assertSame(base64_encode("%PDF-1.4\n%%EOF"), $files[0]->getBase64());
            self::assertSame([1], $siteIds);
            self::assertFalse(PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL));

            return $form;
        });
        $id = str_repeat('a', 32);
        $file = ReferenceFile::restore(['name' => 'reference-1.pdf', 'mimeType' => 'application/pdf', 'data' => base64_encode("%PDF-1.4\n%%EOF")]);
        self::assertSame(['status' => 'queued'], $this->service->start(7, $id, 'private prompt', null, 'integration', [$file]));
        self::assertCount(1, $this->queue->jobs);
        self::assertStringNotContainsString('private prompt', serialize($this->queue->jobs[0]));
        self::assertSame(240, $this->queue->jobs[0]->getTtr());
        $this->queue->jobs[0]->execute($this->queue);
        self::assertSame(['status' => 'complete', 'formId' => 42], $this->service->status(7, $id));
        self::assertSame($this->previousIdentity, $this->component->getIdentity());
        self::assertTrue(PermissionHelper::isAdmin());
        $this->queue->jobs[0]->execute($this->queue);
    }

    public function testRevokedPermissionStopsQueuedGeneration(): void
    {
        $this->generator->expects(self::never())->method('generate');
        $id = str_repeat('b', 32);
        $this->service->start(7, $id, 'prompt', null, 'integration', []);
        $this->permitted = false;
        $this->queue->jobs[0]->execute($this->queue);
        self::assertSame('failed', $this->service->status(7, $id)['status']);
        self::assertStringContainsString('no longer permitted', $this->service->status(7, $id)['message']);
        self::assertSame($this->previousIdentity, $this->component->getIdentity());
    }

    public function testWorkerFailureRestoresIdentityAndDoesNotExposeRawException(): void
    {
        $this->generator->method('generate')->willThrowException(new \RuntimeException('private SQL and prompt'));
        $id = str_repeat('c', 32);
        $this->service->start(7, $id, 'prompt', null, 'integration', []);
        $this->queue->jobs[0]->execute($this->queue);
        self::assertSame(['status' => 'failed', 'message' => ''], $this->service->status(7, $id));
        self::assertSame($this->previousIdentity, $this->component->getIdentity());
        self::assertTrue(PermissionHelper::isAdmin());
    }
}
