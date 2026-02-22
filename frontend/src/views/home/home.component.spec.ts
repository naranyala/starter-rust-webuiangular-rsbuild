import { describe, test, expect } from 'bun:test';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  test('should instantiate the component', () => {
    const component = new HomeComponent();
    expect(component).toBeDefined();
  });

  test('should have a title', () => {
    const component = new HomeComponent();
    expect(component.title).toBeDefined();
  });

  test('should have cards array', () => {
    const component = new HomeComponent();
    expect(component.cards).toBeDefined();
    expect(Array.isArray(component.cards)).toBe(true);
  });
});
