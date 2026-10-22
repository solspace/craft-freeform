<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversNothing]
class CodepackNavigationTest extends TestCase
{
    public function testPrimarySectionsAndTemplateEditLinksArePreserved(): void
    {
        $html = $this->render();
        foreach (['Forms', 'Examples'] as $label) {
            self::assertStringContainsString('>'.$label.'</a>', $html);
        }
        self::assertStringContainsString('href="/freeform-demo/forms" aria-current="page"', $html);
        self::assertStringContainsString('href="/freeform-demo/forms/tailwind-4-dark/contact/edit/test-token"', $html);
        self::assertStringContainsString('href="/freeform-demo/forms/default/contact/edit/test-token"', $html);
        self::assertStringNotContainsString('Custom templates', $html);
        self::assertStringNotContainsString('>Submissions</a>', $html);
        self::assertStringContainsString('data-dropdown-label="Forms"', $html);
        self::assertStringContainsString('data-dropdown-label="Formatting templates"', $html);
        self::assertStringContainsString('Contact &lt;team&gt;', $html);
        self::assertStringContainsString('aria-controls="freeform-primary-links"', $html);
    }

    public function testSubmissionNavigationKeepsItsFolderAndSpamIndicator(): void
    {
        $html = $this->render('submissions', true);
        self::assertStringContainsString('href="/freeform-demo/forms" aria-current="page"', $html);
        self::assertStringContainsString('href="/freeform-demo/submissions/contact"', $html);
        self::assertStringContainsString('Spam folder', $html);
        self::assertStringNotContainsString('data-dropdown-label="Formatting templates"', $html);
        self::assertStringNotContainsString('Spam folder', $this->render('submissions'));
    }

    public function testAssignedTemplateAndExamplesHaveTheCorrectSelections(): void
    {
        $assigned = $this->render('forms', false, 'default');
        self::assertStringContainsString('href="/freeform-demo/forms/default/contact"', $assigned);
        self::assertStringContainsString('aria-current="page" href="/freeform-demo/forms/default/contact/edit/test-token"', $assigned);
        self::assertStringContainsString('Form default', $assigned);
        self::assertStringNotContainsString('/custom/', $assigned);
        $examples = $this->render('extras');
        self::assertStringContainsString('data-dropdown-label="Examples"', $examples);
        self::assertStringContainsString('href="/freeform-demo/extras/date-pickers" class="active" aria-current="page"', $examples);
        self::assertStringNotContainsString('data-dropdown-label="Forms"', $examples);
    }

    public function testAssignedAndLegacyRoutesKeepTheFormsBuilderTemplate(): void
    {
        foreach ([['forms', 'default', 'contact'], ['forms', 'basic-dark', 'contact'], ['custom', 'contact']] as $route) {
            [$html, $freeform] = $this->renderLayout($route);
            $template = 'custom' === $route[0] ? 'default' : $route[1];
            self::assertStringContainsString('forms|'.$template.'|contact', $html);
            self::assertSame('default' === $template ? null : 'basic-dark/index.twig', $freeform->renderProperties['formattingTemplate']);
        }
    }

    public function testInitialOverviewUsesBasicLightAndMarksOnlyBareFormsForPreferenceRestoration(): void
    {
        [$html] = $this->renderLayout(['forms']);
        self::assertStringContainsString('forms|basic-light|', $html);
        self::assertStringContainsString('data-demo-preview-implicit', $html);
        self::assertStringContainsString('data-demo-preview="basic-light"', $html);
        self::assertStringContainsString('/forms/basic-light/contact', $html);
        [$explicit] = $this->renderLayout(['forms', 'default']);
        self::assertStringNotContainsString('data-demo-preview-implicit', $explicit);
        self::assertStringContainsString('data-demo-preview="default"', $explicit);
    }

    public function testAssignedSampleLoadsItsDependenciesAndThemeWithoutChangingRenderProperties(): void
    {
        foreach ([
            ['bootstrap-5-dark', 'bootstrap@5.3.8', true],
            ['tailwind-4-light', '@tailwindcss/browser@4.3.3', false],
            ['daisyui-5-dark', 'daisyui@5.7.27', true],
            ['foundation-6', 'foundation-sites@6.8.1', false],
            ['basic-dark', null, true],
        ] as [$template, $dependency, $dark]) {
            [$html, $freeform] = $this->renderLayout(['forms', 'default', 'contact'], $template.'/index.twig');
            self::assertNull($freeform->renderProperties['formattingTemplate']);
            self::assertSame($dark, str_contains($html, 'data-theme="dark"'));
            self::assertSame('bootstrap-5-dark' === $template, str_contains($html, 'data-bs-theme="dark"'));
            if ($dependency) {
                self::assertStringContainsString($dependency, $html);
            }
            self::assertStringContainsString('The template’s styles and required framework assets are loaded automatically', $html);
            self::assertStringNotContainsString('This demo doesn’t automatically load your site’s CSS or JavaScript.', $html);
        }
    }

