(() => {
      const key = 'gf2-ui-theme-v1';
      try {
        const saved = localStorage.getItem(key);
        const theme = saved === 'light' || saved === 'dark'
          ? saved
          : (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.dataset.theme = theme;
      } catch (_) {
        document.documentElement.dataset.theme = 'dark';
      }
    })();
