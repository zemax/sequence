export const getApp = () => ({
  language: "fr",
  title: "Sequence",
  description: "A simple and fast way to generate timers sequence.",
  author: "Maxime Cousinou",
});

export const getTheme = () => ({
  color1: "#586ba4",
  color2: "#324376",
  color3: "#f5dd90",
  color4: "#f68e5f",
});

export const getUI = () => ({
  sequences: "Séquences",
  newSequence: "Nouvelle séquence",
  back: "Retour",
  play: "Lire",
  save: "Enregistrer",
  settings: "Paramètres",
  previous: "Précédent",
  next: "Suivant",
  pause: "Mettre en pause",
  resume: "Reprendre",

  settingsSoundsTitle: "Sons",
  settingsDataTitle: "Données",
  settingsPlaySounds: "Jouer les sons",
  settingsSoundLevel: "Intensité du son",
  settingsSoundLevelMin: "Discret",
  settingsSoundLevelMax: "Fort",
  settingsSoundLevelValue: (level: number, count: number) => `Niveau ${level} sur ${count}`,
  settingsExport: "Exporter les séquences",
  settingsImport: "Importer des séquences",
  settingsImportConfirm: "Cela remplacera toutes les séquences actuelles par celles du fichier importé. Continuer ?",
  settingsImportInvalid: "Ce fichier n'est pas un export de séquences valide.",
  settingsReset: "Réinitialiser",
  settingsResetConfirm: "Cela supprimera toutes vos séquences et restaurera les exemples par défaut. Continuer ?",

  nameLabel: "Nom de la séquence",
  totalDurationLabel: "Durée totale",
  upNextLabel: "À suivre",
  skipLoopLabel: "Passer la boucle",
  progressLabel: "Progression de la séquence",
  addStepLabel: "Ajouter",

  stepTypeCountdownLabel: "Compte à rebours",
  stepTypePauseLabel: "Pause",
  stepTypeLoopLabel: "Boucle",
  stepTitleLabel: "Titre de l'étape",
  stepDurationLabel: "Durée (secondes)",
  loopRepeatCountLabel: "Répétitions",
  loopRepeatLessLabel: "Une répétition de moins",
  loopRepeatMoreLabel: "Une répétition de plus",

  defaultSequenceName: "Ma séquence",
  countdownDefaultTitle: "Compte à rebours",
  pauseDefaultTitle: "Appuyez pour continuer",

  loopProgressLabel: (iteration: number, repeatCount: number) => `Boucle · ${iteration}/${repeatCount}`,

  durationLabel: (minutes: number, seconds: number) => {
    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes} min`);
    }
    if (seconds > 0 || minutes === 0) {
      parts.push(`${minutes > 0 ? String(seconds).padStart(2, "0") : seconds} s`);
    }
    return parts.join(" ");
  },
});
