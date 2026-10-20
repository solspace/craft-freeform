<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Tests\Fixtures\CodepackSubmission;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversNothing]
class CodepackSubmissionsTest extends TestCase
{
    public static function context(bool $spam = false, bool $pro = true, bool $empty = false): array
    {
        $pageInfo = new class {
            public int $total = 73;
            public int $first = 1;
            public int $last = 2;
            public int $totalPages = 2;
            public int $currentPage = 1;
            public ?string $prevUrl = null;
            public string $nextUrl = '/freeform-demo/submissions/contact/p2';

            public function getPrevUrls(int $distance): array
            {
                return [];
            }

            public function getNextUrls(int $distance): array
            {
                return [2 => $this->nextUrl];
            }
        };
        if ($empty) {
            $pageInfo->total = $pageInfo->last = $pageInfo->totalPages = 0;
        }

        return [
            'spamMode' => $spam,
            'demoBaseUrl' => '/freeform-demo',
            'form' => ['name' => 'Contact <team>', 'handle' => 'contact', 'color' => '#7352d6', 'iconSvg' => null],
            'freeform' => new class($pro) {
                public function __construct(public bool $pro) {}
            },
            'submissionCount' => 73,
            'spamCount' => 0,
            'submissions' => $empty ? [] : [new CodepackSubmission(), new CodepackSubmission(1041)],
            'pageInfo' => $pageInfo,
        ];
    }

    public function testRecordsKeepTheirRoutesPaginationAndEscapedValues(): void
    {
        $html = $this->render(self::context());
        self::assertStringContainsString('href="/freeform-demo/submissions/contact/1042"', $html);
        self::assertStringContainsString('href="/freeform-demo/forms/default/contact/edit/token-1042"', $html);
        self::assertStringContainsString('href="/freeform-demo/submissions/delete/contact/token-1042"', $html);
        self::assertStringContainsString('href="/freeform-demo/submissions/contact/p2"', $html);
        self::assertStringContainsString('Contact &lt;team&gt;', $html);
        self::assertStringContainsString('&lt;script&gt;', $html);
        self::assertStringNotContainsString('<script>', $html);
        self::assertStringContainsString('Sales inquiry', $html);
        self::assertStringContainsString('colspan="9"', $html);
    }

    public function testSpamLinksPreserveTheFolderAndDoNotOfferMutationActions(): void
    {
        $html = $this->render(self::context(spam: true));
        self::assertStringContainsString('/contact/1042/spam', $html);
        self::assertStringContainsString('Flagged as spam', $html);
        self::assertStringNotContainsString('/delete/', $html);
        self::assertStringNotContainsString('/edit/', $html);
        self::assertStringContainsString('colspan="8"', $html);
    }

    public function testNonProEditionsDoNotOfferMutationActions(): void
    {
        $html = $this->render(self::context(pro: false));
        self::assertStringNotContainsString('/delete/', $html);
        self::assertStringNotContainsString('/edit/', $html);
    }

    public function testEmptyFoldersHaveAppropriateMessagesAndColumnCounts(): void
    {
        $html = $this->render(self::context(empty: true));
        self::assertStringContainsString('No submissions yet', $html);
        self::assertStringContainsString('colspan="5"', $html);
        self::assertStringNotContainsString('data-submissions-search', $html);
        self::assertStringContainsString('No spam to review', $this->render(self::context(spam: true, empty: true)));
    }

    private function render(array $context): string
    {
        $template = file_get_contents(__DIR__.'/../../codepack/templates/submissions/_table.twig');
        $twig = new Environment(new ArrayLoader(['table' => $template]), ['autoescape' => 'html', 'strict_variables' => true]);

        return $twig->render('table', $context);
    }
}
