<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Bundles\Form\Limiting\SubmissionLimit;
use Solspace\Freeform\Bundles\Form\Submissions\SubmissionLimiter;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SubmissionsService;
use Twig\Markup;
use yii\base\Event;
use yii\db\Connection;
use yii\mutex\Mutex;

#[CoversClass(SubmissionLimit::class)]
#[CoversClass(SubmissionLimiter::class)]
class SubmissionLimitTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private SubmissionLimitApp $app;
    private SubmissionLimiter $limiter;
    private BehaviorSettings $behavior;
    private GeneralSettings $general;
    private Form $form;
    private PropertyBag $properties;
    private Submission $submission;
    private SubmissionsService $submissions;
    private bool $optIn = true;
    private string $edition = Freeform::EDITION_LITE;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $db = new Connection(['dsn' => 'sqlite::memory:']);
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('acquire')->willReturn(true);
        $mutex->method('release')->willReturn(true);
        $this->app = new SubmissionLimitApp($db, $mutex);
        \Craft::$app = \Yii::$app = $this->app;

        $plugin = $this->createMock(Freeform::class);
        $plugin->method('edition')->willReturnCallback(fn () => new EditionHelper($this->edition, [Freeform::EDITION_EXPRESS, Freeform::EDITION_LITE, Freeform::EDITION_PRO]));
        $settingsService = $this->createMock(SettingsService::class);
        $settingsService->method('isSitesEnabled')->willReturn(false);
        $this->submissions = new SubmissionsService();
        $plugin->method('__get')->willReturnCallback(fn ($name) => ['submissions' => $this->submissions, 'settings' => $settingsService][$name] ?? null);
        $this->app->loadedModules = [Freeform::class => $plugin];

        $db->createCommand('CREATE TABLE elements (id INTEGER PRIMARY KEY, dateCreated TEXT, dateDeleted TEXT)')->execute();
        $db->createCommand('CREATE TABLE freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER, isSpam INTEGER, statusId INTEGER)')->execute();
        $this->behavior = new BehaviorSettings();
        $this->general = new GeneralSettings();
        $this->general->storeData = true;
        $this->general->formattingTemplate = 'test';
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Settings::class, 'behavior'))->setValue($settings, $this->behavior);
        (new \ReflectionProperty(Settings::class, 'general'))->setValue($settings, $this->general);
        $this->form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->onlyMethods([
            'getId', 'getSettings', 'getProperties', 'getSubmission', 'hasOptInPermission',
            'setProperties', 'isSubmittedSuccessfully', 'getFormHandler',
        ])->getMock();
        $this->form->method('getId')->willReturn(1);
        $this->form->method('getSettings')->willReturn($settings);
        $this->properties = new PropertyBag($this->form);
        $this->form->method('getProperties')->willReturn($this->properties);
        $this->form->method('setProperties')->willReturnCallback(function (?array $values = null) {
            $this->properties->merge($values ?? []);

            return $this->form;
        });
        $this->submission = $this->createMock(Submission::class);
        $this->form->method('getSubmission')->willReturn($this->submission);
        $this->form->method('hasOptInPermission')->willReturnCallback(fn () => $this->optIn);
        $translations = $this->createMock(TranslationProvider::class);
        $translations->method('getTranslation')->willReturnCallback(static fn ($form, $namespace, $handle, $value) => $value);
        (new \ReflectionProperty(Form::class, 'translationProvider'))->setValue($this->form, $translations);
        $this->limiter = new SubmissionLimiter();
        Carbon::setTestNow(new Carbon('2026-10-14T12:00:00-05:00'));
    }

    protected function tearDown(): void
    {
        $this->limiter->releaseLock(new SubmitEvent($this->form));
        Event::off(Form::class, Form::EVENT_SUBMIT);
        Event::off(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT);
        Carbon::setTestNow();
        $this->app->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testBuilderDefaultsAreDisabledAndAllControlsBelongToLimits(): void
    {
        self::assertNull(SubmissionLimit::resolve($this->form));
        foreach (['submissionLimitEnabled', 'submissionLimit', 'submissionLimitPeriod', 'submissionLimitMessage'] as $handle) {
            $property = new \ReflectionProperty(BehaviorSettings::class, $handle);
            self::assertSame('limits', $property->getAttributes(Section::class)[0]->newInstance()->handle);
            self::assertSame(Edition::LITE, $property->getAttributes(Edition::class)[0]->newInstance()->name);
        }
    }

    #[TestWith([Freeform::EDITION_EXPRESS, false])]
    #[TestWith([Freeform::EDITION_LITE, true])]
    #[TestWith([Freeform::EDITION_PRO, true])]
    public function testBuilderLimitsRequireLiteButLegacyLimitsStillWork(string $edition, bool $enabled): void
    {
        $this->edition = $edition;
        $this->enable(1);
        self::assertSame($enabled, null !== SubmissionLimit::resolve($this->form));
        $this->properties->set('submissionLimit', 2);
        self::assertSame(['limit' => 2, 'period' => 'total'], SubmissionLimit::resolve($this->form));
    }

    public function testTemplateOverridesKeepAllTimeSemanticsAndExplicitNullDisablesLimit(): void
    {
        $this->enable(10, 'day');
        $this->properties->set('submissionLimit', '50');
        self::assertSame(['limit' => 50, 'period' => 'total'], SubmissionLimit::resolve($this->form));
        $this->properties->set('submissionLimitPeriod', 'month');
        self::assertSame(['limit' => 50, 'period' => 'month'], SubmissionLimit::resolve($this->form));
        $this->properties->set('submissionLimit', null);
        self::assertNull(SubmissionLimit::resolve($this->form));
        self::assertFalse($this->form->isSubmissionLimitReached());
    }

    public function testZeroLegacyLimitClosesAndInvalidOverridesCannotRemoveBuilderLimit(): void
    {
        $this->enable(50);
        foreach ([0, -1, 'invalid'] as $value) {
            $this->properties->set('submissionLimit', $value);
            self::assertTrue($this->form->isSubmissionLimitReached());
        }
    }

    public function testLargeIntegerAndFractionalLegacyLimitsKeepTheirNumericMeaning(): void
    {
        $this->properties->set('submissionLimit', \PHP_INT_MAX);
        self::assertSame(\PHP_INT_MAX, SubmissionLimit::resolve($this->form)['limit']);
        $this->properties->set('submissionLimit', 1.5);
        self::assertSame(2, SubmissionLimit::resolve($this->form)['limit']);
    }

    public function testBuilderMessageUsesFormTranslationsAndTemplateMessageTakesPrecedence(): void
    {
        $this->enable(1);
        $translations = $this->createMock(TranslationProvider::class);
        $translations->expects(self::once())->method('getTranslation')->with($this->form, 'behavior', 'submissionLimitMessage', 'Submission limit reached')->willReturn('Capacité atteinte');
        (new \ReflectionProperty(Form::class, 'translationProvider'))->setValue($this->form, $translations);
        self::assertSame('Capacité atteinte', $this->form->getSubmissionLimitMessage());
        $this->properties->set('submissionLimitMessage', 'Custom template message');
        self::assertSame('Custom template message', $this->form->getSubmissionLimitMessage());
    }

    public function testCountsExcludeSpamDeletedAndOtherFormsButIncludeEveryStatus(): void
    {
        $this->enable(2);
        $this->store(1);
        $this->store(2, status: 2);
        $this->store(3, spam: true);
        $this->store(4, deleted: true);
        $this->store(5, formId: 2);
        self::assertSame(2, $this->form->getSubmissionLimitCount());
        self::assertTrue($this->form->isSubmissionLimitReached());
        $this->app->db->createCommand()->update('elements', ['dateDeleted' => '2026-10-14 18:00:00'], ['id' => 1])->execute();
        self::assertFalse($this->form->isSubmissionLimitReached());
        $this->app->db->createCommand()->update('elements', ['dateDeleted' => null], ['id' => 1])->execute();
        self::assertTrue($this->form->isSubmissionLimitReached());
    }

    public function testDailyCountsUseUtcBoundariesAndDoNotChangeLegacyAllTimeCount(): void
    {
        $this->enable(2, 'day');
        $this->store(1, date: '2026-10-14 04:59:59');
        $this->store(2, date: '2026-10-14 05:00:00');
        $this->store(3, date: '2026-10-15 04:59:59');
        $this->store(4, date: '2026-10-15 05:00:00');
        self::assertSame(2, $this->form->getSubmissionLimitCount());
        self::assertSame(4, $this->submissions->getSubmissionCount([1]));
        $this->properties->set('submissionLimit', 3);
        self::assertSame(4, $this->form->getSubmissionLimitCount());
    }

    #[TestWith(['day', '2026-10-14', '2026-10-15'])]
    #[TestWith(['week', '2026-10-12', '2026-10-19'])]
    #[TestWith(['month', '2026-10-01', '2026-11-01'])]
    #[TestWith(['year', '2026-01-01', '2027-01-01'])]
    public function testPeriodBounds(string $period, string $start, string $end): void
    {
        [$from, $until] = SubmissionLimit::getPeriodRange($period, Carbon::now(), new \DateTimeZone('America/Winnipeg'), 1);
        self::assertSame($start.' 00:00', $from->format('Y-m-d H:i'));
        self::assertSame($end.' 00:00', $until->format('Y-m-d H:i'));
    }

    public function testWeeklyPeriodsHonorConfiguredSundayStart(): void
    {
        $this->app->weekStart = 0;
        [$start, $end] = SubmissionLimit::getPeriodRange('week');
        self::assertSame('2026-10-11', $start->format('Y-m-d'));
        self::assertSame('2026-10-18', $end->format('Y-m-d'));
    }

    #[TestWith(['2025-03-09T12:00:00-05:00', 23])]
    #[TestWith(['2025-11-02T12:00:00-06:00', 25])]
    public function testDailyPeriodsRespectDaylightSaving(string $now, int $hours): void
    {
        [$start, $end] = SubmissionLimit::getPeriodRange('day', new \DateTimeImmutable($now), new \DateTimeZone('America/Winnipeg'));
        self::assertSame($hours * 3600, $end->getTimestamp() - $start->getTimestamp());
    }

    public function testBuilderRenderHidesFullFormWithEscapedMessageAndBlankHidesCompletely(): void
    {
        $this->enable(1);
        $this->store(1);
        $this->behavior->submissionLimitMessage = "<script>bad()</script>\nFull";
        $this->form->expects(self::never())->method('getFormHandler');
        self::assertFalse($this->form->isAvailable());
        $html = (string) $this->form->render();
        self::assertStringContainsString('freeform-submission-limit-message', $html);
        self::assertStringContainsString('&lt;script&gt;', $html);
        self::assertStringContainsString('<br />', $html);
        self::assertStringNotContainsString('<form', $html);
        self::assertNull($this->form->render(['submissionLimitMessage' => '']));
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testTemplateOnlyRenderAndSuccessfulSubmitRetainNormalRendering(bool $success): void
    {
        $this->properties->set('submissionLimit', 1);
        $this->store(1);
        $this->behavior->submissionLimitEnabled = $success;
        $this->form->method('isSubmittedSuccessfully')->willReturn($success);
        $handler = $this->createMock(FormHandlerInterface::class);
        $handler->expects(self::once())->method('renderFormTemplate')->willReturn(new Markup('<form>normal</form>', 'UTF-8'));
        $this->form->method('getFormHandler')->willReturn($handler);
        self::assertSame('<form>normal</form>', (string) $this->form->render());
    }

    public function testSubmitAtLimitRejectsLegacyAndBuilderWithCustomMessage(): void
    {
        $this->enable(1);
        $this->store(1);
        $this->properties->set('submissionLimitMessage', 'Sold out');
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
        self::assertContains('Sold out', $this->form->getErrors());
    }

    public function testRecheckSeesSubmissionThatArrivedAfterRendering(): void
    {
        $this->enable(1);
        self::assertFalse($this->form->isSubmissionLimitReached());
        $this->store(1);
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
    }

    public function testSuccessfulCheckHoldsLockUntilSubmitAttemptFinishes(): void
    {
        $this->enable(1);
        $this->app->mutex = $this->createMock(Mutex::class);
        $this->app->mutex->expects(self::once())->method('acquire')->with('freeform-submission-limit-1', 10)->willReturn(true);
        $this->app->mutex->expects(self::once())->method('release')->with('freeform-submission-limit-1')->willReturn(true);
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertTrue($event->isValid);
        Event::trigger(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, $event);
    }

    public function testQuotaUsesTheStoredCreationPeriodWhenRequestCrossesMidnight(): void
    {
        $this->enable(1, 'day');
        $this->store(1);
        $this->submission->dateCreated = new Carbon('2026-10-14T23:59:59-05:00');
        Carbon::setTestNow(new Carbon('2026-10-15T00:00:01-05:00'));
        self::assertSame(0, $this->form->getSubmissionLimitCount());
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testCancelledOrThrowingLaterListenerStillReleasesLock(bool $throws): void
    {
        $this->enable(1);
        $this->app->mutex = $this->createMock(Mutex::class);
        $this->app->mutex->method('acquire')->willReturn(true);
        $this->app->mutex->expects(self::once())->method('release')->willReturn(true);
        Event::on(Form::class, Form::EVENT_SUBMIT, static function (SubmitEvent $event) use ($throws) {
            if ($throws) {
                throw new \RuntimeException('Later listener failed');
            }
            $event->isValid = false;
        });

        try {
            $this->submissions->handleSubmission($this->form);
            self::assertFalse($throws);
        } catch (\RuntimeException $exception) {
            self::assertTrue($throws);
            self::assertSame('Later listener failed', $exception->getMessage());
        }
    }

    public function testMutexFailureRejectsInsteadOfOversubscribing(): void
    {
        $this->enable(1);
        $this->app->mutex = $this->createMock(Mutex::class);
        $this->app->mutex->method('acquire')->willReturn(false);
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
    }

    public function testEditingAnExistingSubmissionDoesNotConsumeCapacity(): void
    {
        $this->enable(1);
        $this->store(1);
        $this->submission->id = 1;
        self::assertFalse($this->form->isSubmissionLimitReached());
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertTrue($event->isValid);
    }

    public function testBuilderRequiresStorageAndOptInButLegacyStorageBehaviorIsUnchanged(): void
    {
        $this->enable(50);
        $this->general->storeData = false;
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
        $this->general->storeData = true;
        $this->optIn = false;
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertFalse($event->isValid);
        $this->behavior->submissionLimitEnabled = false;
        $this->properties->set('submissionLimit', 50);
        $event = new SubmitEvent($this->form);
        $this->limiter->handleLimit($event);
        self::assertTrue($event->isValid);
    }

    #[TestWith([0])]
    #[TestWith([-1])]
    #[TestWith([1.5])]
    #[TestWith(['not-a-number'])]
    public function testBuilderRejectsInvalidQuota(mixed $value): void
    {
        self::assertArrayHasKey('submissionLimit', SubmissionLimit::validateSettings((object) ['submissionLimitEnabled' => true, 'submissionLimit' => $value]));
    }

    public function testSettingsRejectBadPeriodAndDisabledStorageAndAllowDisabledLimits(): void
    {
        $settings = (object) ['submissionLimitEnabled' => true, 'submissionLimit' => 2, 'submissionLimitPeriod' => 'invalid'];
        $errors = SubmissionLimit::validateSettings($settings, false);
        self::assertArrayHasKey('submissionLimitPeriod', $errors);
        self::assertArrayHasKey('submissionLimitEnabled', $errors);
        $settings->submissionLimitEnabled = false;
        self::assertSame([], SubmissionLimit::validateSettings($settings, false));
    }

    private function enable(int $count, string $period = 'total'): void
    {
        $this->behavior->submissionLimitEnabled = true;
        $this->behavior->submissionLimit = $count;
        $this->behavior->submissionLimitPeriod = $period;
    }

    private function store(int $id, string $date = '2026-10-14 17:00:00', bool $spam = false, bool $deleted = false, int $formId = 1, int $status = 1): void
    {
        $this->app->db->createCommand()->insert('elements', ['id' => $id, 'dateCreated' => $date, 'dateDeleted' => $deleted ? $date : null])->execute();
        $this->app->db->createCommand()->insert('freeform_submissions', ['id' => $id, 'formId' => $formId, 'isSpam' => (int) $spam, 'statusId' => $status])->execute();
    }
}

class SubmissionLimitApp
{
    public array $loadedModules = [];
    public int $weekStart = 1;

    public function __construct(public Connection $db, public Mutex $mutex) {}

    public function getDb(): Connection
    {
        return $this->db;
    }

    public function getMutex(): Mutex
    {
        return $this->mutex;
    }

    public function getTimeZone(): string
    {
        return 'America/Winnipeg';
    }

    public function getConfig(): self
    {
        return $this;
    }

    public function getGeneral(): object
    {
        return (object) ['defaultWeekStartDay' => $this->weekStart];
    }
}
