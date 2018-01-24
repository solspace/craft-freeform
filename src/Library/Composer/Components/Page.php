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

class Page implements \JsonSerializable, \Iterator, \ArrayAccess
{
    /** @var int */
    private $index;

    /** @var string */
    private $label;

    /** @var Row[] */
    private $rows;

    /** @var FieldInterface[] */
    private $fields;

    /**
     * Page constructor.
     *
     * @param int              $index
     * @param string           $label
     * @param Row[]            $rows
     * @param FieldInterface[] $fields
     */
    public function __construct($index, $label, array $rows, array $fields)
    {
        $this->index  = (int)$index;
        $this->label  = $label;
        $this->rows   = $rows;
        $this->fields = $fields;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @return int
     */
    public function getIndex()
    {
        return $this->index;
    }

    /**
     * @return Row[]
     */
    public function getRows()
    {
        return $this->rows;
    }

    /**
     * @return FieldInterface[]
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @return mixed
     */
    public function jsonSerialize()
    {
        return $this->rows;
    }

    /**
     * Return the current element
     *
     * @return mixed
     */
    public function current()
    {
        return current($this->rows);
    }

    /**
     * Move forward to next element
     *
     * @return void
     */
    public function next()
    {
        next($this->rows);
    }

    /**
     * Return the key of the current element
     *
     * @return mixed
     */
    public function key()
    {
        return key($this->rows);
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
        reset($this->rows);
    }

    /**
     * @inheritDoc
     */
    public function offsetExists($offset)
    {
        return isset($this->rows[$offset]);
    }

    /**
     * @inheritDoc
     */
    public function offsetGet($offset)
    {
        return $this->offsetExists($offset) ? $this->rows[$offset] : null;
    }

    /**
     * @inheritDoc
     */
    public function offsetSet($offset, $value)
    {
        throw new FreeformException("Form Page ArrayAccess does not allow for setting values");
    }

    /**
     * @inheritDoc
     */
    public function offsetUnset($offset)
    {
        throw new FreeformException("Form Page ArrayAccess does not allow unsetting values");
    }
}
