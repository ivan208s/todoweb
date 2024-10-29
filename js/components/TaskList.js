import { getDueDateStatus, getPriorityColor, renderMarkdown, filterTasks, sortTasks } from '../utils.js';

export class TaskList {
  constructor(containerId, options = {}) {
    this.container = document.querySelector(containerId);
    this.options = {
      itemsPerPage: options.itemsPerPage || 10,
      onStatusChange: options.onStatusChange || (() => {}),
      onEdit: options.onEdit || (() => {}),
      onDelete: options.onDelete || (() => {}),
      onCategoryEdit: options.onCategoryEdit || (() => {}),
      onReorder: options.onReorder || (() => {}),
      translations: options.translations || {}
    };
    this.currentPage = 1;
    this.draggedItem = null;
    this.currentFilters = {};
    this.tasks = [];
  }

  update({ tasks, translations }) {
    this.tasks = tasks;
    this.options.translations = translations;
    this.render();
  }

  applyFilters(filters) {
    this.currentFilters = filters;
    this.render();
  }

  render() {
    let processedTasks = filterTasks(this.tasks, this.currentFilters);
    if (this.currentFilters.sortBy) {
      processedTasks = sortTasks(processedTasks, this.currentFilters.sortBy);
    }

    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
    const endIndex = startIndex + this.options.itemsPerPage;
    const paginatedTasks = processedTasks.slice(startIndex, endIndex);

    this.container.innerHTML = `
      <ul class="space-y-4 task-list" role="list" aria-label="Todo list">
        ${paginatedTasks.map((task, index) => this.renderTask(task, startIndex + index)).join('')}
      </ul>
      ${this.renderPagination(processedTasks.length)}
    `;

    this.attachEventListeners();
  }

  renderTask(task, index) {
    const t = this.options.translations;
    const dueDateStatus = getDueDateStatus(task.endDate);
    const taskContent = renderMarkdown(task.markdown || task.text);
    
    return `
      <li class="${this.getTaskRowClass(task, dueDateStatus)}" 
          data-task-index="${index}"
          draggable="true"
          aria-label="Task item. Press Space to start dragging">
        <div class="flex-1">
          <div class="flex items-start space-x-2">
            <div class="drag-handle px-2 py-1 cursor-move" aria-hidden="true">⋮⋮</div>
            <input 
              type="checkbox" 
              ${task.completed ? 'checked' : ''} 
              class="form-checkbox h-5 w-5 mt-1 text-blue-600 dark:text-blue-400"
              aria-label="${t.markAs} ${task.completed ? t.incomplete : t.completed}"
            >
            <div class="flex-1">
              <div class="${task.completed ? 'line-through' : ''} prose dark:prose-invert max-w-none">
                ${taskContent}
              </div>
              ${this.renderSubtasks(task, index, t)}
              ${this.renderAddSubtaskForm(index, t)}
            </div>
          </div>
          ${this.renderTaskMetadata(task, index, t)}
        </div>
      </li>
    `;
  }

  renderSubtasks(task, taskIndex, t) {
    if (!task.subtasks?.length) return '';
    
    return `
      <div class="mt-4 ml-8 space-y-2">
        ${task.subtasks.map((subtask, subIndex) => `
          <div class="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <input 
              type="checkbox" 
              ${subtask.completed ? 'checked' : ''} 
              class="subtask-checkbox form-checkbox h-4 w-4 text-blue-600"
              data-task-index="${taskIndex}"
              data-subtask-index="${subIndex}"
            >
            <span class="${subtask.completed ? 'line-through' : ''}">${subtask.text}</span>
            <button 
              class="delete-subtask-btn ml-auto text-red-500 hover:text-red-700 text-sm"
              data-task-index="${taskIndex}"
              data-subtask-index="${subIndex}"
              aria-label="${t.deleteSubtask}"
            >×</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAddSubtaskForm(taskIndex, t) {
    return `
      <div class="mt-2 ml-8">
        <form class="add-subtask-form flex space-x-2" data-task-index="${taskIndex}">
          <input 
            type="text" 
            class="flex-1 p-1 text-sm border rounded dark:bg-gray-700 dark:text-white"
            placeholder="${t.addSubtask}"
            required
          >
          <button type="submit" class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
        </form>
      </div>
    `;
  }

  renderTaskMetadata(task, index, t) {
    const dueDateIndicator = this.getDueDateIndicator(task.endDate, t);
    
    return `
      <div class="flex flex-wrap gap-4 mt-4 ml-10">
        <span class="text-sm ${getPriorityColor(task.priority)}">${task.priority}</span>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            ${task.startDate} - ${task.endDate}
          </span>
          ${dueDateIndicator}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500 category-text" title="${t.editCategory}">
            ${task.category || t.noCategory}
          </span>
          <button class="edit-category-btn text-blue-500 hover:text-blue-700 text-sm" aria-label="${t.editCategory}">
            ✎
          </button>
        </div>
        <div class="flex space-x-2">
          <button class="edit-btn text-blue-500 hover:text-blue-700" aria-label="${t.edit}">
            ${t.edit}
          </button>
          <button class="delete-btn text-red-500 hover:text-red-700" aria-label="${t.delete}">
            ${t.delete}
          </button>
        </div>
      </div>
    `;
  }

  getTaskRowClass(task, status) {
    const baseClasses = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 cursor-move';
    
    if (task.completed) return `${baseClasses} opacity-50`;
    
    const statusClasses = {
      'overdue': 'border-l-4 border-red-500',
      'due-soon': 'border-l-4 border-yellow-500',
      'normal': ''
    };

    return `${baseClasses} ${statusClasses[status] || ''}`;
  }

  getDueDateIndicator(endDate, t) {
    const status = getDueDateStatus(endDate);
    if (!status) return '';

    const indicators = {
      'overdue': `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">${t.overdue}</span>`,
      'due-soon': `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">${t.dueSoon}</span>`,
      'normal': ''
    };

    return indicators[status];
  }

  renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.options.itemsPerPage);
    if (totalPages <= 1) return '';

