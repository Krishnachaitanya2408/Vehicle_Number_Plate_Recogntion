import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <h1>Welcome to Vehicle Number Plate Recognition</h1>
      <p>
        Upload an image of a vehicle to detect and extract the number plate automatically.
        This application uses YOLOv8 and OCR to identify the license plate and display results neatly.
      </p>
    </div>
  );
}
