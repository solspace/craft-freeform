<?php

namespace Solspace\Freeform\Tests\Bundles\Persistence;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Persistence\LayoutPersistence;
use Solspace\Freeform\Fields\Implementations\Pro\LayoutColumnField;
use Solspace\Freeform\Fields\Implementations\TextField;

#[CoversClass(LayoutPersistence::class)]
class LayoutHandlesTest extends TestCase
{
    public function testRepairsOnlyInternalColumnCollisionsWhilePreservingUserHandles(): void
    {
        $data = array_map(
            static fn ($type, $handle) => (object) ['typeClass' => $type, 'properties' => (object) ['handle' => $handle]],
            [LayoutColumnField::class, LayoutColumnField::class, LayoutColumnField::class, TextField::class, TextField::class],
            ['column', 'column', 'Column_1', 'column', 'customHandle']
        );
        $bundle = (new \ReflectionClass(LayoutPersistence::class))->newInstanceWithoutConstructor();
        (new \ReflectionMethod(LayoutPersistence::class, 'normalizeColumnHandles'))->invoke($bundle, $data);
        $handles = array_map(static fn ($item) => $item->properties->handle, $data);
        self::assertSame(['column_1', 'column_2', 'Column_1_1', 'column', 'customHandle'], $handles);
        self::assertCount(5, array_unique(array_map('strtolower', $handles)));
        (new \ReflectionMethod(LayoutPersistence::class, 'normalizeColumnHandles'))->invoke($bundle, $data);
        self::assertSame($handles, array_map(static fn ($item) => $item->properties->handle, $data));
    }
}
