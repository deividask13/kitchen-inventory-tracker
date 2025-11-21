import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAInstallPrompt } from '../pwa-install-prompt';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PWAInstallPrompt', () => {
  let mockDeferredPrompt: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock deferred prompt
    mockDeferredPrompt = {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    // Clear any existing event listeners
    window.removeAllListeners?.();
  });

  it('should not render initially when no prompt is available', () => {
    render(<PWAInstallPrompt />);
    
    expect(screen.queryByText(/install app/i)).not.toBeInTheDocument();
  });

  it('should show prompt when beforeinstallprompt event is fired', async () => {
    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    event.preventDefault = vi.fn();
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    fireEvent(window, event);

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });
  });

  it('should not show prompt if previously dismissed within 7 days', async () => {
    const recentDismissTime = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days ago
    mockLocalStorage.getItem.mockReturnValue(recentDismissTime.toString());

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    // Should not show prompt
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.queryByText('Install App')).not.toBeInTheDocument();
  });

  it('should show prompt if dismissed more than 7 days ago', async () => {
    const oldDismissTime = Date.now() - (10 * 24 * 60 * 60 * 1000); // 10 days ago
    mockLocalStorage.getItem.mockReturnValue(oldDismissTime.toString());

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event with deferred prompt
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });
  });

  it('should call prompt when install button is clicked', async () => {
    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
  });

  it('should show installing state during installation', async () => {
    // Make userChoice promise not resolve immediately
    mockDeferredPrompt.userChoice = new Promise(() => {}); // Never resolves

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(screen.getByText('Installing...')).toBeInTheDocument();
      expect(screen.getByText('Installing...')).toBeDisabled();
    });
  });

  it('should hide prompt when user accepts installation', async () => {
    mockDeferredPrompt.userChoice = Promise.resolve({ outcome: 'accepted' });

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  it('should hide prompt when user dismisses installation', async () => {
    mockDeferredPrompt.userChoice = Promise.resolve({ outcome: 'dismissed' });

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  it('should save dismiss timestamp when "Not now" is clicked', async () => {
    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const notNowButton = screen.getByText('Not now');
    fireEvent.click(notNowButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'pwa-install-dismissed',
      expect.any(String)
    );

    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  it('should save dismiss timestamp when X button is clicked', async () => {
    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss install prompt');
    fireEvent.click(dismissButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'pwa-install-dismissed',
      expect.any(String)
    );

    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });
  });

  it('should hide prompt and clear dismiss flag when app is installed', async () => {
    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    // Simulate app installation
    fireEvent(window, new Event('appinstalled'));

    await waitFor(() => {
      expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pwa-install-dismissed');
  });

  it('should handle installation errors gracefully', async () => {
    mockDeferredPrompt.prompt = vi.fn().mockRejectedValue(new Error('Installation failed'));

    render(<PWAInstallPrompt />);

    // Simulate beforeinstallprompt event
    const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
    event.preventDefault = vi.fn();
    fireEvent(window, event);

    await waitFor(() => {
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    // Just verify the prompt was called and component doesn't crash
    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
  });
});