<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Codepack\Components\FileObject;

use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;

class File extends FileObject
{
    /**
     * File constructor.
     *
     * @param string $path
     */
    protected function __construct(string $path)
    {
        $file = pathinfo($path, PATHINFO_BASENAME);

        $this->folder = false;
        $this->path   = $path;
        $this->name   = $file;
    }

    /**
     * Copy the file or directory to $target location
     *
     * @param string              $target
     * @param string|null         $prefix
     * @param array|callable|null $callable
     * @param string|null         $filePrefix
     *
     * @return void
     */
    public function copy(string $target, string $prefix = null, callable $callable = null, string $filePrefix = null)
    {
        $target      = rtrim($target, '/');
        $newFilePath = $target . '/' . $filePrefix . $this->name;

        $this->getFileSystem()->copy($this->path, $newFilePath, true);

        if (null !== $callable) {
            $callable($newFilePath, $prefix);
        }
    }
}
