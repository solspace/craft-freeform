<?php

namespace Solspace\Freeform\Tests\Services;

use craft\mail\Message;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProviderExternal;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Tests\Fixtures\SignatureImages;

#[CoversClass(MailerService::class)]
class MailerServiceSignatureTest extends TestCase
{
    #[DataProviderExternal(SignatureImages::class, 'validImages')]
    public function testAttachesDecodedImageContents(string $value, string $mimeType): void
    {
        $message = $this->createMock(Message::class);
        $message->expects($this->never())->method('attach');
        $message->expects($this->once())->method('attachContent')->with(
            base64_decode(explode(',', trim($value), 2)[1], true),
            [
                'fileName' => 'image/jpeg' === $mimeType ? 'signature.jpg' : 'signature.png',
                'contentType' => $mimeType,
            ],
        )->willReturnSelf();

        $this->attach($message, $value);
    }

    #[DataProviderExternal(SignatureImages::class, 'invalidImages')]
    public function testDoesNotAttachUntrustedValues(mixed $value): void
    {
        $message = $this->createMock(Message::class);
        $message->expects($this->never())->method('attach');
        $message->expects($this->never())->method('attachContent');

        $this->attach($message, $value);
    }

    public function testEvenAnExistingImageFileCannotBeAttachedByPath(): void
    {
        $file = tmpfile();
        fwrite($file, base64_decode(explode(',', SignatureImages::PNG, 2)[1], true));
        $path = stream_get_meta_data($file)['uri'];

        try {
            foreach ([$path, 'file://'.$path] as $value) {
                $message = $this->createMock(Message::class);
                $message->expects($this->never())->method('attach');
                $message->expects($this->never())->method('attachContent');

                $this->attach($message, $value);
            }
        } finally {
            fclose($file);
        }
    }

    private function attach(Message $message, mixed $value): void
    {
        $field = $this->createMock(SignatureField::class);
        $field->method('getValue')->willReturn($value);
        $mailer = (new \ReflectionClass(MailerService::class))->newInstanceWithoutConstructor();

        (new \ReflectionMethod(MailerService::class, 'attachSignature'))->invoke($mailer, $message, $field, null);
    }
}
