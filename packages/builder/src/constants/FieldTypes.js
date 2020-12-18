export const INVISIBLE = 'invisible';
export const HIDDEN = 'hidden';
export const TEXT = 'text';
export const TEXTAREA = 'textarea';
export const SELECT = 'select';
export const MULTIPLE_SELECT = 'multiple_select';
export const RADIO = 'radio';
export const RADIO_GROUP = 'radio_group';
export const CHECKBOX = 'checkbox';
export const CHECKBOX_GROUP = 'checkbox_group';
export const EMAIL = 'email';
export const DYNAMIC_RECIPIENTS = 'dynamic_recipients';
export const FILE = 'file';

export const DATETIME = 'datetime';
export const NUMBER = 'number';
export const PHONE = 'phone';
export const WEBSITE = 'website';
export const RATING = 'rating';
export const TABLE = 'table';
export const SIGNATURE = 'signature';
export const REGEX = 'regex';
export const CONFIRMATION = 'confirmation';
export const OPINION_SCALE = 'opinion_scale';

export const HTML = 'html';
export const RICH_TEXT = 'rich_text';
export const MAILING_LIST = 'mailing_list';
export const SUBMIT = 'submit';
export const RECAPTCHA = 'recaptcha';
export const PASSWORD = 'password';

export const CREDIT_CARD_DETAILS = 'cc_details';
export const CREDIT_CARD_NUMBER = 'cc_number';
export const CREDIT_CARD_CVC = 'cc_cvc';
export const CREDIT_CARD_EXPIRATION_DATE = 'cc_exp_date';

export const FORM = 'form';
export const VALIDATION = 'validation';
export const PAGE = 'page';
export const INTEGRATION = 'integration';
export const CONNECTIONS = 'connections';
export const RULES = 'rules';
export const ADMIN_NOTIFICATIONS = 'admin_notifications';
export const PAYMENT = 'payment';

export const LITE_FIELDS = [
  HIDDEN,
  TEXT,
  TEXTAREA,
  SELECT,
  MULTIPLE_SELECT,
  RADIO_GROUP,
  CHECKBOX,
  CHECKBOX_GROUP,
  EMAIL,
  DYNAMIC_RECIPIENTS,
  FILE,
  NUMBER,
];

export const INTEGRATION_SUPPORTED_TYPES = [
  HIDDEN,
  INVISIBLE,
  TEXT,
  TEXTAREA,
  SELECT,
  MULTIPLE_SELECT,
  RADIO_GROUP,
  CHECKBOX,
  CHECKBOX_GROUP,
  EMAIL,
  DYNAMIC_RECIPIENTS,
  FILE,
  DATETIME,
  NUMBER,
  PHONE,
  WEBSITE,
  RATING,
  REGEX,
  CONFIRMATION,
  PASSWORD,
  OPINION_SCALE,
];

export const CONFIRMATION_SUPPORTED_TYPES = [TEXT, EMAIL, DATETIME, NUMBER, PHONE, WEBSITE, REGEX, PASSWORD];

export const RULE_SUPPORTED_TYPES = [
  TEXT,
  TEXTAREA,
  SELECT,
  MULTIPLE_SELECT,
  RADIO,
  RADIO_GROUP,
  CHECKBOX,
  CHECKBOX_GROUP,
  EMAIL,
  DYNAMIC_RECIPIENTS,
  FILE,
  DATETIME,
  NUMBER,
  PHONE,
  WEBSITE,
  RATING,
  REGEX,
  CONFIRMATION,
  HTML,
  RICH_TEXT,
  MAILING_LIST,
  SUBMIT,
  PASSWORD,
  OPINION_SCALE,
  TABLE,
  SIGNATURE,
];

export const RULE_CRITERIA_SUPPORTED_TYPES = [
  TEXT,
  TEXTAREA,
  SELECT,
  MULTIPLE_SELECT,
  RADIO,
  RADIO_GROUP,
  CHECKBOX,
  CHECKBOX_GROUP,
  EMAIL,
  DYNAMIC_RECIPIENTS,
  DATETIME,
  NUMBER,
  PHONE,
  WEBSITE,
  RATING,
  REGEX,
  CONFIRMATION,
  MAILING_LIST,
  PASSWORD,
  OPINION_SCALE,
  HIDDEN,
];

export const DYNAMIC_FIELD_TYPES = [HTML, RICH_TEXT, SUBMIT, CONFIRMATION, PASSWORD];

export const DATE_TIME_TYPE_BOTH = 'both';
export const DATE_TIME_TYPE_DATE = 'date';
export const DATE_TIME_TYPE_TIME = 'time';
