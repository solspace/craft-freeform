<?php

namespace Solspace\Freeform\Tests\Library\Integrations;

use CraftCms\Cms\Twig\TokenParsers\RegisterResourceTokenParser;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class ContentIntegrationsSettingsTemplateTest extends TestCase
{
    public function testSettingsCompileWithCraft6ResourceTags(): void
    {
        $twig = new Environment(new ArrayLoader([
            'settings' => file_get_contents(__DIR__.'/../../../templates/settings/_content-integrations.twig'),
        ]));
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        foreach (['url', 'redirectInput', 'csrfInput', 'hiddenInput'] as $name) {
            $twig->addFunction(new TwigFunction($name, static fn () => ''));
        }
        foreach (['css', 'js'] as $tag) {
            $parser = new RegisterResourceTokenParser($tag, 'noop');
            $parser->allowTagPair = true;
            $twig->addTokenParser($parser);
        }

        // Twig resolves function names while compiling, even in a skipped branch.
        self::assertNotEmpty($twig->compileSource($twig->getLoader()->getSourceContext('settings')));
    }
}
