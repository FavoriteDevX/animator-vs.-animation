# Animator VS. Animation - Functional Live Stickman

<img width="342" height="221" alt="animator-vs-animation-alan-becker" src="https://github.com/user-attachments/assets/b07dabce-3a9d-4203-bd13-34aea220a4b2" /> <img width="112" height="112" alt="the-dark-lord-alan-becker" src="https://github.com/user-attachments/assets/cbe7cffe-8e51-426d-ae0d-a80367f35656" />

An interactive web application inspired by *Animator vs. Animation*. Upload any stick figure PNG sprite and bring it to life inside your browser—or **drag it outside the browser window** to pop it out onto your laptop's desktop for **24 hours**!

## ✨ Features

* **Instant Sprite Upload:** Upload your own stickman PNG (transparent background recommended) or test immediately with the built-in default character.
* **Autonomous AI & Physics:** Your stick figure walks, jumps, speaks random thoughts, and kicks interactive props (`📦` and `⚽`) across the stage.
* **Drag-to-Desktop Pop-Out:** Grab your living stickman with the mouse and drag it toward the edge of the browser window (or click **Pop-out to Desktop**) to detach it into an always-on-top floating window over your desktop and other apps.
* **24-Hour Life Cycle:** Once activated, your stickman stays alive for **24 hours** before going dormant and requiring reactivation.
* **Zero Backend / Pure Web:** Built entirely with vanilla HTML, CSS, and JavaScript.

## 🛠️ Project Structure

```text
├── index.html          # Main stage layout, upload controls, and interactive props
├── style.css           # Dark mode studio styling and responsive canvas
├── stickman-life.js    # Physics engine, AI behavior, prop collisions, and edge-drag detection
├── app.js              # Sprite upload handler, 24h countdown timer, and Picture-in-Picture pop-out
└── README.md           # Project documentation
```

## 💡 Browser Compatibility Note

The **Drag-to-Desktop / Pop-out** feature uses the modern [Document Picture-in-Picture API](https://mozilla.org), which works best on desktop versions of **Google Chrome**, **Microsoft Edge**, and **Brave**.

## 📜 Credits

Inspired by Alan Becker's *Animator vs. Animation* series and the viral stick-figure coding trend by **Chicxy Madness**.
