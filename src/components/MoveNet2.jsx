/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { forwardRef, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// register one of the TF.js backends
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import { keypointsToNormalizedKeypoints } from '@tensorflow-models/pose-detection/dist/shared/calculators/keypoints_to_normalized_keypoints';
/* import { drawKeypoints, drawSkeleton } from '../posenetDrawingUtils.js'; */

let detector;
let detectorConfig;
let poses;
const ptBorder = 'black';
const ptColor = 'white';
const minConfidence = 0.3; // min confidence required to draw keypt.
const lineWidth = 3; // thickness of skeletal lines (drawSegment)
const lineColor = 'black'; // colour of skeletal lines (drawSegment)
const confiThreshold = 0.3; // min. confidence required for skeleton line

export default function MoveNet2() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Helper Function- draw a single keypoint
  function drawPoint(ctx, y, x, r) {
    ctx.fillStyle = ptColor;
    ctx.strokeStyle = ptBorder;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  // Helper Function- draw keypoints based on confidence
  function drawKeypoints(keypoints, ctx, scale = 1) {
    const count = 0;
    if (poses && poses.length > 0) {
      console.log('keypoints =', keypoints);
      keypoints.forEach((keypoint) => {
        const { x, y, score } = keypoint;
        if (score > 0.3) {
          drawPoint(ctx, y, x, 8);
        }
      });
    }
  }

  // Helper Function convert object to array/tuple
  /*   function toTuple({ y, x }) {
    return [y, x];
  } */

  // Helper Function: Draws a line on  a canvas, i.e. a joint
  function drawSegment([ay, ax], [by, bx], ctx, scale = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.stroke();
  }

  // Helper Function - draw lines between the keypoints to form skeleton pushUpCode
  function drawSkeleton(keypoints, ctx) {
    // edge definition for draw skeletion
    const edges = {
      '5,7': 'm',
      '7,9': 'm',
      '6,8': 'c',
      '8,10': 'c',
      '5,6': 'y',
      '5,11': 'm',
      '6,12': 'c',
      '11,12': 'y',
      '11,13': 'm',
      '13,15': 'm',
      '12,14': 'c',
      '14,16': 'c',
    };
    if (poses && poses.length > 0) {
      // change object key-value pair into array form
      const edgesArr = Object.entries(edges);
      edgesArr.forEach((edge) => {
        // destructure array to work on index position of the hardcoded adj keypoints in the model
        const [key, value] = edge;
        const p = key.split(',');
        // p1 is the earlier point,
        const p1 = p[0];
        // p2 is the next point
        const p2 = p[1];

        // grab the coordinates and scores of each point
        const y1 = keypoints[p1].y;
        const x1 = keypoints[p1].x;
        const c1 = keypoints[p1].score;
        const y2 = keypoints[p2].y;
        const x2 = keypoints[p2].x;
        const c2 = keypoints[p2].score;

        // condition for drawing the line
        if ((c1 > confiThreshold) && (c2 > confiThreshold)) {
          drawSegment([y1, x1], [y2, x2], ctx);
        }
      });
    }
  }

  // Helper Function - draw keypoints onto canvas
  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext('2d');
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose[0].keypoints, ctx);
    drawSkeleton(pose[0].keypoints, ctx);
  };

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
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
      console.log(poses);
    }
  }

  // Creating Detector based on MoveNet
  async function init() {
    detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
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
