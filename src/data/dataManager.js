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

// Resilient Firebase Fallback State
let isFirebaseFallbackActive = sessionStorage.getItem('telecovery_firebase_fallback') === 'true';

// Helper to wrap promise with a timeout
const withTimeout = (promise, ms = 4000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Connection Timeout")), ms))
  ]);
};

// Resilient executor that falls back to localStorage if Firestore fails or times out
async function executeFirestore(firestoreAction, localFallbackAction) {
  if (isFirebaseConfigured && !isFirebaseFallbackActive) {
    try {
      return await firestoreAction();
    } catch (err) {
      console.warn("Firestore error or timeout, falling back to localStorage:", err);
      isFirebaseFallbackActive = true;
      sessionStorage.setItem('telecovery_firebase_fallback', 'true');
    }
  }
  return await localFallbackAction();
}

export const dataManager = {
  isFallbackActive() {
    return isFirebaseFallbackActive;
  },

  async init() {
    await executeFirestore(
      async () => {
        // Check if database was already seeded
        const configSnap = await withTimeout(getDoc(doc(db, 'settings', 'admin_config')), 4000);
        const alreadySeeded = configSnap.exists() && configSnap.data().seeded;

        if (!alreadySeeded) {
          console.log("Firebase Firestore is not seeded. Seeding default data...");
          
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
            await withTimeout(setDoc(doc(db, 'items', item.id), item), 3000);
          }

          // Seed categories to Firestore
          const categoriesList = Array.from(categoriesSet);
          for (const catName of categoriesList) {
            await withTimeout(setDoc(doc(db, 'categories', catName), { name: catName }), 3000);
          }

          // Seed admin settings
          await withTimeout(setDoc(doc(db, 'settings', 'admin_config'), { password: 'admin', seeded: true }), 3000);
          console.log("Firebase Firestore seeding completed successfully!");
        }
      },
      async () => {
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
    );
  },

  // Get all items
  async getItems() {
    await this.init();
    return executeFirestore(
      async () => {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'items')), 4000);
        const items = [];
        querySnapshot.forEach(d => {
          items.push({ id: d.id, ...d.data() });
        });
        return items;
      },
      async () => {
        return JSON.parse(localStorage.getItem('telecovery_items') || '[]');
      }
    );
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

    return executeFirestore(
      async () => {
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
        
        await withTimeout(setDoc(doc(db, 'items', finalItem.id), finalItem), 4000);
        return true;
      },
      async () => {
        const items = JSON.parse(localStorage.getItem('telecovery_items') || '[]');
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
    );
  },

  // Delete Item
  async deleteItem(id) {
    await this.init();
    return executeFirestore(
      async () => {
        await withTimeout(deleteDoc(doc(db, 'items', id)), 4000);
        return true;
      },
      async () => {
        const items = JSON.parse(localStorage.getItem('telecovery_items') || '[]');
        const filteredItems = items.filter(i => i.id !== id);
        localStorage.setItem('telecovery_items', JSON.stringify(filteredItems));
        return true;
      }
    );
  },

  // Get categories list
  async getCategories() {
    await this.init();
    return executeFirestore(
      async () => {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'categories')), 4000);
        const categories = [];
        querySnapshot.forEach(d => {
          categories.push(d.id); // Firestore Document ID is category name
        });
        
        // Ensure Uncategorized exists
        if (!categories.includes('Uncategorized')) {
          categories.push('Uncategorized');
        }
        return categories;
      },
      async () => {
        return JSON.parse(localStorage.getItem('telecovery_categories') || '[]');
      }
    );
  },

  // Create dynamic Category
  async saveCategory(categoryName) {
    await this.init();
    if (!categoryName || !categoryName.trim()) return false;
    const trimmed = categoryName.trim();
    const categories = await this.getCategories();
    if (categories.includes(trimmed)) return false;

    return executeFirestore(
      async () => {
        await withTimeout(setDoc(doc(db, 'categories', trimmed), { name: trimmed }), 4000);
        return true;
      },
      async () => {
        categories.push(trimmed);
        localStorage.setItem('telecovery_categories', JSON.stringify(categories));
        return true;
      }
    );
  },

  // Delete dynamic Category
  async deleteCategory(categoryName) {
    await this.init();
    if (categoryName === 'Uncategorized') return false;

    return executeFirestore(
      async () => {
        // 1. Delete category document
        await withTimeout(deleteDoc(doc(db, 'categories', categoryName)), 4000);
        
        // 2. Set all items belonging to this category to Uncategorized
        const items = await this.getItems();
        for (const item of items) {
          if (item.category === categoryName) {
            const itemRef = doc(db, 'items', item.id);
            await withTimeout(updateDoc(itemRef, { category: 'Uncategorized' }), 3000);
          }
        }
        return true;
      },
      async () => {
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
    );
  },

  // Password administration
  async checkPassword(password) {
    await this.init();
    return executeFirestore(
      async () => {
        const docRef = doc(db, 'settings', 'admin_config');
        const docSnap = await withTimeout(getDoc(docRef), 4000);
        if (docSnap.exists()) {
          return docSnap.data().password === password;
        }
        return password === 'admin';
      },
      async () => {
        const storedPassword = localStorage.getItem('telecovery_admin_password') || 'admin';
        return storedPassword === password;
      }
    );
  },

  async updatePassword(newPassword) {
    await this.init();
    if (!newPassword || newPassword.trim().length < 4) return false;
    const cleanPass = newPassword.trim();

    return executeFirestore(
      async () => {
        const docRef = doc(db, 'settings', 'admin_config');
        await withTimeout(setDoc(docRef, { password: cleanPass }, { merge: true }), 4000);
        return true;
      },
      async () => {
        localStorage.setItem('telecovery_admin_password', cleanPass);
        return true;
      }
    );
  },

  async resetAllData() {
    return executeFirestore(
      async () => {
        // Delete all items
        const itemsSnapshot = await withTimeout(getDocs(collection(db, 'items')), 4000);
        for (const document of itemsSnapshot.docs) {
          await withTimeout(deleteDoc(doc(db, 'items', document.id)), 3000);
        }

        // Delete all categories
        const catsSnapshot = await withTimeout(getDocs(collection(db, 'categories')), 4000);
        for (const document of catsSnapshot.docs) {
          await withTimeout(deleteDoc(doc(db, 'categories', document.id)), 3000);
        }

        // Keep settings document but set password to 'admin' and keep seeded: true
        await withTimeout(setDoc(doc(db, 'settings', 'admin_config'), { password: 'admin', seeded: true }), 3000);
        return true;
      },
      async () => {
        localStorage.removeItem('telecovery_initialized');
        localStorage.removeItem('telecovery_items');
        localStorage.removeItem('telecovery_categories');
        localStorage.removeItem('telecovery_admin_password');
        // Seed flag for localStorage fallback
        localStorage.setItem('telecovery_initialized', 'true');
        localStorage.setItem('telecovery_items', JSON.stringify([]));
        localStorage.setItem('telecovery_categories', JSON.stringify([]));
        localStorage.setItem('telecovery_admin_password', 'admin');
        return true;
      }
    );
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
