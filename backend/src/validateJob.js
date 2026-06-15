export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value.constructor === Object || Object.getPrototypeOf(value) === null)
  );
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `Field '${fieldName}' is required and must be a non-empty string.`);
  }
  return value.trim();
}

function optionalStringOrNull(value, fieldName) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `Field '${fieldName}' must be a string (or null).`);
  }
  return value.trim();
}

export function parseJobCreate(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const title = requireNonEmptyString(body.title, 'title');
  const companyName = requireNonEmptyString(body.companyName, 'companyName');
  const location = requireNonEmptyString(body.location, 'location');
  const category = requireNonEmptyString(body.category, 'category');

  const salaryText = optionalStringOrNull(body.salaryText, 'salaryText');
  const workTimeText = optionalStringOrNull(body.workTimeText, 'workTimeText');
  const description = optionalStringOrNull(body.description, 'description');
  const contactPhone = optionalStringOrNull(body.contactPhone, 'contactPhone');
  const status = optionalStringOrNull(body.status, 'status');

  return {
    title,
    companyName,
    location,
    category,
    salaryText: salaryText ?? null,
    workTimeText: workTimeText ?? null,
    description: description ?? null,
    contactPhone: contactPhone ?? null,
    status: status ?? 'open',
  };
}

export function parseJobPatch(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const patch = {};
  const fields = [
    'title',
    'companyName',
    'location',
    'category',
    'salaryText',
    'workTimeText',
    'description',
    'contactPhone',
    'status',
  ];

  for (const field of fields) {
    const value = optionalStringOrNull(body[field], field);
    if (value !== undefined) {
      patch[field] = value;
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No fields to update.');
  }

  // Enforce required fields if provided
  for (const requiredField of ['title', 'companyName', 'location', 'category']) {
    if (patch[requiredField] !== undefined) {
      patch[requiredField] = requireNonEmptyString(patch[requiredField], requiredField);
    }
  }

  return patch;
}

export function parseIdParam(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Invalid id.');
  }
  return id;
}
