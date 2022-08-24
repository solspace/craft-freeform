<?php

namespace Solspace\Tests\Freeform\Unit\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\HandleHelper;

/**
 * @internal
 * @coversNothing
 */
class HandleHelperTest extends TestCase
{
    public function testGeneratesFromSimpleSentence(): void
    {
        $this->assertEquals(
            'someLabelToHandle',
            HandleHelper::generateHandle('Some label to handle')
        );
    }

    public function testGeneratesFromMixedCaseLetters(): void
    {
        $this->assertEquals(
            'someMIXedLettersHereANDTHERE',
            HandleHelper::generateHandle('SomeMIXedLettersHereANDTHERE')
        );
    }

    public function testGeneratesFromComplexString()
    {
        $this->assertEquals(
            '1234THiSISaComplexCase',
            HandleHelper::generateHandle('€$$$ 123__-4 - THiS ISaComplex case')
        );
    }

    public function testGeneratesFromCyrillic()
    {
        $this->assertEquals(
            'privetEtoRusskij',
            HandleHelper::generateHandle('привет это русский')
        );
    }

    public function testGeneratesFromJapaneseCharacters()
    {
        $this->assertEquals(
            'oWeniHewase',
            HandleHelper::generateHandle('お問い合わせ')
        );
    }
}
