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

        $files = [];

        $fileIterator = $this->finder
            ->in($templateDirectory)
            ->name('index.twig')
            ->name('index.html')
            ->files()
            ->sortByName()
        ;

        foreach ($fileIterator as $file) {
            $files[] = new FormTemplate($file->getRealPath(), $templateDirectory);
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
            $files[] = new FormTemplate($file->getRealPath(), $templateDirectory);
        }

        return $files;
    }
}
