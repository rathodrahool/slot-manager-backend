export const MESSAGE = {
  SUCCESS: 'Your request has been successfully completed.',
  SIGN_UP: 'You have signed up successfully! Welcome aboard!',
  LOGIN: 'Welcome back! You have logged in successfully.',
  LOGOUT: 'You have been logged out successfully. See you soon!',
  OTP_EXPIRED: 'The OTP has expired. Please request a new one.',
  INVALID_OTP: 'The OTP you entered is incorrect. Please try again.',
  PASSWORD_RESET: 'Your password has been reset successfully!',
  PASSWORD_RECOVERY_OTP_SENT:
    'An OTP has been sent to your registered email address.',
  RECORD_CREATED: (record: string) =>
    `${record} has been created successfully.`,
  RECORD_UPDATED: (record: string) =>
    `${record} has been updated successfully.`,
  RECORD_DELETED: (record: string) =>
    `${record} has been deleted successfully.`,
  RECORD_FOUND: (record: string) => `${record} found successfully.`,
  RECORD_NOT_FOUND: (record: string) => `Sorry, no ${record} was found.`,
  RECORD_UPLOAD: (record: string) =>
    `${record} has been uploaded successfully.`,
  METHOD_NOT_ALLOWED: 'Sorry, this method is not allowed.',
  ALREADY_EXISTS: (record: string) =>
    `A ${record} with the same details already exists.`,
  WRONG_CREDENTIALS: 'Incorrect username or password. Please try again.',
  UNAUTHENTICATED: 'Please log in to continue.',
  ACCESS_DENIED: (permission: string, section: string) =>
    `Access denied: You don’t have the required "${permission}" permission for the "${section}" section.`,
};

export const ERROR = {
  ALREADY_EXISTS: (record: string) =>
    `${record} already exists. Please try a different one.`,
  TOO_MANY_REQUESTS:
    'You’ve reached the request limit. Please try again later.',
};

export const AVAILABILITY_MESSAGES = {
  BUSINESS_HOURS: 'Availability can only be set between 9 AM and 6 PM',
  INVALID_TIME_SLOT: 'Time slots must be in 30-minute intervals',
  MINIMUM_DURATION: 'Time slot must be at least 30 minutes',
  FUTURE_DATE_LIMIT: 'Cannot set availability beyond 7 days from now',
  PAST_DATE: 'Cannot set availability for past dates',
  INVALID_TIME_RANGE: 'End time must be after start time',
  OVERLAPPING_SLOT: 'This time slot overlaps with existing availability',
  INVALID_DATE_FORMAT: 'Invalid date format',
  PAST_SLOTS: 'Cannot get slots for past dates',
  FUTURE_SLOTS_LIMIT: 'Cannot get slots beyond 7 days from now',
};

export const EMAIL = {
  VERIFICATION_OTP_SUBJECT: 'Your Verification OTP Code',
  PASSWORD_RESET_SUBJECT: 'Reset Your Password Request',
  SENT: 'The email has been sent successfully.',
  ACCOUNT_VERIFICATION_SUBJECT: 'Verify Your Account to Get Started',
};

export const BOOKING_MESSAGES = {
  INVALID_DATE_FORMAT: 'Invalid date or time format',
  SLOT_NOT_AVAILABLE: 'Slot not available for booking',
  ADJACENT_BOOKING: 'Cannot book slots adjacent to existing bookings'
};