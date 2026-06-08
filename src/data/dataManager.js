import { countries, itemsData } from './channelsData';

// Premium background gradients for new avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff416c, #ff4b2b)', // Pink/Red
  'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', // Dark Teal
  'linear-gradient(135deg, #141e30, #243b55)', // Navy/Dark Blue
  'linear-gradient(135deg, #f12711, #f5af19)', // Orange/Yellow
  'linear-gradient(135deg, #fc466b, #3f5efb)', // Pink/Blue
  'linear-gradient(135deg, #11998e, #38ef7d)', // Teal/Green
  'linear-gradient(135deg, #00b09b, #96c93d)', // Green/Lime
  'linear-gradient(135deg, #8a2387, #e94057, #f27121)', // Purple/Orange
  'linear-gradient(135deg, #4568dc, #b06ab3)', // Blue/Purple
  'linear-gradient(135deg, #373b44, #4286f4)', // Slate/Blue
  'linear-gradient(135deg, #30cfd0, #330867)', // Cyan/Purple
  'linear-gradient(135deg, #f857a6, #ff5858)'  // Soft Pink/Red
];

// Helper to extract initials from title
function getInitials(title) {
  if (!title) return 'T';
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].substring(0, Math.min(words[0].length, 2)).toUpperCase();
}

// Helper to select random gradient
function getRandomGradient() {
  const index = Math.floor(Math.random() * AVATAR_GRADIENTS.length);
  return AVATAR_GRADIENTS[index];
}

export const dataManager = {
  init() {
    const DATA_VERSION = 'v2_uz';
    const currentVersion = localStorage.getItem('telecovery_data_version');
    
    if (!localStorage.getItem('telecovery_initialized') || currentVersion !== DATA_VERSION) {
      // Flatten existing items and add country property
      const flatItems = [];
      const categoriesSet = new Set();

      Object.keys(itemsData).forEach(countryCode => {
        itemsData[countryCode].forEach(item => {
          flatItems.push({
            ...item,
            country: countryCode
          });
          if (item.category) {
            categoriesSet.add(item.category);
          }
        });
      });

      localStorage.setItem('telecovery_items', JSON.stringify(flatItems));
      localStorage.setItem('telecovery_categories', JSON.stringify(Array.from(categoriesSet)));
      localStorage.setItem('telecovery_admin_password', 'admin');
      localStorage.setItem('telecovery_data_version', DATA_VERSION);
      localStorage.setItem('telecovery_initialized', 'true');
    }
  },

  // Items (Ecosystem channels, groups, bots)
  getItems() {
    this.init();
    return JSON.parse(localStorage.getItem('telecovery_items') || '[]');
  },

  getItemsByCountry(countryCode) {
    return this.getItems().filter(item => item.country === countryCode);
  },

  saveItem(item) {
    this.init();
    const items = this.getItems();
    
    // Auto format username/link
    let formattedUsername = item.username ? item.username.trim() : '';
    if (formattedUsername && !formattedUsername.startsWith('@')) {
      formattedUsername = '@' + formattedUsername;
    }
    
    let formattedLink = item.link ? item.link.trim() : '';
    if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }

    if (item.id) {
      // Edit mode
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        // Keep original avatar color and initials if title is unchanged
        const currentItem = items[index];
        const initials = currentItem.title === item.title ? currentItem.initials : getInitials(item.title);
        
        items[index] = {
          ...currentItem,
          ...item,
          username: formattedUsername,
          link: formattedLink,
          initials
        };
      }
    } else {
      // Add mode
      const newId = `${item.country}_${item.type.substring(0, 2)}_${Date.now()}`;
      const initials = getInitials(item.title);
      const avatarColor = getRandomGradient();
      
      items.push({
        ...item,
        id: newId,
        username: formattedUsername,
        link: formattedLink,
        initials,
        avatarColor
      });
    }

    localStorage.setItem('telecovery_items', JSON.stringify(items));
    return true;
  },

  deleteItem(id) {
    this.init();
    const items = this.getItems();
    const filteredItems = items.filter(i => i.id !== id);
    localStorage.setItem('telecovery_items', JSON.stringify(filteredItems));
    return true;
  },

  // Categories (Katalog)
  getCategories() {
    this.init();
    return JSON.parse(localStorage.getItem('telecovery_categories') || '[]');
  },

  saveCategory(categoryName) {
    this.init();
    if (!categoryName || !categoryName.trim()) return false;
    const categories = this.getCategories();
    const trimmed = categoryName.trim();
    if (categories.includes(trimmed)) return false;
    
    categories.push(trimmed);
    localStorage.setItem('telecovery_categories', JSON.stringify(categories));
    return true;
  },

  deleteCategory(categoryName) {
    this.init();
    const categories = this.getCategories();
    const filteredCategories = categories.filter(c => c !== categoryName);
    localStorage.setItem('telecovery_categories', JSON.stringify(filteredCategories));
    
    // Optional: We can also clean up items of this category or set them to empty
    const items = this.getItems();
    const updatedItems = items.map(item => {
      if (item.category === categoryName) {
        return { ...item, category: 'Uncategorized' };
      }
      return item;
    });
    localStorage.setItem('telecovery_items', JSON.stringify(updatedItems));
    
    // Add "Uncategorized" to categories if not exists
    const cats = this.getCategories();
    if (!cats.includes('Uncategorized')) {
      this.saveCategory('Uncategorized');
    }
    
    return true;
  },

  // Settings & Authentication
  checkPassword(password) {
    this.init();
    const storedPassword = localStorage.getItem('telecovery_admin_password') || 'admin';
    return storedPassword === password;
  },

  updatePassword(newPassword) {
    this.init();
    if (!newPassword || newPassword.trim().length < 4) return false;
    localStorage.setItem('telecovery_admin_password', newPassword.trim());
    return true;
  },

  resetAllData() {
    localStorage.removeItem('telecovery_initialized');
    localStorage.removeItem('telecovery_items');
    localStorage.removeItem('telecovery_categories');
    localStorage.removeItem('telecovery_admin_password');
    this.init();
  },

  isAdminLoggedIn() {
    return sessionStorage.getItem('telecovery_admin_logged') === 'true';
  },

  login() {
    sessionStorage.setItem('telecovery_admin_logged', 'true');
  },

  logout() {
    sessionStorage.removeItem('telecovery_admin_logged');
  },

  getCountries() {
    return countries;
  }
};
