<div align="center">
<br/>

# 🚀 LogicLens × ErrorLens

### 🧠 Dual-Platform Intelligent Code Analysis System

Real-time logic error detection, debugging guidance, and DSA mentoring across **Chrome (LogicLens)** and **VS Code (ErrorLens)**.

<br/>

<img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
<img src="https://img.shields.io/badge/VSCode-Extension-007ACC?style=for-the-badge&logo=visualstudiocode" />
<img src="https://img.shields.io/badge/JavaScript-Primary-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Realtime-Analysis-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />

<br/><br/>

💡 Detect logic bugs before runtime errors  
⚡ Learn DSA concepts while coding  
🧩 Two platforms — one intelligence engine  

</div>

---

# 🌐 Overview

This repository contains **two complementary developer tools**:

## 🟢 LogicLens (Chrome Extension)
A real-time code analysis assistant for online coding platforms like:

- LeetCode
- Codeforces
- CodeChef
- HackerRank
- GeeksforGeeks

👉 It detects code issues directly inside the browser editor and provides instant feedback in a chat-style UI.

---

## 🟣 ErrorLens (VS Code Extension)
A powerful in-editor debugging assistant for developers using VS Code.

👉 It analyzes code in real time and highlights logic errors with explanations and learning guidance.

---

# ⚙️ Core Features (Both Tools)

## 🔴 Logic / Runtime Risk Detection
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
- Interview-focused insight

---

# 🧠 Architecture

Both systems share the same intelligence pipeline:

- AST Parsing Engine
- Static Code Analysis
- Pattern Classification
- Real-time Code Tracking
- Rule-based Detection Engine
- Educational Feedback Layer
- UI Message Renderer

---

# 🧩 Platform Breakdown

## 🟢 LogicLens (Chrome Extension)
- Works inside browser coding platforms
- Detects code in Monaco / CodeMirror / Ace editors
- Injects interactive chat panel
- Real-time monitoring via DOM tracking

---

## 🟣 ErrorLens (VS Code Extension)
- Works directly inside VS Code editor
- Reads active code buffer
- Live analysis during coding
- Inline debugging + side panel feedback

---

# 📦 Installation

## 🟣 ErrorLens (VS Code)

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions panel
4. Click `Install from VSIX`
5. Select the file
6. Reload VS Code

OR via terminal:
```bash
code --install-extension errorlens-0.0.1.vsix
