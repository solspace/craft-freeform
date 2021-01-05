<?php

namespace Solspace\Tests\Freeform\Unit\Library\Export;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Layout;
use Solspace\Freeform\Library\Export\ExportText;

/**
 * @internal
 * @coversNothing
 */
class ExportTextTest extends TestCase
{
    /** @var Form|MockObject */
    private $formMock;

    /** @var MockObject|TableField */
    private $tableField1Mock;

    /** @var MockObject|TableField */
    private $tableField2Mock;

    /** @var MockObject|TextField */
    private $textFieldMock;

    protected function setUp(): void
    {
        $this->tableField1Mock = $this->createMock(TableField::class);
        $this->tableField1Mock
            ->method('getTableLayout')
            ->willReturn([
                ['label' => 'T1C1'],
                ['label' => 'T1C2'],
                ['label' => 'T1C3'],
            ])
        ;

        $this->tableField1Mock
            ->method('getHandle')
            ->willReturn('table1')
        ;

        $this->tableField2Mock = $this->createMock(TableField::class);
        $this->tableField2Mock
            ->method('getTableLayout')
            ->willReturn([
                ['label' => 'T2C1'],
                ['label' => 'T2C2'],
                ['label' => 'T2C3'],
                ['label' => 'T2C4'],
                ['label' => 'T2C5'],
            ])
        ;

        $this->tableField2Mock
            ->method('getHandle')
            ->willReturn('table2')
        ;

        $this->textFieldMock = $this->createMock(TextField::class);
        $this->textFieldMock
            ->method('getLabel')
            ->willReturn('First Name')
        ;

        $this->textFieldMock
            ->method('getHandle')
            ->willReturn('firstName')
        ;

        $layoutMock = $this->createMock(Layout::class);
        $layoutMock
            ->method('getFieldById')
            ->willReturnOnConsecutiveCalls(
                $this->tableField1Mock,
                $this->textFieldMock,
                $this->tableField2Mock,
                $this->tableField1Mock,
                $this->textFieldMock,
                $this->tableField2Mock
            )
        ;

        $this->formMock = $this->createMock(Form::class);
        $this->formMock
            ->method('getLayout')
            ->willReturn($layoutMock)
        ;
    }

    public function testEmptyExport()
    {
        $exporter = new ExportText($this->formMock, []);

        $this->assertEmpty($exporter->export());
    }

    public function testExportBasicRows()
    {
        $exporter = new ExportText($this->formMock, [
            ['id' => 1, 'dateCreated' => '2019-01-01 08:00:00'],
            ['id' => 2, 'dateCreated' => '2019-01-01 09:20:00'],
        ]);

        $expected = <<<'EXPECTED'
id: 1
dateCreated: 2019-01-01 08:00:00

id: 2
dateCreated: 2019-01-01 09:20:00


EXPECTED;

        $this->assertSame($expected, $exporter->export());
    }

    public function testExportTableRows()
    {
        $table1row1 = json_encode([
            ['one', 'two', 'three'],
            ['four', 'five', ''],
            ['', 'six', 'sib'],
        ]);

        $table1row2 = json_encode([
            ['some', 'value', '', 'chalice'],
        ]);

        $table2row1 = json_encode([
            ['r1c1', 'r1c2', 'r1c3', 'r1c4', 'r1c5'],
            ['r2c1', 'r2c2', 'r2c3', 'r2c4', 'r2c5'],
        ]);

        $table2row2 = json_encode([
            ['r1c1', 'r1c2', 'r1c3', 'r1c4', 'r1c5'],
            ['r2c1', 'r2c2', 'r2c3', 'r2c4', 'r2c5'],
            ['r3c1', 'r3c2', 'r3c3', 'r3c4', 'r3c5'],
            ['r4c1', 'r4c2', 'r4c3', 'r4c4', 'r4c5'],
            ['r5c1', 'r5c2', 'r5c3', 'r5c4', 'r5c5'],
        ]);

        $exporter = new ExportText($this->formMock, [
            ['id' => 1, 'field_1' => $table1row1, 'field_2' => 'Some Name', 'field_3' => $table2row1],
            ['id' => 2, 'field_1' => $table1row2, 'field_2' => 'Other Name', 'field_3' => $table2row2],
        ]);

        $expected = <<<'EXPECTED'
id: 1
table1: one, two, three, four, five, , , six, sib
firstName: Some Name
table2: r1c1, r1c2, r1c3, r1c4, r1c5, r2c1, r2c2, r2c3, r2c4, r2c5

id: 2
table1: some, value, , chalice
firstName: Other Name
table2: r1c1, r1c2, r1c3, r1c4, r1c5, r2c1, r2c2, r2c3, r2c4, r2c5, r3c1, r3c2, r3c3, r3c4, r3c5, r4c1, r4c2, r4c3, r4c4, r4c5, r5c1, r5c2, r5c3, r5c4, r5c5


EXPECTED;

        $this->assertSame($expected, $exporter->export());
    }
}
