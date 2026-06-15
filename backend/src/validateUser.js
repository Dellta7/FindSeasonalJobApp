export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function parseLoginData(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid request body');
  }

  const { email, password } = body;

  if (typeof email !== 'string' || !email.trim()) {
    throw new HttpError(400, 'Email is required');
  }

  if (typeof password !== 'string' || !password) {
    throw new HttpError(400, 'Password is required');
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

export function parseRegisterData(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid request body');
  }

  const { email, password, fullName } = body;

  if (typeof email !== 'string' || !email.trim()) {
    throw new HttpError(400, 'Email is required');
  }

  if (typeof password !== 'string' || password.length < 1) {
    throw new HttpError(400, 'Password is required');
  }

  if (typeof fullName !== 'string' || !fullName.trim()) {
    throw new HttpError(400, 'Full name is required');
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email format');
  }

  return {
    email: email.trim().toLowerCase(),
    password,
    fullName: fullName.trim(),
  };
}

export function parseUserUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid request body');
  }

  const { email, fullName, phone, address, avatarUrl } = body;

  if (typeof email !== 'string' || !email.trim()) {
    throw new HttpError(400, 'Email is required');
  }

  if (typeof fullName !== 'string' || !fullName.trim()) {
    throw new HttpError(400, 'Full name is required');
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email format');
  }

  return {
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    phone: (typeof phone === 'string' && phone.trim().length) ? phone.trim() : null,
    address: (typeof address === 'string' && address.trim().length) ? address.trim() : null,
    avatarUrl: (typeof avatarUrl === 'string' && avatarUrl.trim().length) ? avatarUrl.trim() : null,
  };
}

function isValidEmail(email) {
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
