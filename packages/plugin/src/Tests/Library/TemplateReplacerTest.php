<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\TemplateReplacer;
use yii\helpers\FileHelper;

#[CoversClass(TemplateReplacer::class)]
class TemplateReplacerTest extends TestCase
{
    public function testEveryBundledSampleClonesWithoutBundledTwigDependencies(): void
    {
        $sourceRoot = \dirname(__DIR__, 2).'/templates/_templates/formatting';
        $root = sys_get_temp_dir().'/freeform-formatting-samples-'.bin2hex(random_bytes(5));
        $destination = $root.'/templates/_freeform/formatting';
        FileHelper::createDirectory($destination);
        $previous = \Craft::$app;
        \Craft::$app = (object) ['path' => new class($root) {
            public function __construct(private string $root) {}

            public function getSiteTemplatesPath(): string
            {
                return $this->root.'/templates';
            }
        }];

        try {
            foreach (glob($sourceRoot.'/*/index.twig') as $sample) {
                $sourceName = basename(\dirname($sample));
                $cloneName = 'custom-'.$sourceName;
                (new TemplateReplacer($sourceName.'/index.twig', $sourceRoot, $destination, $cloneName))->replace();
                $clone = $destination.'/'.$cloneName;

                self::assertFileExists($clone.'/_layout.twig', $sourceName);
                self::assertFileExists($clone.'/_main.css', $sourceName);
                self::assertFileExists($clone.'/_main.js', $sourceName);
                self::assertFileDoesNotExist($clone.'/_tailwind.css', $sourceName);

                $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($clone, \FilesystemIterator::SKIP_DOTS));
                foreach ($files as $file) {
                    if ('twig' !== $file->getExtension()) {
                        continue;
                    }

                    $content = file_get_contents($file->getPathname());
                    self::assertStringNotContainsString('freeform/_templates/formatting/', $content, $file->getPathname());
                    preg_match_all('~_freeform/formatting/[^\s\x27\x22]+\.twig~', $content, $references);
                    foreach ($references[0] as $reference) {
                        self::assertFileExists($root.'/templates/'.$reference, $file->getPathname());
                    }
                }
            }
        } finally {
            \Craft::$app = $previous;
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST,
            );

            foreach ($files as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }

            rmdir($root);
        }
    }

    public function testCustomNameRewritesNestedTwigAndAssetPathsWithoutOverwriting(): void
    {
        $root = sys_get_temp_dir().'/freeform-formatting-clone-'.bin2hex(random_bytes(5));
        $source = $root.'/samples/basic-light';
        $destination = $root.'/templates/_freeform/formatting';
        FileHelper::createDirectory($source.'/fields');
        FileHelper::createDirectory($destination);
        file_put_contents($root.'/samples/_layout.twig', '{% import rowTemplate as rowMacro %}');
        file_put_contents($source.'/index.twig', "{% do view.registerAssetBundle('BasicLight') %}\n{% include 'freeform/_templates/formatting/basic-light/fields/group.twig' %}");
        file_put_contents($source.'/fields/group.twig', "{% import 'freeform/_templates/formatting/basic-light/_row.twig' as row %}");
        file_put_contents($source.'/fields/layout.twig', "{% include 'freeform/_templates/formatting/_layout.twig' with { rowTemplate: 'freeform/_templates/formatting/basic-light/_row.twig' } %}");
        file_put_contents($source.'/.DS_Store', 'ignore');
        $previous = \Craft::$app;
        \Craft::$app = (object) ['path' => new class($root) {
            public function __construct(private string $root) {}

            public function getSiteTemplatesPath(): string
            {
                return $this->root.'/templates';
            }
        }];

        try {
            $replacer = new TemplateReplacer('basic-light/index.twig', $root.'/samples', $destination, 'my-template');
            self::assertSame('my-template', $replacer->replace());
            $index = file_get_contents($destination.'/my-template/index.twig');
            self::assertStringContainsString('_freeform/formatting/my-template/fields/group.twig', $index);
            self::assertStringContainsString('@templates/_freeform/formatting/my-template/_main.css', $index);
            self::assertStringContainsString('_freeform/formatting/my-template/_row.twig', file_get_contents($destination.'/my-template/fields/group.twig'));
            self::assertStringContainsString("'_freeform/formatting/my-template/_layout.twig'", file_get_contents($destination.'/my-template/fields/layout.twig'));
            self::assertSame('{% import rowTemplate as rowMacro %}', file_get_contents($destination.'/my-template/_layout.twig'));
            self::assertFileDoesNotExist($destination.'/my-template/.DS_Store');
            $this->expectException(\InvalidArgumentException::class);
            $replacer->replace();
        } finally {
            \Craft::$app = $previous;
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST,
            );

            foreach ($files as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }

            rmdir($root);
        }
    }
}
