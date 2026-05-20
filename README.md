# Ed Christie - Portfolio Website

A modern, unique portfolio website showcasing skills, projects, and experience as an Applied Software Engineer.

## 🌟 Features

- **Terminal-Style Hero Section** - Interactive typing animation with terminal window design
- **Animated Profile Card** - Rotating gradient ring effect with status indicator
- **Dynamic Skills Display** - Categorized skill cards with hover effects
- **GitHub Integration** - Automatically fetches and displays your latest repositories via GitHub API
- **Responsive Design** - Fully mobile-friendly with hamburger menu
- **Smooth Animations** - Scroll-triggered animations and smooth transitions
- **Modern Glassmorphism UI** - Backdrop blur effects and gradient accents
- **Easter Egg** - Konami code activation (try it!)

## 🚀 Deployment to Cloudflare Pages

### Option 1: Quick Deploy (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages → Create a project
   - Connect your GitHub account
   - Select your portfolio repository
   - Configure build settings:
     - **Framework preset**: None
     - **Build command**: (leave empty)
     - **Build output directory**: `/`
   - Click "Save and Deploy"

3. **Configure Custom Domain**
   - In Cloudflare Pages, go to your project
   - Click "Custom domains" → Add custom domain
   - Enter `mredchristie.dev`
   - Follow DNS setup instructions

### Option 2: Using Cloudflare R2 Bucket

If you want to use R2 bucket storage:

1. **Create R2 Bucket**

   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Create bucket
   wrangler r2 bucket create portfolio-website
   ```

2. **Upload Files**

   ```bash
   # Upload all files to R2
   wrangler r2 object put portfolio-website/index.html --file=index.html
   wrangler r2 object put portfolio-website/styles.css --file=styles.css
   wrangler r2 object put portfolio-website/script.js --file=script.js
   wrangler r2 object put portfolio-website/profile.jpg --file=profile.jpg
   ```

3. **Configure Public Access**
   - Go to R2 in Cloudflare Dashboard
   - Select your bucket
   - Enable public access
   - Connect custom domain `mredchristie.dev`

## 📝 Customization Guide

### 1. Replace Placeholder Information

**In `index.html`:**

- Line 78-85: Update personal information (age, location, university, status)
- Line 87-92: Modify the about description
- Line 238-260: Update contact links (email, LinkedIn, GitHub)
- Add your profile picture as `profile.jpg` in the same directory

**In `script.js`:**

- Line 2: Update the terminal typing text with your own introduction
- Line 67: Replace `'yourusername'` with your actual GitHub username
- Line 256-257: Update GitHub profile URL in console message

### 2. Add Your Profile Picture

Replace the `profile.jpg` placeholder with your actual photo:

- Recommended size: 600x600px minimum
- Format: JPG, PNG, or WebP
- Name it `profile.jpg` or update the src in `index.html` line 54

### 3. Customize Colors

Edit CSS variables in `styles.css` (lines 1-11):

```css
:root {
  --primary: #00ff88; /* Main accent color */
  --secondary: #0099ff; /* Secondary accent */
  --bg-dark: #0a0e27; /* Dark background */
  --bg-darker: #050816; /* Darker background */
}
```

### 4. Update Skills

In `index.html`, section starting at line 103, modify skill categories and tags to match your expertise.

### 5. Configure GitHub Integration

The site automatically fetches your 6 most recently updated public repositories. To customize:

- Edit `script.js` line 70 to change the number of repos
- Modify line 75-76 to change filtering/sorting logic

## 📁 Project Structure

```
portfolio-website/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
├── profile.jpg         # Your profile picture
└── README.md          # This file
```

## 🎨 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript** - No framework dependencies
- **GitHub API** - Dynamic project loading
- **Google Fonts** - JetBrains Mono & Inter

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Local Development

1. Clone the repository
2. Open `index.html` in a browser
3. Or use a local server:

   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx http-server
   ```

4. Navigate to `http://localhost:8000`

## ⚡ Performance Tips

- Images are lazy-loaded
- CSS animations use GPU acceleration
- Minimal JavaScript dependencies
- Optimized for Lighthouse scores

## 🎯 Future Enhancements

- [ ] Add dark/light theme toggle
- [ ] Blog section integration
- [ ] Contact form with Cloudflare Workers
- [ ] Project case studies
- [ ] Resume download section
- [ ] Analytics integration

## 📄 License

Feel free to use this template for your own portfolio. Attribution appreciated but not required!

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request.

## 📧 Contact

- Website: mredchristie.dev
- LinkedIn: [Your LinkedIn URL]
- GitHub: [Your GitHub URL]

---

**Built with 💚 by Ed Christie**
