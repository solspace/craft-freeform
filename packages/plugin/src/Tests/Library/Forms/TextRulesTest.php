<?php

namespace Solspace\Freeform\Tests\Library\Forms;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Forms\Merge\TextRules;

#[CoversClass(TextRules::class)]
class TextRulesTest extends TestCase
{
    public function testSplitUsesTheSavedBoundaryAndKeepsSingleWordNames(): void
    {
        $rule = ['type' => 'split', 'inputs' => [10], 'outputs' => [20, 30], 'format' => 'first'];
        $record = ['value_10' => '  Maria de la Cruz  '];

        self::assertSame(['Maria', 'de la Cruz'], TextRules::apply($rule, $record));
        $rule['format'] = 'last';
        self::assertSame(['Maria de la', 'Cruz'], TextRules::apply($rule, $record));
        self::assertSame(['Prince', ''], TextRules::apply($rule, ['value_10' => 'Prince']));
        self::assertSame(['', ''], TextRules::apply($rule, ['value_10' => null]));
        self::assertSame(['Å', 'Li'], TextRules::apply($rule, ['value_10' => "Å\u{00a0}\u{00a0}Li"]));
    }

    public function testCombineKeepsOrderAndOmitsBlankParts(): void
    {
        $rule = ['type' => 'combine', 'inputs' => [13, 11, 12], 'outputs' => [20], 'format' => 'hyphen'];
        $record = ['value_11' => '   ', 'value_12' => '0', 'value_13' => '  Ada  '];

        self::assertSame(['Ada - 0'], TextRules::apply($rule, $record));
        self::assertSame(['Ada - 0'], TextRules::apply(json_decode(json_encode($rule), true), $record));
    }

    public function testCombineSeparatorsUseTheExactSpacingShownInThePicker(): void
    {
        $text = (new \ReflectionClass(TextField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($text, 'handle'))->setValue($text, 'name');
        $rule = ['type' => 'combine', 'inputs' => [1, 2], 'outputs' => [3]];
        $record = ['value_1' => 'Ada', 'value_2' => 'Lovelace'];

        foreach (['comma' => 'Ada, Lovelace', 'comma-only' => 'Ada,Lovelace', 'slash' => 'Ada / Lovelace', 'none' => 'AdaLovelace'] as $format => $expected) {
            [$saved] = TextRules::validate([$rule + ['format' => $format]], [1 => $text, 2 => $text], [3 => $text], []);
            self::assertSame([$expected], TextRules::apply($saved, $record));
        }
    }

    public function testLineBreaksRequireATextareaDestination(): void
    {
        $text = (new \ReflectionClass(TextField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($text, 'handle'))->setValue($text, 'name');
        $textarea = (new \ReflectionClass(TextareaField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($textarea, 'handle'))->setValue($textarea, 'message');
        $rule = ['type' => 'combine', 'inputs' => [1, 2], 'outputs' => [3], 'format' => 'newline'];

        [$saved] = TextRules::validate([$rule], [1 => $text, 2 => $text], [3 => $textarea], []);
        self::assertSame(["Ada\nLovelace"], TextRules::apply($saved, ['value_1' => 'Ada', 'value_2' => 'Lovelace']));

        $this->expectException(\DomainException::class);
        TextRules::validate([$rule], [1 => $text, 2 => $text], [3 => $text], []);
    }

    public function testSplitPreservesTheSingleWordDestinationInSavedRulesAndReviewExamples(): void
    {
        $text = (new \ReflectionClass(TextField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($text, 'handle'))->setValue($text, 'name');
        $rule = ['type' => 'split', 'inputs' => [10], 'outputs' => [20, 30], 'format' => 'first'];

        self::assertSame([$rule], TextRules::validate([$rule + ['singleWord' => 'first']], [10 => $text], [20 => $text, 30 => $text], []));

        $rules = TextRules::validate([$rule + ['singleWord' => 'second']], [10 => $text], [20 => $text, 30 => $text], []);
        $saved = json_decode(json_encode($rules, \JSON_THROW_ON_ERROR), true, 512, \JSON_THROW_ON_ERROR);
        $record = ['id' => 1, 'value_10' => 'Prince'];

        self::assertSame(['', 'Prince'], TextRules::apply($saved[0], $record));
        self::assertSame(['Ada', 'Lovelace'], TextRules::apply($saved[0], ['value_10' => 'Ada Lovelace']));
        self::assertSame(['', ''], TextRules::apply($saved[0], ['value_10' => '  ']));
        self::assertSame([[['before' => ['Prince'], 'after' => ['', 'Prince'], 'id' => 1]]], TextRules::examples($saved, $record, []));
    }

    public function testRejectsAnExistingMappingToAReceivingFieldUsedInARule(): void
    {
        $text = (new \ReflectionClass(TextField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($text, 'handle'))->setValue($text, 'example');

        $this->expectException(\DomainException::class);
        TextRules::validate(
            [['type' => 'split', 'inputs' => [1], 'outputs' => [3, 4], 'format' => 'first']],
            [1 => $text, 2 => $text],
            [3 => $text, 4 => $text],
            [2 => 3],
        );
    }

    public function testRejectsNonTextFields(): void
    {
        $text = (new \ReflectionClass(TextField::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($text, 'handle'))->setValue($text, 'text');
        $number = (new \ReflectionClass(NumberField::class))->newInstanceWithoutConstructor();

        $this->expectException(\DomainException::class);
        TextRules::validate(
            [['type' => 'combine', 'inputs' => [1, 2], 'outputs' => [3], 'format' => 'space']],
            [1 => $text, 2 => $number],
            [3 => $text],
            [],
        );
    }

    public function testInlineRulesOwnTheirInputsAndPreserveOtherMappings(): void
    {
        $rules = [['type' => 'combine', 'inputs' => ['1', '2'], 'outputs' => [10], 'format' => 'space']];
        self::assertSame([1 => 'skip', 2 => 'skip', 3 => '12'], TextRules::directMappings(
            [1 => 'rule:combine', 2 => 'add:9', 3 => '12'],
            $rules,
        ));

        $this->expectException(\DomainException::class);
        TextRules::directMappings([1 => 'rule:split', 2 => '11'], $rules);
    }
}
