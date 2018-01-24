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

namespace Solspace\Freeform\Library\Session;

class Honeypot implements \JsonSerializable
{
    const NAME_PREFIX = "freeform_form_handle_";

    /** @var string */
    private $name;

    /** @var string */
    private $hash;

    /** @var int */
    private $timestamp;

    /**
     * @param array $data
     *
     * @return Honeypot
     */
    public static function createFromUnserializedData(array $data)
    {
        $honeypot            = new Honeypot();
        $honeypot->name      = $data["name"];
        $honeypot->hash      = $data["hash"];
        $honeypot->timestamp = $data["timestamp"];

        return $honeypot;
    }

    /**
     * Honeypot constructor.
     */
    public function __construct()
    {
        $this->name      = $this->generateUniqueName();
        $this->hash      = $this->generateHash();
        $this->timestamp = time();
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getHash()
    {
        return $this->hash;
    }

    /**
     * @return int
     */
    public function getTimestamp()
    {
        return $this->timestamp;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @return array
     */
    public function jsonSerialize()
    {
        return [
            "name"      => $this->getName(),
            "hash"      => $this->getHash(),
            "timestamp" => $this->getTimestamp(),
        ];
    }

    /**
     * @return string
     */
    private function generateUniqueName()
    {
        $hash = $this->generateHash(6);

        return self::NAME_PREFIX . $hash;
    }

    /**
     * @param int $length
     *
     * @return string
     */
    private function generateHash($length = 9)
    {
        $random = time() . rand(111, 999) . (time() + 999);
        $hash   = sha1($random);

        return substr($hash, 0, $length);
    }
}
