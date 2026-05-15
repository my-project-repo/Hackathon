<div align="center">
<br/>

# 🚀 LogicLens

### 🧠 Intelligent Real-Time Code Analysis System

LogicLens provides real-time logic error detection, debugging guidance, and DSA mentoring across **Chrome Extension + VS Code Extension**.

<br/>

<img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
<img src="https://img.shields.io/badge/VSCode-Extension-007ACC?style=for-the-badge&logo=visualstudiocode" />
<img src="https://img.shields.io/badge/JavaScript-Primary-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Realtime-Analysis-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />

<br/><br/>

💡 Detect logic bugs before runtime errors  
⚡ Learn DSA concepts while coding  
🧩 Works inside browser + VS Code  

</div>

---

# 🌐 Overview

LogicLens is a **dual-platform developer intelligence tool** that helps you understand and fix logic errors in real time.

It works in:

- 🌐 Chrome (online coding platforms)
- 💻 VS Code (local development)

---

# 🟢 LogicLens Chrome Extension

Used for competitive programming platforms like:

- LeetCode  
- Codeforces  
- CodeChef  

### Features:
- Detects code directly inside browser editors  
- Real-time DOM-based tracking  
- Interactive chat-style UI  
- Instant debugging feedback  

---

# 🟣 LogicLens VS Code Extension

Used for local development inside VS Code.

### Features:
- Real-time code analysis inside editor  
- Side panel error explanations  
- AST-based static analysis  
- Learning-focused debugging system  

---

# ⚙️ Core Features

## 🔴 Logic Error Detection
- Off-by-one errors  
- Infinite loops  
- Incorrect loop updates  
- Null / undefined access risks  
- Assignment in conditions  
- Unreachable code  
- Missing return statements  
- Duplicate conditions  
- Floating point comparison issues  

---

## 🟡 DSA & Algorithm Awareness
- Binary search midpoint overflow  
- Sliding window logic issues  
- DP state overwrite detection  
- Missing base cases in recursion  
- Hashmap existence checks  
- Array mutation during iteration  
- Modulo-by-zero detection  
- Edge case handling gaps  

---

## 🔵 Learning Layer

Every detection includes:

- Clear explanation  
- Suggested fix  
- Learning hint  
- Related DSA concept  
- Interview preparation insight  

---

# 🧠 Project Architecture

```bash
Hackathon/
│
├── LogicLens - Chrome Extension/
│   │
│   ├── engine/
│   │   └── Core detection and analysis engine
│   │
│   ├── libs/
│   │   └── External libraries and utilities
│   │
│   ├── parsers/
│   │   └── AST parsing and syntax processing
│   │
│   ├── rules/
│   │   └── Logic bug detection rules
│   │
│   ├── ui/
│   │   └── Interactive chat panel UI
│   │
│   ├── background.js
│   │   └── Background service worker
│   │
│   ├── content.js
│   │   └── Injects detection into coding platforms
│   │
│   ├── popup.html
│   │   └── Chrome extension popup UI
│   │
│   ├── styles.css
│   │   └── Extension styling
│   │
│   ├── manifest.json
│   │   └── Chrome extension configuration
│   │
│   └── package.json
│
├── LogicLens - VS Code Extension/
│   │
│   ├── .vscode/
│   │   └── VS Code extension configs
│   │
│   ├── src/
│   │   └── Main extension source code
│   │
│   ├── package.json
│   │   └── Extension metadata and commands
│   │
│   ├── tsconfig.json
│   │   └── TypeScript configuration
│   │
│   ├── eslint.config.mjs
│   │   └── Linting configuration
│   │
│   ├── CHANGELOG.md
│   │   └── Extension updates and versions
│   │
│   └── README.md
│
└── README.md
```

---

# 🧠 Architecture

LogicLens is built using:

- AST Parsing Engine  
- Static Code Analysis  
- Pattern Classification  
- Real-time Code Tracking  
- Rule-based Detection System  
- Educational Feedback Layer  
- UI Rendering Engine  

---

# 📦 Installation

## 🟣 VS Code Extension

1. Download the `.vsix` file  
2. Open VS Code  
3. Go to Extensions panel  
4. Click **Install from VSIX**  
5. Select the file  
6. Reload VS Code  

OR via terminal:

```bash
code --install-extension logiclens-0.0.1.vsix
```

If your file is zipped:

```bash
unzip logiclens-0.0.1.vsix.zip
code --install-extension logiclens-0.0.1.vsix
```

---

# 🌐 Chrome Extension Installation

1. Open Chrome  
2. Go to:

```bash
chrome://extensions
```

3. Enable **Developer Mode**  
4. Click **Load unpacked**  
5. Select:

```bash
LogicLens - Chrome Extension/
```

6. LogicLens is now installed

---

# 🎯 Vision

LogicLens aims to become an AI-powered programming mentor capable of:

- Explaining logic mistakes  
- Teaching DSA interactively  
- Improving debugging skills  
- Assisting interview preparation  
- Helping students learn coding faster  

---

# 📌 Current Status

✅ Chrome Extension  
✅ VS Code Extension  
✅ JavaScript Support  
✅ Real-time Analysis  
✅ Interactive UI  
🚧 AI Mentor Integration  
🚧 Multi-language Support  
🚧 Algorithm Visualization  

---

# 🤝 Contributing

Contributions, ideas, and feedback are always welcome.

- Report bugs  
- Suggest detectors  
- Improve UI/UX  
- Add language support  
- Improve educational hints  

---

# ⭐ Support the Project

If you like LogicLens:

- ⭐ Star the repository  
- 🐛 Report issues  
- 💡 Suggest features  
- 🚀 Share it with developers and students  

---

<div align="center">

# 💙 LogicLens

### Learn Logic, Not Just Syntax

Built for students, developers, and interview preparation.

</div>
