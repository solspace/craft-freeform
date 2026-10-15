<?php

namespace Solspace\Freeform\Library\AI;

use Solspace\Freeform\Freeform;
use yii\web\UploadedFile;

final class ReferenceFile
{
    public const MAX_FILES = 5;
    public const MAX_BYTES = 10485760;
    public const MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

    private function __construct(
        public string $name,
        public string $mimeType,
        private string $data,
    ) {}

    public function __debugInfo(): array
    {
        return ['name' => $this->name, 'mimeType' => $this->mimeType];
    }

    /** @param UploadedFile[] $uploads
     * @return self[]
     */
    public static function fromUploads(array $uploads): array
    {
        if (\count($uploads) > self::MAX_FILES) {
            throw new \InvalidArgumentException(Freeform::t('Attach up to 5 reference files.'));
        }
        $files = [];
        $total = 0;
        foreach ($uploads as $upload) {
            if (!$upload instanceof UploadedFile || \UPLOAD_ERR_OK !== $upload->error || !is_file($upload->tempName)) {
                throw new \InvalidArgumentException(Freeform::t('A reference file could not be uploaded. Check the server upload limits and try again.'));
            }
            $size = filesize($upload->tempName);
            if (false === $size || 0 === $size || ($total += $size) > self::MAX_BYTES) {
                throw new \InvalidArgumentException(Freeform::t('Reference files must be nonempty and total no more than 10 MB.'));
            }
            $mime = (new \finfo(\FILEINFO_MIME_TYPE))->file($upload->tempName);
            $extension = strtolower(pathinfo($upload->name, \PATHINFO_EXTENSION));
            $extensions = ['application/pdf' => ['pdf'], 'image/png' => ['png'], 'image/jpeg' => ['jpg', 'jpeg']];
            if (!isset($extensions[$mime]) || !\in_array($extension, $extensions[$mime], true)) {
                throw new \InvalidArgumentException(Freeform::t('Reference files must be valid PDF, PNG, or JPEG files.'));
            }
            $bytes = file_get_contents($upload->tempName);
            if (false === $bytes || \strlen($bytes) !== $size) {
                throw new \InvalidArgumentException(Freeform::t('A reference file could not be read. Please attach it again.'));
            }
            if ('application/pdf' === $mime) {
                if (!str_starts_with($bytes, '%PDF-') || !str_contains(substr($bytes, -65536), '%%EOF') || preg_match('/\/Encrypt\b/', $bytes)) {
                    throw new \InvalidArgumentException(Freeform::t('Attach a complete PDF without password protection.'));
                }
            } else {
                $image = @getimagesize($upload->tempName);
                if (!$image || $image['mime'] !== $mime || $image[0] > 10000 || $image[1] > 10000 || $image[0] * $image[1] > 20000000) {
                    throw new \InvalidArgumentException(Freeform::t('Reference images must be valid and no larger than 20 megapixels or 10000 pixels per side.'));
                }
            }
            // A neutral name avoids sending local paths or customer-supplied filenames.
            $files[] = new self('reference-'.(\count($files) + 1).'.'.$extension, $mime, base64_encode($bytes));
        }

        return $files;
    }

    public function getBase64(): string
    {
        return $this->data;
    }

    /** Restore only an authenticated encrypted request previously validated by fromUploads(). */
    public static function restore(array $file): self
    {
        if (!\is_string($file['name'] ?? null) || !preg_match('/^reference-[1-5]\.(?:pdf|png|jpe?g)$/D', $file['name'])
            || !\in_array($file['mimeType'] ?? null, self::MIME_TYPES, true)
            || !\is_string($file['data'] ?? null) || \strlen($file['data']) > 4 * (int) ceil(self::MAX_BYTES / 3)
        ) {
            throw new \InvalidArgumentException('Invalid stored reference.');
        }
        $bytes = base64_decode($file['data'], true);
        if (false === $bytes || '' === $bytes || \strlen($bytes) > self::MAX_BYTES) {
            throw new \InvalidArgumentException('Invalid stored reference.');
        }

        return new self($file['name'], $file['mimeType'], $file['data']);
    }

    public function getDataUrl(): string
    {
        return 'data:'.$this->mimeType.';base64,'.$this->data;
    }

    public function getChoiceFields(): array
    {
        if ('application/pdf' !== $this->mimeType) {
            return [];
        }
        $fields = PdfChoiceFieldExtractor::extract(base64_decode($this->data));
        foreach ($fields as $index => &$field) {
            $field['referenceField'] = $this->name.':choice-'.($index + 1);
        }
        unset($field);

        return $fields;
    }
}
