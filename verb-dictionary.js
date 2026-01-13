/*
  Ce dictionnaire fournit les verbes, temps et compléments
  qui alimentent dynamiquement les questions de ConjuFun.
  Tu peux ajouter ou modifier les entrées directement dans ce fichier
  pour faire évoluer la banque à volonté (100+ phrases possibles
  grâce à la combinaison sujet/complement).
*/
(function () {
  window.CONJUFUN_VERB_DICTIONARY = [
    {
      infinitive: "aller",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Aller est irrégulier : vais, vas, va, allons, allez, vont.",
          auxiliary: "Pas d'auxiliaire au présent.",
          fullConjugation: ["je vais", "tu vas", "il/elle va", "nous allons", "vous allez", "ils/elles vont"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je vais", "tu vas", "il/elle va", "nous allons", "vous allez", "ils/elles vont"],
          complements: ["au parc", "à la piscine", "à l'école"]
        },
        {
          tenseId: "indicatif-imparfait",
          tenseLabel: "Imparfait",
          modeLabel: "Indicatif",
          rule: "L'imparfait reprend le radical all-.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["j'allais", "tu allais", "il/elle allait", "nous allions", "vous alliez", "ils/elles allaient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'allais", "tu allais", "il/elle allait", "nous allions", "vous alliez", "ils/elles allaient"],
          complements: ["au marché", "à la cantine", "en ville"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = infinitif + terminaisons (-ai, -as...).",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["j'irai", "tu iras", "il/elle ira", "nous irons", "vous irez", "ils/elles iront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'irai", "tu iras", "il/elle ira", "nous irons", "vous irez", "ils/elles iront"],
          complements: ["à Paris", "dans le sud", "au bureau"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Aller se conjugue avec être : allé(e)(s).",
          auxiliary: "Auxiliaire être + accord.",
          fullConjugation: ["je suis allé(e)", "tu es allé(e)", "il/elle est allé(e)", "nous sommes allé(e)s", "vous êtes allé(e)(s)", "ils/elles sont allé(e)s"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je suis allé(e)", "tu es allé(e)", "il/elle est allé(e)", "nous sommes allé(e)s", "vous êtes allé(e)(s)", "ils/elles sont allé(e)s"],
          complements: ["au musée", "en vacances", "à l'hôpital"]
        }
      ]
    },
    {
      infinitive: "finir",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Les verbes du 2e groupe prennent -issons, -issez, -issent.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je finis", "tu finis", "il/elle finit", "nous finissons", "vous finissez", "ils/elles finissent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je finis", "tu finis", "il/elle finit", "nous finissons", "vous finissez", "ils/elles finissent"],
          complements: ["l'exercice", "la rédaction", "le repas"]
        },
        {
          tenseId: "indicatif-imparfait",
          tenseLabel: "Imparfait",
          modeLabel: "Indicatif",
          rule: "Imparfait = radical finiss- + terminaisons.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je finissais", "tu finissais", "il/elle finissait", "nous finissions", "vous finissiez", "ils/elles finissaient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je finissais", "tu finissais", "il/elle finissait", "nous finissions", "vous finissiez", "ils/elles finissaient"],
          complements: ["à temps", "avant la sonnerie", "pendant l'atelier"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Finir se conjugue avec avoir + fini.",
          auxiliary: "Auxiliaire avoir + participe fini.",
          fullConjugation: ["j'ai fini", "tu as fini", "il/elle a fini", "nous avons fini", "vous avez fini", "ils/elles ont fini"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai fini", "tu as fini", "il/elle a fini", "nous avons fini", "vous avez fini", "ils/elles ont fini"],
          complements: ["le devoir", "la course", "le livre"]
        }
      ]
    },
    {
      infinitive: "prendre",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Prendre double le n au pluriel.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je prends", "tu prends", "il/elle prend", "nous prenons", "vous prenez", "ils/elles prennent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je prends", "tu prends", "il/elle prend", "nous prenons", "vous prenez", "ils/elles prennent"],
          complements: ["un stylo", "des notes", "un café"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = prendr- + -ai/-as etc.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je prendrai", "tu prendras", "il/elle prendra", "nous prendrons", "vous prendrez", "ils/elles prendront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je prendrai", "tu prendras", "il/elle prendra", "nous prendrons", "vous prendrez", "ils/elles prendront"],
          complements: ["le métro", "une décision", "le temps"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Prendre devient pris.",
          auxiliary: "Auxiliaire avoir + participe pris.",
          fullConjugation: ["j'ai pris", "tu as pris", "il/elle a pris", "nous avons pris", "vous avez pris", "ils/elles ont pris"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai pris", "tu as pris", "il/elle a pris", "nous avons pris", "vous avez pris", "ils/elles ont pris"],
          complements: ["la responsabilité", "une photo", "le train"]
        }
      ]
    },
    {
      infinitive: "faire",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Faire est irrégulier : fais, fais, fait...",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je fais", "tu fais", "il/elle fait", "nous faisons", "vous faites", "ils/elles font"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je fais", "tu fais", "il/elle fait", "nous faisons", "vous faites", "ils/elles font"],
          complements: ["la vaisselle", "le ménage", "un effort"]
        },
        {
          tenseId: "conditionnel-present",
          tenseLabel: "Présent",
          modeLabel: "Conditionnel",
          rule: "Conditionnel = ferait + terminaisons de l'imparfait.",
          auxiliary: "Auxiliaire avoir.",
          fullConjugation: ["je ferais", "tu ferais", "il/elle ferait", "nous ferions", "vous feriez", "ils/elles feraient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je ferais", "tu ferais", "il/elle ferait", "nous ferions", "vous feriez", "ils/elles feraient"],
          complements: ["un gâteau", "le point", "une proposition"]
        },
        {
          tenseId: "subjonctif-present",
          tenseLabel: "Présent",
          modeLabel: "Subjonctif",
          rule: "Subjonctif = fasse, fasses, fasse...",
          auxiliary: "Après que / pour que.",
          fullConjugation: ["que je fasse", "que tu fasses", "qu'il/qu'elle fasse", "que nous fassions", "que vous fassiez", "qu'ils/qu'elles fassent"],
          subjects: ["Que je", "Que tu", "Qu'il/Qu'elle", "Que nous", "Que vous", "Qu'ils/Qu'elles"],
          answers: ["que je fasse", "que tu fasses", "qu'il/qu'elle fasse", "que nous fassions", "que vous fassiez", "qu'ils/qu'elles fassent"],
          complements: ["une liste", "le travail", "un plan"]
        }
      ]
    },
    {
      infinitive: "être",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Être irrégulier : suis, es, est, sommes, êtes, sont.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je suis", "tu es", "il/elle est", "nous sommes", "vous êtes", "ils/elles sont"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je suis", "tu es", "il/elle est", "nous sommes", "vous êtes", "ils/elles sont"],
          complements: ["heureux", "en retard", "au lycée"]
        },
        {
          tenseId: "indicatif-imparfait",
          tenseLabel: "Imparfait",
          modeLabel: "Indicatif",
          rule: "Imparfait = ét- + terminaisons.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["j'étais", "tu étais", "il/elle était", "nous étions", "vous étiez", "ils/elles étaient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'étais", "tu étais", "il/elle était", "nous étions", "vous étiez", "ils/elles étaient"],
          complements: ["à l'heure", "en formation", "en cours"]
        },
        {
          tenseId: "subjonctif-present",
          tenseLabel: "Présent",
          modeLabel: "Subjonctif",
          rule: "Subjonctif d'être = sois, soyons, soyez...",
          auxiliary: "Après que / pour que.",
          fullConjugation: ["que je sois", "que tu sois", "qu'il/qu'elle soit", "que nous soyons", "que vous soyez", "qu'ils/qu'elles soient"],
          subjects: ["Que je", "Que tu", "Qu'il/Qu'elle", "Que nous", "Que vous", "Qu'ils/Qu'elles"],
          answers: ["que je sois", "que tu sois", "qu'il/qu'elle soit", "que nous soyons", "que vous soyez", "qu'ils/qu'elles soient"],
          complements: ["patient", "calme", "de bonne humeur"]
        }
      ]
    },
    {
      infinitive: "avoir",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Avoir devient ai, as, a, avons, avez, ont.",
          auxiliary: "Auxiliaire universel.",
          fullConjugation: ["j'ai", "tu as", "il/elle a", "nous avons", "vous avez", "ils/elles ont"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai", "tu as", "il/elle a", "nous avons", "vous avez", "ils/elles ont"],
          complements: ["un chat", "de la chance", "le temps"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = aur- + terminaisons.",
          auxiliary: "Auxiliaire avoir.",
          fullConjugation: ["j'aurai", "tu auras", "il/elle aura", "nous aurons", "vous aurez", "ils/elles auront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'aurai", "tu auras", "il/elle aura", "nous aurons", "vous aurez", "ils/elles auront"],
          complements: ["de la patience", "une idée claire", "le courage"]
        },
        {
          tenseId: "conditionnel-present",
          tenseLabel: "Présent",
          modeLabel: "Conditionnel",
          rule: "Conditionnel = aur- + terminaisons de l'imparfait.",
          auxiliary: "Auxiliaire avoir.",
          fullConjugation: ["j'aurais", "tu aurais", "il/elle aurait", "nous aurions", "vous auriez", "ils/elles auraient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'aurais", "tu aurais", "il/elle aurait", "nous aurions", "vous auriez", "ils/elles auraient"],
          complements: ["un bon souvenir", "plus de temps", "de la confiance"]
        }
      ]
    },
    {
      infinitive: "partir",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Partir est un verbe du 3e groupe.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je pars", "tu pars", "il/elle part", "nous partons", "vous partez", "ils/elles partent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je pars", "tu pars", "il/elle part", "nous partons", "vous partez", "ils/elles partent"],
          complements: ["demain", "en voyage", "à l'aube"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = partir- + terminaisons.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je partirai", "tu partiras", "il/elle partira", "nous partirons", "vous partirez", "ils/elles partiront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je partirai", "tu partiras", "il/elle partira", "nous partirons", "vous partirez", "ils/elles partiront"],
          complements: ["pour le sud", "en fin de semaine", "dans une heure"]
        }
      ]
    },
    {
      infinitive: "écrire",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Écrire supprime le -e au singulier et garde la prononciation.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["j'écris", "tu écris", "il/elle écrit", "nous écrivons", "vous écrivez", "ils/elles écrivent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'écris", "tu écris", "il/elle écrit", "nous écrivons", "vous écrivez", "ils/elles écrivent"],
          complements: ["une lettre", "un journal", "la réponse"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = écrir- + nouvelles terminaisons.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["j'écrirai", "tu écriras", "il/elle écrira", "nous écrirons", "vous écrirez", "ils/elles écriront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'écrirai", "tu écriras", "il/elle écrira", "nous écrirons", "vous écrirez", "ils/elles écriront"],
          complements: ["notre histoire", "un roman", "à la main"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Écrire se conjugue avec avoir + écrit.",
          auxiliary: "Auxiliaire avoir + participe écrit.",
          fullConjugation: ["j'ai écrit", "tu as écrit", "il/elle a écrit", "nous avons écrit", "vous avez écrit", "ils/elles ont écrit"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai écrit", "tu as écrit", "il/elle a écrit", "nous avons écrit", "vous avez écrit", "ils/elles ont écrit"],
          complements: ["la poésie", "la liste", "son nom"]
        }
      ]
    },
    {
      infinitive: "venir",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Venir est irrégulier : viens, viens, vient.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je viens", "tu viens", "il/elle vient", "nous venons", "vous venez", "ils/elles viennent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je viens", "tu viens", "il/elle vient", "nous venons", "vous venez", "ils/elles viennent"],
          complements: ["chez toi", "de la réunion", "en retard"]
        },
        {
          tenseId: "indicatif-futur",
          tenseLabel: "Futur simple",
          modeLabel: "Indicatif",
          rule: "Futur = viendr- + terminaisons.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je viendrai", "tu viendras", "il/elle viendra", "nous viendrons", "vous viendrez", "ils/elles viendront"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je viendrai", "tu viendras", "il/elle viendra", "nous viendrons", "vous viendrez", "ils/elles viendront"],
          complements: ["au rendez-vous", "dans une semaine", "avec plaisir"]
        }
      ]
    },
    {
      infinitive: "dire",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Dire a un radical irrégulier.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je dis", "tu dis", "il/elle dit", "nous disons", "vous dites", "ils/elles disent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je dis", "tu dis", "il/elle dit", "nous disons", "vous dites", "ils/elles disent"],
          complements: ["la vérité", "merci", "bonjour"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Dire devient dit.",
          auxiliary: "Auxiliaire avoir + participe dit.",
          fullConjugation: ["j'ai dit", "tu as dit", "il/elle a dit", "nous avons dit", "vous avez dit", "ils/elles ont dit"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai dit", "tu as dit", "il/elle a dit", "nous avons dit", "vous avez dit", "ils/elles ont dit"],
          complements: ["la réponse", "la date", "la consigne"]
        }
      ]
    },
    {
      infinitive: "voir",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Voir double le r au futur et continue comme ça au présent.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je vois", "tu vois", "il/elle voit", "nous voyons", "vous voyez", "ils/elles voient"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je vois", "tu vois", "il/elle voit", "nous voyons", "vous voyez", "ils/elles voient"],
          complements: ["la scène", "le ciel", "les étoiles"]
        }
      ]
    },
    {
      infinitive: "manger",
      entries: [
        {
          tenseId: "indicatif-present",
          tenseLabel: "Présent",
          modeLabel: "Indicatif",
          rule: "Les verbes en -ger gardent la cédille à nous.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["je mange", "tu manges", "il/elle mange", "nous mangeons", "vous mangez", "ils/elles mangent"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["je mange", "tu manges", "il/elle mange", "nous mangeons", "vous mangez", "ils/elles mangent"],
          complements: ["une pomme", "au déjeuner", "avec des amis"]
        },
        {
          tenseId: "indicatif-passe-compose",
          tenseLabel: "Passé composé",
          modeLabel: "Indicatif",
          rule: "Manger -> mangé (cédille devant a/o/u).",
          auxiliary: "Auxiliaire avoir + participe mangé.",
          fullConjugation: ["j'ai mangé", "tu as mangé", "il/elle a mangé", "nous avons mangé", "vous avez mangé", "ils/elles ont mangé"],
          subjects: ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"],
          answers: ["j'ai mangé", "tu as mangé", "il/elle a mangé", "nous avons mangé", "vous avez mangé", "ils/elles ont mangé"],
          complements: ["un sandwich", "au restaurant", "en famille"]
        }
      ]
    },
    {
      infinitive: "être",
      entries: [
        {
          tenseId: "impératif-present",
          tenseLabel: "Présent",
          modeLabel: "Impératif",
          rule: "Impératif : sois, soyons, soyez.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["(tu) sois", "(nous) soyons", "(vous) soyez"],
          subjects: ["(tu)", "(nous)", "(vous)"],
          answers: ["sois", "soyons", "soyez"],
          complements: ["calme", "à l'écoute", "prêt"]
        }
      ]
    },
    {
      infinitive: "avoir",
      entries: [
        {
          tenseId: "impératif-present",
          tenseLabel: "Présent",
          modeLabel: "Impératif",
          rule: "Impératif : aie, ayons, ayez.",
          auxiliary: "Pas d'auxiliaire.",
          fullConjugation: ["(tu) aie", "(nous) ayons", "(vous) ayez"],
          subjects: ["(tu)", "(nous)", "(vous)"],
          answers: ["aie", "ayons", "ayez"],
          complements: ["confiance", "de la volonté", "le courage"]
        }
      ]
    }
  ];
})();
