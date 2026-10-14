<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\DuplicateCheckScope;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Bundles\Form\Limiting\ScopedDuplicateCheck;
use Solspace\Freeform\Bundles\Form\Tracking\Cookies;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use Solspace\Freeform\Models\Settings as PluginSettings;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;
use yii\base\Security;
use yii\db\Connection;
use yii\mutex\Mutex;
use yii\web\Cookie;
use yii\web\CookieCollection;
use yii\web\User;

#[CoversClass(ScopedDuplicateCheck::class)]
#[CoversClass(DuplicateCheckScope::class)]
class ScopedDuplicateCheckTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private ScopedDuplicateCheck $bundle;
    private ScopedDuplicateAppStub $app;
    private Form $form;
    private BehaviorSettings $behavior;
    private GeneralSettings $general;
    private HiddenField $scope;
    private EmailField $email;
    private PropertyBag $properties;
    private Submission $submission;
    private FormLayout $layout;
    private bool $lastPage = true;
    private bool $pageContainsScope = true;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $db = new Connection(['dsn' => 'sqlite::memory:']);
        $request = $this->createMock(Request::class);
        $request->method('getIsCpRequest')->willReturnCallback(fn () => $this->app->cp);
        $request->method('getIsConsoleRequest')->willReturnCallback(fn () => $this->app->console);
        $request->method('getIsSecureConnection')->willReturn(true);
        $request->method('getUserIP')->willReturn('192.0.2.1');
        $cookies = new CookieCollection();
        $request->method('getCookies')->willReturn($cookies);
        $user = $this->createMock(User::class);
        $user->method('getId')->willReturnCallback(fn () => $this->app->userId);
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('acquire')->willReturn(true);
        $mutex->method('release')->willReturn(true);
        $this->app = new ScopedDuplicateAppStub($db, $request, $user, $mutex);
        \Craft::$app = \Yii::$app = $this->app;
        $db->createCommand('CREATE TABLE elements (id INTEGER PRIMARY KEY, dateDeleted TEXT)')->execute();
        $db->createCommand('CREATE TABLE freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER, userId INTEGER, isSpam INTEGER, ip TEXT, duplicateCheckIdentity TEXT)')->execute();
        $db->createCommand('CREATE TABLE freeform_submissions_ratings_1 (id INTEGER PRIMARY KEY, product_id_10 TEXT COLLATE NOCASE, email_11 TEXT, other_email_12 TEXT)')->execute();

        $this->behavior = new BehaviorSettings();
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE;
        $this->behavior->duplicateCheckScopeField = 'scope-uid';
        $this->general = new GeneralSettings();
        $this->general->storeData = true;
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Settings::class, 'behavior'))->setValue($settings, $this->behavior);
        (new \ReflectionProperty(Settings::class, 'general'))->setValue($settings, $this->general);
        $this->layout = new FormLayout();
        $this->submission = $this->createMock(Submission::class);
        $this->form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->onlyMethods([
            'getId', 'getUid', 'getHandle', 'getSettings', 'getLayout', 'getProperties',
            'getCurrentPage', 'isLastPage', 'getSubmission', 'hasOptInPermission',
        ])->getMock();
        $this->form->method('getId')->willReturn(1);
        $this->form->method('getUid')->willReturn('form-uid');
        $this->form->method('getHandle')->willReturn('ratings');
        $this->form->method('getSettings')->willReturn($settings);
        $this->form->method('getLayout')->willReturn($this->layout);
        $this->properties = new PropertyBag($this->form);
        $this->form->method('getProperties')->willReturn($this->properties);
        $this->form->method('getSubmission')->willReturn($this->submission);
        $this->form->method('hasOptInPermission')->willReturn(true);
        $this->form->method('isLastPage')->willReturnCallback(fn () => $this->lastPage);
        $page = $this->createMock(Page::class);
        $page->method('getFields')->willReturnCallback(fn () => $this->pageContainsScope ? $this->layout->getFields() : new FieldCollection());
        $this->form->method('getCurrentPage')->willReturn($page);
        $this->scope = new HiddenField($this->form);
        $this->fieldProperties($this->scope, 10, 'scope-uid', 'productId');
        $this->scope->setValue('product-a');
        $this->email = new EmailField($this->form);
        $this->fieldProperties($this->email, 11, 'email-uid', 'email');
        $this->email->setValue('visitor@example.com');
        $otherEmail = new EmailField($this->form);
        $this->fieldProperties($otherEmail, 12, 'other-email-uid', 'otherEmail');
        $this->layout->getFields()->add($this->scope)->add($this->email)->add($otherEmail);
        $this->bundle = new ScopedDuplicateCheck();
    }

    protected function tearDown(): void
    {
        $this->bundle->afterSubmit(new SubmitEvent($this->form));
        foreach ([
            Form::EVENT_FORM_LOADED => 'prepareVisitor',
            Form::EVENT_CHECK_DUPLICATE => 'handleDuplicateCheck',
            Form::EVENT_REGISTER_CONTEXT => 'handleDuplicateCheck',
            Form::EVENT_PERSIST_STATE => 'handleDuplicateCheck',
            Form::EVENT_BEFORE_VALIDATE => 'handleDuplicateCheck',
            Form::EVENT_SUBMIT => 'beforeSubmit',
            Form::EVENT_AFTER_SUBMIT => 'afterSubmit',
        ] as $event => $handler) {
            Event::off(Form::class, $event, [$this->bundle, $handler]);
        }
        $this->app->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    #[TestWith([FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY])]
    #[TestWith([FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE])]
    #[TestWith([FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE])]
    public function testUserCanVoteOnceOnEachProduct(string $behavior): void
    {
        $this->behavior->duplicateCheck = $behavior;
        $this->app->userId = 42;
        $this->storeVote('product-a', userId: 42);
        self::assertTrue($this->form->isDuplicate());
        $this->scope->setValue('product-b');
        self::assertFalse($this->form->isDuplicate());
        $this->scope->setValue('product-a');
        $this->bundle->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertCount(1, $this->form->getErrors());
    }

    public function testScopeComparisonIsExactDespiteCaseInsensitiveDatabaseCollation(): void
    {
        $this->app->userId = 42;
        $this->storeVote('Product-A', userId: 42);
        self::assertFalse($this->form->isDuplicate());
        $this->scope->setValue('Product-A');
        self::assertTrue($this->form->isDuplicate());
    }

    public function testCookieIdentityIsStoredHashedAndReusedAcrossProductsAndRequests(): void
    {
        $this->bundle->prepareVisitor(new FormLoadedEvent($this->form));
        $cookie = $this->app->responseCookies->get('freeform_voter_1');
        self::assertNotNull($cookie);
        self::assertTrue($cookie->httpOnly);
        self::assertTrue($cookie->secure);
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertTrue($event->isValid);
        self::assertSame(hash('sha256', $cookie->value), $this->submission->duplicateCheckIdentity);
        $this->storeVote('product-a', identity: $this->submission->duplicateCheckIdentity);
        $this->bundle->afterSubmit($event);
        self::assertTrue($this->form->isDuplicate());
        $this->scope->setValue('product-b');
        self::assertFalse($this->form->isDuplicate());
        self::assertCount(1, $this->app->responseCookies);

        // A new request resolves the same identity from the validated incoming cookie.
        $this->app->request->getCookies()->add(new Cookie(['name' => $cookie->name, 'value' => $cookie->value]));
        $nextRequest = (new \ReflectionClass(ScopedDuplicateCheck::class))->newInstanceWithoutConstructor();
        $this->scope->setValue('product-a');
        $nextRequest->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertCount(1, $this->form->getErrors());
    }

    public function testDifferentVisitorsCanRateTheSameProduct(): void
    {
        $this->storeVote('product-a', userId: 99, identity: hash('sha256', 'another-browser'));
        $this->app->userId = 42;
        self::assertFalse($this->form->isDuplicate());
        $this->app->userId = null;
        $this->bundle->prepareVisitor(new FormLoadedEvent($this->form));
        self::assertFalse($this->form->isDuplicate());
    }

    public function testIpRestrictionIsScopedAndRequiresIpCollection(): void
    {
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE;
        $this->storeVote('product-a', ip: '192.0.2.1');
        $this->general->collectIpAddresses = false;
        self::assertFalse($this->form->isDuplicate());
        $this->general->collectIpAddresses = true;
        self::assertTrue($this->form->isDuplicate());
        $this->scope->setValue('product-b');
        self::assertFalse($this->form->isDuplicate());
    }

    public function testEmailRestrictionMatchesAcrossEmailFieldsWithinTheSameProduct(): void
    {
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_EMAIL;
        $this->storeVote('product-a', otherEmail: 'visitor@example.com');
        self::assertTrue($this->form->isDuplicate());
        $this->scope->setValue('product-b');
        self::assertFalse($this->form->isDuplicate());
    }

    public function testSpamDeletedAndOtherFormSubmissionsDoNotBlock(): void
    {
        $this->app->userId = 42;
        $this->storeVote('product-a', userId: 42, spam: true);
        $this->storeVote('product-a', userId: 42, deleted: true);
        $this->storeVote('product-a', userId: 42, formId: 2);
        self::assertFalse($this->form->isDuplicate());
    }

    #[TestWith([null])]
    #[TestWith([''])]
    #[TestWith(['   '])]
    #[TestWith([['product-a']])]
    public function testMissingOrNonscalarScopeCannotBeSubmitted(mixed $value): void
    {
        $this->scope->setValue($value);
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertFalse($event->isValid);
        self::assertNotEmpty($this->form->getErrors());
    }

    public function testZeroAndNormalizedNumbersAreValidScopes(): void
    {
        $this->app->userId = 42;
        $this->scope->setValue('0');
        $this->storeVote('0', userId: 42);
        self::assertTrue($this->form->isDuplicate());
        $number = new NumberField($this->form);
        $this->fieldProperties($number, 10, 'scope-uid', 'productId');
        $number->setValue('1.00');
        self::assertSame('1', DuplicateCheckScope::getValue($number));
        self::assertSame('1', DuplicateCheckScope::getValue($number, '1.0'));
        (new \ReflectionProperty(FieldCollection::class, 'fields'))->setValue($this->layout->getFields(), [$number, $this->email]);
        $this->storeVote('1.00', userId: 42);
        self::assertTrue($this->form->isDuplicate());
    }

    public function testScopeOnLaterPageIsRequiredAtFinalSubmission(): void
    {
        $this->scope->setValue(null);
        $this->lastPage = false;
        $this->pageContainsScope = false;
        $this->bundle->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertSame([], $this->form->getErrors());
        $this->lastPage = true;
        $this->bundle->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertCount(1, $this->form->getErrors());
        $this->bundle->beforeSubmit($event = new SubmitEvent($this->form));
        self::assertFalse($event->isValid);
    }

    public function testEmailScopeCannotBeSubmittedWithoutEmailIdentity(): void
    {
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_EMAIL;
        $this->email->setValue('');
        $this->bundle->beforeSubmit($event = new SubmitEvent($this->form));
        self::assertFalse($event->isValid);
        self::assertStringContainsString('email address', $this->form->getErrors()[0]);
    }

    #[TestWith([true, false])]
    #[TestWith([false, true])]
    public function testCpAndConsoleSubmissionsBypassScope(bool $cp, bool $console): void
    {
        $this->app->cp = $cp;
        $this->app->console = $console;
        $this->scope->setValue(null);
        $this->bundle->beforeSubmit($event = new SubmitEvent($this->form));
        self::assertTrue($event->isValid);
        self::assertCount(0, $this->app->responseCookies);
    }

    public function testInvalidFieldAndDisabledStorageFailClosed(): void
    {
        $this->behavior->duplicateCheckScopeField = 'deleted-field';
        $this->bundle->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertStringContainsString('unavailable', $this->form->getErrors()[0]);
        $this->behavior->duplicateCheckScopeField = 'scope-uid';
        $this->general->storeData = false;
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertFalse($event->isValid);
        self::assertStringContainsString('stored submissions', $this->form->getErrors()[1]);
    }

    public function testUnsupportedAndNestedFieldsCannotBeScope(): void
    {
        $table = new TableField($this->form);
        $this->fieldProperties($table, 20, 'table-uid', 'table');
        $this->layout->getFields()->add($table);
        $this->behavior->duplicateCheckScopeField = 'table-uid';
        self::assertNull(DuplicateCheckScope::getField($this->form));
        $this->behavior->duplicateCheckScopeField = 'scope-uid';
        $this->scope->setParentField($table);
        self::assertNull(DuplicateCheckScope::getField($this->form));
    }

    public function testTwigValuesAreRespectedBeforeRenderingButPostedValuesTakePrecedence(): void
    {
        $this->app->userId = 42;
        $this->storeVote('product-a', userId: 42);
        $this->properties->set('values', ['productId' => 'product-b']);
        self::assertFalse($this->form->isDuplicate());
        $this->form->setFormPosted(true);
        self::assertTrue($this->form->isDuplicate());
    }

    public function testLoginRequiredEvenWithNoPriorVote(): void
    {
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY;
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertFalse($event->isValid);
        self::assertStringContainsString('logged in', $this->form->getErrors()[0]);
    }

    public function testFinalCheckCatchesVoteSavedAfterInitialValidation(): void
    {
        $this->app->userId = 42;
        $this->bundle->handleDuplicateCheck(new ValidationEvent($this->form));
        self::assertSame([], $this->form->getErrors());
        // Another request saves a vote while this request is still validating.
        $this->storeVote('product-a', userId: 42);
        $mutex = $this->createMock(Mutex::class);
        $mutex->expects(self::once())->method('acquire')->willReturn(true);
        $mutex->expects(self::once())->method('release')->willReturn(true);
        $this->app->mutex = $mutex;
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertFalse($event->isValid);
    }

    public function testMutexFailureRejectsWithoutSaving(): void
    {
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('acquire')->willReturn(false);
        $mutex->expects(self::never())->method('release');
        $this->app->mutex = $mutex;
        $event = new SubmitEvent($this->form);
        $this->bundle->beforeSubmit($event);
        self::assertFalse($event->isValid);
        self::assertStringContainsString('being processed', $this->form->getErrors()[0]);
    }

    public function testBlankScopeKeepsLegacyBehaviorAndCookieName(): void
    {
        $this->behavior->duplicateCheckScopeField = null;
        self::assertFalse(DuplicateCheckScope::isEnabled($this->form));
        $this->bundle->prepareVisitor(new FormLoadedEvent($this->form));
        self::assertCount(0, $this->app->responseCookies);
        self::assertSame('form_posted_1', Cookies::getCookieName($this->form));
        $this->bundle->beforeSubmit($event = new SubmitEvent($this->form));
        self::assertTrue($event->isValid);
        $cookieName = Cookies::getCookieName($this->form);
        $previousCookie = $_COOKIE[$cookieName] ?? null;

        try {
            $_COOKIE[$cookieName] = time();
            $legacy = (new \ReflectionClass(FormLimiting::class))->newInstanceWithoutConstructor();
            $legacy->handleDuplicateCheck(new ValidationEvent($this->form));
            self::assertTrue($this->form->isDuplicate());
        } finally {
            if (null === $previousCookie) {
                unset($_COOKIE[$cookieName]);
            } else {
                $_COOKIE[$cookieName] = $previousCookie;
            }
        }
    }

    #[TestWith([FormLimiting::NO_LIMIT])]
    #[TestWith([FormLimiting::NO_LIMIT_LOGGED_IN_USERS_ONLY])]
    public function testUnlimitedModesIgnoreStoredScope(string $behavior): void
    {
        $this->behavior->duplicateCheck = $behavior;
        self::assertFalse(DuplicateCheckScope::isEnabled($this->form));
    }

    public function testEditingDoesNotBlockOrChangeIdentity(): void
    {
        $this->properties->set('submissionToken', 'existing-submission-token');
        $this->app->userId = 42;
        $this->storeVote('product-a', userId: 42);
        $this->submission->duplicateCheckIdentity = 'existing-identity';
        $this->bundle->beforeSubmit($event = new SubmitEvent($this->form));
        self::assertTrue($event->isValid);
        self::assertSame('existing-identity', $this->submission->duplicateCheckIdentity);
    }

    public function testEncryptedScopeAndEmailStillBlockMatchingVote(): void
    {
        $model = $this->createConfiguredMock(PluginSettings::class, ['getSessionContextSecret' => 'test-secret']);
        $settings = $this->createConfiguredMock(SettingsService::class, ['getSettingsModel' => $model]);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->with('settings')->willReturn($settings);
        $this->app->loadedModules[Freeform::class] = $plugin;
        $key = EncryptionHelper::getKey('form-uid');
        $this->behavior->duplicateCheck = FormLimiting::LIMIT_ONCE_PER_EMAIL;
        $this->storeVote(EncryptionHelper::encrypt($key, 'product-a'), email: EncryptionHelper::encrypt($key, 'visitor@example.com'));
        self::assertTrue($this->form->isDuplicate());
        $this->scope->setValue('product-b');
        self::assertFalse($this->form->isDuplicate());
    }

    private function fieldProperties(AbstractField $field, int $id, string $uid, string $handle): void
    {
        foreach (['id' => $id, 'uid' => $uid, 'handle' => $handle] as $property => $value) {
            (new \ReflectionProperty(AbstractField::class, $property))->setValue($field, $value);
        }
    }

    private function storeVote(string $scope, ?int $userId = null, ?string $identity = null, ?string $ip = null, ?string $email = null, ?string $otherEmail = null, bool $spam = false, bool $deleted = false, int $formId = 1): void
    {
        $db = $this->app->db;
        $db->createCommand()->insert('elements', ['dateDeleted' => $deleted ? '2026-10-14' : null])->execute();
        $id = $db->getLastInsertID();
        $db->createCommand()->insert('freeform_submissions', [
            'id' => $id, 'formId' => $formId, 'userId' => $userId, 'isSpam' => (int) $spam,
            'ip' => $ip, 'duplicateCheckIdentity' => $identity,
        ])->execute();
        $db->createCommand()->insert('freeform_submissions_ratings_1', [
            'id' => $id, 'product_id_10' => $scope, 'email_11' => $email, 'other_email_12' => $otherEmail,
        ])->execute();
    }
}

class ScopedDuplicateAppStub
{
    public bool $cp = false;
    public bool $console = false;
    public ?int $userId = null;
    public array $loadedModules = [];
    public string $charset = 'UTF-8';
    public CookieCollection $responseCookies;

    public function __construct(public Connection $db, public Request $request, public User $user, public Mutex $mutex)
    {
        $this->responseCookies = new CookieCollection();
    }

    public function getDb(): Connection
    {
        return $this->db;
    }

    public function getRequest(): Request
    {
        return $this->request;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getMutex(): Mutex
    {
        return $this->mutex;
    }

    public function getResponse(): self
    {
        return $this;
    }

    public function getCookies(): CookieCollection
    {
        return $this->responseCookies;
    }

    public function getConfig(): self
    {
        return $this;
    }

    public function getGeneral(): object
    {
        return (object) ['defaultCookieDomain' => '', 'sameSiteCookieValue' => 'Lax'];
    }

    public function getSecurity(): Security
    {
        return new Security();
    }
}
