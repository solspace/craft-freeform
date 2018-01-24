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

use Solspace\Freeform\Library\Exceptions\FreeformException;

class Row implements \JsonSerializable, \Iterator, \ArrayAccess, \Countable
{
    /** @var string */
    private $id;

    /** @var AbstractField[] */
    private $fields;

    /**
     * @param string $id
     * @param array  $fields
     */
    public function __construct($id, array $fields)
    {
        $this->id     = $id;
        $this->fields = $fields;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @return mixed
     */
    public function jsonSerialize()
    {
        return [
            "id"      => $this->id,
            "columns" => $this->fields,
        ];
    }

    /**
     * Return the current element
     *
     * @return mixed
     */
    public function current()
    {
        return current($this->fields);
    }

    /**
     * Move forward to next element
     *
     * @return void
     */
    public function next()
    {
        next($this->fields);
    }

    /**
     * Return the key of the current element
     *
     * @return mixed
     */
    public function key()
    {
        return key($this->fields);
    }

    /**
     * Checks if current position is valid
     *
     * @return bool
     */
    public function valid()
    {
        return !is_null($this->key()) && $this->key() !== false;
    }

    /**
     * Rewind the Iterator to the first element
     *
     * @return void
     */
    public function rewind()
    {
        reset($this->fields);
    }

    /**
     * Count elements of an object
     *
     * @return int
     */
    public function count()
    {
        return count($this->fields);
    }

    /**
     * @inheritDoc
     */
    public function offsetExists($offset)
    {
        return isset($this->fields[$offset]);
    }

    /**
     * @inheritDoc
     */
    public function offsetGet($offset)
    {
        return $this->offsetExists($offset) ? $this->fields[$offset] : null;
    }

    /**
     * @inheritDoc
     */
    public function offsetSet($offset, $value)
    {
        throw new FreeformException("Form Page Row ArrayAccess does not allow unsetting values");
    }

    /**
     * @inheritDoc
     */
    public function offsetUnset($offset)
    {
        throw new FreeformException("Form Page Row ArrayAccess does not allow unsetting values");
    }
}
