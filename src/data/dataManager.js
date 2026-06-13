import { countries, itemsData } from './channelsData';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';

// Premium background gradients for new avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff416c, #ff4b2b)',
  'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  'linear-gradient(135deg, #141e30, #243b55)',
  'linear-gradient(135deg, #f12711, #f5af19)',
  'linear-gradient(135deg, #fc466b, #3f5efb)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #00b09b, #96c93d)',
  'linear-gradient(135deg, #8a2387, #e94057, #f27121)',
  'linear-gradient(135deg, #4568dc, #b06ab3)',
  'linear-gradient(135deg, #373b44, #4286f4)',
  'linear-gradient(135deg, #30cfd0, #330867)',
  'linear-gradient(135deg, #f857a6, #ff5858)'
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
  async init() {
    if (isFirebaseConfigured) {
      try {
        // Check if database is already populated
        const querySnapshot = await getDocs(collection(db, 'items'));
        if (querySnapshot.empty) {
          console.log("Firebase Firestore is empty. Seeding default data...");
          
          const flatItems = [];
          const categoriesSet = new Set();

          Object.keys(itemsData).forEach(countryCode => {
            itemsData[countryCode].forEach(item => {
              flatItems.push({
                ...item,
                country: countryCode,
                avatar: ''
              });
              if (item.category) {
                categoriesSet.add(item.category);
              }
            });
          });

          // Seed items to Firestore
          for (const item of flatItems) {
            await setDoc(doc(db, 'items', item.id), item);
          }

          // Seed categories to Firestore
          const categoriesList = Array.from(categoriesSet);
          for (const catName of categoriesList) {
            await setDoc(doc(db, 'categories', catName), { name: catName });
          }

          // Seed admin settings
          await setDoc(doc(db, 'settings', 'admin_config'), { password: 'admin' });
          console.log("Firebase Firestore seeding completed successfully!");
        }
      } catch (err) {
        console.error("Firestore database seeding failed:", err);
      }
    } else {
      // LocalStorage fallback initialization
      if (!localStorage.getItem('telecovery_initialized')) {
        const flatItems = [];
        const categoriesSet = new Set();

        Object.keys(itemsData).forEach(countryCode => {
          itemsData[countryCode].forEach(item => {
            flatItems.push({
              ...item,
              country: countryCode,
              avatar: ''
            });
            if (item.category) {
              categoriesSet.add(item.category);
            }
          });
        });

        localStorage.setItem('telecovery_items', JSON.stringify(flatItems));
        localStorage.setItem('telecovery_categories', JSON.stringify(Array.from(categoriesSet)));
        localStorage.setItem('telecovery_admin_password', 'admin');
        localStorage.setItem('telecovery_initialized', 'true');
      }
    }
  },

  // Get all items
  async getItems() {
    await this.init();
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'));
        const items = [];
        querySnapshot.forEach(d => {
          items.push({ id: d.id, ...d.data() });
        });
        return items;
      } catch (err) {
        console.error("Error loading items from Firestore:", err);
        return [];
      }
    } else {
      return JSON.parse(localStorage.getItem('telecovery_items') || '[]');
    }
  },

  async getItemsByCountry(countryCode) {
    const items = await this.getItems();
    return items.filter(item => item.country === countryCode);
  },

  // Save (Create or Update) Item
  async saveItem(item) {
    await this.init();
    
    // Auto format username/link
    let formattedUsername = item.username ? item.username.trim() : '';
    if (formattedUsername && !formattedUsername.startsWith('@')) {
      formattedUsername = '@' + formattedUsername;
    }
    
    let formattedLink = item.link ? item.link.trim() : '';
    if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }

    if (isFirebaseConfigured) {
      try {
        let finalItem = { ...item, username: formattedUsername, link: formattedLink };
        if (!item.id) {
          // Add mode
          const newId = `${item.country}_${item.type.substring(0, 2)}_${Date.now()}`;
          finalItem.id = newId;
          finalItem.initials = getInitials(item.title);
          finalItem.avatarColor = getRandomGradient();
          finalItem.avatar = item.avatar || '';
        } else {
          // Edit mode: re-calculate initials if title changes
          finalItem.initials = getInitials(item.title);
        }
        
        await setDoc(doc(db, 'items', finalItem.id), finalItem);
        return true;
      } catch (err) {
        console.error("Error saving item to Firestore:", err);
        return false;
      }
    } else {
      const items = await this.getItems();
      if (item.id) {
        // Edit mode
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
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
          avatarColor,
          avatar: item.avatar || ''
        });
      }
      localStorage.setItem('telecovery_items', JSON.stringify(items));
      return true;
    }
  },

  // Delete Item
  async deleteItem(id) {
    await this.init();
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'items', id));
        return true;
      } catch (err) {
        console.error("Error deleting item from Firestore:", err);
        return false;
      }
    } else {
      const items = await this.getItems();
      const filteredItems = items.filter(i => i.id !== id);
      localStorage.setItem('telecovery_items', JSON.stringify(filteredItems));
      return true;
    }
  },

  // Get categories list
  async getCategories() {
    await this.init();
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categories = [];
        querySnapshot.forEach(d => {
          categories.push(d.id); // Firestore Document ID is category name
        });
        
        // Ensure Uncategorized exists
        if (!categories.includes('Uncategorized')) {
          categories.push('Uncategorized');
        }
        return categories;
      } catch (err) {
        console.error("Error loading categories from Firestore:", err);
        return ['Uncategorized'];
      }
    } else {
      return JSON.parse(localStorage.getItem('telecovery_categories') || '[]');
    }
  },

  // Create dynamic Category
  async saveCategory(categoryName) {
    await this.init();
    if (!categoryName || !categoryName.trim()) return false;
    const trimmed = categoryName.trim();
    const categories = await this.getCategories();
    if (categories.includes(trimmed)) return false;

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'categories', trimmed), { name: trimmed });
        return true;
      } catch (err) {
        console.error("Error saving category to Firestore:", err);
        return false;
      }
    } else {
      categories.push(trimmed);
      localStorage.setItem('telecovery_categories', JSON.stringify(categories));
      return true;
    }
  },

  // Delete dynamic Category
  async deleteCategory(categoryName) {
    await this.init();
    if (categoryName === 'Uncategorized') return false;

    if (isFirebaseConfigured) {
      try {
        // 1. Delete category document
        await deleteDoc(doc(db, 'categories', categoryName));
        
        // 2. Set all items belonging to this category to Uncategorized
        const items = await this.getItems();
        for (const item of items) {
          if (item.category === categoryName) {
            const itemRef = doc(db, 'items', item.id);
            await updateDoc(itemRef, { category: 'Uncategorized' });
          }
        }
        return true;
      } catch (err) {
        console.error("Error deleting category from Firestore:", err);
        return false;
      }
    } else {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(c => c !== categoryName);
      localStorage.setItem('telecovery_categories', JSON.stringify(filteredCategories));
      
      const items = await this.getItems();
      const updatedItems = items.map(item => {
        if (item.category === categoryName) {
          return { ...item, category: 'Uncategorized' };
        }
        return item;
      });
      localStorage.setItem('telecovery_items', JSON.stringify(updatedItems));
      
      const cats = await this.getCategories();
      if (!cats.includes('Uncategorized')) {
        await this.saveCategory('Uncategorized');
      }
      return true;
    }
  },

  // Password administration
  async checkPassword(password) {
    await this.init();
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, 'settings', 'admin_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().password === password;
        }
        return password === 'admin';
      } catch (err) {
        console.error("Error checking password from Firestore:", err);
        return password === 'admin';
      }
    } else {
      const storedPassword = localStorage.getItem('telecovery_admin_password') || 'admin';
      return storedPassword === password;
    }
  },

  async updatePassword(newPassword) {
    await this.init();
    if (!newPassword || newPassword.trim().length < 4) return false;
    const cleanPass = newPassword.trim();

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, 'settings', 'admin_config');
        await setDoc(docRef, { password: cleanPass }, { merge: true });
        return true;
      } catch (err) {
        console.error("Error updating password in Firestore:", err);
        return false;
      }
    } else {
      localStorage.setItem('telecovery_admin_password', cleanPass);
      return true;
    }
  },

  async resetAllData() {
    if (isFirebaseConfigured) {
      try {
        // Delete all items
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        for (const document of itemsSnapshot.docs) {
          await deleteDoc(doc(db, 'items', document.id));
        }

        // Delete all categories
        const catsSnapshot = await getDocs(collection(db, 'categories'));
        for (const document of catsSnapshot.docs) {
          await deleteDoc(doc(db, 'categories', document.id));
        }

        // Delete settings document
        await deleteDoc(doc(db, 'settings', 'admin_config'));
        
        // Seeding will re-run automatically on next initialization
        await this.init();
        return true;
      } catch (err) {
        console.error("Error resetting Firestore data:", err);
        return false;
      }
    } else {
      localStorage.removeItem('telecovery_initialized');
      localStorage.removeItem('telecovery_items');
      localStorage.removeItem('telecovery_categories');
      localStorage.removeItem('telecovery_admin_password');
      await this.init();
      return true;
    }
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
