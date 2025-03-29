/**
 * Debug Helper for HBS
 * Provides utility functions for debugging JavaScript issues
 */
class HBSDebugHelper {
    /**
     * Safe string conversion that handles potentially problematic values
     * @param {any} value - The value to convert to string
     * @returns {string} A safe string representation
     */
    static safeToString(value) {
        if (value === undefined) return "undefined";
        if (value === null) return "null";
        
        try {
            return String(value);
        } catch (e) {
            return "[Error converting to string]";
        }
    }
    
    /**
     * Safe string method call that won't throw errors on invalid values
     * @param {any} value - The value to call method on
     * @param {string} methodName - Name of string method to call
     * @param {string} defaultValue - Default value if operation fails
     * @returns {string} Result of method call or default value
     */
    static safeStringMethod(value, methodName, defaultValue = "") {
        if (typeof value !== 'string') return defaultValue;
        
        try {
            return value[methodName]();
        } catch (e) {
            console.error(`Error calling ${methodName} on string:`, e);
            return defaultValue;
        }
    }
    
    /**
     * Safely logs object properties for debugging
     * @param {object} obj - The object to debug
     * @param {string} label - Label for the debug output
     */
    static logObject(obj, label = "Object") {
        console.group(`Debug: ${label}`);
        
        try {
            if (!obj) {
                console.log("Object is null or undefined");
            } else {
                for (const key in obj) {
                    const value = obj[key];
                    const valueType = typeof value;
                    console.log(`${key} (${valueType}):`, value);
                }
            }
        } catch (e) {
            console.error("Error during object logging:", e);
        }
        
        console.groupEnd();
    }
}

// Export the debug helper
if (typeof module !== 'undefined') {
    module.exports = { HBSDebugHelper };
}
