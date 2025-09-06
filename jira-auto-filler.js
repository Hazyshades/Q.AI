// Automatic Jira field filler
(function() {
  // Automatic Jira field filler loaded
  
  function fillJiraForm() {
    // Start filling fields
    
    try {
      // Get data from localStorage
      const savedData = localStorage.getItem('jiraFormData');
      if (!savedData) {
        // No data found for filling
        return;
      }
      
      const formData = JSON.parse(savedData);
      // Data for filling obtained
      
      // Fill Summary
      const summaryField = document.getElementById('summary') || document.querySelector('input[name="summary"]');
      if (summaryField) {
        summaryField.value = formData.summary;
        summaryField.dispatchEvent(new Event('input', { bubbles: true }));
        // Summary filled
      } else {
        // Summary field not found
      }
      
      // Fill Description
      const descField = document.getElementById('description') || document.querySelector('textarea[name="description"]');
      if (descField) {
        descField.value = formData.description;
        descField.dispatchEvent(new Event('input', { bubbles: true }));
        // Description filled
      } else {
        // Description field not found
      }
      
      // Fill Priority
      const priorityField = document.getElementById('priority') || document.querySelector('select[name="priority"]');
      if (priorityField) {
        priorityField.value = formData.priority;
        priorityField.dispatchEvent(new Event('change', { bubbles: true }));
        // Priority filled
      } else {
        // Priority field not found
      }
      
      // Fill Components
      const componentsField = document.getElementById('components') || document.querySelector('input[name="components"]');
      if (componentsField) {
        componentsField.value = formData.components;
        componentsField.dispatchEvent(new Event('input', { bubbles: true }));
        // Components filled
      } else {
        // Components field not found
      }
      
      // Fill Labels
      const labelsField = document.getElementById('labels') || document.querySelector('input[name="labels"]');
      if (labelsField) {
        labelsField.value = formData.labels;
        labelsField.dispatchEvent(new Event('input', { bubbles: true }));
        // Labels filled
      } else {
        // Labels field not found
      }
      
      // Field filling completed
      
      // Show notification
      const notification = document.createElement('div');
      notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 8px; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: Arial, sans-serif; font-size: 14px;';
      notification.innerHTML = '✅ Fields filled automatically!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
      
      // Clear data after use
      localStorage.removeItem('jiraFormData');
      
    } catch (error) {
      console.error('❌ Error filling fields:', error);
    }
  }
  
  // Wait for page load and fill fields
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillJiraForm);
  } else {
    fillJiraForm();
  }
  
  // Retry after 2 seconds in case form is still loading
  setTimeout(fillJiraForm, 2000);
  setTimeout(fillJiraForm, 5000);
})();
