export type Lang = "en" | "fr" | "es"

export const translations: Record<Lang, any> = {
  en: {
    // GENERAL
    welcome: "Welcome to DealPilot",
    getStarted: "Get Started",

    // NAV
    dashboard: "Dashboard",
    deals: "Deals",
    leads: "Leads",
    tasks: "Tasks",
    settings: "Settings",

    // SETTINGS PAGE
    settingsTitle: "Settings",
    settingsDesc: "Update your account and preferences.",

    profile: "Profile",
    profileDesc: "Manage your personal details and avatar.",

    fullName: "Full Name",
    email: "Email",
    company: "Company",
    role: "Role / Title",

    saveProfile: "Save Profile",
    goDashboard: "Go to Dashboard",

    // AVATAR
    uploadAvatar: "Upload Avatar",
    uploadingAvatar: "Uploading...",
    avatarHint: "Best results: square image, JPG or PNG.",

    // SECURITY
    security: "Security",
    securityDesc: "Keep your account secure with a stronger password.",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",

    // LANGUAGE
    language: "Language",
    languageDesc: "Select your preferred language.",

    // DANGER ZONE
    dangerZone: "Danger Zone",
    deleteWarning: "This action cannot be undone.",
    deleteAccount: "Delete Account",
    deletingAccount: "Deleting...",

    // PREVIEW
    preview: "Preview",
  },

  fr: {
    welcome: "Bienvenue sur DealPilot",
    getStarted: "Commencer",

    dashboard: "Tableau de bord",
    deals: "Offres",
    leads: "Prospects",
    tasks: "Tâches",
    settings: "Paramètres",

    settingsTitle: "Paramètres",
    settingsDesc: "Mettez à jour votre compte et vos préférences.",

    profile: "Profil",
    profileDesc: "Gérez vos informations personnelles.",

    fullName: "Nom complet",
    email: "Email",
    company: "Entreprise",
    role: "Poste",

    saveProfile: "Enregistrer le profil",
    goDashboard: "Aller au tableau de bord",

    uploadAvatar: "Télécharger un avatar",
    uploadingAvatar: "Téléchargement...",
    avatarHint: "Image carrée recommandée, JPG ou PNG.",

    security: "Sécurité",
    securityDesc: "Protégez votre compte.",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    updatePassword: "Mettre à jour",

    language: "Langue",
    languageDesc: "Choisissez votre langue.",

    dangerZone: "Zone dangereuse",
    deleteWarning: "Cette action est irréversible.",
    deleteAccount: "Supprimer le compte",
    deletingAccount: "Suppression...",

    preview: "Aperçu",
  },

  es: {
    welcome: "Bienvenido a DealPilot",
    getStarted: "Comenzar",

    dashboard: "Panel",
    deals: "Negocios",
    leads: "Clientes",
    tasks: "Tareas",
    settings: "Configuración",

    settingsTitle: "Configuración",
    settingsDesc: "Actualiza tu cuenta.",

    profile: "Perfil",
    profileDesc: "Gestiona tu información.",

    fullName: "Nombre completo",
    email: "Correo",
    company: "Empresa",
    role: "Cargo",

    saveProfile: "Guardar perfil",
    goDashboard: "Ir al panel",

    uploadAvatar: "Subir avatar",
    uploadingAvatar: "Subiendo...",
    avatarHint: "Imagen cuadrada recomendada, JPG o PNG.",

    security: "Seguridad",
    securityDesc: "Protege tu cuenta.",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    updatePassword: "Actualizar",

    language: "Idioma",
    languageDesc: "Selecciona tu idioma.",

    dangerZone: "Zona peligrosa",
    deleteWarning: "Esta acción no se puede deshacer.",
    deleteAccount: "Eliminar cuenta",
    deletingAccount: "Eliminando...",

    preview: "Vista previa",
  },
}
