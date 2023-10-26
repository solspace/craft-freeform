<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class EncryptionHelperTest extends TestCase
{
    public function testValueIsEncrypted()
    {
        $value = 'test string';
        $key = EncryptionHelper::getKey('1234');
        $encrypted = EncryptionHelper::encrypt($key, $value);
        $isValidBase64 = base64_encode(base64_decode($encrypted, true)) === $encrypted;

        $this->assertTrue($isValidBase64);
    }

    public function testValueIsDecrypted()
    {
        $value = 'test string';
        $key = EncryptionHelper::getKey('1234');
        $encrypted = EncryptionHelper::encrypt($key, $value);
        $decrypted = EncryptionHelper::decrypt($key, $encrypted);

        $this->assertSame($value, $decrypted);
    }
}
