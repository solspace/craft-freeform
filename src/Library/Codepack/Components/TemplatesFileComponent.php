<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Codepack\Components;

use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileNotFoundException;

class TemplatesFileComponent extends AbstractFileComponent
{
    /** @var array */
    private static $modifiableFileExtensions = [
        'html',
        'twig',
    ];

    /**
     * @return string
     */
    protected function getInstallDirectory(): string
    {
        return \Craft::$app->path->getSiteTemplatesPath();
    }

    /**
     * @return string
     */
    protected function getTargetFilesDirectory(): string
    {
        return 'templates';
    }

    /**
     * If anything has to be done with a file once it's copied over
     * This method does it
     *
     * @param string      $newFilePath
     * @param string|null $prefix
     *
     * @throws FileNotFoundException
     */
    public function postFileCopyAction(string $newFilePath, string $prefix = null)
    {
        if (!file_exists($newFilePath)) {
            throw new FileNotFoundException(
                sprintf('Could not find file: %s', $newFilePath)
            );
        }

        $extension = strtolower(pathinfo($newFilePath, PATHINFO_EXTENSION));

        // Prevent from editing anything other than css and js files
        if (!\in_array($extension, self::$modifiableFileExtensions, true)) {
            return;
        }

        $content = file_get_contents($newFilePath);

        $content = $this->updateSrcAndHref($content, $prefix);
        $content = $this->updateLinks($content, $prefix);
        $content = $this->updateTemplateCalls($content, $prefix);
        $content = $this->replaceCustomPrefixCalls($content, $prefix);
        $content = $this->offsetSegments($content, $prefix);

        file_put_contents($newFilePath, $content);
    }

    /**
     * This pattern matches all src or href tag values which begin with:
     * /css or /js or /images
     * And replaces it with the prefixed asset path
     *
     * @param string $content
     * @param string $prefix
     *
     * @return string
     */
    private function updateSrcAndHref(string $content, string $prefix): string
    {
        $pattern = '/(src|href)=([\'"](?:\{{2}\s*siteUrl\s*}{2})?(?:\/?assets\/))demo\//';
        $replace = '$1=$2' . $prefix . '/';
        $content = (string) preg_replace($pattern, $replace, $content);

        return $content;
    }

    /**
     * Replaces all links that starts with "{{ siteUrl }}demo/" with the new path
     *
     * @param string $content
     * @param string $prefix
     *
     * @return string
     */
    private function updateLinks(string $content, string $prefix): string
    {
        $pattern = '/([\'"](?:\{{2}\s*siteUrl\s*}{2})?\/?)demo\//';
        $replace = '$1' . $prefix . '/';
        $content = (string) preg_replace($pattern, $replace, $content);

        return $content;
    }

    /**
     * Updates all includes and extends with the new location
     *
     * @param string $content
     * @param string $prefix
     *
     * @return string
     */
    private function updateTemplateCalls(string $content, string $prefix): string
    {
        $pattern = '/(\{\%\s*(?:extends|include)) ([\'"])(\/?)demo\//';
        $replace = '$1 $2$3' . $prefix . '/';
        $content = (string) preg_replace($pattern, $replace, $content);

        return $content;
    }

    /**
     * Offset all segments by the number of segments the $prefix has
     * since our demo templates will be at least 1 folder deep
     *
     * @param string $content
     * @param string $prefix
     *
     * @return string
     */
    private function offsetSegments(string $content, string $prefix): string
    {
        $segmentCount = substr_count($prefix, '/') + 1;

        $content = str_replace(
            '{% set baseUrlSegments = 1 %}',
            "{% set baseUrlSegments = $segmentCount %}",
            $content
        );

        return $content;
    }

    /**
     * @param string $content
     * @param string $prefix
     *
     * @return string
     */
    private function replaceCustomPrefixCalls(string $content, string $prefix): string
    {
        $pattern = '#(%prefix%)#';
        $content = (string) preg_replace($pattern, $prefix, $content);

        return $content;
    }
}
