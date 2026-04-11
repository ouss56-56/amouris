import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function checkOrders() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        console.log(`Found ${orders.length} orders.`);
        if (orders.length > 0) {
            console.log('Last order:', orders[orders.length - 1]);
        }
    }

    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

    if (itemsError) {
        console.error('Error fetching order items:', itemsError);
    } else {
        console.log(`Found ${items.length} order items.`);
    }
}

checkOrders();
