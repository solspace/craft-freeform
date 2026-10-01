<?php

namespace Solspace\Freeform\Tests\Services;

use Carbon\Carbon;
use craft\db\Connection;
use CraftCms\Cms\Config\GeneralConfig;
use Illuminate\Container\Container;
use Illuminate\Contracts\Bus\Dispatcher;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\RefreshFeedJob;
use Solspace\Freeform\Jobs\SendDigestJob;
use Solspace\Freeform\Records\FeedRecord;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\Pro\DigestService;
use Solspace\Freeform\Services\SettingsService;
use yii\caching\ArrayCache;
use yii\mutex\Mutex;

#[CoversClass(FreeformFeedService::class)]
#[CoversClass(RefreshFeedJob::class)]
class FreeformFeedServiceTest extends TestCase
{
    private mixed $previousApp;
    private Container $previousContainer;
    private mixed $previousYiiApp;
    private ArrayCache $cache;
    private FreeformFeedService $feed;
    private object $queue;
    private SettingsService $settings;
    private Connection $db;
    private Mutex $mutex;

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        Container::setInstance(new Container());
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->cache = new ArrayCache();
        $this->mutex = $this->createMock(Mutex::class);
        $this->db = $this->createMock(Connection::class);
        $this->settings = $this->createMock(SettingsService::class);
        $this->settings->method('isDisplayFeed')->willReturn(true);
        $this->settings->method('getQueuePriority')->willReturn(1024);
        $this->feed = $this->getMockBuilder(FreeformFeedService::class)->onlyMethods(['parseFeed'])->getMock();

        app()->instance(GeneralConfig::class, new GeneralConfig());
        $this->queue = new class {
            public array $jobs = [];
            public bool $reject = false;

            public function push(object $job): void
            {
                if ($this->reject) {
                    throw new \RuntimeException('Queue unavailable');
                }

                $this->jobs[] = $job;
            }
        };
        $dispatcher = $this->createMock(Dispatcher::class);
        $dispatcher->method('dispatch')->willReturnCallback(function ($job) {
            $this->queue->push($job->getLegacyJob());

            return null;
        });
        app()->instance(Dispatcher::class, $dispatcher);

