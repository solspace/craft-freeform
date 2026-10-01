<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use Carbon\Carbon;
use craft\web\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Headless\HeadlessResponseHelper;
use Solspace\Freeform\Services\Headless\HeadlessStateService;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfile;

#[CoversClass(HeadlessResponseHelper::class)]
class HeadlessResponseHelperTest extends TestCase
{
    private HeadlessResponseHelper $helper;

    private mixed $previousYiiApp = null;

    protected function setUp(): void
    {
        $this->helper = new HeadlessResponseHelper(
            $this->createMock(HeadlessStateService::class),
        );
        $this->previousYiiApp = \Yii::$app;
        \Yii::$app = new class {
            public string $charset = 'UTF-8';
        };
    }

    protected function tearDown(): void
    {
        \Yii::$app = $this->previousYiiApp;
    }

    public function testApplyNoStoreSetsCacheControl(): void
    {
        $response = new Response();

        $this->helper->applyNoStore($response);

        self::assertSame('no-store', $response->getHeaders()->get('Cache-Control'));
    }

    public function testApplyPublicManifestCacheSetsEtagAndMaxAge(): void
    {
        $response = new Response();

        $form = $this->createMock(Form::class);
        $form->method('getUid')->willReturn('uid-abc');
        $form->method('getDateUpdated')->willReturn(Carbon::createFromTimestamp(1700000000));

        $this->helper->applyPublicManifestCache($response, $form);

        self::assertSame('public, max-age=300', $response->getHeaders()->get('Cache-Control'));
        self::assertSame('"freeform-form-uid-abc-1700000000"', $response->getHeaders()->get('ETag'));
        self::assertSame('Origin', $response->getHeaders()->get('Vary'));
    }

    public function testApplyProfileManifestCacheUsesProfileSetting(): void
    {
        $response = new Response();

        $profile = new HeadlessProfile(
            name: 'event-registration',
            formHandle: 'contactForm',
            cache: 'private, no-store',
        );

        $this->helper->applyProfileManifestCache($response, $profile);

        self::assertSame('private, no-store', $response->getHeaders()->get('Cache-Control'));
        self::assertSame('Origin', $response->getHeaders()->get('Vary'));
    }

    public function testBuildManifestEtagIncludesUidAndUpdatedTimestamp(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getUid')->willReturn('form-uid');
        $form->method('getDateUpdated')->willReturn(Carbon::createFromTimestamp(1700000000));

        self::assertSame(
            '"freeform-form-form-uid-1700000000"',
            $this->helper->buildManifestEtag($form)
        );
    }

    public function testBuildSubmitResponseNotImplemented(): void
    {
        $form = $this->createMock(Form::class);
        $result = $this->helper->buildSubmitResponse($form, 'saveDraft', true);

        self::assertFalse($result['success']);
        self::assertSame('not_implemented', $result['status']);
        self::assertFalse($result['complete']);
        self::assertContains('This intent is not implemented yet.', $result['errors']['form']);
    }
}
