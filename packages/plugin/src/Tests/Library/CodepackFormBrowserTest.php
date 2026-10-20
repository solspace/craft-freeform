<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\FormIconService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversClass(FormIconService::class)]
class CodepackFormBrowserTest extends TestCase
{
    private mixed $previousCraftApp;

    protected function setUp(): void
    {
        $this->previousCraftApp = \Craft::$app;
        \Craft::$app = (object) ['charset' => 'UTF-8'];
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousCraftApp;
    }

    #[TestWith([true, 1])]
    #[TestWith([false, 0])]
    public function testSelectedIconsAndFallbacksRenderInTheSharedBrowser(bool $supported, int $expectedIcons): void
    {
        $icons = new class($supported) extends FormIconService {
            public function __construct(private bool $supported) {}

            protected function isSupported(): bool
            {
                return $this->supported;
            }

            protected function renderIcon(string $name): ?string
            {
                return 'envelope' === $name ? '<svg data-selected-icon="true" viewBox="0 0 24 24"><path d="M3 5h18v14H3z"/></svg>' : null;
            }
        };
        $freeform = new class {
            public function submissions(array $criteria): object
            {
                return (object) ['count' => 0];
            }
        };
        $forms = [];
        foreach (['envelope', '', 'unavailable-icon', '../invalid'] as $id => $icon) {
            $forms[] = [
                'id' => $id,
                'name' => 'Contact <team>',
                'handle' => 'contact-'.$id,
                'description' => '',
                'color' => '#7352d6',
                'iconSvg' => $icons->getMarkup($icon),
            ];
        }
        $template = file_get_contents(__DIR__.'/../../codepack/templates/_form-browser.twig');
        $twig = new Environment(new ArrayLoader(['browser' => $template]), ['autoescape' => 'html', 'strict_variables' => true]);
        $html = $twig->render('browser', [
            'forms' => $forms,
            'freeform' => $freeform,
            'browserArea' => 'forms',
            'browserTitle' => 'Forms',
            'browserDescription' => 'Choose a form.',
            'browserBaseUrl' => '/demo/forms/basic-light',
            'browserAction' => 'Try form',
            'browserSubmissionsUrl' => '/demo/submissions',
        ]);

        self::assertSame($expectedIcons, substr_count($html, 'data-selected-icon="true"'));
        self::assertSame(4 - $expectedIcons, substr_count($html, 'stroke-width="1.5"><rect x="5"'));
        self::assertStringContainsString('Contact &lt;team&gt;', $html);
        self::assertStringContainsString('href="/demo/forms/basic-light/contact-0"', $html);
        self::assertStringNotContainsString('&lt;svg', $html);
        self::assertStringContainsString('href="/demo/submissions/contact-0"', $html);
        self::assertStringContainsString('href="/demo/submissions/contact-0/spam"', $html);
        self::assertStringContainsString('aria-label="Try form: Contact &lt;team&gt;"', $html);
        self::assertSame(4, substr_count($html, '<article class="freeform-browser-item freeform-form-card"'));
        self::assertSame(12, substr_count($html, '<a '));
    }
}
