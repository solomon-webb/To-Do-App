# To-Do App

A simple and clean to-do application built with HTML, CSS, and JavaScript.

## Features

- Add new tasks with title, description, and optional date
- Delete tasks
- Track task counters for Today, Scheduled, All, and Overdue
- Persist tasks in browser localStorage
- Responsive layout for desktop and mobile
- Empty-state UI when there are no tasks

## Project Structure

- `index.html` — app structure
- `style.css` — styling and layout
- `index.js` — task logic and local storage

## Run the App

Open `index.html` in your browser.

If you want to serve it locally, you can also use a simple Python HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes

- Tasks are saved in the browser using `localStorage`, so they remain available after page refresh.
- The app is intentionally lightweight and does not require any dependencies or build tools.
