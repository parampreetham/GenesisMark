# GenesisMark

**A platform to verify, trace, and authenticate digital content in the age of AI.**

GenesisMark provides a transparent and secure system to verify, trace, and authenticate original digital content. By combining invisible watermarking, decentralized storage (IPFS), and blockchain immutability, it empowers creators to prove originality and helps audiences trust digital media.

## 💡 The Problem

With the exponential rise of AI-generated images and videos on social media, it has become increasingly difficult to verify the authenticity of digital content. Users often encounter deepfakes, manipulated visuals, or untraceable AI-generated media that erodes trust and accountability. There is a critical need for a transparent and secure system to verify, trace, and authenticate original digital content.

## ✨ Core Features

* **Simple Upload:** Upload photos or videos via a simple web interface.
* **Invisible Watermarking:** Embeds a robust, invisible watermark for authenticity tracking (using DCT-based algorithms).
* **Unique Hashing:** Generates unique content hashes (SHA-256 for integrity, Perceptual Hash for similarity).
* **Blockchain Registration:** Registers a timestamped proof of authenticity on a secure blockchain (e.g., Polygon).
* **Decentralized Storage:** Stores content on IPFS for decentralized and verifiable management.
* **Easy Verification:** A simple page to confirm content authenticity by uploading the file or checking its hash.

## 💻 Tech Stack

| Area | Technology |
| --- | --- |
| **Frontend** | React (Vite) |
| **Backend** | Node.js, Express.js |
| **File Uploads** | Multer |
| **File Processing** | FFmpeg, ImageMagick, ExifTool, OpenCV |
| **Decentralized Storage** | IPFS (Pinata/Infura) |
| **Blockchain** | Polygon (or other Ethereum L2) |
| **Database** | PostgreSQL or Firestore |

## 📐 System Architecture

1.  **Upload:** A user uploads an image or video via the React frontend.
2.  **Processing:** The Node.js backend receives the file and starts a processing pipeline.
3.  **Analysis:** Metadata is scanned and cleaned using `ExifTool`.
4.  **Watermarking:** An invisible watermark is embedded using a DCT-based algorithm.
5.  **Hashing:** SHA-256 and perceptual hashes are computed.
6.  **Storage:** The processed file is pinned to IPFS, and its CID is obtained.
7.  **Registration:** The hashes, CID, and timestamp are recorded on the blockchain via a smart contract.
8.  **Verification:** A separate endpoint allows anyone to check a file's authenticity by re-computing its hashes and checking for a record on the blockchain.

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPO_URL>
    cd GenesisMark
    ```

2.  **Set up the Backend:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies
    npm install

    # Create the 'uploads' directory for Multer
    mkdir uploads

    # Run the server (on http://localhost:3001)
    npm run dev
    ```

3.  **Set up the Frontend:**
    *In a new terminal window:*
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Run the React app (on http://localhost:5173 or similar)
    npm run dev
    ```

4.  **Open the App:**
    Open your browser and navigate to the URL provided by Vite (e.g., `http://localhost:5173`). You should see the GenesisMark upload interface, fully connected to your local backend.

## 🗺️ MVP Development Roadmap

This project is in active development. Here is the planned roadmap:

* [x] **Phase 1:** Build basic UI and upload/metadata pipeline.
* [ ] **Phase 2:** Implement hashing (SHA-256, pHash) and verification endpoint.
* [ ] **Phase 3:** Add watermark embedding for images.
* [ ] **Phase 4:** Integrate IPFS pinning and backend storage.
* [ ] **Phase 5:** Deploy blockchain contract and connect API.
* [ ] **Phase 6:** Extend to video, optimize watermark robustness (Post-MVP).

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.