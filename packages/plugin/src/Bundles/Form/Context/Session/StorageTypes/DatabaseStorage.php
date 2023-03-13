<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Carbon\Carbon;
use craft\db\Query;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\SessionContextRecord;

class DatabaseStorage implements FormContextStorageInterface
{
    /** @var SessionBag[] */
    private $context;

    private $referenceDate;

    private $activeRecordsPerSession;

    public function __construct(int $timeToLiveInMinutes, int $activeRecordsPerSession)
    {
        $this->referenceDate = new Carbon('-'.$timeToLiveInMinutes.' minutes', 'UTC');
        $this->activeRecordsPerSession = $activeRecordsPerSession;
    }

    /**
     * @return null|SessionBag
     */
    public function getBag(string $key, Form $form)
    {
        if (!isset($this->context[$key])) {
            $record = SessionContextRecord::findOne(
                [
                    'formId' => $form->getId(),
                    'contextKey' => $key,
                ]
            );

            if ($record) {
                $propertyBag = json_decode($record->propertyBag ?? '[]', true);
                $attributeBag = json_decode($record->attributeBag ?? '[]', true);
                $lastUpdate = new Carbon($record->dateUpdated, 'UTC');

                $this->context[$key] = new SessionBag($form->getId(), $propertyBag, $attributeBag, $lastUpdate);
            } else {
                $this->context[$key] = null;
            }
        }

        return $this->context[$key];
    }

    public function registerBag(string $key, SessionBag $bag, Form $form): self
    {
        $this->context[$key] = $bag;

        return $this;
    }

    public function persist()
    {
        $existingKeys = (new Query())
            ->select('contextKey')
            ->from(SessionContextRecord::TABLE)
            ->where(['contextKey' => array_keys($this->context)])
            ->column()
        ;

        foreach ($this->context as $key => $bag) {
            $isNew = !\in_array($key, $existingKeys, true);

            $payload = [
                'contextKey' => $key,
                'sessionId' => \Craft::$app->session->getId(),
                'formId' => $bag->getFormId(),
                'propertyBag' => json_encode($bag->getProperties()),
                'attributeBag' => json_encode($bag->getAttributes()),
                'dateUpdated' => $bag->getLastUpdate(),
            ];

            if ($isNew) {
                \Craft::$app->db
                    ->createCommand()
                    ->insert(SessionContextRecord::TABLE, $payload)
                    ->execute()
                ;
            } else {
                \Craft::$app->db
                    ->createCommand()
                    ->update(
                        SessionContextRecord::TABLE,
                        $payload,
                        [
                            'formId' => $bag->getFormId(),
                            'contextKey' => $key,
                        ],
                        [],
                        true
                    )
                    ->execute()
                ;
            }
        }
    }

    public function removeBag(string $key)
    {
        if (isset($this->context[$key])) {
            \Craft::$app->db
                ->createCommand()
                ->delete(SessionContextRecord::TABLE, ['contextKey' => $key])
                ->execute()
            ;

            unset($this->context[$key]);
        }
    }

    public function cleanup()
    {
        $table = SessionContextRecord::TABLE;

        \Craft::$app->db
            ->createCommand()
            ->delete($table, ['<', 'dateUpdated', $this->referenceDate])
            ->execute()
        ;

        $idsToDelete = (new Query())
            ->select('id')
            ->from($table)
            ->where(['sessionId' => \Craft::$app->session->getId()])
            ->orderBy('[[dateUpdated]] DESC')
            ->offset($this->activeRecordsPerSession)
            ->column()
        ;

        \Craft::$app->db
            ->createCommand()
            ->delete($table, ['id' => $idsToDelete])
            ->execute()
        ;
    }
}
