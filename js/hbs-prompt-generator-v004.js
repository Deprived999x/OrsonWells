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

  // Build the prompt in the correct parameter order

  // Core identity information
  // 1. Gender, 2. Visual heritage, 3. Age
  let identity = "person";
  if (params.gender === "Identify as female") {
    identity = "woman";
  } else if (params.gender === "Identify as male") {
    identity = "man";
  }

  if (params.visual_heritage && params.visual_heritage !== "Custom Heritage") {
    const heritage = params.visual_heritage.replace(" Heritage", "");
    identity = `${heritage} ${identity}`;
  }

  let ageDescription = "";
  if (params.age) {
    switch (params.age) {
      case "Pre-adolescent Child":
        identity = "child";
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

  if (ageDescription) {
    promptParts.push(`${ageDescription} ${identity}`);
  } else {
    promptParts.push(identity);
  }

  // Physical attributes
  // 4. Build, 5. Height
  if (params.age !== "Pre-adolescent Child" && params.build) {
    promptParts.push(`with ${(params.build || "").replace("-Female", "").replace("-Male", "")} build`);

    if (params.height && params.height !== "Average") {
      promptParts.push((params.height || "").toLowerCase() + " height");
    }
  }

  // Skin appearance
  // 6. Skin tone, 7. Skin texture
  if (params.skin_tone) {
    promptParts.push(`with ${params.skin_tone.toLowerCase()} skin`);
    
    if (params.skin_texture && params.skin_texture !== "Normal Textured") {
      promptParts.push(`with ${params.skin_texture.toLowerCase()} texture`);
    }
  }

  if (includeDetails) {
    // Face structure
    // 8. Head shape, 9. Face shape, 10. Forehead, 11. Jawline, 12. Cheekbones
    let faceDescription = [];
    
    if (params.face_shape) {
      faceDescription.push(`${params.face_shape.toLowerCase()} face`);
    }
    
    if (params.forehead) {
      faceDescription.push(`${params.forehead.toLowerCase()} forehead`);
    }
    
    if (params.jawline) {
      faceDescription.push(`${params.jawline.toLowerCase()} jawline`);
    }
    
    if (params.cheekbones) {
      faceDescription.push(`${params.cheekbones.toLowerCase()} cheekbones`);
    }
    
    if (faceDescription.length > 0) {
      promptParts.push(faceDescription.join(", "));
    }

    // Facial features
    // 13. Eyes (shape, modifiers), 14. Eye color, 15. Eyebrows (shape, modifiers)
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

    if (params.eyebrows && params.eyebrows.shape && 
        params.eyebrows.modifiers && Array.isArray(params.eyebrows.modifiers) && 
        params.eyebrows.modifiers.length > 0) {
      const eyebrowDesc = params.eyebrows.modifiers.map(m => m.toLowerCase()).join(" ") + " " + 
                         params.eyebrows.shape.toLowerCase();
      promptParts.push(`${eyebrowDesc} eyebrows`);
    }

    // 16. Nose (shape, modifiers)
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

    // 17. Mouth, 18. Lips
    if (params.lips && params.lips !== "Medium") {
      promptParts.push(`${params.lips.toLowerCase()} lips`);
    }

    // 19. Facial hair
    if (params.facial_hair && params.facial_hair !== "None" && params.facial_hair !== "Clean Shaven") {
      promptParts.push(params.facial_hair.toLowerCase());
    }
  }

  // Hair attributes (all 9 remaining parameters)
  // 20. Hair texture, 21. Hair density, 22. Hair volume, 23. Hair length
  // 24. Hair color, 25. Hair parting, 26. Bangs/fringe
  // 27. Tails and buns, 28. Hair style, plus Hair style modifiers
  if (params.hair_style && params.hair_style !== "Bald") {
    let hairDesc = [];
    
    if (params.hair_texture) {
      hairDesc.push(params.hair_texture.toLowerCase());
    }
    
    if (params.hair_density && params.hair_density !== "Medium Density") {
      hairDesc.push(params.hair_density.toLowerCase());
    }
    
    if (params.hair_volume && params.hair_volume !== "Medium Volume") {
      hairDesc.push(params.hair_volume.toLowerCase());
    }
    
    if (params.hair_length && params.hair_length !== "Shoulder Length") {
      hairDesc.push(params.hair_length.toLowerCase());
    }
    
    if (params.hair_color?.color_group && 
        params.hair_color.color_group !== "Not Applicable" && 
        params.hair_color.specific_shade) {
      hairDesc.push(params.hair_color.specific_shade.toLowerCase());
    }
    
    if (hairDesc.length > 0) {
      promptParts.push(`${hairDesc.join(" ")} hair`);
    } else {
      promptParts.push("hair");
    }
    
    let hairDetails = [];
    
    if (params.hair_style && params.hair_style !== "Loose Natural") {
      hairDetails.push(`in ${params.hair_style.toLowerCase()} style`);
    }
    
    if (params.hair_parting && params.hair_parting !== "Not Applicable" && params.hair_parting !== "No Part") {
      hairDetails.push(`with ${params.hair_parting.toLowerCase()}`);
    }
    
    if (params.bangs_fringe && params.bangs_fringe !== "None" && params.bangs_fringe !== "Not Applicable") {
      hairDetails.push(`with ${params.bangs_fringe.toLowerCase()}`);
    }
    
    if (params.tails_and_buns && params.tails_and_buns !== "None") {
      hairDetails.push(`with ${params.tails_and_buns.toLowerCase()}`);
    }
    
    if (params.hair_style_modifiers && Array.isArray(params.hair_style_modifiers) && 
        params.hair_style_modifiers.length > 0) {
      hairDetails.push(params.hair_style_modifiers.map(m => m.toLowerCase()).join(" "));
    }
    
    if (hairDetails.length > 0) {
      promptParts.push(hairDetails.join(", "));
    }
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
