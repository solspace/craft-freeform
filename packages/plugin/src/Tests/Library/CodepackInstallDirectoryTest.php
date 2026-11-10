<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\Components\AbstractFileComponent;
use Solspace\Freeform\Library\Codepack\Components\AssetsFileComponent;
use Solspace\Freeform\Library\Codepack\Components\TemplatesFileComponent;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use Symfony\Component\Filesystem\Filesystem;

#[CoversClass(AbstractFileComponent::class)]
class CodepackInstallDirectoryTest extends TestCase
{
    use UsesCraft6Container;

    private string $fixtureRoot;
    private mixed $previousApp;
    private ?string $previousDocumentRoot;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousDocumentRoot = $_SERVER['DOCUMENT_ROOT'] ?? null;
        $this->fixtureRoot = sys_get_temp_dir().'/freeform-install-path-'.bin2hex(random_bytes(6));
        foreach (['assets', 'templates'] as $type) {
            mkdir($this->fixtureRoot.'/source/'.$type, 0777, true);
            file_put_contents($this->fixtureRoot.'/source/'.$type.'/example.txt', 'Demo fixture');
        }
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        if (null === $this->previousDocumentRoot) {
            unset($_SERVER['DOCUMENT_ROOT']);
        } else {
            $_SERVER['DOCUMENT_ROOT'] = $this->previousDocumentRoot;
        }
        (new Filesystem())->remove($this->fixtureRoot);
    }

    #[TestWith(['web'])]
    #[TestWith(['public'])]
    #[TestWith(['public_html'])]
    public function testAssetPreviewMatchesTheActualInstallDestination(string $publicDirectory): void
    {
        $_SERVER['DOCUMENT_ROOT'] = $this->fixtureRoot.'/'.$publicDirectory;
        app()->usePublicPath($_SERVER['DOCUMENT_ROOT']);
        $component = new AssetsFileComponent($this->fixtureRoot.'/source');
        $previewDirectory = $component->getInstallDirectoryPath();
        $component->install('demo-custom');

        self::assertFileExists($previewDirectory.'/demo-custom/example.txt');
        self::assertSame('Demo fixture', file_get_contents($_SERVER['DOCUMENT_ROOT'].'/assets/demo-custom/example.txt'));
    }

    public function testTemplatePreviewUsesTheConfiguredTemplateDirectory(): void
    {
        $configuredDirectory = $this->fixtureRoot.'/custom-templates';
        \Craft::$app = (object) ['path' => new class($configuredDirectory) {
            public function __construct(private string $directory) {}

            public function getSiteTemplatesPath(): string
            {
                return $this->directory;
            }
        }];
        $component = new TemplatesFileComponent($this->fixtureRoot.'/source');
        $previewDirectory = $component->getInstallDirectoryPath();
        $component->install('demo-custom');

        self::assertFileExists($previewDirectory.'/demo-custom/example.txt');
        self::assertSame('Demo fixture', file_get_contents($configuredDirectory.'/demo-custom/example.txt'));
    }
}
