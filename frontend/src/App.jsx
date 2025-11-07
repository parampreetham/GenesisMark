import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // We'll add some basic styles

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  // 1. Handles the file selection
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(''); // Clear any previous message
  };

  // 2. Handles the file upload
  const onFileUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', selectedFile); // 'file' must match the backend 'upload.single('file')'

    try {
      // Send the file to the backend
      // We're using http://localhost:3001, which is where your backend is running
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 3. Handle the response
      console.log('Server response:', response.data);
      setMessage(`Success: ${response.data.message} (Filename: ${response.data.filename})`);
      setSelectedFile(null); // Clear the file input
    } catch (error) {
      console.error('Error uploading the file:', error);
      if (error.response) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage('Error: Could not connect to the server.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GenesisMark</h1>
        <p>Upload your content to verify its origin.</p>
        
        <div className="upload-container">
          <input type="file" onChange={onFileChange} />
          <button onClick={onFileUpload}>Upload and Process</button>
        </div>

        {message && <p className="message">{message}</p>}
      </header>
    </div>
  );
}

export default App;