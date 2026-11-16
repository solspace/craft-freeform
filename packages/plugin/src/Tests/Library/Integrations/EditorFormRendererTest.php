<?php

namespace Solspace\Freeform\Tests\Library\Integrations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Integrations\Editors\EditorFormRenderer;

#[CoversNothing]
class EditorFormRendererTest extends TestCase
{
    public function testRendersOnlyCanonicalPlaceholdersAndPreservesSurroundingContent(): void
    {
        $app = \Craft::$app;
        \Craft::$app = (object) ['charset' => 'UTF-8'];

        try {
            $renderer = new class extends EditorFormRenderer {
                public array $calls = [];

                public function renderForm(mixed $id, array $properties = []): string
                {
                    $this->calls[] = [$id, $properties];

                    return 'form-'.$id;
                }
            };
            $content = '<p>Before {{ untouched }}</p><div data-freeform-form="5"></div><p>Between</p><div data-freeform-form="5"></div><p>After</p>';
            self::assertSame('<p>Before {{ untouched }}</p>form-5<p>Between</p>form-5<p>After</p>', (string) $renderer->renderContent($content, ['formattingTemplate' => 'custom.twig']));
            self::assertSame([['5', ['formattingTemplate' => 'custom.twig']], ['5', ['formattingTemplate' => 'custom.twig']]], $renderer->calls);

            $ordinary = '<div data-freeform-form="0"></div><div data-freeform-form="-5"></div><div data-freeform-form="5" class="authored"></div><div data-freeform-form="5">Authored content</div>&lt;div data-freeform-form="5"&gt;&lt;/div&gt;';
            self::assertSame($ordinary, (string) $renderer->renderContent($ordinary));
            self::assertCount(2, $renderer->calls);
        } finally {
            \Craft::$app = $app;
        }
    }

    public function testRejectsNonScalarFormIdsWithoutResolvingForms(): void
    {
        $renderer = new EditorFormRenderer();
        foreach ([null, [], (object) ['formId' => 5], true] as $id) {
            self::assertSame('', $renderer->renderForm($id));
        }
    }
}
