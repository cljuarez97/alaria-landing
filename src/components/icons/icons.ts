// Iconos Lucide (lucide-static) importados como texto en build: cero JS de iconos en runtime.
import house from 'lucide-static/icons/house.svg?raw';
import layers from 'lucide-static/icons/layers.svg?raw';
import images from 'lucide-static/icons/images.svg?raw';
import mapPin from 'lucide-static/icons/map-pin.svg?raw';
import calendarCheck from 'lucide-static/icons/calendar-check.svg?raw';
import messageCircle from 'lucide-static/icons/message-circle.svg?raw';
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import arrowLeft from 'lucide-static/icons/arrow-left.svg?raw';
import plus from 'lucide-static/icons/plus.svg?raw';
import clock from 'lucide-static/icons/clock.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import circleAlert from 'lucide-static/icons/circle-alert.svg?raw';
import loaderCircle from 'lucide-static/icons/loader-circle.svg?raw';
import wifiOff from 'lucide-static/icons/wifi-off.svg?raw';
import rotateCcw from 'lucide-static/icons/rotate-ccw.svg?raw';
import moveHorizontal from 'lucide-static/icons/move-horizontal.svg?raw';
import stethoscope from 'lucide-static/icons/stethoscope.svg?raw';
import receiptText from 'lucide-static/icons/receipt-text.svg?raw';
import shieldCheck from 'lucide-static/icons/shield-check.svg?raw';
import history from 'lucide-static/icons/history.svg?raw';
import calendarClock from 'lucide-static/icons/calendar-clock.svg?raw';

export const icons = {
  house,
  layers,
  images,
  'map-pin': mapPin,
  'calendar-check': calendarCheck,
  'message-circle': messageCircle,
  'arrow-right': arrowRight,
  'arrow-left': arrowLeft,
  plus,
  clock,
  check,
  'circle-alert': circleAlert,
  'loader-circle': loaderCircle,
  'wifi-off': wifiOff,
  'rotate-ccw': rotateCcw,
  'move-horizontal': moveHorizontal,
  stethoscope,
  'receipt-text': receiptText,
  'shield-check': shieldCheck,
  history,
  'calendar-clock': calendarClock,
} as const;

export type IconName = keyof typeof icons;
