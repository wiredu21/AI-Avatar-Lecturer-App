// Map of university IDs to names
export const universityIdMap = {
  1: "University of Northampton",
  2: "University of Oxford",
  3: "University of Cambridge",
  4: "Imperial College London",
  5: "University College London",
  6: "London School of Economics",
  7: "University of Edinburgh",
  8: "University of Manchester",
  9: "University of Bristol",
  10: "University of Warwick",
  11: "University of Glasgow"
};

// Map of university keys to names (from Settings component)
export const universityKeyMap = {
  "northampton": "University of Northampton",
  "oxford": "University of Oxford",
  "cambridge": "University of Cambridge",
  "imperial": "Imperial College London",
  "ucl": "University College London",
  "lse": "London School of Economics",
  "edinburgh": "University of Edinburgh",
  "manchester": "University of Manchester",
  "bristol": "University of Bristol",
  "warwick": "University of Warwick",
  "glasgow": "University of Glasgow"
};

/**
 * Get university name from any university identifier format
 * @param {*} universityValue - Can be numeric ID, string key, or object with name property
 * @returns {string} The university name or default value
 */
export function getUniversityName(universityValue, defaultName = "University not set") {
  if (!universityValue) return defaultName;
  
  // Handle object with name property
  if (typeof universityValue === 'object' && universityValue.name) {
    return universityValue.name;
  }
  
  // Handle numeric IDs
  if (typeof universityValue === 'number' || !isNaN(parseInt(universityValue))) {
    const id = typeof universityValue === 'number' ? universityValue : parseInt(universityValue);
    return universityIdMap[id] || defaultName;
  }
  
  // Handle string keys
  if (typeof universityValue === 'string') {
    return universityKeyMap[universityValue] || universityValue;
  }
  
  return defaultName;
} 