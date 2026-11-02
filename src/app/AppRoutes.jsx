import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PageSpinner from '../components/common/PageSpinner';
import RequireAuth from '../components/common/RequireAuth';
import AdminLayout from '../components/layout/AdminLayout';
import RequireCashAccess from '../components/common/RequireCashAccess';

// Every page is its own chunk: visitors to the registration page never download admin code (or xlsx, zxing...).
const RegistrationPage = lazy(() => import(/* webpackChunkName: "page-registration" */ '../features/landing/RegistrationPage'));
const ThankYouPage = lazy(() => import(/* webpackChunkName: "page-thank-you" */ '../features/thankyou/ThankYouPage'));
const QrLookupPage = lazy(() => import(/* webpackChunkName: "page-qr-lookup" */ '../features/attendance/QrLookupPage'));
const LoginPage = lazy(() => import(/* webpackChunkName: "page-login" */ '../features/auth/LoginPage'));
const CashDeskPage = lazy(() => import(/* webpackChunkName: "page-cash-desk" */ '../features/admin/cash/CashDeskPage'));
const StaffPage = lazy(() => import(/* webpackChunkName: "page-staff" */ '../features/admin/staff/StaffPage'));
const CandidatesPage = lazy(() => import(/* webpackChunkName: "page-candidates" */ '../features/admin/candidates/CandidatesPage'));
const AttendancePage = lazy(() => import(/* webpackChunkName: "page-attendance" */ '../features/admin/attendance/AttendancePage'));
const ScannedListPage = lazy(() => import(/* webpackChunkName: "page-scanned-list" */ '../features/admin/scanned/ScannedListPage'));
const CollegesPage = lazy(() => import(/* webpackChunkName: "page-colleges" */ '../features/admin/colleges/CollegesPage'));
const ScannerPage = lazy(() => import(/* webpackChunkName: "page-scanner" */ '../features/admin/scanner/ScannerPage'));
const EventsPage = lazy(() => import(/* webpackChunkName: "page-events" */ '../features/admin/events/EventsPage'));
const InsightsPage = lazy(() => import(/* webpackChunkName: "page-insights" */ '../features/admin/insights/InsightsPage'));

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
            <Route path="/admin/qr" element={<QrLookupPage embedded />} />
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
