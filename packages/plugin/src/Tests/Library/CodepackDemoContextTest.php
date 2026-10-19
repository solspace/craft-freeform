<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Tests\Fixtures\CodepackSubmission;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Markup;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class CodepackDemoContextTest extends TestCase
{
    public function testDeleteStillRequiresAnAdminAndAPost(): void
    {
        foreach ([[false, true, 0], [true, false, 0], [true, true, 1]] as [$admin, $post, $expectedDeletes]) {
            $freeform = new class {
                public int $deletes = 0;

                public function submissions(array $criteria): object
                {
                    return (object) ['one' => new CodepackSubmission()];
                }

                public function deleteSubmissionByToken(string $token): bool
                {
                    ++$this->deletes;

                    return true;
                }
            };
            $request = new class($post) {
                public function __construct(public bool $isPost) {}

                public function segment(int $index): string
                {
                    return 'token-1042';
                }
            };
            $html = $this->twig()->render('demo/submissions/delete.twig', [
                'currentUser' => (object) ['admin' => $admin],
                'freeform' => $freeform,
                'craft' => (object) ['app' => (object) ['request' => $request]],
                'baseUrlSegments' => 1,
                'form' => $this->form(),
                'demoBaseUrl' => '/nested/demo',
                'colorMode' => 'light',
            ]);
            self::assertSame($expectedDeletes, $freeform->deletes);
            if (!$admin) {
                self::assertStringContainsString('do not have permission', $html);
                self::assertStringNotContainsString('method="post"', $html);
            } elseif (!$post) {
                self::assertStringContainsString('method="post"', $html);
                self::assertStringContainsString('name="test-csrf"', $html);
                self::assertStringContainsString('href="/nested/demo/submissions/contact/1042"', $html);
                self::assertStringContainsString('Contact &lt;team&gt;', $html);
            } else {
                self::assertStringContainsString('Submission deleted', $html);
                self::assertStringNotContainsString('method="post"', $html);
            }
        }
    }

    public function testDeleteFailureAndMissingEntryRemainRecoverable(): void
    {
        $context = ['demoBaseUrl' => '/demo', 'form' => $this->form(), 'submission' => new CodepackSubmission(), 'deleteAttempted' => true, 'deleted' => false];
        $html = $this->twig()->render('demo/submissions/_delete.twig', $context);
        self::assertStringContainsString('role="alert"', $html);
        self::assertStringContainsString('href="/demo/submissions/contact/1042"', $html);
        $context['submission'] = null;
        $context['deleteAttempted'] = false;
        $html = $this->twig()->render('demo/submissions/_delete.twig', $context);
        self::assertStringContainsString('Submission not found', $html);
        self::assertStringNotContainsString('method="post"', $html);
    }

    public function testEditHeaderUsesEntryContextAndKeepsTheSelectedTemplate(): void
    {
        $context = ['demoBaseUrl' => '/demo', 'form' => $this->form(), 'editingSubmission' => new CodepackSubmission(), 'pageTemplate' => 'basic-dark'];
        $html = $this->twig()->render('demo/forms/_edit-heading.twig', $context);
        self::assertStringContainsString('Editing submission #1042', $html);
        self::assertStringContainsString('href="/demo/submissions/contact/1042"', $html);
        self::assertStringContainsString('Contact &lt;team&gt;', $html);
        $context['editingSubmission'] = null;
        self::assertStringContainsString('href="/demo/forms/basic-dark/contact"', $this->twig()->render('demo/forms/_edit-heading.twig', $context));
    }

    public function testManualExampleRendersSetupAndBothPageControls(): void
    {
        foreach ([null, 0, 1] as $page) {
            $form = null === $page ? null : new class($page) {
                public object $currentPage;
                public bool $hasErrors = false;
                public array $renderProperties = [];

                public function __construct(int $page)
                {
                    $this->currentPage = (object) ['index' => $page];
                }

                public function get(string $handle): object
                {
                    return new class {
                        public string $label = 'Test field';
                        public string $value = 'test';
                        public bool $hasErrors = false;
                        public array $options = [['value' => 'test', 'label' => '<Option>']];

                        public function renderLabel(): Markup
                        {
                            return new Markup('<label for="company">Company</label>', 'UTF-8');
                        }

                        public function renderInput(): Markup
                        {
                            return new Markup('<input id="company" name="company">', 'UTF-8');
                        }

                        public function renderErrors(): string
                        {
                            return '';
                        }
                    };
                }

                public function renderTag(array $properties): Markup
                {
                    $this->renderProperties = $properties;

                    return new Markup('<form method="post">', 'UTF-8');
                }

                public function getRenderClosingTag(): Markup
                {
                    return new Markup('</form>', 'UTF-8');
                }
            };
            $freeform = new class($form) {
                public function __construct(private ?object $form) {}

                public function form(string $handle, array $properties): ?object
                {
                    return $this->form;
                }
            };
            $html = $this->twig()->render('demo/extras/manual-multipage.twig', ['freeform' => $freeform, 'pageTemplateFile' => 'basic-light/index.twig', 'demoBaseUrl' => '/nested/demo']);
            self::assertStringContainsString('Setup guide', $html);
            self::assertStringContainsString('freeformManualMultipage', $html);
            if (null === $page) {
                self::assertStringContainsString('Set up a form to try this example', $html);
                self::assertStringNotContainsString('<form', $html);
            } else {
                self::assertSame('/nested/demo/extras/manual-multipage', $form->renderProperties['returnUrl']);
                self::assertSame(['submitButtons'], $form->renderProperties['disable']);
                self::assertStringContainsString('aria-current="step"><span>'.($page + 1).'</span>', $html);
                self::assertStringContainsString('name="form_page_submit"', $html);
                self::assertSame(1 === $page, str_contains($html, 'name="form_previous_page_button"'));
                if (1 === $page) {
                    self::assertStringContainsString('&lt;Option&gt;', $html);
                    self::assertStringContainsString('formnovalidate', $html);
                }
            }
        }
    }

    private function form(): array
    {
        return ['id' => 1, 'handle' => 'contact', 'name' => 'Contact <team>'];
    }

    private function twig(): Environment
    {
        $templates = ['demo/_layout' => '{% block content %}{% endblock %}'];
        foreach (['submissions/delete.twig', 'submissions/_delete.twig', 'forms/_edit-heading.twig', 'extras/manual-multipage.twig', 'extras/_items.twig', 'extras/_example-header.twig', 'extras/_setup.twig', 'extras/_setup-notice.twig'] as $path) {
            $templates['demo/'.preg_replace('/\.twig$/', '', $path)] = file_get_contents(__DIR__.'/../../codepack/templates/'.$path);
            $templates['demo/'.$path] = $templates['demo/'.preg_replace('/\.twig$/', '', $path)];
        }
        $twig = new Environment(new ArrayLoader($templates), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFunction(new TwigFunction('csrfInput', static fn () => new Markup('<input type="hidden" name="test-csrf" value="test">', 'UTF-8')));
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));

        return $twig;
    }
}
