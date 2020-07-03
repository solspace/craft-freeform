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

use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Fields\SubmitField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Attributes\DynamicNotificationAttributes;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Models\Settings;

class FormValueContext implements \JsonSerializable
{
    const FORM_HASH_DELIMITER = '_';
    const FORM_HASH_KEY       = 'formHash';
    const HASH_PATTERN        = '/^(?P<formId>[a-zA-Z0-9]+)_(?P<pageIndex>[a-zA-Z0-9]+)_(?P<payload>[a-zA-Z0-9]+)/';

    const ACTIVE_SESSIONS_KEY    = 'freeformActiveSessions';

    const DEFAULT_PAGE_INDEX = 0;

    const DATA_DYNAMIC_TEMPLATE_KEY = 'dynamicTemplate';
    const DATA_STATUS               = 'status';
    const DATA_SUBMISSION_TOKEN     = 'submissionToken';
    const DATA_SUPPRESS             = 'suppress';
    const DATA_RELATIONS            = 'relations';
    const DATA_PERSISTENT_VALUES    = 'persistentValues';

    /** @var int */
    private $formId;

    /** @var int */
    private $currentPageIndex;

    /** @var array */
    private $storedValues;

    /** @var array */
    private $customFormData;

    /** @var SessionInterface */
    private $session;

    /** @var RequestInterface */
    private $request;

    /** @var string */
    private $lastHash;

    /** @var int */
    private $formInitTime;

    /** @var int */
    private $sessionMaxCount;

    /** @var int */
    private $sessionTTL;

    /**
     * @param string $hash
     *
     * @return int|null
     */
    public static function getFormIdFromHash(string $hash = null)
    {
        list($formIdHash) = self::getHashParts($hash);

        return $formIdHash ? HashHelper::decode($formIdHash) : null;
    }

    /**
     * @param string $hash
     *
     * @return int|null
     */
    public static function getPageIndexFromHash($hash)
    {
        list($_, $pageIndexHash) = self::getHashParts($hash);

        return HashHelper::decode($pageIndexHash);
    }

    /**
     * Returns an array of [formIdHash, pageIndexHash, payload]
     *
     * @param string $hash
     *
     * @return array
     */
    private static function getHashParts($hash): array
    {
        if (preg_match(self::HASH_PATTERN, $hash, $matches)) {
            return [$matches['formId'], $matches['pageIndex'], $matches['payload']];
        }

        return [null, null, null];
    }

    /**
     * SessionFormContext constructor.
     *
     * @param int              $formId
     * @param SessionInterface $session
     * @param RequestInterface $request
     */
    public function __construct(
        $formId,
        SessionInterface $session,
        RequestInterface $request
    ) {
        $this->session          = $session;
        $this->request          = $request;
        $this->formId           = (int) $formId;
        $this->currentPageIndex = 0;
        $this->storedValues     = [];

        /** @var Settings $settings */
        $settings              = Freeform::getInstance()->getSettings();
        $this->sessionMaxCount = $settings->sessionEntryMaxCount;
        $this->sessionTTL      = $settings->sessionEntryTTL;

        $this->lastHash = $this->regenerateHash();
        $this->regenerateState();
        $this->cleanUpOldSessions();
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        $this->lastHash = $this->regenerateHash();

        return $this->lastHash;
    }

    /**
     * @return int
     */
    public function getInitTime(): int
    {
        return $this->formInitTime;
    }

    /**
     * @return string
     */
    public function getLastHash(): string
    {
        return $this->lastHash;
    }

    /**
     * @return int
     */
    public function getCurrentPageIndex(): int
    {
        return $this->currentPageIndex;
    }

    /**
     * @param int $currentPageIndex
     *
     * @return $this
     */
    public function setCurrentPageIndex($currentPageIndex): FormValueContext
    {
        $this->currentPageIndex = $currentPageIndex;
        $this->regenerateHash();

        return $this;
    }

    /**
     * @param AbstractField $field
     *
     * @return bool
     */
    public function hasFieldBeenSubmitted(AbstractField $field): bool
    {
        return isset($this->storedValues[$field->getHandle()]);
    }

    /**
     * @param AbstractField $field
     *
     * @return mixed|null
     */
    public function getStoredValue(AbstractField $field)
    {
        $fieldName = $field->getHandle();
        if (null === $fieldName) {
            return null;
        }

        if ($this->hasFormBeenPosted()) {
            $currentPageIndex = $this->getCurrentPageIndex();
            if ($this->hasPageBeenPosted() && $field->getPageIndex() === $currentPageIndex) {
                return $this->request->getPost($fieldName);
            }

            if (isset($this->storedValues[$fieldName])) {
                return $this->storedValues[$fieldName];
            }
        }

        $default = $field->getValue();
        if (\is_string($default)) {
            $default = htmlspecialchars($default);
        }

        if (Freeform::getInstance()->settings->getSettingsModel()->fillWithGet) {
            if ($field instanceof CheckboxField && !$field->isChecked()) {
                $default = null;
            }

            return $this->request->getGet($fieldName, $default);
        }

        if ($field instanceof CheckboxField && !$field->isChecked()) {
            return null;
        }

        return $default;
    }

