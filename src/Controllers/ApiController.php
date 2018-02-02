<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Carbon\Carbon;
use craft\db\Query;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\ChartHelper;
use craft\helpers\Db;
use craft\helpers\FileHelper;
use craft\helpers\StringHelper;
use GuzzleHttp\Exception\ClientException;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Integrations\TokenRefreshInterface;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\NotificationRecord;
use yii\base\Exception;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class ApiController extends BaseController
{
    /** @var bool */
    protected $allowAnonymous = true;

    /**
     * @return null|Response
     * @throws FreeformException
     */
    public function actionForm()
    {
        $this->requirePostRequest();

        $hash   = \Craft::$app->request->post(FormValueContext::FORM_HASH_KEY);
        $formId = FormValueContext::getFormIdFromHash($hash);

        $formModel = $this->getFormsService()->getFormById($formId);

        if (!$formModel) {
            throw new FreeformException(
                \Craft::t('freeform', 'Form with ID {id} not found', ['id' => $formId])
            );
        }

        $form          = $formModel->getForm();
        $isAjaxRequest = \Craft::$app->request->getIsAjax();
        if ($form->isValid()) {
            $submission = $form->submit();

            if ($form->isFormSaved()) {
                $postedReturnUrl = \Craft::$app->request->post(Form::RETURN_URI_KEY);

                $returnUrl = $postedReturnUrl ?: $form->getReturnUrl();
                $returnUrl = \Craft::$app->view->renderString(
                    $returnUrl,
                    [
                        'form'       => $form,
                        'submission' => $submission,
                    ]
                );

                if ($isAjaxRequest) {
                    return $this->asJson(
                        [
                            'success'      => true,
                            'finished'     => true,
                            'returnUrl'    => $returnUrl,
                            'submissionId' => $submission ? $submission->id : null,
                        ]
                    );
                }

                return $this->redirect($returnUrl);
            }

            if ($isAjaxRequest) {
                return $this->asJson(
                    [
                        'success'  => true,
                        'finished' => false,
                    ]
                );
            }
        }

        if ($isAjaxRequest) {
            $fieldErrors = [];

            foreach ($form->getLayout()->getFields() as $field) {
                if ($field->hasErrors()) {
                    $fieldErrors[$field->getHandle()] = $field->getErrors();
                }
            }

            return $this->asJson(
                [
                    'success'  => false,
                    'finished' => false,
                    'errors'   => $fieldErrors,
                ]
            );
        }
    }

    /**
     * GET fields
     *
     * @return Response
     * @throws ForbiddenHttpException
     */
    public function actionFields(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getFieldsService()->getAllFields(false));
    }

    /**
     * GET notifications
     *
     * @return Response
     * @throws ForbiddenHttpException
     */
    public function actionNotifications(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getNotificationsService()->getAllNotifications(false));
    }

    /**
     * GET mailing lists
     *
     * @return Response
     * @throws ForbiddenHttpException
     */
    public function actionMailingLists(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $mailingLists = $this->getMailingListsService()->getAllIntegrationObjects();
        foreach ($mailingLists as $integration) {
            $integration->setForceUpdate(true);
        }

        return $this->asJson($mailingLists);
    }

    /**
     * GET integrations
     *
     * @return Response
     * @throws ForbiddenHttpException
     */
    public function actionCrmIntegrations(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $crmIntegrations = $this->getCrmService()->getAllIntegrationObjects();
        foreach ($crmIntegrations as $integration) {
            $integration->setForceUpdate(true);

            try {
                $integration->getFields();
            } catch (ClientException $e) {
                if ($integration instanceof TokenRefreshInterface) {
                    try {
                        if ($integration->refreshToken() && $integration->isAccessTokenUpdated()) {
                            $this->getCrmService()->updateAccessToken($integration);

                            $integration->getFields();
                        }
                    } catch (\Exception $e) {
                        return $this->asErrorJson($e->getMessage());
                    }
                } else {
                    return $this->asErrorJson($e->getMessage());
                }
            } catch (\Exception $e) {
                return $this->asErrorJson($e->getMessage());
            }
        }

        return $this->asJson($crmIntegrations);
    }

    /**
     * GET fields
     *
     * @return Response
     * @throws ForbiddenHttpException
     */
    public function actionFormTemplates(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getSettingsService()->getCustomFormTemplates());
    }

    /**
     * POST a field, and save it to the database
     *
     * @return Response
     * @throws \Exception
     * @throws BadRequestHttpException
     */
    public function actionQuickCreateField(): Response
    {
        $this->requirePostRequest();

        $request = \Craft::$app->request;
        $errors  = [];

        $label  = $request->post('label');
        $handle = $request->post('handle');
        $type   = $request->post('type');

        if (!$label) {
            $errors[] = Freeform::t('Label is required');
        }

        if (!$handle) {
            $errors[] = Freeform::t('Handle is required');
        }

        $allowedFieldTypes = array_keys(AbstractField::getFieldTypes());
        if (!$type || !\in_array($type, $allowedFieldTypes, true)) {
            $errors[] = Freeform::t(
                'Type {type} is not allowed. Allowed types are ({allowedTypes})',
                [
                    'type'         => $type,
                    'allowedTypes' => implode(', ', $allowedFieldTypes),
                ]
            );
        }

        $field         = FieldModel::create();
        $field->label  = $label;
        $field->handle = $handle;
        $field->type   = $type;

        if (empty($errors) && $this->getFieldsService()->save($field)) {
            return $this->asJson(['success' => true]);
        }

        $fieldErrors = $field->getErrors();
        $errors      = [];
        array_walk_recursive(
            $fieldErrors,
            function ($array) use (&$errors) {
                $errors[] = $array;
            }
        );

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * POST a field, and save it to the database
     *
     * @return Response
     * @throws \yii\base\InvalidParamException
     * @throws \yii\base\ErrorException
     * @throws BadRequestHttpException
     */
    public function actionQuickCreateNotification(): Response
    {
        $this->requirePostRequest();

        $isDbStorage = $this->getSettingsService()->isDbEmailTemplateStorage();

        $request = \Craft::$app->request;
        $errors  = [];

        $name   = $request->post('name');
        $handle = $request->post('handle');

        if (!$name) {
            $errors[] = Freeform::t('Name is required');
        }

        if (!$handle && $isDbStorage) {
            $errors[] = Freeform::t('Handle is required');
        }

        if ($isDbStorage) {

            $notification         = NotificationRecord::create();
            $notification->name   = $name;
            $notification->handle = $handle;

            if (empty($errors) && $this->getNotificationsService()->save($notification)) {
                return $this->asJson(['success' => true, 'id' => $notification->id]);
            }

            $errors = $notification->getErrors();
            $errors = array_values($errors);

            return $this->asJson(['success' => false, 'errors' => $errors]);
        }

        $settings = $this->getSettingsService()->getSettingsModel();

        $templateDirectory = $settings->getAbsoluteEmailTemplateDirectory();
        $templateName      = StringHelper::toSnakeCase($name);
        $extension         = '.html';

        $templatePath = $templateDirectory . '/' . $templateName . $extension;
        if (file_exists($templatePath)) {
            $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName . $extension]);
        } else {
            try {
                FileHelper::writeToFile($templatePath, $settings->getEmailTemplateContent());
            } catch (FreeformException $exception) {
                $errors[] = $exception->getMessage();
            }
        }

        if (empty($errors)) {
            return $this->asJson(['success' => true, 'id' => $templateName . $extension]);
        }

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * Returns the data needed to display a Submissions chart.
     *
     * @return Response
     * @throws Exception
     * @throws ForbiddenHttpException
     */
    public function actionGetSubmissionData(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);

        // Required for Dashboard widget, unnecessary for Entries Index view
        $source = \Craft::$app->request->post('source');
        $formId = null;
        if ($source && strpos($source, 'form:') === 0) {
            $formId = (int) substr($source, 5);
        }

        $startDateParam = \Craft::$app->request->post('startDate');
        $endDateParam   = \Craft::$app->request->post('endDate');

        $startDate = new Carbon($startDateParam, 'UTC');
        $endDate   = new Carbon($endDateParam, 'UTC');
        $endDate->setTime(23, 59,59);

        $intervalUnit = ChartHelper::getRunChartIntervalUnit($startDate, $endDate);

        // Prep the query
        $query = (new Query())
            ->select(['COUNT(*) as [[value]]'])
            ->from([Submission::TABLE . ' ' . Submission::TABLE_STD]);

        if ($formId) {
            $query->andWhere(['formId' => $formId]);
        }

        // Get the chart data table
        $dataTable = $this->getRunChartDataFromQuery(
            $query,
            $startDate,
            $endDate,
            Submission::TABLE_STD . '.dateCreated',
            [
                'intervalUnit' => $intervalUnit,
                'valueLabel'   => Freeform::t('Submissions'),
                'valueType'    => 'number',
            ]
        );

        // Get the total submissions
        $total = 0;

        foreach ($dataTable['rows'] as $row) {
            $total += $row[1];
        }

        $formats                 = ChartHelper::formats();
        $formats['numberFormat'] = ',.0f';

        return $this->asJson(
            [
                'dataTable' => $dataTable,
                'total'     => $total,
                'totalHtml' => $total,

                'formats'     => $formats,
                'orientation' => \Craft::$app->locale->getOrientation(),
                'scale'       => $intervalUnit,
            ]
        );
    }

    /**
     * Mark the tutorial as finished
     *
     * @return Response
     */
    public function actionFinishTutorial(): Response
    {
        return $this->asJson(['success' => $this->getSettingsService()->finishTutorial()]);
    }

    /**
     * @param Query  $query
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @param string $dateColumn
     * @param array  $options
     *
     * @return array
     * @throws Exception
     */
    private function getRunChartDataFromQuery(
        Query $query,
        Carbon $startDate,
        Carbon $endDate,
        string $dateColumn,
        array $options = []
    ): array {
        // Setup
        $options = array_merge(
            [
                'intervalUnit'  => null,
                'categoryLabel' => Freeform::t('Date'),
                'valueLabel'    => Freeform::t('Value'),
                'valueType'     => 'number',
            ],
            $options
        );

        $isMysql = \Craft::$app->getDb()->getIsMysql();

        if ($options['intervalUnit'] && \in_array($options['intervalUnit'], ['year', 'month', 'day', 'hour'], true)) {
            $intervalUnit = $options['intervalUnit'];
        } else {
            $intervalUnit = ChartHelper::getRunChartIntervalUnit($startDate, $endDate);
        }

        if ($isMysql) {
            $dateColumnSql = "{$dateColumn}";
            $yearSql       = "YEAR({$dateColumnSql})";
            $monthSql      = "MONTH({$dateColumnSql})";
            $daySql        = "DAY({$dateColumnSql})";
            $hourSql       = "HOUR({$dateColumnSql})";
        } else {
            $dateColumnSql = "[[{$dateColumn}]]";
            $yearSql       = "EXTRACT(YEAR FROM {$dateColumnSql})";
            $monthSql      = "EXTRACT(MONTH FROM {$dateColumnSql})";
            $daySql        = "EXTRACT(DAY FROM {$dateColumnSql})";
            $hourSql       = "EXTRACT(HOUR FROM {$dateColumnSql})";
        }

        // Prepare the query
        switch ($intervalUnit) {
            case 'year':
                if ($isMysql) {
                    $sqlDateFormat = '%Y-01-01';
                } else {
                    $sqlDateFormat = 'YYYY-01-01';
                }
                $phpDateFormat = 'Y-01-01';
                $sqlGroup      = [$yearSql];
                break;
            case 'month':
                if ($isMysql) {
                    $sqlDateFormat = '%Y-%m-01';
                } else {
                    $sqlDateFormat = 'YYYY-MM-01';
                }
                $phpDateFormat = 'Y-m-01';
                $sqlGroup      = [$yearSql, $monthSql];
                break;
            case 'day':
                if ($isMysql) {
                    $sqlDateFormat = '%Y-%m-%d';
                } else {
                    $sqlDateFormat = 'YYYY-MM-DD';
                }
                $phpDateFormat = 'Y-m-d';
                $sqlGroup      = [$yearSql, $monthSql, $daySql];
                break;
            case 'hour':
                if ($isMysql) {
                    $sqlDateFormat = '%Y-%m-%d %H:00:00';
                } else {
                    $sqlDateFormat = 'YYYY-MM-DD HH24:00:00';
                }
                $phpDateFormat = 'Y-m-d H:00:00';
                $sqlGroup      = [$yearSql, $monthSql, $daySql, $hourSql];
                break;
            default:
                throw new Exception('Invalid interval unit: ' . $intervalUnit);
        }

        if ($isMysql) {
            $select = "DATE_FORMAT({$dateColumnSql}, '{$sqlDateFormat}') AS [[date]]";
        } else {
            $select = "to_char({$dateColumnSql}, '{$sqlDateFormat}') AS [[date]]";
        }

        $sqlGroup[] = '[[date]]';

        // Prepare the query
        $condition = ['and', "{$dateColumnSql} >= :startDate", "{$dateColumnSql} < :endDate"];
        $params    = [
            ':startDate' => $startDate->toDateTimeString(),
            ':endDate'   => $endDate->toDateTimeString(),
        ];
        $orderBy   = ['date' => SORT_ASC];

        // If this is an element query, modify the prepared query directly
        if ($query instanceof ElementQueryInterface) {
            $query = $query->prepare(\Craft::$app->getDb()->getQueryBuilder());
            /** @var Query $subQuery */
            $subQuery = $query->from['subquery'];
            $subQuery
                ->addSelect($query->select)
                ->addSelect([$select])
                ->andWhere($condition, $params)
                ->groupBy($sqlGroup)
                ->orderBy($orderBy);
            $query
                ->select(['subquery.value', 'subquery.date'])
                ->orderBy($orderBy);
        } else {
            $query
                ->addSelect([$select])
                ->andWhere($condition, $params)
                ->groupBy($sqlGroup)
                ->orderBy($orderBy);
        }

        // Execute the query
        $results = $query->all();

        // Assemble the data
        $rows = [];

        $cursorDate   = $startDate;
        $endTimestamp = $endDate->getTimestamp();

        while ($cursorDate->getTimestamp() < $endTimestamp) {
            // Do we have a record for this date?
            $formattedCursorDate = $cursorDate->format($phpDateFormat);

            if (isset($results[0]) && $results[0]['date'] === $formattedCursorDate) {
                $value = (float) $results[0]['value'];
                array_shift($results);
            } else {
                $value = 0;
            }

            $rows[] = [$formattedCursorDate, $value];
            $cursorDate->modify('+1 ' . $intervalUnit);
        }

        return [
            'columns' => [
                [
                    'type'  => $intervalUnit === 'hour' ? 'datetime' : 'date',
                    'label' => $options['categoryLabel'],
                ],
                [
                    'type'  => $options['valueType'],
                    'label' => $options['valueLabel'],
                ],
            ],
            'rows'    => $rows,
        ];
    }
}
