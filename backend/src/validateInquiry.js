import { HttpError, parseIdParam } from './validateJob.js';

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value.constructor === Object || Object.getPrototypeOf(value) === null)
  );
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(
      400,
      `Field '${fieldName}' is required and must be a non-empty string.`
    );
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

function optionalNumberOrNull(value, fieldName) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'number') {
    throw new HttpError(400, `Field '${fieldName}' must be a number (or null).`);
  }
  return value;
}

export function parseInquiryCreate(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const fullName = requireNonEmptyString(body.fullName, 'fullName');
  const phone = requireNonEmptyString(body.phone, 'phone');
  const note = optionalStringOrNull(body.note, 'note');
  const status = optionalStringOrNull(body.status, 'status');
  const userId = optionalNumberOrNull(body.userId, 'userId');

  return {
    fullName,
    phone,
    note: note ?? null,
    status: status ?? 'pending',
    userId: userId ?? null,
  };
}

export function parseInquiryPatch(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const patch = {};

  // Explicitly check for each field to avoid any loop issues
  if (body.fullName !== undefined) patch.fullName = body.fullName;
  if (body.phone !== undefined) patch.phone = body.phone;
  if (body.note !== undefined) patch.note = body.note;
  if (body.status !== undefined) patch.status = body.status;
  if (body.userId !== undefined) patch.userId = body.userId;

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No fields to update.');
  }

  // Validate the fields that were provided
  if (patch.fullName !== undefined) {
    patch.fullName = requireNonEmptyString(patch.fullName, 'fullName');
  }
  if (patch.phone !== undefined) {
    patch.phone = requireNonEmptyString(patch.phone, 'phone');
  }
  if (patch.note !== undefined) {
    patch.note = optionalStringOrNull(patch.note, 'note');
  }
  if (patch.status !== undefined) {
    patch.status = optionalStringOrNull(patch.status, 'status');
  }
  if (patch.userId !== undefined) {
    patch.userId = optionalNumberOrNull(patch.userId, 'userId');
  }

  return patch;
}

export function parseJobIdFromBody(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }
  return parseIdParam(body.jobId);
}
