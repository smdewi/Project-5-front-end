/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// register one of the TF.js backends
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';

// confirm the modeltype to use
/* const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  enableTracking: true,
  trackerType: poseDetection.TrackerType.BoundingBox,
}; */

// load the detector
/* const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig); */

let detector;
let detectorConfig;
let poses;

export default function MoveNet() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Detection
  async function getPoses() {
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      // Get Video Properties
      const { video } = webcamRef.current;
      const { videoWidth } = webcamRef.current.video;
      const { videoHeight } = webcamRef.current.video;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      poses = await detector.estimatePoses(video);
      setTimeout(getPoses, 0);
      console.log(poses);
    }
  }

  // Creating Detector based on MoveNet
  async function init() {
    detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    await getPoses();
  }

  init();

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
