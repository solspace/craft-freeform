<?php

namespace Solspace\Freeform\Library\Templates;

/** Upgrade bundled template selections without changing custom template files. */
class SampleTemplateUpgrade
{
    public const REPLACEMENTS = [
        'basic-light/index.twig' => 'freeform-light/index.twig',
        'basic-dark/index.twig' => 'freeform-dark/index.twig',
        'basic-floating-labels/index.twig' => 'freeform-floating-labels/index.twig',
        'bootstrap-5/index.twig' => 'bootstrap-5-light/index.twig',
        'tailwind-3/index.twig' => 'tailwind-4-light/index.twig',
        'tailwind-3-dark/index.twig' => 'tailwind-4-dark/index.twig',
        'foundation-6/index.twig' => 'flexbox/index.twig',
        'conversational/index.twig' => 'freeform-light/index.twig',
        'multipage-all-fields/index.twig' => 'freeform-light/index.twig',
    ];

    public static function replace(mixed $template, ?string $customDirectory = null): mixed
    {
        if (!\is_string($template) || !isset(self::REPLACEMENTS[$template])) {
            return $template;
        }
        if ($customDirectory) {
            if (!preg_match('/^(?:\/|\\\|\w\:\\\)/', $customDirectory)) {
                $customDirectory = \Craft::$app->path->getSiteTemplatesPath().'/'.$customDirectory;
            }
            if (is_file($customDirectory.'/'.$template)) {
                return $template;
            }
        }

        return self::REPLACEMENTS[$template];
    }

    public static function settings(array $settings): array
    {
        $directory = $settings['formTemplateDirectory'] ?? null;
        if (\array_key_exists('formattingTemplate', $settings)) {
            $settings['formattingTemplate'] = self::replace($settings['formattingTemplate'], $directory);
        }
        if (isset($settings['defaults']['settings']['general']['formattingTemplate']['value'])) {
            $settings['defaults']['settings']['general']['formattingTemplate']['value'] = self::replace(
                $settings['defaults']['settings']['general']['formattingTemplate']['value'],
                $directory,
            );
        }

        return $settings;
    }

    public static function metadata(array $metadata, ?string $customDirectory = null): array
    {
        if (isset($metadata['general']['formattingTemplate'])) {
            $metadata['general']['formattingTemplate'] = self::replace($metadata['general']['formattingTemplate'], $customDirectory);
        }

        return $metadata;
    }
}
