<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Codepack\Components;

use CraftCms\Cms\ProjectConfig\ProjectConfig;
use CraftCms\Cms\Route\Data\Route;
use CraftCms\Cms\Route\Routes;

class RoutesComponent extends AbstractJsonComponent
{
    public function install(?string $prefix = null): void
    {
        $routes = app(Routes::class);
        $existingRoutes = app(ProjectConfig::class)->get('routes') ?? [];
        $folder = trim($prefix ?? '', '/').'/';

        foreach ($this->getData() ?? [] as $definition) {
            if (!isset($definition->urlParts, $definition->template) || !\is_array($definition->urlParts)) {
                continue;
            }

            $legacyParts = $definition->urlParts;
            array_walk_recursive($legacyParts, static function (&$value): void {
                $value = stripslashes($value);
            });
            $legacyParts[0] = $folder.$legacyParts[0];

            // Craft 6 uses these names directly as Laravel route parameters.
            // The old '*' names (including repeated tokens) cannot be matched.
            $names = [];
            preg_match_all('/\{([a-zA-Z]\w*)\}/', $definition->urlPattern ?? '', $names);
            $names = $names[1] ?? [];
            $parts = [];
            $usedNames = [];
            $index = 0;
            foreach ($legacyParts as $part) {
                if (\is_array($part)) {
                    $name = $names[$index++] ?? (preg_match('/^[a-zA-Z]\w*$/D', $part[0]) ? $part[0] : 'any');
                    $baseName = $name;
                    $suffix = 1;
                    while (isset($usedNames[$name])) {
                        $name = $baseName.(++$suffix);
                    }
                    $usedNames[$name] = true;
                    $part[0] = $name;
                }
                $parts[] = $part;
            }

            $uid = null;
            foreach ($existingRoutes as $existingUid => $existing) {
                if (($existing['uriParts'] ?? null) === $parts || ($existing['uriParts'] ?? null) === $legacyParts) {
                    $uid = $existingUid;

                    break;
                }
            }

            $routes->saveRoute(new Route(
                uriParts: $parts,
                template: $folder.ltrim($definition->template, '/'),
                uid: $uid,
            ));
        }
    }

    protected function setProperties(): void
    {
        $this->fileName = 'routes.json';
    }
}
