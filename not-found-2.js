(() => {
      const themeKey = 'gf2-ui-theme-v1';
      const root = document.documentElement;
      const button = document.getElementById('themeToggle');
      const icon = document.getElementById('themeIcon');
      const pathBox = document.getElementById('requestedPath');
      const backButton = document.getElementById('backButton');

      function applyTheme(theme) {
        const nextTheme = theme === 'light' ? 'light' : 'dark';
        root.dataset.theme = nextTheme;
        const isDark = nextTheme === 'dark';
        icon.textContent = isDark ? '☀' : '🌙';
        const label = isDark ? '밝은 화면으로 전환' : '어두운 화면으로 전환';
        button.setAttribute('aria-label', label);
        button.title = label;
      }

      applyTheme(root.dataset.theme);

      button.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        try { localStorage.setItem(themeKey, nextTheme); } catch (_) {}
      });

      pathBox.textContent = `${location.pathname}${location.search}${location.hash}`;

      backButton.addEventListener('click', () => {
        if (history.length > 1) history.back();
        else location.href = '/';
      });
    })();
