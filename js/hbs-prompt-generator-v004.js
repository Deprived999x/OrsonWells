/**
 * Generates a text-to-image prompt from Human Builder System parameters
 * 
 * @param {Object} characterData - The complete character data object
 * @param {Object} options - Additional options for prompt generation
 * @returns {String} The generated prompt string
 */
function generateT2IPrompt(characterData, options = {}) {
  if (typeof characterData !== 'object' || typeof options !== 'object') {
    throw new Error('Invalid input types for characterData or options');
  }

  const {
    includeDetails = true,
    stylePrefix = "",
    styleSuffix = ""
  } = options;

  // Handle case where t2i_parameters might be missing
  const params = characterData.t2i_parameters || {};
  const promptParts = [];

  // Add style prefix if provided
  if (stylePrefix) {
    promptParts.push(stylePrefix);
  }

  // Core identity description - with safety checks for missing values
  let identity = "person";
  if (params.gender === "Identify as female") {
    identity = "woman";
  } else if (params.gender === "Identify as male") {
    identity = "man";
  }

  // Add visual heritage if not custom and if it exists
  if (params.visual_heritage && params.visual_heritage !== "Custom Heritage") {
    const heritage = params.visual_heritage.replace(" Heritage", "");
    identity = `${heritage} ${identity}`;
  }

  // Add age
  let ageDescription = "";
  if (params.age) {
    switch (params.age) {
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
  }

  // Combine identity elements
  if (ageDescription) {
    promptParts.push(`${ageDescription} ${identity}`);
  } else {
    promptParts.push(identity);
  }

  // Add build and height if adult and if they exist
  if (params.age !== "Pre-adolescent Child" && params.build) {
    promptParts.push(`with ${(params.build || "").replace("-Female", "").replace("-Male", "")} build`);

    if (params.height && params.height !== "Average") {
      promptParts.push((params.height || "").toLowerCase() + " height");
    }
  }

  // Add skin details if they exist
  if (params.skin_tone) {
    promptParts.push(`with ${params.skin_tone.toLowerCase()} skin`);
  }

  if (includeDetails) {
    // Add facial structure if it exists
    if (params.face_shape) {
      promptParts.push(`${params.face_shape.toLowerCase()} face`);
    }

    // Add eye details with safety checks
    if (params.eyes && params.eyes.shape) {
      const eyeShape = params.eyes.shape.toLowerCase();
      let eyeModifiers = "";
      if (params.eyes.modifiers && Array.isArray(params.eyes.modifiers) && params.eyes.modifiers.length > 0) {
        eyeModifiers = params.eyes.modifiers.map(m => m.toLowerCase()).join(" ") + " ";
      }
      
      if (params.eye_color) {
        promptParts.push(`${eyeModifiers}${eyeShape} ${params.eye_color.toLowerCase()} eyes`);
      } else {
        promptParts.push(`${eyeModifiers}${eyeShape} eyes`);
      }
    }

    // Add eyebrows if distinctive and if they exist
    if (params.eyebrows && params.eyebrows.shape && 
        params.eyebrows.modifiers && Array.isArray(params.eyebrows.modifiers) && 
        params.eyebrows.modifiers.length > 0) {
      const eyebrowDesc = params.eyebrows.modifiers.map(m => m.toLowerCase()).join(" ") + " " + 
                         params.eyebrows.shape.toLowerCase();
      promptParts.push(`${eyebrowDesc} eyebrows`);
    }

    // Add nose if distinctive and if it exists
    if (params.nose && params.nose.shape) {
      if (params.nose.shape !== "Straight" || 
          (params.nose.modifiers && Array.isArray(params.nose.modifiers) && params.nose.modifiers.length > 0)) {
        let noseDesc = params.nose.shape.toLowerCase() + " nose";
        if (params.nose.modifiers && Array.isArray(params.nose.modifiers) && params.nose.modifiers.length > 0) {
          noseDesc = params.nose.modifiers.map(m => m.toLowerCase()).join(" ") + " " + noseDesc;
        }
        promptParts.push(noseDesc);
      }
    }

    // Add mouth and lips if they exist
    if (params.lips && params.lips !== "Medium") {
      promptParts.push(`${params.lips.toLowerCase()} lips`);
    }

    // Add facial hair for male characters if it exists
    if (params.facial_hair && params.facial_hair !== "None" && params.facial_hair !== "Clean Shaven") {
      promptParts.push(params.facial_hair.toLowerCase());
    }
  }

  // Add hair details if not bald and if it exists
  if (params.hair_style && params.hair_style !== "Bald") {
    let hairDesc = "";

    // Add length, volume, and texture if not very short and if they exist
    if (params.hair_length && params.hair_length !== "Buzz Cut") {
      if (params.hair_length && params.hair_length !== "Shoulder Length") { // Skip if average/default length
        hairDesc += params.hair_length.toLowerCase() + " ";
      }

      // Add volume if distinctive and if it exists
      if (params.hair_volume && params.hair_volume !== "Medium Volume") {
        let volumeDesc = params.hair_volume.replace(" Volume", "").toLowerCase();
        hairDesc += volumeDesc + " volume ";
      }

      // Add texture if it exists
      if (params.hair_texture) {
        hairDesc += params.hair_texture.toLowerCase() + " ";
      }
    }

    // Add color if it exists
    if (params.hair_color && params.hair_color.color_group && 
        params.hair_color.color_group !== "Not Applicable" && 
        params.hair_color.specific_shade) {
      hairDesc += params.hair_color.specific_shade.toLowerCase() + " ";
    }

    // Add "hair" word
    hairDesc += "hair";

    // Add style specifics if distinctive and if they exist
    if (params.hair_style && params.hair_style !== "Loose Natural") {
      hairDesc += " in " + params.hair_style.toLowerCase() + " style";
    }

    // Add tails and buns if specified and if they exist
    if (params.tails_and_buns && params.tails_and_buns !== "None") {
      hairDesc += ` with ${params.tails_and_buns.toLowerCase()}`;
    }

    // Add modifiers if they exist
    if (params.hair_style_modifiers && Array.isArray(params.hair_style_modifiers) && 
        params.hair_style_modifiers.length > 0) {
      hairDesc += ", " + params.hair_style_modifiers.map(m => m.toLowerCase()).join(" ");
    }

    // Add bangs if they exist
    if (params.bangs_fringe && params.bangs_fringe !== "None" && params.bangs_fringe !== "Not Applicable") {
      hairDesc += ` with ${params.bangs_fringe.toLowerCase()}`;
    }

    promptParts.push(hairDesc);
  } else if (params.hair_style === "Bald") {
    promptParts.push("bald");
  }

  // Add style suffix if provided
  if (styleSuffix) {
    promptParts.push(styleSuffix);
  }

  // Combine all parts into a single prompt
  return promptParts.join(", ");
}

// Export the function for both browser and Node.js environments
if (typeof module !== 'undefined') {
    module.exports = generateT2IPrompt;
} else {
    // Make available globally in browser
    window.generateT2IPrompt = generateT2IPrompt;
}
