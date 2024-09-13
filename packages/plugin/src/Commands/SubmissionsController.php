<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use craft\helpers\Queue;
use craft\queue\jobs\ResaveElements;
use Faker\Factory;
use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Commands\Fix\TitleFixMigration;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\InvisibleField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Freeform;
use yii\console\ExitCode;
use yii\helpers\Console;

class SubmissionsController extends Controller
{
    /** @var bool whether to update the search indexes for the resaved elements */
    public bool $updateSearchIndex = false;

    /** @var null|int|string the ID(s) of the elements to resave */
    public null|int|string $elementId = null;

    /** @var null|string the UUID(s) of the elements to resave */
    public ?string $uid = null;

    /** @var int|string The status(es) of elements to resave. Can be set to multiple comma-separated statuses. */
    public null|int|string $status = null;

    /** @var bool whether the elements should be resaved via a queue job */
    public bool $queue = false;

    /** @var null|int the number of elements to skip */
    public ?int $offset = null;

    /** @var null|int the number of elements to resave */
    public ?int $limit = null;

    public ?string $locale = Factory::DEFAULT_LOCALE;

    /** @var null|int The amount of submissions to generate */
    public ?int $count = 1;

    /** @var null|int|string The form handle or ID to generate submissions for */
    public null|int|string $form = null;

    public ?int $authorId = null;

    /** @var bool Mark generated submissions as spam */
    public bool $spam = false;

    /** @var null|string Start dates from this date (Can use relative wording.) */
    public ?string $rangeStart = null;

    /** @var null|string End dates with this date (Can use relative wording.) */
    public ?string $rangeEnd = null;

    public ?bool $verbose = false;
    public ?bool $dryRun = false;

    public function optionAliases(): array
    {
        return [
            'l' => 'locale',
            'c' => 'count',
            'f' => 'form',
            'a' => 'authorId',
            's' => 'status',
            'rs' => 'rangeStart',
            're' => 'rangeEnd',
            'v' => 'verbose',
        ];
    }

    public function options($actionID): array
    {
        return match ($actionID) {
            'fix-titles' => [],
            'generate' => [
                'locale',
                'count',
                'form',
                'spam',
                'authorId',
                'status',
                'rangeStart',
                'rangeEnd',
                'verbose',
                'dryRun',
            ],
            'resave' => [
                'updateSearchIndex',
                'elementId',
                'uid',
                'status',
                'queue',
                'offset',
                'limit',
            ],
        };
    }

