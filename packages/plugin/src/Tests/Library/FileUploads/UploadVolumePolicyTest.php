<?php

namespace Solspace\Freeform\Tests\Library\FileUploads;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Options\AssetSourceOptions;
use Solspace\Freeform\Fields\Implementations\Options\UploadSourceOptions;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Implementations\ValueGenerators\AssetSourceGenerator;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use yii\di\Container;

/**
 * @coversNothing
 */
class UploadVolumePolicyTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousContainer;
    private Settings $settings;
    private UploadVolumePolicy $policy;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousContainer = \Craft::$container;
        $this->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $service = $this->createMock(SettingsService::class);
        $service->method('getSettingsModel')->willReturn($this->settings);
        $this->policy = new UploadVolumePolicy($service);
        $volumes = new class {
            public array $viewable;
            private array $all;

            public function __construct()
            {
                $this->viewable = [
                    3 => (object) ['id' => 1, 'handle' => 'uploads', 'name' => 'Uploads'],
                    8 => (object) ['id' => 2, 'handle' => 'forms', 'name' => 'Forms'],
                ];
                $this->all = $this->viewable;
            }

            public function getViewableVolumes(): array
            {
                return $this->viewable;
            }

            public function getVolumeById(int $id): ?object
            {
                return array_column($this->all, null, 'id')[$id] ?? null;
            }
        };
        \Craft::$app = new class($volumes) {
            public string $language = 'en';

            public function __construct(private object $volumes) {}

            public function getI18n(): object
            {
                return new class {
                    public function translate($category, $message, $params, $language): string
                    {
                        return $message;
                    }
                };
            }

            public function getVolumes(): object
            {
                return $this->volumes;
            }
        };
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Craft::$container = $this->previousContainer;
    }

    public function testAllVolumesRemainAvailableByDefaultAndAssetChoicesStayIndependent(): void
    {
        self::assertSame([1, 2], array_column($this->policy->getViewableVolumes(), 'id'));
        self::assertSame([], $this->policy->validatePayload($this->payload()));
        self::assertNull($this->policy->defaultSource(null));
        $this->settings->allowedUploadVolumes = ['forms'];
        self::assertSame([['value' => '2', 'label' => 'Forms']], (new UploadSourceOptions($this->policy))->fetchOptions(null)->toArray());
        self::assertCount(2, (new AssetSourceOptions())->fetchOptions(null));
        self::assertSame(2, (new AssetSourceGenerator($this->policy))->generateValue(null, null));
        self::assertSame(2, $this->policy->defaultSource(1));
        self::assertSame(2, $this->policy->defaultSource(2));
        self::assertFalse($this->policy->allowsSource('1'));
        self::assertTrue($this->policy->allowsSource('2'));
        self::assertTrue($this->policy->allowsSource(null));
        self::assertFalse($this->policy->allowsSource(999));
    }

    public function testEmptyOrMissingVolumesNeverFallBackToAnUnrestrictedDestination(): void
    {
        foreach (['none', [], ['deletedVolume']] as $allowed) {
            $this->settings->allowedUploadVolumes = $allowed;
            self::assertSame([], $this->policy->getViewableVolumes());
            self::assertNull($this->policy->defaultSource(1));
            self::assertNull((new AssetSourceGenerator($this->policy))->generateValue(null, null));
            self::assertFalse($this->policy->allowsSource(1));
        }
        $this->settings->allowedUploadVolumes = ['forms'];
        unset(\Craft::$app->getVolumes()->viewable[8]);
        self::assertSame([], $this->policy->getViewableVolumes());
        self::assertNull($this->policy->defaultSource(null));
        self::assertNull($this->policy->defaultSource(2));
    }

    public function testSaveRejectsUploadAndTableDestinationsIncludingTranslatedValues(): void
    {
        $this->settings->allowedUploadVolumes = ['forms'];
        $payload = $this->payload();
        $errors = $this->policy->validatePayload($payload);
        self::assertSame(['upload', 'drag', 'table'], array_keys($errors));
        self::assertArrayHasKey('assetSourceId', $errors['upload']);
        self::assertArrayHasKey('tableLayout', $errors['table']);
        foreach ($payload->layout->fields as $field) {
            $field->properties->assetSourceId = 2;
            if (isset($field->properties->tableLayout)) {
                $field->properties->tableLayout[0]->metadata->assetSourceId = 2;
            }
        }
        self::assertSame([], $this->policy->validatePayload($payload));
        $payload->translations = (object) ['2' => (object) ['fields' => (object) [
            'upload' => (object) ['assetSourceId' => 1],
            'table' => (object) ['tableLayout' => [(object) ['type' => 'file', 'metadata' => (object) ['assetSourceId' => 1]]]],
        ]]];
        self::assertSame(['upload', 'table'], array_keys($this->policy->validatePayload($payload)));
        // Validation never silently rewrites a destination.
        self::assertSame(1, $payload->translations->{'2'}->fields->upload->assetSourceId);
    }

    public function testNewFieldsUseAllowedDefaultsAndLoadedFieldsKeepSavedDestinations(): void
    {
        $this->settings->allowedUploadVolumes = ['forms'];
        $container = new Container();
        $container->set(UploadVolumePolicy::class, $this->policy);
        \Craft::$container = $container;
        $defaults = $this->createMock(DefaultsProvider::class);
        $defaults->method('getValue')->willReturn(1);
        $checker = $this->createMock(LimitedUserChecker::class);
        $checker->method('can')->willReturn(true);
        $provider = $this->getMockBuilder(PropertyProvider::class)
            ->setConstructorArgs([$this->createMock(ImplementationProvider::class), $defaults, $checker])
            ->onlyMethods(['getPluginEdition'])->getMock()
        ;
        $provider->method('getPluginEdition')->willReturn(new EditionHelper('pro', ['express', 'lite', 'pro']));
        // Exercise the property pipeline without unrelated File Upload controls.
        $new = $provider->getEditableProperties(UploadSourceFixture::class)->get('assetSourceId');
        self::assertSame(2, $new->value);
        $saved = $provider->getEditableProperties(new UploadSourceFixture())->get('assetSourceId');
        self::assertSame(1, $saved->value);
    }

    private function payload(): object
    {
        $fields = [];
        foreach (['upload' => FileUploadField::class, 'drag' => FileDragAndDropField::class, 'table' => TableField::class, 'text' => TextField::class] as $uid => $type) {
            $fields[] = (object) ['uid' => $uid, 'typeClass' => $type, 'properties' => (object) [
                'assetSourceId' => 1,
                'tableLayout' => [(object) ['type' => 'file', 'metadata' => (object) ['assetSourceId' => 1]]],
            ]];
        }

        return (object) ['layout' => (object) ['fields' => $fields]];
    }
}

class UploadSourceFixture
{
    #[DefaultValue('props.file.source')]
    #[ValueGenerator(AssetSourceGenerator::class)]
    #[Select(options: UploadSourceOptions::class)]
    public ?int $assetSourceId = 1;
}
