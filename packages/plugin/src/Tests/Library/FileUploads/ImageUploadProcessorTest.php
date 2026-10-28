<?php

namespace Solspace\Freeform\Tests\Library\FileUploads;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\RequiresPhpExtension;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\FileUploads\ImageUploadProcessor;

#[CoversClass(ImageUploadProcessor::class)]
class ImageUploadProcessorTest extends TestCase
{
    private array $paths = [];

    protected function tearDown(): void
    {
        foreach ($this->paths as $path) {
            if (is_file($path)) {
                unlink($path);
            }
        }
    }

    public function testConvertsTransparentPngToBoundedJpegWithoutChangingOriginal(): void
    {
        $path = $this->image('png', 1200, 600, 'transparent');
        $hash = hash_file('sha256', $path);
        [$output, $name] = $this->process($path, 'Tree.PNG', 600);
        self::assertSame('Tree.jpg', $name);
        self::assertSame($hash, hash_file('sha256', $path));
        self::assertSame([600, 300, \IMAGETYPE_JPEG], \array_slice(getimagesize($output), 0, 3));
        $image = imagecreatefromjpeg($output);
        self::assertSame(0xFFFFFF, imagecolorat($image, 0, 0));
        unset($image);
    }

    public function testDoesNotEnlargeSmallPhotos(): void
    {
        $path = $this->image('jpeg', 120, 80);
        [$output] = $this->process($path, 'small.jpg');
        self::assertSame([120, 80], \array_slice(getimagesize($output), 0, 2));
    }

    #[RequiresPhpExtension('imagick')]
    public function testLimitsNoisyPhotoBytesAsWellAsDimensions(): void
    {
        $path = $this->image('png', 1200, 900);
        $image = new \Imagick($path);
        $image->addNoiseImage(\Imagick::NOISE_RANDOM);
        $image->writeImage($path);
        $image->clear();
        [$output] = $this->process($path, 'noise.png', 1000, 95, 65536);
        self::assertLessThanOrEqual(65536, filesize($output));
        self::assertLessThanOrEqual(1000, max(\array_slice(getimagesize($output), 0, 2)));
    }

