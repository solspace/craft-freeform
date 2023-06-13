<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Commons\Helpers\StringHelper;

class FormTemplate implements \JsonSerializable
{
    private string $fileName;
    private string $name;

    public function __construct(private string $filePath, string $root)
    {
        $root = realpath($root);
        $filePath = realpath($filePath);
        $this->fileName = ltrim(str_replace($root, '', $filePath), '/');

        $name = pathinfo($filePath, \PATHINFO_FILENAME);
        if ('index' === $name) {
            $name = pathinfo(\dirname($filePath), \PATHINFO_FILENAME);
        }

        $this->name = StringHelper::camelize(StringHelper::humanize($name));
        $this->name = str_replace(['-', '_'], ' ', $this->name);
    }

    public function getFilePath(): string
    {
        return $this->filePath;
    }

    public function getFileName(): string
    {
        return $this->fileName;
    }

    public function getName(): string
    {
        return $this->name;
    }

    /**
     * {@inheritdoc}
     */
    public function jsonSerialize()
    {
        return [
            'name' => $this->getName(),
            'fileName' => $this->getFileName(),
            'filePath' => $this->getFilePath(),
        ];
    }
}
