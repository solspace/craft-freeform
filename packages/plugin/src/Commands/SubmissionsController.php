<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use craft\elements\User;
use craft\queue\jobs\ResaveElements;
use craft\queue\Queue;
use craft\services\Elements;
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
    /**
     * @var bool whether to update the search indexes for the resaved elements
     */
    public bool $updateSearchIndex = false;

    /**
     * @var null|int|string the ID(s) of the elements to resave
     */
    public null|int|string $elementId = null;

    /**
     * @var null|string the UUID(s) of the elements to resave
     */
    public ?string $uid = null;

    /**
     * @var string The status(es) of elements to resave. Can be set to multiple comma-separated statuses.
     */
    public int|string $status = 'any';

    /**
     * @var bool whether the elements should be resaved via a queue job
     *
     * @since 3.7.0
     */
    public bool $queue = false;

    /**
     * @var null|int the number of elements to skip
     */
    public ?int $offset = null;

    /**
     * @var null|int the number of elements to resave
     */
    public ?int $limit = null;

    public ?string $locale = Factory::DEFAULT_LOCALE;

    /**
     * @var null|int The amount of submissions to generate
     */
    public ?int $count = 1;

    /**
     * @var int|string The form handle or ID to generate submissions for
     */
    public null|int|string $form = null;

    public ?int $authorId = null;

    /**
     * @var bool Mark generated submissions as spam
     */
    public bool $spam = false;

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

        $name = 1 === $this->count ? Submission::lowerDisplayName() : Submission::pluralLowerDisplayName();
        $this->stdout("Generating {$this->count} {$name} for form \"{$this->form}\"...\n\n", Console::FG_YELLOW);

        $form = $freeform->forms->getFormByHandleOrId($this->form);
        if (!$form) {
            throw new \Exception('No Form found');
        }

        if ($this->authorId) {
            $user = \Craft::$app->users->getUserById($this->authorId);
        } else {
            $user = User::findOne();
        }

        if (!$user) {
            throw new \Exception('No Author specified');
        }

        if (!is_numeric($this->status)) {
            if (null === $this->status || 'any' === $this->status) {
                $status = $form->getSettings()->getGeneral()->defaultStatus;
            } else {
                $status = $freeform->statuses->getStatusByHandle($this->status)?->id;
            }
        }

        if (!$status) {
            throw new \Exception('No status found');
        }

        Console::startProgress(0, $this->count, '', 0.44);

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
                    $isDate = \in_array($field->getDateTimeType(), [DatetimeField::DATETIME_TYPE_DATE, DatetimeField::DATETIME_TYPE_BOTH], true);
                    $isTime = \in_array($field->getDateTimeType(), [DatetimeField::DATETIME_TYPE_TIME, DatetimeField::DATETIME_TYPE_BOTH], true);

                    $chunks = [];
                    if ($isDate) {
                        $chunks[] = $faker->date($field->getDateFormat());
                    }

                    if ($isTime) {
                        $chunks[] = $faker->time($field->getTimeFormat());
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
                    $value = $faker->name;
                } else {
                    $value = $faker->sentence;
                }

                $values[$field->getHandle()] = $value;
            }

            $submission = Submission::create($form);
            $submission->userId = $user->id;
            $submission->isSpam = $this->spam;
            $submission->statusId = $form->getSettings()->getGeneral()->defaultStatus;
            $submission->setFormFieldValues($values);

            \Craft::$app->elements->saveElement($submission, false, false, true);

            Console::updateProgress($i + 1, $this->count);
        }

        Console::endProgress(true);

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
            \Craft::$app->queue->push(
                new ResaveElements([
                    'elementType' => $elementType,
                    'criteria' => $criteria,
                    'updateSearchIndex' => $this->updateSearchIndex,
                ])
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

        if ('any' === $this->status) {
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
