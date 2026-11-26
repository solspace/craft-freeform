<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\models\Site;
use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Assets\Assets;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories\Categories;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Tags\Tags;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfiguration;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;

final class ChoiceSources
{
    public const FIELD_TYPES = ['dropdown', 'radios', 'checkboxes'];
    public const TYPES = ['entries', 'categories', 'tags', 'assets', 'predefined'];

    private const ELEMENTS = [
        'entries' => [Entries::class, 'sectionId'],
        'categories' => [Categories::class, 'groupId'],
        'tags' => [Tags::class, 'groupId'],
        'assets' => [Assets::class, 'assetSourceId'],
    ];

    public static function catalog(Site $site): array
    {
        $sources = [];
        foreach (self::TYPES as $type) {
            foreach (self::available($type, $site) as $handle => $source) {
                $sources[] = ['type' => $type, 'handle' => (string) $handle, 'label' => $source['label']];
            }
        }

        return $sources;
    }

    public static function configuration(mixed $source, Site $site): array
    {
        if (!\is_array($source) || \count($source) !== 2 || !\is_string($source['type'] ?? null)
            || !\in_array($source['type'], self::TYPES, true) || !\is_string($source['handle'] ?? null)) {
            throw new ToolCallException('Supply an optionSource type and handle from freeform.fields.option-sources.');
        }

        $type = $source['type'];
        $handle = $source['handle'];
        $selection = self::available($type, $site)[$handle] ?? null;
        if (!$selection) {
            throw new ToolCallException('This choice source is unavailable on the selected site or for this account. Use freeform.fields.option-sources.');
        }

        if ('predefined' === $type) {
            return [
                'source' => OptionsConfigurationInterface::SOURCE_PREDEFINED,
                'typeClass' => $selection['class'],
                'properties' => [],
            ];
        }

        [$class, $property] = self::ELEMENTS[$type];
        $properties = [$property => $selection['id']];
        if ('assets' !== $type) {
            $properties['siteId'] = (string) $site->id;
        }
        if ('categories' === $type || 'tags' === $type) {
            $properties[$property] = (string) $selection['id'];
        }

        return [
            'source' => OptionsConfigurationInterface::SOURCE_ELEMENTS,
            'typeClass' => $class,
            'properties' => $properties,
        ];
    }

    public static function describe(OptionsConfiguration $configuration): array
    {
        $class = $configuration->getTypeClass();
        if (OptionsConfigurationInterface::SOURCE_PREDEFINED === $configuration->getSource()) {
            return ['type' => 'predefined', 'handle' => self::typeHandle($class)];
        }

        $properties = (array) $configuration->toArray()['properties'];
        foreach (self::ELEMENTS as $type => [$provider, $property]) {
            if ($provider !== $class) {
                continue;
            }

            $id = (int) ($properties[$property] ?? 0);
            $app = \Craft::$app;
            $group = $id ? match ($type) {
                'entries' => $app->getEntries()->getSectionById($id),
                'categories' => $app->getCategories()->getGroupById($id),
                'tags' => $app->getTags()->getTagGroupById($id),
                'assets' => $app->getVolumes()->getVolumeById($id),
            } : null;

            return ['type' => $type, 'handle' => $group?->handle];
        }

        return ['type' => $configuration->getSource(), 'handle' => null];
    }

    private static function available(string $type, Site $site): array
    {
        $checker = \Craft::$container->get(LimitedUserChecker::class);
        $provider = \Craft::$container->get(OptionTypesProvider::class);
        $available = [];
        if ('predefined' === $type) {
            if (!$checker->can('layout.options.predefined')) {
                return [];
            }

            foreach ($provider->getPredefinedTypes() as $optionType) {
                if ($checker->can('layout.options.predefined.types', $optionType::class)) {
                    $available[self::typeHandle($optionType::class)] ??= ['label' => $optionType->getName(), 'class' => $optionType::class];
                }
            }

            return $available;
        }

        if (!$checker->can('layout.options.elements')) {
            return [];
        }

        [$class] = self::ELEMENTS[$type];
        if (!$checker->can('layout.options.elements.types', $class) || !$provider->getType(OptionsConfigurationInterface::SOURCE_ELEMENTS, $class)) {
            return [];
        }

        $app = \Craft::$app;
        $user = $app->getUser()->getIdentity();
        $groups = match ($type) {
            'entries' => $app->getEntries()->getAllSections(),
            'categories' => $app->getCategories()->getAllGroups(),
            'tags' => $app->getTags()->getAllTagGroups(),
            'assets' => $app->getVolumes()->getAllVolumes(),
        };
        foreach ($groups as $group) {
            $allowed = match ($type) {
                'entries' => ($group->getSiteSettings()[$site->id]->hasUrls ?? false) && $user->can('viewEntries:'.$group->uid),
                'categories' => isset($group->getSiteSettings()[$site->id]) && $user->can('viewCategories:'.$group->uid),
                'tags' => true, // Craft tags are viewable by all control panel users.
                'assets' => $user->can('viewAssets:'.$group->uid) && (bool) $group->getFs()->getRootUrl(),
            };
            if ($allowed) {
                $available[$group->handle] = ['label' => $group->name, 'id' => (int) $group->id];
            }
        }

        return $available;
    }

    private static function typeHandle(string $class): string
    {
        return lcfirst(basename(str_replace('\\', '/', $class)));
    }
}
