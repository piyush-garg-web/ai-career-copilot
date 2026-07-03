/**
 * Localized Date, Time, and Number Formatting Utilities
 */

/**
 * Formats a Date object or string according to the selected locale.
 */
export function formatLocalDate(date, locale = "en", options = {}) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (e) {
    return new Intl.DateTimeFormat("en", defaultOptions).format(d);
  }
}

/**
 * Formats a Date object or string as localized time.
 */
export function formatLocalTime(date, locale = "en", options = {}) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (e) {
    return new Intl.DateTimeFormat("en", defaultOptions).format(d);
  }
}

/**
 * Formats a number according to the selected locale (with optional currency, percentage, decimal options).
 */
export function formatLocalNumber(num, locale = "en", options = {}) {
  if (num === null || num === undefined || isNaN(num)) return "0";

  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (e) {
    return new Intl.NumberFormat("en", options).format(num);
  }
}

/**
 * Returns a localized relative time description (e.g. "2 hours ago", "हिन्दी में सापेक्ष समय").
 */
export function formatLocalRelativeTime(date, locale = "en") {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInSeconds = Math.round(diffInMs / 1000);
  const diffInMinutes = Math.round(diffInSeconds / 60);
  const diffInHours = Math.round(diffInMinutes / 60);
  const diffInDays = Math.round(diffInHours / 24);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(diffInDays) > 0) {
      return rtf.format(diffInDays, "day");
    }
    if (Math.abs(diffInHours) > 0) {
      return rtf.format(diffInHours, "hour");
    }
    if (Math.abs(diffInMinutes) > 0) {
      return rtf.format(diffInMinutes, "minute");
    }
    return rtf.format(diffInSeconds, "second");
  } catch (e) {
    // Basic English fallback
    if (Math.abs(diffInDays) > 0) return `${Math.abs(diffInDays)} days ago`;
    if (Math.abs(diffInHours) > 0) return `${Math.abs(diffInHours)} hours ago`;
    if (Math.abs(diffInMinutes) > 0) return `${Math.abs(diffInMinutes)} minutes ago`;
    return "just now";
  }
}
