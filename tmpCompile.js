const fs = require('fs');
const {compile} = require('@mdx-js/mdx');
(async ()=>{
  try {
    const content = fs.readFileSync('src/content/blogs/welcome-to-my-blog.mdx','utf8');
    const mdx = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    const c = await compile(mdx, {jsxImportSource:'react'});
    console.log('compiled length', c.value.length);
    console.log(c.value.slice(0,500));
  } catch(e){console.error('error', e);}
})();