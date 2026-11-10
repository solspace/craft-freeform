<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class CodepackInstallerTemplateTest extends TestCase
{
    #[TestWith(['en'])]
    #[TestWith(['de'])]
    #[TestWith(['fr'])]
    #[TestWith(['it'])]
    #[TestWith(['nl'])]
    public function testInstallerRendersTranslatedMessagesAndRegistersItsJavascriptMessages(string $locale): void
    {
        $messages = require __DIR__.'/../../translations/'.$locale.'/freeform.php';
        $templates = [];
        foreach (glob(__DIR__.'/../../templates/codepack/*.twig') as $path) {
            $templates['freeform/codepack/'.basename($path, '.twig')] = file_get_contents($path);
        }
        $templates['freeform/_layouts/settings'] = '{% block content %}{% endblock %}';
        $templates['_includes/forms'] = '{% macro textField(options) %}<label>{{ options.label }}</label><p>{{ options.instructions }}</p><input id="{{ options.id }}" value="{{ options.value }}">{% endmacro %}';
        $view = new class {
            public array $registered = [];

            public function registerTranslations(string $category, array $strings): void
            {
                $this->registered[$category] = $strings;
            }
        };
        $twig = new Environment(new ArrayLoader($templates), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static function (string $text, string $category, array $parameters = []) use ($messages): string {
            $translated = 'freeform' === $category ? ($messages[$text] ?? $text) : $text;
            foreach ($parameters as $name => $value) {
                $translated = str_replace('{'.$name.'}', (string) $value, $translated);
            }

            return $translated;
        }));
        $twig->addFunction(new TwigFunction('url', static fn ($path) => '/admin/'.$path));
        $twig->addFunction(new TwigFunction('alias', static fn () => '/srv/project'));
        $twig->addFunction(new TwigFunction('redirectInput', static fn () => ''));
        $twig->addFunction(new TwigFunction('csrfInput', static fn () => ''));
        $folder = static fn (string $name) => [
            'name' => $name,
            'isFolder' => true,
            'fileCount' => 1,
            'files' => [['name' => '<example>.twig', 'isFolder' => false]],
        ];
        $html = $twig->render('freeform/codepack/index', [
            'craft' => ['freeform' => ['name' => 'Freeform']],
            'view' => $view,
            'codePack' => [
                'templates' => ['contents' => $folder('templates'), 'installDirectoryPath' => '/srv/project/templates'],
                'assets' => ['contents' => $folder('assets'), 'installDirectoryPath' => '/outside/public/assets'],
                'routes' => ['data' => [['urlPattern' => 'forms/{template}', 'template' => '/forms']]],
            ],
            'prefix' => 'demo-test',
            'readOnly' => false,
            'templatesExist' => true,
        ]);

        self::assertStringContainsString(htmlspecialchars($messages['Install demo templates'], \ENT_QUOTES), $html);
        self::assertStringContainsString(htmlspecialchars($messages['Folder already exists.'], \ENT_QUOTES), $html);
        self::assertStringContainsString(htmlspecialchars($messages['View all files'], \ENT_QUOTES), $html);
        self::assertStringContainsString('webroot/assets/<span data-prefix>demo-test</span>/', $html);
        self::assertStringNotContainsString('/srv/project', $html);
        self::assertStringNotContainsString('/outside/', $html);
        self::assertStringNotContainsString('<example>', $html);
        self::assertSame(2, substr_count($html, '&lt;example&gt;.twig'));
        self::assertSame(2, substr_count($html, 'data-name="/"'));
        self::assertContains('Show fewer files', $view->registered['freeform']);
        self::assertContains('Checking folder…', $view->registered['freeform']);
        self::assertContains('Couldn’t check this folder. Retry the check before installing.', $view->registered['freeform']);
        self::assertContains('Installation could not be confirmed. Check the demo folder before trying again.', $view->registered['freeform']);

        // Cover both template strings and the messages sent to Craft.t() in the browser.
        $strings = $view->registered['freeform'];
        foreach ($templates as $source) {
            preg_match_all('/([\'"])([^\'"\r\n]*)\1\|t\([\'"]freeform[\'"]/u', $source, $matches);
            array_push($strings, ...$matches[2]);
        }
        foreach (array_unique($strings) as $string) {
            self::assertArrayHasKey($string, $messages, $locale.': '.$string);
            self::assertNotSame('', $messages[$string]);
            preg_match_all('/\{\w+\}/', $string, $sourceParameters);
            preg_match_all('/\{\w+\}/', $messages[$string], $translatedParameters);
            self::assertEqualsCanonicalizing($sourceParameters[0], $translatedParameters[0], $locale.': '.$string);
        }
    }
}
