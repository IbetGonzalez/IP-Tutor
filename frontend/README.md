# Frontend

## static

Static directory contains js, css, and images. HTML elements will use a GET request to request
files from here. The URL subdirectory will be "/static/{FilePath in Static File}"

#### example
For js file: "/static/js/scripts.js"

## templates

the Templates directory contains all HTML template files. 

* #### Base HTML

    Contains the base HTML template, i.e. head elements, header, footer, nav-menu, etc...
    
    When a button is clicked, HTMX switches out the InnerHTML of div.content

* #### Content HTML Files

    Contains HTML files for page content.
    
    * ##### homeContent.html
    
        subdirectory:  "/"
        
        contains html content for the index directory
        
    * ##### settingsContent.html
    
        subdirectory: "/settings"
        
        contains html content for any settings
        
    * ##### gameContent.html
     
        subdirectory:  "/games"
        
        contains html content for the game library
        
    
    ### games folder html files ("{gameName}.html")
        
        subdirectory: "/games/{gameName}"
        
        Contains html content for any game.
