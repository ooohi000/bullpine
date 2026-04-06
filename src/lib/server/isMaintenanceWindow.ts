const MAINTENANCE_TIME_ZONE = 'Asia/Seoul';
const MAINTENANCE_START_HOUR = 7;
const MAINTENANCE_END_HOUR = 8;

export const isMaintenanceWindow = (now: Date = new Date()): boolean => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MAINTENANCE_TIME_ZONE,
    hour: '2-digit',
    hour12: false,
  });

  const hour = Number(formatter.format(now));
  return hour >= MAINTENANCE_START_HOUR && hour < MAINTENANCE_END_HOUR;
};
