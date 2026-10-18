<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Context\Request;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Form\Context\Request\DefaultValuesContext;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;

#[CoversClass(DefaultValuesContext::class)]
class DefaultValuesContextTest extends TestCase
{
    public function testUsesOptionSamplesWithoutEvaluatingTwigAndKeepsThemStable(): void
    {
        $field = $this->createMock(DropdownField::class);
        $field->method('isSampleDataEnabled')->willReturn(true);
        $field->expects(self::once())->method('getOptions')->willReturn((new OptionCollection())->add('0', 'Zero'));
        $field->expects(self::exactly(2))->method('setValue')->with('0');
        $provider = $this->createMock(TranslationProvider::class);
        $provider->expects(self::never())->method('getTranslation');
        $context = $this->context($provider);
        $event = $this->event($field);
        $context->handleDefaultValues($event);
        $context->handleDefaultValues($event);
    }

    public function testDisabledSamplingUsesConfiguredDefaults(): void
    {
        $field = $this->createMock(DropdownField::class);
        $field->method('isSampleDataEnabled')->willReturn(false);
        $field->method('getDefaultValue')->willReturn('manual');
        $field->expects(self::never())->method('getOptions');
        $field->expects(self::once())->method('setValue')->with('manual');
        $provider = $this->createMock(TranslationProvider::class);
        $provider->method('getTranslation')->willReturnCallback(static fn ($context, $namespace, $handle, $default) => $default);
        $this->context($provider)->handleDefaultValues($this->event($field));
    }

    public function testDoesNotReplaceHeadlessSubmissionValues(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('isHeadlessPosted')->willReturn(true);
        $form->expects(self::never())->method('getLayout');
        $event = $this->createMock(FormEventInterface::class);
        $event->method('getForm')->willReturn($form);
        $this->context($this->createMock(TranslationProvider::class))->handleDefaultValues($event);
    }

    private function context(TranslationProvider $provider): DefaultValuesContext
    {
        // Exercise the handler directly without installing global form event listeners.
        $reflection = new \ReflectionClass(DefaultValuesContext::class);
        $context = $reflection->newInstanceWithoutConstructor();
        $reflection->getProperty('translationProvider')->setValue($context, $provider);

        return $context;
    }

    private function event(DropdownField $field): FormEventInterface
    {
        $field->method('getUid')->willReturn('sample-field');
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$field]));
        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn($layout);
        $event = $this->createMock(FormEventInterface::class);
        $event->method('getForm')->willReturn($form);

        return $event;
    }
}
