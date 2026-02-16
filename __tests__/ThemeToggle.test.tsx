import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle, ThemeToggleWithLabel, ThemeStatus } from '@/components/ThemeToggle';

// Mock the useTheme hook
const mockToggleTheme = jest.fn();
const mockSetTheme = jest.fn();

const mockUseTheme = {
  theme: 'light' as const,
  toggleTheme: mockToggleTheme,
  setTheme: mockSetTheme,
};

jest.mock('@/lib/theme-provider', () => ({
  useTheme: () => mockUseTheme,
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ThemeToggle Component', () => {
  test('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('displays correct aria-label based on current theme', () => {
    // Test with light theme
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});

describe('ThemeToggleWithLabel Component', () => {
  test('renders theme toggle with label', () => {
    render(<ThemeToggleWithLabel />);
    
    // Check for the label text
    expect(screen.getByText(/light mode/i)).toBeInTheDocument();
  });

  test('renders the toggle button', () => {
    render(<ThemeToggleWithLabel />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('ThemeStatus Component', () => {
  test('displays current theme status', () => {
    render(<ThemeStatus />);
    
    expect(screen.getByText(/Currently in/)).toBeInTheDocument();
    expect(screen.getByText(/light/)).toBeInTheDocument();
    expect(screen.getByText(/mode/)).toBeInTheDocument();
  });

  test('displays theme status with correct formatting', () => {
    render(<ThemeStatus />);
    
    // Check for the status indicator
    const indicator = document.querySelector('[class*="rounded-full"]');
    expect(indicator).toBeInTheDocument();
  });
});

describe('ThemeContext Mock Behavior', () => {
  test('mock useTheme returns correct theme value', () => {
    // This test verifies our mock is working correctly
    const { theme, toggleTheme } = mockUseTheme;
    
    expect(theme).toBe('light');
    expect(toggleTheme).toBeDefined();
    expect(typeof toggleTheme).toBe('function');
  });

  test('mock toggleTheme can be called', () => {
    const { toggleTheme } = mockUseTheme;
    
    toggleTheme();
    
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});