    /**
     * Checks whether the "PREVIOUS PAGE" button has been pressed
     *
     * @return bool
     */
    public function shouldFormWalkToPreviousPage(): bool
    {
        if ($this->hasPageBeenPosted()) {
            return null !== $this->request->getPost(SubmitField::PREVIOUS_PAGE_INPUT_NAME);
        }

        return false;
    }

    /**
     * @param array|null $data
     *
     * @return $this
     */
    public function setCustomFormData(array $data = null): FormValueContext
    {
        $this->customFormData = $data;

        return $this;
    }

    /**
     * @return DynamicNotificationAttributes|null
     */
    public function getDynamicNotificationData()
    {
        if (isset($this->customFormData[self::DATA_DYNAMIC_TEMPLATE_KEY])) {
            return new DynamicNotificationAttributes($this->customFormData[self::DATA_DYNAMIC_TEMPLATE_KEY]);
        }

        return null;
    }

    /**
     * @return array|bool|null
     */
    public function getSuppressorData()
    {
        return $this->customFormData[self::DATA_SUPPRESS] ?? null;
    }

    /**
     * @return array|string|int|null
     */
    public function getRelationData()
    {
        return $this->customFormData[self::DATA_RELATIONS] ?? null;
    }

    /**
     * @return string|int|null
     */
    public function getDefaultStatus()
    {
        return $this->customFormData[self::DATA_STATUS] ?? null;
    }

    /**
     * @return string|null
     */
    public function getSubmissionIdentificator()
    {
        return $this->customFormData[self::DATA_SUBMISSION_TOKEN] ?? null;
    }

    /**
     * @return array|mixed
     */
    public function getPersistentValues()
    {
        return $this->customFormData[self::DATA_PERSISTENT_VALUES] ?? [];
    }

    /**
     * @param array $storedValues
     *
     * @return FormValueContext
     */
    public function appendStoredValues(array $storedValues): FormValueContext
    {
        $this->storedValues = array_merge($this->storedValues, $storedValues);

        return $this;
    }

    /**
     * Advances the page index by 1
     */
    public function advanceToNextPage()
    {
        $this->currentPageIndex++;
        $this->regenerateHash();
    }

    /**
     * Walks back a single page
     */
    public function retreatToPreviousPage()
    {
        $this->currentPageIndex--;
        $this->regenerateHash();
    }

    /**
     * Jumps to a specific form page index
     *
     * @param int $pageIndex
     */
    public function jumpToPageIndex(int $pageIndex)
    {
        $this->currentPageIndex = $pageIndex;
        $this->regenerateHash();
    }

    /**
     * Save current state in session
     */
    public function saveState()
    {
        $encodedData    = \GuzzleHttp\json_encode($this, JSON_OBJECT_AS_ARRAY);
        $sessionHashKey = $this->getSessionHash($this->getLastHash());

        $this->appendSessionData($sessionHashKey, $encodedData);
    }

    /**
     * Removes the current key from active session list
     */
    public function cleanOutCurrentSession()
    {
        $sessionHashKey = $this->getSessionHash($this->getLastHash());
        $this->removeStateFromSession($sessionHashKey);
    }

    /**
     * Attempts to regenerate existing state
     */
    public function regenerateState()
    {
        $sessionHash  = $this->getSessionHash();
        $sessionState = $this->getSessionState($sessionHash);

        if ($sessionHash && $sessionState) {
            $sessionState = \GuzzleHttp\json_decode($sessionState, true);

            $this->currentPageIndex = $sessionState['currentPageIndex'];
            $this->storedValues     = $sessionState['storedValues'];
            $this->customFormData   = $sessionState['customFormData'];
            $this->formInitTime     = $sessionState['formInitTime'];
        } else {
            $this->currentPageIndex = self::DEFAULT_PAGE_INDEX;
            $this->storedValues     = [];
            $this->customFormData   = [];
            $this->formInitTime     = time();
        }
    }

    /**
     * Check if the current form has been posted
     *
     * @return bool
     */
    public function hasFormBeenPosted(): bool
    {
        $postedHash = $this->getPostedHash();

        if (null === $postedHash) {
            return false;
        }

        list($_, $_, $postedPayload) = self::getHashParts($postedHash);
        list($_, $_, $currentPayload) = self::getHashParts($this->getLastHash());

        return $postedPayload === $currentPayload;
    }

