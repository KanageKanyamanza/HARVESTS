// Actions du panier
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer pour gérer l'état du panier
export const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.originType === action.payload.originType
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.payload.productId &&
            item.originType === action.payload.originType
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.originType === action.payload.originType
            )
        ),
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.productId === action.payload.productId &&
            item.originType === action.payload.originType
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.LOAD_CART: {
      const rawItems = action.payload.items || action.payload || [];
      return {
        ...state,
        items: rawItems.map(item => {
          const originType = item.originType || 'product';
          const supplier = item.producer || {};
          const supplierId =
            supplier._id ||
            supplier.id ||
            item.producerId ||
            item.supplierId ||
            item.vendorId ||
            item.restaurateurId ||
            item.transformerId ||
            item.ownerId ||
            item.sellerId ||
            null;
          
          const supplierType =
            supplier.type ||
            supplier.userType ||
            item.producerType ||
            item.supplierType ||
            item.vendorType ||
            item.categoryOwnerType ||
            (originType === 'dish'
              ? 'restaurateur'
              : originType === 'transformed-product'
              ? 'transformer'
              : originType === 'logistics'
              ? 'transporter'
              : 'producer');
          
          let supplierName = '';
          if (originType === 'dish' || originType === 'restaurateur' || supplierType === 'restaurateur') {
            supplierName =
              supplier.restaurantName ||
              supplier.name ||
              item.restaurateurName ||
              item.producerName ||
              item.supplierName ||
              supplier.businessName ||
              supplier.companyName ||
              'Restaurant';
          } else {
            supplierName =
              supplier.name ||
              supplier.businessName ||
              supplier.companyName ||
              supplier.restaurantName ||
              item.producerName ||
              item.supplierName ||
              item.vendorName ||
              item.restaurateurName ||
              item.transformerName ||
              item.ownerName ||
              'Fournisseur';
          }

          return {
            ...item,
            originType,
            producer: {
              id: supplierId,
              name: supplierName,
              type: supplierType,
            },
          };
        }),
      };
    }

    default:
      return state;
  }
};

// État initial du panier
export const initialCartState = {
  items: []
};

