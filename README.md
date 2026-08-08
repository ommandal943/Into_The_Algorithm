<div align="center">

# 🌌 Into the Algorithm
### *Demystify Machine Learning from First-Principles Math to Production Systems*

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind / Glass CSS](https://img.shields.io/badge/Design-Glassmorphism_3D-06B6D4?style=for-the-badge&logo=css3&logoColor=white)](#design-system)
[![Supabase Engine](https://img.shields.io/badge/Backend-Supabase_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

<br />

```
   ██████╗ ███╗   ██╗████████╗██████╗     ████████╗██╗  ██╗███████╗    ██████╗ 
   ██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗    ╚══██╔══╝██║  ██║██╔════╝   ██╔═══██╗
   ██║  ██║██╔██╗ ██║   ██║   ██║  ██║       ██║   ███████║█████╗     ██║   ██║
   ██║  ██║██║╚██╗██║   ██║   ██║  ██║       ██║   ██╔══██║██╔══╝     ██║   ██║
   ██████╔╝██║ ╚████║   ██║   ██████╔╝       ██║   ██║  ██║███████╗   ╚██████╔╝
   ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═════╝        ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═════╝ 
```

**An Interactive, First-Principles 3D Machine Learning Engine & Gamified Learning Matrix**

[Explore Live Demo](#-getting-started) • [Features](#-key-innovations) • [Architecture](#-system-architecture) • [Documentation](#-documentation)

---

</div>

<br />

## 📖 Overview

**Into the Algorithm** is a state-of-the-art web application designed to bridge the gap between high-level AI abstractions and first-principles mathematical rigor.

Instead of treating Machine Learning models as opaque black boxes, **Into the Algorithm** renders real-time 3D loss landscapes, living neural network activations, dynamic gradient descent optimization bowls, model mutation labs, and an interactive 100+ level gamified campaign—directly inside your browser.

> [!NOTE]
> Engineered with pure React 18, HTML5 3D Canvas, Framer Motion, and GSAP. Zero heavy WebGL wrappers required—achieving hyper-smooth 60 FPS calculations directly from linear algebra primitives.

---

## ⚡ Key Innovations & Modules

### 1. 🧬 Living Neural Simulation & 3D Loss Landscape
- **Real-Time 3D Projection**: Rotate, zoom, and orbit high-dimensional decision boundaries and loss bowls with custom 3D projection algorithms.
- **Interactive Loss Functions**: Switch between Elliptic Bowls, Saddle Points, Himmelblau, and Rastrigin functions to analyze optimizer behavior.
- **Optimizer Telemetry**: Compare convergence paths between **SGD**, **Momentum** ($\beta = 0.9$), **AdaGrad**, **RMSprop**, and **Adam** ($\beta_1 = 0.9, \beta_2 = 0.999$).
- **Neuron Inspector**: Click individual neurons to inspect post-activation heatmaps, gradient flow tensors, and weight bias matrices.

$$\text{Adam Update: } m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t, \quad v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2, \quad \theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon}\hat{m}_t$$

---

### 2. 🌌 Model Genome Explorer & Mutation Lab
- **Genetic Trait Radar**: Visualize model traits across expressivity, parameter efficiency, latency, robustness, and interpretability.
- **Evolutionary Tree View**: Track historical model lineages from Perceptrons and AlexNet to Transformers, LLaMA, and Mixture-of-Experts (MoE).
- **Mutation Lab**: Simulate architectural mutations—adjust attention heads, layer norms, and kernel dimensions to monitor accuracy tradeoffs.

---

### 3. 🌲 Interactive Decision Tree & Ensemble Random Forest
- **Ensemble Bagging Controls**: Tune estimator counts ($1 - 100$), tree depths, feature sampling ratios, and bootstrap sample rates.
- **Impurity Metrics**: Toggle between **Gini Impurity** ($\text{Gini} = 1 - \sum p_i^2$) and **Information Entropy** ($H = -\sum p_i \log_2 p_i$).
- **Feature Importance Breakdown**: Real-time Gini impurity reduction breakdown charts per feature dimension.

---

### 4. 🎮 Gamified 100+ Level ML Quest Campaign
- **Interview & System Design Preparation**: Over 100 levels inspired by top AI research labs (Google DeepMind, OpenAI, Meta AI).
- **Interactive Solvers**:
  - 📝 **Theoretical Quizzes**: Mathematical concept checks with instant feedback.
  - ⚡ **Flashcard Mastery**: Deep-dive active recall decks.
  - 💻 **Live NumPy/Python Playground**: Interactive algorithm puzzles executed in-browser.
  - 🏛️ **System Design Scenarios**: Architecture tradeoffs for recommendation engines and LLM serving.
- **Gamification Mechanics**: XP progression, daily streaks, coin economy, and unlockable achievement badges.

---

### 5. 🔐 Dual Sync Architecture (Supabase + LocalStorage)
- **Zero-Friction Authentication**: Instant email & password auth with automatic fallback to **Instant Demo Mode**.
- **Resilient Offline Progress**: Automatic bidirectional sync between cloud database tables (`profiles`, `progress`, `learning_history`) and encrypted local storage.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Core UI Engine** | React 18, JavaScript (ES6+), JSX |
| **Styling & Theme** | Modern Glassmorphism CSS, HSL Design Tokens, Google Fonts (`Outfit`, `JetBrains Mono`) |
| **Animations** | Framer Motion, GSAP, HTML5 `requestAnimationFrame` |
| **Math & Graphics** | 2D/3D Matrix Transformation Math, HTML5 Canvas API |
| **Icons & UI** | Lucide React, Custom SVG Icons |
| **Backend & Storage** | Supabase Auth, PostgreSQL, LocalStorage |
| **Build & Tooling** | Vite 8, ESLint, Oxlint |

---

## 🏗️ Project Directory Architecture

```
Into-The-Algorithm/
├── app/                                  # Primary Web Application Container
│   ├── public/                           # Static assets, media clips & standalone labs
│   │   ├── auth-bg-video.mp4             # High-definition cinematic background video
│   │   └── learn/                        # Standalone HTML/JS visualization labs
│   ├── src/
│   │   ├── components/                   # Reusable UI Components
│   │   │   ├── dashboard/                # Learning galaxy, mission cards, quick launch
│   │   │   ├── landing/                  # 3D Hyperplane, Random Forest & GD playgrounds
│   │   │   └── Header.jsx                # Animated glass navigation bar
│   │   ├── context/                      # Global AuthContext & GameContext states
│   │   ├── features/                     # Specialized Application Modules
│   │   │   ├── genome/                   # Model Genome Explorer & Mutation Lab
│   │   │   ├── modelLab/                 # Interactive Decision Tree & Preprocessing Lab
│   │   │   └── neuralSim/                # Living Neural Simulation & 3D Loss Surface
│   │   ├── hooks/                        # Custom React Hooks (GSAP, Voice, Progress)
│   │   ├── lib/                          # Supabase client initialization & configuration
│   │   ├── pages/                        # Route entrypoints (Home, Auth, LevelPlay, Profile)
│   │   ├── services/                     # Supabase & LocalStorage unified data service
│   │   ├── App.jsx                       # Root application shell & routing matrix
│   │   └── index.css                     # Master design system & CSS custom properties
│   ├── .env                              # Environment configuration template
│   ├── package.json                      # Dependencies & script declarations
│   └── vite.config.js                    # Vite bundler configuration
├── ML ALGO VISUALIZE/                    # First-principles math visualization engines
├── ML GAMING/                            # Standalone campaign module assets
└── README.md                             # Repository Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` or `yarn`

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/alhajbaig/Into-The-Algorithm.git
   cd Into-The-Algorithm/app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `app/` directory (or use `.env.example`):
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Schema Setup (Optional Supabase Sync)

To enable cloud progress sync with Supabase, execute the following SQL script inside your Supabase SQL Editor:

```sql
-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'ML Engineer',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  cleared_levels INT[] DEFAULT '{}',
  total_stars INT DEFAULT 0,
  coins INT DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  raw_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress." ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress." ON public.progress FOR ALL USING (auth.uid() = user_id);
```

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more details.

<br />

<div align="center">


⭐ **Star this repository if you find it helpful!** ⭐

</div>
