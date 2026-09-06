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
  color5: "#f76c5e",
});

export const getUI = () => ({
  back: "Retour",
  play: "Lire",
  save: "Enregistrer",

  nameLabel: "Nom de la séquence",

  stepTypeLabel: "Type d'étape",
  stepTypeCountdownLabel: "Compte à rebours",
  stepTypePauseLabel: "Pause",
  stepTitleLabel: "Titre de l'étape",
  stepDurationLabel: "Durée (secondes)",

  countdownDefaultTitle: "Compte à rebours",
  pauseDefaultTitle: "Appuyez pour continuer",

  durationLabel: (minutes: number, seconds: number) => {
    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes} minutes`);
    }
    if (seconds > 0 || minutes === 0) {
      parts.push(`${seconds} secondes`);
    }
    return `Durée: ${parts.join(" et ")}`;
  },
});
