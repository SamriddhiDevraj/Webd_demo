import { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext({
  activeShop: null,
  setActiveShop: () => {},
  clearActiveShop: () => {},
  isOwner: false,
});

export function ShopProvider({ children }) {
  const [activeShop, setActiveShopState] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('activeShop');
    if (stored) {
      try {
        setActiveShopState(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('activeShop');
      }
    }
  }, []);

  function setActiveShop(shop) {
    sessionStorage.setItem('activeShop', JSON.stringify(shop));
    setActiveShopState(shop);
  }

  function clearActiveShop() {
    sessionStorage.removeItem('activeShop');
    setActiveShopState(null);
  }

  return (
    <ShopContext.Provider
      value={{
        activeShop,
        setActiveShop,
        clearActiveShop,
        isOwner: activeShop?.role === 'owner',
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
