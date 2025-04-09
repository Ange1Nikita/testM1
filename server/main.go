package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-faker/faker/v4"
)

type Item struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	Active      bool      `json:"active"`
}

var items []Item

func init() {
	items = make([]Item, 5000)
	for i := range items {
		items[i] = Item{
			ID:          i + 1,
			Title:       faker.Sentence(),
			Description: faker.Paragraph(),
			CreatedAt:   time.Now().Add(-time.Duration(i) * time.Hour),
			Active:      i%2 == 0,
		}
	}
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func getItems(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	activeOnly := r.URL.Query().Get("active")
	sortDirection := r.URL.Query().Get("sort")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 100
	}

	var filteredItems []Item
	for _, item := range items {
		if activeOnly == "true" && !item.Active {
			continue
		}
		if query != "" {
			idStr := strconv.Itoa(item.ID)
			if !strings.Contains(strings.ToLower(idStr), strings.ToLower(query)) {
				continue
			}
		}
		filteredItems = append(filteredItems, item)
	}

	// Сортировка элементов
	if sortDirection == "asc" {
		// Сортировка по возрастанию ID
		for i := 0; i < len(filteredItems)-1; i++ {
			for j := i + 1; j < len(filteredItems); j++ {
				if filteredItems[i].ID > filteredItems[j].ID {
					filteredItems[i], filteredItems[j] = filteredItems[j], filteredItems[i]
				}
			}
		}
	} else {
		// Сортировка по убыванию ID (по умолчанию)
		for i := 0; i < len(filteredItems)-1; i++ {
			for j := i + 1; j < len(filteredItems); j++ {
				if filteredItems[i].ID < filteredItems[j].ID {
					filteredItems[i], filteredItems[j] = filteredItems[j], filteredItems[i]
				}
			}
		}
	}

	total := len(filteredItems)
	totalPages := (total + limit - 1) / limit

	start := (page - 1) * limit
	end := start + limit
	if end > total {
		end = total
	}

	if start >= total {
		start = 0
		end = 0
	}

	response := map[string]interface{}{
		"items":      filteredItems[start:end],
		"total":      total,
		"totalPages": totalPages,
	}

	writeJSON(w, http.StatusOK, response)
}

func getItemByID(w http.ResponseWriter, r *http.Request, id int) {
	for _, item := range items {
		if item.ID == id {
			writeJSON(w, http.StatusOK, item)
			return
		}
	}

	writeJSON(w, http.StatusNotFound, map[string]string{"error": "Item not found"})
}

func toggleItemActive(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		ID int `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	found := false
	for i := range items {
		if items[i].ID == requestBody.ID {
			items[i].Active = !items[i].Active
			found = true
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(items[i])
			break
		}
	}

	if !found {
		http.Error(w, "Item not found", http.StatusNotFound)
	}
}

func itemsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path == "/items" {
		getItems(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/items/") {
		idStr := strings.TrimPrefix(r.URL.Path, "/items/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid item ID"})
			return
		}

		if r.Method == http.MethodGet {
			getItemByID(w, r, id)
		} else if r.Method == http.MethodPut {
			toggleItemActive(w, r)
		}
		return
	}

	http.NotFound(w, r)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func main() {
	port := os.Getenv("DOCKER_SERVER_PORT")
	if port == "" {
		port = "8080"
		log.Printf("DOCKER_SERVER_PORT not set, using default port %s", port)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/items", itemsHandler)
	mux.HandleFunc("/items/", itemsHandler)

	handler := loggingMiddleware(enableCORS(mux))

	addr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Server is running on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
