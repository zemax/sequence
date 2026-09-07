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
  back: "Retour",
  play: "Lire",
  save: "Enregistrer",
  settings: "Paramètres",
  previous: "Précédent",
  next: "Suivant",
  pause: "Mettre en pause",
  resume: "Reprendre",

  nameLabel: "Nom de la séquence",
  addStepLabel: "Ajouter",

  stepTypeCountdownLabel: "Compte à rebours",
  stepTypePauseLabel: "Pause",
  stepTitleLabel: "Titre de l'étape",
  stepDurationLabel: "Durée (secondes)",

  defaultSequenceName: "Ma séquence",
  countdownDefaultTitle: "Compte à rebours",
  pauseDefaultTitle: "Appuyez pour continuer",

  durationLabel: (minutes: number, seconds: number) => {
    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    if (seconds > 0 || minutes === 0) {
      parts.push(`${seconds} seconde${seconds > 1 ? "s" : ""}`);
    }
    return `Durée: ${parts.join(" et ")}`;
  },
});
