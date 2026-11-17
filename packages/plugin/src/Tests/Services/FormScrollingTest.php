<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Attributes\FormAttributesBundle;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

/**
 * @coversNothing
 */
class FormScrollingTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([true, true])]
    #[TestWith([true, false])]
    #[TestWith([false, true])]
    #[TestWith([false, false])]
    public function testOneSettingControlsBothAjaxAndFullPageScrolling(bool $enabled, bool $ajax): void
    {
        $settings = new Settings(['autoScrollToErrors' => $enabled ? 'true' : 'false', 'autoScroll' => $enabled ? 'false' : 'true']);
        $provider = $this->getMockBuilder(SettingsService::class)->onlyMethods(['getSettingsModel'])->getMock();
        $provider->method('getSettingsModel')->willReturn($settings);
        $forms = $this->getMockBuilder(FormsService::class)->disableOriginalConstructor()->onlyMethods(['getSettingsService'])->getMock();
        $forms->method('getSettingsService')->willReturn($provider);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnCallback(static fn ($name) => 'forms' === $name ? $forms : $provider);
        app()->instance(Freeform::class, $plugin);
        $behavior = (new \ReflectionClass(BehaviorSettings::class))->newInstanceWithoutConstructor();
        $formSettings = $this->createStub(FormSettings::class);
        $formSettings->method('getBehavior')->willReturn($behavior);
        $form = $this->createStub(Form::class);
        $form->method('getSettings')->willReturn($formSettings);
        $form->method('isAjaxEnabled')->willReturn($ajax);
        $form->method('isFormPosted')->willReturn(true);
        $form->method('getLayout')->willReturn(new FormLayout());
        $attributes = new FormAttributesCollection();
        $form->method('getAttributes')->willReturn($attributes);
        $bundle = (new \ReflectionClass(FormAttributesBundle::class))->newInstanceWithoutConstructor();

        (new \ReflectionProperty(FormAttributesBundle::class, 'translationProvider'))->setValue($bundle, $this->createStub(TranslationProvider::class));

        $bundle->setConditionalAttributes(new AttachFormAttributesEvent($form));

        self::assertSame($enabled, true === $attributes->get('data-auto-scroll'));
        self::assertSame($enabled, true === $attributes->get('data-scroll-to-anchor'));
        self::assertSame($enabled, $forms->shouldScrollToAnchor($form));
    }
}
