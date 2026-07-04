// src/services/video/video-analyzer.js

class VideoAnalyzer {
  constructor() {
    this.visionLoaded = false;
    this.tfLoaded = false;
    this.activeTracker = null; // 'mediapipe' | 'tfjs' | null
    this.faceLandmarker = null;
    this.poseLandmarker = null;
    
    // TF.js Models
    this.tfFaceModel = null;
    this.tfPoseModel = null;

    // Metrics counters
    this.metrics = {
      framesCount: 0,
      faceDetectedCount: 0,
      eyeContactCount: 0,
      uprightPostureCount: 0,
      centeredCount: 0,
      goodLightingCount: 0,
      lookingAwayCount: 0,
      smileCount: 0,
      blinkCount: 0,
      totalYaw: 0,
      totalPitch: 0,
      totalShoulderTilt: 0,
      brightnessSum: 0,
    };

    // State thresholds
    this.isBlinking = false;
    this.lastBlinkTime = 0;
  }

  /**
   * Helper to load scripts dynamically.
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Loads MediaPipe vision bundle lazily.
   */
  async loadMediaPipe() {
    if (this.visionLoaded) return true;
    try {
      console.log("[VIDEO ANALYZER]: Loading MediaPipe tasks-vision CDN...");
      await this._loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.js");
      this.visionLoaded = true;
      this.activeTracker = "mediapipe";
      return true;
    } catch (e) {
      console.warn("[VIDEO ANALYZER]: MediaPipe loading failed. Fallback to TF.js.", e);
      return false;
    }
  }

  /**
   * Loads TensorFlow.js models lazily.
   */
  async loadTensorFlow() {
    if (this.tfLoaded) return true;
    try {
      console.log("[VIDEO ANALYZER]: Loading TensorFlow.js CDNs...");
      await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js");
      await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@1.0.5/dist/face-landmarks-detection.min.js");
      await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");
      this.tfLoaded = true;
      this.activeTracker = "tfjs";
      return true;
    } catch (e) {
      console.error("[VIDEO ANALYZER]: TensorFlow.js loading failed.", e);
      return false;
    }
  }

  /**
   * Initializes the face and pose tracking models.
   */
  async initModels() {
    // Try MediaPipe first
    const mpSuccess = await this.loadMediaPipe();
    if (mpSuccess && typeof window !== "undefined" && window.tasksVision) {
      try {
        const vision = window.tasksVision;
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );

        this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        this.poseLandmarker = await vision.PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });

