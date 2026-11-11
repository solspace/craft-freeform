<?php

namespace Solspace\Freeform\Tests\Library\Integrations;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Translation\ArrayLoader;
use Illuminate\Translation\Translator;
use Illuminate\Validation\Factory;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormIconService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(ExternalIntegrations::class)]
class ExternalIntegrationsTest extends TestCase
{
    use UsesCraft6Container;

    protected function setUp(): void
    {
        app()->instance(ValidationFactory::class, new Factory(new Translator(new ArrayLoader(), 'en'), app()));
    }

    public function testIntegrationsDefaultToEnabledAndHonorSavedOffValues(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $service = new ExternalIntegrations($settings);
        foreach (array_keys(ExternalIntegrations::DEFINITIONS) as $id) {
            self::assertTrue($service->isEnabled($id));
        }
        foreach ([false, 0, '0', '', 'false'] as $off) {
            $settings->externalIntegrations = ['ckeditor' => $off];
            self::assertFalse($service->isEnabled('ckeditor'));
            self::assertTrue($service->isEnabled('vizy'));
        }
        self::assertFalse($service->isEnabled('unknown'));
    }

    public function testAvailabilityDistinguishesMissingDisabledAndUnsupportedPlugins(): void
    {
        $definition = ExternalIntegrations::DEFINITIONS['ckeditor'];
        $state = ['installed' => true, 'enabled' => true, 'craft6' => true, 'capable' => true, 'version' => '5.9.0'];
        self::assertSame('available', ExternalIntegrations::status($definition, $state));
        self::assertSame('not-installed', ExternalIntegrations::status($definition, array_replace($state, ['installed' => false])));
        self::assertSame('plugin-disabled', ExternalIntegrations::status($definition, array_replace($state, ['enabled' => false])));
        foreach ([['version' => '5.8.0'], ['version' => '6.0.0'], ['craft6' => false], ['capable' => false]] as $change) {
            self::assertSame('unsupported', ExternalIntegrations::status($definition, array_replace($state, $change)));
        }
    }

    public function testGlobalIconDefaultsToTheLogoAndFallsBackWhenAnIconIsUnavailable(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $icons = $this->createMock(FormIconService::class);
        $icons->method('getSvg')->willReturnMap([['rectangle-list', '<svg>form</svg>'], ['unknown', null]]);
        $service = new ExternalIntegrations($settings, $icons);
        $logo = $service->getIconSvg();
        self::assertStringContainsString('fill="currentColor"', $logo);
        self::assertStringContainsString('viewBox="0 0 64 64"', $logo);
        $settings->externalIntegrationIcon = 'rectangle-list';
        self::assertSame('<svg>form</svg>', $service->getIconSvg());
        $settings->externalIntegrationIcon = 'unknown';
        self::assertSame($logo, $service->getIconSvg());
        $settings->externalIntegrationIcon = '';
        self::assertSame($logo, $service->getIconSvg());
    }

    public function testInvalidSettingKeysAndIconPathsAreRejected(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $settings->defaults = new Defaults();
        $settings->externalIntegrations = ['hyper' => '', 'linkit' => '0'];
        self::assertTrue($settings->validate(['externalIntegrations', 'externalIntegrationIcon']));
        $settings->externalIntegrations = ['unknown' => true];
        self::assertFalse($settings->validate(['externalIntegrations']));
        $settings->externalIntegrationIcon = '../icon.svg';
        self::assertFalse($settings->validate(['externalIntegrationIcon']));
    }

    public function testDisablingVizyRemovesInsertionControlsAndPreservesTheContentSchema(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $config = ['capabilities' => ['nodes' => ['paragraph', 'freeformForm']], 'toolbar' => ['bold', 'freeformForm'], 'bubble' => ['enabled' => true, 'items' => ['freeformForm', 'link']], 'dropdowns' => ['custom' => ['bold', 'freeformForm']]];
        $service = new ExternalIntegrations($settings);
        self::assertSame($config, $service->editorConfig($config));
        $settings->externalIntegrations = ['vizy' => false];
        $disabled = $service->editorConfig($config);
        self::assertSame($config['capabilities'], $disabled['capabilities']);
        self::assertSame(['bold'], $disabled['toolbar']);
        self::assertSame(['enabled' => true, 'items' => ['link']], $disabled['bubble']);
        self::assertSame(['bold'], $disabled['dropdowns']['custom']);
    }

