<?php

namespace Solspace\Tests\Freeform\Unit\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\HandleHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class HandleHelperTest extends TestCase
{
    public function testGeneratesFromSimpleSentence(): void
    {
        $this->assertEquals(
            'somelabeltohandle',
            HandleHelper::generateHandle('some label to handle')
        );
    }

    public function testGeneratesFromMixedCaseLetters(): void
    {
        $this->assertEquals(
            'SomeMIXedLettersHereANDTHERE',
            HandleHelper::generateHandle('SomeMIXedLettersHereANDTHERE')
        );
    }

    public function testGeneratesFromComplexString()
    {
        $this->assertEquals(
            '123__4THiSISaComplexcase',
            HandleHelper::generateHandle('€$$$ 123__-4 - THiS ISaComplex case?')
        );
    }

    public function testGeneratesFromCyrillic()
    {
        $this->assertEquals(
            'privetetorusskij',
            HandleHelper::generateHandle('привет это русский')
        );
    }

    public function testGeneratesFromJapaneseCharacters()
    {
        $this->assertEquals(
            'owenihewase',
            HandleHelper::generateHandle('お問い合わせ')
        );
    }

    public function testGeneratesFromMixedCaseWithSpacesAndDashes(): void
    {
        $this->assertEquals(
            'SomeLabelTOhandle',
            HandleHelper::generateHandle('Some Label-TO-handle')
        );
    }

    public function testGeneratesFromUnderscoresAndCapitalizationAnywhere(): void
    {
        $this->assertEquals(
            'My_Field_Handle',
            HandleHelper::generateHandle('My_Field_Handle')
        );
    }
}
