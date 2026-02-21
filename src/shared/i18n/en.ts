const en = {
  // Navigation
  'nav.apps': 'Apps',
  'nav.settings': 'Settings',

  // Apps screen
  'apps.title': 'My Apps',
  'apps.description': 'Manage and launch your applications',
  'apps.stats': 'Stats',
  'apps.import': 'Import App',
  'apps.search': 'Search apps...',
  'apps.columns': 'Columns',
  'apps.all': 'All',
  'apps.loading': 'Loading apps...',
  'apps.empty': 'No apps found',
  'apps.empty.first': 'Import your first app to get started',
  'apps.empty.search': 'Try adjusting your search',
  'apps.launches': '{count} launches',

  // App card
  'app.edit': 'Edit',
  'app.favorite': 'Favorite',
  'app.unfavorite': 'Unfavorite',
  'app.delete': 'Delete',

  // Import dialog
  'import.title': 'Import Application',
  'import.path': 'Application Path',
  'import.path.placeholder': 'C:\\Program Files\\...',
  'import.path.required': 'Path is required',
  'import.name': 'Name',
  'import.name.placeholder': 'Application name',
  'import.name.required': 'Name is required',
  'import.args': 'Launch Arguments',
  'import.args.placeholder': '--flag=value --option',
  'import.args.description': 'Command-line arguments passed when launching the app',
  'import.icon': 'Icon',
  'import.icon.browse': 'Browse Image',
  'import.color': 'Card Color',
  'import.categories': 'Categories',
  'import.categories.placeholder': 'General, Productivity',
  'import.categories.description': 'Separate multiple categories with commas',
  'import.cancel': 'Cancel',
  'import.submit': 'Import',
  'import.submitting': 'Importing...',

  // Edit dialog
  'edit.title': 'Edit Application',
  'edit.cancel': 'Cancel',
  'edit.submit': 'Save Changes',
  'edit.submitting': 'Saving...',

  // Common form labels
  'form.optional': '(optional)',

  // Settings screen
  'settings.title': 'Settings',
  'settings.description': 'Manage your settings',
  'settings.loading': 'Loading settings...',
  'settings.resetAll': 'Reset All to Defaults',
  'settings.resetAll.title': 'Reset all settings?',
  'settings.resetAll.description':
    'This will restore all settings to their default values. This action cannot be undone.',
  'settings.resetAll.cancel': 'Cancel',
  'settings.resetAll.confirm': 'Reset',

  // Appearance settings
  'settings.appearance': 'Appearance',
  'settings.appearance.theme': 'Theme',
  'settings.appearance.theme.description': 'Choose your preferred color scheme',
  'settings.appearance.theme.light': 'Light',
  'settings.appearance.theme.dark': 'Dark',
  'settings.appearance.theme.system': 'System',
  'settings.appearance.theme.placeholder': 'Select a theme',
  'settings.appearance.theme.empty': 'No themes found',

  // Behavior settings
  'settings.behavior': 'Behavior',
  'settings.behavior.autoLaunch': 'Launch at startup',
  'settings.behavior.autoLaunch.description': 'Start Apps Manager when you log in',
  'settings.behavior.monitorInterval': 'Monitor interval',
  'settings.behavior.monitorInterval.description': 'How often to refresh system stats',
  'settings.behavior.sidePanel': 'Side panel',
  'settings.behavior.sidePanel.description': 'Show the side panel by default',
  'settings.behavior.autoHide': 'Auto hide navigation',
  'settings.behavior.autoHide.description': 'Hide the navigation when you are not using it',
  'settings.behavior.delayTime': 'Delay time',
  'settings.behavior.delayTime.description': 'The time to delay before hiding the navigation',
  'settings.behavior.delayTime.min': 'Min {min} seconds',
  'settings.behavior.delayTime.seconds': 'Seconds',
  'settings.behavior.delayTime.required': 'Required',
  'settings.behavior.delayTime.mustBeNumber': 'Must be a number',
  'settings.behavior.delayTime.minValue': 'Min {min}s',
  'settings.behavior.navStyle': 'Navigation style',
  'settings.behavior.navStyle.description': 'How the navigation is displayed',
  'settings.behavior.navPosition': 'Navigation position',
  'settings.behavior.navPosition.description': 'Where the navigation is displayed',

  // Start settings
  'settings.start': 'Start',
  'settings.start.actionOnClose': 'Action on close',
  'settings.start.actionOnClose.description': 'What to do when you close the app',
  'settings.start.actionOnClose.placeholder': 'Select an action',
  'settings.start.actionOnClose.empty': 'No actions found',
  'settings.start.windowSize': 'Window size on open',
  'settings.start.windowSize.description': 'Window dimensions when the app starts',
  'settings.start.windowSize.placeholder': 'Select window mode',
  'settings.start.windowSize.empty': 'No modes found',
  'settings.start.windowSize.width': 'Width',
  'settings.start.windowSize.height': 'Height',

  // Language settings
  'settings.language': 'Language',
  'settings.language.select': 'Display language',
  'settings.language.select.description': 'Choose the language for the interface',
  'settings.language.download': 'Download',
  'settings.language.update': 'Update',
  'settings.language.downloading': 'Downloading...',
  'settings.language.installed': 'Installed',
  'settings.language.updateAvailable': 'Update available',
  'settings.language.loadingLanguages': 'Loading languages...',
  'settings.language.noLanguages': 'No languages available',
  'settings.language.builtIn': 'Built-in',

  // System stats
  'stats.systemMonitor': 'System Monitor',
  'stats.cpu': 'CPU',
  'stats.memory': 'Memory',
  'stats.gpu': 'GPU',
  'stats.disks': 'Disks',
  'stats.network': 'Network',
  'stats.battery': 'Battery',
  'stats.battery.charging': 'Charging',
  'stats.battery.remaining': '{minutes} min remaining',
  'stats.battery.cycles': '{count} cycles',
  'stats.processes': 'Processes',
  'stats.processes.total': '{total} total',
  'stats.processes.running': '{running} running',
  'stats.processes.process': 'Process',
  'stats.runningApps': 'Running Apps',
  'stats.runningApps.empty': 'No imported apps are currently running',
  'stats.runningApps.running': 'Running',
  'stats.runningApps.since': 'since {time}',
  'stats.appUsage': 'App Manager Usage',
  'stats.label.used': 'Used',
  'stats.label.available': 'Available',
  'stats.label.total': 'Total',
  'stats.label.swap': 'Swap',
  'stats.label.cpu': 'CPU',
  'stats.label.memory': 'Memory',
  'stats.label.pid': 'PID',
  'stats.label.heapUsed': 'Heap Used',
  'stats.label.heapTotal': 'Heap Total',
  'stats.label.uptime': 'Uptime',
  'stats.label.free': 'free',

  // Kill process dialog
  'kill.title': 'Stop {name}?',
  'kill.description':
    'This will force stop the process (PID: {pid}). Any unsaved work in the application may be lost.',
  'kill.cancel': 'Cancel',
  'kill.confirm': 'Stop',

  // Theme switcher
  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  // Color select
  'color.red': 'Red',
  'color.orange': 'Orange',
  'color.amber': 'Amber',
  'color.green': 'Green',
  'color.teal': 'Teal',
  'color.blue': 'Blue',
  'color.indigo': 'Indigo',
  'color.purple': 'Purple',
  'color.pink': 'Pink',
  'color.default': 'Default (no color)',
  'color.custom': 'Custom color',
  'color.custom.placeholder': '#ff5500 or rgb(255, 85, 0)',

  // Update banner
  'update.available': 'Update v{version} available',
  'update.download': 'Download',
  'update.downloading': 'Downloading update... {percent}%',
  'update.ready': 'Update ready to install',
  'update.restart': 'Restart to apply',

  // Monitor interval options
  'interval.2s': '2 seconds',
  'interval.5s': '5 seconds',
  'interval.10s': '10 seconds',
  'interval.30s': '30 seconds',

  // Action on close options
  'close.quit': 'Quit the app',
  'close.minimize': 'Minimize',

  // Window mode options
  'window.full': 'Full screen',
  'window.custom': 'Custom',

  // Navigation style options
  'navStyle.side': 'Side',
  'navStyle.floating': 'Floating',

  // Navigation position options
  'navPosition.bottom': 'Bottom',
  'navPosition.top': 'Top',
  'navPosition.left': 'Left',
  'navPosition.right': 'Right'
} as const

export default en
