// Données fictives pour les auditeurs
export const auditeursData = [
  { id: 1, name: "Ahmed Ben Ali", specialty: "Auditeur pédagogique", grade: "A", photo: "" },
  { id: 2, name: "Fatima Zahra", specialty: "Auditeur administratif", grade: "B", photo: "" },
  { id: 3, name: "Mohamed Salah", specialty: "Auditeur pédagogique", grade: "A", photo: "" },
  { id: 4, name: "Leila Mansour", specialty: "Auditeur financier", grade: "C", photo: "" },
  { id: 5, name: "Karim Bouaziz", specialty: "Auditeur technique", grade: "B", photo: "" },
];

// Historique des messages
export const messagesHistorique = [
  {
    id: 1,
    from: "Coordinateur",
    to: ["Ahmed Ben Ali", "Mohamed Salah"],
    subject: "Réunion de coordination",
    message: "Bonjour, je vous invite à une réunion de coordination demain à 10h pour discuter des nouvelles tâches d'audit.",
    date: "2026-01-05 14:30",
    read: true,
  },
  {
    id: 2,
    from: "Coordinateur",
    to: ["Fatima Zahra"],
    subject: "Documents manquants",
    message: "Merci de me transmettre les documents d'audit administratif avant la fin de la journée.",
    date: "2026-01-06 09:15",
    read: true,
  },
  {
    id: 3,
    from: "Coordinateur",
    to: ["Ahmed Ben Ali", "Mohamed Salah", "Leila Mansour"],
    subject: "Formation obligatoire",
    message: "Rappel : La formation sur les nouveaux protocoles d'audit aura lieu le 10 janvier. Présence obligatoire.",
    date: "2026-01-06 16:45",
    read: false,
  },
];
