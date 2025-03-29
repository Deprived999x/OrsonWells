/**
 * HBS Form Generator
 * Generates form elements from the HBS schema
 */
class HBSFormGenerator {
    constructor(schema) {
        // Ensure there's always a valid schema object
        this.schema = schema || {
            t2i_parameters: {
                properties: {}
            },
            gender_conditional_options: {
                female_build_options: [],
                male_build_options: []
            },
            hair_color_options: {}
        };
        
        // Debug schema structure to help diagnose issues
        console.log("Schema structure:", Object.keys(this.schema));
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
            console.error(`Error generating form: ${error.message}`, error);
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
        
        try {
            // Safely access schema properties
            const genderOptions = this.getEnumValuesOrDefault('gender', ['Identify as male', 'Identify as female']);
            const heritageOptions = this.getEnumValuesOrDefault('visual_heritage', 
                ['European Heritage', 'African Heritage', 'East Asian Heritage', 'South Asian Heritage', 
                'Southeast Asian Heritage', 'Latino Heritage', 'Custom Heritage']);
            const ageOptions = this.getEnumValuesOrDefault('age', 
                ['Pre-adolescent Child', 'Teenage Years', 'Youthful Adult Appearance', 
                'Mature Adult Features', 'Middle-aged Characteristics', 'Elderly Senior Traits']);
            const heightOptions = this.getEnumValuesOrDefault('height', 
                ['Very Short', 'Short', 'Average', 'Tall', 'Very Tall']);
            
            // Gender selection
            const genderGroup = this.createFormGroup('gender', 'Gender');
            const genderSelect = this.createSelectElement('gender', genderOptions);
            genderGroup.appendChild(genderSelect);
            fieldset.appendChild(genderGroup);
            
            // Visual heritage selection
            const heritageGroup = this.createFormGroup('visual_heritage', 'Visual Heritage');
            const heritageSelect = this.createSelectElement('visual_heritage', heritageOptions);
            heritageGroup.appendChild(heritageSelect);
            fieldset.appendChild(heritageGroup);
            
            // Age selection
            const ageGroup = this.createFormGroup('age', 'Age Group');
            const ageSelect = this.createSelectElement('age', ageOptions);
            ageGroup.appendChild(ageSelect);
            fieldset.appendChild(ageGroup);
            
            // Build selection (will be populated based on gender)
            const buildGroup = this.createFormGroup('build', 'Physical Build');
            const buildSelect = this.createSelectElement('build', []);
            buildGroup.appendChild(buildSelect);
            fieldset.appendChild(buildGroup);
            
            // Height* ▋
