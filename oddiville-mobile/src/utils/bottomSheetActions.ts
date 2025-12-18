import type { BottomSheetActionKey } from '@/src/types';
import { BottomSheetSchemaKey } from '../schemas/BottomSheetSchema';

export const getBottomSheetActions = (type: BottomSheetSchemaKey): BottomSheetActionKey[] => {
    
    switch (type) {
        case 'add-raw-material':
            return ['cancel', 'add-raw-material'];
        case 'add-product-package':
            return ['add-product-package'];
        case 'add-package':
            return ['add-package'];
        case 'fill-package':
            return ['add-package-quantity'];
        case 'upcoming-order':
            return ['ship-order', 'edit-order', 'cancel-order'];
        // case 'filter':
        //     return ['apply-filter'];
        case 'verify-material':
            return ['verify-material'];
        case 'supervisor-production':
            return ['cancel', 'store-product'];
        case 'multiple-chamber-list':
            return ['cancel', 'choose-chamber'];
        case 'order-shipped':
            return ['order-reached', 'cancel-order'];
        case 'order-ready':
            return ['ship-order'];
        case 'filter':
            return ['cancel','clear-filter'];
        case 'select-policies':
            return ['cancel-policies', 'select-policies'];
        default:
            return [];
    }
};