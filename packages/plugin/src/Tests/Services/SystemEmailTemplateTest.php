<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class SystemEmailTemplateTest extends TestCase
{
    public function testDigestHtmlAndTextLinkToActivityAndShowRetentionWithoutExposingPayloads(): void
    {
        [$twig, $variables] = $this->templates();
        foreach (['digest', 'digest-text'] as $name) {
            $html = $twig->render($name, $variables);
            self::assertStringContainsString('Mail transport rejected email', $html);
            self::assertStringContainsString('https://craft5.test/admin/freeform/activity?view=events', $html);
            self::assertStringContainsString('kept for 7 days', $html);
            $variables['fullDigest'] = false;
            self::assertStringNotContainsString('Mail transport rejected email', $twig->render($name, $variables));
            $variables['fullDigest'] = true;
        }
    }

    public function testCriticalErrorEmailIncludesSelectedLogReviewLink(): void
    {
        [$twig, $variables] = $this->templates();
        $html = $twig->render('critical', $variables + [
            'log' => ['message' => 'Mail transport rejected email', 'shortMessage' => 'Mail transport rejected email', 'level' => 'ERROR', 'channel' => 'Activity: email', 'datetime' => new \DateTimeImmutable(), 'contextDump' => '', 'fingerprint' => 'qa'],
            'exception' => null, 'request' => null, 'site' => ['name' => 'QA', 'handle' => 'default', 'baseUrl' => 'https://craft5.test', 'environment' => 'dev'], 'cooldownSeconds' => 3600,
            'logReview' => ['url' => 'https://craft5.test/admin/freeform/activity?view=events&resolution=open&level=error', 'label' => 'View Activity Log'],
        ]);
        self::assertStringContainsString('View Activity Log', $html);
        self::assertStringContainsString('resolution=open', $html);
        self::assertStringContainsString('recorded a <b>ERROR</b> event', $html);
    }

    private function templates(): array
    {
        $root = __DIR__.'/../../templates/_templates/email/';
        $digest = NotificationTemplate::fromFile($root.'digest.twig');
        $critical = NotificationTemplate::fromFile($root.'error-report.twig', false);
        $templates = ['digest' => $digest->body, 'digest-text' => $digest->textBody, 'critical' => $critical->body];
        foreach (['digest', 'solspace', 'macros'] as $name) {
            $templates['freeform/_templates/email/layout/'.$name] = file_get_contents($root.'layout/'.$name.'.twig');
        }
        $twig = new Environment(new ArrayLoader($templates), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static fn ($text, $category = null, $params = []) => strtr($text, array_combine(array_map(static fn ($key) => '{'.$key.'}', array_keys($params)), array_values($params)))));
        $twig->addFilter(new TwigFilter('truncater', static fn ($text, $limit) => mb_substr($text, 0, $limit)));
        $twig->addFilter(new TwigFilter('datetime', static fn ($date) => $date->format('Y-m-d H:i')));
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($path, $params = []) => 'https://craft5.test/admin/'.$path));

        return [$twig, [
            'craft' => ['freeform' => ['name' => 'Freeform'], 'app' => ['language' => 'en', 'systemName' => 'QA']], 'freeform' => ['name' => 'Freeform'],
            'daily' => true, 'fullDigest' => true, 'rangeStart' => new \DateTimeImmutable('-1 day'), 'rangeEnd' => new \DateTimeImmutable(),
            'forms' => [], 'updates' => [], 'loggingStyle' => 'activity', 'activityRetentionDays' => 7,
            'errors' => [['level' => 'Error', 'channel' => 'Email', 'date' => new \DateTimeImmutable(), 'message' => 'Mail transport rejected email', 'url' => 'https://craft5.test/admin/freeform/activity?view=events&eventId=262']],
        ]];
    }
}
