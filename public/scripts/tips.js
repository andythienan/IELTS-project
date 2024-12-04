document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
  
      // Show corresponding tips
      const skill = tab.getAttribute('data-skill');
      document.querySelectorAll('.tips-cards').forEach(cards => {
        cards.classList.remove('active');
      });
      document.getElementById(skill).classList.add('active');
    });
  });
  