import React, { useState } from 'react';
import axios from 'axios';
import '../Dashboard.css'; // Use the renamed CSS file
import { useAuth } from '../context/AuthContext'; // Import auth to get the token

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function Dashboard() {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);  

  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null); 
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { token } = useAuth(); // Get the token

  // --- Helper function to get auth headers ---
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const onUploadFileChange = (event) => {
    setUploadFile(event.target.files[0]);
    setUploadResult(null); 
  };

  const onFileUpload = async () => {
    if (!uploadFile) {
      setUploadResult({ message: 'Please select a file to register.', isError: true });
      return;
    }
    setIsUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      // NOTE: We'll need to update the backend to require auth for this
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders() // Add auth token
        },
      });
      setUploadResult({ ...response.data, isError: false });
      setUploadFile(null);
      document.getElementById('upload-input').value = null; 
    } catch (error) {
      setUploadResult({ message: error.response?.data?.error || 'Could not connect to server.', isError: true });
    } finally {
      setIsUploading(false);
    }
  };

  const onVerifyFileChange = (event) => {
    setVerifyFile(event.target.files[0]);
    setVerifyResult(null); 
  };

  const onFileVerify = async () => {
    if (!verifyFile) {
      setVerifyResult({ message: 'Please select a file to verify.' });
      return;
    }
    setIsVerifying(true);
    setVerifyResult(null);
    const formData = new FormData();
    formData.append('file', verifyFile);
    try {
      // NOTE: We'll need to update the backend to require auth for this
      const response = await axios.post('http://localhost:3001/api/verify', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders() // Add auth token
        },
      });
      setVerifyResult(response.data); 
    } catch (error) {
      setVerifyResult({ message: error.response?.data?.error || 'Could not connect to server.' });
    } finally {
      setIsVerifying(false);
      setVerifyFile(null); 
      document.getElementById('verify-input').value = null; 
    }
  };

  const formatTimestamp = (bigIntString) => {
    if (!bigIntString) return 'N/A';
    const timestampInMs = parseInt(bigIntString) * 1000;
    return new Date(timestampInMs).toLocaleString();
  };

  const handleDownload = async (cid, filename) => {
    try {
      const response = await fetch(IPFS_GATEWAY + cid);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `genesis-download-${cid.substring(0, 6)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="content-container">
      {/* === REGISTER COLUMN === */}
      <div className="card">
        <h2>Register Content</h2>
        <p>Upload a new file to watermark, hash, and register on the blockchain.</p>
        <div className="input-group">
          <input id="upload-input" type="file" onChange={onUploadFileChange} />
          <button onClick={onFileUpload} disabled={isUploading}>
            {isUploading ? 'Registering...' : 'Register File'}
          </button>
        </div>
        
        {uploadResult && (
          <div className="upload-result">
            <p className={uploadResult.isError ? 'message-error' : 'message-success'}>
              {uploadResult.message}
            </p>
            {!uploadResult.isError && (
              <div className="record-details">
                <h3 className="status-authentic">✅ REGISTERED</h3>
                <img 
                  src={IPFS_GATEWAY + uploadResult.ipfsCid}
                  alt="Registered Content Preview" 
                  className="preview-image"
                />
                <pre>
                  <strong>SHA-256:</strong> {uploadResult.sha256}<br />
                  <strong>IPFS CID:</strong> {uploadResult.ipfsCid}
                </pre>
                <button 
                  onClick={() => handleDownload(uploadResult.ipfsCid, uploadResult.filename)}
                  className="download-button"
                >
                  Download Registered Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === VERIFY COLUMN === */}
      <div className="card">
        <h2>Verify Content</h2>
        <p>Check if a file has been registered and its authenticity is on-chain.</p>
        <div className="input-group">
          <input id="verify-input" type="file" onChange={onVerifyFileChange} />
          <button onClick={onFileVerify} disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify File'}
          </button>
        </div>
        
        {verifyResult && (
          <div className="verify-result">
            <p>{verifyResult.message}</p>
            {verifyResult.isAuthentic === true && (
              <div className="record-details">
                <h3 className="status-authentic">✅ AUTHENTIC</h3>
                <pre>
                  <strong>Creator:</strong> {verifyResult.record.creator}<br />
                  <strong>Timestamp:</strong> {formatTimestamp(verifyResult.record.timestamp)}<br />
                  <strong>IPFS CID:</strong> {verifyResult.record.ipfsCid}<br />
                  <strong>SHA-256:</strong> {verifyResult.record.sha256}
                </pre>
              </div>
            )}
            {verifyResult.isAuthentic === false && (
              <div className="record-details">
                <h3 className="status-not-found">❌ NOT FOUND</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;