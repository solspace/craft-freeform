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

namespace Solspace\Freeform\Library\Codepack\Components;

use Solspace\Freeform\Library\Codepack\Components\FileObject\FileObject;
use Solspace\Freeform\Library\Codepack\Components\FileObject\Folder;
use Solspace\Freeform\Library\Codepack\Exceptions\CodepackException;

abstract class AbstractFileComponent implements ComponentInterface
{
    /** @var string */
    protected $installDirectory;

    /** @var string */
    protected $targetFilesDirectory;

    /** @var Folder */
    protected $contents;

    /** @var string */
    private $location;

    /**
     * @param string $location - the location of files
     *
     * @throws CodepackException
     */
    public final function __construct(string $location)
    {
        $this->location = $location;
        $this->contents = $this->locateFiles();
    }

    /**
     * @return string
     */
    abstract protected function getInstallDirectory(): string;

    /**
     * @return string
     */
    abstract protected function getTargetFilesDirectory(): string;

    /**
     * If anything must come after /{install_directory}/{prefix}demo/{???}
     * It is returned here
     *
     * @param string $prefix
     *
     * @return string
     */
    protected function getSubInstallDirectory(string $prefix): string
    {
        return '';
    }

    /**
     * Installs the component files into the $installDirectory
     *
     * @param string|null $prefix
     */
    public function install(string $prefix = null)
    {
        $installDirectory = $this->getInstallDirectory();
        $installDirectory = rtrim($installDirectory, '/');
        $installDirectory .= '/' . $prefix . '/';
        $installDirectory .= ltrim($this->getSubInstallDirectory($prefix), '/');

        foreach ($this->contents as $file) {
            $file->copy($installDirectory, $prefix, [$this, 'postFileCopyAction']);
        }
    }

    /**
     * If anything has to be done with a file once it's copied over
     * This method does it
     *
     * @param string      $newFilePath
     * @param string|null $prefix
     */
    public function postFileCopyAction(string $newFilePath, string $prefix = null)
    {
    }

    /**
     * @return FileObject
     */
    public function getContents(): FileObject
    {
        return $this->contents;
    }

    /**
     * @return Folder
     * @throws CodepackException
     */
    private function locateFiles(): Folder
    {
        $directory = FileObject::createFromPath($this->getFileLocation());

        if (!$directory instanceof Folder) {
            throw new CodepackException('Target directory is not a directory: ' . $this->getFileLocation());
        }

        return $directory;
    }

    /**
     * @return string
     */
    private function getFileLocation(): string
    {
        return $this->location . '/' . $this->getTargetFilesDirectory();
    }
}
