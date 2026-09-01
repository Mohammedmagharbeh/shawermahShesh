import { useState, useEffect } from "react";

// وقت الإغلاق: من 2:30 صباحاً لغاية 10:00 صباحاً
const CLOSE_START_MINUTES = 2 * 60 + 30; // 2:30 => 150
const CLOSE_END_MINUTES = 10 * 60; // 10:00 => 600

function getIsOpenNow() {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const isClosed =
    minutesSinceMidnight >= CLOSE_START_MINUTES &&
    minutesSinceMidnight < CLOSE_END_MINUTES;
  return !isClosed;
}

/**
 * Hook مشترك لحالة فتح/إغلاق المطعم.
 * بيتحدث كل دقيقة، وبيستخدم بأي مكان بدل ما يتكرر المنطق (متل داخل كل ProductCard).
 */
export function useRestaurantHours() {
  const [isOpen, setIsOpen] = useState(getIsOpenNow);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(getIsOpenNow());
    }, 30000); // كل 30 ثانية تأكد أدق حول حد 2:30/10:00

    return () => clearInterval(interval);
  }, []);

  return isOpen;
}