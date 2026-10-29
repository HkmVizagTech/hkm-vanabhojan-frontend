import { http, unwrapList } from './http';

export const attendanceApi = {
  getQrCodes: whatsappNumber =>
    http.post('/users/get-qr-codes', { whatsappNumber }).then(r => r.data),

  scan: token => http.post('/users/admin/attendance-scan', { token }).then(r => r.data),

  /** Records scanned by volunteers. */
  listScanned: (event, signal) =>
    http
      .get('/users/admin/scanned-list', { params: event ? { event } : {}, signal })
      .then(r => unwrapList(r.data, ['candidates', 'records', 'scannedList'])),
};
