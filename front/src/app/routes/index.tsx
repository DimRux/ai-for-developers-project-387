import { Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/home';
import { EventTypePage } from '@/pages/event-type';
import { BookingConfirmation } from '@/pages/booking-confirmation';
import { Dashboard } from '@/pages/admin/dashboard';
import { AdminEventTypes } from '@/pages/admin/event-types';
import { NotFound } from '@/pages/not-found';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/event-types/:eventTypeId" element={<EventTypePage />} />
      <Route path="/bookings/:bookingId" element={<BookingConfirmation />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/event-types" element={<AdminEventTypes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
