import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartUpdated = [...cart];
      const itemExists = cartUpdated.find(
        (product) => product.id === productId
      );
      const stock = await api.get(`stock/${productId}`);
      const stockAmount = stock.data.amount;

      const currentAmount = itemExists ? itemExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (itemExists) {
        itemExists.amount = amount;
      } else {
        const response = await api.get(`/products/${productId}`);
        const { data } = response;
        const addNewProduct = {
          ...data,
          amount: 1,
        };
        cartUpdated.push(addNewProduct);
      }
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated));
      setCart(cartUpdated);
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removedProduct = [...cart];
      const productToRemoveIndex = removedProduct.findIndex(product => product.id === productId);
      if (productToRemoveIndex >= 0) {
        removedProduct.splice(productToRemoveIndex, 1)
        setCart(removedProduct)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(removedProduct));
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
