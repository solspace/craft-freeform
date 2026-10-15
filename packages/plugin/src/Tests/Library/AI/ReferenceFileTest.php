<?php

namespace Solspace\Freeform\Tests\Library\AI;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\AI\ReferenceFile;
use yii\web\UploadedFile;

#[CoversClass(ReferenceFile::class)]
class ReferenceFileTest extends TestCase
{
    private array $temporary = [];

    protected function tearDown(): void
    {
        foreach ($this->temporary as $path) {
            @unlink($path);
        }
    }

    public function testImagesAreVerifiedFromBytesAndFilenamesAreNeutralized(): void
    {
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=');
        $upload = $this->upload('../../private-customer.png', $bytes);
        $upload->type = 'text/plain';
        [$file] = ReferenceFile::fromUploads([$upload]);
        self::assertSame('reference-1.png', $file->name);
        self::assertSame('image/png', $file->mimeType);
        self::assertSame($bytes, base64_decode($file->getBase64()));
        self::assertStringStartsWith('data:image/png;base64,', $file->getDataUrl());
        self::assertArrayNotHasKey('data', $file->__debugInfo());
    }

    public function testPdfIsKeptAsNativePdfWithoutConversionOrPermanentCopy(): void
    {
        $bytes = "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF";
        $upload = $this->upload('form.pdf', $bytes);
        [$file] = ReferenceFile::fromUploads([$upload]);
        self::assertSame('application/pdf', $file->mimeType);
        self::assertSame($bytes, base64_decode($file->getBase64()));
        self::assertFileExists($upload->tempName);
    }

    #[TestWith(['form.pdf', '<html>Not a PDF</html>'])]
    #[TestWith(['form.png', '%PDF-1.4 fake %%EOF'])]
    #[TestWith(['form.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>'])]
    #[TestWith(['form.pdf', '%PDF-1.4 missing trailer'])]
    #[TestWith(['form.pdf', '%PDF-1.4 /Encrypt 1 0 R %%EOF'])]
    #[TestWith(['form.pdf', ''])]
    public function testRejectsSpoofedIncompleteEncryptedAndEmptyFiles(string $name, string $data): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads([$this->upload($name, $data)]);
    }

    public function testActualFileSizeControlsLimitInsteadOfClientMetadata(): void
    {
        $upload = $this->upload('large.pdf', '%PDF-'.str_repeat('x', ReferenceFile::MAX_BYTES).'%%EOF');
        $upload->size = 1;
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads([$upload]);
    }

    public function testTotalBytesAndFileCountAreBounded(): void
    {
        $upload = $this->upload('form.pdf', '%PDF-'.str_repeat('x', 6 * 1024 * 1024).'%%EOF');
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads([$upload, $upload]);
    }

    public function testTooManyFilesAreRejectedBeforeReadingThem(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads(array_fill(0, 6, new UploadedFile()));
    }

    public function testPhpUploadErrorsAreNotSilentlyDropped(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads([new UploadedFile(['error' => \UPLOAD_ERR_INI_SIZE])]);
    }

    public function testOversizedImageDimensionsAreRejected(): void
    {
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=');
        $bytes = substr_replace($bytes, pack('NN', 10001, 3000), 16, 8);
        $this->expectException(\InvalidArgumentException::class);
        ReferenceFile::fromUploads([$this->upload('huge.png', $bytes)]);
    }

    private function upload(string $name, string $data): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'ff-ref-');
        $this->temporary[] = $path;
        file_put_contents($path, $data);

        return new UploadedFile(['name' => $name, 'tempName' => $path, 'size' => \strlen($data), 'error' => \UPLOAD_ERR_OK]);
    }
}
