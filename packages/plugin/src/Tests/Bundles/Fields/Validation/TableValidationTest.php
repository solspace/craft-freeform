<?php

namespace Solspace\Freeform\Tests\Bundles\Fields\Validation;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Bundles\Fields\Validation\TableValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;
use Solspace\Freeform\Form\Form;

#[CoversClass(TableValidation::class)]
class TableValidationTest extends TestCase
{
    #[DataProvider('numberValueProvider')]
    public function testNumberColumnValidation(string $value, array $metadata, array $expectedErrors): void
    {
        $form = $this->createMock(Form::class);
        $layout = (new TableLayout())->add(
            'Amount',
            '',
            TableField::COLUMN_TYPE_NUMBER,
            metadata: $metadata,
        );
        $field = $this
            ->getMockBuilder(TableField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getTableLayout', 'getValue'])
            ->getMock()
        ;
        $field->method('getTableLayout')->willReturn($layout);
        $field->method('getValue')->willReturn([[$value]]);

        $validation = new TableValidation($this->createMock(FileUploadValidationHelper::class));
        $validation->validateNumberColumns(new ValidateEvent($form, $field));

        $this->assertSame($expectedErrors, $field->getErrors());
    }

    public static function numberValueProvider(): iterable
    {
        yield 'valid zero' => ['0', [], []];

        yield 'valid decimal' => ['10.50', ['decimalCount' => 2], []];

        yield 'valid comma decimal' => ['10,50', ['decimalCount' => 2], []];

        yield 'not numeric' => ['abc', [], ['Value must be numeric']];

        yield 'sign without digits' => ['-', [], ['Value must be numeric']];

        yield 'too many decimals' => ['10.501', ['decimalCount' => 2], ['2 decimal places allowed']];

        yield 'too short' => ['1', ['minLength' => 2], ['Value must be at least {minLength} characters']];

        yield 'too long' => ['100', ['maxLength' => 2], ['Value must be no more than {maxLength} characters']];

        yield 'below minimum' => ['9', ['minMaxValues' => [10, null]], ['The value must be no less than 10']];

        yield 'above maximum' => ['11', ['minMaxValues' => [null, 10]], ['The value must be no more than 10']];

        yield 'outside range' => ['11', ['minMaxValues' => [1, 10]], ['The value must be between 1 and 10']];
    }

    public function testZeroSatisfiesRequiredNumberColumn(): void
    {
        $form = $this->createMock(Form::class);
        $layout = (new TableLayout())->add(
            'Amount',
            '',
            TableField::COLUMN_TYPE_NUMBER,
            required: true,
        );
        $field = $this
            ->getMockBuilder(TableField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getTableLayout', 'getValue', 'getRequiredErrorMessage'])
            ->getMock()
        ;
        $field->method('getTableLayout')->willReturn($layout);
        $field->method('getValue')->willReturn([['0']]);
        $field->method('getRequiredErrorMessage')->willReturn('');

        $validation = new TableValidation($this->createMock(FileUploadValidationHelper::class));
        $validation->validateRequiredColumns(new ValidateEvent($form, $field));

        $this->assertSame([], $field->getErrors());
    }
}
