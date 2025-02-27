const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Create projects directory if it doesn't exist
const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir);
}

// Read the project template
const templatePath = path.join(__dirname, 'project.html');
const templateContent = fs.readFileSync(templatePath, 'utf-8');
const template = Handlebars.compile(templateContent);

// Read the projects data
const projectsPath = path.join(__dirname, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

// Generate individual project pages
projects.forEach(project => {
    // Extract slug from URL
    const slug = path.basename(project.url);
    
    // Prepare the data for the template
    const templateData = {
        ...project,
        // Add any additional processing here if needed
        currentYear: new Date().getFullYear()
    };
    
    // Generate HTML content
    const htmlContent = template(templateData);
    
    // Write to file
    const outputPath = path.join(projectsDir, slug);
    fs.writeFileSync(outputPath, htmlContent);
    
    console.log(`Generated page for: ${project.title}`);
});

console.log('All project pages generated successfully!');

//npm install handlebars
//node generate-pages.js