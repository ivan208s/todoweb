import { store } from '../store.js';

export class TaskFilters {
  constructor(containerId, options = {}) {
    this.container = document.querySelector(containerId);
    this.options = {
      onFilter: options.onFilter || (() => {}),
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
    this.container.innerHTML = this.getFiltersTemplate(t);
    this.attachEventListeners();
  }

  getFiltersTemplate(t) {
    return `
      <div class="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4" role="search">
        <div class="form-group">
          <label for="searchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${t.searchTasks}
          </label>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="${t.search}" 
            class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
        </div>

        <div class="form-group">
          <label for="filterPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${t.priorityFilter}
          </label>
          <select id="filterPriority" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="all">${t.allPriorities}</option>
            <option value="Cao">${t.high}</option>
            <option value="Trung bình">${t.medium}</option>
            <option value="Thấp">${t.low}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="filterStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${t.statusFilter}
          </label>
          <select id="filterStatus" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="all">${t.allStatuses}</option>
            <option value="completed">${t.completed}</option>
            <option value="incomplete">${t.incomplete}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="filterCategory" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${t.categoryFilter}
          </label>
          <select id="filterCategory" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="all">${t.allCategories}</option>
            ${this.options.categories.map(category => `
              <option value="${category}">${category}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="sortBy" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ${t.sortBy}
          </label>
          <select id="sortBy" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="dateCreated-desc">${t.dateCreatedNewest}</option>
            <option value="dateCreated-asc">${t.dateCreatedOldest}</option>
            <option value="dueDate-asc">${t.dueDateEarliest}</option>
            <option value="dueDate-desc">${t.dueDateLatest}</option>
            <option value="priority-desc">${t.priorityHighToLow}</option>
            <option value="priority-asc">${t.priorityLowToHigh}</option>
            <option value="status-desc">${t.statusCompletedFirst}</option>
            <option value="status-asc">${t.statusIncompleteFirst}</option>
          </select>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    ['searchInput', 'filterPriority', 'filterStatus', 'filterCategory', 'sortBy'].forEach(id => {
      this.container.querySelector(`#${id}`).addEventListener('input', () => this.emitFilters());
    });
  }

  emitFilters() {
    const filters = {
      search: this.container.querySelector('#searchInput').value,
      priority: this.container.querySelector('#filterPriority').value,
      status: this.container.querySelector('#filterStatus').value,
      category: this.container.querySelector('#filterCategory').value,
      sortBy: this.container.querySelector('#sortBy').value
    };
    this.options.onFilter(filters);
  }
}