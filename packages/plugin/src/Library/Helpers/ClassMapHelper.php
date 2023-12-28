<?php

namespace Solspace\Freeform\Library\Helpers;

use Composer\ClassMapGenerator\ClassMapGenerator;

class ClassMapHelper
{
    private static array $checksums = [];

    public static function getMap(string $path): array
    {
        $pathHash = HashHelper::sha1($path, 5);
        $cacheKey = 'freeform-class-map-'.$pathHash;

        $checksum = self::getFolderChecksum($path);
        $cache = \Craft::$app->cache->get($cacheKey);
        if (!$cache || !isset($cache['checksum']) || $cache['checksum'] !== $checksum) {
            $classMap = ClassMapGenerator::createMap($path);
            $cache = [
                'checksum' => $checksum,
                'map' => $classMap,
            ];

            \Craft::$app->cache->set($cacheKey, $cache);
        }

        return $cache['map'];
    }

    private static function getFolderChecksum(string $path)
    {
        if (!isset(self::$checksums[$path])) {
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path));
            $fileList = [];

            foreach ($files as $file) {
                // Skip directories since we're only interested in files
                if ($file->isFile()) {
                    $fileList[] = $file->getPathname();
                }
            }

            // Sort the file list to ensure the order is always the same
            sort($fileList);

            // Create a single string with all file paths
            $fileListString = implode("\n", $fileList);

            // Return a hash of the file list string
            self::$checksums[$path] = HashHelper::sha1($fileListString);
        }

        return self::$checksums[$path];
    }
}
