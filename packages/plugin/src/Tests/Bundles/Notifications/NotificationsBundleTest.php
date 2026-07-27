<?php

namespace Solspace\Freeform\Tests\Bundles\Notifications;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Notifications\NotificationsBundle;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;

#[CoversClass(NotificationsBundle::class)]
class NotificationsBundleTest extends TestCase
{
    private mixed $app;

    protected function setUp(): void
    {
        $this->app = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->app;
    }

    public function testNotificationSiteIdPrefersSubmissionSite(): void
    {
        \Craft::$app = new NotificationsBundleCraftAppStub(3);

        $form = $this->createConfiguredMock(Form::class, ['getSiteId' => 2]);

        $submission = $this->createSubmission();
        $submission->siteId = 1;

        $this->assertSame(1, $this->getNotificationSiteId($form, $submission));
    }

    public function testNotificationSiteIdFallsBackToFormSite(): void
    {
        \Craft::$app = new NotificationsBundleCraftAppStub(3);

        $form = $this->createConfiguredMock(Form::class, ['getSiteId' => 2]);

        $submission = $this->createSubmission();

        $this->assertSame(2, $this->getNotificationSiteId($form, $submission));
    }

    public function testNotificationSiteIdFallsBackToCurrentSite(): void
    {
        \Craft::$app = new NotificationsBundleCraftAppStub(3);

        $form = $this->createConfiguredMock(Form::class, ['getSiteId' => null]);

        $submission = $this->createSubmission();

        $this->assertSame(3, $this->getNotificationSiteId($form, $submission));
    }

    private function getNotificationSiteId(Form $form, Submission $submission): int
    {
        $reflection = new \ReflectionClass(NotificationsBundle::class);
        $bundle = $reflection->newInstanceWithoutConstructor();
        $method = $reflection->getMethod('getNotificationSiteId');

        return $method->invoke($bundle, $form, $submission);
    }

    private function createSubmission(): Submission
    {
        return $this
            ->getMockBuilder(Submission::class)
            ->disableOriginalConstructor()
            ->getMock()
        ;
    }
}

class NotificationsBundleCraftAppStub
{
    public function __construct(private int $currentSiteId) {}

    public function getSites(): NotificationsBundleSitesStub
    {
        return new NotificationsBundleSitesStub($this->currentSiteId);
    }
}

class NotificationsBundleSitesStub
{
    public function __construct(private int $currentSiteId) {}

    public function getCurrentSite(): NotificationsBundleSiteStub
    {
        return new NotificationsBundleSiteStub($this->currentSiteId);
    }
}

class NotificationsBundleSiteStub
{
    public function __construct(public int $id) {}
}
