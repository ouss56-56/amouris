import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkSchema() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('Checking orders table columns...');
    const { data: columns, error } = await supabase
        .rpc('get_table_columns', { table_name: 'orders' });

    if (error) {
        // Fallback if RPC doesn't exist: just try to select one row and see what we get
        console.log('RPC get_table_columns failed, trying select...');
        const { data, error: selectError } = await supabase
            .from('orders')
            .select('*')
            .limit(1);
        
        if (selectError) {
            console.error('Select failed:', selectError);
        } else {
            console.log('Columns found in first row:', data.length > 0 ? Object.keys(data[0]) : 'No rows found');
        }
    } else {
        console.log('Columns:', columns);
    }
}

checkSchema();
