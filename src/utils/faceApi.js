// src/utils/faceApi.js
// Utility functions for Face ID operations using face-api.js

export const loadModels = async () => {
  const MODEL_URL = '/models';
  
  try {
    if (!window.faceapi) {
      throw new Error("face-api.js not loaded. Please ensure the CDN script is in index.html");
    }
    
    // Check if models are already loaded to avoid redundant network calls
    if (window.faceapi.nets.ssdMobilenetv1.isLoaded &&
        window.faceapi.nets.faceLandmark68Net.isLoaded &&
        window.faceapi.nets.faceRecognitionNet.isLoaded) {
      return true;
    }

    await Promise.all([
      window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    return true;
  } catch (error) {
    console.error("Error loading face-api models:", error);
    return false;
  }
};

/**
 * Extracts the face descriptor from a video element
 * @param {HTMLVideoElement} videoEl 
 * @returns {Float32Array | null}
 */
export const getFaceDescriptor = async (videoEl) => {
  try {
    const detection = await window.faceapi
      .detectSingleFace(videoEl, new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    if (!detection) return null;
    return detection.descriptor;
  } catch (err) {
    console.error("Error getting face descriptor:", err);
    return null;
  }
};

/**
 * Saves a face descriptor to localStorage with a given ID
 * @param {string} id User ID (e.g. student_id)
 * @param {Float32Array} descriptor 
 */
export const saveFaceData = (id, descriptor) => {
  const data = JSON.parse(localStorage.getItem('face_id_data') || '{}');
  // Float32Array must be converted to regular Array for JSON stringification
  data[id] = Array.from(descriptor);
  localStorage.setItem('face_id_data', JSON.stringify(data));
};

/**
 * Retrieves all stored face descriptors as a FaceMatcher
 * @returns {window.faceapi.FaceMatcher | null}
 */
export const getFaceMatcher = () => {
  const rawData = localStorage.getItem('face_id_data');
  if (!rawData) return null;
  
  const data = JSON.parse(rawData);
  const labeledDescriptors = [];
  
  for (const id in data) {
    // Convert regular Array back to Float32Array
    const descriptorArray = new Float32Array(data[id]);
    const labeledDescriptor = new window.faceapi.LabeledFaceDescriptors(id, [descriptorArray]);
    labeledDescriptors.push(labeledDescriptor);
  }
  
  if (labeledDescriptors.length === 0) return null;
  
  // Use a threshold of 0.55 for matching (default is 0.6)
  return new window.faceapi.FaceMatcher(labeledDescriptors, 0.55);
};
