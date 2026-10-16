/* ==========================================================================
   CLINIC CONFIG — the only file you need to edit to rebrand this site.
   --------------------------------------------------------------------------
   Every value below is injected into the pages at runtime through
   data-cfg="KEY" attributes, so changing it here changes it everywhere.
   See README.md for the two things that are not runtime-driven
   (page <title> tags and the JSON-LD block in index.html).
   ========================================================================== */

window.CLINIC = {
  /* ---------------------------------------------------------- identity -- */
  CLINIC_NAME: 'Senyum Dental Clinic',
  CLINIC_SHORT: 'Senyum',
  TAGLINE: 'Gentle, Modern Dental Care',

  /* ------------------------------------------------------------ contact -- */
  CITY: 'Ipoh, Perak',
  ADDRESS: '12, Jalan Sultan Idris Shah, 30000 Ipoh, Perak',
  PHONE_DISPLAY: '+60 5-000 0000',
  PHONE_LINK: '+6050000000',
  EMAIL: 'hello@senyumdental.my',
  HOURS: 'Mon to Sat 9:00am to 9:00pm · Sun & Public Holidays closed',
  HOURS_SHORT: 'Mon to Sat, 9:00am to 9:00pm',

  /* WhatsApp: leave empty and the floating button stays inert (icon only).
     Fill it in international format without "+" — e.g. '60123456789' — and
     the button starts linking to wa.me automatically.                       */
  WHATSAPP_NUMBER: '',
  WHATSAPP_MESSAGE: "Hi, I'd like to book an appointment",

  /* --------------------------------------------------------------- misc -- */
  CURRENCY: 'RM',
  LANGUAGE: 'English only',
  MAP_LAT: 4.5975,
  MAP_LNG: 101.0901,

  SOCIALS: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
  },

  /* -------------------------------------------------------------- prices --
     Sample placeholders. Used by the service cards on the home page and the
     detail rows on services.html.                                            */
  /* price shows under a "Starting at" label; onRequest hides that label and
     prints the phrase on its own instead.                                    */
  SERVICES: [
    { id: 'checkup',   name: 'General Check-up & Scaling', price: 'RM80',  tint: 'mint'  },
    { id: 'whitening', name: 'Teeth Whitening',            price: 'RM600', tint: 'cyan'  },
    { id: 'rootcanal', name: 'Root Canal Treatment',       price: 'RM450', tint: 'peach' },
    { id: 'gums',      name: 'Gum Disease Treatment',      price: 'RM150', tint: 'coral' },
    { id: 'implant',   name: 'Dental Implants',            price: 'Price on consultation', onRequest: true, tint: 'pink' },
    { id: 'braces',    name: 'Braces & Orthodontics',      price: 'Price on consultation', onRequest: true, tint: 'blue' },
  ],

  /* -------------------------------------------------------------- people -- */
  DENTISTS: [
    { name: 'Dr. Aisyah Rahman', role: 'Lead Dentist' },
    { name: 'Dr. Jason Lim',     role: 'Cosmetic Dentist' },
    { name: 'Dr. Priya Nair',    role: 'Dental Surgeon' },
  ],
};