    public function actionGenerate(): int
    {
        $this->stdout("===================================\n", Console::FG_YELLOW);
        $this->stdout("= Generating Freeform Submissions =\n", Console::FG_YELLOW);
        $this->stdout("===================================\n\n", Console::FG_YELLOW);

        $faker = Factory::create($this->locale);
        $freeform = Freeform::getInstance();
        $verbose = $this->verbose || $this->dryRun;

        $name = 1 === $this->count ? Submission::lowerDisplayName() : Submission::pluralLowerDisplayName();
        $this->stdout("Generating {$this->count} {$name} for form \"{$this->form}\"...\n\n", Console::FG_YELLOW);

        $form = $freeform->forms->getFormByHandleOrId($this->form);
        if (!$form) {
            throw new \Exception('No form found. Please specify a valid form handle or ID.');
        }

        $defaultStatus = $form->getSettings()->getGeneral()->defaultStatus;
        $allStatuses = $freeform->statuses->getAllStatuses();

        if ('any' === $this->status) {
            $statuses = array_keys($allStatuses);
        } elseif (is_numeric($this->status)) {
            $statuses = [$this->status];
        } else {
            $statuses = explode(',', $this->status);
            $statuses = array_map(
                function ($status) use ($allStatuses) {
                    if (is_numeric($status)) {
                        return $allStatuses[$status]?->id;
                    }

                    foreach ($allStatuses as $statusModel) {
                        if ($statusModel->handle === $status) {
                            return $statusModel->id;
                        }
                    }

                    return null;
                },
                $statuses,
            );
            $statuses = array_filter($statuses);
        }

        if (empty($statuses)) {
            $statuses = [$defaultStatus];
        }

        if ($this->dryRun) {
            $this->stdout("Dry run enabled. No submissions will be saved.\n\n", Console::FG_YELLOW);
        }

        if (!$verbose) {
            Console::startProgress(0, $this->count, '', 0.44);
        }

        for ($i = 0; $i < $this->count; ++$i) {
            $values = [];
            foreach ($form->getLayout()->getFields() as $field) {
                if ($field instanceof CheckboxField) {
                    $value = $faker->boolean();
                } elseif ($field instanceof EmailField) {
                    $value = $faker->email;
                } elseif ($field instanceof OptionsInterface) {
                    if ($field instanceof MultiValueInterface) {
                        $iterator = $field->getOptions()->getIterator();
                        if (!\count($iterator)) {
                            continue;
                        }

                        $value = array_map(
                            fn (Option $option) => $option->getValue(),
                            $faker->randomElements($field->getOptions()->getIterator(), null)
                        );
                    } else {
                        $value = $faker->randomElement($field->getOptions()->getIterator())?->getValue();
                    }
                } elseif ($field instanceof NumberField) {
                    $value = $faker->numberBetween(
                        $field->getMinValue() ?? 0,
                        $field->getMaxValue() ?? 1000,
                    );
                } elseif ($field instanceof DatetimeField) {
                    $date = $faker->dateTimeBetween('-3 months', '+3 months');

                    $chunks = [];
                    if ($field->isShowDate()) {
                        $chunks[] = $date->format($field->getDateFormat());
                    }

                    if ($field->isShowTime()) {
                        $chunks[] = $date->format($field->getTimeFormat());
                    }

                    if ($chunks) {
                        $value = implode(' ', $chunks);
                    }
                } elseif ($field instanceof WebsiteField) {
                    $value = $faker->url;
                } elseif ($field instanceof PasswordField) {
                    $value = $faker->password;
                } elseif ($field instanceof ConfirmationField) {
                    $value = $values[$field->getTargetField()->getHandle()] ?? 'no-value-found';
                } elseif ($field instanceof RegexField) {
                    $value = $faker->regexify($field->getPattern());
                } elseif ($field instanceof SignatureField) {
                    static $signature;

                    if (null === $signature) {
                        $file = $faker->image(
                            null,
                            $field->getWidth(),
                            $field->getHeight(),
                            'signature',
                            true,
                            false
                        );

                        $content = file_get_contents($file);
                        $signature = 'data:image/png;base64,'.base64_encode($content);
                    }

                    $value = $signature;
                } elseif ($field instanceof FileUploadField) {
                    continue;
                } elseif ($field instanceof PhoneField) {
                    $value = $faker->phoneNumber;
                } elseif ($field instanceof InvisibleField) {
                    continue;
                } elseif ($field instanceof TextField) {
                    $handle = strtolower($field->getHandle());
                    if (str_contains($handle, 'name')) {
                        if (str_contains($handle, 'first')) {
                            $value = $faker->firstName;
                        } elseif (str_contains($handle, 'last')) {
                            $value = $faker->lastName;
                        } else {
                            $value = $faker->name;
                        }
                    } else {
                        $value = $faker->sentence;
                    }
                } else {
                    $value = $faker->text;
                }

                $values[$field->getHandle()] = $value;
            }

            $dateCreated = new \DateTime();
            if ($this->rangeStart || $this->rangeEnd) {
                $dateCreated = $faker->dateTimeBetween(
                    $this->rangeStart ?? '-1 year',
                    $this->rangeEnd ?? 'now'
                );
            }

            $submission = Submission::create($form);
            $submission->userId = $this->authorId;
            $submission->isSpam = $this->spam;
            $submission->statusId = $faker->randomElement($statuses);
            $submission->dateCreated = $dateCreated;
            $submission->dateUpdated = $dateCreated;
            $submission->setFormFieldValues($values);

            if (!$this->dryRun) {
                \Craft::$app->elements->saveElement($submission, false, false, true);
            }

            if (!$verbose) {
                Console::updateProgress($i + 1, $this->count);
            }

            if ($verbose) {
                $signatureFields = $form->getLayout()->getFields(SignatureField::class);
                foreach ($signatureFields as $field) {
                    $values[$field->getHandle()] = '**** redacted ****';
                }

                if (!$this->dryRun) {
                    $this->stdout("Submission #{$submission->id} created\n");
                } else {
                    $number = $i + 1;
                    $this->stdout("Generated Submission #{$number} preview\n");
                }

                $this->stdout("Date Created: {$submission->dateCreated->format('Y-m-d H:i:s')}\n");
                $this->stdout("Status: {$submission->getStatus()}\n");

                $this->stdout(json_encode($values, \JSON_PRETTY_PRINT)."\n\n");
            }
        }

        if (!$verbose) {
            Console::endProgress(true);
        }

        $this->stdout("\n\n--- done ---\n", Console::FG_YELLOW);

        return ExitCode::OK;
    }

