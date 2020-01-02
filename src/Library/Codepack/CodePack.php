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

namespace Solspace\Freeform\Library\Codepack;

use Solspace\Freeform\Library\Codepack\Components\RoutesComponent;
use Solspace\Freeform\Library\Codepack\Components\TemplatesFileComponent;
use Solspace\Freeform\Library\Codepack\Exceptions\CodepackException;
use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;
use Solspace\Freeform\Library\Codepack\Exceptions\Manifest\ManifestNotPresentException;
use Solspace\Freeform\Library\Codepack\Components\AssetsFileComponent;
use Symfony\Component\Filesystem\Filesystem;

class CodePack
{
    const MANIFEST_NAME = 'manifest.json';

    /** @var string */
    private $location;

    /** @var Manifest */
    private $manifest;

    /** @var TemplatesFileComponent */
    private $templates;

    /** @var AssetsFileComponent */
    private $assets;

    /** @var RoutesComponent */
    private $routes;

    /**
     * @param string $prefix
     *
     * @return string
     */
    public static function getCleanPrefix(string $prefix): string
    {
        $prefix = preg_replace("/\/+/", '/', $prefix);
        $prefix = trim($prefix, '/');

        return $prefix;
    }


    /**
     * Codepack constructor.
     *
     * @param string $location
     *
     * @throws CodepackException
     * @throws ManifestNotPresentException
     */
    public function __construct($location)
    {
        $fs = new Filesystem();

        if (!$fs->exists($location)) {
            throw new CodepackException(
                sprintf(
                    "Codepack folder does not exist in '%s'",
                    $location
                )
            );
        }

        $this->location  = $location;
        $this->manifest  = $this->assembleManifest();
        $this->templates = $this->assembleTemplates();
        $this->assets    = $this->assembleAssets();
        $this->routes    = $this->assembleRoutes();
    }

    /**
     * @param string $prefix
     *
     * @throws FileObjectException
     */
    public function install(string $prefix)
    {
        $prefix = self::getCleanPrefix($prefix);

        $this->templates->install($prefix);
        $this->assets->install($prefix);
        $this->routes->install($prefix);
    }

    /**
     * @return Manifest
     */
    public function getManifest(): Manifest
    {
        return $this->manifest;
    }

    /**
     * @return TemplatesFileComponent
     */
    public function getTemplates(): TemplatesFileComponent
    {
        return $this->templates;
    }

    /**
     * @return AssetsFileComponent
     */
    public function getAssets(): AssetsFileComponent
    {
        return $this->assets;
    }

    /**
     * @return RoutesComponent
     */
    public function getRoutes(): RoutesComponent
    {
        return $this->routes;
    }

    /**
     * Assembles a Manifest object based on the manifest file
     *
     * @return Manifest
     */
    private function assembleManifest(): Manifest
    {
        return new Manifest($this->location . '/' . self::MANIFEST_NAME);
    }

    /**
     * Gets a TemplatesComponent object with all installable templates found
     *
     * @return TemplatesFileComponent
     */
    private function assembleTemplates(): TemplatesFileComponent
    {
        return new TemplatesFileComponent($this->location);
    }

    /**
     * Gets an AssetsComponent object with all installable assets found
     *
     * @return AssetsFileComponent
     */
    private function assembleAssets(): AssetsFileComponent
    {
        return new AssetsFileComponent($this->location);
    }

    /**
     * Gets a RoutesComponent object with all installable routes
     *
     * @return RoutesComponent
     */
    private function assembleRoutes(): RoutesComponent
    {
        return new RoutesComponent($this->location);
    }
}
