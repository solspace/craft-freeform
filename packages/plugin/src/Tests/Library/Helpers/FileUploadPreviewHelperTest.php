<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use craft\elements\Asset;
use craft\models\Volume;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\FileUploadPreviewHelper;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

#[CoversClass(FileUploadPreviewHelper::class)]
class FileUploadPreviewHelperTest extends TestCase
{
    private mixed $originalApp;
    private object $assets;

    protected function setUp(): void
    {
        $this->originalApp = \Craft::$app;
        $this->assets = new class {
            public array $items = [];
            public array $lookups = [];
            public bool $unavailable = false;

            public function getAssetById(int $id): ?Asset
            {
                $this->lookups[] = $id;
                if ($this->unavailable) {
                    throw new \RuntimeException('Asset lookup unavailable');
                }

                return $this->items[$id] ?? null;
            }

            public function getThumbUrl(Asset $asset, int $width, int $height): string
            {
                return '/file-icon.svg';
            }
        };
        \Craft::$app = (object) ['assets' => $this->assets];
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->originalApp;
    }

    public function testEmptyUploadsDoNotProduceWarningsOrLookups(): void
    {
        foreach ([[], null, '', 0, [null, '', 0, -1, false, [], 'invalid']] as $value) {
            $this->assertSame([], FileUploadPreviewHelper::getPreviews($value));
        }
        $this->assertSame([], $this->assets->lookups);
    }

    public function testDeletedAssetKeepsItsReferenceAndWarns(): void
    {
        $previews = FileUploadPreviewHelper::getPreviews('42');
        $this->assertSame(42, $previews[0]['id']);
        $this->assertNull($previews[0]['asset']);
        $this->assertSame('Uploaded asset #{id} no longer exists.', $previews[0]['warning']);
        $this->assertSame(['id' => 42], $previews[0]['parameters']);
    }

    public function testMissingFileNamesTheAffectedUpload(): void
    {
        $this->assets->items[42] = $asset = $this->asset(false);
        $preview = FileUploadPreviewHelper::getPreviews([42])[0];
        $this->assertSame($asset, $preview['asset']);
        $this->assertSame('The file for “{filename}” (asset #{id}) is missing.', $preview['warning']);
        $this->assertSame(['id' => 42, 'filename' => 'receipt.pdf'], $preview['parameters']);
    }

    public function testHealthyAndMissingUploadsAreCheckedIndependently(): void
    {
        $this->assets->items[41] = $this->asset(true);
        $this->assets->items[42] = $this->asset(false);
        $previews = FileUploadPreviewHelper::getPreviews([41, '42', 43, 41]);
        $this->assertSame([41, 42, 43], array_column($previews, 'id'));
        $this->assertNull($previews[0]['warning']);
        $this->assertNotNull($previews[1]['warning']);
        $this->assertNotNull($previews[2]['warning']);
        $this->assertSame([41, 42, 43], $this->assets->lookups);
    }

    public function testUnavailableStorageIsNotReportedAsMissing(): void
    {
        $this->assets->items[42] = $this->asset(new \RuntimeException('Private filesystem configuration'));
        $preview = FileUploadPreviewHelper::getPreviews([42])[0];
        $this->assertSame('The file for asset #{id} could not be checked. Its storage may be unavailable.', $preview['warning']);
        $this->assertStringNotContainsString('Private', $preview['warning']);
    }

    public function testAssetLookupFailuresDoNotBreakTheEditor(): void
    {
        $this->assets->unavailable = true;
        $preview = FileUploadPreviewHelper::getPreviews([42])[0];
        $this->assertSame('The file for asset #{id} could not be checked. Its storage may be unavailable.', $preview['warning']);
    }

    public function testBothUploadTemplatesKeepReferencesAndSkipMissingThumbnails(): void
    {
        $this->assets->items[42] = $this->asset(false, '<img src=x onerror=alert(1)>.pdf');
        $previews = FileUploadPreviewHelper::getPreviews([42, 43]);
        foreach (['file', 'file-dnd'] as $template) {
            $html = $this->render($template, $previews);
            $this->assertSame(2, substr_count($html, 'ff-submission-upload-warning'));
            $this->assertStringContainsString('name="attachment[]" value="42"', $html);
            $this->assertStringContainsString('name="attachment[]" value="43"', $html);
            $this->assertStringContainsString('&lt;img', $html);
            $this->assertStringNotContainsString('<img', $html);
            $this->assertStringNotContainsString('No files uploaded', $html);
            $this->assertStringContainsString('type="file"', $html);
            $this->assertStringContainsString('Remove file reference', $html);
        }
    }

    public function testEmptyUploadStillShowsTheNormalEmptyState(): void
    {
        $html = $this->render('file', []);
        $this->assertStringContainsString('No files uploaded', $html);
        $this->assertStringNotContainsString('ff-submission-upload-warning', $html);
    }

    public function testHealthyUploadKeepsItsPreviewAndDownloadLink(): void
    {
        $asset = $this->asset(true);
        $asset->id = 42;
        $asset->title = 'Receipt';
        $asset->kind = 'pdf';
        $this->assets->items[42] = $asset;
        $html = $this->render('file', FileUploadPreviewHelper::getPreviews([42]));
        $this->assertStringNotContainsString('ff-submission-upload-warning', $html);
        $this->assertStringContainsString('data-asset-id="42"', $html);
        $this->assertStringContainsString('/file-icon.svg', $html);
        $this->assertStringContainsString('Receipt', $html);
    }

    private function asset(bool|\Throwable $exists, string $filename = 'receipt.pdf'): Asset
    {
        $volume = $this->createMock(Volume::class);
        if ($exists instanceof \Throwable) {
            $volume->method('fileExists')->willThrowException($exists);
        } else {
            $volume->expects($this->once())->method('fileExists')->with('uploads/receipt.pdf')->willReturn($exists);
        }
        $asset = $this->getMockBuilder(Asset::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getVolume', 'getPath', 'getFilename', 'getUrl'])
            ->getMock()
        ;
        $asset->method('getVolume')->willReturn($volume);
        $asset->method('getPath')->willReturn('uploads/receipt.pdf');
        $asset->method('getFilename')->willReturn($filename);
        $asset->expects($this->never())->method('getUrl');

        return $asset;
    }

    private function render(string $template, array $previews): string
    {
        $templates = [];
        foreach (['file', 'file-dnd'] as $name) {
            $templates['freeform/submissions/fields/'.$name] = file_get_contents(__DIR__.'/../../../templates/submissions/fields/'.$name.'.twig');
        }
        $twig = new Environment(new ArrayLoader($templates), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static function (string $message, string $domain, array $parameters = []): string {
            foreach ($parameters as $key => $value) {
                $message = str_replace('{'.$key.'}', (string) $value, $message);
            }

            return $message;
        }));

        return $twig->render('freeform/submissions/fields/'.$template, [
            'field' => ['label' => 'Attachment', 'handle' => 'attachment'],
            'uploadPreviews' => $previews,
            'craft' => ['app' => ['assets' => $this->assets]],
        ]);
    }
}