    public function actionFixTitles(): int
    {
        $this->stdout('Fixing submission titles...'.\PHP_EOL, Console::FG_YELLOW);

        $migration = new TitleFixMigration();
        $migration->run();

        $this->stdout('Submission titles fixed.'.\PHP_EOL, Console::FG_YELLOW);

        return ExitCode::OK;
    }

    /**
     * Removes old submissions based on the specified age parameter.
     */
    public function actionResave(): int
    {
        $elementType = Submission::class;
        $criteria = $this->collectCriteria();

        if ($this->queue) {
            Queue::push(
                new ResaveElements([
                    'elementType' => $elementType,
                    'criteria' => $criteria,
                    'updateSearchIndex' => $this->updateSearchIndex,
                ]),
                Freeform::getInstance()->settings->getQueuePriority()
            );

            $this->stdout($elementType::pluralDisplayName().' queued to be resaved.'.\PHP_EOL);

            return ExitCode::OK;
        }

        $query = $elementType::find();
        \Craft::configure($query, $criteria);

        $count = (int) $query->count();

        $pluralLowerDisplayName = $elementType::pluralLowerDisplayName();
        $lowerDisplayName = $elementType::lowerDisplayName();

        if (0 === $count) {
            $this->stdout('No '.$pluralLowerDisplayName.' exist for that criteria.'.\PHP_EOL, Console::FG_YELLOW);

            return ExitCode::OK;
        }

        if ($query->offset) {
            $count = max($count - (int) $query->offset, 0);
        }

        if ($query->limit) {
            $count = min($count, (int) $query->limit);
        }

        $label = 'Resaving';
        $elementsText = 1 === $count ? $lowerDisplayName : $pluralLowerDisplayName;
        $this->stdout("{$label} {$count} {$elementsText} ...".\PHP_EOL, Console::FG_YELLOW);

        \Craft::$app
            ->getElements()
            ->resaveElements(
                $query,
                true,
                true,
                $this->updateSearchIndex
            )
        ;

        $label = 'resaving';
        $this->stdout("Done {$label} {$elementsText}.".\PHP_EOL.\PHP_EOL, Console::FG_YELLOW);

        return ExitCode::OK;
    }

    private function collectCriteria(): array
    {
        $criteria = [];

        if ($this->elementId) {
            $criteria['id'] = \is_int($this->elementId) ? $this->elementId : explode(',', $this->elementId);
        }

        if ($this->uid) {
            $criteria['uid'] = explode(',', $this->uid);
        }

        if ('any' === $this->status || null === $this->status) {
            $criteria['status'] = null;
        } elseif ($this->status) {
            $criteria['status'] = explode(',', $this->status);
        }

        if (isset($this->offset)) {
            $criteria['offset'] = $this->offset;
        }

        if (isset($this->limit)) {
            $criteria['limit'] = $this->limit;
        }

        return $criteria;
    }
}
