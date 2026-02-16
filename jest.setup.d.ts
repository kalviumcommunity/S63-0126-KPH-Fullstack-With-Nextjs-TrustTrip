import '@testing-library/jest-dom';

// Extend Jest matchers with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> extends jest.Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveValue(value: string | number | string[]): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: Element | null): R;
      toContainHTML(html: string): R;
      toHaveFocus(): R;
      toHaveStyle(css: string | Record<string, string>): R;
    }
  }
}

