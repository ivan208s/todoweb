import { store } from './store.js';
import { TaskForm } from './components/TaskForm.js';
import { TaskFilters } from './components/TaskFilters.js';
import { TaskList } from './components/TaskList.js';
import { translations } from './translations.js';

class TodoApp {
  constructor() {
    this.initComponents();
    this.setupEventListeners();
    store.subscribe(this.updateUI.bind(this));
  }

  initComponents() {
    const t = translations[store.state.language];
    const categories = store.getCategories();

    this.taskForm = new TaskForm('#taskFormContainer', {
      onSubmit: task => store.setState({ tasks: [...store.state.tasks, task] }),
      categories,
      translations: t
    });

    this.taskFilters = new TaskFilters('#taskFiltersContainer', {
      onFilter: this.handleFilter.bind(this),
      categories,
      translations: t
    });

    this.taskList = new TaskList('#taskList', {
      onStatusChange: this.handleStatusChange.bind(this),
      onEdit: this.handleEdit.bind(this),
      onDelete: this.handleDelete.bind(this),
      onCategoryEdit: this.handleCategoryEdit.bind(this),
      onReorder: tasks => store.setState({ tasks }),
      translations: t
    });
  }

  setupEventListeners() {
    this.setupLanguageToggle();
    this.setupDarkMode();
    this.setupExportImport();
    this.setupKeyboardShortcuts();
  }

  updateUI(state) {
    const t = translations[state.language];
    const categories = store.getCategories();

    this.taskForm.update({ categories, translations: t });
    this.taskFilters.update({ categories, translations: t });
    this.taskList.update({ tasks: state.tasks, translations: t });
    document.documentElement.classList.toggle('dark', state.darkMode);
  }

  handleFilter(filters) {
    this.taskList.applyFilters(filters);
  }

  handleStatusChange(index) {
    const tasks = [...store.state.tasks];
    tasks[index].completed = !tasks[index].completed;
    store.setState({ tasks });
  }

  handleEdit(task, index) {
    // Edit dialog logic remains in TaskList component
  }

  handleDelete(index) {
    if (confirm(translations[store.state.language].deleteConfirmation)) {
      const tasks = store.state.tasks.filter((_, i) => i !== index);
      store.setState({ tasks });
    }
  }

  handleCategoryEdit(index) {
    const t = translations[store.state.language];
    const task = store.state.tasks[index];
    const newCategory = prompt(t.enterCategory, task.category || '');
    
    if (newCategory !== null) {
      const tasks = [...store.state.tasks];
      tasks[index].category = newCategory.trim();
      store.setState({ tasks });
    }
  }

  setupLanguageToggle() {
    document.getElementById('languageToggle').addEventListener('click', () => {
      const language = store.state.language === 'en' ? 'vi' : 'en';
      store.setState({ language });
      document.documentElement.lang = language;
      localStorage.setItem('language', language);
    });
  }

  setupDarkMode() {
    document.getElementById('darkModeToggle').addEventListener('click', () => {
      const darkMode = !store.state.darkMode;
      store.setState({ darkMode });
      localStorage.setItem('darkMode', darkMode);
    });
  }

  setupExportImport() {
    // Export/Import logic remains the same
  }

  setupKeyboardShortcuts() {
    // Keyboard shortcuts logic remains the same
  }
}

document.addEventListener('DOMContentLoaded', () => new TodoApp());