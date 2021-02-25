#!/usr/bin/env node

import fs, { readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import marked from 'marked'
import mkdirp from 'mkdirp'
import glob from 'glob'
import YAML from 'yaml'
import ditherAll from './imageDithering.js'


//links will contain objects with links + titles to all the posts
const links = []
//parse the markdown file, convert to html
const readFile = (filename) =>{
    const rawFile = fs.readFileSync(filename, 'utf8')
    const parsed = matter(rawFile)
    const html = marked(parsed.content)
    
    return {...parsed, html}
}

//change the file extension from .md to .html
const getOutputFilename = (filename, outPath)=>{
    const basename = path.basename(filename)
    const newFilename = basename.substring(0, basename.length - 3) + '.html'
    const outfile = path.join(outPath, newFilename)
    return outfile
}



const saveFile = (filename, contents) =>{
    const dir = path.dirname(filename)
    mkdirp.sync(dir)
    fs.writeFileSync(filename, contents)

}

// use template to create individual html pages for each markdown file
const makePost = (template, {date, title, content}) => 
    template
        .replace(/<!--date-->/g, date)
        .replace(/<!--title-->/g, title)
        .replace(/<!--content-->/g, content)


    
       
const processFile = (filename, template, outPath) =>{
    const file = readFile(filename)
    const outFileName = getOutputFilename(filename, outPath)
    const templated = makePost(template, 
        {date: file.data.date, 
        title: file.data.title, 
        content: file.html})
        saveFile(outFileName, templated)
        const parentDir = path.basename(path.dirname(filename))
        
        
        if (parentDir == 'projects'){
            const link = path.basename(outFileName)
            const cat = file.data.category
            let title = file.data.title
            if (title.length > 35) title = title.slice(0, 35) + '...'
            const date = file.data.date
            links.push({title: title, date: date, link: link, cat: cat })
        }
        
        }
//putting it all together -> reading, parsing, processing + writing html files from markdown files and saving it to a dist folder. 
const main = () => {
    const srcPath = path.join(path.resolve(), 'src')
    const outPath = path.join(path.resolve(), 'site/dist')
    const template = readFileSync(
        path.join(srcPath, 'template.html'), 
        'utf8'
        )
    const filenames = glob.sync(srcPath + '/pages/**/*.md')

    filenames.forEach((filename) =>{
        processFile(filename, template, outPath)
    })  
}
main();

//make projects page template
const makeIndexPage = (template, content) =>
    template
        .replace(/{{content}}/g, content)

//create index page with links to all pages
const projects = () =>{
    const srcPath = path.join(path.resolve(), 'src')
    const indexTemplate = readFileSync(
        path.join(srcPath, 'projectsTemplate.html'), 
        'utf8'
        )
    const outPath = path.join(path.resolve(), 'site/dist')
    let str = ''
    links.sort((a, b)=>{
        console.log(a, b)
        if (typeof a.date === String){
            a.date = parseInt(a.date.split(" ")[0])
            console.log(a.date)
        } 
        if (typeof b.date === String){
            b.date = parseInt(b.date.split(" ")[0])
            console.log(b.date)
        } 
        if (a.date > b.date) return -1
        else return 1
    })
    
    const list = links.forEach(item=>{
        str +=`<a href="${item.link}"><li class="postSquare"> <h6>${item.title}</h6><h6>${item.cat}</h6><h6>${item.date} </h6></li></a>`
    })

    const indexPage = makeIndexPage(indexTemplate, str)
    saveFile(outPath + '/projects.html', indexPage)
}
projects();


export default {
    main, projects
}




