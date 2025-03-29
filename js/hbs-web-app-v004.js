/**
 * HBS Web Application
 * Handles user interactions and generates character previews
 */
class HBSWebApp {
    constructor() {
        // Initialize with empty schema
        this.schema = {};
        
        // Load schema via XMLHttpRequest instead of fetch
        this.loadSchema();
        
        // Load the debug helper if available
        this.debug = (typeof HBSDebugHelper !== 'undefined') ? HBSDebugHelper : null;
    }

    /**
     * Load schema from JSON file using XMLHttpRequest to avoid promise issues
     */
    loadSchema() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'schema/hbs-schema-v004.json', true);
        xhr.responseType = 'json';
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                this.schema = xhr.response;
                console.log("Schema loaded successfully");
                
                if (typeof HBSValidator !== 'undefined') {
                    this.validator = new HBSValidator(this.schema);
                }
            } else {
                console.error("Failed to load schema:", xhr.status);
                if (typeof HBSValidator !== 'undefined') {
                    this.validator = new HBSValidator({});
                }
            }
            
            // Initialize UI after schema load attempt
            this.initUI();
        };
        
        xhr.onerror = () => {
            console.error("Error during schema request");
            if (typeof HBSValidator !== 'undefined') {
                this.validator = new HBSValidator({});
            }
            this.initUI();
        };
        
        xhr.send();
    }

    /**
     * Initialize the UI components and event handlers
     */
    initUI() {
        try {
            // Add an error message element if it doesn't already exist
            if (!document.getElementById('error-message')) {
                const errorEl = document.createElement('div');
                errorEl.id = 'error-message';
                errorEl.style.cssText = 'display:none; background-color:#f8d7da; color:#721c24; padding:10px; margin:10px 0; border-radius:5px; border:1px solid #f5c6cb;';
                document.querySelector('.output-section')?.prepend(errorEl);
            }

            // Set up generate button
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.generatePrompt());
            }
            
            // Set up reset button
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetForm());
            }
            
            // Set up save button
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveCharacter());
            }
            
            // Set up load file input
            const loadFile = document.getElementById('load-file');
            if (loadFile) {
                loadFile.addEventListener('change', (e) => this.loadCharacter(e));
            }
            
            // Set up character name input to enable save button when filled
            const nameInput = document.getElementById('character-name');
            if (nameInput) {
                nameInput.addEventListener('input', () => {
                    const saveBtn = document.getElementById('save-btn');
                    if (saveBtn) {
                        saveBtn.disabled = !nameInput.value.trim();
                    }
                });
            }

            // Initialize UI helpers if available
            if (typeof HBSUIHelpers !== 'undefined') {
                HBSUIHelpers.initMenuSections();
            }
            
            console.log("HBS Web App UI initialized");
        } catch (error) {
            console.error("Error initializing UI:", error);
            alert("An error occurred while initializing the application. See console for details.");
        }
    }

    /**
     * Generates the prompt using the prompt generator and displays it
     */
    generatePrompt() {
        try {
            // Build character data object that matches what generateT2IPrompt expects
            const formValues = this.getFormValues();
            const characterData = {
                metadata: {
                    version: "v004",
                    character_name: document.getElementById('character-name')?.value || "",
                    timestamp: new Date().toISOString()
                },
                t2i_parameters: formValues
            };
            
            // Get style options
            const stylePrefix = document.getElementById('style-prefix')?.value || '';
            const styleSuffix = document.getElementById('style-suffix')?.value || '';
            const includeDetails = document.getElementById('include-details')?.checked ?? true;
            
            // Generate prompt using the generateT2IPrompt function
            let promptText = "";
            if (typeof generateT2IPrompt === 'function') {
                promptText = generateT2IPrompt(characterData, {
                    stylePrefix,
                    styleSuffix,
                    includeDetails
                });
            } else {
                // Fallback to simple method
                promptText = this.constructPrompt();
            }
            
            // Display the prompt in output area
            const promptOutput = document.getElementById('prompt-output');
            if (promptOutput) {
                promptOutput.textContent = promptText;
            }
            
            // Also update preview area
            const previewPrompt = document.getElementById('preview-prompt');
            if (previewPrompt) {
                previewPrompt.textContent = promptText;
            }
            
            // Enable save button if character has a name
            if (characterData.metadata.character_name) {
                const saveBtn = document.getElementById('save-btn');
                if (saveBtn) saveBtn.disabled = false;
            }
            
            console.log("Prompt generated successfully");
        } catch (error) {
            console.error("Error generating prompt:", error);
            this.showError("Failed to generate prompt: " + error.message);
        }
    }

    /**
     * Resets the form to default values
     */
    resetForm() {
        try {
            const form = document.getElementById('hbs-form');
            if (form) {
                form.reset();
                
                // Clear character name
                const nameInput = document.getElementById('character-name');
                if (nameInput) nameInput.value = '';
                
                // Disable save button
                const saveBtn = document.getElementById('save-btn');
                if (saveBtn) saveBtn.disabled = true;
                
                // Clear the output
                const promptOutput = document.getElementById('prompt-output');
                if (promptOutput) promptOutput.textContent = '';
                
                const previewPrompt = document.getElementById('preview-prompt');
                if (previewPrompt) previewPrompt.textContent = '';
                
                console.log("Form reset successfully");
            }
        } catch (error) {
            console.error("Error resetting form:", error);
            this.showError("Failed to reset form: " + error.message);
        }
    }

    /**
     * Saves the current character to a JSON file
     */
    saveCharacter() {
        try {
            const characterName = document.getElementById('character-name')?.value;
            if (!characterName) {
                this.showError("Please provide a character name before saving");
                return;
            }
            
            const formValues = this.getFormValues();
            const characterData = {
                metadata: {
                    version: "v004",
                    character_name: characterName,
                    timestamp: new Date().toISOString()
                },
                t2i_parameters: formValues
            };
            
            // Convert to JSON
            const jsonData = JSON.stringify(characterData, null, 2);
            
            // Create download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${characterName.replace(/[^\w]/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            console.log("Character saved successfully");
        } catch (error) {
            console.error("Error saving character:", error);
            this.showError("Failed to save character: " + error.message);
        }
    }

    /**
     * Loads a character from a JSON file
     * @param {Event} event - The file input change event
     */
    loadCharacter(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const characterData = JSON.parse(e.target.result);
                    
                    // Set character name
                    const nameInput = document.getElementById('character-name');
                    if (nameInput && characterData.metadata?.character_name) {
                        nameInput.value = characterData.metadata.character_name;
                    }
                    
                    // TODO: Populate form with characterData.t2i_parameters
                    // This would require a separate function to set form values
                    
                    // Enable save button
                    const saveBtn = document.getElementById('save-btn');
                    if (saveBtn && nameInput.value) {
                        saveBtn.disabled = false;
                    }
                    
                    // Generate prompt from loaded data
                    this.generatePrompt();
                    
                    console.log("Character loaded successfully");
                } catch (error) {
                    console.error("Error parsing character file:", error);
                    this.showError("Failed to parse character file: " + error.message);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error("Error loading character:", error);
            this.showError("Failed to load character: " + error.message);
        }
    }

    /**
     * Shows an error message to the user
     * @param {string} message - The error message to show
     */
    showError(message) {
        console.error(message);
        
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            // If there's no error element, show an alert
            alert(message);
        }
    }

    /**
     * Gets all the current form values
     * @returns {Object} An object containing all form values
     */
    getFormValues() {
        try {
            const formData = {};
            
            // Add default values for all properties that might cause toLowerCase() errors
            const defaults = {
                gender: "character",
                visual_heritage: "",
                age: "",
                build: "",
                height: "",
                skin_tone: "",
                skin_texture: "",
                head_shape: "",
                face_shape: "",
                forehead: "",
                jawline: "",
                cheekbones: "",
                eyes: { shape: "", modifiers: [] },
                eye_color: "",
                eyebrows: { shape: "", modifiers: [] },
                nose: { shape: "", modifiers: [] },
                mouth: "",
                lips: "",
                facial_hair: "None",
                hair_texture: "",
                hair_density: "",
                hair_volume: "",
                hair_length: "",
                hair_color: { color_group: "Not Applicable", specific_shade: "" },
                hair_parting: "Not Applicable",
                bangs_fringe: "None",
                tails_and_buns: "None",
                hair_style: "",
                hair_style_modifiers: []
            };
            
            // Get all form inputs from the hbs-form
            const formElements = document.querySelectorAll('#hbs-form select, #hbs-form input');
            if (!formElements || formElements.length === 0) {
                console.warn("No form elements found");
                return defaults; // Return defaults if no form elements
            }
            
            // Process each form element
            formElements.forEach(element => {
                if (!element || !element.name || element.name === "") return;
                
                // Handle different input types
                if (element.type === 'select-one') {
                    formData[element.name] = element.value || "";
                } else if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else {
                    formData[element.name] = element.value || "";
                }
            });
            
            // Special handling for complex objects
            try {
                // Eyes
                const eyeShape = document.querySelector('select[name="eye_shape"]');
                const eyeModifiers = Array.from(
                    document.querySelectorAll('input[name="eye_modifiers"]:checked') || []
                ).map(el => el.value);
                if (eyeShape) {
                    formData.eyes = {
                        shape: eyeShape.value || "",
                        modifiers: eyeModifiers || []
                    };
                } else {
                    formData.eyes = { shape: "", modifiers: [] };
                }
                
                // Eyebrows
                const eyebrowShape = document.querySelector('select[name="eyebrow_shape"]');
                const eyebrowModifiers = Array.from(
                    document.querySelectorAll('input[name="eyebrow_modifiers"]:checked') || []
                ).map(el => el.value);
                if (eyebrowShape) {
                    formData.eyebrows = {
                        shape: eyebrowShape.value || "",
                        modifiers: eyebrowModifiers || []
                    };
                } else {
                    formData.eyebrows = { shape: "", modifiers: [] };
                }
                
                // Nose
                const noseShape = document.querySelector('select[name="nose_shape"]');
                const noseModifiers = Array.from(
                    document.querySelectorAll('input[name="nose_modifiers"]:checked') || []
                ).map(el => el.value);
                if (noseShape) {
                    formData.nose = {
                        shape: noseShape.value || "",
                        modifiers: noseModifiers || []
                    };
                } else {
                    formData.nose = { shape: "", modifiers: [] };
                }
            } catch (e) {
                console.error("Error processing complex form elements:", e);
                // Set defaults for these objects
                formData.eyes = { shape: "", modifiers: [] };
                formData.eyebrows = { shape: "", modifiers: [] };
                formData.nose = { shape: "", modifiers: [] };
            }
            
            // Hair color - with better error handling
            try {
                const colorGroup = document.querySelector('select[name="hair_color_group"]');
                const specificShade = document.querySelector('select[name="hair_color_shade"]');
                
                if (colorGroup) {
                    formData.hair_color = {
                        color_group: colorGroup.value || "Not Applicable",
                        specific_shade: specificShade ? (specificShade.value || "") : ""
                    };
                } else {
                    formData.hair_color = {
                        color_group: "Not Applicable",
                        specific_shade: ""
                    };
                }
            } catch (e) {
                console.error("Error processing hair color data:", e);
                formData.hair_color = {
                    color_group: "Not Applicable",
                    specific_shade: ""
                };
            }
            
            // Hair style modifiers
            try {
                const hairStyleModifiers = Array.from(
                    document.querySelectorAll('input[name="hair_style_modifiers"]:checked') || []
                ).map(el => el.value);
                formData.hair_style_modifiers = hairStyleModifiers || [];
            } catch (e) {
                console.error("Error processing hair style modifiers:", e);
                formData.hair_style_modifiers = [];
            }
            
            // Apply defaults for any missing properties
            Object.keys(defaults).forEach(key => {
                if (formData[key] === undefined) {
                    formData[key] = defaults[key];
                }
            });
            
            return formData;
        } catch (error) {
            console.error("Error getting form values:", error);
            // Return a comprehensive default object to prevent undefined errors
            return {
                gender: "character",
                visual_heritage: "",
                age: "",
                build: "",
                height: "",
                skin_tone: "",
                skin_texture: "",
                head_shape: "",
                face_shape: "",
                forehead: "",
                jawline: "",
                cheekbones: "",
                eyes: { shape: "", modifiers: [] },
                eye_color: "",
                eyebrows: { shape: "", modifiers: [] },
                nose: { shape: "", modifiers: [] },
                mouth: "",
                lips: "",
                facial_hair: "None",
                hair_texture: "",
                hair_density: "",
                hair_volume: "",
                hair_length: "",
                hair_color: { color_group: "Not Applicable", specific_shade: "" },
                hair_parting: "Not Applicable",
                bangs_fringe: "None",
                tails_and_buns: "None",
                hair_style: "",
                hair_style_modifiers: []
            };
        }
    }
}

// Export the web app
if (typeof module !== 'undefined') {
    module.exports = { HBSWebApp };
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hbsApp = new HBSWebApp();
    console.log("HBS Web App instance created");
});