    public function testNativeIntegrationRegistrationRespectsCraftVersions(): void
    {
        $previous = \Craft::$app;

        try {
            foreach (['4.16.0' => false, '5.2.0' => false, '5.3.0' => false, '5.12.0.1' => false, '6.0.0-alpha.18' => false, '6.0.0-alpha.19' => true, '6.0.0' => true, '7.0.0' => false] as $version => $supported) {
                \Craft::$app = new class($version) {
                    public function __construct(private string $version) {}

                    public function getVersion(): string
                    {
                        return $this->version;
                    }
                };
                self::assertSame($supported, (new ExternalIntegrations())->canRegister('craft-link'));
            }
        } finally {
            \Craft::$app = $previous;
        }
    }

    public function testUnavailablePluginsRetainTheirPreferencesWithoutChangingDefaults(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $service = new class($settings) extends ExternalIntegrations {
            protected function pluginState(string $id, array $definition): array
            {
                return ['installed' => 'hyper' !== $id, 'enabled' => true, 'version' => $definition['min'], 'craft6' => true, 'capable' => true];
            }
        };
        $catalog = array_column($service->getCatalog(), null, 'id');
        self::assertSame('not-installed', $catalog['hyper']['status']);
        self::assertFalse($catalog['hyper']['available']);
        self::assertTrue($catalog['hyper']['enabled']);
        self::assertSame([], $settings->externalIntegrations);
        $settings->externalIntegrations = ['hyper' => false];
        $catalog = array_column($service->getCatalog(), null, 'id');
        self::assertFalse($catalog['hyper']['enabled']);
    }

    public function testFieldContainerAvailabilityDoesNotCreateAuthoringPreferences(): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $service = new class($settings) extends ExternalIntegrations {
            public array $neoState = [];

            protected function pluginState(string $id, array $definition): array
            {
                $state = ['installed' => true, 'enabled' => true, 'version' => $definition['min'], 'displayVersion' => $definition['min'], 'craft6' => true, 'capable' => true];

                return 'neo' === $id ? array_replace($state, $this->neoState) : $state;
            }
        };
        $catalog = array_column($service->getFieldContainers(), null, 'id');
        self::assertSame(['content-block', 'matrix', 'neo'], array_keys($catalog));
        foreach ($catalog as $container) {
            self::assertSame('available', $container['status']);
        }
        self::assertCount(6, $service->getCatalog());
        self::assertFalse($service->isEnabled('neo'));
        self::assertSame([], $settings->externalIntegrations);

        $service->neoState = ['installed' => false];
        $catalog = array_column($service->getFieldContainers(), null, 'id');
        self::assertSame('not-installed', $catalog['neo']['status']);
        self::assertFalse($catalog['neo']['available']);
        self::assertFalse($catalog['neo']['compatible']);
        self::assertTrue($catalog['matrix']['available']);

        $service->neoState = ['enabled' => false];
        $catalog = array_column($service->getFieldContainers(), null, 'id');
        self::assertSame('plugin-disabled', $catalog['neo']['status']);
        self::assertFalse($catalog['neo']['available']);
        self::assertTrue($catalog['neo']['compatible']);

        $service->neoState = ['enabled' => false, 'version' => '4.0.0'];
        $catalog = array_column($service->getFieldContainers(), null, 'id');
        self::assertSame('plugin-disabled', $catalog['neo']['status']);
        self::assertFalse($catalog['neo']['compatible']);

        $service->neoState = ['version' => '4.0.0'];
        $catalog = array_column($service->getFieldContainers(), null, 'id');
        self::assertSame('unsupported', $catalog['neo']['status']);
        self::assertFalse($catalog['neo']['compatible']);
        self::assertSame([], $settings->externalIntegrations);
    }
}
