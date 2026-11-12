<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

#[CoversNothing]
class Craft6AppTemplateTest extends TestCase
{
    public function testFragmentLayoutKeepsTheClientRootAndSafelyEncodedConfiguration(): void
    {
        $template = file_get_contents(__DIR__.'/../../../templates/app/index.twig');
        // Isolate layout rendering from the unrelated control panel hook.
        $template = str_replace('{% hook "freeform.prepareCpTemplate" %}', '', $template);
        $twig = new Environment(new ArrayLoader([
            'app' => $template,
            'freeform/_layouts/main' => '{% block content %}{% endblock %}',
        ]), ['autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $config = ['templates' => ['method' => 'form'], 'name' => 'Form "name" </script><script>alert(1)</script>'];

        $html = $twig->render('app', ['config' => $config]);
        $dom = new \DOMDocument();
        @$dom->loadHTML($html);
        $element = $dom->getElementById('freeform-config');
        self::assertNotNull($element);
        self::assertSame($config, json_decode($element->getAttribute('data-config'), true, flags: \JSON_THROW_ON_ERROR));
        self::assertNotNull($dom->getElementById('freeform-client'));
        self::assertSame(0, $dom->getElementsByTagName('script')->length);
    }
}
