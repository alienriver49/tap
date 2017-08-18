/**
 * Converts a string value to dash-case.
 * Ex. someTestValue => some-test-value
 * @param {string} value The string to convert
 */
export function dashCase(value: string): string {
    if (!value || typeof value !== 'string') {
        return value;
    }

    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
