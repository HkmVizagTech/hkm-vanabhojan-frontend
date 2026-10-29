import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException } from '@zxing/library';

// Frames without a readable code raise these constantly; they are not failures.
const TRANSIENT = [NotFoundException, ChecksumException, FormatException];
// Before the first video frame arrives the decoder reads a 0x0 canvas; that resolves itself.
const isEmptyFrameError = err => err?.name === 'IndexSizeError' || /source width is 0|source height is 0/i.test(err?.message || '');

const friendlyError = err => {
  if (err?.name === 'NotAllowedError') return 'Camera permission denied. Allow camera access and reload the page.';
  if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') return 'No camera device found.';
  if (err?.name === 'NotReadableError') return 'The camera is in use by another app or tab. Close it and reload.';
  return err?.message || 'Could not start the camera.';
};

/**
 * Streams the camera into `videoRef` and calls `onDecode(text)` for every decoded frame.
 * `deviceId = null` lets the browser pick the rear camera on phones.
 *
 * Starting a camera is asynchronous, and a run can be cancelled (navigation, switching camera,
 * React StrictMode) while it is still starting. Runs are therefore chained: each one waits for the
 * previous one to be fully stopped before it opens the camera, so two runs never fight over the
 * same <video> element and a camera that starts late is always shut down.
 */
export function useQrScanner({ videoRef, onDecode, deviceId }) {
  const [devices, setDevices] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;
  const previousStop = useRef(Promise.resolve());

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    const video = videoRef.current;
    let cancelled = false;
    setError('');
    setReady(false);

    const start = async () => {
      await previousStop.current; // the last run has released the camera
      if (cancelled) return;
      try {
        await reader.decodeFromVideoDevice(deviceId, video, (result, err) => {
          if (cancelled) return;
          if (result) onDecodeRef.current(result.getText());
          else if (err && !TRANSIENT.some(T => err instanceof T) && !isEmptyFrameError(err)) setError(err.message || 'QR scan error');
        });
        if (cancelled) return;
        setReady(true);
        // Labels are only available once permission is granted, so list after starting.
        const list = await reader.listVideoInputDevices();
        if (!cancelled) setDevices(list);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      }
    };
    const running = start();

    return () => {
      cancelled = true;
      // Stop only after the start attempt has settled, even if the camera opens after we left.
      previousStop.current = running.then(() => {
        reader.reset();
        video?.srcObject?.getTracks?.().forEach(track => track.stop());
        if (video) video.srcObject = null;
      });
    };
  }, [deviceId, videoRef]);

  return { devices, ready, error };
}
