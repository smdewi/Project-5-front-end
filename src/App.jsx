import React from 'react';
import './App.css';
/* import PoseNet from './components/PoseNet.jsx'; */
import MoveNet2 from './components/MoveNet2.jsx';

export default function App() {
  return (
    <div className="App">
      <div>
        MoveNet.jsx tests
      </div>
      {/* <PoseNet /> */}
      <MoveNet2 />
    </div>
  );
}
