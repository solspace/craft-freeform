<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Implementations\RatingField\RatingFieldBundle;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use yii\base\Event;

#[CoversClass(AbstractField::class)]
class CustomAttributesRenderingTest extends TestCase
{
    public function testCustomAttributesCanBeSkippedWithoutChangingFrontendConfiguration(): void
    {
        $field = $this->createField();
        $frontend = $field->getAttributes();

        $this->assertSame('fieldset', $frontend->getContainer()->getTag());
        $this->assertSame('container-test', $frontend->getContainer()->get('class'));
        $this->assertSame('legend', $frontend->getLabel()->getTag());
        $this->assertTrue($frontend->getInput()->get('disabled'));

        $field->setParameters(['useCustomAttributes' => false]);
        $cp = $field->getAttributes();

        $this->assertSame('div', $cp->getContainer()->getTag());
        $this->assertNull($cp->getContainer()->get('class'));
        $this->assertNull($cp->getContainer()->get('style'));
        $this->assertSame('label', $cp->getLabel()->getTag('label'));
        $this->assertNull($cp->getInput()->get('disabled'));
        $this->assertNull($cp->getInput()->get('name'));
        $this->assertNull($cp->getOptionLabel()->get('style'));
        $this->assertNull($cp->getInstructions()->get('class'));
        $this->assertNull($cp->getError()->get('class'));
        $this->assertSame('form-input-example-error', $cp->getContainer()->get('data-field-error-id'));

        $field->setParameters(['useCustomAttributes' => null]);

        $this->assertEquals($frontend->jsonSerialize(), $field->getAttributes()->jsonSerialize());
    }

    public function testCompiledRuntimeAttributesAreRetainedWhenCustomAttributesAreSkipped(): void
    {
        $field = $this->createField();
        $field->setParameters(['useCustomAttributes' => false]);

        $handler = static function (CompileFieldAttributesEvent $event): void {
            $event->getAttributes()->getContainer()
                ->append('class', 'fields-column')
                ->replace('data-field-container', 'example')
                ->replace('data-field-type', 'text')
                ->replace('data-hidden', true)
            ;
            $event->getAttributes()->getInput()->replace('maxlength', 50);
        };

        Event::on(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, $handler);

        try {
            $attributes = $field->getAttributes();

            $this->assertSame('fields-column', $attributes->getContainer()->get('class'));
            $this->assertSame('example', $attributes->getContainer()->get('data-field-container'));
            $this->assertSame('text', $attributes->getContainer()->get('data-field-type'));
            $this->assertTrue($attributes->getContainer()->get('data-hidden'));
            $this->assertSame(50, $attributes->getInput()->get('maxlength'));
            $this->assertNull($attributes->getInput()->get('disabled'));
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, $handler);
        }
    }

    public function testRatingRuntimeAttributesSurviveWithoutCustomInputAttributes(): void
    {
        $field = $this->getMockBuilder(RatingField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getIdAttribute', 'getInstructions'])
            ->getMock()
        ;
        $field->method('getIdAttribute')->willReturn('form-input-rating');
        $field->method('getInstructions')->willReturn('');

        (new \ReflectionProperty(AbstractField::class, 'attributes'))->setValue($field, new FieldAttributesCollection([
            'input' => ['disabled' => true, 'style' => 'display:none'],
            'optionLabel' => ['class' => 'frontend-star'],
        ]));
        $field->setParameters(['useCustomAttributes' => false]);

        $bundle = (new \ReflectionClass(RatingFieldBundle::class))->newInstanceWithoutConstructor();
        $handler = [$bundle, 'compileAttributes'];
        Event::on(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, $handler);

        try {
            $attributes = $field->getAttributes();

            $this->assertSame($field->getColorIdle(), $attributes->getContainer()->get('data-color-idle'));
            $this->assertSame($field->getColorHover(), $attributes->getContainer()->get('data-color-hover'));
            $this->assertSame($field->getColorSelected(), $attributes->getContainer()->get('data-color-selected'));
            $this->assertNull($attributes->getInput()->get('disabled'));
            $this->assertNull($attributes->getInput()->get('style'));
            $this->assertNull($attributes->getOptionLabel()->get('class'));
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, $handler);
        }
    }

    private function createField(): TextField
    {
        $field = $this->getMockBuilder(TextField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getIdAttribute', 'getInstructions'])
            ->getMock()
        ;
        $field->method('getIdAttribute')->willReturn('form-input-example');
        $field->method('getInstructions')->willReturn('');

        $attributes = new FieldAttributesCollection([
            'container' => ['tag' => 'fieldset', 'class' => 'container-test', 'style' => 'display:none'],
            'label' => ['tag' => 'legend'],
            'input' => ['disabled' => true, 'name' => 'frontend-only'],
            'optionLabel' => ['style' => 'display:none'],
            'instructions' => ['class' => 'frontend-instructions'],
            'error' => ['class' => 'frontend-error'],
        ]);
        (new \ReflectionProperty(AbstractField::class, 'attributes'))->setValue($field, $attributes);

        return $field;
    }
}
