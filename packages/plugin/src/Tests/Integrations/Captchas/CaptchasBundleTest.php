<?php

namespace Solspace\Freeform\Tests\Integrations\Captchas;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Integrations\Single\FormMonitor\Providers\FormMonitorProvider;
use Solspace\Freeform\Library\DataObjects\DisabledFunctionality;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

#[CoversClass(CaptchasBundle::class)]
class CaptchasBundleTest extends TestCase
{
    #[RunInSeparateProcess]
    public function testManualCaptchaRenderingOnlySuppressesAutomaticMarkupForThatForm(): void
    {
        $markup = '<div data-captcha></div>';
        $captcha = $this->createStub(CaptchaIntegrationInterface::class);
        $captcha->method('getHtmlTag')->willReturn($markup);
        $captcha->method('getScriptPaths')->willReturn([]);
        $integrations = $this->createStub(FormIntegrationsProvider::class);
        $integrations->method('getForForm')->willReturn([$captcha]);

        new CaptchasBundle(
            $integrations,
            $this->createStub(SettingsService::class),
            $this->createStub(FormMonitorProvider::class),
        );

        $manualForm = $this->createForm();
        $manualRender = new RenderTagEvent($manualForm);
        Event::trigger(Form::class, Form::EVENT_RENDER_CAPTCHAS, $manualRender);
        self::assertSame([$markup], $manualRender->getChunks());

        $manualFormClosingTag = new RenderTagEvent($manualForm);
        Event::trigger(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, $manualFormClosingTag);
        self::assertSame([], $manualFormClosingTag->getChunks());

        $automaticFormClosingTag = new RenderTagEvent($this->createForm());
        Event::trigger(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, $automaticFormClosingTag);
        self::assertSame([$markup], $automaticFormClosingTag->getChunks());
    }

    private function createForm(): Form
    {
        $form = $this->createStub(Regular::class);
        $form->method('isLastPage')->willReturn(true);
        $form->method('isDisabled')->willReturn(new DisabledFunctionality());

        return $form;
    }
}
