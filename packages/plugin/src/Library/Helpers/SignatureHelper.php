<?php

namespace Solspace\Freeform\Library\Helpers;

class SignatureHelper
{
    /**
     * Decode an inline signature without opening submitted paths or URLs.
     *
     * @return null|array{data: string, mimeType: string, width: int, height: int}
     */
    public static function decodeImage(mixed $value): ?array
    {
        if (!\is_string($value) || !preg_match('~\Adata:image/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})\z~', trim($value), $matches)) {
            return null;
        }

        $data = base64_decode($matches[2], true);
        if (false === $data || '' === $data) {
            return null;
        }

        $image = @getimagesizefromstring($data);
        $mimeType = 'image/'.$matches[1];
        if (false === $image || $image[0] < 1 || $image[1] < 1 || ($image['mime'] ?? null) !== $mimeType) {
            return null;
        }

        return ['data' => $data, 'mimeType' => $mimeType, 'width' => $image[0], 'height' => $image[1]];
    }
}
