/**
 * HBS Web Application
 * Handles user interactions and generates character previews
 */
class HBSWebApp {
    constructor() {
        this.validator = new HBSValidator(hbsSchema);
        // Load the debug helper if available
        this.debug = (typeof HBSDebugHelper !== 'undefined') ? HBSDebugHelper : null;
    }

    /**
     * Constructs the prompt text based on the current form values
     * @returns {string} The constructed prompt text
     */
    constructPrompt() {
        let promptText = "";
        try {
            // Get form values
            const formValues = this.getFormValues();
            
            // Safety check to prevent accessing replace on undefined values
            if (!formValues) {
                console.error("Form values are undefined");
                return "Error: Unable to construct prompt from undefined form values";
            }
            
            // Start with basic description
            promptText = `A ${formValues.gender || 'character'}`;
            
            // Add heritage if selected
            if (formValues.visual_heritage && formValues.visual_heritage !== "Custom Heritage") {
                promptText += ` with ${formValues.visual_heritage}`;
            }
            
            // Add age
            if (formValues.age) {
                promptText += `, ${formValues.age}`;
            }
            
            // Add build and height if selected
            if (formValues.build) {
                promptText += `, ${formValues.build} build`;
            }
            
            if (formValues.height) {
                promptText += `, ${formValues.height} height`;
            }
            
            // Add skin details
            if (formValues.skin_tone) {
                promptText += `, with ${formValues.skin_tone}`;
                
                if (formValues.skin_texture) {
                    promptText += ` and ${formValues.skin_texture} skin texture`;
                }
            }
            
            // Add facial features
            let facialFeatures = [];
            
            if (formValues.head_shape) {
                facialFeatures.push(`${formValues.head_shape} head shape`);
            }
            
            if (formValues.face_shape) {
                facialFeatures.push(`${formValues.face_shape} face shape`);
            }
            
            if (formValues.forehead) {
                facialFeatures.push(`${formValues.forehead} forehead`);
            }
            
            // Add jawline if available
            if (formValues.jawline) {
                facialFeatures.push(`${formValues.jawline} jawline`);
            }
            
            // Add cheekbones if available
            if (formValues.cheekbones) {
                facialFeatures.push(`${formValues.cheekbones} cheekbones`);
            }
            
            // Add eyes details if available
            if (formValues.eyes && formValues.eyes.shape) {
                let eyeDesc = `${formValues.eyes.shape} eyes`;
                if (formValues.eyes.modifiers && Array.isArray(formValues.eyes.modifiers) && formValues.eyes.modifiers.length > 0) {
                    eyeDesc += ` (${formValues.eyes.modifiers.join(", ")})`;
                }
                facialFeatures.push(eyeDesc);
            }
            
            // Add eye color if available
            if (formValues.eye_color) {
                facialFeatures.push(`${formValues.eye_color} eye color`);
            }
            
            // Add eyebrows if available
            if (formValues.eyebrows && formValues.eyebrows.shape) {
                let eyebrowDesc = `${formValues.eyebrows.shape} eyebrows`;
                if (formValues.eyebrows.modifiers && Array.isArray(formValues.eyebrows.modifiers) && formValues.eyebrows.modifiers.length > 0) {
                    eyebrowDesc += ` (${formValues.eyebrows.modifiers.join(", ")})`;
                }
                facialFeatures.push(eyebrowDesc);
            }
            
            // Add nose if available
            if (formValues.nose && formValues.nose.shape) {
                let noseDesc = `${formValues.nose.shape} nose`;
                if (formValues.nose.modifiers && Array.isArray(formValues.nose.modifiers) && formValues.nose.modifiers.length > 0) {
                    noseDesc += ` (${formValues.nose.modifiers.join(", ")})`;
                }
                facialFeatures.push(noseDesc);
            }
            
            // Add mouth if available
            if (formValues.mouth) {
                facialFeatures.push(`${formValues.mouth} mouth`);
            }
            
            // Add lips if available
            if (formValues.lips) {
                facialFeatures.push(`${formValues.lips} lips`);
            }
            
            // Join facial features with commas
            if (facialFeatures.length > 0) {
                promptText += `, with ${facialFeatures.join(", ")}`;
            }
            
            // Add facial hair if available
            if (formValues.facial_hair && formValues.facial_hair !== "None" && formValues.facial_hair !== "Clean Shaven") {
                promptText += `, with ${formValues.facial_hair}`;
            }
            
            // Add hair details if not bald
            if (formValues.hair_style !== "Bald") {
                let hairDescription = "";
                
                // Handle hair color safely
                if (formValues.hair_color) {
                    const colorGroup = formValues.hair_color.color_group;
                    const specificShade = formValues.hair_color.specific_shade;
                    
                    if (colorGroup && specificShade && colorGroup !== "Not Applicable") {
                        hairDescription += `${specificShade} ${colorGroup} `;
                    }
                }
                
                // Handle hair texture safely
                if (formValues.hair_texture && typeof formValues.hair_texture === 'string') {
                    hairDescription += `${formValues.hair_texture.toLowerCase()} `;
                } else if (formValues.hair_texture) {
                    hairDescription += `${formValues.hair_texture} `;
                }
                
                // Handle hair length safely
                if (formValues.hair_length && typeof formValues.hair_length === 'string') {
                    hairDescription += `${formValues.hair_length.toLowerCase()} `;
                } else if (formValues.hair_length) {
                    hairDescription += `${formValues.hair_length} `;
                }
                
                // Only add hair description if we have at least some details
                if (hairDescription && hairDescription.trim() !== "") {
                    promptText += `, with ${hairDescription.trim()}hair`;
                }
                
                // Add hair style details
                if (formValues.hair_style && formValues.hair_style !== "Bald") {
                    promptText += `, styled in a ${formValues.hair_style}`;
                }
                
                // Add hair parting if applicable
                if (formValues.hair_parting && formValues.hair_parting !== "Not Applicable" && formValues.hair_parting !== "No Part") {
                    try {
                        // Use debug helper if available
                        if (this.debug) {
                            promptText += ` with a ${this.debug.safeStringMethod(formValues.hair_parting, 'toLowerCase', 'hair part')}`;
                        } else {
                            // Fall back to basic safety
                            if (typeof formValues.hair_parting === 'string') {
                                promptText += ` with a ${formValues.hair_parting.toLowerCase()}`;
                            } else {
                                promptText += ` with a hair part`;
                            }
                        }
                    } catch (e) {
                        console.error("Error processing hair parting:", e);
                        promptText += ` with a hair part`;
                    }
                }
                
                // Add bangs/fringe if applicable
                if (formValues.bangs_fringe && formValues.bangs_fringe !== "None" && formValues.bangs_fringe !== "Not Applicable") {
                    promptText += ` and ${formValues.bangs_fringe}`;
                }
                
                // Add tails and buns if applicable
                if (formValues.tails_and_buns && formValues.tails_and_buns !== "None") {
                    promptText += `, worn in a ${formValues.tails_and_buns}`;
                }
                
                // Add hair style modifiers if applicable
                if (formValues.hair_style_modifiers && Array.isArray(formValues.hair_style_modifiers) && formValues.hair_style_modifiers.length > 0) {
                    try {
                        const joinedModifiers = formValues.hair_style_modifiers.join(" and ");
                        if (typeof joinedModifiers === 'string') {
                            promptText += `, ${joinedModifiers.toLowerCase()}`;
                        } else {
                            promptText += `, ${joinedModifiers}`;
                        }
                    } catch (e) {
                        console.error("Error processing hair style modifiers:", e);
                    }
                }
            } else {
                promptText += ", bald";
            }
            
            return promptText;
        } catch (error) {
            console.error("Error constructing prompt:", error);
            // Return a safe default instead of the error message
            return "A character with default features";
        }
    }

    /**
     * Generates a preview of the character based on the current form values
     */
    generatePreview() {
        try {
            const formValues = this.getFormValues();
            
            if (!formValues) {
                console.error("Form values are undefined in generatePreview");
                this.showError("Unable to generate preview: Form values are undefined");
                return;
            }
            
            // Construct prompt text
            const promptText = this.constructPrompt();
            
            // Display the prompt in the preview area
            const previewArea = document.getElementById('preview-area');
            if (previewArea) {
                previewArea.textContent = promptText;
            } else {
                console.error("Preview area element not found");
            }
            
            // Add code here to send the prompt to an image generation API if needed
            
        } catch (error) {
            console.error("Error generating preview:", error);
            this.showError("Failed to generate preview: " + (error.message || "Unknown error"));
        }
    }

    /**
     * Shows an error message to the user
     * @param {string} message - The error message to show
     */
    showError(message) {
        // Add error display logic
        console.error(message);
        
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
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
            
            // Get all form inputs
            const formElements = document.querySelectorAll('#character-form select, #character-form input');
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
