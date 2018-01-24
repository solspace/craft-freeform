<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Library\Helpers\StringHelper;

class FormTemplate implements \JsonSerializable
{
    /** @var string */
    private $filePath;

    /** @var string */
    private $fileName;

    /** @var string */
    private $name;

    /**
     * FormTemplate constructor.
     *
     * @param string $filePath
     */
    public function __construct($filePath)
    {
        $this->filePath = $filePath;
        $this->fileName = pathinfo($filePath, PATHINFO_BASENAME);
        $this->name     = StringHelper::camelize(StringHelper::humanize(pathinfo($filePath, PATHINFO_FILENAME)));
    }

    /**
     * @return string
     */
    public function getFilePath(): string
    {
        return $this->filePath;
    }

    /**
     * @return string
     */
    public function getFileName(): string
    {
        return $this->fileName;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @inheritdoc
     */
    public function jsonSerialize()
    {
        return [
            'name'     => $this->getName(),
            'fileName' => $this->getFileName(),
            'filePath' => $this->getFilePath(),
        ];
    }
}