        \Craft::$app = new class($this->cache, $this->mutex, $this->db, $this->queue) {
            public function __construct(
                private ArrayCache $cache,
                private Mutex $mutex,
                public Connection $db,
                private object $queue,
            ) {}

            public function getCache(): ArrayCache
            {
                return $this->cache;
            }

            public function getMutex(): Mutex
            {
                return $this->mutex;
            }

            public function getQueue(): object
            {
                return $this->queue;
            }
        };

        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->willReturnMap([
            ['settings', $this->settings],
            ['feed', $this->feed],
        ]);
        \Yii::$app = (object) ['charset' => 'UTF-8'];
        app()->instance(Freeform::class, $plugin);
    }

    protected function tearDown(): void
    {
        Container::setInstance($this->previousContainer);
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testFrontendQueuesOnceWithoutFetchingFeed(): void
    {
        $this->allowQueueing();
        $this->feed->expects(self::never())->method('parseFeed');

        $this->feed->queueFeedRefresh();
        $this->feed->queueFeedRefresh();

        self::assertCount(1, $this->queue->jobs);
        self::assertInstanceOf(RefreshFeedJob::class, $this->queue->jobs[0]);
        self::assertSame($this->queue->jobs[0]->token, $this->cache->get(FreeformFeedService::CACHE_KEY_QUEUED_FEED));
        self::assertFalse($this->cache->get(FreeformFeedService::CACHE_KEY_FEED));
    }

    public function testDisabledFeedSkipsDatabaseMutexAndQueue(): void
    {
        $settings = $this->createConfiguredMock(SettingsService::class, ['isDisplayFeed' => false]);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->with('settings')->willReturn($settings);
        app()->instance(Freeform::class, $plugin);
        $this->expectNoQueueing();

        $this->feed->queueFeedRefresh();

        self::assertSame([], $this->queue->jobs);
    }

    public function testFreshFeedSkipsDatabaseMutexAndQueue(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_FEED, time());
        $this->expectNoQueueing();

        $this->feed->queueFeedRefresh();

        self::assertSame([], $this->queue->jobs);
    }

    public function testExpiredFeedQueuesRefresh(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_FEED, time() - FreeformFeedService::CACHE_TTL_FEED);
        $this->allowQueueing();

        $this->feed->queueFeedRefresh();

        self::assertCount(1, $this->queue->jobs);
    }

    public function testAlreadyPendingJobSkipsDatabaseMutexAndQueue(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_QUEUED_FEED, 'existing-job');
        $this->expectNoQueueing();

        $this->feed->queueFeedRefresh();

        self::assertSame([], $this->queue->jobs);
    }

    public function testAnotherRequestHoldingMutexSkipsDatabaseAndQueue(): void
    {
        $this->mutex->expects(self::once())->method('acquire')->willReturn(false);
        $this->mutex->expects(self::never())->method('release');
        $this->db->expects(self::never())->method('tableExists');

        $this->feed->queueFeedRefresh();

        self::assertSame([], $this->queue->jobs);
    }

    public function testRechecksPendingJobAfterAcquiringMutex(): void
    {
        $this->mutex->expects(self::once())->method('acquire')
            ->willReturnCallback(function (): bool {
                $this->cache->set(FreeformFeedService::CACHE_KEY_QUEUED_FEED, 'concurrent-job');

                return true;
            })
        ;
        $this->mutex->expects(self::once())->method('release');
        $this->db->expects(self::never())->method('tableExists');

        $this->feed->queueFeedRefresh();

        self::assertSame([], $this->queue->jobs);
    }

    public function testRejectedQueuePushReleasesPendingMarker(): void
    {
        $this->queue->reject = true;
        $this->allowQueueing();

        $this->feed->queueFeedRefresh();

        self::assertFalse($this->cache->get(FreeformFeedService::CACHE_KEY_QUEUED_FEED));
        self::assertSame([], $this->queue->jobs);
    }

    public function testJobRefreshesFeedAndReleasesItsPendingMarker(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_QUEUED_FEED, 'job-token');
        $feed = $this->getMockBuilder(FreeformFeedService::class)->onlyMethods(['fetchFeed'])->getMock();
        $feed->expects(self::once())->method('fetchFeed');
        $this->setJobFeed($feed);

        (new RefreshFeedJob('job-token'))->execute($this->queue);

        self::assertFalse($this->cache->get(FreeformFeedService::CACHE_KEY_QUEUED_FEED));
    }

    public function testFailedJobReleasesItsPendingMarker(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_QUEUED_FEED, 'job-token');
        $feed = $this->getMockBuilder(FreeformFeedService::class)->onlyMethods(['fetchFeed'])->getMock();
        $feed->method('fetchFeed')->willThrowException(new \RuntimeException('Feed failed'));
        $this->setJobFeed($feed);

        try {
            (new RefreshFeedJob('job-token'))->execute($this->queue);
            self::fail('The job must report the failure to the queue.');
        } catch (\RuntimeException $exception) {
            self::assertSame('Feed failed', $exception->getMessage());
            self::assertFalse($this->cache->get(FreeformFeedService::CACHE_KEY_QUEUED_FEED));
        }
    }

    public function testOldJobCannotClearNewerPendingMarker(): void
    {
        $this->cache->set(FreeformFeedService::CACHE_KEY_QUEUED_FEED, 'new-token');

        $this->feed->releaseQueuedFeedRefresh('old-token');

        self::assertSame('new-token', $this->cache->get(FreeformFeedService::CACHE_KEY_QUEUED_FEED));
    }

    public function testDigestRefreshesFeedBeforeCollectingAdminAlertsWithoutControlPanelRequest(): void
    {
        $refDate = new Carbon('2026-10-01');
        $refreshed = false;
        $feed = $this->createMock(FreeformFeedService::class);
        $feed->expects(self::once())->method('fetchFeed')->willReturnCallback(static function () use (&$refreshed): void {
            $refreshed = true;
        });
        $digest = $this->createMock(DigestService::class);
        $digest->expects(self::once())->method('triggerDigest')->with($refDate)
            ->willReturnCallback(static function () use (&$refreshed): void {
                self::assertTrue($refreshed);
            })
        ;
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->willReturnMap([
            ['feed', $feed],
            ['digest', $digest],
        ]);
        app()->instance(Freeform::class, $plugin);

        (new SendDigestJob($refDate))->execute($this->queue);
    }

    private function setJobFeed(FreeformFeedService $feed): void
    {
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->with('feed')->willReturn($feed);
        app()->instance(Freeform::class, $plugin);
    }

    private function allowQueueing(): void
    {
        $this->mutex->expects(self::once())->method('acquire')->with(FreeformFeedService::LOCK_KEY_QUEUED_FEED, 0)->willReturn(true);
        $this->mutex->expects(self::once())->method('release')->with(FreeformFeedService::LOCK_KEY_QUEUED_FEED);
        $this->db->expects(self::once())->method('tableExists')->with(FeedRecord::TABLE)->willReturn(true);
    }

    private function expectNoQueueing(): void
    {
        $this->mutex->expects(self::never())->method('acquire');
        $this->db->expects(self::never())->method('tableExists');
    }
}
