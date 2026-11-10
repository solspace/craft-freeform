<?php

namespace Solspace\Freeform\Tests\Services;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\FormCardAnalyticsService;
use yii\web\BadRequestHttpException;

#[CoversClass(FormCardAnalyticsService::class)]
class FormCardAnalyticsServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
    }

    public function testPeriodsIncludeZeroDaysAndUsePreviousEqualLengthPeriod(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-22 15:00:00', 'UTC'));
        $service = new class extends FormCardAnalyticsService {
            protected function getDailyRows(array $ids, Carbon $start, Carbon $end): array
            {
                TestCase::assertSame('2026-10-09 00:00:00', $start->toDateTimeString());
                TestCase::assertSame('2026-10-22 15:00:00', $end->toDateTimeString());

                return [['formId' => 1, 'date' => '2026-10-15', 'count' => 4], ['formId' => 1, 'date' => '2026-10-16', 'count' => 6], ['formId' => 2, 'date' => '2026-10-22', 'count' => 3]];
            }

            protected function getStatusRows(array $ids, Carbon $start, Carbon $end): array
            {
                TestCase::assertSame([1], $ids);
                TestCase::assertSame('2026-10-16', $start->toDateString());

                return [['formId' => 1, 'statusId' => 9, 'name' => 'Reviewed', 'count' => 6]];
            }
        };
        $stats = (array) $service->getStats([1, 2, 3], 7, [1, 99])['forms'];
        self::assertCount(7, $stats[1]['daily']);
        self::assertSame(['date' => '2026-10-22', 'uv' => 0], $stats[1]['daily'][6]);
        self::assertSame(6, $stats[1]['total']);
        self::assertSame(4, $stats[1]['previousTotal']);
        self::assertSame(50.0, $stats[1]['changePercent']);
        self::assertSame('Reviewed', $stats[1]['statuses'][0]['name']);
        self::assertSame([], $stats[2]['statuses']);
        self::assertNull($stats[2]['changePercent']);
        self::assertSame(0, $stats[3]['changePercent']);
    }

    public function testNumericSummaryIgnoresEmptyAndInvalidValues(): void
    {
        $field = $this->createMock(NumberField::class);
        $field->method('getId')->willReturn(7);
        $field->method('getHandle')->willReturn('rating');
        $field->method('getLabel')->willReturn('Rating');
        $service = $this->valuesService([null, '', 'invalid', '0', '2', '4']);
        $summary = $service->getFieldSummary($this->form([$field]), 7, 30);
        self::assertSame(3, $summary['count']);
        self::assertSame(2.0, $summary['average']);
        self::assertSame(0.0, $summary['min']);
        self::assertSame(4.0, $summary['max']);
    }

    public function testOptionSummaryUsesConfiguredLabelsAndExcludesUnknownValues(): void
    {
        $field = $this->createMock(DropdownField::class);
        $field->method('getId')->willReturn(8);
        $field->method('getHandle')->willReturn('topic');
        $field->method('getLabel')->willReturn('Topic');
        $field->method('getOptions')->willReturn((new OptionCollection())->add('one', 'Support')->add('two', 'Sales'));
        $summary = $this->valuesService(['one', 'one', 'two', 'private unexpected text'])->getFieldSummary($this->form([$field]), 8, 7);
        self::assertSame(3, $summary['count']);
        self::assertSame([['label' => 'Support', 'count' => 2, 'percent' => 66.7], ['label' => 'Sales', 'count' => 1, 'percent' => 33.3]], $summary['options']);
    }

    public function testTextFieldsCannotBeSummarized(): void
    {
        $field = $this->createMock(TextField::class);
        $field->method('getId')->willReturn(9);
        $service = $this->valuesService(['private text']);
        self::assertSame([], $service->getFields($this->form([$field])));
        $this->expectException(BadRequestHttpException::class);
        $service->getFieldSummary($this->form([$field]), 9, 30);
    }

    private function form(array $fields): Form
    {
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection($fields));
        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn($layout);

        return $form;
    }

    private function valuesService(array $values): FormCardAnalyticsService
    {
        return new class($values) extends FormCardAnalyticsService {
            public function __construct(private array $values) {}

            protected function getFieldValues(Form $form, string $column, int $days): iterable
            {
                return $this->values;
            }
        };
    }
}
