class Store {
    constructor() {
      this.subscribers = new Set();
      this.state = {
        tasks: this.loadTasks(),
        language: localStorage.getItem('language') || 'en',
        darkMode: localStorage.getItem('darkMode') === 'true'
      };
    }
  
    loadTasks() {
      return JSON.parse(localStorage.getItem('tasks') || '[]')
        .map(task => ({ ...task, createdAt: task.createdAt || new Date().toISOString() }));
    }
  
    subscribe(callback) {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    }
  
    notify() {
      this.subscribers.forEach(callback => callback(this.state));
    }
  
    setState(newState) {
      this.state = { ...this.state, ...newState };
      if (newState.tasks) {
        localStorage.setItem('tasks', JSON.stringify(newState.tasks));
      }
      this.notify();
    }
  
    getCategories() {
      return [...new Set(this.state.tasks.map(task => task.category).filter(Boolean))];
    }
  }
  
  export const store = new Store();