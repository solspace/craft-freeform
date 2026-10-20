<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProviderExternal;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\SignatureHelper;
use Solspace\Freeform\Tests\Fixtures\SignatureImages;

#[CoversClass(SignatureHelper::class)]
class SignatureHelperTest extends TestCase
{
    #[DataProviderExternal(SignatureImages::class, 'validImages')]
    public function testDecodesExistingImagesWithoutChangingTheirBytes(string $value, string $mimeType): void
    {
        $image = SignatureHelper::decodeImage($value);

        self::assertNotNull($image);
        self::assertSame($mimeType, $image['mimeType']);
        self::assertSame(base64_decode(explode(',', trim($value), 2)[1], true), $image['data']);
    }

    #[DataProviderExternal(SignatureImages::class, 'invalidImages')]
    public function testRejectsPathsUrlsAndInvalidImages(mixed $value): void
    {
        self::assertNull(SignatureHelper::decodeImage($value));
    }
}
