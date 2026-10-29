import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { attendanceApi } from '../../../services/attendance';
import ScannerPage from './ScannerPage';

jest.mock('../../../services/attendance', () => ({ attendanceApi: { scan: jest.fn() } }));

// The camera pipeline is replaced by a reader that "sees" the same QR on every frame.
const mockReset = jest.fn();
let mockStartDelay = 0;

jest.mock('@zxing/library', () => {
  class NotFoundException extends Error {}
  class ChecksumException extends Error {}
  class FormatException extends Error {}
  class BrowserMultiFormatReader {
    async decodeFromVideoDevice(_id, _video, cb) {
      if (mockStartDelay) await new Promise(resolve => setTimeout(resolve, mockStartDelay));
      setTimeout(() => {
        cb({ getText: () => 'token-1' });
        cb({ getText: () => 'token-1' });
        cb({ getText: () => 'token-1' });
      }, 0);
    }
    async listVideoInputDevices() {
      return [];
    }
    reset() {
      mockReset();
    }
  }
  return { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException };
});

const renderPage = () => render(<ChakraProvider><ScannerPage /></ChakraProvider>);

describe('ScannerPage', () => {
  beforeEach(() => {
    attendanceApi.scan.mockReset();
    mockReset.mockReset();
    mockStartDelay = 0;
  });

  it('shuts the camera down even when the page is left before the camera finished starting', async () => {
    mockStartDelay = 60;
    const { unmount } = renderPage();
    await new Promise(resolve => setTimeout(resolve, 15)); // the camera is now mid-start
    unmount();
    expect(mockReset).not.toHaveBeenCalled(); // too early to stop: the camera does not exist yet
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(mockReset).toHaveBeenCalled(); // stopped as soon as it did start
  });

  it('posts a held-up QR once and lists every family member', async () => {
    attendanceApi.scan.mockResolvedValue({
      status: 'success',
      message: 'Attendance marked',
      totalMembers: 2,
      scannedPerson: 'Arjun',
      familyMembers: [
        { id: 1, name: 'Arjun Rao', wasAlreadyScanned: false },
        { id: 2, name: 'Sita Devi', wasAlreadyScanned: true },
      ],
    });
    renderPage();

    expect(await screen.findByText('Family Registration (2 members):')).toBeInTheDocument();
    expect(screen.getAllByText('Sita Devi').length).toBeGreaterThan(0);
    expect(screen.getByText('ALREADY SCANNED')).toBeInTheDocument();
    expect(screen.getByText('NEW SCAN')).toBeInTheDocument();
    expect(attendanceApi.scan).toHaveBeenCalledTimes(1);
    expect(attendanceApi.scan).toHaveBeenCalledWith('token-1');
  });

  it('shows the backend message when the scan is rejected', async () => {
    attendanceApi.scan.mockRejectedValue({ response: { data: { message: 'Invalid QR' } } });
    renderPage();
    // shown in the result alert and again in the session history
    expect((await screen.findAllByText('Invalid QR')).length).toBe(2);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