    public function testAssignedTemplateNoticeUsesSampleNamesAndCustomFilenames(): void
    {
        [$sample] = $this->renderLayout(['forms', 'default', 'contact'], 'bootstrap-5-dark/index.twig');
        self::assertStringContainsString('Bootstrap 5 Dark', $sample);
        foreach (['whatever-custom.twig', 'bootstrap-5-dark/index.twig', 'missing/template.twig', null] as $assigned) {
            [$html] = $this->renderLayout(['forms', 'default', 'contact', 'edit', 'test-token'], $assigned, true);
            self::assertStringContainsString($assigned ? basename($assigned) : 'No formatting template assigned.', $html);
            self::assertStringNotContainsString('bootstrap@5.3.8', $html);
            self::assertStringNotContainsString('data-theme="dark"', $html);
            self::assertStringContainsString('/forms/basic-light/contact/edit/test-token', $html);
            self::assertSame(null !== $assigned, str_contains($html, 'This demo doesn’t automatically load your site’s CSS or JavaScript.'));
        }
    }

    private function renderLayout(array $route, ?string $assigned = null, bool $custom = false): array
    {
        $request = new class(array_merge(['qa', 'demo'], $route)) {
            public string $hostInfo = 'https://example.test';
            public string $baseUrl = '';

            public function __construct(private array $segments) {}

            public function segment(int $number): ?string
            {
                return $this->segments[$number - 1] ?? null;
            }
        };
        $sample = $assigned ? (object) [
            'filePath' => '/plugin/formatting/'.$assigned,
            'fileName' => $assigned,
            'name' => ucwords(str_replace('-', ' ', explode('/', $assigned)[0])),
        ] : null;
        $freeform = new class($assigned, $custom, $sample) {
            public array $forms = [['id' => 1, 'handle' => 'contact', 'name' => 'Contact', 'color' => '#7352d6']];
            public array $renderProperties = [];
            public object $settingsService;

            public function __construct(private ?string $assigned, bool $custom, ?object $sample)
            {
                $this->settingsService = (object) [
                    'customFormTemplates' => $custom && $assigned ? [(object) ['filePath' => '/templates/'.$assigned, 'fileName' => $assigned]] : [],
                    'solspaceFormTemplates' => $sample ? [$sample] : [],
                ];
            }

            public function form(string $handle, array $properties): object
            {
                $this->renderProperties = $properties;
                TestCase::assertSame('contact', $handle);

                return (object) ['name' => 'Contact', 'handle' => $handle, 'settings' => ['general' => ['formattingTemplate' => $this->assigned]]];
            }
        };
        $twig = new Environment(new ArrayLoader([
            'demo/_layout' => str_replace('%prefix%', 'qa/demo', file_get_contents(__DIR__.'/../../codepack/templates/_layout.twig')),
            'demo/_navigation' => file_get_contents(__DIR__.'/../../codepack/templates/_navigation.twig'),
            'demo/forms/_template-context' => file_get_contents(__DIR__.'/../../codepack/templates/forms/_template-context.twig'),
            'page' => '{% extends "demo/_layout" %}{% block content %}{{ demoArea }}|{{ pageTemplate }}|{{ formHandle }}{% if formHandle and pageTemplate == "default" %}{% include "demo/forms/_template-context" %}{% endif %}{% endblock %}',
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addGlobal('craft', (object) ['app' => (object) ['request' => $request]]);
        $html = $twig->render('page', [
            'siteUrl' => 'https://example.test/', 'pageTitle' => 'Test',
            'freeform' => $freeform, 'craft' => (object) ['app' => (object) ['request' => $request]],
        ]);

        return [$html, $freeform];
    }

    private function render(string $area = 'forms', bool $spam = false, string $template = 'basic-light'): string
    {
        $templates = __DIR__.'/../../codepack/templates';
        $twig = new Environment(new ArrayLoader([
            'navigation' => file_get_contents($templates.'/_navigation.twig'),
            'demo/extras/_items.twig' => file_get_contents($templates.'/extras/_items.twig'),
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $request = new class($area, $template) {
            public function __construct(private string $area, private string $template) {}

            public function segment(int $number): ?string
            {
                return [1 => 'freeform-demo', 2 => $this->area, 3 => 'forms' === $this->area ? $this->template : ('extras' === $this->area ? 'date-pickers' : 'contact'), 4 => 'contact', 5 => 'edit', 6 => 'test-token'][$number] ?? null;
            }
        };
        $twig->addGlobal('craft', (object) ['app' => (object) ['request' => $request]]);
        $freeform = new class {
            public function submissions(array $criteria): object
            {
                return (object) ['count' => 73];
            }
        };

        return $twig->render('navigation', [
            'demoBaseUrl' => '/freeform-demo',
            'assetBaseUrl' => '/assets/freeform-demo',
            'demoArea' => $area,
            'formHandle' => 'contact',
            'form' => ['name' => 'Contact <team>', 'color' => '#7352d6'],
            'forms' => [['id' => 1, 'handle' => 'contact', 'name' => 'Contact <team>', 'color' => '#7352d6']],
            'pageTemplate' => $template,
            'baseUrlSegments' => 1,
            'spamMode' => $spam,
            'craft' => (object) ['app' => (object) ['request' => $request]],
            'freeform' => $freeform,
        ]);
    }
}
