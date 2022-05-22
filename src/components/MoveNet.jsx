/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */

// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3.  Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow
// 8. Draw functions

import React, { useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// register one of the TF.js backends
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';

export default function MoveNet() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // detect pose Function
  const detect = async (net) => {
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // load/set model
      /* const model = poseDetection.SupportedModels.MoveNet; */
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox,
      };

      // create a detector
      /* const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet); */
      /* const detector = await poseDetection.createDetector(model); */
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

      // Pass in a video stream to the model to detect poses
      const poses = await detector.estimatePoses(video);
      console.log(poses);

      /* drawCanvas(pose, video, videoWidth, videoHeight, canvasRef); */
    }
  };

  // Load MoveNet
  const runMoveNet = async () => {
    /* const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8, // lower faster but less accurate
    }); */

    // setInterval so that we run detection at fix intervals
    setInterval(() => {
      detect();
    }, 150);
  };

  runMoveNet();

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}
