/**
 * Converts a string value to kebab case.
 * Ex. someTestValue => some-test-value
 * @param {string} value The string to convert
 */
export function kebabCase(value: string): string {
    if (!value || typeof value !== 'string') {
        return value;
    }

    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}