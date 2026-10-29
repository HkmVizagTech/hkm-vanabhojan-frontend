import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PageSpinner from '../components/common/PageSpinner';
import RequireAuth from '../components/common/RequireAuth';
import AdminLayout from '../components/layout/AdminLayout';
import RequireCashAccess from '../components/common/RequireCashAccess';

// Every page is its own chunk: visitors to the registration page never download admin code (or xlsx, zxing...).
const RegistrationPage = lazy(() => import('../features/landing/RegistrationPage'));
const ThankYouPage = lazy(() => import('../features/thankyou/ThankYouPage'));
const QrLookupPage = lazy(() => import('../features/attendance/QrLookupPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const CashDeskPage = lazy(() => import('../features/admin/cash/CashDeskPage'));
const StaffPage = lazy(() => import('../features/admin/staff/StaffPage'));
const CandidatesPage = lazy(() => import('../features/admin/candidates/CandidatesPage'));
const AttendancePage = lazy(() => import('../features/admin/attendance/AttendancePage'));
const ScannedListPage = lazy(() => import('../features/admin/scanned/ScannedListPage'));
const CollegesPage = lazy(() => import('../features/admin/colleges/CollegesPage'));
const ScannerPage = lazy(() => import('../features/admin/scanner/ScannerPage'));
const EventsPage = lazy(() => import('../features/admin/events/EventsPage'));
const InsightsPage = lazy(() => import('../features/admin/insights/InsightsPage'));

const STAFF = ['admin', 'user'];
const ADMIN_ONLY = ['admin'];

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/thankyou/:id" element={<ThankYouPage />} />
        <Route path="/attendance" element={<QrLookupPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<RequireAuth allowedRoles={STAFF} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/adminqrscanner" element={<ScannerPage />} />
            <Route element={<RequireCashAccess />}>
              <Route path="/admin/cash" element={<CashDeskPage />} />
            </Route>
            <Route path="/admin/AdminAttendanceScannedList" element={<ScannedListPage />} />
            <Route element={<RequireAuth allowedRoles={ADMIN_ONLY} />}>
              <Route path="/admin" element={<CandidatesPage />} />
              <Route path="/admin/attendance" element={<AttendancePage />} />
              <Route path="/admin/events" element={<EventsPage />} />
              <Route path="/admin/insights" element={<InsightsPage />} />
              <Route path="/admin/college" element={<CollegesPage />} />
              <Route path="/admin/staff" element={<StaffPage />} />
              <Route path="/admin/register" element={<Navigate to="/admin/staff" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
