<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\BuilderSampleTemplate;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversClass(BuilderSampleTemplate::class)]
class BuilderSampleTemplateTest extends TestCase
{
    public function testCreatesAReusableTwigFragmentWithoutOverwritingExistingSamples(): void
    {
        $directory = sys_get_temp_dir().'/freeform-builder-sample-'.bin2hex(random_bytes(5));
        mkdir($directory);

        try {
            $first = BuilderSampleTemplate::createIn($directory, 'hero');
            $firstContent = file_get_contents($directory.'/'.$first);
            $second = BuilderSampleTemplate::createIn($directory, 'hero');

            self::assertSame('sample-hero.twig', $first);
            self::assertSame('sample-hero-2.twig', $second);
            self::assertSame($firstContent, file_get_contents($directory.'/'.$first));
            self::assertStringContainsString('{# name: Hero #}', $firstContent);
            self::assertStringContainsString('{# description:', $firstContent);
            self::assertStringContainsString("{{ now|date('l') }}", $firstContent);
            self::assertStringNotContainsString('<html', $firstContent);

            foreach (array_keys(BuilderSampleTemplate::SAMPLES) as $sample) {
                $name = BuilderSampleTemplate::createIn($directory, $sample);
                $content = file_get_contents($directory.'/'.$name);
                self::assertStringContainsString('{# name:', $content);
                self::assertStringContainsString('{# description:', $content);
                self::assertStringNotContainsString('<html', $content);
                $twig = new Environment(new ArrayLoader([$name => $content]));
                $html = $twig->render($name, [
                    'now' => new \DateTimeImmutable(),
                    'currentSite' => ['name' => 'Pixel Pantry'],
                    'siteUrl' => '/',
                ]);
                self::assertStringContainsString('</', $html);
            }
            self::assertCount(5, BuilderSampleTemplate::SAMPLES);
        } finally {
            foreach (glob($directory.'/*.twig') ?: [] as $file) {
                unlink($file);
            }
            rmdir($directory);
        }
    }

    public function testRejectsUnknownSampleNames(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        BuilderSampleTemplate::createIn(sys_get_temp_dir(), '../elsewhere');
    }
}
