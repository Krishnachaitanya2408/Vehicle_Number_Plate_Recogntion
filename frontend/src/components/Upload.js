import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/detect', formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Number plate detection has not been successful. Please try again with a different image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1 className="upload-heading">Upload Vehicle Image</h1>

      <div className="button-group">
        <label className="custom-button">
          <input type="file" onChange={handleFileChange} />
          Choose File
        </label>

        <button
          className="custom-button"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Detect'}
        </button>
      </div>

      {loading && <div className="spinner"></div>}

      {error && <p className="error">{error}</p>}

      {preview && (
        <div className="preview-section">
          <h2>Image Preview:</h2>
          <img src={preview} alt="Preview" />
        </div>
      )}

      {result && (
        <div className="result-section">
          <h2>Detection Results</h2>

          <div className="result-block">
            <h3>Detected Vehicle Number:</h3>
            <p>{result.plate_text}</p>
          </div>

          <div className="result-block">
            <h3>Number Plate Image:</h3>
            <img src={`data:image/png;base64,${result.cropped_image}`} alt="Cropped Plate" />
          </div>

          <div className="result-block">
            <h3>Annotated Vehicle Image:</h3>
            <img src={`data:image/png;base64,${result.annotated_image}`} alt="Annotated Vehicle" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
