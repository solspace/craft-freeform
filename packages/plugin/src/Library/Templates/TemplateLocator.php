<?php

namespace Solspace\Freeform\Library\Templates;

use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class TemplateLocator
{
    public function __construct(
        private Finder $finder,
    ) {}

    public function locate(string $templateDirectory): array
    {
        if (!$templateDirectory || !is_dir($templateDirectory)) {
            return [];
        }

        $existingFilePaths = [];
        $files = [];

        $fileIterator = $this->finder
            ->in($templateDirectory)
            ->name('index.twig')
            ->name('index.html')
            ->files()
            ->sortByName()
        ;

        foreach ($fileIterator as $file) {
            if (\in_array($file->getRealPath(), $existingFilePaths)) {
                continue;
            }

            $files[] = new FormTemplate($file->getRealPath(), $templateDirectory);
            $existingFilePaths[] = $file->getRealPath();
        }

        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $this->finder
            ->in($templateDirectory)
            ->depth(0)
            ->name('*.html')
            ->name('*.twig')
            ->files()
            ->sortByName()
        ;

        foreach ($fileIterator as $file) {
            if (\in_array($file->getRealPath(), $existingFilePaths)) {
                continue;
            }

            $files[] = new FormTemplate($file->getRealPath(), $templateDirectory);
            $existingFilePaths[] = $file->getRealPath();
        }

        return $files;
    }
}
