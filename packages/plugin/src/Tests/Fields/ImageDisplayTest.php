<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestLayoutSerializer;

/**
 * @coversNothing
 */
class ImageDisplayTest extends TestCase
{
    public function testImageDisplayIsOptInAndConstrainedWithoutChangingTheAsset(): void
    {
        $field = new ImageField($this->createMock(Form::class));
        self::assertSame([], $field->getDisplayStyles());
        foreach (['customizeDisplay' => true, 'displayWidth' => 280, 'aspectRatio' => 'square', 'imageFit' => 'cover', 'cropPosition' => 'top'] as $key => $value) {
            (new \ReflectionProperty(ImageField::class, $key))->setValue($field, $value);
        }
        self::assertSame(['display' => 'block', 'width' => '280px', 'max-width' => '100%', 'height' => 'auto', 'aspect-ratio' => '1 / 1', 'object-fit' => 'cover', 'object-position' => 'top'], $field->getDisplayStyles());
        self::assertSame([], $field->getAssetId());
        foreach (['top-left' => 'left top', 'top-right' => 'right top', 'bottom-left' => 'left bottom', 'bottom-right' => 'right bottom'] as $position => $expected) {
            (new \ReflectionProperty(ImageField::class, 'cropPosition'))->setValue($field, $position);
            self::assertSame($expected, $field->getDisplayStyles()['object-position']);
        }
        (new \ReflectionProperty(ImageField::class, 'aspectRatio'))->setValue($field, 'invalid');
        self::assertArrayNotHasKey('aspect-ratio', $field->getDisplayStyles());
        (new \ReflectionProperty(ImageField::class, 'customizeDisplay'))->setValue($field, false);
        self::assertSame([], $field->getDisplayStyles());
    }

    public function testHeadlessImageRetainsItsOptionalDisplayStyles(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(ImageField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getLabel', 'getInstructions'])
            ->getMock()
        ;
        (new \ReflectionProperty(ImageField::class, 'customizeDisplay'))->setValue($field, true);
        (new \ReflectionProperty(ImageField::class, 'displayWidth'))->setValue($field, 280);
        $serializer = new ManifestFieldSerializer(
            $this->createMock(ManifestLayoutSerializer::class),
            new ManifestExtensionResolver(),
            $this->createMock(FilesService::class),
        );
        $image = $serializer->serialize($form, ['image' => $field])['image'];

        self::assertSame($field->getDisplayStyles(), $image['content']['image']['style']);
        self::assertSame($field->getDisplayStyles(), $image['frontend']['config']['style']);
    }
}
