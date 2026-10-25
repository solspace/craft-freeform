<?php

namespace Solspace\Freeform\Tests\Library;

use craft\helpers\FileHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\TemplateReplacer;

#[CoversClass(TemplateReplacer::class)]
class TemplateReplacerTest extends TestCase
{
    public function testCustomNameRewritesNestedTwigAndAssetPathsWithoutOverwriting(): void
    {
        $root = sys_get_temp_dir().'/freeform-formatting-clone-'.bin2hex(random_bytes(5));
        $source = $root.'/samples/basic-light';
        $destination = $root.'/templates/_freeform/formatting';
        FileHelper::createDirectory($source.'/fields');
        FileHelper::createDirectory($destination);
        file_put_contents($source.'/index.twig', "{% do view.registerAssetBundle('BasicLight') %}\n{% include 'freeform/_templates/formatting/basic-light/fields/group.twig' %}");
        file_put_contents($source.'/fields/group.twig', "{% import 'freeform/_templates/formatting/basic-light/_row.twig' as row %}");
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
