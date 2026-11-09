<?php

namespace Solspace\Freeform\Tests\Records;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Records\Form\FormFieldRecord;

#[CoversClass(FormFieldRecord::class)]
class FormFieldHandleTest extends TestCase
{
    public function testValidatesFinalLayoutInsteadOfDeletedOrRenamedDatabaseHandles(): void
    {
        $record = $this->record('hero');
        $record->setLayoutHandles(['current' => 'hero', 'other' => 'hero_1']);
        $record->validateFormHandleUniqueness('formId');
        self::assertFalse($record->hasErrors());
    }

    public function testStillRejectsRealDuplicatesIncludingCaseVariants(): void
    {
        $record = $this->record('hero');
        $record->setLayoutHandles(['current' => 'hero', 'other' => 'Hero']);
        $record->validateFormHandleUniqueness('formId');
        self::assertSame(['Handle used more than once.'], $record->getErrors('handle'));
    }

    private function record(string $handle): FormFieldRecord
    {
        $record = $this->getMockBuilder(FormFieldRecord::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $record->method('__get')->willReturnMap([['uid', 'current'], ['metadata', (object) ['handle' => $handle]]]);

        return $record;
    }
}
