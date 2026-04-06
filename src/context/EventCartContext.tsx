'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PublicItem } from '@/types/public/items';
import { toast } from 'sonner';

export interface CartItem {
    item: PublicItem;
    quantity: number;
    startDate?: string;
    endDate?: string;
}

interface EventCartContextType {
    cartItems: CartItem[];
    addToCart: (item: PublicItem) => void;
    removeFromCart: (itemId: number) => void;
    clearCart: () => void;
    updateItemDates: (itemId: number, start: string, end: string) => void;
}

const EventCartContext = createContext<EventCartContextType | undefined>(undefined);

export const EventCartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('event_cart');
        if (saved) {
            try {
                setCartItems(JSON.parse(saved));
            } catch (e) {
                toast.error("Failed to parse cart items.");
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('event_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (item: PublicItem) => {
        const existing = cartItems.find(i => i.item.id === item.id);
        if (existing) {
            toast.info("Item is already in your event plan.");
            return;
        }
        setCartItems(prev => [...prev, { item, quantity: 1 }]);
        toast.success(`${item.title} added to your event plan!`);
    };

    const removeFromCart = (itemId: number) => {
        setCartItems(prev => prev.filter(i => i.item.id !== itemId));
        toast.info("Removed from event plan.");
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const updateItemDates = (itemId: number, start: string, end: string) => {
        setCartItems(prev => prev.map(i => i.item.id === itemId ? { ...i, startDate: start, endDate: end } : i));
    };

    const value = useMemo(() => ({
        cartItems, addToCart, removeFromCart, clearCart, updateItemDates
    }), [cartItems]);

    return (
        <EventCartContext.Provider value={value}>
            {children}
        </EventCartContext.Provider>
    );

};

export const useEventCart = () => {
    const context = useContext(EventCartContext);
    if (context === undefined) {
        throw new Error('useEventCart must be used within an EventCartProvider');
    }
    return context;
};