    /**
     * Check if the current form has been posted
     *
     * @return bool
     */
    public function hasPageBeenPosted(): bool
    {
        $postedHash = $this->getPostedHash();

        if (null === $postedHash || !$this->hasFormBeenPosted()) {
            return false;
        }

        list($_, $postedPageIndex, $postedPayload) = self::getHashParts($postedHash);
        list($_, $currentPageIndex, $currentPayload) = self::getHashParts($this->getLastHash());

        return $postedPageIndex === $currentPageIndex && $postedPayload === $currentPayload;
    }

    /**
     * @return string|null
     */
    private function getPostedHash()
    {
        return $this->request->getPost(self::FORM_HASH_KEY);
    }

    /**
     * @param string $hash - provide an existing hash, otherwise takes it from POST
     *
     * @return string|null
     */
    private function getSessionHash($hash = null)
    {
        if (null === $hash) {
            $hash = $this->getPostedHash();
        }

        list($formIdHash, $_, $payload) = self::getHashParts($hash);

        if ($formIdHash === $this->hashFormId()) {
            return sprintf(
                '%s%s%s',
                $formIdHash,
                self::FORM_HASH_DELIMITER,
                $payload
            );
        }

        return null;
    }

    /**
     * Generates a random hash for identification
     *
     * @return string
     */
    private function regenerateHash(): string
    {
        // Attempt to fetch hashes from POST data
        list($formIdHash, $_, $payload) = self::getHashParts($this->getPostedHash());

        $formId           = self::getFormIdFromHash($this->getPostedHash());
        $isFormIdMatching = $formId === $this->formId;

        // Only generate a new hash if the content indexes don' match with the posted hash
        // Or if there is no posted hash
        $generateNew = !$isFormIdMatching || !($formIdHash && $payload);

        if ($generateNew) {
            $random  = time() . random_int(111, 999);
            $hash    = sha1($random);
            $payload = uniqid($hash, false);

            $formIdHash = HashHelper::hash($this->formId);
        }

        $hashedPageIndex = $this->hashPageIndex();

        $hash = sprintf(
            '%s%s%s%s%s',
            $formIdHash,
            self::FORM_HASH_DELIMITER,
            $hashedPageIndex,
            self::FORM_HASH_DELIMITER,
            $payload
        );
        $hash = htmlentities($hash, ENT_QUOTES, 'UTF-8');

        return $hash;
    }

    /**
     * @return string
     */
    private function hashFormId(): string
    {
        return HashHelper::hash($this->formId ?? 0);
    }

    /**
     * @return string
     */
    private function hashPageIndex(): string
    {
        return HashHelper::sha1($this->currentPageIndex, 4, 10);
    }

    /**
     * Cleans up all old session instances
     */
    private function cleanUpOldSessions()
    {
        $instances = $this->getActiveSessionList();

        foreach ($instances as $hash => $encodedData) {
            try {
                $data = \GuzzleHttp\json_decode($encodedData, true);
            } catch (\Exception $e) {
                continue;
            }

            $time = $data['formInitTime'] ?? time();
            if ($time < time() - $this->sessionTTL) {
                unset($instances[$hash]);
            }
        }

        $instanceCount = \count($instances);
        if ($instanceCount > $this->sessionMaxCount) {
            $offset = $instanceCount - $this->sessionMaxCount;
            $instances = array_slice($instances, $offset, null, true);
        }

        $this->session->set(self::ACTIVE_SESSIONS_KEY, $instances);
    }

    private function removeStateFromSession(string $hash)
    {
        $instances = $this->getActiveSessionList();

        if (isset($instances[$hash])) {
            unset($instances[$hash]);
            $this->session->set(self::ACTIVE_SESSIONS_KEY, $instances);
        }
    }

    /**
     * Gets the active session list
     * [time => sessionHash, ..]
     *
     * @return array
     */
    private function getActiveSessionList(): array
    {
        return $this->session->get(self::ACTIVE_SESSIONS_KEY, []);
    }

    /**
     * @param string $hash
     *
     * @return string|null
     */
    private function getSessionState(string $hash = null)
    {
        if (null === $hash) {
            return null;
        }

        $instances = $this->getActiveSessionList();

        return $instances[$hash] ?? null;
    }

    /**
     * Appends a session hash to active instances, for cleanup later
     *
     * @param string $sessionHash
     * @param string $encodedData
     */
    private function appendSessionData($sessionHash, $encodedData)
    {
        $instances = $this->getActiveSessionList();
        $instances[$sessionHash] = $encodedData;

        $this->session->set(self::ACTIVE_SESSIONS_KEY, $instances);
    }

    /**
     * @inheritdoc
     */
    public function jsonSerialize()
    {
        return [
            'currentPageIndex' => $this->currentPageIndex,
            'storedValues'     => $this->storedValues,
            'customFormData'   => $this->customFormData,
            'formInitTime'     => $this->formInitTime,
        ];
    }
}
