'use client'

import { useSettingsStore } from '@/store/settings.store'
import { Scale } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
  const settings = useSettingsStore()

  return (
    <div className="min-h-screen bg-neutral-50/50 py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-emerald-950/5 border border-emerald-950/5"
        >
          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-emerald-950/5">
            <div className="w-16 h-16 bg-[#0a3d2e] rounded-2xl flex items-center justify-center text-[#C9A84C] shrink-0">
               <Scale size={32} />
            </div>
            <div>
               <h1 className="text-3xl font-serif text-emerald-950">Conditions Générales de Vente</h1>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/40 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-8 text-emerald-950/70 font-light leading-relaxed">
            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">1. Objet</h2>
               <p>
                 Les présentes Conditions Générales de Vente (CGV) définissent les droits et obligations des parties dans le cadre de la vente de produits B2B par <strong>{settings.storeNameFR}</strong>. Toute commande passée sur la plateforme implique l'acceptation sans réserve des présentes CGV par le client.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">2. Produits et Tarifs</h2>
               <p className="mb-2">
                 Nos parfums (en grammes) et nos flacons (en unités) sont proposés à la vente exclusivement pour les professionnels. 
               </p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Les prix sont indiqués en Dinars Algériens (DZD), hors frais de livraison.</li>
                 <li>Le montant minimum requis pour valider une commande est fixé à {settings.minOrderAmount.toLocaleString()} DZD.</li>
                 <li>{settings.storeNameFR} se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de l'enregistrement de la commande.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">3. Commandes</h2>
               <p>
                 La validation de la commande confirme l'acceptation des prix et descriptions des produits disponibles à la vente. Un conseiller client de {settings.storeNameFR} vous contactera une fois votre commande soumise pour confirmation finale avant expédition.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">4. Livraison</h2>
               <p className="mb-2">
                 La livraison est effectuée à l'adresse indiquée par le client lors de la commande. 
               </p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Les frais de livraison sont calculés au moment de la confirmation téléphonique.</li>
                 <li>La livraison est gratuite pour toute commande dont le montant dépasse {settings.freeDeliveryThreshold.toLocaleString()} DZD.</li>
                 <li>Les risques liés au transport sont à la charge de l'acheteur à compter du moment où les articles quittent nos locaux.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">5. Paiement</h2>
               <p>
                 Le paiement s'effectue exclusivement en espèces à la livraison (Paiement à la livraison) au transporteur mandaté par {settings.storeNameFR}, sauf accord préalable stipulant d'autres conditions pour les clients réguliers.
               </p>
            </section>

            <section className="bg-emerald-50 p-6 rounded-2xl border border-emerald-900/10 mt-12">
               <h3 className="font-bold text-emerald-950 mb-2">Informations Légales</h3>
               <div className="mt-4 space-y-1 text-sm font-medium text-emerald-900">
                  <p>Société: {settings.storeNameFR}</p>
                  <p>Email: {settings.email}</p>
                  <p>Téléphone: {settings.phone}</p>
                  <p>Siège Social: {settings.address}, {settings.wilaya}</p>
               </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
