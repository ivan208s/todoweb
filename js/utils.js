export const priorityValues = { 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };

export const formatDate = date => date || '';

export const sanitizeHTML = content => DOMPurify.sanitize(content);

export const renderMarkdown = content => sanitizeHTML(marked.parse(content));

export const getDueDateStatus = endDate => {
  if (!endDate) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const dueDate = new Date(endDate).getTime();
  const daysDiff = Math.ceil((dueDate - today) / (1000 * 3600 * 24));
  return daysDiff < 0 ? 'overdue' : daysDiff <= 2 ? 'due-soon' : 'normal';
};

export const getPriorityColor = priority => {
  const colors = {
    'Cao': 'text-red-500 dark:text-red-400',
    'Trung bình': 'text-yellow-500 dark:text-yellow-400',
    'Thấp': 'text-green-500 dark:text-green-400'
  };
  return colors[priority] || 'text-gray-500 dark:text-gray-400';
};

export const sortTasks = (tasks, sortBy) => {
  const [criteria, direction] = sortBy.split('-');
  const sorters = {
    dateCreated: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    dueDate: (a, b) => new Date(a.endDate || '9999-12-31') - new Date(b.endDate || '9999-12-31'),
    priority: (a, b) => (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0),
    status: (a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
  };
  return [...tasks].sort((a, b) => (direction === 'asc' ? 1 : -1) * (sorters[criteria]?.(a, b) || 0));
};

export const filterTasks = (tasks, filters) => tasks.filter(task => {
  const searchMatch = !filters.search || 
    task.text.toLowerCase().includes(filters.search.toLowerCase()) ||
    (task.markdown?.toLowerCase().includes(filters.search.toLowerCase()));
  const priorityMatch = !filters.priority || filters.priority === 'all' || task.priority === filters.priority;
  const statusMatch = !filters.status || filters.status === 'all' || 
    (filters.status === 'completed') === task.completed;
  const categoryMatch = !filters.category || filters.category === 'all' || task.category === filters.category;
  return searchMatch && priorityMatch && statusMatch && categoryMatch;
});