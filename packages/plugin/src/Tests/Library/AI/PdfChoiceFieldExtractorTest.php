<?php

namespace Solspace\Freeform\Tests\Library\AI;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\AI\PdfChoiceFieldExtractor;
use Solspace\Freeform\Tests\Fixtures\ChoicePdfFixture;

#[CoversClass(PdfChoiceFieldExtractor::class)]
class PdfChoiceFieldExtractorTest extends TestCase
{
    public function testReadsClosedAndEditableDropdownsWithIndirectOptionsWithoutAnswersOrActions(): void
    {
        $pdf = ChoicePdfFixture::create([
            3 => '<< /FT /Ch /Ff 393216 /T (Architecture Style) /TU (Architecture) /Opt 4 0 R /V (PRIVATE ANSWER) /DV (PRIVATE DEFAULT) /AA << /K << /JS (PRIVATE SCRIPT) >> >> >>',
            4 => '[ ( ) (Detached) [(semi) (Semi-Detached)] (Split \(Level\)) ]',
        ]);
        $fields = PdfChoiceFieldExtractor::extract($pdf);
        self::assertSame([[
            'name' => 'Architecture Style', 'label' => 'Architecture', 'type' => 'Dropdown',
            'options' => [
                ['label' => 'Detached', 'value' => 'Detached'],
                ['label' => 'Semi-Detached', 'value' => 'semi'],
                ['label' => 'Split (Level)', 'value' => 'Split (Level)'],
            ],
        ]], $fields);
        self::assertStringNotContainsString('PRIVATE', json_encode($fields));
    }

    public function testInheritsChoiceDefinitionsForNamedChildrenAndDoesNotDuplicateWidgets(): void
    {
        $pdf = ChoicePdfFixture::create([
            3 => '<< /T (Building) /FT /Ch /Ff 2097152 /Opt 7 0 R /Kids [4 0 R 5 0 R] >>',
            4 => '<< /T (Materials) /Kids [6 0 R] >>',
            5 => '<< /T (Heating) /Ff 131072 /Opt [(Gas) (Electric)] >>',
            6 => '<< /Subtype /Widget /Parent 4 0 R >>',
            7 => '[(Wood) (Brick)]',
        ]);
        $fields = PdfChoiceFieldExtractor::extract($pdf);
        self::assertCount(2, $fields);
        self::assertSame(['Building.Materials', 'Building.Heating'], array_column($fields, 'name'));
        self::assertSame(['MultipleSelect', 'Dropdown'], array_column($fields, 'type'));
        self::assertSame('Wood', $fields[0]['options'][0]['value']);
        self::assertSame('Gas', $fields[1]['options'][0]['value']);
    }

    public function testDecodesUtf16HexStringsEscapesAndPdfDocEncoding(): void
    {
        $pdf = ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T <FEFF005300E9006C0065006300740069006F006E> /Opt [(Caf\351) <FEFF65E5672C8A9E> (A\205B) (cost \240100)] >>',
        ]);
        $fields = PdfChoiceFieldExtractor::extract($pdf);
        self::assertSame('Sélection', $fields[0]['name']);
        self::assertSame(['Café', '日本語', 'A–B', 'cost €100'], array_column($fields[0]['options'], 'label'));
    }

    public function testIgnoresTextAnswersThatLookLikePdfSyntax(): void
    {
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Tx /T (Description) /V (/FT /Ch /Opt [fake options]) >>',
        ])));
    }

    public function testCycleInFieldTreeIsBoundedAndValidSiblingIsRetained(): void
    {
        $fields = PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /Kids [3 0 R] >>',
            4 => '<< /FT /Ch /T (State) /Opt [(MB) (ON)] >>',
        ], '[3 0 R 4 0 R]'));
        self::assertCount(1, $fields);
        self::assertSame('State', $fields[0]['name']);
    }

    public function testMalformedAndUnsupportedPdfFallBackToVisualImport(): void
    {
        self::assertSame([], PdfChoiceFieldExtractor::extract("%PDF-1.4\n%%EOF"));
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T (Broken) /Opt 99 0 R >>',
        ])));
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T (Name) /Opt '.str_repeat('[', 100).'(deep)'.str_repeat(']', 100).' >>',
        ])));
    }

    public function testOversizedOptionsAreSkippedInsteadOfTruncated(): void
    {
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T (List) /Opt ['.str_repeat('(Choice) ', 201).'] >>',
        ])));
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T (List) /Opt [('.str_repeat('a', 513).')] >>',
        ])));
        self::assertSame([], PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create([
            3 => '<< /FT /Ch /T (List) /Opt [(Valid) 123] >>',
        ])));
    }

    public function testMetadataSizeAndFieldCountAreBounded(): void
    {
        $objects = [];
        $refs = [];
        for ($i = 3; $i < 253; ++$i) {
            $objects[$i] = '<< /FT /Ch /T (Choice'.$i.') /Opt [(Yes) (No)] >>';
            $refs[] = $i.' 0 R';
        }
        $fields = PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create($objects, '['.implode(' ', $refs).']'));
        self::assertCount(200, $fields);

        foreach ($objects as $i => &$object) {
            $object = '<< /FT /Ch /T (Choice'.$i.') /Opt [('.str_repeat('a', 500).')] >>';
        }
        unset($object);
        $fields = PdfChoiceFieldExtractor::extract(ChoicePdfFixture::create($objects, '['.implode(' ', $refs).']'));
        self::assertNotEmpty($fields);
        self::assertLessThan(200, \count($fields));
        self::assertLessThan(65536, \strlen(json_encode($fields)));
    }
}
