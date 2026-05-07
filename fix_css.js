const fs = require('fs');
let content = fs.readFileSync('frontend/src/css/styles.css', 'utf8');

content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n>>>>>>> Diego/g, '$1');
content = content.replace(/<<<<<<< HEAD\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> Diego/g, '$1');

content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> Diego/g, function(match, headContent, diegoContent) {
    if (headContent.includes('display: none;') && diegoContent.includes('position: fixed;')) {
        return headContent;
    }
    return headContent + '\n' + diegoContent;
});

fs.writeFileSync('frontend/src/css/styles.css', content);
console.log('styles.css fixed');
