export enum DefaultStatus {
  ACTIVE = 'active',
  IN_ACTIVE = 'in_active',
}


export enum expiryTime {
  TWO_MIN = 2,
  FIVE_MIN = 5,
  TEN_MIN = 10,
  ONE_HOUR = 60,
  FIVE_HOUR = 300,
  TEN_DAY = 14400, // 10 days in minutes
  THIRTY_DAY = 43200, // 30 days in minutes
}
export enum OtpType {
  FORGOT_PASSWORD = 'forgot_password',
}

export enum SlotStatus {
  AVAILABLE = 'Available',
  BOOKED = 'Booked'
}
