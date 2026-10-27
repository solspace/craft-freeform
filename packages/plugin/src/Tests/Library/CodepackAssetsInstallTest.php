<?php

namespace Solspace\Freeform\Tests\Library;

use Illuminate\Container\Container;
use Illuminate\Foundation\Application;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\Components\AssetsFileComponent;
use Symfony\Component\Filesystem\Filesystem;

#[CoversClass(AssetsFileComponent::class)]
class CodepackAssetsInstallTest extends TestCase
{
    public function testAssetsInstallIntoTheConfiguredPublicPathWithoutADocumentRoot(): void
    {
        $previous = Container::getInstance();
        $previousRoot = $_SERVER['DOCUMENT_ROOT'] ?? null;
        $directory = sys_get_temp_dir().'/freeform-codepack-'.bin2hex(random_bytes(8));
        $filesystem = new Filesystem();

        try {
            $application = new Application($directory);
            $application->usePublicPath($directory.'/custom-public');
            $_SERVER['DOCUMENT_ROOT'] = '';
            $filesystem->mkdir($directory.'/source/assets/css');
            file_put_contents($directory.'/source/assets/css/demo.css', 'body{background:url(/images/demo.png)} /* %prefix% */');

            $assets = new AssetsFileComponent($directory.'/source');
            $assets->install('demo-qa');

            $installed = $directory.'/custom-public/assets/demo-qa/css/demo.css';
            self::assertFileExists($installed);
            self::assertStringContainsString('/assets/demo-qa/images/demo.png', file_get_contents($installed));
            self::assertStringContainsString('/* demo-qa */', file_get_contents($installed));

            $_SERVER['DOCUMENT_ROOT'] = $directory.'/incorrect-root';
            $assets->install('demo-again');
            self::assertFileExists($directory.'/custom-public/assets/demo-again/css/demo.css');
            self::assertDirectoryDoesNotExist($directory.'/incorrect-root');
        } finally {
            Container::setInstance($previous);
            if (null === $previousRoot) {
                unset($_SERVER['DOCUMENT_ROOT']);
            } else {
                $_SERVER['DOCUMENT_ROOT'] = $previousRoot;
            }
            $filesystem->remove($directory);
        }
    }
}
