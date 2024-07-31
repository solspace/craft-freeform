<?php

namespace Solspace\Freeform\Bundles\Backup\BatchProcessing;

use Solspace\Freeform\Library\Helpers\FileHelper;

class FileLineProcessor implements BatchProcessInterface
{
    public function __construct(private string $filePath) {}

    public function batch(int $size): \Generator
    {
        $file = fopen($this->filePath, 'r');

        $batch = [];
        $counter = 0;
        while (($line = fgets($file)) !== false) {
            $batch[] = json_decode($line, true);
            ++$counter;

            if ($counter >= $size) {
                yield $batch;
                $batch = [];
                $counter = 0;
            }
        }

        if (\count($batch)) {
            yield $batch;
        }

        fclose($file);
    }

    public function total(): int
    {
        return FileHelper::countLines($this->filePath);
    }
}
