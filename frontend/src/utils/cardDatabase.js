import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Cache for card data
let CARD_DATABASE = {};
let isLoaded = false;
let listeners = [];
let loadPromise = null;

// ✅ pad input ให้ครบ 10 หลักถ้าเป็นตัวเลขล้วน
const normalizeCardNo = (input) => {
    const trimmed = (input || '').toString().trim();
    return /^\d+$/.test(trimmed)
        ? trimmed.padStart(10, '0')
        : trimmed.toUpperCase();
};

// Load cards collection ONCE
const loadCards = async () => {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        try {
            console.log('Loading cards from Firestore...');
            const querySnapshot = await getDocs(collection(db, 'cards'));

            CARD_DATABASE = {};
            querySnapshot.docs.forEach(doc => {
                CARD_DATABASE[doc.id] = doc.data();
            });

            isLoaded = true;

            listeners.forEach(callback => callback());
            listeners = [];

            console.log(`Loaded ${Object.keys(CARD_DATABASE).length} cards from Firestore`);
        } catch (error) {
            console.error('Error loading cards:', error);
            loadPromise = null;
            throw error;
        }
    })();

    return loadPromise;
};

// Start loading immediately
loadCards();

// Get card details by card number
export const getCardDetails = (cardNumber) => {
    // ✅ normalize ก่อน lookup เสมอ
    return CARD_DATABASE[normalizeCardNo(cardNumber)] || null;
};

// Get card details by EmpNo
export const getCardDetailsByEmpNo = (empNo) => {
    const cards = Object.values(CARD_DATABASE);
    return cards.find(card => card.EmpNo === empNo) || null;
};

// Get all cards
export const getAllCards = () => {
    return Object.values(CARD_DATABASE);
};

// Search by either CardNo or EmpNo
export const searchCard = (input) => {
    // ✅ normalize input ก่อน search ทุกครั้ง
    const normalized = normalizeCardNo(input);

    // First try CardNo (exact match หลัง normalize)
    let card = CARD_DATABASE[normalized];
    if (card) return card;

    // Then try EmpNo (case-insensitive)
    const cards = Object.values(CARD_DATABASE);
    card = cards.find(c => c.EmpNo && c.EmpNo.toUpperCase() === input.toUpperCase());
    return card || null;
};

// Check if data is loaded
export const isCardsLoaded = () => isLoaded;

// Add listener for when cards are loaded
export const onCardsLoaded = (callback) => {
    if (isLoaded) {
        callback();
    } else {
        listeners.push(callback);
    }
};

// Reload cards manually (call this after updating data)
export const reloadCards = () => {
    isLoaded = false;
    loadPromise = null;
    return loadCards();
};
