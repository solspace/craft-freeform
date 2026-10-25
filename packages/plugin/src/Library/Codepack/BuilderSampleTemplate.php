<?php

namespace Solspace\Freeform\Library\Codepack;

class BuilderSampleTemplate
{
    public const SAMPLES = [
        'navigation' => 'Navigation',
        'hero' => 'Hero',
        'feature-cards' => 'Feature Cards',
        'faq' => 'FAQ',
        'footer' => 'Footer',
        'sidebar' => 'Sidebar',
    ];

    public static function createIn(string $directory, string $sample): string
    {
        if (!isset(self::SAMPLES[$sample])) {
            throw new \InvalidArgumentException('Choose a valid sample template.');
        }

        $source = __DIR__.'/../../Resources/builder-samples/sample-'.$sample.'.twig';
        $content = file_get_contents($source);
        if (false === $content) {
            throw new \RuntimeException('Could not read the sample template.');
        }

        for ($suffix = 1; $suffix < 1000; ++$suffix) {
            $name = 'sample-'.$sample.($suffix > 1 ? '-'.$suffix : '').'.twig';
            $handle = @fopen($directory.'/'.$name, 'x');
            if (false === $handle) {
                if (is_file($directory.'/'.$name)) {
                    continue;
                }

                throw new \RuntimeException('Could not create a sample template in the configured directory.');
            }

            try {
                if (fwrite($handle, $content) !== \strlen($content)) {
                    throw new \RuntimeException('Could not write the sample template.');
                }
            } catch (\Throwable $exception) {
                fclose($handle);
                unlink($directory.'/'.$name);

                throw $exception;
            }
            fclose($handle);

            return $name;
        }

        throw new \RuntimeException('Too many sample templates already exist.');
    }
}
