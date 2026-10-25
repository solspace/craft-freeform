<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\MessageTemplateSamples;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversClass(MessageTemplateSamples::class)]
class MessageTemplateSamplesTest extends TestCase
{
    public function testAllSamplesRenderWithTheirDocumentedVariables(): void
    {
        $twig = new Environment(new ArrayLoader(), ['strict_variables' => true]);
        $variables = [
            'form' => (object) ['name' => 'Contact'],
            'dateCreated' => new \DateTimeImmutable('2026-10-25 12:00:00'),
            'allFields' => [],
        ];

        foreach (['success', 'email'] as $type) {
            self::assertCount(4, MessageTemplateSamples::options($type));
            foreach (MessageTemplateSamples::options($type) as $id => $option) {
                $sample = MessageTemplateSamples::get($type, $id);
                self::assertSame($option['fileName'], $sample['fileName']);
                self::assertStringContainsString('<', $twig->createTemplate($sample['content'])->render($variables));
                if ('email' === $type) {
                    self::assertStringContainsString('{# subject:', $sample['content']);
                    self::assertStringContainsString('{# text #}', $sample['content']);
                    self::assertStringContainsString('__placeholderFromEmail__', $sample['content']);
                }
            }
        }

        self::assertNull(MessageTemplateSamples::get('email', '../default'));
    }
}
