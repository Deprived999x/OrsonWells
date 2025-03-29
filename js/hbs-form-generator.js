/**
 * HBS Form Generator
 * Generates form elements from the HBS schema
 */
class HBSFormGenerator {
    constructor(schema) {
        this.schema = schema;
    }

    /**
     * Generates the complete form based on the schema
     * @param {string} targetElementId - ID of the element to insert form into
     */
    generateForm(targetElementId) {
        const formContainer = document.getElementById(targetElementId);
        if (!formContainer) {
            console.error(`Target element with ID '${targetElementId}' not found`);
            return;
        }

        // Clear existing content
        formContainer.innerHTML = '';
        
        try {
            // Generate core identity section
            this.generateIdentitySection(formContainer);
            
            // Generate appearance sections
            this.generateFacialFeaturesSection(formContainer);
            this.generateHairSection(formContainer);
            
            // Add submit button
            const submitBtn = document.createElement('button');
            submitBtn.type = 'button';
            submitBtn.id = 'generate-prompt-btn';
            submitBtn.className = 'generate-btn';
            submitBtn.textContent = 'Generate Prompt';
            formContainer.appendChild(submitBtn);
            
            console.log("Form generated successfully");
        } catch (error) {
            console.error("Error generating form:", error);
            formContainer.innerHTML = '<p>Error generating form. Please check console for details.</p>';
        }
    }

    /**
     * Generates the core identity section (gender, heritage, age, etc.)
     * @param {HTMLElement} container - Container element
     */
    generateIdentitySection(container) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = '<legend>Core Identity</legend>';
        
        // Gender selection
        const genderGroup = this.createFormGroup('gender', 'Gender');
        const genderSelect = this.createSelectElement('gender', this.schema.t2i_parameters.properties.gender.enum);
        genderGroup.appendChild(genderSelect);
        fieldset.appendChild(genderGroup);
        
        // Visual heritage selection
        const heritageGroup = this.createFormGroup('visual_heritage', 'Visual Heritage');
        const heritageSelect = this.createSelectElement('visual_heritage', this.schema.t2i_parameters.properties.visual_heritage.enum);
        heritageGroup.appendChild(heritageSelect);
        fieldset.appendChild(heritageGroup);
        
        // Age selection
        const ageGroup = this.createFormGroup('age', 'Age Group');
        const ageSelect = this.createSelectElement('age', this.schema.t2i_parameters.properties.age.enum);
        ageGroup.appendChild(ageSelect);
        fieldset.appendChild(ageGroup);
        
        // Build selection (will be populated based on gender)
        const buildGroup = this.createFormGroup('build', 'Physical Build');
        const buildSelect = this.createSelectElement('build', []);
        buildGroup.appendChild(buildSelect);
        fieldset.appendChild(buildGroup);
        
        // Height selection
        const heightGroup = this.createFormGroup('height', 'Height');
        const heightSelect = this.createSelectElement('height', this.schema.t2i_parameters.properties.height.enum);
        heightGroup.appendChild(heightSelect);
        fieldset.appendChild(heightGroup);
        
        // Add event listener to update build options when gender changes
        genderSelect.addEventListener('change', () => {
            this.updateBuildOptions(genderSelect.value, buildSelect);
        });
        
        // Trigger initial build options population
        setTimeout(() => {
            this.updateBuildOptions(genderSelect.value, buildSelect);
        }, 0);
        
