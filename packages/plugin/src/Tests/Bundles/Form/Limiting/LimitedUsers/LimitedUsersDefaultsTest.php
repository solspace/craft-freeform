<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting\LimitedUsers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersDefaults;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;

/**
 * @coversNothing
 */
class LimitedUsersDefaultsTest extends TestCase
{
    public function testPreviewDefaultsToEnabledAndPersistsExplicitRestrictions(): void
    {
        $fields = $this->createMock(FieldTypesProvider::class);
        $fields->method('getTypes')->willReturn([]);
        $options = $this->createMock(OptionTypesProvider::class);
        $options->method('getElementTypes')->willReturn([]);
        $options->method('getPredefinedTypes')->willReturn([]);
        $defaults = new LimitedUsersDefaults($fields, $options);
        $provider = new LimitedUsersProvider();

        // Existing profiles have no preview setting and retain their access.
        $items = $provider->applySettings($defaults->get(), ['settings.tab' => false]);
        $preview = array_values(array_filter($items, static fn ($item) => 'preview' === $item->id))[0];
        self::assertSame('Preview', $preview->name);
        self::assertSame('Preview Tab', $preview->children[0]->name);
        self::assertTrue($preview->children[0]->enabled);

        $items = $provider->applySettings($defaults->get(), ['preview.tab' => false]);
        $compiled = $provider->compileSettings(json_decode(json_encode($items), true));
        self::assertFalse($compiled['preview.tab']);
    }
}
