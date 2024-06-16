package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Page struct {
    Title string
    Content template.HTML
}

const IP string = "0.0.0.0"
const PORT string = "5000"

func main() {
    r := chi.NewRouter();
    r.Use(middleware.Logger)

    r.HandleFunc("/favicon.ico", faviconHandler)
    fs := http.FileServer(http.Dir("./frontend/static/"))
    r.Handle("/static/*", http.StripPrefix("/static/", fs))

    r.Get("/games", gameHandler)
    r.Get("/settings", settingsHandler)
    r.Get("/", indexHandler)


    fmt.Printf("Listening on %s:%s... \n", IP, PORT)
    log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", IP, PORT), r ))
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("favicon...")
	http.ServeFile(w, r, "./favicon.ico")
}
func renderResponse(src string, data *Page, w http.ResponseWriter) {
    content, err := template.ParseFiles(src)
    if err != nil {
        fmt.Println(err.Error())
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    content.Execute(w, data)
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
    contentDir := "./frontend/templates/settingContent.html"
    title := "Settings"

    if r.Header.Get("HX-Request") == "true" {
        data := &Page{Title: title, Content:  ""}

        renderResponse(contentDir, data, w)
    } else {
        content, err := os.ReadFile(contentDir)

        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        data := &Page{Title: title, Content:  template.HTML(content)}

        renderResponse("./frontend/templates/base.html", data, w)
    }

}
func gameHandler(w http.ResponseWriter, r *http.Request) {
    contentDir := "./frontend/templates/gameContent.html"
    title := "Home"

    if r.Header.Get("HX-Request") == "true" {
        data := &Page{Title: title, Content:  ""}

        renderResponse(contentDir, data, w)
    } else {
        content, err := os.ReadFile(contentDir)

        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        data := &Page{Title: title, Content:  template.HTML(content)}

        renderResponse("./frontend/templates/base.html", data, w)
    }


}

func indexHandler(w http.ResponseWriter, r *http.Request) {
    contentDir := "./frontend/templates/homeContent.html"
    title := "Home"

    if r.Header.Get("HX-Request") == "true" {
        data := &Page{Title: title, Content:  ""}

        renderResponse(contentDir, data, w)
    } else {
        content, err := os.ReadFile(contentDir)

        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        data := &Page{Title: title, Content:  template.HTML(content)}

        renderResponse("./frontend/templates/base.html", data, w)
    }

}

