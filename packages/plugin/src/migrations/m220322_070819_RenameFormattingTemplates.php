<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Freeform;

/**
 * m220322_070819_RenameFormattingTemplates migration.
 */
class m220322_070819_RenameFormattingTemplates extends Migration
{
    private static array $renameMap = [
        'flexbox.html' => 'flexbox/index.twig',
        'grid.html' => 'grid/index.twig',
        'bootstrap.html' => 'bootstrap-5/index.twig',
        'bootstrap-4.html' => 'bootstrap-5/index.twig',
        'bootstrap-5.html' => 'bootstrap-5/index.twig',
        'foundation.html' => 'foundation-6/index.twig',
        'tailwind.html' => 'tailwind-3/index.twig',
    ];

    public function safeUp(): bool
    {
        $forms = (new Query())
            ->select(['id', 'layoutJson'])
            ->from('{{%freeform_forms}}')
            ->pairs()
        ;

        foreach ($forms as $id => $layoutJson) {
            $layout = json_decode($layoutJson, true);
            if (!isset($layout['composer']['properties']['form']['formTemplate'])) {
                continue;
            }

            $oldTemplate = $layout['composer']['properties']['form']['formTemplate'];
            $newTemplate = self::$renameMap[$oldTemplate] ?? null;
            if (!$newTemplate) {
                continue;
            }

            $layout['composer']['properties']['form']['formTemplate'] = $newTemplate;

            $this->update(
                '{{%freeform_forms}}',
                ['layoutJson' => json_encode($layout)],
                ['id' => $id]
            );
        }

        $schemaVersion = \Craft::$app->projectConfig->get('plugins.freeform.schemaVersion', true);
        if (version_compare($schemaVersion, '4.0.0', '<')) {
            $settings = Freeform::getInstance()->getSettings();

            $oldTemplate = $settings->formattingTemplate;
            $newTemplate = self::$renameMap[$oldTemplate] ?? null;

            if (!$newTemplate) {
                return true;
            }

            $settings->formattingTemplate = $newTemplate;

            \Craft::$app->plugins->savePluginSettings(Freeform::getInstance(), $settings->toArray());
        }

        return true;
    }

    public function safeDown(): bool
    {
        $forms = (new Query())
            ->select(['id', 'layoutJson'])
            ->from('{{%freeform_forms}}')
            ->pairs()
        ;

        foreach ($forms as $id => $layoutJson) {
            $layout = json_decode($layoutJson, true);
            if (!isset($layout['composer']['properties']['form']['formTemplate'])) {
                continue;
            }

            $oldTemplate = $layout['composer']['properties']['form']['formTemplate'];
            $newTemplate = array_search($oldTemplate, self::$renameMap);
            if (!$newTemplate) {
                continue;
            }

            $layout['composer']['properties']['form']['formTemplate'] = $newTemplate;

            $this->update(
                '{{%freeform_forms}}',
                ['layoutJson' => json_encode($layout)],
                ['id' => $id]
            );
        }

        return true;
    }
}
