import { sanitizeHTML, renderMarkdown } from '../utils.js';

export class TaskForm {
  constructor(containerId, options = {}) {
    this.container = document.querySelector(containerId);
    this.options = {
      onSubmit: options.onSubmit || (() => {}),
      categories: options.categories || [],
      translations: options.translations || {}
    };
    this.render();
  }

  update(options) {
    Object.assign(this.options, options);
    this.render();
  }

  render() {
    const t = this.options.translations;
    this.container.innerHTML = this.getFormTemplate(t);
    this.attachEventListeners();
  }

  getFormTemplate(t) {
    return `
      <form class="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" aria-label="${t.addTask}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group md:col-span-2">
            <label for="taskInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ${t.taskDescription} <span class="text-xs text-gray-500">(Markdown supported)</span>
            </label>
            <textarea 
              id="taskInput" 
              name="taskInput" 
              placeholder="${t.taskDescription}" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white min-h-[100px]"
              required
            ></textarea>
            <div id="markdownPreview" class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 prose dark:prose-invert"></div>
          </div>

          <div class="form-group">
            <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ${t.priority}
            </label>
            <select id="priority" name="priority" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
              <option value="Thấp">${t.low}</option>
              <option value="Trung bình">${t.medium}</option>
              <option value="Cao">${t.high}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ${t.category}
            </label>
            <input 
              type="text" 
              id="category" 
              name="category" 
              list="categories"
              placeholder="${t.enterCategory}" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
            <datalist id="categories">
              ${this.options.categories.map(category => `<option value="${category}">`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ${t.startDate}
            </label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
          </div>

          <div class="form-group">
            <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ${t.endDate}
            </label>
            <input 
              type="date" 
              id="endDate" 
              name="endDate" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
          </div>

          <div class="form-group md:col-span-2">
            <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              ${t.addTask}
            </button>
          </div>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    const form = this.container.querySelector('form');
    const taskInput = form.querySelector('#taskInput');
    const preview = form.querySelector('#markdownPreview');

    taskInput.addEventListener('input', () => {
      preview.innerHTML = renderMarkdown(taskInput.value);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      const task = {
        text: sanitizeHTML(formData.get('taskInput')),
        priority: formData.get('priority'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        category: sanitizeHTML(formData.get('category')),
        completed: false,
        markdown: formData.get('taskInput'),
        createdAt: new Date().toISOString()
      };

      this.options.onSubmit(task);
      e.target.reset();
      preview.innerHTML = '';
    });
  }
}