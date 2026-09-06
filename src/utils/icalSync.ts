import { PropertyUnit, PropertyReservation, UnitIcalConnection, IcalParsedEvent } from '../types';

/**
 * Format a Date or ISO string into RFC 5545 DATE format (YYYYMMDD)
 */
export function formatIcalDate(dateStr: string): string {
  const clean = dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  if (clean.length === 8) {
    return clean;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }
  return dateStr.replace(/-/g, '');
}

/**
 * Parse an RFC 5545 iCal date (e.g. 20260905 or 20260905T120000Z) to YYYY-MM-DD
 */
export function parseIcalDateToIso(rawDate: string): string {
  // Strip VALUE=DATE: or TZID prefixes if passed
  const clean = rawDate.replace(/^.*:/, '').trim();
  if (clean.length >= 8) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return rawDate;
}

/**
 * Generates standard RFC 5545 compliant iCalendar (.ics) content for a property unit.
 * Compatible with Airbnb, Booking.com, VRBO, Google Calendar, and Apple Calendar.
 */
export function generateUnitIcalContent(
  unit: PropertyUnit,
  reservations: PropertyReservation[],
  exportDomain = 'vortix.io'
): string {
  const now = new Date();
  const dtstamp = `${formatIcalDate(now.toISOString())}T${String(now.getUTCHours()).padStart(2, '0')}${String(
    now.getUTCMinutes()
  ).padStart(2, '0')}00Z`;

  const unitReservations = reservations.filter(
    (r) => r.unitId === unit.id && r.status !== 'cancelled'
  );

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vortix Operations//PMS Calendar Sync Engine v2.4//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Vortix - ${unit.unitNumber} (${unit.propertyName})`,
    'X-WR-TIMEZONE:UTC',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
    'X-PUBLISHED-TTL:PT15M',
  ];

  unitReservations.forEach((res) => {
    const startDate = formatIcalDate(res.checkInDate);
    const endDate = formatIcalDate(res.checkOutDate);
    const uid = `res-${res.id}-${res.unitId}@${exportDomain}`;

    // RFC 5545 VEVENT block
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:Reserved - ${res.guestName.split(' ')[0]} (Vortix PMS)`);
    lines.push(`DESCRIPTION:Vortix Reservation Code: ${res.reservationCode} | Status: ${res.status.toUpperCase()} | Channel: ${res.channelOrigin.toUpperCase()}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  });

  // If unit is in maintenance or blocked, block today for 7 days
  if (unit.occupancyStatus === 'blocked' || unit.cleaningStatus === 'maintenance') {
    const blockStart = formatIcalDate(now.toISOString());
    const blockEndD = new Date(now.getTime() + 7 * 86400000);
    const blockEnd = formatIcalDate(blockEndD.toISOString());

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:maint-block-${unit.id}@${exportDomain}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${blockStart}`);
    lines.push(`DTEND;VALUE=DATE:${blockEnd}`);
    lines.push(`SUMMARY:Blocked - Maintenance (${unit.unitNumber})`);
    lines.push(`DESCRIPTION:Maintenance & cleaning block: ${unit.notes || 'Routine upkeep'}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Downloads generated iCal feed as a .ics file in browser
 */
export function triggerIcalDownload(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Robust RFC 5545 parser that unfolds wrapped lines and extracts VEVENTs
 */
export function parseIcalContent(
  rawIcs: string,
  channel: string,
  unitNumber: string
): IcalParsedEvent[] {
  const events: IcalParsedEvent[] = [];
  if (!rawIcs || !rawIcs.includes('BEGIN:VCALENDAR')) {
    return events;
  }

  // Unfold lines: RFC 5545 allows wrapping lines with CRLF + space/tab
  const unfolded = rawIcs.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\n|\r/);

  let inEvent = false;
  let currentEvent: Partial<IcalParsedEvent> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {
        channel,
        unitNumber,
      };
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      if (currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid || `event-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          summary: currentEvent.summary || `${channel} Booking Block`,
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          channel,
          unitNumber,
          description: currentEvent.description || '',
        });
      }
      inEvent = false;
      currentEvent = {};
      continue;
    }

    if (!inEvent) continue;

    if (trimmed.startsWith('UID:')) {
      currentEvent.uid = trimmed.substring(4).trim();
    } else if (trimmed.startsWith('DTSTART')) {
      const val = trimmed.replace(/^DTSTART[^:]*:/, '').trim();
      currentEvent.startDate = parseIcalDateToIso(val);
    } else if (trimmed.startsWith('DTEND')) {
      const val = trimmed.replace(/^DTEND[^:]*:/, '').trim();
      currentEvent.endDate = parseIcalDateToIso(val);
    } else if (trimmed.startsWith('SUMMARY:')) {
      currentEvent.summary = trimmed.substring(8).trim();
    } else if (trimmed.startsWith('DESCRIPTION:')) {
      currentEvent.description = trimmed.substring(12).trim();
    }
  }

  return events;
}

/**
 * Seed sample Airbnb and Booking.com iCal feeds for direct one-click testing
 */
export const sampleAirbnbIcalPayload = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Airbnb - Suite 101 Midwest
BEGIN:VEVENT
DTSTAMP:20260905T140000Z
DTSTART;VALUE=DATE:20260918
DTEND;VALUE=DATE:20260922
UID:airbnb-res-9982441@airbnb.com
SUMMARY:Airbnb (Not available)
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/details/HM388294
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20260905T140000Z
DTSTART;VALUE=DATE:20260925
DTEND;VALUE=DATE:20260929
UID:airbnb-res-1002341@airbnb.com
SUMMARY:Airbnb (Not available)
DESCRIPTION:Guest booked via Instant Book.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

export const sampleBookingComIcalPayload = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booking.com B.V.//Connectivity Calendar Sync 2.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Booking.com - Suite 101
BEGIN:VEVENT
DTSTAMP:20260905T140000Z
DTSTART;VALUE=DATE:20261002
DTEND;VALUE=DATE:20261006
UID:bkg-res-44910283@booking.com
SUMMARY:CLOSED - Booking.com
DESCRIPTION:Booking.com Reservation #44910283 (Non-refundable rate)
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

export const initialUnitIcalConnections: UnitIcalConnection[] = [
  {
    unitId: 'unit-101',
    unitNumber: 'Suite 101',
    propertyName: 'Midwest Campus Residency',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-101.ics?key=vtx_sec_9941a',
    exportToken: 'vtx_sec_9941a',
    inboundFeeds: [
      {
        id: 'in-feed-101-air',
        channelCode: 'airbnb',
        channelName: 'Airbnb Calendar Sync',
        feedUrl: 'https://www.airbnb.com/calendar/ical/8821904.ics?s=34a9b2c8',
        lastSyncedAt: '12 minutes ago',
        syncStatus: 'active',
        eventsImportedCount: 2,
      },
      {
        id: 'in-feed-101-bkg',
        channelCode: 'booking_com',
        channelName: 'Booking.com Extranet iCal',
        feedUrl: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=9821-4991-aa',
        lastSyncedAt: '35 minutes ago',
        syncStatus: 'active',
        eventsImportedCount: 1,
      },
    ],
  },
  {
    unitId: 'unit-102',
    unitNumber: 'Suite 102',
    propertyName: 'Midwest Campus Residency',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-102.ics?key=vtx_sec_3321b',
    exportToken: 'vtx_sec_3321b',
    inboundFeeds: [
      {
        id: 'in-feed-102-air',
        channelCode: 'airbnb',
        channelName: 'Airbnb Calendar Sync',
        feedUrl: 'https://www.airbnb.com/calendar/ical/8821905.ics?s=98f12a3',
        lastSyncedAt: '1 hour ago',
        syncStatus: 'active',
        eventsImportedCount: 1,
      },
    ],
  },
  {
    unitId: 'unit-201',
    unitNumber: 'Loft 201',
    propertyName: 'Midwest Campus Residency',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-201.ics?key=vtx_sec_7712c',
    exportToken: 'vtx_sec_7712c',
    inboundFeeds: [
      {
        id: 'in-feed-201-vrbo',
        channelCode: 'vrbo',
        channelName: 'VRBO / HomeAway iCal',
        feedUrl: 'https://www.vrbo.com/icalendar/7123991.ics',
        lastSyncedAt: '2 hours ago',
        syncStatus: 'active',
        eventsImportedCount: 1,
      },
    ],
  },
  {
    unitId: 'unit-202',
    unitNumber: 'Loft 202',
    propertyName: 'Midwest Campus Residency',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-202.ics?key=vtx_sec_1109d',
    exportToken: 'vtx_sec_1109d',
    inboundFeeds: [
      {
        id: 'in-feed-202-air',
        channelCode: 'airbnb',
        channelName: 'Airbnb Calendar Sync',
        feedUrl: 'https://www.airbnb.com/calendar/ical/9923812.ics?s=aa4112',
        lastSyncedAt: '25 minutes ago',
        syncStatus: 'active',
        eventsImportedCount: 2,
      },
      {
        id: 'in-feed-202-bkg',
        channelCode: 'booking_com',
        channelName: 'Booking.com iCal',
        feedUrl: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=1120-8841-zz',
        lastSyncedAt: '40 minutes ago',
        syncStatus: 'active',
        eventsImportedCount: 1,
      },
    ],
  },
  {
    unitId: 'unit-301',
    unitNumber: 'Pod A-1',
    propertyName: 'Vortix Innovation Pods',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-301.ics?key=vtx_sec_5521e',
    exportToken: 'vtx_sec_5521e',
    inboundFeeds: [],
  },
  {
    unitId: 'unit-401',
    unitNumber: 'Villa North',
    propertyName: 'Advanced Manufacturing Villas',
    exportUrl: 'https://vortix.io/api/v1/ical/export/unit-401.ics?key=vtx_sec_8842f',
    exportToken: 'vtx_sec_8842f',
    inboundFeeds: [
      {
        id: 'in-feed-401-air',
        channelCode: 'airbnb',
        channelName: 'Airbnb Luxury Villa Sync',
        feedUrl: 'https://www.airbnb.com/calendar/ical/1029384.ics?s=bb3819',
        lastSyncedAt: '15 minutes ago',
        syncStatus: 'active',
        eventsImportedCount: 1,
      },
    ],
  },
];
