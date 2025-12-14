const express = require('express');
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter'); // Parses the --- metadata ---
const marked = require('marked');      // Converts Markdown to HTML

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// 1. HOME ROUTE (Automatically lists all notes)
app.get('/', (req, res) => {
    const postsDir = path.join(__dirname, 'posts');
    
    // Read all files in the 'posts' folder
    const files = fs.readdirSync(postsDir);
    
    // Get data from each file
    const posts = files.map(filename => {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent); // Extract title, date, etc.
        
        return {
            slug: filename.replace('.md', ''), // e.g., 'generative-replay'
            title: data.title,
            date: data.date,
            category: data.category
        };
    });

    // Send this data to index.ejs
    res.render('index', { posts: posts });
});

// 2. NOTE ROUTE (Loads a specific note)
app.get('/posts/:slug', (req, res) => {
    const slug = req.params.slug;
    const filePath = path.join(__dirname, 'posts', `${slug}.md`);

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        
        // Convert Markdown content to HTML
        const htmlContent = marked.parse(content);

        // Send to note.ejs
        res.render('note', { 
            title: data.title, 
            date: data.date, 
            category: data.category,
            abstract: data.abstract,
            content: htmlContent 
        });
    } else {
        res.status(404).send('Note not found');
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));