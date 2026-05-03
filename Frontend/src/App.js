import './App.css';
import AppRoutes from './Approutes';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <AppRoutes/>
    </CartProvider>
  );
}

export default App;
