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

namespace Solspace\Freeform\Library\Session;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;

class Honeypot implements \JsonSerializable
{
    const NAME_PREFIX = 'freeform_form_handle';

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
    public static function createFromUnserializedData(array $data): Honeypot
    {
        $honeypot            = new Honeypot();
        $honeypot->name      = $data['name'];
        $honeypot->hash      = $data['hash'];
        $honeypot->timestamp = $data['timestamp'];

        return $honeypot;
    }

    /**
     * Honeypot constructor.
     *
     * @param bool $isEnhanced
     */
    public function __construct(bool $isEnhanced = false)
    {
        $this->name      = $this->getHoneypotInputName($isEnhanced);
        $this->hash      = $isEnhanced ? $this->generateHash() : '';
        $this->timestamp = time();
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        return $this->hash;
    }

    /**
     * @return int
     */
    public function getTimestamp(): int
    {
        return $this->timestamp;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @return array
     */
    public function jsonSerialize(): array
    {
        return [
            'name'      => $this->getName(),
            'hash'      => $this->getHash(),
            'timestamp' => $this->getTimestamp(),
        ];
    }

    /**
     * @param string $prefix
     *
     * @return string
     */
    private function generateUniqueName(string $prefix): string
    {
        $hash = $this->generateHash(6);

        return $prefix . '_' . $hash;
    }

    /**
     * @param int $length
     *
     * @return string
     */
    private function generateHash($length = 9): string
    {
        $random = time() . random_int(111, 999) . (time() + 999);
        $hash   = sha1($random);

        return substr($hash, 0, $length);
    }

    /**
     * @param bool $isEnhanced
     *
     * @return mixed|string
     */
    private function getHoneypotInputName(bool $isEnhanced)
    {
        $inputName = Freeform::getInstance()->settings->getSettingsModel()->customHoneypotName;
        if (!$inputName) {
            $inputName = self::NAME_PREFIX;
        }

        return $isEnhanced ? $this->generateUniqueName($inputName) : $inputName;
    }
}
