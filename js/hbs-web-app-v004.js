/**
 * Web app implementation of the Human Builder System
 */
class HBSWebApp {
  constructor() {
    this.schema = null;
    this.characterData = {
      metadata: {
        version: "v004",
        character_name: "",
        timestamp: new Date().toISOString()
      },
      t2i_parameters: {}
    };
    this.formContainer = document.getElementById('hbs-form');
    this.promptOutput = document.getElementById('prompt-output');
    this.previewImage = document.getElementById('preview-image');
    
    this.loadSchema()
      .then(() => {
        this.initializeForm();
        this.bindEvents();
      })
      .catch(error => {
        console.error('Error loading schema:', error);
      });
  }
  
  /**
   * Load the HBS schema
   */
  async loadSchema() {
    try {
      const response = await fetch('schema/hbs-schema-v004.json');
      this.schema = await response.json();
    } catch (error) {
      console.error('Error loading schema:', error);
      throw error;
    }
  }
  
  /**
   * Generate form elements based on schema
   */
  initializeForm() {
    if (!this.schema) return;
    
    // Create sections
    this.createSection('Core Identity Parameters', [
      'gender', 'visual_heritage', 'age'
    ]);
    
    this.createSection('Body Structure Parameters', [
      'build', 'height', 'skin_tone', 'skin_texture'
    ]);
    
    this.createSection('Facial Structure Parameters', [
      'head_shape', 'face_shape', 'forehead', 'jawline', 'cheekbones'
    ]);
    
    this.createSection('Facial Feature Parameters', [
      'eyes', 'eye_color', 'eyebrows', 'nose', 'mouth', 'lips', 'facial_hair'
    ]);
    
    this.createSection('Hair Parameters', [
      'hair_texture', 'hair_density', 'hair_volume', 'hair_length',
      'hair_color', 'hair_parting', 'bangs_fringe', 'tails_and_buns', 'hair_style'
    ]);
    
    // Initialize with default values
    this.setDefaultValues();
  }
  
  /**
   * Create a form section with multiple parameters
   */
  createSection(title, parameterNames) {
    const section = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = title;
    section.appendChild(legend);
    
    parameterNames.forEach(paramName => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      formGroup.dataset.parameter = paramName;
      
      const label = document.createElement('label');
      label.textContent = this.formatLabel(paramName);
      label.setAttribute('for', `hbs-${paramName}`);
      formGroup.appendChild(label);
      
      // Create appropriate form element based on parameter type
      switch(paramName) {
        case 'build':
        case 'forehead':
        case 'jawline':
        case 'cheekbones':
        case 'mouth':
        case 'lips':
          // Gender-conditional fields
          this.createGenderConditionalField(formGroup, paramName);
          break;
          
        case 'eyes':
        case 'eyebrows':
        case 'nose':
          // Complex fields with shape and modifiers
          this.createComplexField(formGroup, paramName);
          break;
          
        case 'hair_color':
          // Hair color has a two-level selection
          this.createHairColorField(formGroup, paramName);
          break;
          
        case 'tails_and_buns':
          // Tails and Buns is conditionally displayed based on hair length
          this.createTailsAndBunsField(formGroup, paramName);
          break;
          
        case 'hair_style':
          // Hair style depends on length
          this.createHairStyleField(formGroup, paramName);
          break;
          
        default:
          // Standard field
          this.createStandardField(formGroup, paramName);
          break;
      }
      
      section.appendChild(formGroup);
    });
    