    return `
      <div class="flex justify-center space-x-2 mt-4" role="navigation" aria-label="Pagination">
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(page => `
            <button 
              class="px-3 py-1 rounded ${
                page === this.currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }"
              ${page === this.currentPage ? 'aria-current="page"' : ''}
              data-page="${page}"
            >
              ${page}
            </button>
          `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    this.attachCheckboxListeners();
    this.attachButtonListeners();
    this.attachDragAndDropListeners();
    this.attachSubtaskListeners();
    this.attachPaginationListeners();
  }

  attachCheckboxListeners() {
    this.container.querySelectorAll('input[type="checkbox"]:not(.subtask-checkbox)').forEach((checkbox, index) => {
      checkbox.addEventListener('change', () => this.options.onStatusChange(index));
    });
  }

  attachButtonListeners() {
    this.container.querySelectorAll('.edit-btn').forEach((button, index) => {
      button.addEventListener('click', () => this.options.onEdit(this.tasks[index], index));
    });

    this.container.querySelectorAll('.delete-btn').forEach((button, index) => {
      button.addEventListener('click', () => this.options.onDelete(index));
    });

    this.container.querySelectorAll('.category-text, .edit-category-btn').forEach((element, index) => {
      element.addEventListener('click', () => this.options.onCategoryEdit(index));
    });
  }

  attachDragAndDropListeners() {
    const taskItems = this.container.querySelectorAll('li[draggable="true"]');
    
    taskItems.forEach(item => {
      item.addEventListener('dragstart', e => this.handleDragStart(e));
      item.addEventListener('dragend', e => this.handleDragEnd(e));
      item.addEventListener('dragover', e => this.handleDragOver(e));
      item.addEventListener('drop', e => this.handleDrop(e));
      
      item.addEventListener('keydown', e => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          item.setAttribute('aria-grabbed', 'true');
          this.draggedItem = item;
        }
      });
    });
  }

  attachSubtaskListeners() {
    this.container.querySelectorAll('.add-subtask-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const taskIndex = parseInt(form.dataset.taskIndex);
        const input = form.querySelector('input');
        const subtask = { text: input.value, completed: false };
        
        const updatedTasks = [...this.tasks];
        if (!updatedTasks[taskIndex].subtasks) {
          updatedTasks[taskIndex].subtasks = [];
        }
        updatedTasks[taskIndex].subtasks.push(subtask);
        this.options.onReorder(updatedTasks);
        input.value = '';
      });
    });

    this.container.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        const subtaskIndex = parseInt(e.target.dataset.subtaskIndex);
        const updatedTasks = [...this.tasks];
        updatedTasks[taskIndex].subtasks[subtaskIndex].completed = e.target.checked;
        this.options.onReorder(updatedTasks);
      });
    });

    this.container.querySelectorAll('.delete-subtask-btn').forEach(button => {
      button.addEventListener('click', e => {
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        const subtaskIndex = parseInt(e.target.dataset.subtaskIndex);
        const updatedTasks = [...this.tasks];
        updatedTasks[taskIndex].subtasks.splice(subtaskIndex, 1);
        this.options.onReorder(updatedTasks);
      });
    });
  }

  attachPaginationListeners() {
    this.container.querySelectorAll('[data-page]').forEach(button => {
      button.addEventListener('click', () => {
        this.currentPage = parseInt(button.dataset.page);
        this.render();
      });
    });
  }

  handleDragStart(e) {
    this.draggedItem = e.target.closest('li');
    e.target.closest('li').classList.add('opacity-50');
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragEnd(e) {
    e.target.closest('li').classList.remove('opacity-50');
    this.draggedItem = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const item = e.target.closest('li');
    if (item && item !== this.draggedItem) {
      const rect = item.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      if (e.clientY < midpoint) {
        item.classList.add('border-t-2', 'border-blue-500');
        item.classList.remove('border-b-2');
      } else {
        item.classList.add('border-b-2', 'border-blue-500');
        item.classList.remove('border-t-2');
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('li');
    
    if (dropTarget && this.draggedItem) {
      const draggedIdx = parseInt(this.draggedItem.dataset.taskIndex);
      const dropIdx = parseInt(dropTarget.dataset.taskIndex);
      
      if (draggedIdx !== dropIdx) {
        dropTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
        
        const updatedTasks = [...this.tasks];
        const [movedTask] = updatedTasks.splice(draggedIdx, 1);
        updatedTasks.splice(dropIdx, 0, movedTask);
        
        this.options.onReorder(updatedTasks);
      }
    }
  }
}