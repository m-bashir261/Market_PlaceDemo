import './App.css';
import AppRoutes from './Approutes';
import { CartProvider } from './context/CartContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <CartProvider>
      <AppRoutes/>
      <ToastContainer position="top-right" autoClose={3000} />
    </CartProvider>
  );
}

export default App;
