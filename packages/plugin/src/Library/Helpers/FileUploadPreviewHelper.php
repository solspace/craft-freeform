<?php

namespace Solspace\Freeform\Library\Helpers;

class FileUploadPreviewHelper
{
    public static function getPreviews(mixed $value): array
    {
        $previews = [];
        foreach (\is_array($value) ? $value : [$value] as $id) {
            if ((!\is_int($id) && (!\is_string($id) || !ctype_digit($id))) || (int) $id <= 0) {
                continue;
            }
            $id = (int) $id;
            if (isset($previews[$id])) {
                continue;
            }

            $asset = null;
            $warning = null;
            $parameters = ['id' => $id];

            try {
                $asset = \Craft::$app->assets->getAssetById($id);
                if (!$asset) {
                    $warning = 'Uploaded asset #{id} no longer exists.';
                } elseif (!$asset->getVolume()->fileExists($asset->getPath())) {
                    $warning = 'The file for “{filename}” (asset #{id}) is missing.';
                    $parameters['filename'] = $asset->getFilename();
                }
            } catch (\Throwable) {
                $warning = 'The file for asset #{id} could not be checked. Its storage may be unavailable.';
            }

            $previews[$id] = [
                'id' => $id,
                'asset' => $asset,
                'warning' => $warning,
                'parameters' => $parameters,
            ];
        }

        return array_values($previews);
    }
}