    this.formContainer.appendChild(section);
  }
  
  /**
   * Create a field with options that change based on gender
   */
  createGenderConditionalField(formGroup, paramName) {
    const select = document.createElement('select');
    select.id = `hbs-${paramName}`;
    select.name = paramName;
    select.className = 'gender-conditional';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    select.appendChild(emptyOption);
    
    // Options will be populated when gender is selected
    formGroup.appendChild(select);
    
    // Add change event
    select.addEventListener('change', () => {
      this.updateCharacterData(paramName, select.value);
      this.generatePreview();
    });
  }
  
  /**
   * Create a complex field with shape and modifiers
   */
  createComplexField(formGroup, paramName) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'sub-fieldset';
    
    // Shape select
    const shapeGroup = document.createElement('div');
    shapeGroup.className = 'sub-form-group';
    
    const shapeLabel = document.createElement('label');
    shapeLabel.textContent = 'Shape';
    shapeLabel.setAttribute('for', `hbs-${paramName}-shape`);
    shapeGroup.appendChild(shapeLabel);
    
    const shapeSelect = document.createElement('select');
    shapeSelect.id = `hbs-${paramName}-shape`;
    shapeSelect.name = `${paramName}_shape`;
    shapeSelect.className = 'gender-conditional';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    shapeSelect.appendChild(emptyOption);
    
    shapeGroup.appendChild(shapeSelect);
    fieldset.appendChild(shapeGroup);
    
    // Modifiers checkboxes
    const modifiersGroup = document.createElement('div');
    modifiersGroup.className = 'modifiers-group';
    
    const modifiersLabel = document.createElement('label');
    modifiersLabel.textContent = 'Modifiers';
    modifiersGroup.appendChild(modifiersLabel);
    
    const modifiersFieldset = document.createElement('fieldset');
    modifiersFieldset.className = 'modifiers';
    modifiersFieldset.id = `hbs-${paramName}-modifiers`;
    
    // Will be populated later
    modifiersGroup.appendChild(modifiersFieldset);
    fieldset.appendChild(modifiersGroup);
    
    formGroup.appendChild(fieldset);
    
    // Add change event for shape
    shapeSelect.addEventListener('change', () => {
      const complexData = this.characterData.t2i_parameters[paramName] || {};
      complexData.shape = shapeSelect.value;
      this.updateCharacterData(paramName, complexData);
      this.generatePreview();
    });
  }
  
  /**
   * Create hair color field with color group and specific shade
   */
  createHairColorField(formGroup, paramName) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'sub-fieldset';
    
    // Color group select
    const colorGroupDiv = document.createElement('div');
    colorGroupDiv.className = 'sub-form-group';
    
    const groupLabel = document.createElement('label');
    groupLabel.textContent = 'Color Group';
    groupLabel.setAttribute('for', 'hbs-hair-color-group');
    colorGroupDiv.appendChild(groupLabel);
    
    const groupSelect = document.createElement('select');
    groupSelect.id = 'hbs-hair-color-group';
    groupSelect.name = 'hair_color_group';
    
    // Add color group options
    ['Blonde', 'Red', 'Brown', 'Black', 'Gray/White', 'Not Applicable'].forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      groupSelect.appendChild(option);
    });
    
    colorGroupDiv.appendChild(groupSelect);
    fieldset.appendChild(colorGroupDiv);
    
    // Specific shade select
    const shadeDiv = document.createElement('div');
    shadeDiv.className = 'sub-form-group';
    
    const shadeLabel = document.createElement('label');
    shadeLabel.textContent = 'Specific Shade';
    shadeLabel.setAttribute('for', 'hbs-hair-color-shade');
    shadeDiv.appendChild(shadeLabel);
    
    const shadeSelect = document.createElement('select');
    shadeSelect.id = 'hbs-hair-color-shade';
    shadeSelect.name = 'hair_color_shade';
    
    shadeDiv.appendChild(shadeSelect);
    fieldset.appendChild(shadeDiv);
    
    formGroup.appendChild(fieldset);
    
    // Add change event for color group
    groupSelect.addEventListener('change', () => {
      const group = groupSelect.value;
      this.populateHairShades(shadeSelect, group);
      
      const colorData = this.characterData.t2i_parameters.hair_color || {};
      colorData.color_group = group;
      this.updateCharacterData('hair_color', colorData);
      this.generatePreview();
    });
    
    // Add change event for shade
    shadeSelect.addEventListener('change', () => {
      const colorData = this.characterData.t2i_parameters.hair_color || {};
      colorData.specific_shade = shadeSelect.value;
      this.updateCharacterData('hair_color', colorData);
      this.generatePreview();
    });
  }
  
  /**
   * Create tails and buns field with hair length dependency
   */
  createTailsAndBunsField(formGroup, paramName) {
    const select = document.createElement('select');
    select.id = `hbs-${paramName}`;
    select.name = paramName;
    select.className = 'length-conditional';
    select.disabled = true; // Initially disabled
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = 'None';
    emptyOption.textContent = 'None';
    select.appendChild(emptyOption);
    
    // Options will be populated based on hair length
    formGroup.appendChild(select);
    
    // Add description about hair length requirement
    const helpText = document.createElement('p');
    helpText.className = 'helper-text';
    helpText.textContent = 'Requires hair length of at least shoulder length.';
    formGroup.appendChild(helpText);
    
    // Add change event
    select.addEventListener('change', () => {
      this.updateCharacterData(paramName, select.value);
      this.generatePreview();
    });
  }
  
  /**
   * Create hair style field with modifiers
   */
  createHairStyleField(formGroup, paramName) {
    const select = document.createElement('select');
    select.id = `hbs-${paramName}`;
    select.name = paramName;
    select.className = 'length-conditional';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    select.appendChild(emptyOption);
    
    // Will be populated based on hair length
    formGroup.appendChild(select);
    
    // Hair style modifiers
    const modifiersGroup = document.createElement('div');
    modifiersGroup.className = 'modifiers-group';
    
    const modifiersLabel = document.createElement('label');
    modifiersLabel.textContent = 'Style Modifiers';
    modifiersGroup.appendChild(modifiersLabel);
    
    const modifiersFieldset = document.createElement('fieldset');
    modifiersFieldset.className = 'modifiers';
    modifiersFieldset.id = 'hbs-hair-style-modifiers';
    
    // Add modifiers checkboxes
    ['Messy', 'Neatly Styled', 'Windblown', 'Wet Look', 'Shiny', 'Matte'].forEach(modifier => {
      const div = document.createElement('div');
      div.className = 'checkbox-wrapper';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `hbs-hair-modifier-${this.slugify(modifier)}`;
      checkbox.name = 'hair_style_modifiers';
      checkbox.value = modifier;
      
      const label = document.createElement('label');
      label.textContent = modifier;
      label.setAttribute('for', checkbox.id);
      
      div.appendChild(checkbox);
      div.appendChild(label);
      modifiersFieldset.appendChild(div);
    });
    
    modifiersGroup.appendChild(modifiersFieldset);
    formGroup.appendChild(modifiersGroup);
    
    // Add change event for style
    select.addEventListener('change', () => {
      this.updateCharacterData(paramName, select.value);
      
      // Update modifiers availability based on selection
      this.updateHairModifiersAvailability(select.value, modifiersFieldset);
      
      this.generatePreview();
    });
    
    // Add change events for modifiers
    modifiersFieldset.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.updateModifiers('hair_style_modifiers', modifiersFieldset);
        
        // Check for mutual exclusivity
        if (e.target.value === "Messy" && e.target.checked) {
          const neatlyStyledCheckbox = document.getElementById('hbs-hair-modifier-neatly-styled');
          if (neatlyStyledCheckbox.checked) {
            neatlyStyledCheckbox.checked = false;
            this.updateModifiers('hair_style_modifiers', modifiersFieldset);
          }
        } else if (e.target.value === "Neatly Styled" && e.target.checked) {
          const messyCheckbox = document.getElementById('hbs-hair-modifier-messy');
          if (messyCheckbox.checked) {
            messyCheckbox.checked = false;
            this.updateModifiers('hair_style_modifiers', modifiersFieldset);
          }
        }
        
        this.generatePreview();
      }
    });
  }
  
  /**
   * Create a standard field with fixed options
   */
  createStandardField(formGroup, paramName) {
    const select = document.createElement('select');
    select.id = `hbs-${paramName}`;
    select.name = paramName;
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    select.appendChild(emptyOption);
    
    // Add options based on parameter
    switch(paramName) {
      case 'gender':
        ['Identify as female', 'Identify as male'].forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          select.appendChild(optionElement);
        });
        break;
        
      case 'visual_heritage':
        ['European Heritage', 'African Heritage', 'East Asian Heritage', 'South Asian Heritage', 'Southeast Asian Heritage', 'Latino Heritage', 'Custom Heritage'].forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          select.appendChild(optionElement);
        });
        break;
        
      case 'age':
        ['Pre-adolescent Child', 'Teenage Years', 'Youthful Adult Appearance', 'Mature Adult Features', 'Middle-aged Characteristics', 'Elderly Senior Traits'].forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          select.appendChild(optionElement);
        });
        break;
        
      case 'hair_length':
        ['Buzz Cut', 'Ear Length', 'Chin Length', 'Shoulder Length', 'Mid-Back Length', 'Waist Length', 'Hip Length'].forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          select.appendChild(optionElement);
        });
        break;
        
      // Add other standard parameters as needed
    }
    
    formGroup.appendChild(select);
    
    // Add change event
    select.addEventListener('change', () => {
      this.updateCharacterData(paramName, select.value);
      
      // Special handling for parameters that affect other fields
      if (paramName === 'gender') {
        this.updateGenderConditionalFields(select.value);
      } else if (paramName === 'hair_length') {
        this.updateHairLengthDependentFields(select.value);
      }
      
      this.generatePreview();
    });
  }
  
  /**
   * Set default values for the form
   */
  setDefaultValues() {
    // Set gender first since other fields depend on it
    document.getElementById('hbs-gender').value = 'Identify as female';
    this.updateCharacterData('gender', 'Identify as female');
    
    // Update conditional fields
    this.updateGenderConditionalFields('Identify as female');
  }
  
  /**
   * Update fields that depend on gender selection
   */
  updateGenderConditionalFields(gender) {
    // Update build options
    const buildSelect = document.getElementById('hbs-build');
    this.clearSelect(buildSelect);
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    buildSelect.appendChild(emptyOption);
    
    // Add build options based on gender
    if (gender === 'Identify as female') {
      ['Slender-Female', 'Rectangle-Female', 'Inverted-Triangle-Female', 'Athletic-Female',
       'Pear-Female', 'Hourglass-Female', 'Apple-Female', 'Curvy-Female', 'Stocky-Female',
       'Plus-Size-Female'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option.replace('-Female', '');
        buildSelect.appendChild(optionElement);
      });
    } else {
      ['Lean-Male', 'Rectangle-Male', 'Athletic-Male', 'Hourglass-Male', 'V-Shaped-Male',
       'Muscular-Male', 'Stocky-Male', 'Endomorph-Male', 'Heavyset-Male'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option.replace('-Male', '');
        buildSelect.appendChild(optionElement);
      });
    }
    
    // Update other gender-conditional fields
    // This would include forehead, jawline, cheekbones, eyes, eyebrows, nose, mouth, lips
    
    // Special handling for facial hair
    const facialHairSelect = document.getElementById('hbs-facial_hair');
    if (facialHairSelect) {
      this.clearSelect(facialHairSelect);
      
      if (gender === 'Identify as female') {
        const noneOption = document.createElement('option');
        noneOption.value = 'None';
        noneOption.textContent = 'None';
        facialHairSelect.appendChild(noneOption);
        facialHairSelect.value = 'None';
        facialHairSelect.disabled = true;
        this.updateCharacterData('facial_hair', 'None');
      } else {
        facialHairSelect.disabled = false;
        
        ['Clean Shaven', 'Light Stubble', 'Heavy Stubble', 'Mustache', 'Goatee',
         'Short Beard', 'Full Beard', 'Long Beard'].forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          facialHairSelect.appendChild(optionElement);
        });
      }
    }
  }
  
  /**
   * Update fields that depend on hair length
   */
  updateHairLengthDependentFields(length) {
    // Update Tails and Buns field
    const tailsAndBunsSelect = document.getElementById('hbs-tails_and_buns');
    this.clearSelect(tailsAndBunsSelect);
    
    // Add default None option
    const noneOption = document.createElement('option');
    noneOption.value = 'None';
    noneOption.textContent = 'None';
    tailsAndBunsSelect.appendChild(noneOption);
    
    // Enable/disable based on length
    if (['Shoulder Length', 'Mid-Back Length', 'Waist Length', 'Hip Length'].includes(length)) {
      tailsAndBunsSelect.disabled = false;
      
      // Add tails and buns options
      ['Ponytail', 'High Ponytail', 'Low Ponytail', 'Side Ponytail', 'Pigtails',
       'Bun', 'Classic Bun', 'Messy Bun', 'Top Knot', 'Chignon'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        tailsAndBunsSelect.appendChild(optionElement);
      });
    } else {
      tailsAndBunsSelect.disabled = true;
      tailsAndBunsSelect.value = 'None';
      this.updateCharacterData('tails_and_buns', 'None');
    }
    
    // Update Hair Style field
    const hairStyleSelect = document.getElementById('hbs-hair_style');
    this.clearSelect(hairStyleSelect);
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    hairStyleSelect.appendChild(emptyOption);
    
    // Add options based on length
    if (length === 'Buzz Cut') {
      ['Buzz Cut', 'Bald'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        hairStyleSelect.appendChild(optionElement);
      });
    } else if (length === 'Ear Length') {
      ['Loose Natural', 'Pixie Cut', 'Undercut', 'Pompadour', 'Bald'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        hairStyleSelect.appendChild(optionElement);
      });
    } else if (length === 'Chin Length') {
      ['Loose Natural', 'Bob Cut', 'Braided', 'Bald'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        hairStyleSelect.appendChild(optionElement);
      });
    } else {
      ['Loose Natural', 'Braided', 'Bald'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        hairStyleSelect.appendChild(optionElement);
      });
    }
  }
  
  /**
   * Update hair modifiers availability based on hair style
   */
  updateHairModifiersAvailability(hairStyle, modifiersFieldset) {
    const checkboxes = modifiersFieldset.querySelectorAll('input[type="checkbox"]');
    
    if (hairStyle === 'Bald') {
      // Disable all modifiers for bald style
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = true;
      });
      this.updateCharacterData('hair_style_modifiers', []);
    } else {
      // Enable all modifiers
      checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
    }
  }
  
  /**
   * Populate hair shades based on selected color group
   */
  populateHairShades(shadeSelect, colorGroup) {
    this.clearSelect(shadeSelect);
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select...';
    shadeSelect.appendChild(emptyOption);
    
    if (colorGroup === 'Not Applicable') {
      shadeSelect.disabled = true;
      return;
    }
    
    shadeSelect.disabled = false;
    
    // Add shades based on color group
    let shades = [];
    switch(colorGroup) {
      case 'Blonde':
        shades = ['Light Blonde', 'Golden Blonde', 'Strawberry Blonde', 
                  'Medium Blonde', 'Ash Blonde', 'Dark Blonde'];
        break;
      case 'Red':
        shades = ['Bright Red', 'Auburn', 'Deep Red'];
        break;
      case 'Brown':
        shades = ['Light Brown', 'Golden Brown', 'Ash Brown', 
                  'Medium Brown', 'Deep Brown'];
        break;
      case 'Black':
        shades = ['Soft Black', 'Deep Black'];
        break;
      case 'Gray/White':
        shades = ['White', 'Gray', 'Salt and Pepper'];
        break;
    }
    
    shades.forEach(shade => {
      const option = document.createElement('option');
      option.value = shade;
      option.textContent = shade;
      shadeSelect.appendChild(option);
    });
  }
  
  /**
   * Update character data for modifier checkboxes
   */
  updateModifiers(paramName, fieldset) {
    const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]:checked');
    const selectedModifiers = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    // Handle special case for parameters with shape+modifiers structure
    if (paramName.includes('-')) {
      const parts = paramName.split('-');
      const mainParam = parts[0];
      
      const complexData = this.characterData.t2i_parameters[mainParam] || {};
      complexData.modifiers = selectedModifiers;
      this.updateCharacterData(mainParam, complexData);
    } else {
      this.updateCharacterData(paramName, selectedModifiers);
    }
  }
  
  /**
   * Update the character data object
   */
  updateCharacterData(paramName, value) {
    this.characterData.t2i_parameters[paramName] = value;
    
    // Check for exclusion rules
    this.applyExclusionRules(paramName, value);
  }
  
  /**
   * Apply exclusion rules based on parameter changes
   */
  applyExclusionRules(paramName, value) {
    // Handle hair style = Bald
    if (paramName === 'hair_style' && value === 'Bald') {
      // Disable hair color, parting, and bangs
      document.getElementById('hbs-hair-color-group').value = 'Not Applicable';
      this.characterData.t2i_parameters.hair_color = {
        color_group: 'Not Applicable',
        specific_shade: ''
      };
      
      const hairPartingSelect = document.getElementById('hbs-hair_parting');
      if (hairPartingSelect) {
        hairPartingSelect.value = 'Not Applicable';
        this.characterData.t2i_parameters.hair_parting = 'Not Applicable';
      }
      
      const bangsFringeSelect = document.getElementById('hbs-bangs_fringe');
      if (bangsFringeSelect) {
        bangsFringeSelect.value = 'Not Applicable';
        this.characterData.t2i_parameters.bangs_fringe = 'Not Applicable';
      }
    }
    
    // Add more exclusion rules as needed
  }
  
  /**
   * Generate the T2I prompt from character data
   */
  generatePrompt() {
    // Get style settings
    const stylePrefix = document.getElementById('style-prefix').value;
    const styleSuffix = document.getElementById('style-suffix').value;
    const includeDetails = document.getElementById('include-details').checked;
    
    const options = {
      includeDetails,
      stylePrefix,
      styleSuffix
    };
    
    try {
      const prompt = this.constructPrompt(this.characterData, options);
      this.promptOutput.textContent = prompt;
      
      // Update timestamp
      this.characterData.metadata.timestamp = new Date().toISOString();
      
      // Enable save button
      document.getElementById('save-btn').disabled = false;
    } catch (error) {
      console.error('Error generating prompt:', error);
      this.promptOutput.textContent = 'Error generating prompt. Please check form values.';
    }
  }
  
  /**
   * Generate a preview of the character (simplified prompt)
   */
  generatePreview() {
    // Only generate preview if enough data is available
    const params = this.characterData.t2i_parameters;
    if (!params.gender || !params.visual_heritage || !params.age) {
      return;
    }
    
    try {
      const options = {
        includeDetails: false,
        stylePrefix: "",
        styleSuffix: ""
      };
      
      const previewPrompt = this.constructPrompt(this.characterData, options);
      document.getElementById('preview-prompt').textContent = previewPrompt;
      
      // In a real implementation, you might call your T2I API here
      // this.generatePreviewImage(previewPrompt);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }
  
  /**
   * Construct a text-to-image prompt from character data
   */
  constructPrompt(characterData, options = {}) {
    const {
      includeDetails = true,
      stylePrefix = "",
      styleSuffix = "",
    } = options;
    
    const params = characterData.t2i_parameters;
    let promptParts = [];
    
    // Add style prefix if provided
    if (stylePrefix) {
      promptParts.push(stylePrefix);
    }
    
    // Core identity description
    let identity = `${params.gender === "Identify as female" ? "woman" : "man"}`;
    
    // Add visual heritage if not custom
    if (params.visual_heritage !== "Custom Heritage") {
      const heritage = params.visual_heritage.replace(" Heritage", "");
      identity = `${heritage} ${identity}`;
    }
    
    // Add age
    let ageDescription = "";
    switch(params.age) {
      case "Pre-adolescent Child":
        identity = "child"; // Override gender+ethnicity with just "child"
        ageDescription = "young";
        break;
      case "Teenage Years":
        ageDescription = "teenage";
        break;
      case "Youthful Adult Appearance":
        ageDescription = "young adult";
        break;
      case "Mature Adult Features":
        ageDescription = "adult";
        break;
      case "Middle-aged Characteristics":
        ageDescription = "middle-aged";
        break;
      case "Elderly Senior Traits":
        ageDescription = "elderly";
        break;
    }
    
    // Combine identity elements
    if (ageDescription) {
      promptParts.push(`${ageDescription} ${identity}`);
    } else {
      promptParts.push(identity);
    }
    
    // Add build and height if adult
    if (params.age !== "Pre-adolescent Child") {
      promptParts.push(`with ${params.build.replace("-Female", "").replace("-Male", "")} build`);
      
      if (params.height !== "Average") {
        promptParts.push(params.height.toLowerCase() + " height");
      }
    }
    
    // Add skin details
    promptParts.push(`with ${params.skin_tone.toLowerCase()} skin`);
    
    if (includeDetails) {
      // Add facial structure
      promptParts.push(`${params.face_shape.toLowerCase()} face`);
      
      // Add eye details
      if (params.eyes && params.eyes.shape) {
        const eyeShape = params.eyes.shape.toLowerCase();
        const eyeModifiers = params.eyes.modifiers && params.eyes.modifiers.length > 0 
          ? params.eyes.modifiers.map(m => m.toLowerCase()).join(" ") + " "
          : "";
        promptParts.push(`${eyeModifiers}${eyeShape} ${params.eye_color.toLowerCase()} eyes`);
      }
      
      // Add eyebrows if distinctive
      if (params.eyebrows && params.eyebrows.modifiers && params.eyebrows.modifiers.length > 0) {
        const eyebrowDesc = params.eyebrows.modifiers.map(m => m.toLowerCase()).join(" ") + " " + params.eyebrows.shape.toLowerCase();
        promptParts.push(`${eyebrowDesc} eyebrows`);
      }
      
      // Add nose if distinctive
      if (params.nose && params.nose.shape && 
         (params.nose.shape !== "Straight" || (params.nose.modifiers && params.nose.modifiers.length > 0))) {
        let noseDesc = params.nose.shape.toLowerCase() + " nose";
        if (params.nose.modifiers && params.nose.modifiers.length > 0) {
          noseDesc = params.nose.modifiers.map(m => m.toLowerCase()).join(" ") + " " + noseDesc;
        }
        promptParts.push(noseDesc);
      }
      
      // Add mouth and lips
      if (params.lips && params.lips !== "Medium") {
        promptParts.push(`${params.lips.toLowerCase()} lips`);
      }
      
      // Add facial hair for male characters
      if (params.facial_hair && params.facial_hair !== "None" && params.facial_hair !== "Clean Shaven") {
        promptParts.push(params.facial_hair.toLowerCase());
      }
    }
    
    // Add hair details
    if (params.hair_style !== "Bald") {
      let hairDesc = "";
      
      // Add length, volume, and texture if not very short
      if (params.hair_length !== "Buzz Cut") {
        if (params.hair_length !== "Shoulder Length") { // Skip if average/default length
          hairDesc += params.hair_length.toLowerCase() + " ";
        }
        
        // Add volume if distinctive
        if (params.hair_volume && params.hair_volume !== "Medium Volume") {
          let volumeDesc = params.hair_volume.replace(" Volume", "").toLowerCase();
          hairDesc += volumeDesc + " volume ";
        }
        
        // Add texture
        if (params.hair_texture) {
          hairDesc += params.hair_texture.toLowerCase() + " ";
        }
      }
      
      // Add color
      if (params.hair_color && params.hair_color.color_group !== "Not Applicable") {
        hairDesc += params.hair_color.specific_shade.toLowerCase() + " ";
      }
      
      // Add "hair" word
      hairDesc += "hair";
      
      // Add style specifics
      if (params.hair_style && params.hair_style !== "Loose Natural") {
        hairDesc += " in " + params.hair_style.toLowerCase() + " style";
      }
      
      // Add tails and buns if specified (this is the updated part)
      if (params.tails_and_buns && params.tails_and_buns !== "None") {
        hairDesc += ` with ${params.tails_and_buns.toLowerCase()}`;
      }
      
      // Add modifiers
      if (params.hair_style_modifiers && params.hair_style_modifiers.length > 0) {
        hairDesc += ", " + params.hair_style_modifiers.map(m => m.toLowerCase()).join(" ");
      }
      
      // Add bangs
      if (params.bangs_fringe && params.bangs_fringe !== "None" && params.bangs_fringe !== "Not Applicable") {
        hairDesc += ` with ${params.bangs_fringe.toLowerCase()}`;
      }
      
      promptParts.push(hairDesc);
    } else {
      promptParts.push("bald");
    }
    
    // Add style suffix if provided
    if (styleSuffix) {
      promptParts.push(styleSuffix);
    }
    
    // Combine all parts into a single prompt
    return promptParts.join(", ");
  }
  
  /**
   * Reset the form to defaults
   */
  resetForm() {
    // Clear character data
    this.characterData = {
      metadata: {
        version: "v004",
        character_name: "",
        timestamp: new Date().toISOString()
      },
      t2i_parameters: {}
    };
    
    // Reset form fields
    this.formContainer.querySelectorAll('select').forEach(select => {
      select.value = '';
    });
    
    this.formContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    document.getElementById('character-name').value = '';
    document.getElementById('style-prefix').value = '';
    document.getElementById('style-suffix').value = '';
    document.getElementById('include-details').checked = true;
    
    // Clear output
    this.promptOutput.textContent = '';
    document.getElementById('preview-prompt').textContent = '';
    
    // Reset to defaults
    this.setDefaultValues();
  }
  
  /**
   * Save character data
   */
  saveCharacter() {
    const characterName = document.getElementById('character-name').value || 'unnamed-character';
    this.characterData.metadata.character_name = characterName;
    
    // Convert to JSON and create blob
    const jsonData = JSON.stringify(this.characterData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${characterName.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  /**
   * Load character data from file
   */
  loadCharacter(file) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const characterData = JSON.parse(event.target.result);
        
        // Validate data
        if (!characterData.metadata || !characterData.t2i_parameters) {
          throw new Error('Invalid character data format');
        }
        
        // Update character data
        this.characterData = characterData;
        
        // Update form fields
        this.populateFormFromCharacterData();
        
        // Update preview
        this.generatePreview();
        
        // Update character name
        document.getElementById('character-name').value = characterData.metadata.character_name || '';
      } catch (error) {
        console.error('Error loading character data:', error);
        alert('Error loading character data: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Populate form fields from loaded character data
   */
  populateFormFromCharacterData() {
    const params = this.characterData.t2i_parameters;
    
    // Set each field value
    Object.entries(params).forEach(([paramName, value]) => {
      const element = document.getElementById(`hbs-${paramName}`);
      
      if (!element) return;
      
      if (element.tagName === 'SELECT') {
        element.value = value;
        
        // Handle special cases for gender and hair length
        if (paramName === 'gender') {
          this.updateGenderConditionalFields(value);
        } else if (paramName === 'hair_length') {
          this.updateHairLengthDependentFields(value);
        }
      } else if (paramName.endsWith('_modifiers') && Array.isArray(value)) {
        // Handle modifier checkboxes
        const modifierFieldset = document.getElementById(`hbs-${paramName}`);
        if (modifierFieldset) {
          const checkboxes = modifierFieldset.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            checkbox.checked = value.includes(checkbox.value);
          });
        }
      } else if (typeof value === 'object') {
        // Handle complex objects like eyes, eyebrows, nose
        if (value.shape) {
          const shapeElement = document.getElementById(`hbs-${paramName}-shape`);
          if (shapeElement) {
            shapeElement.value = value.shape;
          }
        }
        
        if (value.modifiers && Array.isArray(value.modifiers)) {
          const modifiersFieldset = document.getElementById(`hbs-${paramName}-modifiers`);
          if (modifiersFieldset) {
            const checkboxes = modifiersFieldset.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.checked = value.modifiers.includes(checkbox.value);
            });
          }
        }
        
        // Handle hair color
        if (paramName === 'hair_color' && value.color_group) {
          const groupSelect = document.getElementById('hbs-hair-color-group');
          const shadeSelect = document.getElementById('hbs-hair-color-shade');
          
          if (groupSelect && shadeSelect) {
            groupSelect.value = value.color_group;
            this.populateHairShades(shadeSelect, value.color_group);
            shadeSelect.value = value.specific_shade || '';
          }
        }
      }
    });
  }
  
  /**
   * Bind events for UI interactions
   */
  bindEvents() {
    // Generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
      this.generatePrompt();
    });
    
    // Save button
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveCharacter();
    });
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetForm();
    });
    
    // Load button
    document.getElementById('load-file').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.loadCharacter(e.target.files[0]);
      }
    });
    
    // Character name field
    document.getElementById('character-name').addEventListener('input', (e) => {
      this.characterData.metadata.character_name = e.target.value;
    });
  }
  
  // Utility methods
  
  /**
   * Format parameter name as readable label
   */
  formatLabel(paramName) {
    return paramName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Convert string to slug format
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  /**
   * Clear all options from a select element
   */
  clearSelect(select) {
    if (!select) return;
    
    while (select.options.length > 0) {
      select.remove(0);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.hbsApp = new HBSWebApp();
});
