# 🚀 Supabase Setup Checklist — Amouris Parfums

Follow these steps after executing `amouris-production.sql` in the Supabase SQL Editor.

## 1. Database & Schema
- [ ] **SQL Execution**: Ensure `amouris-production.sql` was executed without errors.
- [ ] **Verify Tables**: Check that all tables (14) are present in the `public` schema.
- [ ] **Initial Data**: Verify that categories, brands, collections, and products are populated.

## 2. Realtime Activation
The SQL script already enables realtime for the tables, but double-check in the Dashboard:
- [ ] Go to **Database** -> **Replication**.
- [ ] Click on **`supabase_realtime`** publication.
- [ ] Ensure `orders`, `order_items`, `order_history`, and `profiles` are selected.

## 3. Storage Buckets
The SQL script defines policies, but the buckets themselves must be created:
- [ ] Go to **Storage**.
- [ ] Create a new bucket named **`products`** (Public: Yes).
- [ ] Create a new bucket named **`brands`** (Public: Yes).
- [ ] Create a new bucket named **`collections`** (Public: Yes).
- [ ] Create a new bucket named **`catalogues`** (Public: No - Private).

## 4. Admin Account Setup
- [ ] Go to **Authentication** -> **Add User** -> **Create new user**.
- [ ] Enter the email: `admin@amouris-parfums.com` (or your preferred admin email).
- [ ] Set a strong password.
- [ ] **Crucial**: After creating the user, run this SQL command in the SQL Editor to grant admin rights:
  ```sql
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = (
    SELECT id FROM auth.users
    WHERE email = 'admin@amouris-parfums.com'
  );
  ```

## 5. Web Application Integration
- [ ] Update your project `.env` with the new Supabase credentials (URL, Anon Key, Service Role Key).
- [ ] If deploying to Vercel, update the Environment Variables in the project settings.
- [ ] Redeploy the application.

## 6. Verification
- [ ] Log in as Admin and check if you can see the Dashboard stats.
- [ ] Try creating a test product.
- [ ] Perform a test order as a guest to verify the checkout flow and stock reduction.
