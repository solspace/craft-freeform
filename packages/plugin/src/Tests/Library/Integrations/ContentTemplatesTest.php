<?php

namespace Solspace\Freeform\Tests\Library\Integrations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Markup;

#[CoversNothing]
class ContentTemplatesTest extends TestCase
{
    public function testCkeditorUsesASeparateInstanceForEachNestedEntry(): void
    {
        $forms = $this->forms();
        $twig = $this->twig($forms);
        $selection = (object) ['id' => 12, 'dateArchived' => null];

        $first = $twig->render('freeform-integrations/ckeditor.twig', ['entry' => (object) ['uid' => 'first', 'freeformForm' => $selection]]);
        $second = $twig->render('freeform-integrations/ckeditor.twig', ['entry' => (object) ['uid' => 'second', 'freeformForm' => $selection]]);

        self::assertStringContainsString('id="ckeditor-first"', $first);
        self::assertStringContainsString('id="ckeditor-second"', $second);
        self::assertSame(['ckeditor-first', 'ckeditor-second'], array_column($forms->calls, 2));
        self::assertSame('ckeditor-first-', $forms->calls[0][1]['fieldIdPrefix']);
        self::assertSame('freeform-ckeditor-second', $forms->calls[1][1]['attributes']['id']);
    }

    public function testVizySupportsDirectV3FieldsAndTheV4BlockObject(): void
    {
        $forms = $this->forms();
        $twig = $this->twig($forms);
        $selection = (object) ['id' => 12, 'dateArchived' => null];

        $v3 = $twig->render('freeform-integrations/vizy.twig', ['attrs' => ['id' => 'third'], 'freeformForm' => $selection]);
        $v4 = $twig->render('freeform-integrations/vizy.twig', ['block' => (object) ['uid' => 'fourth', 'freeformForm' => $selection]]);

        self::assertStringContainsString('id="vizy-third"', $v3);
        self::assertStringContainsString('id="vizy-fourth"', $v4);
        self::assertSame(['vizy-third', 'vizy-fourth'], array_column($forms->calls, 2));
        self::assertSame('vizy-third-', $forms->calls[0][1]['fieldIdPrefix']);
        self::assertSame('freeform-vizy-fourth', $forms->calls[1][1]['attributes']['id']);
    }

    public function testCustomFieldHandlesAndRenderPropertiesReachTheForm(): void
    {
        $forms = $this->forms();
        $twig = $this->twig($forms);
        $selection = (object) ['id' => 12, 'dateArchived' => null];
        $properties = ['formattingTemplate' => 'bootstrap-5/index.twig', 'attributes' => ['class' => 'custom-form']];

        $twig->render('freeform-integrations/ckeditor.twig', [
            'entry' => (object) ['uid' => 'first', 'contactForm' => $selection],
            'freeformFieldHandle' => 'contactForm',
            'renderProperties' => $properties,
        ]);
        $twig->render('freeform-integrations/vizy.twig', [
            'attrs' => ['id' => 'second'], 'contactForm' => $selection,
            'freeformFieldHandle' => 'contactForm', 'renderProperties' => $properties,
        ]);

        foreach ($forms->calls as [, $actualProperties]) {
            self::assertSame('bootstrap-5/index.twig', $actualProperties['formattingTemplate']);
            self::assertSame('custom-form', $actualProperties['attributes']['class']);
            self::assertArrayHasKey('id', $actualProperties['attributes']);
        }
    }

    public function testEmptyDeletedAndArchivedSelectionsDoNotRender(): void
    {
        $forms = $this->forms();
        $twig = $this->twig($forms);

        foreach ([null, (object) ['id' => 12, 'dateArchived' => new \DateTimeImmutable()], (object) ['id' => 999, 'dateArchived' => null]] as $selection) {
            foreach (['ckeditor', 'vizy'] as $template) {
                $context = ['uid' => 'missing', 'freeformForm' => $selection];
                $html = $twig->render('freeform-integrations/'.$template.'.twig', ['entry' => (object) $context, 'block' => (object) $context]);
                self::assertSame('', trim($html));
            }
        }

        self::assertCount(2, $forms->calls, 'Only non-archived references should be resolved.');
    }

    public function testNavigationDisclosureEscapesItsTitleAndUsesItsOwnFormInstance(): void
    {
        $forms = $this->forms();
        $html = $this->twig($forms)->render('freeform-integrations/navigation.twig', [
            'node' => (object) ['uid' => 'menu-item', 'title' => '<script>Contact</script>', 'selectedForm' => (object) ['id' => 12, 'dateArchived' => null]],
        ]);

        self::assertStringContainsString('<details>', $html);
        self::assertStringContainsString('&lt;script&gt;Contact&lt;/script&gt;', $html);
        self::assertStringNotContainsString('<script>', $html);
        self::assertStringContainsString('id="navigation-menu-item"', $html);
    }

    private function twig(object $forms): Environment
    {
        $templates = [];
        foreach (glob(__DIR__.'/../../../Bundles/Integrations/Content/Templates/*.twig') as $file) {
            $name = 'freeform-integrations/'.basename($file, '.twig');
            $templates[$name] = $templates[$name.'.twig'] = file_get_contents($file);
        }

        $twig = new Environment(new ArrayLoader($templates), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addGlobal('craft', (object) ['freeform' => $forms]);

        return $twig;
    }

    private function forms(): object
    {
        return new class {
            public array $calls = [];

            public function form(int $id, array $properties, string $uniqueId): ?object
            {
                $this->calls[] = [$id, $properties, $uniqueId];

                return 999 === $id ? null : new class($uniqueId) {
                    public function __construct(private string $id) {}

                    public function render(): Markup
                    {
                        return new Markup('<form id="'.$this->id.'"></form>', 'UTF-8');
                    }
                };
            }

            public function formFromLink(object $node): ?object
            {
                return $node->selectedForm ?? null;
            }
        };
    }
}
