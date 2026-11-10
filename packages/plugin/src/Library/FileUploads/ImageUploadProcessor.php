<?php

namespace Solspace\Freeform\Library\FileUploads;

/** Creates a bounded, metadata-free JPEG without modifying the uploaded original. */
class ImageUploadProcessor
{
    private const MIME_TYPES = [
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'webp' => ['image/webp'],
        'heic' => ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'],
        'heif' => ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'],
    ];
    private const MAX_PIXELS = 64000000;

    public static function handles(string $filename): bool
    {
        return isset(self::MIME_TYPES[strtolower(pathinfo($filename, \PATHINFO_EXTENSION))]);
    }

    public function process(string $path, string $filename, int $maxDimension = 2000, int $quality = 85, int $maxBytes = 2097152): array
    {
        $extension = strtolower(pathinfo($filename, \PATHINFO_EXTENSION));
        if (!isset(self::MIME_TYPES[$extension])) {
            return [$path, $filename];
        }

        $maxDimension = max(320, min(8000, $maxDimension));
        $quality = max(40, min(95, $quality));
        $maxBytes = max(1, min(16777216, $maxBytes));
        $mime = (new \finfo(\FILEINFO_MIME_TYPE))->file($path);
        if (!\in_array($mime, self::MIME_TYPES[$extension], true)) {
            throw new \RuntimeException('The photo does not match its file extension. Please choose a JPG, PNG, WebP or HEIC photo.');
        }

        $heic = \in_array($extension, ['heic', 'heif'], true);
        if ($heic && !$this->supportsHeic()) {
            throw new \RuntimeException('HEIC photos cannot be converted on this server. Please upload a JPG or PNG photo instead.');
        }

        $output = tempnam(sys_get_temp_dir(), 'freeform-photo-');
        if (false === $output) {
            throw new \RuntimeException('The photo could not be prepared. Please try again.');
        }

        try {
            if (\extension_loaded('imagick')) {
                $this->processImagick($path, $output, $maxDimension, $quality, $maxBytes);
            } elseif (\extension_loaded('gd')) {
                $this->processGd($path, $output, $maxDimension, $quality, $maxBytes);
            } else {
                throw new \RuntimeException('Photo processing is not available on this server. Please contact the site owner.');
            }

            $size = filesize($output);
            if (!$size || $size > $maxBytes) {
                throw new \RuntimeException('The photo could not be reduced to the allowed size. Please choose a smaller photo.');
            }

            return [$output, pathinfo(basename($filename), \PATHINFO_FILENAME).'.jpg'];
        } catch (\Throwable $exception) {
            @unlink($output);
            if ($exception instanceof \RuntimeException && !$exception instanceof \ImagickException) {
                throw $exception;
            }

            throw new \RuntimeException('The photo could not be processed. Please choose another JPG, PNG or HEIC photo.', 0, $exception);
        }
    }

    public function supportsHeic(): bool
    {
        return \extension_loaded('imagick') && [] !== \Imagick::queryFormats('HEI*');
    }

    private function checkDimensions(int $width, int $height): void
    {
        if ($width < 1 || $height < 1 || $width > 16000 || $height > 16000 || $width * $height > self::MAX_PIXELS) {
            throw new \RuntimeException('The photo dimensions are too large. Please choose a photo of 64 megapixels or less.');
        }
    }

