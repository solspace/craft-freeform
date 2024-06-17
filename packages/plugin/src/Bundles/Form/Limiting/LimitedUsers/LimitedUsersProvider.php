<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\BaseItemType;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Boolean;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Group;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Select;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Toggles;

class LimitedUsersProvider
{
    /**
     * @return BaseItemType[]
     */
    public function parsePostIntoItems(array $post): array
    {
        return array_map(
            fn (array $item) => $this->compileItem($item),
            $post
        );
    }

    public function compileSettings(array $items): array
    {
        $items = $this->parsePostIntoItems($items);

        $settings = [];
        foreach ($items as $item) {
            $settings = array_merge($settings, $this->extractSettings('', $item));
        }

        return $settings;
    }

    public function applySettings(array $defaults, array $settings): array
    {
        $callback = function (string $prefix, BaseItemType $item) use ($settings, &$callback) {
            $id = $prefix ? $prefix.'.'.$item->id : $item->id;

            $value = $settings[$id] ?? null;
            if ($item instanceof Boolean && \is_bool($value)) {
                $item->enabled = $value;
            }

            if ($item instanceof Select && \is_string($value)) {
                $item->value = $value;
            }

            if ($item instanceof Toggles && \is_array($value)) {
                $item->values = $value;
            }

            if (\is_array($item->children)) {
                foreach ($item->children as $subItem) {
                    $callback($id, $subItem);
                }
            }
        };

        /** @var BaseItemType $item */
        foreach ($defaults as $item) {
            $callback('', $item);
        }

        return $defaults;
    }

    private function compileItem(array $data): ?BaseItemType
    {
        $item = match ($data['type']) {
            'group' => new Group($data['id'], $data['name']),
            'boolean' => new Boolean($data['id'], $data['name'], $data['enabled']),
            'select' => (new Select($data['id'], $data['name']))
                ->setOptions($data['options'])
                ->setValue($data['value']),
            'toggles' => (new Toggles($data['id'], $data['name']))
                ->setOptions($data['options'])
                ->setValues($data['values']),
            default => null,
        };

        if (null === $item) {
            return null;
        }

        if (isset($data['children']) && \is_array($data['children'])) {
            $children = [];
            foreach ($data['children'] as $child) {
                $children[] = $this->compileItem($child);
            }

            $item->setChildren($children);
        }

        return $item;
    }

    private function extractSettings(string $prefix, BaseItemType $item): array
    {
        $settings = [];

        $id = $prefix ? $prefix.'.'.$item->id : $item->id;

        if ($item instanceof Boolean) {
            $settings[$id] = $item->enabled;
        } elseif ($item instanceof Select) {
            $settings[$id] = $item->value;
        } elseif ($item instanceof Toggles) {
            $settings[$id] = $item->values;
        }

        if (\is_array($item->children)) {
            foreach ($item->children as $subItem) {
                $settings = array_merge($settings, $this->extractSettings($id, $subItem));
            }
        }

        return $settings;
    }
}
