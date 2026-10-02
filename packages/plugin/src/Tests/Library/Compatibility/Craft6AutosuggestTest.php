<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Resources\Craft6Autosuggest;

#[CoversNothing]
class Craft6AutosuggestTest extends TestCase
{
    public function testVuePreviewIsPlainAndKeepsItsValueAttributesAndInitialization(): void
    {
        $input = '<input slot="input" type="text" id="settings-path-preview" class="text fullwidth form-control" value="$TEMPLATE_PATH" disabled placeholder="templates/forms">';
        $prefix = '<div id="settings-path-container" class="autosuggest-container" tabindex="-1">';
        $suffix = '<vue-autosuggest :input-props="inputProps"></vue-autosuggest></div><script>$("#settings-path-preview").remove(); new Vue({el:"#settings-path-container"});</script>';
        $html = $prefix.'<craft-input disabled>'.$input.'</craft-input>'.$suffix;
        $expected = $prefix.str_replace(' slot="input"', '', $input).$suffix;

        self::assertSame($expected, Craft6Autosuggest::unwrapPreviews($html));
        self::assertSame($expected, Craft6Autosuggest::unwrapPreviews($expected));
    }

    public function testOrdinaryInputsAndNonPreviewComponentsRemainUnchanged(): void
    {
        foreach ([
            '<craft-input><input id="name-preview" slot="input"></craft-input>',
            '<div class="autosuggest-container"><craft-input><input id="live" slot="input"></craft-input></div>',
            '<div class="autosuggest-container"><input id="path-preview" disabled></div>',
        ] as $html) {
            self::assertSame($html, Craft6Autosuggest::unwrapPreviews($html));
        }
    }
}
