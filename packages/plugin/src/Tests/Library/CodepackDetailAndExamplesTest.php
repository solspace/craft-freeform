<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Tests\Fixtures\CodepackSubmission;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversNothing]
class CodepackDetailAndExamplesTest extends TestCase
{
    public function testDetailPreservesEscapingValuesAndActionDestinations(): void
    {
        $context = CodepackSubmissionsTest::context();
        $context['submission'] = new CodepackSubmission();
        $html = $this->twig()->render('demo/submissions/_detail.twig', $context);
        self::assertStringContainsString('href="/freeform-demo/submissions/contact"', $html);
        self::assertStringContainsString('/forms/default/contact/edit/token-1042', $html);
        self::assertStringContainsString('/submissions/delete/contact/token-1042', $html);
        self::assertStringContainsString('Contact &lt;team&gt;', $html);
        self::assertStringContainsString('&lt;script&gt;', $html);
        self::assertStringNotContainsString('<script>', $html);
        self::assertStringContainsString('Sales inquiry', $html);
        self::assertStringContainsString('Not provided', $html);
        self::assertStringContainsString('2026-10-19T14:30:00+00:00', $html);
    }

    public function testSpamAndNonProDetailsPreserveActionRestrictions(): void
    {
        $context = CodepackSubmissionsTest::context(spam: true);
        $context['submission'] = new CodepackSubmission();
        $html = $this->twig()->render('demo/submissions/_detail.twig', $context);
        self::assertStringContainsString('href="/freeform-demo/submissions/contact/spam"', $html);
        self::assertStringContainsString('Flagged as spam', $html);
        self::assertStringNotContainsString('/edit/', $html);
        self::assertStringNotContainsString('/delete/', $html);
        $context = CodepackSubmissionsTest::context(pro: false);
        $context['submission'] = new CodepackSubmission();
        $html = $this->twig()->render('demo/submissions/_detail.twig', $context);
        self::assertStringNotContainsString('/edit/', $html);
        self::assertStringNotContainsString('/delete/', $html);
    }

    public function testExamplesCatalogRendersSearchableCardsAndCustomPrefixLinks(): void
    {
        $html = $this->twig()->render('demo/extras/_items.twig', ['mode' => 'browser', 'demoBaseUrl' => '/nested/demo']);
        self::assertSame(19, substr_count($html, 'data-browser-item '));
        self::assertSame(5, substr_count($html, 'data-browser-group aria-labelledby'));
        self::assertSame(1, substr_count($html, 'href="/nested/demo/extras/manual-form"'));
        self::assertStringContainsString('data-browser-noun="examples"', $html);
        self::assertStringContainsString('data-browser-view="list"', $html);
        self::assertStringContainsString('aria-label="Search examples"', $html);
        self::assertStringContainsString('href="/nested/demo/extras/manual-form"', $html);
        self::assertStringContainsString('Data &amp; relations', $html);
    }

    public function testDetailRendersFilesAndTableCellsWithoutLosingValues(): void
    {
        $context = CodepackSubmissionsTest::context();
        $context['submission'] = new class extends CodepackSubmission {
            public function offsetExists(mixed $offset): bool
            {
                return \in_array($offset, ['files', 'table'], true);
            }

            public function getIterator(): \Traversable
            {
                yield (object) ['handle' => 'files', 'label' => 'Attachments', 'type' => 'file-dnd'];

                yield (object) ['handle' => 'table', 'label' => 'Items', 'type' => 'table', 'tableLayout' => [['label' => 'Quantity'], ['label' => 'Options']]];
            }

            public function offsetGet(mixed $offset): mixed
            {
                return match ($offset) {
                    'files' => (object) ['value' => [1, 2, 3]],
                    'table' => (object) ['value' => [[0, ['One', '<Two>']]]],
                };
            }
        };
        $context['craft'] = (object) ['assets' => new class {
            public function id(int $id): object
            {
                return new class($id) {
                    public function __construct(private int $id) {}

                    public function one(): ?object
                    {
                        return match ($this->id) {
                            1 => (object) ['kind' => 'image', 'url' => '/photo.png', 'title' => 'Photo', 'filename' => 'photo.png'],
                            2 => (object) ['kind' => 'pdf', 'url' => '/brief.pdf', 'title' => 'Brief', 'filename' => 'brief.pdf'],
                            default => null,
                        };
                    }
                };
            }
        }];
        $html = $this->twig()->render('demo/submissions/_detail.twig', $context);
        self::assertStringContainsString('src="/photo.png"', $html);
        self::assertStringContainsString('href="/brief.pdf"', $html);
        self::assertStringContainsString('brief.pdf</span>', $html);
        self::assertStringNotContainsString('No files available', $html);
        self::assertStringContainsString('<td>0</td>', $html);
        self::assertStringContainsString('One, &lt;Two&gt;', $html);
    }

    private function twig(): Environment
    {
        $templates = [];
        foreach (['submissions/_detail.twig', 'extras/_items.twig', 'extras/_browser.twig'] as $path) {
            $templates['demo/'.$path] = file_get_contents(__DIR__.'/../../codepack/templates/'.$path);
        }
        $loader = new ArrayLoader($templates);

        return new Environment($loader, ['autoescape' => 'html', 'strict_variables' => true]);
    }
}
