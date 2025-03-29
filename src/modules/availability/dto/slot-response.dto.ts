export class TimeSlot {
  startTime: string;
  endTime: string;
}

export class AvailableSlotsResponseDto {
  date: string;
  availableSlots: TimeSlot[];
}
