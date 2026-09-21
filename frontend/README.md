# HomeLibrary Frontend

A modern, responsive frontend for the HomeLibrary application with full CRUD operations and XML editor support.

## Features
- 📚 Display all books in a paginated table
- 🔍 Real-time search functionality
- ➕ Create new books with validation
- ✏️ Edit existing books
- 🗑️ Delete books with confirmation
- 📝 XML Editor for Table of Contents with:
  - ✅ Syntax highlighting
  - 📋 Auto-formatting
  - ✓ Validation
  - 📖 Live preview
- 📱 Responsive design for mobile and desktop
- 🎨 Modern UI with hover effects and animations
- ⚡ Fast API integration

## Files
- `index.html` - Main application structure with modals
- `style.css` - Main styling and responsive design
- `xml-editor.css` - XML editor specific styles
- `app.js` - API communication, pagination, search, and XML editor logic
- `Dockerfile` - Docker configuration for nginx
- `README.md` - This documentation

## Running the Application

### Option 1: Using Docker Compose (Recommended)
From the root directory of the project:
```bash
docker compose up --build
```
The frontend will be available at: `http://localhost:3000`
The backend API will be available at: `http://localhost:5000`

### Option 2: Running Locally (Development)
```bash
cd frontend
python -m http.server 3000
# or
npx http-server
```
Then open `http://localhost:3000` in your browser.

## API Integration
The frontend communicates with the backend at `http://localhost:5000/api/library`:
- `GET /book/page={page}&pageSize={pageSize}` - Fetch paginated books
- `GET /book/query={query}&page={page}&pageSize={pageSize}` - Search books
- `GET /book/{id}` - Get single book details
- `POST /book` - Create new book
- `PATCH /book` - Update existing book
- `DELETE /book/{id}` - Delete a book

## XML Editor Features
The Table of Contents field includes a dedicated XML editor with:
- **Syntax Highlighting**: Color-coded tags, attributes, and values
- **Auto-Formatting**: One-click formatting with proper indentation
- **Validation**: Real-time XML validation with status indicator
- **Live Preview**: See formatted XML output in real-time
- **Tab Support**: Press Tab to insert 2 spaces for indentation
- **Clear Function**: Quickly clear the editor

## Customization
- Change `API_BASE_URL` in `app.js` to point to your backend
- Adjust `PAGE_SIZE` in `app.js` to change records per page
- Modify `style.css` and `xml-editor.css` to customize the appearance