    private function processImagick(string $path, string $output, int $maxDimension, int $quality, int $maxBytes): void
    {
        $image = new \Imagick();
        $limits = [];
        foreach ([\Imagick::RESOURCETYPE_MEMORY => 67108864, \Imagick::RESOURCETYPE_MAP => 134217728, \Imagick::RESOURCETYPE_DISK => 1073741824, \Imagick::RESOURCETYPE_THREAD => 1] as $resource => $cap) {
            $limits[$resource] = \Imagick::getResourceLimit($resource);
            \Imagick::setResourceLimit($resource, min($limits[$resource], $cap));
        }

        try {
            // Inspect before decoding, and only read the first image in a HEIC container.
            $image->pingImage($path.'[0]');
            $this->checkDimensions($image->getImageWidth(), $image->getImageHeight());
            $image->clear();
            $image->readImage($path.'[0]');
            // Do not silently flatten animated WebP files into still images.
            if ('WEBP' === $image->getImageFormat() && $this->isAnimatedWebp($path)) {
                throw new \RuntimeException('Animated WebP photos cannot be optimized. Please choose a still photo.');
            }
            // Resize first so orientation and color operations do not duplicate a full-size phone image.
            if (max($image->getImageWidth(), $image->getImageHeight()) > $maxDimension) {
                $image->thumbnailImage($maxDimension, $maxDimension, true, false);
            }
            $image->autoOrient();
            $image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);
            $image->transformImageColorspace(\Imagick::COLORSPACE_SRGB);
            $image->setImageBackgroundColor('white');
            $image->setImageAlphaChannel(\Imagick::ALPHACHANNEL_REMOVE);
            $image->stripImage();
            $image->setImageFormat('jpeg');
            $image->setImageCompression(\Imagick::COMPRESSION_JPEG);
            while (true) {
                $image->setImageCompressionQuality($quality);
                if (!$image->writeImage($output)) {
                    throw new \RuntimeException('The photo could not be saved. Please try again.');
                }
                clearstatcache(true, $output);
                if (filesize($output) <= $maxBytes) {
                    break;
                }
                if ($quality > 50) {
                    $quality = max(50, $quality - 10);
                } elseif (max($image->getImageWidth(), $image->getImageHeight()) > 320) {
                    $image->thumbnailImage(max(1, (int) ($image->getImageWidth() * 0.75)), max(1, (int) ($image->getImageHeight() * 0.75)), true);
                } else {
                    break;
                }
            }
        } finally {
            $image->clear();
            $image->destroy();
            foreach ($limits as $resource => $limit) {
                \Imagick::setResourceLimit($resource, $limit);
            }
        }
    }

    private function processGd(string $path, string $output, int $maxDimension, int $quality, int $maxBytes): void
    {
        $dimensions = @getimagesize($path);
        if (!$dimensions) {
            throw new \RuntimeException('The photo could not be read. Please choose another photo.');
        }
        [$width, $height] = $dimensions;
        $this->checkDimensions($width, $height);
        $memoryLimit = $this->memoryLimitBytes();
        if ($memoryLimit > 0 && memory_get_usage(true) + $width * $height * 8 + 16777216 > $memoryLimit) {
            throw new \RuntimeException('The photo is too large to process on this server. Please choose a smaller photo.');
        }
        if ($this->isAnimatedWebp($path)) {
            throw new \RuntimeException('Animated WebP photos cannot be optimized. Please choose a still photo.');
        }
        $source = match ($dimensions[2]) {
            \IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            \IMAGETYPE_PNG => @imagecreatefrompng($path),
            \IMAGETYPE_WEBP => \function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            default => false,
        };
        if (!$source) {
            throw new \RuntimeException('The photo could not be read. Please choose another photo.');
        }

        try {
            if (\IMAGETYPE_JPEG === $dimensions[2]) {
                if (!\function_exists('exif_read_data')) {
                    throw new \RuntimeException('Photo orientation cannot be read on this server. Please contact the site owner.');
                }
                $exif = @exif_read_data($path);
                $orientation = (int) ($exif['Orientation'] ?? 1);
                if (\in_array($orientation, [2, 4, 5, 7], true)) {
                    imageflip($source, \IMG_FLIP_HORIZONTAL);
                }
                $angle = match ($orientation) {
                    3, 4 => 180, 6, 7 => -90, 5, 8 => 90, default => 0
                };
                if ($angle) {
                    $rotated = imagerotate($source, $angle, 0);
                    unset($source);
                    $source = $rotated;
                }
            }
            $width = imagesx($source);
            $height = imagesy($source);
            $ratio = min(1, $maxDimension / max($width, $height));
            $targetWidth = max(1, (int) round($width * $ratio));
            $targetHeight = max(1, (int) round($height * $ratio));
            while (true) {
                $target = imagecreatetruecolor($targetWidth, $targetHeight);

                try {
                    imagefill($target, 0, 0, imagecolorallocate($target, 255, 255, 255));
                    imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
                    if (!imagejpeg($target, $output, $quality)) {
                        throw new \RuntimeException('The photo could not be saved. Please try again.');
                    }
                } finally {
                    unset($target);
                }
                clearstatcache(true, $output);
                if (filesize($output) <= $maxBytes) {
                    break;
                }
                if ($quality > 50) {
                    $quality = max(50, $quality - 10);
                } elseif (max($targetWidth, $targetHeight) > 320) {
                    $targetWidth = max(1, (int) ($targetWidth * 0.75));
                    $targetHeight = max(1, (int) ($targetHeight * 0.75));
                } else {
                    break;
                }
            }
        } finally {
            unset($source);
        }
    }

    private function isAnimatedWebp(string $path): bool
    {
        $header = file_get_contents($path, false, null, 0, 21);

        return 'RIFF' === substr($header, 0, 4) && 'WEBPVP8X' === substr($header, 8, 8) && 0 !== (\ord($header[20] ?? "\0") & 2);
    }

    private function memoryLimitBytes(): int
    {
        $value = trim(\ini_get('memory_limit'));
        $amount = (int) $value;

        return $amount * match (strtolower(substr($value, -1))) {
            'g' => 1073741824, 'm' => 1048576, 'k' => 1024, default => 1
        };
    }
}
