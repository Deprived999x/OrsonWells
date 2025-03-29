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

// Example usage
/*
const characterData = {
  "metadata": {
    "version": "v004",
    "character_name": "Sofia Mendez",
    "timestamp": "2025-03-28T15:30:00Z"
  },
  "t2i_parameters": {
    "gender": "Identify as female",
    "visual_heritage": "Latino Heritage",
    "skin_tone": "Sun-Kissed Tan",
    "skin_texture": "Fine-Pored",
    "age": "Youthful Adult Appearance",
    "build": "Athletic-Female",
    "height": "Average",
    "head_shape": "Oval",
    "face_shape": "Heart",
    "forehead": "Gentle Rounded",
    "jawline": "Tapered Heart",
    "cheekbones": "High-and-Prominent",
    "eyes": {
      "shape": "Almond",
      "modifiers": ["Upturned"]
    },
    "eye_color": "Brown",
    "eyebrows": {
      "shape": "Arched",
      "modifiers": ["Groomed", "Tapered"]
    },
    "nose": {
      "shape": "Straight",
      "modifiers": ["Narrow-bridge"]
    },
    "mouth": "Medium",
    "lips": "Full",
    "facial_hair": "None",
    "hair_texture": "Wavy",
    "hair_density": "Thick Density",
    "hair_volume": "High Volume",
    "hair_length": "Shoulder Length",
    "hair_color": {
      "color_group": "Brown",
      "specific_shade": "Deep Brown"
    },
    "hair_parting": "Side Part",
    "bangs_fringe": "Side-Swept Bangs",
    "tails_and_buns": "High Ponytail",
    "hair_style": "Loose Natural",
    "hair_style_modifiers": ["Shiny"]
  }
};

const options = {
  includeDetails: true,
  stylePrefix: "professional portrait photo of a",
  styleSuffix: "high resolution, detailed features, soft natural lighting"
};

const prompt = generateT2IPrompt(characterData, options);
console.log(prompt);
// Result: "professional portrait photo of a young adult Latino woman with athletic build, with sun-kissed tan skin, heart face, upturned almond brown eyes, groomed tapered arched eyebrows, narro[...]
*/

// Export the function for both browser and Node.js environments
if (typeof module !== 'undefined') {
    module.exports = generateT2IPrompt;
} else {
    // Make available globally in browser
    window.generateT2IPrompt = generateT2IPrompt;
}
