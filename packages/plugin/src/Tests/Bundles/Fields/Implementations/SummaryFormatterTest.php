<?php

namespace Solspace\Freeform\Tests\Bundles\Fields\Implementations;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Implementations\SummaryField\SummaryFormatter;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\SummaryField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use yii\di\Container;

#[CoversClass(SummaryFormatter::class)]
#[CoversClass(SummaryField::class)]
class SummaryFormatterTest extends TestCase
{
    private const CONFIG = ['hideEmpty' => true, 'checkedLabel' => 'Yes', 'uncheckedLabel' => 'No', 'filesLabel' => 'Files'];

    public function testZeroAndCheckboxValues(): void
    {
        $formatter = new SummaryFormatter();
        self::assertSame('0', $formatter->formatValue(['type' => 'number'], 0, self::CONFIG));
        self::assertSame('', $formatter->formatValue(['type' => 'text'], null, self::CONFIG));
        self::assertSame('', $formatter->formatValue(['type' => 'checkbox'], false, self::CONFIG));
        self::assertSame('No', $formatter->formatValue(['type' => 'checkbox'], false, array_replace(self::CONFIG, ['hideEmpty' => false])));
        self::assertSame('Yes', $formatter->formatValue(['type' => 'checkbox'], 'yes', self::CONFIG));
    }

    public function testChoicesUseLabelsAndUploadsNeverExposeIds(): void
    {
        $formatter = new SummaryFormatter();
        self::assertSame('Apples', $formatter->formatValue(['type' => 'dropdown', 'options' => [['value' => 'a', 'label' => 'Apples']]], 'a', self::CONFIG));
        self::assertSame('Files: 2', $formatter->formatValue(['type' => 'file-dnd'], [123, 456], self::CONFIG));
    }

    public function testTableUsesColumnLabelsAndPreservesZero(): void
    {
        $field = $this->createMock(TableField::class);
        $field->method('getType')->willReturn('table');
        $field->method('getLabel')->willReturn('Items');
        $field->method('getTableLayout')->willReturn((new TableLayout())->add('Name', '', 'string')->add('Count', '', 'number'));
        $field->method('getValue')->willReturn([['A', 0], ['B', 2]]);
        self::assertSame("Name: A; Count: 0\nName: B; Count: 2", (new SummaryFormatter())->format($field, self::CONFIG));
    }

    public function testSensitiveAndUnknownTypesAreNeverIncluded(): void
    {
        foreach (['password', 'hidden', 'invisible', 'confirm', 'signature', 'summary', 'html', 'stripe', 'cc-number', 'custom-secret'] as $type) {
            self::assertFalse(SummaryFormatter::supports($type));
        }
    }

    public function testServerRenderingEscapesHtmlAndNeverEvaluatesAnswerTwig(): void
    {
        $visible = $this->field('name');
        $visible->method('getLabel')->willReturn('<b>Name</b>');
        $visible->method('getValue')->willReturn('<img src=x onerror=alert(1)> {{ 7 * 7 }}');
        $hidden = $this->field('privateAnswer');
        $hidden->method('getValue')->willReturn('NEVER_EMBED_THIS');
        $validator = $this->createMock(RuleValidator::class);
        $validator->method('isFieldHidden')->willReturnCallback(static fn ($form, $field) => 'privateAnswer' === $field->getHandle());
        $container = new Container();
        $container->set(RuleValidator::class, $validator);
        $originalContainer = \Craft::$container;
        \Craft::$container = $container;

        try {
            $summary = $this->getMockBuilder(SummaryField::class)
                ->setConstructorArgs([$this->createMock(Form::class)])
                ->onlyMethods(['getSourceFields', 'getSummaryConfig', 'getAttributes'])
                ->getMock()
            ;
            $attributes = new FieldAttributesCollection();
            $attributes->getInput()->set('data-developer-template', '{{ field.type }}');
            $summary->method('getAttributes')->willReturn($attributes);
            $summary->method('getSourceFields')->willReturn([$visible, $hidden]);
            $summary->method('getSummaryConfig')->willReturn(self::CONFIG + ['fields' => ['name', 'privateAnswer'], 'emptyValue' => 'Not answered']);

            $html = $summary->getInputHtml();
            self::assertStringNotContainsString('<img', $html);
            self::assertStringNotContainsString('NEVER_EMBED_THIS', $html);
            self::assertStringContainsString('data-developer-template="summary"', $html);
            $document = new \DOMDocument();
            @$document->loadHTML($html);
            $sources = json_decode($document->getElementsByTagName('dl')->item(0)->getAttribute('data-summary-sources'), true);
            self::assertSame('<img src=x onerror=alert(1)> {{ 7 * 7 }}', $sources[0]['text']);
            self::assertSame('', $sources[1]['text']);
        } finally {
            \Craft::$container = $originalContainer;
        }
    }

    public function testOnlySelectedPrecedingRenderableFieldsAreIncluded(): void
    {
        $form = $this->createMock(Form::class);
        $layout = new FormLayout();
        $form->method('getLayout')->willReturn($layout);
        $summary = new SummaryField($form);
        (new \ReflectionProperty($summary, 'handle'))->setValue($summary, 'review');
        $first = $this->field('first');
        $second = $this->field('second');
        foreach ([$first, $this->field('secret', 'password'), $second, $this->field('hiddenCalc', 'calculation', false), $summary, $this->field('later')] as $field) {
            $layout->getFields()->add($field);
        }
        self::assertSame([$first, $second], $summary->getSourceFields());
        (new \ReflectionProperty($summary, 'includedFields'))->setValue($summary, 'second, secret, hiddenCalc, later, missing');
        self::assertSame([$second], $summary->getSourceFields());
        self::assertFalse($summary->canStoreValues());
        self::assertFalse($summary->includeInGqlSchema());
        self::assertFalse($summary->isRequired());
    }

    private function field(string $handle, string $type = 'text', bool $renderable = true): FieldInterface
    {
        $field = $this->createMock(FieldInterface::class);
        $field->method('getHandle')->willReturn($handle);
        $field->method('getType')->willReturn($type);
        $field->method('canRender')->willReturn($renderable);

        return $field;
    }
}