    public function testLeavesDocumentsAndGifFilesUntouched(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'ff-test-');
        $this->paths[] = $path;
        file_put_contents($path, 'test document');
        foreach (['document.pdf', 'animated.gif', 'vector.svg'] as $name) {
            self::assertSame([$path, $name], (new ImageUploadProcessor())->process($path, $name));
        }
    }

    public function testRejectsSpoofedPhotoExtension(): void
    {
        $path = $this->image('png', 200, 100);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('does not match');
        $this->process($path, 'fake.heic');
    }

    public function testRejectsOversizedDimensionsBeforeDecoding(): void
    {
        $path = $this->image('png', 16001, 1);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('dimensions are too large');
        $this->process($path, 'wide.png');
    }

    public function testConvertsRealHeicAndPreservesOriginal(): void
    {
        if (!(new ImageUploadProcessor())->supportsHeic()) {
            self::markTestSkipped('Imagick HEIC support is unavailable.');
        }
        $path = $this->image('heic', 640, 480);
        $hash = hash_file('sha256', $path);
        [$output, $name] = $this->process($path, 'iPhone.HEIC', 320);
        self::assertSame('iPhone.jpg', $name);
        self::assertSame([320, 240, \IMAGETYPE_JPEG], \array_slice(getimagesize($output), 0, 3));
        self::assertSame($hash, hash_file('sha256', $path));
    }

    public function testExplainsMissingHeicDecoder(): void
    {
        $path = $this->image('heic', 640, 480);
        $processor = new class extends ImageUploadProcessor {
            public function supportsHeic(): bool
            {
                return false;
            }
        };
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Please upload a JPG or PNG');
        $processor->process($path, 'phone.heic');
    }

    public function testGdFallbackResizesAndFlattensTransparency(): void
    {
        $path = $this->image('png', 1200, 600, 'transparent');
        $output = tempnam(sys_get_temp_dir(), 'ff-output-');
        $this->paths[] = $output;
        (new \ReflectionMethod(ImageUploadProcessor::class, 'processGd'))->invoke(new ImageUploadProcessor(), $path, $output, 600, 85, 2097152);
        self::assertSame([600, 300, \IMAGETYPE_JPEG], \array_slice(getimagesize($output), 0, 3));
        $image = imagecreatefromjpeg($output);
        self::assertSame(0xFFFFFF, imagecolorat($image, 0, 0));
        unset($image);
    }

    #[RequiresPhpExtension('exif')]
    public function testAutoOrientsPortraitAndRemovesExif(): void
    {
        $path = $this->image('jpeg', 640, 480);
        // A minimal real EXIF APP1 segment: little-endian TIFF with Orientation=6.
        $exif = "Exif\0\0II\x2a\0\x08\0\0\0\x01\0\x12\x01\x03\0\x01\0\0\0\x06\0\0\0\0\0\0\0";
        $jpeg = file_get_contents($path);
        file_put_contents($path, substr($jpeg, 0, 2)."\xff\xe1".pack('n', \strlen($exif) + 2).$exif.substr($jpeg, 2));
        self::assertSame(6, exif_read_data($path)['Orientation']);
        [$output] = $this->process($path, 'portrait.jpg', 2000);
        self::assertSame([480, 640], \array_slice(getimagesize($output), 0, 2));
        self::assertArrayNotHasKey('Orientation', exif_read_data($output) ?: []);
    }

    public function testHandlesTwentyFourMegapixelPhoneDimensions(): void
    {
        $path = $this->image('png', 5712, 4284);
        [$output] = $this->process($path, 'phone.png');
        self::assertSame([2000, 1500], \array_slice(getimagesize($output), 0, 2));
        self::assertLessThanOrEqual(2097152, filesize($output));
    }

    #[RequiresPhpExtension('imagick')]
    #[RequiresPhpExtension('exif')]
    public function testGdAndImagickAgreeOnAllEightExifOrientations(): void
    {
        for ($orientation = 1; $orientation <= 8; ++$orientation) {
            $path = $this->image('jpeg', 640, 480);
            $source = imagecreatefromjpeg($path);
            imagefilledrectangle($source, 0, 0, 319, 239, imagecolorallocate($source, 255, 0, 0));
            imagefilledrectangle($source, 320, 0, 639, 239, imagecolorallocate($source, 0, 255, 0));
            imagefilledrectangle($source, 0, 240, 319, 479, imagecolorallocate($source, 0, 0, 255));
            imagefilledrectangle($source, 320, 240, 639, 479, imagecolorallocate($source, 255, 255, 255));
            imagejpeg($source, $path, 95);
            unset($source);
            $exif = "Exif\0\0II\x2a\0\x08\0\0\0\x01\0\x12\x01\x03\0\x01\0\0\0".pack('v', $orientation)."\0\0\0\0\0\0";
            $jpeg = file_get_contents($path);
            file_put_contents($path, substr($jpeg, 0, 2)."\xff\xe1".pack('n', \strlen($exif) + 2).$exif.substr($jpeg, 2));
            [$imagick] = $this->process($path, 'oriented.jpg', 2000);
            $gd = tempnam(sys_get_temp_dir(), 'ff-gd-');
            $this->paths[] = $gd;
            (new \ReflectionMethod(ImageUploadProcessor::class, 'processGd'))->invoke(new ImageUploadProcessor(), $path, $gd, 2000, 85, 2097152);
            self::assertSame(\array_slice(getimagesize($imagick), 0, 2), \array_slice(getimagesize($gd), 0, 2));
            $a = imagecreatefromjpeg($imagick);
            $b = imagecreatefromjpeg($gd);
            foreach ([[20, 20], [imagesx($a) - 20, 20], [20, imagesy($a) - 20], [imagesx($a) - 20, imagesy($a) - 20]] as [$x, $y]) {
                self::assertSame(imagecolorat($a, $x, $y), imagecolorat($b, $x, $y), 'Orientation '.$orientation);
            }
            unset($a, $b);
        }
    }

    #[RequiresPhpExtension('imagick')]
    public function testRestoresImagickResourceLimits(): void
    {
        $path = $this->image('png', 200, 100);
        $before = \Imagick::getResourceLimit(\Imagick::RESOURCETYPE_MEMORY);
        $this->process($path, 'tree.png');
        self::assertSame($before, \Imagick::getResourceLimit(\Imagick::RESOURCETYPE_MEMORY));
    }

    private function image(string $format, int $width, int $height, string $color = 'green'): string
    {
        $path = tempnam(sys_get_temp_dir(), 'ff-image-');
        $this->paths[] = $path;
        if ('heic' === $format) {
            copy(__DIR__.'/../../Fixtures/TEST-tree.heic', $path);

            return $path;
        }
        if (!\extension_loaded('gd')) {
            self::markTestSkipped('Image fixture generation requires GD.');
        }
        $image = imagecreatetruecolor($width, $height);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 128, 0, 'transparent' === $color ? 127 : 0));
        if ('jpeg' === $format) {
            imagejpeg($image, $path);
        } else {
            imagepng($image, $path);
        }
        unset($image);

        return $path;
    }

    private function process(string $path, string $name, int $dimension = 2000, int $quality = 85, int $maxBytes = 2097152): array
    {
        $result = (new ImageUploadProcessor())->process($path, $name, $dimension, $quality, $maxBytes);
        $this->paths[] = $result[0];

        return $result;
    }
}
