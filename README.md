# GenesisMark

**A platform to verify, trace, and authenticate digital content in the age of AI.**

GenesisMark provides a transparent and secure system for **authenticated users** to verify, trace, and authenticate original digital content. It combines (test) watermarking, decentralized storage (IPFS), and blockchain immutability to empower creators.

## 💡 The Problem

With the exponential rise of AI-generated images and videos, it's difficult to verify content authenticity. This platform allows registered users to create an immutable, on-chain proof of their content's origin.

## ✨ Core Features

* **User Authentication:** Secure registration and login flow using **Firestore**, **JWT**, and `bcrypt` password hashing.
* **Protected Routes:** Only authenticated users can access the core upload and verify features.
* **Watermarking:** Applies a (currently visible) watermark using a Python/OpenCV backend script.
* **Unique Hashing:** Generates unique content hashes (SHA-256 for integrity, Perceptual Hash for similarity).
* **Blockchain Registration:** Registers a timestamped proof of authenticity on a secure blockchain (Hardhat local node).
* **Decentralized Storage:** Stores the watermarked content on IPFS (via Pinata).
* **Instant Verification:** A "Verify" tab to check a file's authenticity against the blockchain record.

## 💻 Tech Stack

| Area | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), **`react-router-dom`** |
| **Backend** | Node.js, Express.js, `ethers.js` |
| **Authentication** | **Firebase Firestore**, **Firebase Admin**, **JWT**, **`bcrypt`** |
| **Blockchain** | Hardhat, Solidity, Ethers.js |
| **Image Processing** | Python, OpenCV |
| **Decentralized Storage** | IPFS (Pinata) |
| **File Uploads** | Multer |

## 🚀 Getting Started (Local Development)

This project now requires a local blockchain, a backend API (with database keys), and a frontend.

### 1. Auth & Database Setup (Required)

1.  **Firebase:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firestore:** In the Firebase dashboard, go to **Build > Firestore Database** and click "Create database". Start it in **"Test Mode"**.
3.  **Get Service Key:** In your Firebase project settings (⚙️ icon), go to **Service accounts > Generate new private key**.
4.  **Save Key:** This will download a JSON file. Rename it to `serviceAccountKey.json` and place it in your **`backend`** folder.
5.  **Git Ignore:** **CRITICAL:** Add this file to your **root `.gitignore`** file:
    ```
    # Firebase Service Account Key
    backend/serviceAccountKey.json
    ```

### 2. Environment Setup

Your **`backend/.env`** file needs the following keys:

Pinata (for IPFS)
PINATA_API_KEY=your_pinata_api_key PINATA_API_SECRET=your_pinata_api_secret

Authentication (for JWT)
Generate a secret by running this in your terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_random_string_here

### 3. Run the Local Blockchain

In your **first terminal**, start the Hardhat local node:

```bash
# Navigate to the blockchain project
cd backend/blockchain

# Run the local node
npx hardhat node
```

### 4. Deploy the Contract

In a second terminal, deploy your contract to the local node:

```bash
# Navigate to the blockchain project
cd backend/blockchain

# Deploy the contract
npx hardhat ignition deploy ignition/modules/DeployRegistry.ts --network localhost
```

This will print a contract address. Make sure this address matches the CONTRACT_ADDRESS in your backend/index.js file (e.g., 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512).

### 5. Run the Backend API

In the same second terminal (or a new one), start the main API server:

```bash
# Navigate to the main backend
cd backend

# Run the server
npm run dev
```

You should see "✅ Connected to Firestore" and "✅ Connected to local blockchain" in the logs.

### 6. Run the Frontend

In a third terminal, start the React app:

```bash
# Navigate to the frontend
cd frontend

# Run the app
npm run dev
```

This will open your app on http://localhost:5173. You will be at the login page. You can now register a new user and start testing.

🗺️ MVP Development Roadmap
[x] Phase 1: Build basic UI and upload/metadata pipeline.

[x] Phase 2: Implement hashing (SHA-256, pHash) and verification endpoint.

[x] Phase 3: Add watermark embedding (visible test).

[x] Phase 4: Integrate IPFS pinning and backend storage.

[x] Phase 5: Deploy blockchain contract and connect API (local).

[x] Feature: Add full User Authentication with Firestore, JWT, and protected routes.

[ ] Phase 6: Extend to video, optimize watermark robustness (Post-MVP).

[ ] Post-MVP: Implement invisible watermarking (DCT/LSB).

[ ] Post-MVP: Deploy to a public testnet (Amoy).

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.