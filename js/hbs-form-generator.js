/**
 * Generates a text-to-image prompt from Human Builder System parameters
 * 
 * @param {Object} characterData - The complete character data object
 * @param {Object} options - Additional options for prompt generation
 * @returns {String} The generated prompt string
 */
function generateT2IPrompt(characterData, options = {}) {
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
      identity = "child"; // Override the gender+ethnicity with just "child"
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
    const eyeShape = params.eyes.shape.toLowerCase();
    const eyeModifiers = params.eyes.modifiers && params.eyes.modifiers.length > 0 
      ? params.eyes.modifiers.map(m => m.toLowerCase()).join(" ") + " "
      : "";
    promptParts.push(`${eyeModifiers}${eyeShape} ${params.eye_color.toLowerCase()} eyes`);
    
    // Add eyebrows if distinctive
    if (params.eyebrows.modifiers && params.eyebrows.modifiers.length > 0) {
      const eyebrowDesc = params.eyebrows.modifiers.map(m => m.toLowerCase()).join(" ") + " " + params.eyebrows.shape.toLowerCase();
      promptParts.push(`${eyebrowDesc} eyebrows`);
    }
    
    // Add nose if distinctive
    if (params.nose.shape !== "Straight" || (params.nose.modifiers && params.nose.modifiers.length > 0)) {
      let noseDesc = params.nose.shape.toLowerCase() + " nose";
      if (params.nose.modifiers && params.nose.modifiers.length > 0) {
        noseDesc = params.nose.modifiers.map(m => m.toLowerCase()).join(" ") + " " + noseDesc;
      }
      promptParts.push(noseDesc);
    }
    
    // Add mouth and lips
    if (params.lips !== "Medium") {
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
      if (params.hair_volume !== "Medium Volume") {
        let volumeDesc = params.hair_volume.replace(" Volume", "").toLowerCase();
        hairDesc += volumeDesc + " volume ";
      }
      
      // Add texture
      hairDesc += params.hair_texture.toLowerCase() + " ";
    }
    
    // Add color
    if (params.hair_color.color_group !== "Not Applicable") {
      hairDesc += params.hair_color.specific_shade.toLowerCase() + " ";
    }
    
    // Add "hair" word
    hairDesc += "hair";
    
    // Add style specifics if distinctive
    if (params.hair_style !== "Loose Natural") {
      hairDesc += " in " + params.hair_style.toLowerCase() + " style";
    }
    
    // Add tails and buns if specified (NEW SECTION)
    if (params.tails_and_buns && params.tails_and_buns !== "None") {
      hairDesc += ` with ${params.tails_and_buns.toLowerCase()}`;
    }
    
    // Add modifiers
    if (params.hair_style_modifiers && params.hair_style_modifiers.length > 0) {
      hairDesc += ", " + params.hair_style_modifiers.map(m => m.toLowerCase()).join(" ");
    }
