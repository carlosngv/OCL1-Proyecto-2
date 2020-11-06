package main

import (
	"html/template"
	"net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
	t := template.Must(template.ParseFiles("index.html"))
	t.Execute(w, "")
}

func main() {
	//router := mux.NewRouter()
	http.Handle("/Website/styles/", http.StripPrefix("/Website/styles/", http.FileServer(http.Dir("Website/styles/"))))
	http.Handle("/Website/js/", http.StripPrefix("/Website/js/", http.FileServer(http.Dir("Website/js/"))))
	http.Handle("/Website/codemirror/", http.StripPrefix("/Website/codemirror/", http.FileServer(http.Dir("Website/codemirror/"))))
	http.HandleFunc("/", index)
	http.ListenAndServe(":3900", nil)
}
