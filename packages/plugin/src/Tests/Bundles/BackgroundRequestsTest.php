<?php

namespace Solspace\Freeform\Tests\Bundles;

use craft\web\Application;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Digest\DigestBundle;
use Solspace\Freeform\Bundles\Feed\FeedBundle;
use Solspace\Freeform\Bundles\Notifications\Export\ExportNotifications;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\LockService;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;
use yii\web\Response;

#[CoversClass(FeedBundle::class)]
#[CoversClass(FreeformFeedService::class)]
#[CoversClass(DigestBundle::class)]
#[CoversClass(ExportNotifications::class)]
class BackgroundRequestsTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private array $handlers = [];

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        \Yii::$app = (object) ['loadedModules' => [], 'charset' => 'UTF-8'];
    }

    protected function tearDown(): void
    {
        foreach ($this->handlers as $handler) {
            Event::off(Response::class, Response::EVENT_AFTER_SEND, $handler);
            Event::off(Application::class, Application::EVENT_AFTER_REQUEST, $handler);
        }

        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    #[TestWith([false, false])]
    #[TestWith([true, false])]
    #[TestWith([false, true])]
    public function testFeedOnlyRefreshesAutomaticallyInControlPanel(bool $console, bool $cp): void
    {
        $this->setRequest($console, $cp);
        $feed = $this->createMock(FreeformFeedService::class);
        $feed->expects($cp && !$console ? self::once() : self::never())->method('fetchFeed');

        $plugin = $this->createMock(Freeform::class);
        $plugin->expects($cp && !$console ? self::once() : self::never())
            ->method('__get')->with('feed')->willReturn($feed)
        ;
        \Yii::$app->loadedModules[Freeform::class] = $plugin;

        new FeedBundle();
    }

    public function testDisabledFeedDoesNotAccessDatabaseOrParseFeed(): void
    {
        // The application deliberately has no database component.
        $this->setRequest(false, true);
        $settings = $this->createConfiguredMock(SettingsService::class, ['isDisplayFeed' => false]);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->with('settings')->willReturn($settings);
        \Yii::$app->loadedModules[Freeform::class] = $plugin;

        $feed = $this->getMockBuilder(FreeformFeedService::class)->onlyMethods(['parseFeed'])->getMock();
        $feed->expects(self::never())->method('parseFeed');
        $feed->fetchFeed();
    }

    public function testDigestJobCanStillRefreshFeedInConsole(): void
    {
        $this->setRequest(true, false);
        $settings = $this->createConfiguredMock(SettingsService::class, ['isDisplayFeed' => true]);
        $lock = $this->createMock(LockService::class);
        $lock->expects(self::once())->method('isLockedWithGuard')
            ->with(FreeformFeedService::CACHE_KEY_FEED, FreeformFeedService::LOCK_KEY_FEED, FreeformFeedService::CACHE_TTL_FEED)
            ->willReturn(false)
        ;
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->willReturnMap([
            ['settings', $settings],
            ['lock', $lock],
        ]);
        \Yii::$app->loadedModules[Freeform::class] = $plugin;
        \Craft::$app->db = new class {
            public function tableExists(string $table): bool
            {
                return true;
            }
        };

        $feed = $this->getMockBuilder(FreeformFeedService::class)->onlyMethods(['parseFeed'])->getMock();
        $feed->expects(self::once())->method('parseFeed');
        $feed->fetchFeed();
    }

    public function testExportsRunAfterResponseContentIsSent(): void
    {
        $this->setRequest(false, false);
        $response = new BackgroundResponseStub();
        $bundle = $this->getMockBuilder(ExportNotifications::class)
            ->disableOriginalConstructor()->onlyMethods(['handleNotifications'])->getMock()
        ;
        $bundle->expects(self::once())->method('handleNotifications')
            ->willReturnCallback(static function () use ($response): void {
                self::assertTrue($response->contentSent);
            })
        ;
        $this->handlers[] = [$bundle, 'handleNotifications'];
        $bundle->__construct($this->createMock(NotificationLoggerProvider::class));

        Event::trigger(Application::class, Application::EVENT_AFTER_REQUEST);
        $response->send();
    }

    public function testConsoleDoesNotRegisterAutomaticExportHandler(): void
    {
        $this->setRequest(true, false);
        $bundle = $this->getMockBuilder(ExportNotifications::class)
            ->disableOriginalConstructor()->onlyMethods(['handleNotifications'])->getMock()
        ;
        $bundle->expects(self::never())->method('handleNotifications');
        $this->handlers[] = [$bundle, 'handleNotifications'];
        $bundle->__construct($this->createMock(NotificationLoggerProvider::class));

        (new BackgroundResponseStub())->send();
    }

    public function testDigestIsQueuedBeforeResponsePreparationForCraftAutomaticQueueRunner(): void
    {
        $this->setRequest(false, false);
        $response = new BackgroundResponseStub();
        $this->setInstalledPlugin();
        $bundle = $this->getMockBuilder(DigestBundle::class)
            ->disableOriginalConstructor()->onlyMethods(['triggerDigest'])->getMock()
        ;
        $bundle->expects(self::once())->method('triggerDigest')
            ->willReturnCallback(static function () use ($response): void {
                self::assertFalse($response->contentSent);
            })
        ;
        $this->handlers[] = [$bundle, 'triggerDigest'];
        $bundle->__construct();

        Event::trigger(Application::class, Application::EVENT_AFTER_REQUEST);
        $response->send();
    }

    #[TestWith([true, true])]
    #[TestWith([false, false])]
    public function testDigestDoesNotRegisterForConsoleOrUninstalledPlugin(bool $console, bool $installed): void
    {
        $this->setRequest($console, false);
        $this->setInstalledPlugin($installed);
        $bundle = $this->getMockBuilder(DigestBundle::class)
            ->disableOriginalConstructor()->onlyMethods(['triggerDigest'])->getMock()
        ;
        $bundle->expects(self::never())->method('triggerDigest');
        $this->handlers[] = [$bundle, 'triggerDigest'];
        $bundle->__construct();

        Event::trigger(Application::class, Application::EVENT_AFTER_REQUEST);
        (new BackgroundResponseStub())->send();
    }

    public function testUnusedDigestDoesNotAccessDatabaseOrQueue(): void
    {
        // Missing database/queue components make any unnecessary access fail.
        $this->setRequest(false, false);
        $settings = $this->createMock(SettingsService::class);
        $settings->method('getDigestRecipients')->willReturn(new RecipientCollection());
        $settings->method('getClientDigestRecipients')->willReturn(new RecipientCollection());
        $plugin = $this->createMock(Freeform::class);
        $plugin->isInstalled = true;
        $plugin->method('__get')->willReturnMap([
            ['settings', $settings],
        ]);
        \Yii::$app->loadedModules[Freeform::class] = $plugin;

        $bundle = new DigestBundle();
        $this->handlers[] = [$bundle, 'triggerDigest'];
        Event::trigger(Application::class, Application::EVENT_AFTER_REQUEST);
        $response = new BackgroundResponseStub();
        $response->send();
        self::assertTrue($response->contentSent);
    }

    private function setRequest(bool $console, bool $cp): void
    {
        $request = new class($console, $cp) {
            public function __construct(private bool $console, private bool $cp) {}

            public function getIsConsoleRequest(): bool
            {
                return $this->console;
            }

            public function getIsCpRequest(): bool
            {
                if ($this->console) {
                    throw new \LogicException('Console requests cannot check the CP route.');
                }

                return $this->cp;
            }
        };

        \Craft::$app = new class($request) {
            public ?object $db = null;

            public function __construct(public object $request) {}

            public function getRequest(): object
            {
                return $this->request;
            }
        };
    }

    private function setInstalledPlugin(bool $installed = true): void
    {
        $plugin = $this->createMock(Freeform::class);
        $plugin->isInstalled = $installed;
        \Yii::$app->loadedModules[Freeform::class] = $plugin;
    }
}

class BackgroundResponseStub extends Response
{
    public $format = self::FORMAT_RAW;

    public bool $contentSent = false;

    protected function sendHeaders(): void {}

    protected function sendContent(): void
    {
        $this->contentSent = true;
    }
}
