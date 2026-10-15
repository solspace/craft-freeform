# Scoped Duplicate Checking (Freeform 5.17 Pro)

Use one form on multiple product, article, or event pages while limiting each visitor to one submission for each item.

## Configuration

1. Add a Hidden field called `productId` (or another field representing the item).
2. Under **Settings → Behavior → Limits**, choose the desired **Duplicate Check** restriction.
3. Select `productId` under **Scope by Field**.
4. Keep **Store Submitted Data for this Form** enabled. If storage requires opt-in, the visitor must opt in to submit a scoped form.
5. Populate the field with the item's identifier when rendering or submitting the form.

For example:

```twig
{% set form = freeform.form('productRating', {
    values: { productId: product.id },
}) %}

{% if form.duplicate %}
    <p>You have already rated this product.</p>
{% else %}
    {{ form.render() }}
{% endif %}
```

A visitor may submit a rating for Product A and Product B. A second rating for Product A is rejected on the server. Hiding the form is optional; validation also applies to AJAX, REST, and GraphQL submissions.

## Behavior

- Leaving **Scope by Field** blank preserves the existing form-wide duplicate check and cookie behavior.
- Scope is available for the four once-only restrictions: logged-in user; email; user or cookie; user, IP, or cookie. Unlimited modes ignore it.
- Supported fields hold a single stored value: Hidden, Invisible, Text, Textarea, Number, Range Slider, Email, Phone, Website, Regex, Dropdown, Radios, Rating, and Opinion Scale. Table columns, nested fields, and fields with multiple values are excluded.
- The scope must have a nonempty value when the form is submitted. `0` is a valid value. A scope on a later page is not required until that page is posted, but it is always required at final submission.
- Plain text values are compared exactly, including case and whitespace. Number fields use their normalized numeric value. Encrypted scope and email fields are supported.
- Email restrictions check all Email fields and require at least one nonempty email address. IP restrictions only apply when IP collection is enabled.
- Spam and deleted submissions do not count toward the restriction. Editing an existing submission retains the existing edit behavior and browser identity.
- Existing submissions can be matched by user, email, or IP. Guest browser tracking starts with scoped submissions; previous form-wide cookies cannot identify which products a guest rated.

## Cookies and headless clients

Cookie-based scope checking uses one signed, HTTP-only visitor cookie per form, with a one-year lifetime. Only its SHA-256 hash is stored with submissions. It does not create one cookie for every item.

Headless clients must retain cookies between loading the form and submitting it. For cross-origin clients, configure permitted origins, credentials, and cookie settings appropriately. Two requests can only be recognized as the same browser when they present the same visitor cookie; loading the form establishes that cookie before the first vote.

Clearing cookies or using another browser allows another guest vote. Requiring login provides enforcement per account. Captcha and other spam protection can supplement either approach.

## Validating the item identifier

This feature checks uniqueness of the field value; it does not verify that the value identifies a real product or that the visitor may rate it. Validate and normalize item identifiers on the server with the site's own rules. A Hidden field is editable by the visitor and should not be treated as trusted context. Use a Number field or server-side normalization when numeric identifiers should treat values such as `1` and `01` as the same item.

Scoped checks use a mutex and recheck stored submissions immediately before saving. The mutex remains held during saving so simultaneous requests presenting the same identity cannot both insert a vote for the same item. Craft's mutex must be shared across application nodes for this protection on a multi-node installation.

## Upgrade

Run Freeform's pending migrations (for example, `php craft up`) before using the branch. Freeform 5.17 adds a nullable `duplicateCheckIdentity` column and a form/identity index to submissions. Existing submissions remain unchanged.
