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

namespace Solspace\Freeform\Library\Composer\Components;

use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;

class Context implements \JsonSerializable
{
    /** @var int */
    private $page;

    /** @var string */
    private $hash;

    /**
     * Context constructor.
     *
     * @param array $contextData
     *
     * @throws ComposerException
     */
    public function __construct(array $contextData)
    {
        $this->page = isset($contextData['page']) ? (int)$contextData['page'] : 0;
        $this->hash = isset($contextData['hash']) ? $contextData['hash'] : Composer::KEY_FORM;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @link  http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *        which is a value of any type other than a resource.
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return [
            'page' => $this->page,
            'hash' => $this->hash,
        ];
    }
}
