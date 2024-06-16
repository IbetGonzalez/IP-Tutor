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

    r.Route("/games", gamesHandler)
    r.Get("/settings", settingsHandler)
    r.Get("/", indexHandler)


    fmt.Printf("Listening on %s:%s... \n", IP, PORT)
    log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", IP, PORT), r ))
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("favicon...")
	http.ServeFile(w, r, "./favicon.ico")
}
func renderResponse(title string, src string, w http.ResponseWriter, r *http.Request) {
    var data *Page;
    var base *template.Template;
    var err error;

    if r.Header.Get("HX-Request") == "true" {
        base, err = template.ParseFiles(src);
        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        data = &Page{Title: title, Content:  ""}
    } else {
        base, err = template.ParseFiles("./frontend/templates/base.html");
        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        content, err := os.ReadFile(src)

        if err!= nil {
            fmt.Println(err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        data = &Page{Title: title, Content:  template.HTML(content)}

    }
    base.Execute(w, data)
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
    contentDir := "./frontend/templates/settingContent.html"
    title := "Settings"


    renderResponse(title, contentDir, w, r);
}
func gamesHandler(r chi.Router) {
    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        contentDir := "./frontend/templates/gameContent.html"
        title := "Home"

        renderResponse(title, contentDir, w, r);
    })
    r.Get("/{game}", func(w http.ResponseWriter, r *http.Request) {
        game := chi.URLParam(r, "game")
        contentDir := fmt.Sprintf("./frontend/templates/games/%s.html", game);
        title := game;

        renderResponse(title, contentDir, w, r);

    })
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
    contentDir := "./frontend/templates/homeContent.html"
    title := "Home"
    renderResponse(title, contentDir, w, r);
}

