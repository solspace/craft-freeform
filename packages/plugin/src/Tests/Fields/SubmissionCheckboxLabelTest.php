<?php

namespace Solspace\Freeform\Tests\Fields;

use craft\helpers\HtmlPurifier;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

#[CoversNothing]
class SubmissionCheckboxLabelTest extends TestCase
{
    private mixed $originalApp;

    protected function setUp(): void
    {
        $this->originalApp = \Yii::$app;
        \Yii::$app = new class {
            public function getRuntimePath(): string
            {
                return sys_get_temp_dir();
            }
        };
    }

    protected function tearDown(): void
    {
        \Yii::$app = $this->originalApp;
    }

    public function testRichLabelKeepsSafeFormattingThroughTheCheckboxMacro(): void
    {
        $html = $this->render('Accept <a href="https://example.com/terms" target="_blank">terms</a> and <strong>conditions</strong><br><u>Read first</u>.');
        self::assertStringContainsString('href="https://example.com/terms"', $html);
        self::assertStringContainsString('<strong>conditions</strong>', $html);
        self::assertStringContainsString('<u>Read first</u>', $html);
        self::assertStringContainsString('noopener', $html);
        self::assertStringNotContainsString('&lt;a', $html);
    }

    public function testUnsafeLabelMarkupCannotReachTheControlPanel(): void
    {
        $html = $this->render('Accept <a href="javascript:alert(1)" onclick="alert(2)">terms</a><script>alert(3)</script><img src="x" onerror="alert(4)"><input autofocus><span style="position:fixed">!</span>');
        foreach (['javascript:', 'onclick', '<script', '<img', '<input', 'style='] as $unsafe) {
            self::assertStringNotContainsString($unsafe, $html);
        }
        self::assertStringContainsString('terms', $html);
    }

    public function testPlainTextAndEncodedMarkupRemainLiteralText(): void
    {
        $html = $this->render('Research & development &lt;strong&gt;literal&lt;/strong&gt;');
        self::assertStringContainsString('Research &amp; development &lt;strong&gt;literal&lt;/strong&gt;', $html);
        self::assertStringNotContainsString('<strong>', $html);
    }

    private function render(string $label): string
    {
        $twig = new Environment(new ArrayLoader([
            'checkbox' => file_get_contents(__DIR__.'/../../templates/submissions/fields/checkbox.twig'),
            '_includes/forms' => '{% macro checkboxField(options) %}<label>{{ options.label }}</label>{% endmacro %}{% macro field(options, input) %}{{ input }}{% endmacro %}',
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFilter(new TwigFilter('purify', [HtmlPurifier::class, 'process'], ['is_safe' => ['html']]));

        return $twig->render('checkbox', [
            'field' => ['label' => $label, 'handle' => 'accept', 'defaultValue' => 'yes', 'required' => false],
            'submission' => new class(['accept' => null]) extends \ArrayObject {
                public function errors(string $handle): array
                {
                    return [];
                }
            },
        ]);
    }
}
