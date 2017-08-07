import { Utilities } from './utilities';

describe('Utilities', () => {
    let utils;

    beforeEach(() => {
        utils = new Utilities();
    });

    describe('lowerCaseFirstChar', () => {
        it('should convert first character to lower case', () => {
            expect(utils.lowerCaseFirstChar('TestString')).toBe('testString');
        });
    });

    describe('upperCaseFirstChar', () => {
        it('should convert first character to upper case', () => {
            expect(utils.upperCaseFirstChar('testString')).toBe('TestString');
        });
    });

    describe('camelCaseToHyphen', () => {
        it('should add hyphens properly', () => {
            expect(utils.camelCaseToHyphen('someTestString')).toBe('some-test-string');
        });

        it('should accept mixed formats hyphens properly', () => {
            expect(utils.camelCaseToHyphen('some-testString')).toBe('some-test-string');
        });

        it('should leave string unchanged if already in proper format', () => {
            expect(utils.camelCaseToHyphen('some-test-string')).toBe('some-test-string');
        });
    });

    describe('isPrimitive', () => {        
        it('should return true for primitive types', () => {            
            expect(utils.isPrimitive('')).toBe(true, 'expected a string literal to be primitive');
            expect(utils.isPrimitive(true)).toBe(true, 'expected a boolean to be primitive');
            expect(utils.isPrimitive(1)).toBe(true, 'expected an integer to be primitive');
            expect(utils.isPrimitive(undefined)).toBe(true, 'expected undefined to be primitive');
            expect(utils.isPrimitive(Symbol())).toBe(true, 'expected a symbol to be primitive');
        });

        it('should return false for non-primitive types', () => {
            expect(utils.isPrimitive({})).toBe(false, 'expected an anonymous object to not be primitive');
            expect(utils.isPrimitive(() => {})).toBe(false, 'expected a function to not be primitive');
        });
    });

    describe('newGuid', () => {
        it('should return a valid guid', () => {
            const guid  = utils.newGuid();
            expect(guid).toBeDefined();
            expect(guid.replace(/-/g, '').length).toBe(32);
            expect(guid.length).toBe(36);
        });
    });
});
