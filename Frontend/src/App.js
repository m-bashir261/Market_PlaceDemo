import './App.css';
import AppRoutes from './Approutes';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { WishlistProvider } from './context/WishlistContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes/>
          <ToastContainer position="top-right" autoClose={3000} />
        </WishlistProvider>
      </CartProvider>
    </LocationProvider>
  );
}

export default App;