        container.appendChild(fieldset);
    }

    /**
     * Updates build options based on selected gender
     * @param {string} gender - Selected gender value
     * @param {HTMLSelectElement} buildSelect - Build selection element
     */
    updateBuildOptions(gender, buildSelect) {
        // Clear existing options
        buildSelect.innerHTML = '';
        
        // Get appropriate options based on gender
        let options = [];
        try {
            options = gender === 'Identify as female' 
                ? this.schema.gender_conditional_options.female_build_options
                : this.schema.gender_conditional_options.male_build_options;
                
            // Fallback if options aren't found
            if (!options || !Array.isArray(options) || options.length === 0) {
                console.warn("No build options found for gender:", gender);
                options = ["Default build"];
            }
        } catch (error) {
            console.error("Error getting build options:", error);
            options = ["Error loading options"];
        }
        
        // Add options to select
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option.replace('-Female', '').replace('-Male', '');
            buildSelect.appendChild(optElement);
        });
    }

    /**
     * Generates facial features section
     * @param {HTMLElement} container - Container element
     */
    generateFacialFeaturesSection(container) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = '<legend>Facial Features</legend>';
        
        // Face shape
        const faceShapeGroup = this.createFormGroup('face_shape', 'Face Shape');
        const faceShapeSelect = this.createSelectElement('face_shape', this.schema.t2i_parameters.properties.face_shape.enum);
        faceShapeGroup.appendChild(faceShapeSelect);
        fieldset.appendChild(faceShapeGroup);
        
        // Eye shape & modifiers
        const eyeFieldset = document.createElement('fieldset');
        eyeFieldset.className = 'sub-fieldset';
        eyeFieldset.innerHTML = '<legend>Eyes</legend>';
        
        const eyeShapeGroup = this.createFormGroup('eye_shape', 'Eye Shape');
        eyeShapeGroup.className = 'sub-form-group';
        const eyeShapeSelect = document.createElement('select');
        eyeShapeSelect.id = 'eye_shape';
        eyeShapeSelect.name = 'eye_shape';
        eyeFieldset.appendChild(eyeShapeGroup);
        eyeShapeGroup.appendChild(eyeShapeSelect);
        
        // Add color select
        const eyeColorGroup = this.createFormGroup('eye_color', 'Eye Color');
        eyeColorGroup.className = 'sub-form-group';
        const eyeColorSelect = this.createSelectElement('eye_color', this.schema.t2i_parameters.properties.eye_color.enum);
        eyeColorGroup.appendChild(eyeColorSelect);
        eyeFieldset.appendChild(eyeColorGroup);
        
        // Add eye modifiers
        const eyeModifiersGroup = document.createElement('div');
        eyeModifiersGroup.className = 'modifiers-group';
        eyeModifiersGroup.innerHTML = '<label>Eye Modifiers</label>';
        
        const eyeModifiersFieldset = document.createElement('fieldset');
        eyeModifiersFieldset.className = 'modifiers';
        
        const eyeModifiers = this.schema.t2i_parameters.properties.eyes.properties.modifiers.items.enum;
        eyeModifiers.forEach(modifier => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `eye_modifier_${modifier}`;
            checkbox.name = 'eye_modifiers';
            checkbox.value = modifier;
            
            const label = document.createElement('label');
            label.htmlFor = `eye_modifier_${modifier}`;
            label.textContent = modifier;
            
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            eyeModifiersFieldset.appendChild(wrapper);
        });
        
        eyeModifiersGroup.appendChild(eyeModifiersFieldset);
        eyeFieldset.appendChild(eyeModifiersGroup);
        fieldset.appendChild(eyeFieldset);
        
        container.appendChild(fieldset);
    }

    /**
     * Generates hair section
     * @param {HTMLElement} container - Container element
     */
    generateHairSection(container) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = '<legend>Hair</legend>';
        
        // Hair style selection
        const styleGroup = this.createFormGroup('hair_style', 'Hair Style');
        const styleSelect = this.createSelectElement('hair_style', this.schema.t2i_parameters.properties.hair_style.enum);
        styleGroup.appendChild(styleSelect);
        fieldset.appendChild(styleGroup);
        
        // Hair length selection
        const lengthGroup = this.createFormGroup('hair_length', 'Hair Length');
        const lengthSelect = this.createSelectElement('hair_length', this.schema.t2i_parameters.properties.hair_length.enum);
        lengthGroup.appendChild(lengthSelect);
        fieldset.appendChild(lengthGroup);
        
        // Hair color group
        const colorFieldset = document.createElement('fieldset');
        colorFieldset.className = 'sub-fieldset';
        colorFieldset.innerHTML = '<legend>Hair Color</legend>';
        
        const colorGroupGroup = this.createFormGroup('hair_color_group', 'Color Group');
        colorGroupGroup.className = 'sub-form-group';
        
        const colorOptions = ['Not Applicable', 'Blonde', 'Red', 'Brown', 'Black', 'Gray/White'];
        const colorGroupSelect = this.createSelectElement('hair_color_group', colorOptions);
        colorGroupGroup.appendChild(colorGroupSelect);
        colorFieldset.appendChild(colorGroupGroup);
        
        // Hair color shade (to be populated based on color group)
        const shadeGroup = this.createFormGroup('hair_color_shade', 'Specific Shade');
        shadeGroup.className = 'sub-form-group';
        const shadeSelect = this.createSelectElement('hair_color_shade', []);
        shadeGroup.appendChild(shadeSelect);
        colorFieldset.appendChild(shadeGroup);
        
        // Update hair shade options when color group changes
        colorGroupSelect.addEventListener('change', () => {
            this.updateHairShadeOptions(colorGroupSelect.value, shadeSelect);
        });
        
        fieldset.appendChild(colorFieldset);
        container.appendChild(fieldset);
        
        // Trigger initial shade options population
        setTimeout(() => {
            this.updateHairShadeOptions(colorGroupSelect.value, shadeSelect);
        }, 0);
    }

    /**
     * Updates hair shade options based on selected color group
     * @param {string} colorGroup - Selected color group
     * @param {HTMLSelectElement} shadeSelect - Shade selection element
     */
    updateHairShadeOptions(colorGroup, shadeSelect) {
        // Clear existing options
        shadeSelect.innerHTML = '';
        
        if (colorGroup === 'Not Applicable') {
            shadeSelect.disabled = true;
            return;
        }
        
        shadeSelect.disabled = false;
        
        // Get appropriate options based on color group
        let options = [];
        switch (colorGroup) {
            case 'Blonde':
                options = this.schema.hair_color_options.blonde_shades;
                break;
            case 'Red':
                options = this.schema.hair_color_options.red_shades;
                break;
            case 'Brown':
                options = this.schema.hair_color_options.brown_shades;
                break;
            case 'Black':
                options = this.schema.hair_color_options.black_shades;
                break;
            case 'Gray/White':
                options = this.schema.hair_color_options.gray_white_shades;
                break;
        }
        
        // Add options to select
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            shadeSelect.appendChild(optElement);
        });
    }

    /**
     * Creates a form group with label
     * @param {string} id - Input ID
     * @param {string} labelText - Label text
     * @returns {HTMLDivElement} Form group element
     */
    createFormGroup(id, labelText) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        
        group.appendChild(label);
        return group;
    }

    /**
     * Creates a select element with options
     * @param {string} id - Select element ID
     * @param {Array<string>} options - Options for select
     * @returns {HTMLSelectElement} Select element
     */
    createSelectElement(id, options) {
        const select = document.createElement('select');
        select.id = id;
        select.name = id;
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            select.appendChild(optElement);
        });
        
        return select;
    }
}

// Make available globally in browser
window.HBSFormGenerator = HBSFormGenerator;

// Initialize form when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // First try to use schema from HBS App if it exists
    if (window.hbsApp && window.hbsApp.schema) {
        try {
            const formGenerator = new HBSFormGenerator(window.hbsApp.schema);
            formGenerator.generateForm('hbs-form');
        } catch (error) {
            console.error('Error initializing form generator:', error);
        }
    } else {
        // Otherwise, fetch the schema directly
        fetch('schema/hbs-schema-v004.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch schema: ${response.status}`);
                }
                return response.json();
            })
            .then(schema => {
                const formGenerator = new HBSFormGenerator(schema);
                formGenerator.generateForm('hbs-form');
            })
            .catch(error => {
                console.error('Error fetching schema for form generator:', error);
                document.getElementById('hbs-form').innerHTML = 
                    '<p>Error loading form. Please check console for details.</p>';
            });
    }
});
