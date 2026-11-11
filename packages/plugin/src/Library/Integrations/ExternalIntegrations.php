<?php

namespace Solspace\Freeform\Library\Integrations;

use Composer\InstalledVersions;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormIconService;
use verbb\vizy\base\Node;
use verbb\vizy\services\Extensions;

class ExternalIntegrations
{
    public const DEFINITIONS = [
        'ckeditor' => ['name' => 'CKEditor', 'package' => 'craftcms/ckeditor', 'min' => '5.9.0', 'max' => '6.0.0', 'support' => '5.9+', 'description' => 'Insert forms directly into rich-text content using a Freeform Form toolbar button.'],
        'vizy' => ['name' => 'Vizy', 'package' => 'verbb/vizy', 'min' => '4.0.0', 'max' => '5.0.0', 'support' => '4.x', 'description' => 'Insert native Freeform Form nodes from the editor toolbar.'],
        'navigation' => ['name' => 'Navigation', 'package' => 'verbb/navigation', 'min' => '3.0.0', 'max' => '5.0.0', 'support' => '3.x–4.x', 'description' => 'Select Freeform forms as menu nodes for rendering in your site templates.'],
        'craft-link' => ['name' => 'Craft Link', 'package' => null, 'min' => '5.3.0', 'max' => '6.0.0', 'support' => 'Craft 5.3+', 'description' => 'Select a Freeform Form in Craft’s built-in Link field.'],
        'hyper' => ['name' => 'Hyper', 'package' => 'verbb/hyper', 'min' => '2.0.0', 'max' => '4.0.0', 'support' => '2.x–3.x', 'description' => 'Select Freeform forms using the Freeform Form link type.'],
        'linkit' => ['name' => 'Linkit', 'package' => 'presseddigital/linkit', 'min' => '5.0.0', 'max' => '6.0.0', 'support' => '5.x', 'description' => 'Select Freeform forms using the Freeform Form link type.'],
    ];

    public const FIELD_CONTAINERS = [
        'content-block' => ['name' => 'Content Block', 'package' => null, 'min' => '5.8.0', 'max' => '6.0.0', 'support' => 'Craft 5.8+', 'description' => 'Add a Freeform Form field to the content block’s field layout.'],
        'matrix' => ['name' => 'Matrix', 'package' => null, 'min' => '5.0.0', 'max' => '6.0.0', 'support' => 'Craft 5', 'description' => 'Add a Freeform Form field to a nested entry type.'],
        'neo' => ['name' => 'Neo', 'package' => 'spicyweb/craft-neo', 'min' => '5.0.0', 'max' => '6.0.0', 'support' => '5.x', 'description' => 'Add a Freeform Form field to a Neo block type.'],
    ];

    public function __construct(private ?Settings $settings = null, private ?FormIconService $icons = null) {}

    public function isEnabled(string $integration): bool
    {
        return isset(self::DEFINITIONS[$integration])
            && BooleanHelper::normalize($this->settings()?->externalIntegrations[$integration] ?? true);
    }

    public function getCatalog(): array
    {
        $catalog = [];
        foreach (self::DEFINITIONS as $id => $definition) {
            $state = $this->pluginState($id, $definition);
            $status = self::status($definition, $state);
            $catalog[] = array_merge($definition, $state, [
                'id' => $id,
                'status' => $status,
                'available' => 'available' === $status,
                'compatible' => self::isCompatible($definition, $state),
                'enabled' => $this->isEnabled($id),
            ]);
        }

        return $catalog;
    }

    public function canRegister(string $id): bool
    {
        $definition = self::DEFINITIONS[$id] ?? null;
        if (!$definition || version_compare(\Craft::$app->getVersion(), '5.0', '<') || version_compare(\Craft::$app->getVersion(), '6.0', '>=')) {
            return false;
        }
        $version = null === $definition['package'] ? \Craft::$app->getVersion()
            : (InstalledVersions::isInstalled($definition['package']) ? InstalledVersions::getVersion($definition['package']) : null);

        return null !== $version && version_compare($version, $definition['min'], '>=') && version_compare($version, $definition['max'], '<');
    }

    public function getFieldContainers(): array
    {
        $catalog = [];
        foreach (self::FIELD_CONTAINERS as $id => $definition) {
            $state = $this->pluginState($id, $definition);
            $status = self::status($definition, $state);
            $catalog[] = array_merge($definition, $state, [
                'id' => $id,
                'status' => $status,
                'available' => 'available' === $status,
                'compatible' => self::isCompatible($definition, $state),
            ]);
        }

        return $catalog;
    }

    public static function status(array $definition, array $state): string
    {
        if (!$state['installed']) {
            return 'not-installed';
        }
        if (!$state['enabled']) {
            return 'plugin-disabled';
        }
        if (!self::isCompatible($definition, $state)) {
            return 'unsupported';
        }

        return 'available';
    }

    public static function isCompatible(array $definition, array $state): bool
    {
        return $state['installed'] && $state['craft5'] && $state['capable']
            && version_compare($state['version'], $definition['min'], '>=')
            && version_compare($state['version'], $definition['max'], '<');
    }

    public function getIconSvg(): string
    {
        $name = $this->settings()?->externalIntegrationIcon ?? '';
        if ('' !== $name) {
            $svg = ($this->icons ?? new FormIconService())->getSvg($name);
            if ($svg) {
                return $svg;
            }
        }

        return $this->getDefaultIconSvg();
    }

    public function editorConfig(array $config): array
    {
        if ($this->isEnabled('vizy')) {
            return $config;
        }
        $removeControl = static fn (array $items): array => array_values(array_filter($items, static fn ($item) => 'freeformForm' !== $item));
        $config['toolbar'] = $removeControl($config['toolbar'] ?? []);
        if (isset($config['bubble']['items'])) {
            $config['bubble']['items'] = $removeControl($config['bubble']['items']);
        }
        foreach ($config['dropdowns'] ?? [] as $name => $items) {
            $config['dropdowns'][$name] = $removeControl($items);
        }

        // Keep the node capability installed: saved JSON must still load.
        return $config;
    }

    public function getDefaultIconSvg(): string
    {
        return str_replace('fill="#fff"', 'fill="currentColor"', file_get_contents(\dirname(__DIR__, 2).'/icon-mask.svg'));
    }

    protected function pluginState(string $id, array $definition): array
    {
        $craft = \Craft::$app->getVersion();
        $native = null === $definition['package'];
        $plugins = \Craft::$app->getPlugins();
        $installed = $native || $plugins->isPluginInstalled($id);
        $enabled = $native || ($installed && $plugins->isPluginEnabled($id));
        $version = $native ? $craft : ($installed && InstalledVersions::isInstalled($definition['package']) ? InstalledVersions::getVersion($definition['package']) : '0');
        $capable = 'vizy' !== $id || (class_exists(Extensions::class) && method_exists(Node::class, 'renderOccurrenceHtml'));

        $displayVersion = $native ? $craft : ($installed && InstalledVersions::isInstalled($definition['package']) ? InstalledVersions::getPrettyVersion($definition['package']) : '');

        return ['installed' => $installed, 'enabled' => $enabled, 'version' => $version ?? '0', 'displayVersion' => $displayVersion, 'craft5' => version_compare($craft, '5.0', '>=') && version_compare($craft, '6.0', '<'), 'capable' => $capable];
    }

    private function settings(): ?Settings
    {
        return $this->settings ?? Freeform::getInstance()?->settings->getSettingsModel();
    }
}
