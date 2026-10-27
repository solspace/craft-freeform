<?php

namespace Solspace\Freeform\Tests\Fields;

use craft\helpers\Html;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\Attributes;

/**
 * @coversNothing
 */
class RequiredAttributeTest extends TestCase
{
    #[DataProvider('requiredModes')]
    public function testRequiredAttributeCanBeRenderedByCraft6(bool $required, bool $native, string $expected): void
    {
        $field = new EmailField($this->createMock(Form::class));
        (new \ReflectionProperty($field, 'required'))->setValue($field, $required);
        $field->setParameters(['useRequiredAttribute' => $native]);
        $attribute = (new \ReflectionMethod($field, 'getRequiredAttribute'))->invoke($field);
        self::assertSame($expected, $attribute);
        $attributes = (new Attributes())->set($attribute);
        $html = Html::tag('input', '', $attributes->toHtmlTagArray());
        self::assertSame('' === $expected ? '<input>' : '<input '.$expected.'>', $html);
    }

    public static function requiredModes(): array
    {
        return [[true, false, 'data-required'], [true, true, 'required'], [false, false, ''], [false, true, '']];
    }
}