        console.log("[VIDEO ANALYZER SUCCESS]: MediaPipe Models Initialized.");
        this.activeTracker = "mediapipe";
        return true;
      } catch (err) {
        console.warn("[VIDEO ANALYZER]: MediaPipe init failed. Falling back to TF.js...", err);
      }
    }

    // Fallback to TensorFlow.js
    const tfSuccess = await this.loadTensorFlow();
    if (tfSuccess && typeof window !== "undefined" && window.faceLandmarksDetection) {
      try {
        const faceDetector = window.faceLandmarksDetection;
        const poseDetector = window.poseDetection;

        this.tfFaceModel = await faceDetector.createDetector(faceDetector.SupportedModels.MediaPipeFaceMesh, {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
        });

        this.tfPoseModel = await poseDetector.createDetector(poseDetector.SupportedModels.MoveNet, {
          modelType: poseDetector.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });

        console.log("[VIDEO ANALYZER SUCCESS]: TensorFlow.js Fallback Models Initialized.");
        this.activeTracker = "tfjs";
        return true;
      } catch (err) {
        console.error("[VIDEO ANALYZER ERROR]: All model initializations failed.", err);
      }
    }

    this.activeTracker = null;
    return false;
  }

  /**
   * Processes a video frame and returns real-time metrics and coaching feedback.
   */
  async analyzeFrame(videoElement, canvasElement) {
    if (!this.activeTracker || !videoElement || videoElement.paused || videoElement.ended) {
      return { feedback: null, faceDetected: false };
    }

    this.metrics.framesCount++;
    const timestamp = performance.now();

    // 1. Core image processing: lighting/brightness calculation
    let isGoodLighting = false;
    let brightness = 127;
    if (canvasElement) {
      const ctx = canvasElement.getContext("2d");
      if (ctx) {
        // Draw video frame onto helper canvas to analyze pixels
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const data = imgData.data;
        let r, g, b, avg;
        let colorSum = 0;
        for (let x = 0, len = data.length; x < len; x += 40) {
          r = data[x];
          g = data[x + 1];
          b = data[x + 2];
          avg = Math.floor((r + g + b) / 3);
          colorSum += avg;
        }
        brightness = colorSum / (data.length / 40);
        this.metrics.brightnessSum += brightness;
        if (brightness >= 75 && brightness <= 210) {
          isGoodLighting = true;
          this.metrics.goodLightingCount++;
        }
      }
    }

    // 2. Perform landmark tracking
    let faceResults = null;
    let poseResults = null;

    if (this.activeTracker === "mediapipe") {
      if (this.faceLandmarker) {
        faceResults = this.faceLandmarker.detectForVideo(videoElement, timestamp);
      }
      if (this.poseLandmarker) {
        poseResults = this.poseLandmarker.detectForVideo(videoElement, timestamp);
      }
    } else if (this.activeTracker === "tfjs") {
      if (this.tfFaceModel) {
        const predictions = await this.tfFaceModel.estimateFaces(videoElement);
        if (predictions && predictions.length > 0) {
          faceResults = { faceLandmarks: [predictions[0].keypoints] };
        }
      }
      if (this.tfPoseModel) {
        const poses = await this.tfPoseModel.estimatePoses(videoElement);
        if (poses && poses.length > 0) {
          poseResults = { landmarks: [poses[0].keypoints] };
        }
      }
    }

    const faceDetected = !!(
      faceResults &&
      faceResults.faceLandmarks &&
      faceResults.faceLandmarks.length > 0
    );

    if (!faceDetected) {
      return {
        feedback: "Face not detected",
        faceDetected: false,
        coachingTips: ["Face not detected", "Improve lighting"],
      };
    }

    this.metrics.faceDetectedCount++;

    // Extract landmarks
    const landmarks = faceResults.faceLandmarks[0];
    
    // 3. Eye Contact & Head Position estimation
    // In MediaPipe face mesh, landmarks are 3D (x, y, z)
    // Left eye corner: 33, Right eye corner: 263, Nose tip: 1
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // Compute simple head yaw/pitch estimation based on nose symmetry relative to eye width
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    const noseCenterX = (leftEye.x + rightEye.x) / 2;
    const yawOffset = (nose.x - noseCenterX) / eyeWidth; // yaw indicator
    const pitchOffset = (nose.y - (leftEye.y + rightEye.y) / 2) / eyeWidth; // pitch indicator

    const yawDeg = Math.abs(yawOffset * 90);
    const pitchDeg = Math.abs(pitchOffset * 90);

    this.metrics.totalYaw += yawDeg;
    this.metrics.totalPitch += pitchDeg;

    const hasEyeContact = yawDeg < 18 && pitchDeg < 18;
    if (hasEyeContact) {
      this.metrics.eyeContactCount++;
    } else {
      this.metrics.lookingAwayCount++;
    }

    // 4. Centering & Distance estimation
    // Face box centering (X center of face between 0.35 and 0.65)
    const isCentered = nose.x >= 0.35 && nose.x <= 0.65;
    if (isCentered) {
      this.metrics.centeredCount++;
    }

    // Face scale / distance (eye width as ratio of frame)
    const tooClose = eyeWidth > 0.35;
    const tooFar = eyeWidth < 0.12;

    // 5. Smile & Blink detection (MediaPipe blendshapes or manual landmarks)
    let isSmiling = false;
    if (this.activeTracker === "mediapipe" && faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
      const shapes = faceResults.faceBlendshapes[0].categories;
      const smileL = shapes.find(s => s.categoryName === "mouthSmileLeft")?.score || 0;
      const smileR = shapes.find(s => s.categoryName === "mouthSmileRight")?.score || 0;
      isSmiling = (smileL + smileR) / 2 > 0.45;

      const blinkL = shapes.find(s => s.categoryName === "eyeBlinkLeft")?.score || 0;
      const blinkR = shapes.find(s => s.categoryName === "eyeBlinkRight")?.score || 0;
      const blinking = (blinkL + blinkR) / 2 > 0.65;

      if (blinking && !this.isBlinking) {
        this.isBlinking = true;
        this.metrics.blinkCount++;
      } else if (!blinking) {
        this.isBlinking = false;
      }
    } else {
      // Manual geometric smile detection (Mouth corner width relative to mouth vertical height)
      // corners: 61, 291. lips: 13, 14
      const mouthLeft = landmarks[61];
      const mouthRight = landmarks[291];
      const lipTop = landmarks[13];
      const lipBottom = landmarks[14];
      if (mouthLeft && mouthRight && lipTop && lipBottom) {
        const mouthW = Math.abs(mouthRight.x - mouthLeft.x);
        const mouthH = Math.abs(lipBottom.y - lipTop.y);
        const smileRatio = mouthW / (eyeWidth || 1);
        isSmiling = smileRatio > 0.85;
      }
    }

    if (isSmiling) {
      this.metrics.smileCount++;
    }

    // 6. Posture & Shoulder alignment (Pose tracking)
    let isPostureUpright = true;
    let shoulderTilt = 0;

    if (poseResults && poseResults.landmarks && poseResults.landmarks.length > 0) {
      const poseLandmarks = poseResults.landmarks[0];
      // Left shoulder: 11, Right shoulder: 12
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];

      if (leftShoulder && rightShoulder && leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
        shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
        this.metrics.totalShoulderTilt += shoulderTilt;
        
        // Tilt bounds for bad posture: Y coordinates offset > 0.08
        if (shoulderTilt > 0.08) {
          isPostureUpright = false;
        }
      }
    }

    if (isPostureUpright) {
      this.metrics.uprightPostureCount++;
    }

    // 7. Compile coaching tips
    const tips = [];
    if (!isCentered) tips.push("Keep your face centered");
    if (tooClose) tips.push("Move slightly back");
    if (tooFar) tips.push("Move slightly closer");
    if (!isGoodLighting) tips.push("Improve lighting");
    if (!hasEyeContact) tips.push("Maintain eye contact");
    if (!isPostureUpright) tips.push("Sit upright");

    // Primary feedback is the first active tip or supportive checkmark
    const primaryFeedback = tips.length > 0 ? tips[0] : "Perfect posture and framing!";

    return {
      feedback: primaryFeedback,
      faceDetected: true,
      coachingTips: tips,
      metrics: {
        brightness,
        eyeContact: hasEyeContact,
        centered: isCentered,
        smile: isSmiling,
        postureUpright: isPostureUpright,
      },
    };
  }

  /**
   * Resets session counters.
   */
  resetMetrics() {
    this.metrics = {
      framesCount: 0,
      faceDetectedCount: 0,
      eyeContactCount: 0,
      uprightPostureCount: 0,
      centeredCount: 0,
      goodLightingCount: 0,
      lookingAwayCount: 0,
      smileCount: 0,
      blinkCount: 0,
      totalYaw: 0,
      totalPitch: 0,
      totalShoulderTilt: 0,
      brightnessSum: 0,
    };
    this.isBlinking = false;
  }

  /**
   * Calculates overall scores for the session report.
   */
  getAverages(sessionDurationSeconds = 60) {
    const fCount = this.metrics.framesCount || 1;
    const detectedCount = this.metrics.faceDetectedCount || 1;

    const faceDetectionPercentage = (this.metrics.faceDetectedCount / fCount) * 100;
    const eyeContactScore = Math.round((this.metrics.eyeContactCount / detectedCount) * 100);
    const postureScore = Math.round((this.metrics.uprightPostureCount / detectedCount) * 100);
    const faceCenteringScore = Math.round((this.metrics.centeredCount / detectedCount) * 100);
    const lightingScore = Math.round((this.metrics.goodLightingCount / fCount) * 100);

    // Attention score drops if user looks away frequently
    const attentionScore = Math.max(0, 100 - Math.round((this.metrics.lookingAwayCount / detectedCount) * 100));

    // Engagement score calculated from posture, attention, and smile count ratio
    const smileRatio = this.metrics.smileCount / detectedCount;
    const engagementScore = Math.round((attentionScore * 0.5) + (postureScore * 0.3) + (Math.min(100, smileRatio * 300) * 0.2));

    const avgBrightness = this.metrics.brightnessSum / fCount;
    const cameraPresenceScore = Math.round(faceDetectionPercentage);

    const minutes = sessionDurationSeconds / 60 || 1;
    const blinkFrequency = parseFloat((this.metrics.blinkCount / minutes).toFixed(1));
    const lookingAwayFrequency = parseFloat((this.metrics.lookingAwayCount / detectedCount * 10).toFixed(1));

    return {
      eyeContactScore: Math.min(100, Math.max(10, eyeContactScore)),
      postureScore: Math.min(100, Math.max(10, postureScore)),
      attentionScore: Math.min(100, Math.max(10, attentionScore)),
      lightingScore: Math.min(100, Math.max(10, lightingScore)),
      faceCenteringScore: Math.min(100, Math.max(10, faceCenteringScore)),
      cameraPresenceScore: Math.min(100, Math.max(10, cameraPresenceScore)),
      engagementScore: Math.min(100, Math.max(10, engagementScore)),
      faceDetectionPercentage: parseFloat(faceDetectionPercentage.toFixed(1)),
      lookingAwayFrequency,
      smileCount: this.metrics.smileCount,
      shoulderAlignmentScore: postureScore,
      bodyStabilityScore: Math.min(100, Math.max(10, Math.round(100 - (this.metrics.totalShoulderTilt / detectedCount * 500)))),
      screenEngagementScore: attentionScore,
      cameraDistanceScore: faceCenteringScore,
      blinkFrequency,
    };
  }
}

export const videoAnalyzer = new VideoAnalyzer();
export default videoAnalyzer;
