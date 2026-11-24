<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Forms\Merge\TextRules;
use Solspace\Freeform\Services\FormMergeService;

#[CoversClass(FormMergeService::class)]
class FormMergeRestartTest extends TestCase
{
    public function testRestoresActionsAndTextRulesWithoutAddingAFieldTwice(): void
    {
        $from = $this->fields([1 => 'firstName', 2 => 'lastName', 3 => 'contactName', 4 => 'company', 5 => 'notes', 6 => 'ignored']);
        $to = $this->fields([11 => 'name', 12 => 'givenName', 13 => 'familyName', 14 => 'company', 15 => 'notes2']);
        $rules = [
            ['type' => 'combine', 'inputs' => [1, 2], 'outputs' => [11], 'format' => 'hyphen'],
            ['type' => 'split', 'inputs' => [3], 'outputs' => [12, 13], 'format' => 'last', 'singleWord' => 'second'],
        ];
        $saved = [
            'input' => [1 => 'skip', 2 => 'skip', 3 => 'skip', 4 => '14', 5 => 'add:9', 6 => 'skip'],
            'textRules' => $rules,
            'addedColumns' => [5 => Submission::getFieldColumnName($to[15])],
        ];
        $rows = array_fill_keys(array_keys($from), ['targets' => array_fill_keys(array_keys($to), true), 'canAdd' => true]);
        $mapping = ['rows' => $rows, 'pages' => [9 => 'Page 1'], 'sourceFields' => $from, 'targetFields' => $to];
        $service = new FormMergeService();

        [$input, $textRules] = $service->restartMapping($mapping, $saved);
        self::assertSame([1 => 'rule:combine', 2 => 'skip', 3 => 'rule:split', 4 => '14', 5 => '15', 6 => 'skip'], $input);
        self::assertSame($rules, $textRules);
        self::assertSame([1 => 'skip', 2 => 'skip', 3 => 'skip', 4 => '14', 5 => '15', 6 => 'skip'], TextRules::directMappings($input, $textRules));

        [$input] = $service->restartMapping($mapping, array_replace($saved, ['addedColumns' => []]));
        self::assertSame('add:9', $input[5]);

        unset($mapping['targetFields'][15]);
        $this->expectException(\DomainException::class);
        $service->restartMapping($mapping, $saved);
    }

    private function fields(array $handles): array
    {
        $fields = [];
        $type = new \ReflectionClass(TextField::class);
        foreach ($handles as $id => $handle) {
            $field = $type->newInstanceWithoutConstructor();
            $type->getProperty('id')->setValue($field, $id);
            $type->getProperty('handle')->setValue($field, $handle);
            $fields[$id] = $field;
        }

        return $fields;
    }
}
