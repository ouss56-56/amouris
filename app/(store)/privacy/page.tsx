'use client'

import { useSettingsStore } from '@/store/settings.store'
import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
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
               <FileText size={32} />
            </div>
            <div>
               <h1 className="text-3xl font-serif text-emerald-950">Politique de Confidentialité</h1>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/40 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-8 text-emerald-950/70 font-light leading-relaxed">
            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">1. Introduction</h2>
               <p>
                 Chez <strong>{settings.storeNameFR}</strong>, nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme B2B.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">2. Données Collectées</h2>
               <p className="mb-2">Nous collectons les informations suivantes lors de votre inscription ou lors du processus de commande :</p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Informations d'identification (Nom, Prénom, Raison Sociale).</li>
                 <li>Coordonnées (Adresse email, Numéro de téléphone, Adresse de livraison, Wilaya).</li>
                 <li>Historique des commandes et préférences de navigation.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">3. Utilisation des Données</h2>
               <p className="mb-2">Vos données sont utilisées exclusivement pour :</p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Le traitement et le suivi de vos commandes.</li>
                 <li>La facturation et la gestion comptable.</li>
                 <li>L'amélioration de nos services et de votre expérience utilisateur.</li>
                 <li>L'envoi de communications contractuelles ou commerciales (si vous y avez consenti).</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">4. Partage et Sécurité</h2>
               <p>
                 Vos données ne sont en aucun cas vendues ou louées à des tiers. Elles ne sont partagées qu'avec nos prestataires logistiques strictement dans le cadre de la livraison de votre commande. Nos serveurs intègrent des protocoles de sécurité avancés pour prévenir tout accès non autorisé.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-serif text-emerald-950 font-bold mb-4">5. Vos Droits</h2>
               <p>
                 Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en nous contactant via les coordonnées fournies ci-dessous.
               </p>
            </section>

            <section className="bg-emerald-50 p-6 rounded-2xl border border-emerald-900/10 mt-12">
               <h3 className="font-bold text-emerald-950 mb-2">Nous Contacter</h3>
               <p className="text-sm">Pour toute question relative à cette politique de confidentialité, veuillez nous contacter :</p>
               <div className="mt-4 space-y-1 text-sm font-medium text-emerald-900">
                  <p>Email: {settings.email}</p>
                  <p>Téléphone: {settings.phone}</p>
                  <p>Adresse: {settings.address}, {settings.wilaya}</p>
               </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
