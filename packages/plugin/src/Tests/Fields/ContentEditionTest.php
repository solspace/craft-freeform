<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\FieldsBundle;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Freeform;

/**
 * @coversNothing
 */
class ContentEditionTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testOnlyHtmlIsAvailableOutsidePro(bool $isPro): void
    {
        $previousApp = \Yii::$app;
        $plugin = $this->createConfiguredMock(Freeform::class, ['isPro' => $isPro]);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        try {
            $event = new RegisterFieldTypesEvent();
            $bundle = (new \ReflectionClass(FieldsBundle::class))->newInstanceWithoutConstructor();
            $bundle->registerFieldTypes($event);
            $types = $event->getTypes();
            self::assertContains(HtmlField::class, $types);
            foreach ([...FieldTypesProvider::CONTENT_TYPES, ...FieldTypesProvider::LAYOUT_TYPES, ...FieldTypesProvider::TEMPLATE_TYPES, ...FieldTypesProvider::INTERNAL_TYPES] as $type) {
                if (HtmlField::class === $type) {
                    continue;
                }
                self::assertSame($isPro, \in_array($type, $types, true), $type);
            }
        } finally {
            \Yii::$app = $previousApp;
        }
    }
}
