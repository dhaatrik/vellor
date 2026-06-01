// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStore } from '../../store';
import { Theme } from '../../types';
import * as crypto from '../../src/crypto';

describe('createDataManagementSlice', () => {
  let createObjectURLMock: any;
  let revokeObjectURLMock: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let createElementSpy: any;

  beforeEach(() => {
    // Reset store state
    useStore.setState({
      students: [{ id: '1', firstName: 'John', lastName: 'Doe', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 } } as any],
      transactions: [{ id: '1', studentId: '1', amountPaid: 100, lessonFee: 100, date: '2023-01-01' } as any],
      gamification: { points: 100, level: 2, levelName: 'Apprentice', streak: 5, lastActiveDate: null },
      achievements: [],
      settings: {
        theme: Theme.Dark,
        currencySymbol: '$',
        userName: 'Tutor',
        country: 'US',
        phone: { countryCode: '+1', number: '1234567890' },
        email: 'tutor@example.com',
        monthlyGoal: 1000,
      },
      activityLog: [{ id: '1', message: 'Test activity', icon: 'check-circle', timestamp: '2023-01-01' } as any],
      addToast: vi.fn(),
    });

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'setItem');

    // Mock URL methods
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Mock DOM methods
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return mockAnchor as any;
      return document.createElement(tagName);
    });
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as any; });
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as any; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportData', () => {
    it('successfully creates an export Blob and interacts with DOM', () => {
      const addToastMock = useStore.getState().addToast;

      useStore.getState().exportData();

      // Verify Blob and URL creation
      expect(createObjectURLMock).toHaveBeenCalled();
      const blobArg = createObjectURLMock.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('application/json');

      // Verify DOM interactions
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      const mockAnchor = createElementSpy.mock.results[0].value;
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toMatch(/vellor_backup_\d{4}-\d{2}-\d{2}\.json/);
      expect(mockAnchor.click).toHaveBeenCalled();

      // Verify URL revocation
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

      // Verify localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('lastBackupDate', expect.any(String));

      // Verify toast
      expect(addToastMock).toHaveBeenCalledWith('Data exported successfully!', 'success');
    });

    it('catches errors and shows error toast', async () => {
      const addToastMock = useStore.getState().addToast;

      // Force a failure in the URL creation (simulating file system / download failure)
      global.URL.createObjectURL = vi.fn().mockImplementationOnce(() => {
        throw new Error('Mock URL.createObjectURL Error');
      });

      await useStore.getState().exportData();

      expect(addToastMock).toHaveBeenCalledWith('Failed to export data.', 'error');
    });

    it('successfully creates an encrypted export Blob when password is provided', async () => {
      const addToastMock = useStore.getState().addToast;
      const generateSaltSpy = vi.spyOn(crypto, 'generateSalt').mockReturnValue(new Uint8Array([1, 2, 3]));
      const deriveKeySpy = vi.spyOn(crypto, 'deriveKey').mockResolvedValue('mock-key' as any);
      const encryptObjectSpy = vi.spyOn(crypto, 'encryptObject').mockResolvedValue('encrypted-data');

      await useStore.getState().exportData('my-password');

      expect(generateSaltSpy).toHaveBeenCalled();
      expect(deriveKeySpy).toHaveBeenCalledWith('my-password', expect.any(Uint8Array));
      expect(encryptObjectSpy).toHaveBeenCalled();

      // Verify Blob and URL creation
      expect(createObjectURLMock).toHaveBeenCalled();
      const blobArg = createObjectURLMock.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);

      // We need to parse the JSON string passed to Blob to check its structure
      const blobText = await blobArg.text();
      const parsedPayload = JSON.parse(blobText);

      expect(parsedPayload.__vellor_encrypted).toBe(true);
      expect(parsedPayload.salt).toEqual([1, 2, 3]);
      expect(parsedPayload.data).toBe('encrypted-data');

      // Verify toast
      expect(addToastMock).toHaveBeenCalledWith('Data exported successfully!', 'success');
    });

    it('catches errors during encrypted export', async () => {
      const addToastMock = useStore.getState().addToast;

      // Mock deriveKey to throw
      vi.spyOn(crypto, 'deriveKey').mockRejectedValueOnce(new Error('Crypto Error'));

      await useStore.getState().exportData('my-password');

      expect(addToastMock).toHaveBeenCalledWith('Failed to export data.', 'error');
    });

    it('returns early when password prompt is cancelled', async () => {
      const addToastMock = useStore.getState().addToast;

      await useStore.getState().exportData(null);

      expect(createObjectURLMock).not.toHaveBeenCalled();
      expect(addToastMock).not.toHaveBeenCalled();
    });
  });

  describe('importData', () => {
    it('shows error toast on incorrect password during import', async () => {
      const addToastMock = useStore.getState().addToast;

      const mockFileContent = JSON.stringify({
        __vellor_encrypted: true,
        salt: [1, 2, 3],
        data: 'encrypted-data'
      });

      const mockFile = new File([mockFileContent], 'backup.json', { type: 'application/json' });

      const decryptSpy = vi.spyOn(crypto, 'decryptObject').mockRejectedValueOnce(new Error('Decryption failed'));
      const deriveSpy = vi.spyOn(crypto, 'deriveKey').mockResolvedValueOnce('mock-key' as any);

      await useStore.getState().importData(mockFile, 'wrong-password');

      expect(deriveSpy).toHaveBeenCalled();
      expect(decryptSpy).toHaveBeenCalled();
      expect(addToastMock).toHaveBeenCalledWith(
        expect.stringContaining('Incorrect password or corrupted encrypted data'),
        'error'
      );
    });
  });
});
