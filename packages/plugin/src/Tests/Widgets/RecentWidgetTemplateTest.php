<?php

namespace Solspace\Freeform\Tests\Widgets;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class RecentWidgetTemplateTest extends TestCase
{
    public function testRendersAnEvaluatedSubmissionArrayWithSevenRecords(): void
    {
        $submissions = [];
        for ($id = 7; $id >= 1; --$id) {
            $submissions[] = new class($id) {
                public int $formId = 10;
                public int $statusId = 1;
                public string $title = 'Customer <request>';
                public array $statusModel = ['name' => 'Pending', 'color' => 'blue'];
                public \DateTimeImmutable $dateCreated;

                public function __construct(public int $id)
                {
                    $this->dateCreated = new \DateTimeImmutable('2026-10-21T12:00:00+00:00');
                }

                public function getCpEditUrl(): string
                {
                    return '/admin/freeform/submissions/'.$this->id;
                }
            };
        }

        $html = $this->render($submissions);

        self::assertSame(7, substr_count($html, 'data-recent-row '));
        self::assertStringContainsString('href="/admin/freeform/submissions/7"', $html);
        self::assertStringContainsString('href="/admin/freeform/submissions/1"', $html);
        self::assertStringContainsString('Customer &lt;request&gt;', $html);
        self::assertStringContainsString('Contact &amp; support', $html);
        self::assertStringNotContainsString('No submissions yet.', $html);
    }

    public function testRendersAnEmptySubmissionArray(): void
    {
        $html = $this->render([]);

        self::assertStringContainsString('No submissions yet.', $html);
        self::assertStringNotContainsString('data-recent-row ', $html);
        self::assertStringContainsString('data-recent-refresh', $html);
    }

    private function render(array $submissions): string
    {
        $template = file_get_contents(__DIR__.'/../../templates/_widgets/recent/body.html');
        // Asset registration runs in Craft; these tests exercise the rendered widget body.
        $template = preg_replace('/{% js %}.*?{% endjs %}/s', '', $template);
        $twig = new Environment(new ArrayLoader(['recent' => $template]), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static fn (string $message): string => $message));
        $twig->addFilter(new TwigFilter('date', static fn (\DateTimeInterface $date, string $format): string => $date->format('short' === $format ? 'Y-m-d' : $format)));
        $twig->addFilter(new TwigFilter('datetime', static fn (\DateTimeInterface $date): string => $date->format('Y-m-d H:i:s')));
        $twig->addFunction(new TwigFunction('cpUrl', static fn (string $path): string => '/admin/'.$path));

        return $twig->render('recent', [
            'submissions' => $submissions,
            'settings' => ['showFilters' => true, 'showPagination' => true],
            'widgetId' => 1,
            'pageSize' => 5,
            'formNames' => [10 => 'Contact & support'],
            'formFilterOptions' => [10 => 'Contact & support'],
            'selectedFormId' => null,
            'craft' => ['app' => ['language' => 'en', 'timeZone' => 'UTC']],
            'view' => new class {
                public function registerAssetBundle(string $class): void {}
            },
        ]);
    }
}
